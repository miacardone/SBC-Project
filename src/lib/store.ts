import { promises as fs } from "node:fs";
import path from "node:path";
import { envText } from "./env";
import { CONSOLATION, PRIZE_TIERS } from "./prizes";
import type { Entry } from "./types";

/**
 * Two backends, no client library.
 *
 * - `upstash` : used automatically when UPSTASH_REDIS_REST_URL + TOKEN are set.
 *               Required anywhere the filesystem isn't writable or isn't shared
 *               between instances — which includes every Vercel deployment.
 * - `file`    : default. A JSON file next to the app. Fine for a booth laptop
 *               driving the screen, and it survives the venue wifi dying.
 *
 * Access patterns matter more than they look. A booth runs all day on one Redis
 * plan, so nothing here may scan the whole entry list on a hot path: lookups go
 * through an id index and inventory comes from counters, both O(1).
 */

// Two naming conventions reach the same Upstash database: the ones this
// project documents, and the KV_* pair the Vercel Marketplace injects when the
// integration provisions it. Take either, prefer an explicitly configured one.
const UPSTASH_URL = envText("UPSTASH_REDIS_REST_URL") ?? envText("KV_REST_API_URL");
const UPSTASH_TOKEN = envText("UPSTASH_REDIS_REST_TOKEN") ?? envText("KV_REST_API_TOKEN");

export const backend: "upstash" | "file" =
  UPSTASH_URL && UPSTASH_TOKEN ? "upstash" : "file";

const DATA_DIR = envText("KIOSK_DATA_DIR") ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "entries.json");

const ALL_TIER_IDS = [...PRIZE_TIERS.map((t) => t.id), CONSOLATION.id];

type Db = { entries: Entry[] };

/* ------------------------------------------------------------------ file */

// Serialises writes so two fast taps can't clobber each other's entry.
let writeChain: Promise<unknown> = Promise.resolve();

async function readFileDb(): Promise<Db> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Db;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

async function writeFileDb(db: Db): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

function queueFileWrite<T>(fn: (db: Db) => Promise<T> | T): Promise<T> {
  const next = writeChain.then(async () => {
    const db = await readFileDb();
    const result = await fn(db);
    await writeFileDb(db);
    return result;
  });
  writeChain = next.catch(() => undefined);
  return next;
}

/* --------------------------------------------------------------- upstash */

type Command = (string | number)[];

async function send(body: unknown): Promise<unknown> {
  const res = await fetch(UPSTASH_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}: ${await res.text()}`);
  return res.json();
}

async function redis(command: Command): Promise<unknown> {
  const json = (await send(command)) as { result?: unknown; error?: string };
  if (json.error) throw new Error(`upstash: ${json.error}`);
  return json.result;
}

/** Several commands, one round trip. */
async function pipeline(commands: Command[]): Promise<unknown[]> {
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`upstash ${res.status}: ${await res.text()}`);
  const rows = (await res.json()) as { result?: unknown; error?: string }[];
  const failed = rows.find((r) => r.error);
  if (failed) throw new Error(`upstash: ${failed.error}`);
  return rows.map((r) => r.result);
}

const KEY_ENTRY = (code: string) => `cb911:entry:${code}`;
/** id -> code, so a claim link resolves without scanning every play. */
const KEY_ID = (id: string) => `cb911:id:${id}`;
const KEY_INDEX = "cb911:entries";
/** Inventory counters, so awarding a prize never reads the whole list. */
const KEY_COUNT = (tierId: string) => `cb911:count:${tierId}`;
/** A one-key answer for "did the phone finish yet", so the kiosk poll is 1 read. */
const KEY_CLAIMED = (id: string) => `cb911:claimed:${id}`;

function parseEntry(raw: unknown): Entry | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as Entry;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------- api */

/** Newest first. Only the booth console needs this — it is a full scan. */
export async function listEntries(): Promise<Entry[]> {
  if (backend === "file") {
    const db = await readFileDb();
    return [...db.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const codes = ((await redis(["LRANGE", KEY_INDEX, 0, -1])) as string[]) ?? [];
  if (codes.length === 0) return [];
  const rows = (await redis(["MGET", ...codes.map(KEY_ENTRY)])) as unknown[];
  return rows
    .map(parseEntry)
    .filter((e): e is Entry => e !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEntry(code: string): Promise<Entry | null> {
  if (backend === "file") {
    const db = await readFileDb();
    return db.entries.find((e) => e.code === code) ?? null;
  }
  return parseEntry(await redis(["GET", KEY_ENTRY(code)]));
}

/** Look a play up by its session id — what the phone claim link carries. */
export async function getEntryById(id: string): Promise<Entry | null> {
  if (backend === "file") {
    const db = await readFileDb();
    return db.entries.find((e) => e.id === id) ?? null;
  }
  const code = await redis(["GET", KEY_ID(id)]);
  if (typeof code !== "string") return null;
  return parseEntry(await redis(["GET", KEY_ENTRY(code)]));
}

export async function saveEntry(entry: Entry): Promise<Entry> {
  if (backend === "file") {
    return queueFileWrite((db) => {
      db.entries.push(entry);
      return entry;
    });
  }
  await pipeline([
    ["SET", KEY_ENTRY(entry.code), JSON.stringify(entry)],
    ["SET", KEY_ID(entry.id), entry.code],
    ["LPUSH", KEY_INDEX, entry.code],
    ["INCR", KEY_COUNT(entry.tierId)],
  ]);
  return entry;
}

export async function updateEntry(
  code: string,
  patch: Partial<Entry>
): Promise<Entry | null> {
  if (backend === "file") {
    return queueFileWrite((db) => {
      const found = db.entries.find((e) => e.code === code);
      if (!found) return null;
      Object.assign(found, patch);
      return found;
    });
  }
  const current = await getEntry(code);
  if (!current) return null;
  const next = { ...current, ...patch };
  await redis(["SET", KEY_ENTRY(code), JSON.stringify(next)]);
  return next;
}

/** How many of each tier have gone out so far — drives the inventory caps. */
export async function awardedCounts(): Promise<Record<string, number>> {
  if (backend === "file") {
    const entries = await listEntries();
    const counts: Record<string, number> = {};
    for (const e of entries) counts[e.tierId] = (counts[e.tierId] ?? 0) + 1;
    return counts;
  }
  const rows = (await redis(["MGET", ...ALL_TIER_IDS.map(KEY_COUNT)])) as unknown[];
  const counts: Record<string, number> = {};
  ALL_TIER_IDS.forEach((id, i) => {
    counts[id] = Number(rows[i] ?? 0) || 0;
  });
  return counts;
}

export type ClaimedMarker = { code: string; options: string[]; emailSent: boolean };

/**
 * The kiosk polls every few seconds while its QR is up. Writing the answer to a
 * single key keeps that poll to one read instead of an id lookup plus a fetch,
 * which is the difference between comfortable and expensive over a booth day.
 */
export async function markClaimed(id: string, marker: ClaimedMarker): Promise<void> {
  if (backend === "file") return; // file reads are local and free
  try {
    await redis(["SET", KEY_CLAIMED(id), JSON.stringify(marker)]);
  } catch (err) {
    console.error("[store] could not write claim marker:", err);
  }
}

export async function getClaimed(id: string): Promise<ClaimedMarker | null> {
  if (backend === "file") {
    const entry = await getEntryById(id);
    if (!entry || !entry.email) return null;
    return { code: entry.code, options: entry.tierOptions, emailSent: entry.emailSent };
  }
  const raw = await redis(["GET", KEY_CLAIMED(id)]);
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as ClaimedMarker;
  } catch {
    return null;
  }
}

/**
 * Wipe every play. This exists because a booth always arrives at the venue with
 * a pile of test rounds in it, and there is no other way to start the day at
 * zero with the inventory counters agreeing with the shelf.
 */
export async function clearAll(): Promise<number> {
  if (backend === "file") {
    return queueFileWrite((db) => {
      const removed = db.entries.length;
      db.entries = [];
      return removed;
    });
  }

  const entries = await listEntries();
  const keys = [
    ...entries.map((e) => KEY_ENTRY(e.code)),
    ...entries.map((e) => KEY_ID(e.id)),
    ...entries.map((e) => KEY_CLAIMED(e.id)),
    ...ALL_TIER_IDS.map(KEY_COUNT),
    KEY_INDEX,
  ];
  // DEL takes many keys, but keep the batches modest so one request can't blow
  // past a body limit on a big event.
  for (let i = 0; i < keys.length; i += 100) {
    await redis(["DEL", ...keys.slice(i, i + 100)]);
  }
  return entries.length;
}

/** Cheap health probe for the booth console's storage banner. */
export async function storageHealthy(): Promise<boolean> {
  try {
    if (backend === "file") {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.access(DATA_DIR);
      return true;
    }
    await redis(["PING"]);
    return true;
  } catch {
    return false;
  }
}

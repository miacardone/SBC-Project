import { promises as fs } from "node:fs";
import path from "node:path";
import type { Entry } from "./types";

/**
 * Two backends, no extra dependencies.
 *
 * - `upstash`  : used automatically when UPSTASH_REDIS_REST_URL + TOKEN are set.
 *                This is what you want when the kiosk is deployed and more than
 *                one instance can serve requests.
 * - `file`     : default. A JSON file next to the app. Perfect for a booth
 *                laptop driving the screen, and it keeps working if the venue
 *                wifi dies mid-event.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export const backend: "upstash" | "file" =
  UPSTASH_URL && UPSTASH_TOKEN ? "upstash" : "file";

const DATA_DIR = process.env.KIOSK_DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "entries.json");

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

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(UPSTASH_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`upstash ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { result?: unknown; error?: string };
  if (json.error) throw new Error(`upstash: ${json.error}`);
  return json.result;
}

const KEY_ENTRY = (code: string) => `cb911:entry:${code}`;
const KEY_INDEX = "cb911:entries";

/* ------------------------------------------------------------------ api */

export async function listEntries(): Promise<Entry[]> {
  if (backend === "file") {
    const db = await readFileDb();
    return [...db.entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const codes = ((await redis(["LRANGE", KEY_INDEX, 0, -1])) as string[]) ?? [];
  if (codes.length === 0) return [];
  const rows = (await redis(["MGET", ...codes.map(KEY_ENTRY)])) as (string | null)[];
  return rows
    .filter((r): r is string => typeof r === "string")
    .map((r) => JSON.parse(r) as Entry)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEntry(code: string): Promise<Entry | null> {
  if (backend === "file") {
    const db = await readFileDb();
    return db.entries.find((e) => e.code === code) ?? null;
  }
  const raw = (await redis(["GET", KEY_ENTRY(code)])) as string | null;
  return raw ? (JSON.parse(raw) as Entry) : null;
}

/** Look a play up by its session id — what the phone claim link carries. */
export async function getEntryById(id: string): Promise<Entry | null> {
  const entries = await listEntries();
  return entries.find((e) => e.id === id) ?? null;
}

export async function saveEntry(entry: Entry): Promise<Entry> {
  if (backend === "file") {
    return queueFileWrite((db) => {
      db.entries.push(entry);
      return entry;
    });
  }
  await redis(["SET", KEY_ENTRY(entry.code), JSON.stringify(entry)]);
  await redis(["LPUSH", KEY_INDEX, entry.code]);
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

/** How many of each tier have gone out so far — drives inventory caps. */
export async function awardedCounts(): Promise<Record<string, number>> {
  const entries = await listEntries();
  const counts: Record<string, number> = {};
  for (const e of entries) {
    counts[e.tierId] = (counts[e.tierId] ?? 0) + 1;
  }
  return counts;
}

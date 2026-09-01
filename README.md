# cb911 Arcade

A touchscreen booth game for Chargebacks911. Players walk up to the screen, pick
**Casino** or **Classroom**, play a round, and every single one of them wins a
prize. They drop in an email, get a claim code on screen and in their inbox, and
carry the code to the booth to collect the physical prize.

The booth gets engagement and a clean, consented lead list. The player gets a
plush bull.

```
attract  →  pick a game  →  play  →  prize reveal  →  email  →  claim code
   ↑                                                                  │
   └──────────────── auto-reset for the next person ──────────────────┘
```

## The two games

**Casino** — a five-reel cb911 slot machine. Three bulls on the payline pays.
The result is decided server-side *before* the reels animate, so prize odds and
inventory stay under your control instead of the animation's.

**Classroom** — the Chargeback Challenge: five questions pulled at random from a
14-question bank, 15 seconds each, with the real answer and a one-line
explanation after every one. Four right wins a prize; a perfect five is the only
way into the jackpot pool.

Losing at either game still awards the consolation tier. Nobody walks away empty
handed — that's the point.

## Run it

```bash
npm install
npm run dev
```

Kiosk screen: <http://localhost:3000>
Booth console: <http://localhost:3000/admin> (default PIN `911911`)

The first tap of each session asks the browser for fullscreen, so on event day
just open the page and let the first player trigger it.

## Configure

Copy `.env.example` to `.env.local` and fill in what you need. Everything has a
working default except email.

| Variable | What it does |
| --- | --- |
| `ADMIN_PIN` | Gate for `/admin`. **Change this before the event.** |
| `RESEND_API_KEY` | Enables emailing the prize code. Without it the code still shows on screen. |
| `PRIZE_EMAIL_FROM` | Sender identity on the prize email. Domain must be verified in Resend. |
| `BOOTH_LOCATION` | Printed in the email — e.g. `"the Chargebacks911 booth (#123)"`. |
| `SLOT_WIN_RATE` | Share of slot pulls that win a real prize. Default `0.35`. |
| `QUIZ_PASS_SCORE` | Correct answers out of 5 needed to win. Default `4`. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Switches storage from a local file to Redis. Required if you deploy. |

### Prizes and inventory

Edit `src/lib/prizes.ts`. Each tier has a `weight` (relative odds inside the
winning pool) and a `cap` (how many you physically brought). When a tier hits its
cap the engine stops offering it and rolls down to the next one, so the kiosk
never promises a gift card you've run out of.

```ts
{ id: "grand", label: "JACKPOT", item: "$25 gift card", weight: 3, cap: 15, isGrand: true }
```

`CONSOLATION` in the same file is the floor everyone lands on.

### Questions

`src/lib/quiz.ts`. Add objects to `QUESTIONS` — each needs four options, the
index of the right one, and an `explain` line. The round pulls five at random, so
a bigger bank means back-to-back players see different questions.

## Booth console (`/admin`)

- **Redeem a code** — type or paste the code a player shows you (case and dashes
  don't matter). It tells you what to hand over and marks it collected, and it
  warns you loudly if that code was already redeemed. `Undo` reopens one.
- **Live counters** — plays, emails captured, marketing opt-ins, redemptions,
  wins, and the casino/classroom split. Refreshes every 15 seconds.
- **Inventory** — how many of each prize have gone out against its cap.
- **Export leads CSV** — every play that left an email, with prize, code,
  opt-in status, and timestamps.

## Storage

Two backends, no extra dependencies:

- **File** (default) — `.data/entries.json`. The right choice for a laptop
  driving the booth screen: it keeps working when the venue wifi dies.
- **Upstash Redis** — used automatically when `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` are set. Use this if you deploy to Vercel, where
  serverless instances don't share a filesystem.

`.data/` is gitignored. **Copy it off the machine before you tear down the
booth** — that file is the lead list.

## Email

Prize emails go through Resend's REST API. Sending is best-effort by design: the
code is always shown on screen first, and a failed send never blocks a player.
The claim screen tells them which happened.

## Privacy

The marketing opt-in checkbox is **unchecked by default** and clearly separated
from the transactional prize email. The CSV records `consent` per row so you can
filter to opted-in contacts before importing anywhere. Players can also decline
email entirely and still get their code on screen.

## Notes for event day

- Prop the screen in either orientation — every layout is built in viewport and
  container units, so portrait and landscape both work.
- The kiosk resets itself to the attract loop after 75 seconds of no touches, so
  an abandoned session never blocks the line.
- The claim screen counts down 25 seconds and then resets on its own.
- Open `/admin` on a phone or tablet at the prize table; it's a separate screen
  from the kiosk and works fine on both at once.

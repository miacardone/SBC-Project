# cb911 Arcade

A touchscreen booth game for Chargebacks911. Players walk up to the screen, pick
one of three games, play a round, and every single one of them wins a prize. They
drop in an email, get a claim code on screen and in their inbox, and carry the
code to the booth to choose their prize.

The booth gets engagement and a clean, consented lead list. The player gets a
plush bull.

```
attract  →  pick a game  →  play  →  results  →  prize reveal  →  email  →  code
   ↑                                                                        │
   └───────────────────── auto-reset for the next person ───────────────────┘
```

## The three games

**Casino** — a five-reel cb911 slot machine. Three bulls on the payline pays.
The result is decided server-side *before* the reels animate, so prize odds and
inventory stay under your control instead of the animation's.

**Classroom** — the Chargeback Challenge: five questions pulled at random from a
14-question bank, 15 seconds each, with the real answer and a one-line
explanation after every one. Four right wins a prize; a perfect five is the only
way into the jackpot pool. At the end they get a full score card with every
question, what they answered, and what the right answer was.

**Catch** — Catch the Fraud. Orders pop onto the board one detail at a time
("AVS mismatch · CVV fail", "Verified by 3-D Secure") and each one sits there
for a full five seconds. Tap the fraudulent ones before they clear and leave the
good customers alone — tapping a legit order is a false decline and counts
against you. Catch 7 of 10 to win, all 10 for the jackpot. A round runs about
half a minute. It's the loudest of the three and the one that pulls a crowd.

Losing at any game still awards the consolation tier. Nobody walks away empty
handed — that's the point.

## Prizes are chosen, not assigned

A player wins a *tier*, not a specific object. The code screen and the email
both list what that tier is worth, and they pick which one they actually want
when they hand the code over at the booth. Booth staff tap the item on the
console and it's recorded against the code. That way one item running out early
doesn't strand anyone holding a promise the booth can't keep.

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
| `NEXT_PUBLIC_KIOSK_URL` | The address phones resolve when they scan the claim QR. **Read the note below.** |
| `ADMIN_PIN` | Gate for `/admin`. **Change this before the event.** |
| `RESEND_API_KEY` | Enables emailing the prize code. Without it the code still shows on screen. |
| `PRIZE_EMAIL_FROM` | Sender identity on the prize email. Domain must be verified in Resend. |
| `BOOTH_LOCATION` | Printed in the email — e.g. `"the Chargebacks911 booth (#123)"`. |
| `SLOT_WIN_RATE` | Share of slot pulls that win a real prize. Default `0.35`. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Switches storage from a local file to Redis. Required if you deploy. |

### The QR code address

Claiming happens on the player's own phone, so the QR has to point at something
their phone can reach. `NEXT_PUBLIC_KIOSK_URL` is that address: your deployed
URL, or the booth laptop's LAN address like `http://192.168.1.42:3000`. Left
blank it falls back to whatever the kiosk browser's own origin is — which is
`http://localhost:3000` on a laptop, and **no phone can open that**.

Set it, then walk up to the kiosk with your own phone and scan the code before
the doors open. The URL is printed in small text under the QR precisely so you
can catch this.

### Prizes and inventory

Edit `src/lib/prizes.ts`. Each tier has `options` (what the player may choose
from at the booth), a `weight` (relative odds inside the winning pool), and a
`cap` (how many of that tier you physically brought). When a tier hits its cap
the engine stops offering it and rolls down to the next one, so the kiosk never
promises a gift card you've run out of.

```ts
{
  id: "grand",
  label: "JACKPOT",
  options: ["$25 gift card", "cb911 hoodie", "Premium plush bull"],
  weight: 3,
  cap: 15,
  isGrand: true,
}
```

`CONSOLATION` in the same file is the floor everyone lands on.

### Questions and difficulty

`src/lib/quiz.ts` holds the question bank — add objects to `QUESTIONS`, each with
four options, the index of the right one, and an `explain` line. A round pulls
five at random, so a bigger bank means back-to-back players see different
questions. `QUIZ_PASS_SCORE` and `QUIZ_TIME` are in the same file.

`src/lib/catch.ts` holds the Catch deck. `FRAUD` and `LEGIT` are the two card
pools, and `CARD_LIFE` / `SPAWN_EVERY` / `CATCH_PASS` set the pace and the pass
mark. Slow `SPAWN_EVERY` down if the line at your booth skews toward people who
want to read every card.

## Claiming

When the prize is revealed the kiosk shows a **QR code**. The player scans it,
and their own phone opens a page that already knows who they are: their score,
their tier, and the prizes they can choose from. They type their email there —
with a real keyboard and autofill — and the code appears on their phone and in
their inbox. The kiosk notices they finished and moves to the code screen on its
own.

Anyone without a phone taps **"No phone? Type it here instead"** and gets the
on-screen keyboard, exactly as before. There's also a "no email — just show it"
escape hatch for people who don't want to hand one over.

Because the claim link lives on the player's phone, it keeps working even after
the kiosk has reset for the next person.

## Booth console (`/admin`)

- **Redeem a code** — type or paste the code a player shows you (case and dashes
  don't matter). It shows the tier's options as big buttons; tap whichever one
  you handed over and it's recorded and marked collected. It warns you loudly if
  that code was already redeemed, and says what they took. `Undo` reopens one.
- **Live counters** — plays, emails captured, marketing opt-ins, redemptions,
  wins, and the split across all three games. Refreshes every 15 seconds.
- **Inventory** — how many of each prize have gone out against its cap.
- **Export leads CSV** — every play that left an email, with the tier, what they
  were eligible for, what they actually took, code, opt-in status, and
  timestamps.

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
- The kiosk resets itself to the attract loop after 90 seconds of no touches, so
  an abandoned session never blocks the line. The claim screen gets five minutes
  instead, since a player finishing on their phone never touches the booth
  screen.
- Every screen after a game has a **Home** button in the top-left corner, so
  staff can clear the kiosk without waiting for the timeout.
- The claim screen counts down 30 seconds and then resets on its own.
- Prize requests retry on their own if the venue wifi stutters. If they still
  can't get through, the player sees a "grab a rep" screen with a retry button
  rather than being dumped back to the game picker.
- Open `/admin` on a phone or tablet at the prize table; it's a separate screen
  from the kiosk and works fine on both at once.

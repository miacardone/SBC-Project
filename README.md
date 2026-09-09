# cb911 Arcade

A touchscreen booth game for Chargebacks911. The email comes first: a player
hands one over, gets a six-character token on their phone, types it into the
machine to unlock a spin — and then almost certainly loses, because the wheel
pays 100 times in 10,000. Losing is the point. It opens the second chance,
where answering chargeback questions is how prizes are actually won.

Everyone still walks away with something, and every winner is told to check
their email and bring their code to the booth.

```
attract → email (QR to phone, or the on-screen keyboard)
        → token issued → type it in
        → spin  ─ 1% ─→ win
                └─ 99% ─→ second chance → question → win or consolation
        → prize code + booth
```

The booth gets a verified email from every single person who plays, and the
people who want a prize badly enough have to read about chargebacks to get one.

## The odds, and why

`WHEEL_WIN_RATE` is `0.01`. At 500 players that is about five wheel winners.
The second chance is where the volume is: four correct out of five wins a real
tier, so the funnel deliberately pushes almost everybody into the educational
content. Turn the wheel up and you buy fewer conversations; turn it down and
people stop believing it can pay at all.

Losing the spin awards the consolation tier straight away, so somebody who
wanders off mid-question still holds something the booth can honour.

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
- **Export leads CSV** — one row per lead:

  | Column | What it holds |
  | --- | --- |
  | `email` | What they typed |
  | `code` | Their prize code |
  | `tier` / `eligible_for` | What they won and the options they could pick from |
  | `prize_taken` | What staff actually handed over — fills in at redemption |
  | `game` | casino, classroom or catch |
  | `result`, `score`, `score_out_of` | Win or lose, and the score |
  | `language` | The language they played in |
  | `answers` | The full breakdown — every question, what they chose, right or wrong; for Catch, which orders they caught, missed and wrongly declined |
  | `consent` | Whether they opted into marketing |
  | `played_at` | Timestamp |

  Questions are written out in English regardless of the language played, so the
  column stays sortable across all eighteen.
- **Start the event clean** — wipes every play, lead and inventory counter, so
  setup testing doesn't eat into the prizes you brought. Needs `RESET` typed to
  confirm, and there's no undo, so export the CSV first.

## Storage

Two backends, picked automatically:

- **Upstash Redis** — used whenever `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` are set. **Required for any deployment.** Vercel's
  filesystem is read-only and isn't shared between instances, so the file
  backend cannot save a single play there — the symptom is players being told to
  grab a rep when they submit their email.
- **File** — `.data/entries.json`, the fallback. Right for a laptop driving the
  booth screen off its own disk: it keeps working when the venue wifi dies.

Provision Redis through the Vercel Marketplace so the env vars land in the
project automatically:

```bash
vercel integration add upstash/upstash-kv --plan free --name cb911-arcade-kv
```

That sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`. The app accepts either
those or the `UPSTASH_REDIS_REST_*` pair, so bringing your own Upstash works
too.

**`vercel env pull` points your laptop at production.** It writes the live
`KV_REST_API_*` credentials into `.env.local`, so `npm run dev` then reads and
writes the same database the booth is using — including the console's reset
button. Strip those keys out after pulling; local runs fall back to
`.data/entries.json`, which is what you want while developing.

**Blank is not the same as unset in a hosting dashboard.** Pasting
`.env.example` into Vercel leaves every key as an empty string, and empty
strings are read as real values by most config code. The app treats blank as
missing everywhere for exactly this reason — but it means an env var you *think*
you set may be doing nothing. Check the console banner.

The console shows a red banner if storage isn't writable, or if it's running on
Vercel with the file backend. Check it before the doors open.

### Staying inside the free plan

The free Redis tier allows a limited number of commands per day, so the hot
paths are all O(1): claims resolve through an id index, inventory comes from
counters instead of scanning the entry list, and the kiosk's claim poll reads a
single key every three seconds and stops after four minutes. The console's
full-list refresh is the only scan, and it runs every 30 seconds. A realistic
booth day lands comfortably inside the free allowance; if you expect a very busy
one, Upstash's pay-as-you-go is $0.20 per 100K commands and switching is a plan
change, not a code change.

`.data/` is gitignored. If you run on the file backend, **copy it off the
machine before you tear down the booth** — that file is the lead list.

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

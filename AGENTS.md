# cb911 Arcade

Trade-show kiosk for Chargebacks911: a slot machine and a chargeback quiz, prize
codes, and email capture. Next.js App Router, Tailwind v4, no other runtime
dependencies — email and storage both talk to REST APIs with `fetch`.

## Shape

- `src/app/page.tsx` — the whole kiosk as one client state machine
  (`attract → choose → casino | classroom → reveal → email → code`), plus the
  75-second idle reset.
- `src/components/kiosk/*` — one component per screen. `Chrome.tsx` holds the
  shared logo, marquee bulbs, backdrop and confetti.
- `src/components/Symbols.tsx` — reel artwork as inline SVG. Gradients live in a
  single `<SymbolDefs />` sprite rendered once per page.
- `src/lib/prizes.ts` — tiers, weights, inventory caps, and the draw functions.
  This is the file to edit when the prize table changes.
- `src/lib/store.ts` — persistence. File-backed by default, Upstash Redis when
  its env vars are present.

## Conventions

- **Outcomes are decided server-side before any animation runs.** `/api/outcome`
  picks the result and the prize, then builds the reel grid to match. Never let
  the client decide whether someone won.
- **The code is withheld until the claim screen.** `/api/outcome` creates the
  entry and returns only the prize; `/api/claim` attaches the email and releases
  the code. That split is what separates "plays" from "leads" in the console.
- Sizing is viewport/container units (`vmin`, `cqw`) throughout so the same build
  fills a portrait or landscape kiosk. Avoid fixed pixel sizes in kiosk screens.
- Everything a booth operator might need to change on event day should be an env
  var or a literal in `src/lib/`, never buried in a component.

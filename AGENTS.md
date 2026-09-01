# cb911 Arcade

Trade-show kiosk for Chargebacks911: three booth games, prize codes, and email
capture. Next.js App Router, Tailwind v4, no other runtime dependencies — email
and storage both talk to REST APIs with `fetch`.

## Shape

- `src/app/page.tsx` — the whole kiosk as one client state machine
  (`attract → choose → casino | classroom | catch → review → grading → reveal →
  email → code`), plus the idle reset and the `trouble` fallback.
- `src/app/claim/[id]/*` — the page the QR opens on the player's phone. Separate
  from the kiosk: it scrolls, selects text, and uses a native keyboard.
- `src/components/kiosk/*` — one component per screen. `Chrome.tsx` holds the
  shared logo, marquee bulbs, backdrop and confetti.
- `src/components/Symbols.tsx` — reel artwork as inline SVG. Gradients live in a
  single `<SymbolDefs />` sprite rendered once per page.
- `src/lib/prizes.ts` — tiers, their choosable `options`, weights, inventory
  caps, and the draw functions. Edit this when the prize table changes.
- `src/lib/quiz.ts` / `src/lib/catch.ts` — the two skill games' content, pacing,
  and pass marks.
- `src/lib/i18n/*` — `locales.ts` is the language registry, `locales/en.ts` is
  the source of truth every other dictionary is typed against, `dictionaries.ts`
  is server-safe (the phone claim page renders through it) and `index.tsx` is
  the client provider.
- `src/lib/store.ts` — persistence. Upstash Redis over REST when its env vars are
  present, otherwise a JSON file. Nothing on a hot path may scan the entry list:
  claims resolve through an id index, inventory reads counters, and the kiosk's
  claim poll reads one key. Only the booth console scans.

## Conventions

- **Outcomes are decided server-side before any animation runs.** `/api/outcome`
  picks the result and the prize tier, then builds the reel grid to match. Never
  let the client decide whether someone won.
- **The code is withheld until the claim screen.** `/api/outcome` creates the
  entry and returns only the tier; `/api/claim` attaches the email and releases
  the code. That split is what separates "plays" from "leads" in the console.
- **A player wins a tier, not an item.** They choose from `tier.options` at the
  booth and staff record it on the console. Anything that names a single prize
  up front is a bug.
- **Never lose a player to a network hiccup.** Prize requests retry; storage
  failures are logged and recovered rather than 500'd; a dead end shows the
  `trouble` screen, never a silent bounce back to the game picker.
- **The idle reset must not fire while someone is on their phone.** A player
  claiming by QR never touches the kiosk, so the claim stage carries a much
  longer window than the rest. Anything that adds an off-screen wait needs the
  same treatment.
- Sizing is viewport/container units (`vmin`, `cqw`) throughout so the same build
  fills a portrait or landscape kiosk. Avoid fixed pixel sizes in kiosk screens.
- Game loops keep their board in a ref and mirror it into state. React runs state
  updaters twice in development, so a spawn or a score decided *inside* an
  updater gets thrown away — this already cost one bug in `CatchGame`.
- **No user-facing string belongs in a component.** Everything routes through
  the dictionary, including quiz content and the Catch card tells. `en.ts`
  defines the shape; a missing key in any of the other seventeen is a compile
  error, and `npm run check:locales` fails the build if a language is still
  aliasing English.
- Everything a booth operator might need to change on event day should be an env
  var or a literal in `src/lib/`, never buried in a component.
- **A deployment without Redis is broken, not degraded.** Vercel's filesystem is
  read-only, so the file backend silently saves nothing and every claim fails.
  The console surfaces that as a banner; keep it that way.

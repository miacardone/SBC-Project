export type Transaction = {
  id: string;
  merchant: string;
  amount: string;
  /** the one detail the player has to read */
  tell: string;
  fraud: boolean;
};

/** Cards that must be tapped. */
const FRAUD: Omit<Transaction, "id">[] = [
  { merchant: "Luxe Watches", amount: "$2,410", tell: "First order · express ship", fraud: true },
  { merchant: "GameKeys Direct", amount: "$890", tell: "9 cards tried in 4 minutes", fraud: true },
  { merchant: "Nova Electronics", amount: "$1,150", tell: "AVS mismatch · CVV fail", fraud: true },
  { merchant: "Gift Card Hub", amount: "$500", tell: "Max quantity · 2:41 AM", fraud: true },
  { merchant: "Sneaker Vault", amount: "$740", tell: "Ships to a freight forwarder", fraud: true },
  { merchant: "Peak Outdoor", amount: "$1,980", tell: "Email created 6 minutes ago", fraud: true },
  { merchant: "Audio Lab", amount: "$620", tell: "12 declines, then approved", fraud: true },
  { merchant: "Metro Phones", amount: "$1,320", tell: "Same device · 7 accounts", fraud: true },
  { merchant: "Bright Beauty", amount: "$455", tell: "Name on card ≠ account name", fraud: true },
  { merchant: "Trail Bikes", amount: "$3,600", tell: "40x this store's average order", fraud: true },
  { merchant: "Cloud Credits", amount: "$980", tell: "New device on a VPN exit node", fraud: true },
  { merchant: "Fine Jewelry Co", amount: "$2,750", tell: "Billing and shipping 3 states apart", fraud: true },
];

/** Cards that must be left alone. Tapping one is a false decline. */
const LEGIT: Omit<Transaction, "id">[] = [
  { merchant: "Corner Coffee", amount: "$18", tell: "AVS + CVV match · repeat buyer", fraud: false },
  { merchant: "Hartley Books", amount: "$64", tell: "Same card, same address, 3 years", fraud: false },
  { merchant: "Fresh Grocer", amount: "$132", tell: "Matches their last 6 orders", fraud: false },
  { merchant: "Sunset Yoga", amount: "$89", tell: "Subscription renewal · month 14", fraud: false },
  { merchant: "Ridge Hardware", amount: "$247", tell: "Verified by 3-D Secure", fraud: false },
  { merchant: "Delta Supply", amount: "$1,410", tell: "Corporate card · known BIN", fraud: false },
  { merchant: "Pine Pharmacy", amount: "$41", tell: "Logged in · saved card · midday", fraud: false },
  { merchant: "Harbor Diner", amount: "$76", tell: "Local pickup · ID on file", fraud: false },
  { merchant: "Vista Optics", amount: "$310", tell: "Two-day ship to home address", fraud: false },
  { merchant: "Studio Paints", amount: "$55", tell: "Average basket for this store", fraud: false },
];

/** How many fraud cards appear in a round — also the score to beat. */
export const CATCH_TOTAL = 10;
/** Legit distractors mixed in. */
const CATCH_DECOYS = 8;

/** Milliseconds a card stays on the board. Long enough to actually read it. */
export const CARD_LIFE = 5000;
/** Milliseconds between spawns. With MAX_LIVE the board is the real throttle. */
export const SPAWN_EVERY = 1500;
/** Board slots. Kept above the live-card ceiling so cards never fight for space. */
export const SLOTS = 6;
/** Most cards on the board at once. With a 5s card life this is what sets the
 *  round length: 18 cards at 4-in-flight lands around 27 seconds. */
export const MAX_LIVE = 4;
/** Fraud catches needed to win a prize. */
export const CATCH_PASS = 7;

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** One round's deck: every fraud card, plus decoys, shuffled together. */
export function dealRound(): Transaction[] {
  const fraud = shuffle(FRAUD).slice(0, CATCH_TOTAL);
  const legit = shuffle(LEGIT).slice(0, CATCH_DECOYS);
  return shuffle([...fraud, ...legit]).map((card, i) => ({
    ...card,
    id: `${i}-${card.merchant}`,
  }));
}

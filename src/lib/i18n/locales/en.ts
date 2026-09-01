/**
 * The source of truth. Every other locale file is typed against this shape, so
 * a missing or misspelled key is a compile error rather than a blank kiosk
 * screen in front of a stranger.
 */
export const en = {
  lang: {
    button: "Language",
    title: "Choose your language",
    close: "Close",
  },

  attract: {
    tapToPlay: "Tap to play",
    subtitleA: "Spin the slots, take the quiz, or catch the fraud.",
    subtitleB: "Every single player walks away with a prize.",
    ticker: [
      "everyone wins something",
      "plush bulls",
      "gift cards",
      "fidget spinners",
      "beat the house",
      "learn something",
    ],
  },

  modes: {
    title: "Pick your",
    titleAccent: "game",
    back: "Back",
    footer: "Every game, every player, a prize",
    play: "Play",
    casino: {
      kicker: "Pure luck",
      title: "Casino",
      blurb: "Pull the lever on the cb911 slot machine.",
      bullets: ["One spin, 15 seconds", "Three bulls and you win big", "No thinking required"],
    },
    classroom: {
      kicker: "Pure skill",
      title: "Classroom",
      blurb: "Five questions on the chargeback game. Beat the clock.",
      bullets: ["Five questions, 15s each", "Four right to win", "Perfect run unlocks the jackpot"],
    },
    catch: {
      kicker: "Pure reflex",
      title: "Catch",
      blurb: "Spot the fraudulent orders before they clear.",
      bullets: ["Tap the bad orders", "Leave good customers alone", "Catch 7 of 10 to win"],
    },
  },

  slots: {
    bulls: "bulls",
    equalsWin: "= win!",
    winner: "Winner!",
    soClose: "So close.",
    balance: "Balance",
    bet: "Bet",
    win: "Win",
    spin: "Spin",
    rolling: "Rolling…",
    back: "Back",
    everySpin: "Every spin",
    winsMerch: "wins merch",
    hiccup: "Machine hiccuped. Tap spin to try again.",
  },

  quiz: {
    title: "Chargeback",
    titleAccent: "Challenge",
    subtitle: "{pass} right to win · {total} for the jackpot",
    quit: "Quit",
    correct: "Correct",
    nope: "Nope",
    outOfTime: "Time",
    next: "Next",
    seePrize: "See prize",
  },

  quizResults: {
    youScored: "You scored",
    jackpotUnlocked: "Jackpot pool unlocked",
    prizeUnlocked: "Prize unlocked",
    everyoneWins: "Everyone still wins",
    youSaid: "You said",
    answerWas: "answer",
    ranOutOfTime: "Ran out of time",
    seeMyPrize: "See my prize",
  },

  catch: {
    title: "Catch the",
    titleAccent: "fraud",
    subtitle: "Tap the bad orders · leave the good ones alone",
    quit: "Quit",
    caught: "Caught",
    missed: "Missed",
    wronglyDeclined: "Wrongly declined",
    howTo: "Orders will pop up with one detail each. Tap the ones that smell like fraud before they clear.",
    timesUp: "Time's up",
    gotAway: "Got away",
    gotAwayDetail: "That one becomes a chargeback.",
    caughtIt: "Caught",
    goodCustomer: "Good customer",
    goodCustomerDetail: "You just declined a real order.",
    footer: "Catch {pass} of {total} to win · all {total} for the jackpot",
  },

  catchResults: {
    youCaught: "You caught",
    of: "of",
    jackpotUnlocked: "Jackpot pool unlocked",
    prizeUnlocked: "Prize unlocked",
    everyoneWins: "Everyone still wins",
    revenueProtected: "Revenue protected",
    lostToChargebacks: "Lost to chargebacks",
    nothingGotThrough: "Nothing got through",
    trueCost: "≈ {amount} once fees and shipping are counted",
    goodCustomersLost: "Good customers lost",
    noneDeclined: "You didn't decline a single one",
    customersKept: "Customers kept",
    servedWithoutFriction: "Served without friction",
    netPosition: "Net position",
    netExplain:
      "Revenue you protected, minus the true cost of what got through and the good orders you turned away.",
    ordersStopped: "{count} fraudulent orders stopped",
    ordersDeclined: "{amount} in orders you declined",
    gotThrough: "Got through",
    wasLegit: "Was legit",
    seeMyPrize: "See my prize",
  },

  reveal: {
    pickAny: "Pick any one of these at the booth",
    getMyCode: "Get my code",
  },

  claim: {
    title: "Scan to grab",
    titleAccent: "your prize",
    subtitle: "Your score and your code are waiting on your phone — no typing on this thing.",
    steps: [
      "Point your camera at the code",
      "Your score and prize are already on the page",
      "Drop in your email and the code is yours",
    ],
    noPhone: "No phone? Type it here instead",
    backToQr: "Back to QR",
  },

  email: {
    title: "Where do we send",
    titleAccent: "your code?",
    wonLine: "You've got a {label} waiting — the code is your claim ticket at the booth.",
    loseLine: "Your prize is waiting at the booth. The code is your claim ticket.",
    placeholder: "you@company.com",
    consent:
      "Send me chargeback tips and product news from Chargebacks911. Optional — you get your code either way.",
    skip: "No email — just show it",
    getMyCode: "Get my code",
    sending: "Sending…",
    clear: "Clear",
    invalid: "That doesn't look like an email",
  },

  code: {
    showAtBooth: "Show this at the",
    booth: "booth",
    prizeCode: "Prize code",
    eligible: "You're eligible for — choose one",
    emailSent: "A copy is on its way to your inbox.",
    emailPending: "Snap a photo of this screen — the email may take a minute.",
    skipped: "Write it down or snap a photo — we didn't email this one.",
    done: "Done — next player",
    resetting: "Resetting in {seconds}s",
  },

  trouble: {
    title: "Grab a",
    titleAccent: "rep",
    body: "The prize desk isn't answering, so we can't print your code. You still won — tell anyone at the Chargebacks911 booth and they'll sort you out.",
    tryAgain: "Try again",
    startOver: "Start over",
  },

  common: {
    home: "Home",
    grading: "Checking the prize shelf…",
    tallying: "Tallying your score…",
  },

  tiers: {
    grand: { label: "JACKPOT", blurb: "Nobody does that. Go collect." },
    plush: { label: "BIG WIN", blurb: "The good shelf. Take your pick." },
    spinner: { label: "WINNER", blurb: "Spins better than a chargeback cycle." },
    consolation: { label: "NICE TRY", blurb: "House always wins. You still get merch." },
  },

  /** Keyed by the exact text in prizes.ts; anything unlisted shows as written. */
  prizes: {
    "$25 gift card": "$25 gift card",
    "cb911 hoodie": "cb911 hoodie",
    "Premium plush bull": "Premium plush bull",
    "Plush bull": "Plush bull",
    "Insulated tumbler": "Insulated tumbler",
    "Wireless charger": "Wireless charger",
    "cb911 fidget spinner": "cb911 fidget spinner",
    "Enamel pin set": "Enamel pin set",
    "Phone stand": "Phone stand",
    "Sticker pack": "Sticker pack",
    Koozie: "Koozie",
    "Pen + notepad": "Pen + notepad",
  },

  questions: {
    "q-what": {
      prompt: "What is a chargeback?",
      options: [
        "A refund the merchant issues",
        "A forced payment reversal by the cardholder's bank",
        "A late payment fee",
        "A discount for repeat customers",
      ],
      explain:
        "The bank pulls the money back out of the merchant's account. The merchant doesn't get a vote until after it's gone.",
    },
    "q-friendly": {
      prompt: 'What is "friendly fraud"?',
      options: [
        "Fraud committed by a friend",
        "A stolen card used at a small business",
        "A real cardholder disputing a purchase they actually made",
        "A bank error refunded automatically",
      ],
      explain:
        "Nothing friendly about it. The customer got the goods, then disputed the charge anyway — and it's the biggest slice of the problem.",
    },
    "q-share": {
      prompt: "Roughly what share of all chargebacks is friendly fraud?",
      options: ["Under 10%", "About 25%", "Most of them", "Basically none"],
      explain:
        "Industry estimates put friendly fraud at the majority of disputes — far more than criminal card theft.",
    },
    "q-window": {
      prompt: "How long does a cardholder usually get to dispute a charge?",
      options: ["24 hours", "30 days", "120 days", "7 years"],
      explain:
        "120 days from the transaction is the common window, and some reason codes stretch it further. That sale isn't final for months.",
    },
    "q-cost": {
      prompt: "A $100 sale gets charged back. What does it actually cost you?",
      options: ["$100", "$100 plus a fee", "Two to three times the sale amount", "Nothing if you win"],
      explain:
        "Lost product, lost sale, the fee, the shipping, the staff time. The true cost multiplies fast.",
    },
    "q-fee": {
      prompt: "You fight a chargeback and win. Do you get the chargeback fee back?",
      options: ["Yes, always", "Usually not — the fee is gone either way", "Yes, doubled", "Only on Amex"],
      explain:
        "Winning gets your revenue back. The fee almost never comes with it, which is why prevention beats fighting.",
    },
    "q-ratio": {
      prompt: "About what chargeback ratio puts a merchant in a card network monitoring program?",
      options: ["0.9%", "5%", "12%", "25%"],
      explain:
        "Under one percent. Cross it and you're in a monitoring program with fines attached — and eventually you can lose the ability to process cards.",
    },
    "q-representment": {
      prompt: 'What is a "representment"?',
      options: [
        "Hiring a lawyer",
        "Re-submitting the transaction with evidence to fight the dispute",
        "A second charge to the customer",
        "Switching payment processors",
      ],
      explain:
        "You re-present the sale to the issuer with compelling evidence: delivery proof, login records, AVS match, terms the customer accepted.",
    },
    "q-descriptor": {
      prompt: 'Best single fix for "I don\'t recognize this charge" disputes?',
      options: [
        "Lower your prices",
        "A clear billing descriptor with your real brand name",
        "Ship faster",
        "Stop taking cards",
      ],
      explain:
        "A huge number of disputes are just confusion on a statement. Put a recognizable name and phone number on the descriptor.",
    },
    "q-3ds": {
      prompt: "What does 3-D Secure do for a merchant?",
      options: [
        "Speeds up checkout",
        "Shifts fraud liability to the card issuer",
        "Removes processing fees",
        "Blocks all refunds",
      ],
      explain:
        "On an authenticated 3DS transaction, a fraud chargeback generally becomes the issuer's problem, not yours.",
    },
    "q-double": {
      prompt: "You already refunded the customer. Can they still file a chargeback?",
      options: [
        "No, refunds block disputes",
        "Yes — and you can end up paying twice",
        "Only after a year",
        "Only for digital goods",
      ],
      explain:
        "It's called double dipping. If you don't respond with proof of the refund, you eat the sale twice.",
    },
    "q-reason": {
      prompt: 'What is a chargeback "reason code"?',
      options: [
        "The customer's written explanation",
        "The issuer's category for why the dispute was filed",
        "Your merchant account number",
        "A discount code",
      ],
      explain:
        "The code tells you exactly what evidence will win. Fighting the wrong code with the wrong proof loses a winnable case.",
    },
    "q-deflect": {
      prompt: "What is pre-dispute deflection?",
      options: [
        "Blocking risky customers at checkout",
        "Sending transaction details to the bank so the dispute never gets filed",
        "Refunding everyone who complains",
        "Appealing after you lose",
      ],
      explain:
        "Network tools push your order details into the customer's banking app mid-complaint. They see what they bought and drop it.",
    },
    "q-evidence": {
      prompt: 'Which is the strongest evidence for a "item not received" dispute?',
      options: [
        "A screenshot of your refund policy",
        "Signed delivery confirmation to the cardholder's billing address",
        "The customer's email address",
        "Your company's good reviews",
      ],
      explain:
        "Delivery confirmation tied to the verified billing address is close to unbeatable on a non-receipt claim.",
    },
  },

  /** Keyed by merchant, which stays untranslated as a proper noun. */
  cards: {
    "Luxe Watches": "First order · express ship",
    "GameKeys Direct": "9 cards tried in 4 minutes",
    "Nova Electronics": "AVS mismatch · CVV fail",
    "Gift Card Hub": "Max quantity · 2:41 AM",
    "Sneaker Vault": "Ships to a freight forwarder",
    "Peak Outdoor": "Email created 6 minutes ago",
    "Audio Lab": "12 declines, then approved",
    "Metro Phones": "Same device · 7 accounts",
    "Bright Beauty": "Name on card ≠ account name",
    "Trail Bikes": "40x this store's average order",
    "Cloud Credits": "New device on a VPN exit node",
    "Fine Jewelry Co": "Billing and shipping 3 states apart",
    "Corner Coffee": "AVS + CVV match · repeat buyer",
    "Hartley Books": "Same card, same address, 3 years",
    "Fresh Grocer": "Matches their last 6 orders",
    "Sunset Yoga": "Subscription renewal · month 14",
    "Ridge Hardware": "Verified by 3-D Secure",
    "Delta Supply": "Corporate card · known BIN",
    "Pine Pharmacy": "Logged in · saved card · midday",
    "Harbor Diner": "Local pickup · ID on file",
    "Vista Optics": "Two-day ship to home address",
    "Studio Paints": "Average basket for this store",
  },

  phone: {
    scoredQuiz: "You scored {score}/{total} on the Chargeback Challenge",
    caughtFraud: "You caught {score} of {total} fraudulent orders",
    beatSlots: "You beat the slot machine",
    playedSlots: "You played the slot machine",
    eligible: "You're eligible for — pick one at the booth",
    emailLabel: "Email",
    getMyCode: "Get my code",
    sending: "Sending…",
    prizeCode: "Prize code",
    withEmail:
      "A copy is in your inbox. Show this screen at the Chargebacks911 booth to pick your prize.",
    withoutEmail: "Screenshot this. Show it at the Chargebacks911 booth to pick your prize.",
    expiredTitle: "Link expired",
    expiredBody:
      "We can't find that play. Grab anyone at the Chargebacks911 booth — they can sort you out.",
    problem: "Something went wrong. Ask a rep at the booth.",
    offline: "No connection. Ask a rep at the booth.",
  },
};

export type Dictionary = typeof en;

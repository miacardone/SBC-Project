export type Question = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
  /** shown after they answer — the actual teaching moment */
  explain: string;
};

/** How many questions one round pulls from the bank. */
export const QUIZ_LENGTH = 5;

/** Seconds on the clock per question. */
export const QUIZ_TIME = 15;

export const QUESTIONS: Question[] = [
  {
    id: "q-what",
    prompt: "What is a chargeback?",
    options: [
      "A refund the merchant issues",
      "A forced payment reversal by the cardholder's bank",
      "A late payment fee",
      "A discount for repeat customers",
    ],
    answer: 1,
    explain:
      "The bank pulls the money back out of the merchant's account. The merchant doesn't get a vote until after it's gone.",
  },
  {
    id: "q-friendly",
    prompt: "What is \"friendly fraud\"?",
    options: [
      "Fraud committed by a friend",
      "A stolen card used at a small business",
      "A real cardholder disputing a purchase they actually made",
      "A bank error refunded automatically",
    ],
    answer: 2,
    explain:
      "Nothing friendly about it. The customer got the goods, then disputed the charge anyway — and it's the biggest slice of the problem.",
  },
  {
    id: "q-share",
    prompt: "Roughly what share of all chargebacks is friendly fraud?",
    options: ["Under 10%", "About 25%", "Most of them", "Basically none"],
    answer: 2,
    explain:
      "Industry estimates put friendly fraud at the majority of disputes — far more than criminal card theft.",
  },
  {
    id: "q-window",
    prompt: "How long does a cardholder usually get to dispute a charge?",
    options: ["24 hours", "30 days", "120 days", "7 years"],
    answer: 2,
    explain:
      "120 days from the transaction is the common window, and some reason codes stretch it further. That sale isn't final for months.",
  },
  {
    id: "q-cost",
    prompt: "A $100 sale gets charged back. What does it actually cost you?",
    options: [
      "$100",
      "$100 plus a fee",
      "Two to three times the sale amount",
      "Nothing if you win",
    ],
    answer: 2,
    explain:
      "Lost product, lost sale, the fee, the shipping, the staff time. The true cost multiplies fast.",
  },
  {
    id: "q-fee",
    prompt: "You fight a chargeback and win. Do you get the chargeback fee back?",
    options: [
      "Yes, always",
      "Usually not — the fee is gone either way",
      "Yes, doubled",
      "Only on Amex",
    ],
    answer: 1,
    explain:
      "Winning gets your revenue back. The fee almost never comes with it, which is why prevention beats fighting.",
  },
  {
    id: "q-ratio",
    prompt: "About what chargeback ratio puts a merchant in a card network monitoring program?",
    options: ["0.9%", "5%", "12%", "25%"],
    answer: 0,
    explain:
      "Under one percent. Cross it and you're in a monitoring program with fines attached — and eventually you can lose the ability to process cards.",
  },
  {
    id: "q-representment",
    prompt: "What is a \"representment\"?",
    options: [
      "Hiring a lawyer",
      "Re-submitting the transaction with evidence to fight the dispute",
      "A second charge to the customer",
      "Switching payment processors",
    ],
    answer: 1,
    explain:
      "You re-present the sale to the issuer with compelling evidence: delivery proof, login records, AVS match, terms the customer accepted.",
  },
  {
    id: "q-descriptor",
    prompt: "Best single fix for \"I don't recognize this charge\" disputes?",
    options: [
      "Lower your prices",
      "A clear billing descriptor with your real brand name",
      "Ship faster",
      "Stop taking cards",
    ],
    answer: 1,
    explain:
      "A huge number of disputes are just confusion on a statement. Put a recognizable name and phone number on the descriptor.",
  },
  {
    id: "q-3ds",
    prompt: "What does 3-D Secure do for a merchant?",
    options: [
      "Speeds up checkout",
      "Shifts fraud liability to the card issuer",
      "Removes processing fees",
      "Blocks all refunds",
    ],
    answer: 1,
    explain:
      "On an authenticated 3DS transaction, a fraud chargeback generally becomes the issuer's problem, not yours.",
  },
  {
    id: "q-double",
    prompt: "You already refunded the customer. Can they still file a chargeback?",
    options: [
      "No, refunds block disputes",
      "Yes — and you can end up paying twice",
      "Only after a year",
      "Only for digital goods",
    ],
    answer: 1,
    explain:
      "It's called double dipping. If you don't respond with proof of the refund, you eat the sale twice.",
  },
  {
    id: "q-reason",
    prompt: "What is a chargeback \"reason code\"?",
    options: [
      "The customer's written explanation",
      "The issuer's category for why the dispute was filed",
      "Your merchant account number",
      "A discount code",
    ],
    answer: 1,
    explain:
      "The code tells you exactly what evidence will win. Fighting the wrong code with the wrong proof loses a winnable case.",
  },
  {
    id: "q-deflect",
    prompt: "What is pre-dispute deflection?",
    options: [
      "Blocking risky customers at checkout",
      "Sending transaction details to the bank so the dispute never gets filed",
      "Refunding everyone who complains",
      "Appealing after you lose",
    ],
    answer: 1,
    explain:
      "Network tools push your order details into the customer's banking app mid-complaint. They see what they bought and drop it.",
  },
  {
    id: "q-evidence",
    prompt: "Which is the strongest evidence for a \"item not received\" dispute?",
    options: [
      "A screenshot of your refund policy",
      "Signed delivery confirmation to the cardholder's billing address",
      "The customer's email address",
      "Your company's good reviews",
    ],
    answer: 1,
    explain:
      "Delivery confirmation tied to the verified billing address is close to unbeatable on a non-receipt claim.",
  },
];

/** Shuffle the bank and take a round's worth, so back-to-back players
 *  at the same booth don't get the same five questions. */
export function drawRound(): Question[] {
  const pool = [...QUESTIONS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, QUIZ_LENGTH);
}

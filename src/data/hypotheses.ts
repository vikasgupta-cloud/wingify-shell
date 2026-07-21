// Canned hypotheses for the Main Information step. Rich fields feed the
// hypothesis card (observation, will-address, and the 1..5 ICE scores).
export interface Hypothesis {
  id: string;
  code: string;
  title: string;
  observation: string;
  willAddress?: string;
  confidence: number;
  importance: number;
  ease: number;
} // scores 1..5

export const HYPOTHESES: Hypothesis[] = [
  {
    id: "h1",
    code: "H1",
    title:
      'Replace generic "Submit" with outcome-based, qualification-forward CTA copy',
    observation:
      "I expect that if the form CTA and microcopy explicitly promise a relevant outcome (hire/project) and set expectations (response time + what to include), more qualified visitors will complete the contact action because the value is clearer and anxiety is reduced.",
    willAddress:
      "Increase qualified contact inquiries from prospective clients/employers",
    confidence: 4,
    importance: 4,
    ease: 4,
  },
  {
    id: "h2",
    code: "H2",
    title: "Move social proof above the fold on the pricing page",
    observation:
      "I expect that surfacing recognizable customer logos and a headline stat near the top of the pricing page will raise trust earlier in the decision, lifting plan selection.",
    confidence: 3,
    importance: 4,
    ease: 5,
  },
  {
    id: "h3",
    code: "H3",
    title: "Add a sticky mobile checkout bar",
    observation:
      "I expect that a persistent add-to-cart / checkout bar on mobile product pages will reduce the distance to purchase and improve mobile conversion.",
    willAddress: "Reduce mobile checkout drop-off",
    confidence: 4,
    importance: 5,
    ease: 3,
  },
  {
    id: "h4",
    code: "H4",
    title: "Simplify the signup form to email-only first step",
    observation:
      "I expect that asking for just an email in step one, then progressively profiling, will lower initial friction and increase signup starts.",
    confidence: 3,
    importance: 3,
    ease: 4,
  },
  {
    id: "h5",
    code: "H5",
    title: "Show estimated delivery date on the product page",
    observation:
      "I expect that displaying a concrete delivery estimate near the buy button will reduce uncertainty and increase add-to-cart rate.",
    confidence: 5,
    importance: 4,
    ease: 2,
  },
];

export const priorityScore = (h: Hypothesis) =>
  Math.round((h.confidence + h.importance + h.ease) / 3);

// Dummy label options for the Labels multi-select.
export const LABELS: string[] = [
  "Home-page",
  "Label 2",
  "Checkout",
  "Pricing",
  "Mobile",
  "High priority",
  "Q3",
  "Experiment",
];

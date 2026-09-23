/** Dummy catalog for Upgrade → Wingz (/upgrade/wingz).
 * Different model from product pages: Core / Advanced, prerequisite notice, no MTU.
 */

export type WingzPlanId = "core" | "advanced";

export type WingzPlanColumn = {
  id: WingzPlanId;
  name: string;
  blurb: string;
  priceLabel: string;
  creditOptions?: string[];
  defaultCredit?: string;
  ctaLabel: string;
  cta: "none" | "request";
};

export const WINGZ_PLANS: WingzPlanColumn[] = [
  {
    id: "core",
    name: "Core",
    blurb: "For businesses starting off with AI optimizations.",
    priceLabel: "Free",
    ctaLabel: "",
    cta: "none",
  },
  {
    id: "advanced",
    name: "Advanced",
    blurb: "For businesses looking to scale and automate AI optimization.",
    priceLabel: "$1,000 per month",
    creditOptions: [
      "5k credits / month",
      "10k credits / month",
      "25k credits / month",
    ],
    defaultCredit: "5k credits / month",
    ctaLabel: "Request pricing",
    cta: "request",
  },
];

export const WINGZ_PRODUCT = {
  name: "Wingz",
  description:
    "Accelerate experimentation with AI-powered analysis, workflows, and autonomous optimization. Discover opportunities, generate hypotheses, automate tests, and scale decision-making with AI.",
  prerequisite:
    "To purchase a Wingz paid plan, an active subscription to at least one Wingify product is required.",
};

export type WingzFeatureCell = boolean;

export type WingzFeatureRow = {
  id: string;
  label: string;
  cells: Record<WingzPlanId, WingzFeatureCell>;
};

export type WingzFeatureCategory = {
  id: string;
  label: string;
  rows: WingzFeatureRow[];
};

export const WINGZ_FEATURE_CATEGORIES: WingzFeatureCategory[] = [
  {
    id: "capabilities",
    label: "Capabilities",
    rows: [
      {
        id: "mdp-plain",
        label: "MDP (w/o Behavior Analytics data)",
        cells: { core: true, advanced: true },
      },
      {
        id: "mdp-ba",
        label: "MDP (with Behavior Analytics data)",
        cells: { core: false, advanced: true },
      },
      {
        id: "ai-analysis",
        label: "AI Analysis",
        cells: { core: false, advanced: true },
      },
      {
        id: "ai-workflow",
        label: "AI Workflow",
        cells: { core: false, advanced: true },
      },
      {
        id: "ai-autopilot",
        label: "AI Autopilot",
        cells: { core: false, advanced: true },
      },
      {
        id: "synthetic-ab",
        label: "Synthetic A/B",
        cells: { core: false, advanced: true },
      },
      {
        id: "credit-addon",
        label: "Credit Add-On",
        cells: { core: false, advanced: true },
      },
      {
        id: "edc-addon",
        label: "Enterprise Data Control Add-On",
        cells: { core: false, advanced: true },
      },
    ],
  },
];

export type WingzAddon = {
  id: string;
  name: string;
  priceLabel: string;
  availability: string;
};

export const WINGZ_PRODUCT_ADDONS: WingzAddon[] = [
  {
    id: "edc",
    name: "Wingz Enterprise Data Control",
    priceLabel: "$500 / month",
    availability: "Available in: Advanced Plan",
  },
  {
    id: "credits",
    name: "Wingz Credit Pack",
    priceLabel: "$1,000 for 5k credits",
    availability: "Available in: Advanced Plan",
  },
];

export const WINGZ_ACCOUNT_ADDONS: WingzAddon[] = [
  {
    id: "sso",
    name: "Single Sign-On (SSO)",
    priceLabel: "$499 / month",
    availability: "Available in: Advanced Plan",
  },
];

export const WINGZ_FAQS: { id: string; q: string; a: string }[] = [
  {
    id: "prerequisite",
    q: "Can I buy Wingz on its own?",
    a: "Core is free to explore. Paid Wingz (Advanced) requires an active subscription to at least one other Wingify product.",
  },
  {
    id: "core",
    q: "What is included in Core?",
    a: "Core covers foundational AI optimization capabilities to get started. Advanced unlocks analysis, workflows, autopilot, and add-ons.",
  },
  {
    id: "credits",
    q: "How do credits work on Advanced?",
    a: "Advanced includes a monthly credit allotment (selectable in this mock). Extra credit packs are available as add-ons.",
  },
  {
    id: "upgrade",
    q: "How do I move from Core to Advanced?",
    a: "Use Request pricing on Advanced, or Contact Sales. Your account manager can confirm product prerequisites and credit tiers.",
  },
  {
    id: "addons",
    q: "What are Wingz add-ons?",
    a: "Optional capabilities on Advanced — such as Enterprise Data Control or additional credit packs.",
  },
];

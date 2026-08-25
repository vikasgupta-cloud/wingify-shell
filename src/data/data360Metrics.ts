// Dummy metrics for Data360 → Metrics (Standard + My Metric).
// Separate from src/data/metrics.ts (config/report picker catalog).

import type { CampaignStatus } from "@/data/campaigns";

export type MetricKind = "Standard" | "My Metric";

/** Values under "Metric will calculate" (incl. event-property aggregations). */
export type MetricMeasure =
  | "Unique visitors"
  | "Event totals"
  | "First value"
  | "Last value"
  | "Sum"
  | "Average"
  | "Maximum value"
  | "Minimum value";

export type MetricDirection = "Increase" | "Decrease";

export type MetricWhere = {
  subject: string;
  operator: string;
  value: string;
};

export type MetricLinkedCampaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  createdOn: string;
};

export type MetricLinkedFunnel = {
  id: string;
  name: string;
  status: "Draft" | "Running" | "Paused";
  createdOn: string;
};

export type MetricAdvanced = {
  testingObjective: string;
  mde: string;
  rope: string;
  statisticalPower: string;
  falsePositiveRate: string;
  guardrailMdr: string;
  guardrailPower: string;
  guardrailAlpha: string;
  breachAction: string;
};

export type Data360Metric = {
  id: string;
  name: string;
  kind: MetricKind;
  description: string;
  measures: MetricMeasure;
  /** Optional property name when measure is a value aggregation. */
  propertyName?: string;
  event: string;
  where: MetricWhere[];
  direction: MetricDirection;
  conversionWindow: string;
  createdBy: string;
  createdOn: string;
  campaigns: MetricLinkedCampaign[];
  funnels: MetricLinkedFunnel[];
  advanced: MetricAdvanced;
};

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

const DEFAULT_ADVANCED: MetricAdvanced = {
  testingObjective: "Better",
  mde: "±5% of baseline average",
  rope: "±1%",
  statisticalPower: "80%",
  falsePositiveRate: "10%",
  guardrailMdr: "-20% of baseline average",
  guardrailPower: "99%",
  guardrailAlpha: "1%",
  breachAction: "Disable the variation and notify me",
};

export const METRIC_MEASURES: MetricMeasure[] = [
  "Unique visitors",
  "Event totals",
  "First value",
  "Last value",
  "Sum",
  "Average",
  "Maximum value",
  "Minimum value",
];

export const DATA360_METRICS: Data360Metric[] = [
  {
    id: "std-page-visit",
    name: "Page Visit",
    kind: "Standard",
    description: "Visitors who loaded a page during the campaign",
    measures: "Unique visitors",
    event: "Page Visit",
    where: [],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "std-engagement",
    name: "Engagement",
    kind: "Standard",
    description: "Visitors who engaged beyond a bounce",
    measures: "Unique visitors",
    event: "Engagement",
    where: [],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "std-bounce",
    name: "Bounce Rate",
    kind: "Standard",
    description: "Share of sessions with a single page view",
    measures: "Event totals",
    event: "Page Unload",
    where: [],
    direction: "Decrease",
    conversionWindow: "Campaign duration",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "std-revenue",
    name: "Revenue",
    kind: "Standard",
    description: "Total revenue attributed to the campaign",
    measures: "Sum",
    propertyName: "revenue",
    event: "Transaction",
    where: [],
    direction: "Increase",
    conversionWindow: "30 days",
    createdBy: "Wingify",
    createdOn: iso(2024, 1, 15),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-ft-modal",
    name: "Free Trial Modal Click - Get Started Page",
    kind: "My Metric",
    description: "",
    measures: "Unique visitors",
    event: "Click",
    where: [
      {
        subject: "Selector Path",
        operator: "Is equal to",
        value: '[data-modal="modal-free-trial"]',
      },
      {
        subject: "Page URL",
        operator: "Contains",
        value: "/campaign/get-started",
      },
    ],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Aayush Agarwal",
    createdOn: iso(2026, 4, 8),
    campaigns: [
      {
        id: "c1",
        name: "Tooltip on Demo CTA in get-started campaign page",
        status: "Paused",
        createdOn: iso(2026, 4, 8),
      },
      {
        id: "c2",
        name: "Get Started hero CTA copy test",
        status: "Draft",
        createdOn: iso(2026, 3, 22),
      },
      {
        id: "c3",
        name: "Free trial modal timing",
        status: "Running",
        createdOn: iso(2026, 2, 14),
      },
      {
        id: "c4",
        name: "Pricing page FT entry",
        status: "Paused",
        createdOn: iso(2026, 1, 30),
      },
      {
        id: "c5",
        name: "Nav free trial experiment",
        status: "Draft",
        createdOn: iso(2025, 12, 11),
      },
    ],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-rd-form",
    name: "Metric Request Demo -> campaign -> get-started",
    kind: "My Metric",
    description: "",
    measures: "Unique visitors",
    event: "Event Request Demo Form Success",
    where: [
      {
        subject: "Page URL",
        operator: "Contains",
        value: "/campaign/get-started",
      },
    ],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Priya Sharma",
    createdOn: iso(2026, 3, 15),
    campaigns: [
      {
        id: "c6",
        name: "Request demo form layout",
        status: "Running",
        createdOn: iso(2026, 3, 10),
      },
      {
        id: "c7",
        name: "Demo CTA contrast",
        status: "Paused",
        createdOn: iso(2026, 2, 28),
      },
    ],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-ft-step1",
    name: "FT Form Success Step 1 - Live Session Recording",
    kind: "My Metric",
    description: "",
    measures: "Unique visitors",
    event: "Event Free Trial Form Success Step 1",
    where: [
      {
        subject: "Page URL",
        operator: "Contains",
        value: "/live-session-recording/",
      },
    ],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "James Okonkwo",
    createdOn: iso(2026, 2, 20),
    campaigns: [
      {
        id: "c8",
        name: "LSR landing FT form",
        status: "Running",
        createdOn: iso(2026, 2, 18),
      },
      {
        id: "c9",
        name: "LSR social proof block",
        status: "In Analysis",
        createdOn: iso(2026, 1, 5),
      },
      {
        id: "c10",
        name: "LSR headline test",
        status: "Ended",
        createdOn: iso(2025, 11, 12),
      },
      {
        id: "c11",
        name: "LSR sticky CTA",
        status: "Draft",
        createdOn: iso(2026, 3, 1),
      },
    ],
    funnels: [
      {
        id: "f1",
        name: "FT signup funnel",
        status: "Running",
        createdOn: iso(2026, 1, 10),
      },
    ],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-live-preview",
    name: "Click on Live Preview Button in Request Demo Form",
    kind: "My Metric",
    description: "",
    measures: "Unique visitors",
    event: "Click",
    where: [
      {
        subject: "Selector Path",
        operator: "Is equal to",
        value: "#js-live-preview-btn",
      },
    ],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Sarah Chen",
    createdOn: iso(2026, 1, 28),
    campaigns: [
      {
        id: "c12",
        name: "Live preview button placement",
        status: "Running",
        createdOn: iso(2026, 1, 20),
      },
    ],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-pricing-ft",
    name: "Testing Web Enterprise FT",
    kind: "My Metric",
    description: "",
    measures: "Unique visitors",
    event: "Click",
    where: [
      {
        subject: "Page URL",
        operator: "Matches",
        value: "https://vwo.com/pricing/",
      },
      {
        subject: "Selector Path",
        operator: "Is equal to",
        value: "#price > div:nth-child(1) > div > a.btn-primary",
      },
    ],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Ankit Jain",
    createdOn: iso(2025, 12, 5),
    campaigns: [
      {
        id: "c13",
        name: "Enterprise FT pricing CTA",
        status: "Paused",
        createdOn: iso(2025, 12, 1),
      },
    ],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-aov",
    name: "Average Order Value",
    kind: "My Metric",
    description: "Average revenue per completed purchase",
    measures: "Average",
    propertyName: "revenue",
    event: "Transaction",
    where: [],
    direction: "Increase",
    conversionWindow: "14 days",
    createdBy: "Priya Sharma",
    createdOn: iso(2025, 10, 18),
    campaigns: [],
    funnels: [
      {
        id: "f2",
        name: "Checkout conversion",
        status: "Running",
        createdOn: iso(2025, 9, 1),
      },
    ],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-cart-sum",
    name: "Cart Value Sum",
    kind: "My Metric",
    description: "",
    measures: "Sum",
    propertyName: "cart_value",
    event: "Add to Cart",
    where: [
      {
        subject: "Page URL",
        operator: "Contains",
        value: "/product/",
      },
    ],
    direction: "Increase",
    conversionWindow: "7 days",
    createdBy: "Gowtham S",
    createdOn: iso(2026, 5, 2),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-max-session",
    name: "Max Session Duration",
    kind: "My Metric",
    description: "Longest session length observed",
    measures: "Maximum value",
    propertyName: "sessionDuration",
    event: "Page Unload",
    where: [],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Tracking",
    createdOn: iso(2025, 8, 9),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-event-totals-rage",
    name: "Rage Click Count",
    kind: "My Metric",
    description: "Total rage click events",
    measures: "Event totals",
    event: "Rage Click",
    where: [],
    direction: "Decrease",
    conversionWindow: "Campaign duration",
    createdBy: "Aayush Agarwal",
    createdOn: iso(2026, 4, 1),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
  {
    id: "my-first-utm",
    name: "First UTM Source Value",
    kind: "My Metric",
    description: "",
    measures: "First value",
    propertyName: "utm_source",
    event: "Page Visit",
    where: [],
    direction: "Increase",
    conversionWindow: "Campaign duration",
    createdBy: "Sarah Chen",
    createdOn: iso(2026, 3, 3),
    campaigns: [],
    funnels: [],
    advanced: DEFAULT_ADVANCED,
  },
];

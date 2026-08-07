// Dummy surveys for Pulse → Surveys. Statuses mirror screenshot: Draft / Running / Paused.

export type SurveyStatus = "Draft" | "Running" | "Paused";

export const SURVEY_STATUSES: SurveyStatus[] = ["Draft", "Running", "Paused"];

export type Survey = {
  id: string;
  name: string;
  url: string;
  status: SurveyStatus;
  displayed: number;
  attempted: number;
  completed: number;
  createdOn: string; // ISO date
  createdBy: string;
  startedOn: string | null;
  labels: string[];
  platform: "Web" | "Mobile" | "Both";
};

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

export const SURVEYS: Survey[] = [
  {
    id: "500",
    name: "New Creation flow feedback",
    url: "https://app.wingify.com/#/test/ab/500",
    status: "Paused",
    displayed: 3200,
    attempted: 174,
    completed: 22,
    createdOn: iso(2026, 7, 28),
    createdBy: "Vikas Gupta",
    startedOn: iso(2026, 7, 29),
    labels: [],
    platform: "Web",
  },
  {
    id: "499",
    name: "Checkout NPS pulse",
    url: "https://app.shopify.com/new-creation",
    status: "Draft",
    displayed: 0,
    attempted: 0,
    completed: 0,
    createdOn: iso(2026, 7, 28),
    createdBy: "Vikas Gupta",
    startedOn: null,
    labels: [],
    platform: "Web",
  },
  {
    id: "498",
    name: "Homepage intent survey",
    url: "https://app.wingify.com/#/dashboard",
    status: "Running",
    displayed: 4100,
    attempted: 432,
    completed: 123,
    createdOn: iso(2026, 7, 20),
    createdBy: "Randeep",
    startedOn: iso(2026, 7, 21),
    labels: ["growth"],
    platform: "Both",
  },
  {
    id: "497",
    name: "Pricing page clarity",
    url: "https://vwo.com/pricing",
    status: "Paused",
    displayed: 953,
    attempted: 43,
    completed: 8,
    createdOn: iso(2026, 6, 12),
    createdBy: "Anita Shah",
    startedOn: iso(2026, 6, 15),
    labels: [],
    platform: "Web",
  },
  {
    id: "496",
    name: "Mobile onboarding check",
    url: "https://app.vwo.com/#/mobile",
    status: "Running",
    displayed: 2800,
    attempted: 310,
    completed: 91,
    createdOn: iso(2026, 7, 2),
    createdBy: "Vikas Gupta",
    startedOn: iso(2026, 7, 3),
    labels: ["mobile"],
    platform: "Mobile",
  },
  {
    id: "495",
    name: "Feature discovery tips",
    url: "https://app.vwo.com/#/explore",
    status: "Draft",
    displayed: 0,
    attempted: 0,
    completed: 0,
    createdOn: iso(2026, 7, 30),
    createdBy: "Randeep",
    startedOn: null,
    labels: [],
    platform: "Web",
  },
  {
    id: "494",
    name: "Post-purchase feedback",
    url: "https://shop.example.com/thank-you",
    status: "Running",
    displayed: 6200,
    attempted: 801,
    completed: 240,
    createdOn: iso(2026, 5, 8),
    createdBy: "Anita Shah",
    startedOn: iso(2026, 5, 10),
    labels: ["commerce"],
    platform: "Web",
  },
  {
    id: "493",
    name: "Account settings usability",
    url: "https://app.vwo.com/#/settings",
    status: "Paused",
    displayed: 1100,
    attempted: 88,
    completed: 19,
    createdOn: iso(2026, 4, 18),
    createdBy: "Vikas Gupta",
    startedOn: iso(2026, 4, 20),
    labels: [],
    platform: "Both",
  },
  {
    id: "492",
    name: "Trial expiry outreach",
    url: "https://app.vwo.com/#/billing",
    status: "Draft",
    displayed: 0,
    attempted: 0,
    completed: 0,
    createdOn: iso(2026, 7, 31),
    createdBy: "Randeep",
    startedOn: null,
    labels: ["lifecycle"],
    platform: "Web",
  },
  {
    id: "491",
    name: "Docs helpfulness",
    url: "https://developers.vwo.com",
    status: "Running",
    displayed: 1500,
    attempted: 220,
    completed: 67,
    createdOn: iso(2026, 6, 1),
    createdBy: "Anita Shah",
    startedOn: iso(2026, 6, 2),
    labels: [],
    platform: "Web",
  },
  {
    id: "490",
    name: "Partner portal pulse",
    url: "https://vwo.com/partners/agencies",
    status: "Paused",
    displayed: 740,
    attempted: 55,
    completed: 12,
    createdOn: iso(2026, 3, 14),
    createdBy: "Vikas Gupta",
    startedOn: iso(2026, 3, 16),
    labels: ["partners"],
    platform: "Web",
  },
  {
    id: "489",
    name: "Search results quality",
    url: "https://app.vwo.com/#/search",
    status: "Running",
    displayed: 3300,
    attempted: 401,
    completed: 98,
    createdOn: iso(2026, 7, 10),
    createdBy: "Randeep",
    startedOn: iso(2026, 7, 11),
    labels: [],
    platform: "Both",
  },
];

export function formatSurveyMetric(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`.replace(".0K", "K");
  }
  return String(n);
}

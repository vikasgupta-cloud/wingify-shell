// Dummy surveys for Pulse → Surveys (aligned to listing screenshot).

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
    id: "2118",
    name: "FE _ KB survey_Oct25",
    url: "https://help.vwo.com/hc/en-us/articles/survey-oct25",
    status: "Running",
    displayed: 1000,
    attempted: 52,
    completed: 7,
    createdOn: iso(2025, 10, 22),
    createdBy: "Reuben John",
    startedOn: iso(2025, 10, 23),
    labels: [],
    platform: "Web",
  },
  {
    id: "1386",
    name: "Server-side Testing Page Survey",
    url: "https://vwo.com/testing/server-side",
    status: "Running",
    displayed: 6000,
    attempted: 118,
    completed: 3,
    createdOn: iso(2024, 4, 9),
    createdBy: "",
    startedOn: iso(2024, 4, 9),
    labels: [],
    platform: "Web",
  },
  {
    id: "1339",
    name: "Web testing page survey",
    url: "https://vwo.com/testing/web",
    status: "Running",
    displayed: 23000,
    attempted: 624,
    completed: 41,
    createdOn: iso(2024, 3, 7),
    createdBy: "",
    startedOn: iso(2024, 3, 7),
    labels: [],
    platform: "Web",
  },
  {
    id: "1201",
    name: "Checkout NPS draft",
    url: "https://vwo.com/checkout",
    status: "Draft",
    displayed: 0,
    attempted: 0,
    completed: 0,
    createdOn: iso(2025, 11, 2),
    createdBy: "Anita Shah",
    startedOn: null,
    labels: [],
    platform: "Web",
  },
  {
    id: "1188",
    name: "Mobile onboarding pause",
    url: "https://app.vwo.com/#/mobile",
    status: "Paused",
    displayed: 2800,
    attempted: 310,
    completed: 91,
    createdOn: iso(2025, 8, 14),
    createdBy: "Vikas Gupta",
    startedOn: iso(2025, 8, 15),
    labels: ["mobile"],
    platform: "Mobile",
  },
];

export function formatSurveyMetric(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`.replace(".0K", "K");
  }
  return String(n);
}

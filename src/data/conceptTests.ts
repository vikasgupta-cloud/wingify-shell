// Dummy concept tests for Pulse → Concept Test (aligned to listing screenshot).

export type ConceptTestStatus = "Draft" | "Running" | "Paused";

export const CONCEPT_TEST_STATUSES: ConceptTestStatus[] = [
  "Draft",
  "Running",
  "Paused",
];

export type ConceptTest = {
  id: string;
  name: string;
  url: string;
  status: ConceptTestStatus;
  displayed: number;
  attempted: number;
  completed: number;
  createdOn: string;
  createdBy: string;
  startedOn: string | null;
  labels: string[];
  platform: "Web" | "Mobile" | "Both";
};

function iso(y: number, m: number, d: number) {
  return new Date(Date.UTC(y, m - 1, d)).toISOString();
}

export const CONCEPT_TESTS: ConceptTest[] = [
  {
    id: "24",
    name: "Artemis Reports V2 Survey",
    url: "https://voc.vwo.io/artemis-reports-v2",
    status: "Draft",
    displayed: 0,
    attempted: 0,
    completed: 0,
    createdOn: iso(2026, 5, 13),
    createdBy: "karthik chaganty",
    startedOn: null,
    labels: [],
    platform: "Web",
  },
  {
    id: "23",
    name: "Campaign 23",
    url: "https://voc.vwo.io/campaign-23",
    status: "Running",
    displayed: 1,
    attempted: 0,
    completed: 0,
    createdOn: iso(2026, 3, 13),
    createdBy: "karthik chaganty",
    startedOn: iso(2026, 3, 13),
    labels: [],
    platform: "Web",
  },
  {
    id: "4715551",
    name: "Draft 4715551",
    url: "https://voc.vwo.io/draft-4715551",
    status: "Draft",
    displayed: 0,
    attempted: 0,
    completed: 0,
    createdOn: iso(2026, 5, 13),
    createdBy: "karthik chaganty",
    startedOn: null,
    labels: [],
    platform: "Web",
  },
];

export function formatConceptTestMetric(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}K`.replace(".0K", "K");
  }
  return String(n);
}

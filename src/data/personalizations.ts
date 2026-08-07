// Dummy Personalize campaigns for the listing page (table / kanban / gantt).
// Separate from Web Experimentation CAMPAIGNS. Detail surfaces are Coming soon.

import type { CampaignStatus } from "./campaigns";

export type PersonalizationType = "Personalization";

export type PersonalizationPhase = {
  status: CampaignStatus;
  from: string;
  to: string | null;
};

export type Personalization = {
  id: string;
  name: string;
  url: string;
  type: PersonalizationType;
  status: CampaignStatus;
  vitals: "healthy" | "unhealthy" | null;
  experiences: number;
  visitors: number;
  uniqueConversions: number;
  createdOn: string;
  createdBy: string;
  startedOn: string | null;
  labels: string[];
  lastUpdated: string;
  phases: PersonalizationPhase[];
  /** Optional approval flag for filters. */
  approvalPending: boolean;
};

export const PERSONALIZATION_STATUSES: CampaignStatus[] = [
  "Draft",
  "In QA",
  "Ready to launch",
  "Running",
  "In Analysis",
  "Paused",
  "Ended",
];

/** List → detail always lands on configure (Coming soon). No reports yet. */
export const personalizeLandingPath = (c: { id: string }): string =>
  `/personalize/c/${c.id}`;

const CREATORS = [
  "Abhishek kumar",
  "Wingify Support",
  "Ava Thornton",
  "Priya Nair",
  "Growth team",
  "Sofia Almeida",
];

const URLS = [
  "https://www.vwo.com",
  "https://vwo.com/pricing/",
  "https://vwo.com/free-trial/",
  "https://wingify.com/",
  "https://vwo.com/insights/",
];

function iso(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toISOString();
}

function phasePath(status: CampaignStatus, from: string): PersonalizationPhase[] {
  const order: CampaignStatus[] = [
    "Draft",
    "In QA",
    "Ready to launch",
    "Running",
    "In Analysis",
    "Paused",
    "Ended",
  ];
  const idx = order.indexOf(status);
  const start = new Date(from);
  const phases: PersonalizationPhase[] = [];
  for (let i = 0; i <= Math.max(0, idx); i++) {
    const fromD = new Date(start);
    fromD.setUTCDate(fromD.getUTCDate() + i * 7);
    const toD =
      i < idx
        ? new Date(start.getTime() + (i + 1) * 7 * 86400000)
        : null;
    phases.push({
      status: order[i],
      from: fromD.toISOString(),
      to: toD ? toD.toISOString() : null,
    });
  }
  return phases;
}

const SEED: Omit<Personalization, "phases">[] = [
  {
    id: "2713",
    name: "Campaign 2713",
    url: URLS[0],
    type: "Personalization",
    status: "Draft",
    vitals: null,
    experiences: 2,
    visitors: 0,
    uniqueConversions: 0,
    createdOn: iso(2026, 7, 28),
    createdBy: CREATORS[0],
    startedOn: null,
    labels: ["homepage"],
    lastUpdated: iso(2026, 7, 28),
    approvalPending: false,
  },
  {
    id: "2656",
    name: "Campaign 2656",
    url: URLS[1],
    type: "Personalization",
    status: "Draft",
    vitals: "healthy",
    experiences: 3,
    visitors: 1200,
    uniqueConversions: 48,
    createdOn: iso(2026, 4, 1),
    createdBy: CREATORS[1],
    startedOn: iso(2026, 4, 8),
    labels: ["pricing"],
    lastUpdated: iso(2026, 6, 12),
    approvalPending: true,
  },
  {
    id: "2591",
    name: "Returning Visitors Offer",
    url: URLS[2],
    type: "Personalization",
    status: "Paused",
    vitals: null,
    experiences: 4,
    visitors: 8400,
    uniqueConversions: 312,
    createdOn: iso(2026, 2, 14),
    createdBy: CREATORS[2],
    startedOn: iso(2026, 2, 20),
    labels: ["retention", "offer"],
    lastUpdated: iso(2026, 5, 3),
    approvalPending: false,
  },
  {
    id: "2488",
    name: "Geo — India Homepage Banner",
    url: URLS[0],
    type: "Personalization",
    status: "Running",
    vitals: "healthy",
    experiences: 2,
    visitors: 15200,
    uniqueConversions: 890,
    createdOn: iso(2026, 1, 10),
    createdBy: CREATORS[3],
    startedOn: iso(2026, 1, 18),
    labels: ["geo"],
    lastUpdated: iso(2026, 7, 1),
    approvalPending: false,
  },
  {
    id: "2410",
    name: "Enterprise CTA Block",
    url: URLS[3],
    type: "Personalization",
    status: "In QA",
    vitals: null,
    experiences: 2,
    visitors: 0,
    uniqueConversions: 0,
    createdOn: iso(2026, 6, 2),
    createdBy: CREATORS[4],
    startedOn: null,
    labels: ["enterprise"],
    lastUpdated: iso(2026, 6, 20),
    approvalPending: true,
  },
  {
    id: "2333",
    name: "Mobile Nav Personalization",
    url: URLS[4],
    type: "Personalization",
    status: "Ready to launch",
    vitals: null,
    experiences: 3,
    visitors: 0,
    uniqueConversions: 0,
    createdOn: iso(2026, 5, 22),
    createdBy: CREATORS[5],
    startedOn: null,
    labels: ["mobile"],
    lastUpdated: iso(2026, 7, 15),
    approvalPending: false,
  },
  {
    id: "2290",
    name: "Blog Reader Segment",
    url: URLS[0],
    type: "Personalization",
    status: "In Analysis",
    vitals: "unhealthy",
    experiences: 5,
    visitors: 6200,
    uniqueConversions: 110,
    createdOn: iso(2025, 11, 8),
    createdBy: CREATORS[0],
    startedOn: iso(2025, 11, 15),
    labels: ["content"],
    lastUpdated: iso(2026, 3, 4),
    approvalPending: false,
  },
  {
    id: "2201",
    name: "Free Trial Exit Intent",
    url: URLS[2],
    type: "Personalization",
    status: "Ended",
    vitals: "healthy",
    experiences: 2,
    visitors: 22100,
    uniqueConversions: 1402,
    createdOn: iso(2025, 9, 1),
    createdBy: CREATORS[1],
    startedOn: iso(2025, 9, 10),
    labels: ["trial"],
    lastUpdated: iso(2026, 1, 2),
    approvalPending: false,
  },
  {
    id: "2155",
    name: "Partner Stack Landing",
    url: URLS[3],
    type: "Personalization",
    status: "Draft",
    vitals: null,
    experiences: 1,
    visitors: 0,
    uniqueConversions: 0,
    createdOn: iso(2026, 7, 10),
    createdBy: CREATORS[2],
    startedOn: null,
    labels: [],
    lastUpdated: iso(2026, 7, 10),
    approvalPending: false,
  },
  {
    id: "2099",
    name: "Checkout Urgency Band",
    url: URLS[1],
    type: "Personalization",
    status: "Running",
    vitals: null,
    experiences: 3,
    visitors: 9800,
    uniqueConversions: 540,
    createdOn: iso(2026, 3, 3),
    createdBy: CREATORS[4],
    startedOn: iso(2026, 3, 12),
    labels: ["checkout"],
    lastUpdated: iso(2026, 7, 20),
    approvalPending: false,
  },
  {
    id: "2012",
    name: "VIP Loyalty Module",
    url: URLS[0],
    type: "Personalization",
    status: "Paused",
    vitals: "healthy",
    experiences: 4,
    visitors: 3100,
    uniqueConversions: 260,
    createdOn: iso(2026, 2, 1),
    createdBy: CREATORS[5],
    startedOn: iso(2026, 2, 9),
    labels: ["loyalty", "vip"],
    lastUpdated: iso(2026, 6, 1),
    approvalPending: false,
  },
  {
    id: "1988",
    name: "Docs Search Nudge",
    url: URLS[4],
    type: "Personalization",
    status: "In QA",
    vitals: null,
    experiences: 2,
    visitors: 0,
    uniqueConversions: 0,
    createdOn: iso(2026, 6, 28),
    createdBy: CREATORS[3],
    startedOn: null,
    labels: ["docs"],
    lastUpdated: iso(2026, 7, 5),
    approvalPending: true,
  },
];

export const PERSONALIZATIONS: Personalization[] = SEED.map((row) => ({
  ...row,
  phases: phasePath(row.status, row.createdOn),
}));

/** Gantt/Kanban phase chain — mirrors campaigns.phasesFor for status overrides. */
export function phasesFor(c: Personalization): PersonalizationPhase[] {
  const { phases, status } = c;
  const last = phases[phases.length - 1];
  const today = new Date().toISOString();
  const chain: PersonalizationPhase[] =
    last.status === status
      ? phases
      : [
          ...phases.slice(0, -1),
          { ...last, to: today },
          { status, from: today, to: today },
        ];
  const idx = chain.length - 1;
  const tail = chain[idx];
  if (status === "Ended") {
    const end = new Date(tail.from);
    end.setUTCDate(end.getUTCDate() + 1);
    return [...chain.slice(0, idx), { ...tail, to: end.toISOString() }];
  }
  return [...chain.slice(0, idx), { ...tail, to: null }];
}

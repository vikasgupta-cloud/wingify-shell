import { create } from "zustand";
import {
  CAMPAIGNS,
  type Campaign,
  type CampaignStatus,
  type CampaignType,
} from "../data/campaigns";

// NOTE: In-memory row overrides. This stands in for a real backend — archive,
// delete, status changes, AND newly-created campaigns are session-only, so a
// reload restores the original 40 rows and drops anything created this session.
type RowsState = {
  archivedIds: string[];
  deletedIds: string[];
  statusOverrides: Record<string, CampaignStatus>;
  added: Campaign[];
  archive: (ids: string[]) => void;
  remove: (ids: string[]) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
  createCampaign: (type: CampaignType) => string;
};

// A fresh, unique 6-digit numeric id not colliding with the seed rows or any
// campaign already created this session.
function mintId(taken: Set<string>): string {
  let n = 900000;
  while (taken.has(String(n))) n += 1;
  return String(n).padStart(6, "0");
}

// A brand-new Draft has no live report — every field zeroed/empty, no variants.
function emptyReport(): Campaign["report"] {
  return {
    estimatedEndDate: null,
    elapsedDays: 0,
    requiredDays: 0,
    requiredVisitors: 0,
    requiredConversions: 0,
    traffic: 100,
    trafficSplit: "Equal",
    audience: "All visitors",
    otherMetrics: [],
    variants: [
      { id: "control", label: "C", name: "Control", convRate: 0, uplift: null, confidence: null, isBest: false },
    ],
  };
}

export const useRowsStore = create<RowsState>((set, get) => ({
  archivedIds: [],
  deletedIds: [],
  statusOverrides: {},
  added: [],
  archive: (ids) =>
    set((s) => ({
      archivedIds: [...new Set([...s.archivedIds, ...ids])],
    })),
  remove: (ids) =>
    set((s) => ({
      deletedIds: [...new Set([...s.deletedIds, ...ids])],
    })),
  setStatus: (id, status) =>
    set((s) => ({
      statusOverrides: { ...s.statusOverrides, [id]: status },
    })),
  createCampaign: (type) => {
    const { added } = get();
    const taken = new Set([...CAMPAIGNS.map((c) => c.id), ...added.map((c) => c.id)]);
    const id = mintId(taken);
    const now = new Date().toISOString();
    const status: CampaignStatus = "Draft";
    const campaign: Campaign = {
      id,
      name: `Campaign ${added.length + 1}`,
      url: "",
      type,
      status,
      decision: "No decision",
      vitals: null,
      variations: 1,
      visitors: 0,
      uniqueConversions: 0,
      createdOn: now,
      createdBy: "John Doe",
      startedOn: null,
      expectedImprovement: 0,
      primaryMetric: "Conversion rate",
      leadingVariation: "—",
      hypothesis: "",
      addresses: "",
      labels: [],
      lastUpdated: now,
      phases: [{ status, from: now, to: null }],
      report: emptyReport(),
    };
    set((s) => ({ added: [...s.added, campaign] }));
    return id;
  },
}));

export function useVisibleCampaigns(): Campaign[] {
  const archivedIds = useRowsStore((s) => s.archivedIds);
  const deletedIds = useRowsStore((s) => s.deletedIds);
  const statusOverrides = useRowsStore((s) => s.statusOverrides);
  const added = useRowsStore((s) => s.added);
  const hidden = new Set([...archivedIds, ...deletedIds]);
  return [...CAMPAIGNS, ...added]
    .filter((c) => !hidden.has(c.id))
    .map((c) => (statusOverrides[c.id] ? { ...c, status: statusOverrides[c.id] } : c));
}

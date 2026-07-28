import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimelineKind = "activity" | "comment" | "bot";
export type TimelineFilter = "all" | "bot" | "comment" | "activity";

export type TimelineAuthor = {
  id: string;
  name: string;
  initials: string;
  role?: string;
};

export type TimelineEntry = {
  id: string;
  kind: TimelineKind;
  author: TimelineAuthor;
  body: string;
  at: string; // ISO
  parentId?: string;
};

export const CURRENT_USER: TimelineAuthor = {
  id: "you",
  name: "Rohit Bind",
  initials: "RB",
  role: "Editor",
};

const AAYUSH: TimelineAuthor = {
  id: "aayush",
  name: "Aayush Agarwal",
  initials: "AA",
  role: "Approver",
};

const SYSTEM: TimelineAuthor = {
  id: "system",
  name: "Wingify",
  initials: "W",
};

function seedEntries(): TimelineEntry[] {
  return [
    {
      id: "e1",
      kind: "activity",
      author: AAYUSH,
      body: "Show recording popup to returning visitors - only on insights pages - Variation 1 (ID: 2672) moved to Web Rollouts Variation 1",
      at: "2026-07-15T12:57:00.000Z",
    },
    {
      id: "e2",
      kind: "activity",
      author: AAYUSH,
      body: "Added learning (Not enough traffic to declare a winner yet)",
      at: "2026-07-14T16:22:00.000Z",
    },
    {
      id: "e3",
      kind: "activity",
      author: AAYUSH,
      body: "Campaign started",
      at: "2026-07-12T09:10:00.000Z",
    },
    {
      id: "e4",
      kind: "activity",
      author: AAYUSH,
      body: "Campaign changes approved",
      at: "2026-07-11T18:04:00.000Z",
    },
    {
      id: "e5",
      kind: "comment",
      author: AAYUSH,
      body: "Can we keep #Variation1 live through next week? @Rohit please confirm traffic split.",
      at: "2026-07-10T14:30:00.000Z",
    },
    {
      id: "e6",
      kind: "bot",
      author: SYSTEM,
      body: "Vitals alert: sample size is below the recommended threshold for #Revenue.",
      at: "2026-07-09T11:05:00.000Z",
    },
    {
      id: "e7",
      kind: "comment",
      author: CURRENT_USER,
      body: "Noted — I'll bump allocation to 50/50 tomorrow morning.",
      at: "2026-07-10T15:12:00.000Z",
      parentId: "e5",
    },
  ];
}

type CampaignTimelineSlice = {
  entries: TimelineEntry[];
  filter: TimelineFilter;
  /** Main composer draft — survives panel close / remount. */
  draft: string;
};

type ActivityTimelineState = {
  byCampaign: Record<string, CampaignTimelineSlice>;
  ensureCampaign: (campaignId: string) => void;
  setFilter: (campaignId: string, filter: TimelineFilter) => void;
  setDraft: (campaignId: string, draft: string) => void;
  addComment: (campaignId: string, body: string, parentId?: string) => void;
  resetCampaign: (campaignId: string) => void;
};

let idSeq = 100;
const uid = () => `tl-${(idSeq += 1)}`;

const EMPTY_SLICE: CampaignTimelineSlice = {
  entries: [],
  filter: "all",
  draft: "",
};

function freshSlice(): CampaignTimelineSlice {
  return { entries: seedEntries(), filter: "all", draft: "" };
}

export const useActivityTimelineStore = create<ActivityTimelineState>()(
  persist(
    (set, get) => ({
      byCampaign: {},

      ensureCampaign: (campaignId) => {
        if (!campaignId || get().byCampaign[campaignId]) return;
        set((s) => ({
          byCampaign: { ...s.byCampaign, [campaignId]: freshSlice() },
        }));
      },

      setFilter: (campaignId, filter) => {
        get().ensureCampaign(campaignId);
        set((s) => {
          const slice = s.byCampaign[campaignId] ?? freshSlice();
          return {
            byCampaign: {
              ...s.byCampaign,
              [campaignId]: { ...slice, filter },
            },
          };
        });
      },

      setDraft: (campaignId, draft) => {
        get().ensureCampaign(campaignId);
        set((s) => {
          const slice = s.byCampaign[campaignId] ?? freshSlice();
          return {
            byCampaign: {
              ...s.byCampaign,
              [campaignId]: { ...slice, draft },
            },
          };
        });
      },

      addComment: (campaignId, body, parentId) => {
        const text = body.trim();
        if (!text || !campaignId) return;
        get().ensureCampaign(campaignId);
        const entry: TimelineEntry = {
          id: uid(),
          kind: "comment",
          author: CURRENT_USER,
          body: text,
          at: new Date().toISOString(),
          parentId,
        };
        set((s) => {
          const slice = s.byCampaign[campaignId] ?? freshSlice();
          return {
            byCampaign: {
              ...s.byCampaign,
              [campaignId]: {
                ...slice,
                draft: parentId ? slice.draft : "",
                entries: [entry, ...slice.entries],
              },
            },
          };
        });
      },

      resetCampaign: (campaignId) =>
        set((s) => ({
          byCampaign: { ...s.byCampaign, [campaignId]: freshSlice() },
        })),
    }),
    {
      name: "wingify-activity-timeline",
      partialize: (s) => ({ byCampaign: s.byCampaign }),
    }
  )
);

export function useCampaignTimeline(
  campaignId: string | undefined
): CampaignTimelineSlice {
  return useActivityTimelineStore((s) =>
    campaignId ? s.byCampaign[campaignId] ?? EMPTY_SLICE : EMPTY_SLICE
  );
}

export function formatTimelineStamp(iso: string): string {
  const d = new Date(iso);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = d.getUTCDate();
  const mon = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${mon} ${year}, ${hh}:${mm}`;
}

export function kindLabel(kind: TimelineKind): string {
  switch (kind) {
    case "activity":
      return "Activity";
    case "comment":
      return "Comment";
    case "bot":
      return "Automation";
  }
}

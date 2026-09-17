/** Dummy boards/reports for Journey Analytics → Overview (+ shared detail). */

export type AnalyticsItemKind = "board" | "report";

export type AnalyticsOverviewItem = {
  id: string;
  /** Numeric id shown as #NNN in chrome / breadcrumb. */
  displayId: string;
  name: string;
  kind: AnalyticsItemKind;
  editedLabel: string;
  /** Longer “Last edited …” line on the detail header. */
  lastEditedDetail: string;
  createdBy: string;
  creatorInitials: string;
  starred: boolean;
  createdByMe: boolean;
  /** When set on a report, it lives inside this board (nested Report tab). */
  parentBoardId?: string;
};

export const ANALYTICS_RECENT: AnalyticsOverviewItem[] = [
  {
    id: "r1",
    displayId: "412",
    name: "Test Board",
    kind: "board",
    editedLabel: "Edited 20 hours ago",
    lastEditedDetail: "Last edited 20 hours ago",
    createdBy: "Harshit",
    creatorInitials: "H",
    starred: true,
    createdByMe: false,
  },
  {
    id: "r2",
    displayId: "413",
    name: "Untitled board",
    kind: "board",
    editedLabel: "Edited 20 hours ago",
    lastEditedDetail: "Last edited 20 hours ago",
    createdBy: "Ravi S",
    creatorInitials: "RS",
    starred: true,
    createdByMe: true,
  },
  {
    id: "r3",
    displayId: "414",
    name: "Report with board",
    kind: "report",
    editedLabel: "Edited 20 hours ago",
    lastEditedDetail: "Last edited 20 hours ago",
    createdBy: "Ananya J",
    creatorInitials: "AJ",
    starred: false,
    createdByMe: false,
    parentBoardId: "r1",
  },
  {
    id: "r4",
    displayId: "415",
    name: "Report without board",
    kind: "report",
    editedLabel: "Edited 20 hours ago",
    lastEditedDetail: "Last edited 20 hours ago",
    createdBy: "Ananya J",
    creatorInitials: "AJ",
    starred: true,
    createdByMe: true,
  },
  {
    id: "r5",
    displayId: "416",
    name: "Conversion funnel",
    kind: "report",
    editedLabel: "Edited 18 hours ago",
    lastEditedDetail: "Last edited 18 hours ago",
    createdBy: "Harshit",
    creatorInitials: "H",
    starred: true,
    createdByMe: false,
    parentBoardId: "r1",
  },
  {
    id: "r5b",
    displayId: "418",
    name: "Audience overlap",
    kind: "report",
    editedLabel: "Edited 12 hours ago",
    lastEditedDetail: "Last edited 12 hours ago",
    createdBy: "Harshit",
    creatorInitials: "H",
    starred: false,
    createdByMe: false,
    parentBoardId: "r1",
  },
  {
    id: "r6",
    displayId: "417",
    name: "Sessions",
    kind: "report",
    editedLabel: "Edited 16 hours ago",
    lastEditedDetail: "Last edited 16 hours ago",
    createdBy: "Ravi S",
    creatorInitials: "RS",
    starred: false,
    createdByMe: true,
    parentBoardId: "r2",
  },
  {
    id: "r6b",
    displayId: "419",
    name: "Bounce",
    kind: "report",
    editedLabel: "Edited 14 hours ago",
    lastEditedDetail: "Last edited 14 hours ago",
    createdBy: "Ravi S",
    creatorInitials: "RS",
    starred: true,
    createdByMe: true,
    parentBoardId: "r2",
  },
  {
    id: "r6c",
    displayId: "420",
    name: "Paths",
    kind: "report",
    editedLabel: "Edited 10 hours ago",
    lastEditedDetail: "Last edited 10 hours ago",
    createdBy: "Ravi S",
    creatorInitials: "RS",
    starred: false,
    createdByMe: true,
    parentBoardId: "r2",
  },
];

export const ANALYTICS_LIBRARY: AnalyticsOverviewItem[] = [
  {
    id: "l1",
    displayId: "266",
    name: "Untitled board",
    kind: "board",
    editedLabel: "1 day ago",
    lastEditedDetail: "Last edited 1 day ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
  },
  {
    id: "l2",
    displayId: "267",
    name: "Untitled Report",
    kind: "report",
    editedLabel: "1 day ago",
    lastEditedDetail: "Last edited 1 day ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
    parentBoardId: "l1",
  },
  {
    id: "l2b",
    displayId: "269",
    name: "Goals",
    kind: "report",
    editedLabel: "1 day ago",
    lastEditedDetail: "Last edited 1 day ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l1",
  },
  {
    id: "l2c",
    displayId: "271",
    name: "Funnel",
    kind: "report",
    editedLabel: "1 day ago",
    lastEditedDetail: "Last edited 1 day ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l1",
  },
  {
    id: "l3",
    displayId: "266",
    name: "Board 266",
    kind: "board",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
  },
  {
    id: "l3r",
    displayId: "268",
    name: "Engagement",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l3",
  },
  {
    id: "l3r2",
    displayId: "270",
    name: "Drop-off",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
    parentBoardId: "l3",
  },
  {
    id: "l3r3",
    displayId: "272",
    name: "Funnel",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l3",
  },
  {
    id: "l4",
    displayId: "302",
    name: "Board 302",
    kind: "board",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
  },
  {
    id: "l4r",
    displayId: "307",
    name: "Revenue",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
    parentBoardId: "l4",
  },
  {
    id: "l4r2",
    displayId: "308",
    name: "AOV",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l4",
  },
  {
    id: "l4r3",
    displayId: "310",
    name: "Funnel",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l4",
  },
  {
    id: "l5",
    displayId: "303",
    name: "Board 303",
    kind: "board",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
  },
  {
    id: "l5r",
    displayId: "306",
    name: "Retention",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l5",
  },
  {
    id: "l5r2",
    displayId: "309",
    name: "Cohorts",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: true,
    createdByMe: true,
    parentBoardId: "l5",
  },
  {
    id: "l5r3",
    displayId: "311",
    name: "Funnel",
    kind: "report",
    editedLabel: "1 month ago",
    lastEditedDetail: "Last edited 1 month ago",
    createdBy: "Vikas G",
    creatorInitials: "VG",
    starred: false,
    createdByMe: true,
    parentBoardId: "l5",
  },
];

/** Deduped list for breadcrumb / switchers (recent first, then library-only). */
export const ANALYTICS_ITEMS: AnalyticsOverviewItem[] = (() => {
  const seen = new Set<string>();
  const out: AnalyticsOverviewItem[] = [];
  for (const item of [...ANALYTICS_RECENT, ...ANALYTICS_LIBRARY]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    out.push(item);
  }
  return out;
})();

const BY_ID = new Map<string, AnalyticsOverviewItem>(
  ANALYTICS_ITEMS.map((item) => [item.id, item])
);

export function getAnalyticsItem(id: string): AnalyticsOverviewItem | undefined {
  return BY_ID.get(id);
}

/** Apply session name overrides onto a static analytics item. */
export function withAnalyticsNameOverride(
  item: AnalyticsOverviewItem,
  overrides: Record<string, string>
): AnalyticsOverviewItem {
  const name = overrides[item.id];
  return name && name !== item.name ? { ...item, name } : item;
}

export function mapAnalyticsNameOverrides<T extends AnalyticsOverviewItem>(
  items: T[],
  overrides: Record<string, string>
): T[] {
  if (Object.keys(overrides).length === 0) return items;
  return items.map((item) => withAnalyticsNameOverride(item, overrides) as T);
}

/** Parent board when this report is nested inside a board. */
export function getAnalyticsParentBoard(
  item: AnalyticsOverviewItem | undefined
): AnalyticsOverviewItem | undefined {
  if (!item?.parentBoardId) return undefined;
  const parent = BY_ID.get(item.parentBoardId);
  return parent?.kind === "board" ? parent : undefined;
}

/** Reports that belong to a board (empty for boards with none / non-boards). */
export function getReportsForBoard(
  boardId: string
): AnalyticsOverviewItem[] {
  return ANALYTICS_ITEMS.filter(
    (item) => item.kind === "report" && item.parentBoardId === boardId
  );
}

/**
 * Maps board charts → linked reports (index order).
 * 0 traffic line, 1 traffic mix donut, 2 funnel bars.
 */
export function getBoardChartReportIds(boardId: string): {
  traffic: string | undefined;
  mix: string | undefined;
  funnel: string | undefined;
} {
  const reports = getReportsForBoard(boardId);
  return {
    traffic: reports[0]?.id,
    mix: reports[1]?.id,
    funnel: reports[2]?.id,
  };
}

/** Sibling reports under the same board, or standalone reports when unlinked. */
export function getRelatedReports(
  item: AnalyticsOverviewItem | undefined
): AnalyticsOverviewItem[] {
  if (!item || item.kind !== "report") return [];
  if (item.parentBoardId) {
    return getReportsForBoard(item.parentBoardId);
  }
  return ANALYTICS_ITEMS.filter(
    (row) => row.kind === "report" && !row.parentBoardId
  );
}

/** Whether the secondary nav should include the Board segment.
 *  Board pages always show it; reports only when opened via board context. */
export function analyticsShowsBoardCrumb(
  item: AnalyticsOverviewItem | undefined,
  boardContextId?: string | null
): boolean {
  if (!item) return false;
  if (item.kind === "board") return true;
  if (item.kind !== "report" || !boardContextId) return false;
  return item.parentBoardId === boardContextId;
}

export const ANALYTICS_OVERVIEW_BASE = "/analytics/overview";
export const ANALYTICS_BROWSE_BASE = "/analytics/browse";

export function isAnalyticsListBase(path: string): boolean {
  return path === ANALYTICS_OVERVIEW_BASE || path === ANALYTICS_BROWSE_BASE;
}

export function analyticsListLabel(basePath: string): string {
  return basePath === ANALYTICS_BROWSE_BASE ? "Browse" : "Overview";
}

/** Resolve overview vs browse list base from a detail (or list) pathname. */
export function analyticsBaseFromPath(pathname: string): string {
  if (
    pathname === ANALYTICS_BROWSE_BASE ||
    pathname.startsWith(`${ANALYTICS_BROWSE_BASE}/`)
  ) {
    return ANALYTICS_BROWSE_BASE;
  }
  return ANALYTICS_OVERVIEW_BASE;
}

/** Detail path; pass `boardId` when opening a report from a board (crumb context). */
export function analyticsItemPath(
  id: string,
  opts?: { boardId?: string; basePath?: string }
): string {
  const listBase = opts?.basePath ?? ANALYTICS_OVERVIEW_BASE;
  const base = `${listBase}/c/${id}`;
  if (!opts?.boardId) return base;
  return `${base}?board=${encodeURIComponent(opts.boardId)}`;
}

/**
 * Navigate to a report while preserving board crumb only if the report
 * still belongs to the active board context.
 */
export function analyticsReportNavPath(
  reportId: string,
  boardContextId: string | undefined | null,
  basePath?: string
): string {
  const report = getAnalyticsItem(reportId);
  if (
    boardContextId &&
    report?.kind === "report" &&
    report.parentBoardId === boardContextId
  ) {
    return analyticsItemPath(reportId, { boardId: boardContextId, basePath });
  }
  return analyticsItemPath(reportId, { basePath });
}

export function firstAnalyticsItemOfKind(
  kind: AnalyticsItemKind
): AnalyticsOverviewItem | undefined {
  return ANALYTICS_ITEMS.find((item) => item.kind === kind);
}

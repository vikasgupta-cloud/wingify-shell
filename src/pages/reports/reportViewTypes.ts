export type ResultsLayout = "table-first" | "graphs-first";
export type ResultsGraphDefault = "date-range" | "expected-improvement";

export type ResultsTableColumnId =
  | "unique-conversions"
  | "total-visitors"
  | "expected-improvement"
  | "probability"
  | "conversion-rate"
  | "revenue-per-visitor";

export const RESULTS_TABLE_COLUMN_IDS: ResultsTableColumnId[] = [
  "unique-conversions",
  "total-visitors",
  "expected-improvement",
  "probability",
  "conversion-rate",
  "revenue-per-visitor",
];

export const DEFAULT_RESULTS_TABLE_COLUMNS: ResultsTableColumnId[] = [
  "unique-conversions",
  "total-visitors",
  "expected-improvement",
  "probability",
];

const RESULTS_TABLE_COLUMN_ID_SET = new Set<string>(RESULTS_TABLE_COLUMN_IDS);

export function sanitizeResultsTableColumns(
  value: unknown,
  fallback: ResultsTableColumnId[] = DEFAULT_RESULTS_TABLE_COLUMNS
): ResultsTableColumnId[] {
  if (!Array.isArray(value)) return [...fallback];
  const filtered = value.filter(
    (id): id is ResultsTableColumnId =>
      typeof id === "string" &&
      RESULTS_TABLE_COLUMN_ID_SET.has(id)
  );
  return filtered.length > 0 ? filtered : [...fallback];
}

export type ReportViewSettings = {
  layout: ResultsLayout;
  defaultGraph: ResultsGraphDefault;
  showExpectedConversionRateRange: boolean;
  showExpectedImprovementRange: boolean;
  showTotalRow: boolean;
  showDisabledVariationRows: boolean;
  resultsTableColumns: ResultsTableColumnId[];
};

export const DEFAULT_REPORT_VIEW_SETTINGS: ReportViewSettings = {
  layout: "table-first",
  defaultGraph: "date-range",
  showExpectedConversionRateRange: true,
  showExpectedImprovementRange: true,
  showTotalRow: true,
  showDisabledVariationRows: true,
  resultsTableColumns: [...DEFAULT_RESULTS_TABLE_COLUMNS],
};

export const REPORT_PRESET_IDS = {
  visitors: "raw-visitors",
  sessions: "raw-sessions",
  statistics: "statistics",
} as const;

export type ReportPresetId =
  (typeof REPORT_PRESET_IDS)[keyof typeof REPORT_PRESET_IDS];

export const REPORT_PRESET_TABS: { id: ReportPresetId; label: string }[] = [
  { id: REPORT_PRESET_IDS.visitors, label: "Raw data (visitors)" },
  { id: REPORT_PRESET_IDS.sessions, label: "Raw data (sessions)" },
  { id: REPORT_PRESET_IDS.statistics, label: "Statistics" },
];

export function reportPresetLabel(id: ReportPresetId): string {
  return REPORT_PRESET_TABS.find((t) => t.id === id)?.label ?? id;
}

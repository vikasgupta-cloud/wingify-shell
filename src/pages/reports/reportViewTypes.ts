export type ResultsLayout = "table-first" | "graphs-first";
export type ResultsGraphDefault =
  | "date-range"
  | "expected-conversion-rate"
  | "expected-improvement";
export type ResultsRowDensity = "compact" | "default" | "comfortable";

export type ResultsTableColumnId =
  | "unique-conversions"
  | "total-visitors"
  | "expected-improvement"
  | "probability"
  | "conversion-rate"
  | "revenue-per-visitor"
  | "conversions-per-visitor"
  | "conversions-per-visitor-improvement"
  | "conversion-gain"
  | "traffic-split"
  | "total-conversions-sessions"
  | "sessions"
  | "conversion-rate-sessions"
  | "improvement-sessions";

export const RESULTS_TABLE_COLUMN_IDS: ResultsTableColumnId[] = [
  "total-visitors",
  "unique-conversions",
  "conversion-rate",
  "expected-improvement",
  "conversions-per-visitor",
  "conversions-per-visitor-improvement",
  "conversion-gain",
  "traffic-split",
  "total-conversions-sessions",
  "sessions",
  "conversion-rate-sessions",
  "probability",
  "improvement-sessions",
  "revenue-per-visitor",
];

export const DEFAULT_RESULTS_TABLE_COLUMNS: ResultsTableColumnId[] = [
  "total-visitors",
  "unique-conversions",
  "conversion-rate",
  "expected-improvement",
  "conversions-per-visitor",
  "conversions-per-visitor-improvement",
];

const RESULTS_TABLE_COLUMN_ID_SET = new Set<string>(RESULTS_TABLE_COLUMN_IDS);

const RESULTS_ROW_DENSITY_SET = new Set<string>([
  "compact",
  "default",
  "comfortable",
]);

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

export function sanitizeResultsRowDensity(
  value: unknown,
  fallback: ResultsRowDensity = "default"
): ResultsRowDensity {
  return typeof value === "string" && RESULTS_ROW_DENSITY_SET.has(value)
    ? (value as ResultsRowDensity)
    : fallback;
}

export type ReportViewSettings = {
  layout: ResultsLayout;
  defaultGraph: ResultsGraphDefault;
  showExpectedConversionRateRange: boolean;
  showExpectedImprovementRange: boolean;
  showTotalRow: boolean;
  showDisabledVariationRows: boolean;
  resultsTableColumns: ResultsTableColumnId[];
  rowDensity: ResultsRowDensity;
};

export const DEFAULT_REPORT_VIEW_SETTINGS: ReportViewSettings = {
  layout: "table-first",
  defaultGraph: "date-range",
  showExpectedConversionRateRange: true,
  showExpectedImprovementRange: true,
  showTotalRow: true,
  showDisabledVariationRows: true,
  resultsTableColumns: [...DEFAULT_RESULTS_TABLE_COLUMNS],
  rowDensity: "default",
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

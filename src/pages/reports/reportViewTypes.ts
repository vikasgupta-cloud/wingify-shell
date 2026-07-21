export type ResultsLayout = "table-first" | "graphs-first";
export type ResultsGraphDefault = "date-range" | "expected-improvement";

export type ReportViewSettings = {
  layout: ResultsLayout;
  defaultGraph: ResultsGraphDefault;
  showExpectedConversionRateRange: boolean;
  showExpectedImprovementRange: boolean;
  showTotalRow: boolean;
  showDisabledVariationRows: boolean;
};

export const DEFAULT_REPORT_VIEW_SETTINGS: ReportViewSettings = {
  layout: "table-first",
  defaultGraph: "date-range",
  showExpectedConversionRateRange: true,
  showExpectedImprovementRange: true,
  showTotalRow: true,
  showDisabledVariationRows: true,
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

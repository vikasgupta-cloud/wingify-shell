import type { ReportDateRange } from "../../store/reportViews";

export type ReportFilterContext = {
  segments: string[];
  dimensions: string[];
  dateRange: ReportDateRange;
};

function daysInclusive(from: string, to: string): number {
  const a = Date.parse(`${from}T00:00:00Z`);
  const b = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return 23;
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1);
}

/** Scales visitor/conversion totals when filters narrow the audience or date span. */
export function reportVisitorScale(ctx: ReportFilterContext): number {
  const seg = 1 - Math.min(ctx.segments.length, 6) * 0.065;
  const dim = 1 - Math.min(ctx.dimensions.length, 4) * 0.05;
  const days = daysInclusive(ctx.dateRange.from, ctx.dateRange.to);
  const range = Math.min(1, Math.max(0.35, days / 23));
  return Math.max(0.22, seg * dim * range);
}

export function filterMetricSeedSuffix(ctx: ReportFilterContext): string {
  return `${ctx.dateRange.id}:${ctx.segments.join("|")}:${ctx.dimensions.join("|")}`;
}

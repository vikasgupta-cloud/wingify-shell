import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Columns2,
  Files,
  GitBranch,
  Grid2x2,
  Info,
  MousePointerClick,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  hasReport,
  type Campaign,
  type CampaignType,
  type Variant,
} from "../../data/campaigns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { cn } from "../../lib/utils";
import { useQuickViewStore } from "../../store/quickView";
import { useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState } from "../../store/views";
import { useTableStore } from "../../store/table";
import { sortCampaigns } from "../table/CampaignTable";
import StatusMenu from "../ui/StatusMenu";

const TYPE_ICONS: Record<CampaignType, LucideIcon> = {
  "A/B": Columns2,
  MVT: Grid2x2,
  "Split URL": GitBranch,
  Multipage: Files,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (isoDate: string | null) => {
  if (!isoDate) return "—";
  const d = new Date(isoDate);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
const formatNumber = (n: number) => n.toLocaleString("en-US");
const formatUplift = (n: number) => `${n >= 0 ? "+" : ""}${n}%`;

const NAV_BUTTON =
  "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";
const METRIC_LINK = "inline-flex items-center gap-1 text-foreground underline decoration-muted-foreground/40 underline-offset-2";

function ConclusionStat({
  label,
  achieved,
  rest,
  info,
}: {
  label: string;
  achieved: string;
  rest: string;
  info?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {label}
        {/* TODO: wire up conversions info tooltip */}
        {info && <Info className="h-3 w-3 shrink-0" aria-hidden />}
      </div>
      <div className="mt-1 truncate tabular-nums">
        <span className="text-lg font-semibold text-foreground">{achieved}</span>{" "}
        <span className="text-sm text-muted-foreground">{rest}</span>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function ConclusionCard({ campaign }: { campaign: Campaign }) {
  const r = campaign.report;
  const title =
    campaign.status === "Ended"
      ? "Ended without a conclusion"
      : `Conclusion in ${r.requiredDays - r.elapsedDays} days`;
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="text-xl font-semibold text-foreground">{title}</div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {campaign.startedOn && <span>Started on : {formatDate(campaign.startedOn)}</span>}
        {r.estimatedEndDate && (
          <span>Estimated end date : {formatDate(r.estimatedEndDate)}</span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <ConclusionStat
          label="Duration"
          achieved={`${r.elapsedDays}`}
          rest={`/ ${r.requiredDays} days`}
        />
        <ConclusionStat
          label="Unique visitors"
          achieved={formatNumber(campaign.visitors)}
          rest={`/ ${formatNumber(r.requiredVisitors)} required`}
        />
        <ConclusionStat
          label="Conversions"
          info
          achieved={formatNumber(campaign.uniqueConversions)}
          rest={`/ ${formatNumber(r.requiredConversions)} required`}
        />
      </div>
    </div>
  );
}

function ResultsCard({ campaign }: { campaign: Campaign }) {
  const r = campaign.report;
  const dec = campaign.decision;
  // The best variant is the one flagged isBest; for Inconclusive none is, so fall
  // back to the variation with the highest confidence.
  const best: Variant =
    r.variants.find((v) => v.isBest) ??
    [...r.variants]
      .filter((v) => v.confidence !== null)
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))[0] ??
    r.variants[0];

  const confidence = best.confidence;
  const uplift = best.uplift;

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
          {best.label}
        </span>
        <span className="text-base font-medium text-foreground">{best.name}</span>
        {(dec === "Winner" || dec === "Baseline") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-fg/10 px-2 py-0.5 text-xs font-medium text-success-fg">
            <Award className="h-3 w-3" />
            Best performer
          </span>
        )}
      </div>
      {dec === "Inconclusive" && (
        <div className="text-sm text-muted-foreground">No clear winner</div>
      )}

      {/* Primary metric */}
      <div>
        <div className="text-sm text-muted-foreground">Primary metric</div>
        {/* TODO: wire up primary metric link */}
        <button type="button" className={cn("mt-1", METRIC_LINK)}>
          <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
          {campaign.primaryMetric}
        </button>
      </div>

      {/* Uplift */}
      <div>
        <div className="text-sm text-muted-foreground">Uplift</div>
        {uplift === null ? (
          <div className="text-2xl font-semibold text-muted-foreground">No improvement</div>
        ) : (
          <div
            className={cn(
              "text-2xl font-semibold tabular-nums",
              uplift >= 0 ? "text-success-fg" : "text-danger-fg"
            )}
          >
            {formatUplift(uplift)}
          </div>
        )}
      </div>

      {/* Confidence */}
      <div>
        <div className="text-sm text-muted-foreground">Confidence</div>
        <div className="mt-1 flex items-center gap-3">
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums",
              (confidence ?? 0) >= 95 ? "text-success-fg" : "text-foreground"
            )}
          >
            {confidence === null ? "—" : `${confidence}%`}
          </span>
          <div className="flex-1">
            <div className="relative h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-success-fg"
                style={{ width: `${confidence ?? 0}%` }}
              />
              {/* 95% significance marker */}
              <div
                className="absolute top-0 h-2 w-px bg-foreground"
                style={{ left: "95%" }}
                aria-hidden
              />
            </div>
            <div className="relative mt-1 h-3">
              <span
                className="absolute -translate-x-1/2 text-[10px] tabular-nums text-muted-foreground"
                style={{ left: "95%" }}
              >
                95%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Other metrics */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Performance in other Metrics</span>
          <span className="text-sm text-muted-foreground">Uplift</span>
        </div>
        <div className="mt-2 space-y-2">
          {r.otherMetrics.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
                {/* TODO: wire up metric link */}
                <button type="button" className={cn("min-w-0", METRIC_LINK)}>
                  <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{m.name}</span>
                </button>
              </span>
              {m.uplift === null ? (
                <span className="shrink-0 text-sm text-muted-foreground">No improvement</span>
              ) : (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-0.5 text-sm font-medium tabular-nums",
                    m.uplift >= 0 ? "text-success-fg" : "text-danger-fg"
                  )}
                >
                  {formatUplift(m.uplift)}
                  {m.uplift >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function QuickViewPanel() {
  const openId = useQuickViewStore((s) => s.openId);
  const close = useQuickViewStore((s) => s.close);
  const setId = useQuickViewStore((s) => s.setId);

  const campaigns = useVisibleCampaigns();
  const { filters, sort, groupBy, layout } = useActiveViewState();
  const { search, page, pageSize } = useTableStore();

  // The current filtered + sorted + (where applicable) paginated list, in the same
  // display order the active layout shows, so the footer chevrons walk it exactly.
  const orderedIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = applyFilters(campaigns, filters);
    if (q) {
      rows = rows.filter(
        (c) => c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q)
      );
    }
    rows = sortCampaigns(rows, sort);
    if (groupBy !== null) {
      rows = groupRows(rows, groupBy).flatMap((g) => g.rows);
    } else if (layout !== "kanban") {
      const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
      const currentPage = Math.min(page, totalPages);
      rows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    }
    return rows.map((r) => r.id);
  }, [campaigns, filters, search, sort, groupBy, layout, page, pageSize]);

  const campaign = campaigns.find((c) => c.id === openId) ?? null;

  // If the open campaign disappears (deleted), close the panel.
  useEffect(() => {
    if (openId && !campaign) close();
  }, [openId, campaign, close]);

  if (!openId || !campaign) return null;

  const idx = orderedIds.indexOf(campaign.id);
  const prevId = idx > 0 ? orderedIds[idx - 1] : null;
  const nextId = idx >= 0 && idx < orderedIds.length - 1 ? orderedIds[idx + 1] : null;

  const TypeIcon = TYPE_ICONS[campaign.type];
  const r = campaign.report;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-4">
        <TypeIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-label={campaign.type} />
        <span
          title={campaign.name}
          className="min-w-0 flex-1 truncate text-base font-medium text-foreground"
        >
          {campaign.name}
        </span>
        <StatusMenu campaign={campaign} />
        <button
          type="button"
          onClick={close}
          title="Close"
          aria-label="Close quick view"
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {!hasReport(campaign.status) ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No report data yet.
          </div>
        ) : (
          <div className="space-y-6">
            {/* A) Top card — conclusion or results, by decision */}
            {campaign.decision === "No decision" ? (
              <ConclusionCard campaign={campaign} />
            ) : (
              <ResultsCard campaign={campaign} />
            )}

            {/* TODO variants section — next prompt */}

            {/* B) Section label */}
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Experiment context
            </div>

            {/* C) Hypothesis */}
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium text-foreground">Hypothesis</div>
              <p className="mt-2 text-sm text-foreground">
                <span className="text-muted-foreground">I expect</span> that {campaign.hypothesis}
              </p>
              <p className="mt-2 text-sm text-foreground">
                <span className="text-muted-foreground">will address</span> {campaign.addresses}
              </p>
              {/* TODO: wire up View details */}
              <button type="button" className="mt-3 text-sm font-medium text-foreground underline">
                View details
              </button>
            </div>

            {/* D) Campaign details */}
            <div className="rounded-lg border border-border p-4">
              <div className="text-sm font-medium text-foreground">Campaign details</div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                <Detail label="Variants" value={String(campaign.variations)} />
                <Detail label="Traffic" value={`${r.traffic}%`} />
                <Detail label="Traffic split" value={r.trafficSplit} />
                <Detail label="Audience" value={r.audience} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-6 py-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => prevId && setId(prevId)}
            disabled={!prevId}
            title="Previous campaign"
            aria-label="Previous campaign"
            className={NAV_BUTTON}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => nextId && setId(nextId)}
            disabled={!nextId}
            title="Next campaign"
            aria-label="Next campaign"
            className={NAV_BUTTON}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <Link
          to={`/web-experiment/c/${campaign.id}/reports`}
          className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          View detailed report
        </Link>
      </div>
    </div>
  );
}

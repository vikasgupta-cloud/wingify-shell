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
  allVariationsDisabled,
  campaignBestVariant,
  campaignBestVariantIndex,
  COLLECT_MIN_CONVERSIONS,
  COLLECT_MIN_VISITORS,
  conclusionKind,
  hasDeclaredWinner,
  reportFiltersActive,
  variationCollecting,
} from "../../data/campaignConclusion";
import { conclusionCopy } from "../../data/conclusionCopy";
import ConclusionStateIcon from "../reports/ConclusionStateIcon";
import type { ReportFilterContext } from "../../pages/reports/reportFilters";
import {
  hasReport,
  type Campaign,
  type CampaignType,
} from "../../data/campaigns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { Button } from "@/components/ui/button";
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
  "h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40";
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

/** Quick view applies no segment/dimension filters of its own. */
const QUICKVIEW_FILTERS: ReportFilterContext = {
  segments: [],
  dimensions: [],
  dateRange: { id: "campaign", label: "", from: "", to: "" },
};

/** Animated-dots "Collecting data" inline glyph, reusing the shared icon. */
function CollectingInline() {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <ConclusionStateIcon kind="collecting" size={14} />
      <span className="text-sm">Collecting data</span>
    </span>
  );
}

/** Grayscale info card for the report-only override states. */
function InfoCard({ body }: { body: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

/** Header shared by collecting / progress cards — state icon + map title. */
function StateCardHeader({
  kind,
  title,
  body,
}: {
  kind: "collecting" | "progress";
  title?: string;
  body: string;
}) {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <ConclusionStateIcon kind={kind} size={18} />
        <div className="text-xl font-semibold text-foreground">{title}</div>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </>
  );
}

function CollectingCard({ campaign }: { campaign: Campaign }) {
  const r = campaign.report;
  const { title, body } = conclusionCopy("collecting");
  return (
    <div className="rounded-lg border border-border p-4">
      <StateCardHeader kind="collecting" title={title} body={body} />
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
          rest={r.elapsedDays === 1 ? "day" : "days"}
        />
        <ConclusionStat
          label="Minimum unique visitors"
          achieved={formatNumber(campaign.visitors)}
          rest={`/ ${formatNumber(COLLECT_MIN_VISITORS)}`}
        />
        <ConclusionStat
          label="Minimum conversions"
          info
          achieved={formatNumber(campaign.uniqueConversions)}
          rest={`/ ${formatNumber(COLLECT_MIN_CONVERSIONS)}`}
        />
      </div>
    </div>
  );
}

function ProgressCard({ campaign }: { campaign: Campaign }) {
  const r = campaign.report;
  const remainingDays = Math.max(0, r.requiredDays - r.elapsedDays);
  const { title, body } = conclusionCopy("progress", { days: remainingDays });
  return (
    <div className="rounded-lg border border-border p-4">
      <StateCardHeader kind="progress" title={title} body={body} />
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

function DecidedCard({
  campaign,
  kind,
}: {
  campaign: Campaign;
  kind: "winner" | "baseline" | "inconclusive";
}) {
  const r = campaign.report;
  const best = campaignBestVariant(campaign);
  const control = r.variants[0]!;
  const bestCollecting = variationCollecting(campaign, campaignBestVariantIndex(campaign));

  const { title, body } = conclusionCopy(kind, {
    variation: best.name,
    control: control.name,
  });

  const confidence = best.confidence;
  const uplift = best.uplift;
  const isWinner = kind === "winner";

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      {/* State header — map copy + shared icon */}
      <div className="flex items-start gap-2.5">
        <ConclusionStateIcon kind={kind} size={18} />
        <div className="min-w-0 space-y-1">
          <div className="text-base font-semibold text-foreground">{title}</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>

      {/* Best/pick variant row — winner is the only one with the badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground">
          {best.label}
        </span>
        <span className="text-base font-medium text-foreground">{best.name}</span>
        {isWinner && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-fg/10 px-2 py-0.5 text-xs font-medium text-success-fg">
            <Award className="h-3 w-3" />
            Best performer
          </span>
        )}
      </div>

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
        {bestCollecting ? (
          <div className="mt-1">
            <CollectingInline />
          </div>
        ) : uplift === null ? (
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
        {bestCollecting ? (
          <div className="mt-1">
            <CollectingInline />
          </div>
        ) : (
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
        )}
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

/**
 * Top card — mirrors the report banner precedence exactly:
 * allDisabled > filtersActive > conclusion.kind. Quick view applies no filters,
 * so filtersActive is wired through the same helper but is effectively false.
 */
function ConclusionStateCard({ campaign }: { campaign: Campaign }) {
  if (allVariationsDisabled(campaign)) {
    return <InfoCard body={conclusionCopy("allDisabled").body} />;
  }
  if (reportFiltersActive(QUICKVIEW_FILTERS)) {
    return <InfoCard body={conclusionCopy("filtersApplied").body} />;
  }
  const kind = conclusionKind(campaign);
  if (kind === "collecting") return <CollectingCard campaign={campaign} />;
  if (kind === "progress") return <ProgressCard campaign={campaign} />;
  return <DecidedCard campaign={campaign} kind={kind} />;
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
    // flex-1 min-h-0 so the panel fills its sticky wrapper up to the wrapper's
    // max-height; when content exceeds it, only the body scrolls.
    <div className="flex min-h-0 flex-1 animate-fade-in-up flex-col bg-background duration-200">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <TypeIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={campaign.type} />
        <span
          title={campaign.name}
          className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
        >
          {campaign.name}
        </span>
        <StatusMenu campaign={campaign} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={close}
          title="Close"
          aria-label="Close quick view"
          className="h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {!hasReport(campaign.status) ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No report data yet.
          </div>
        ) : (
          <div className="space-y-6">
            {/* A) Top card — kind-driven, mirrors report banner precedence */}
            <ConclusionStateCard campaign={campaign} />

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
      <div className="flex shrink-0 items-center justify-between border-t border-border bg-background px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => prevId && setId(prevId)}
            disabled={!prevId}
            title="Previous campaign"
            aria-label="Previous campaign"
            className={NAV_BUTTON}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => nextId && setId(nextId)}
            disabled={!nextId}
            title="Next campaign"
            aria-label="Next campaign"
            className={NAV_BUTTON}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button asChild className="h-auto px-3 py-1.5 shadow-none">
          <Link to={`/web-experiment/c/${campaign.id}/reports`}>
            View detailed report
          </Link>
        </Button>
      </div>
    </div>
  );
}

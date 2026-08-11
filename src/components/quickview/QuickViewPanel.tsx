import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  ChevronLeft,
  ChevronRight,
  Info,
  MousePointerClick,
  X,
} from "@/components/icons/protoLucide";
import {
  allVariationsDisabled,
  campaignBestVariant,
  campaignBestVariantIndex,
  COLLECT_MIN_CONVERSIONS,
  COLLECT_MIN_VISITORS,
  conclusionKind,
  reportFiltersActive,
  variationCollecting,
} from "../../data/campaignConclusion";
import { conclusionCopy } from "../../data/conclusionCopy";
import ConclusionStateIcon from "../reports/ConclusionStateIcon";
import ReportsEmptyState from "../reports/ReportsEmptyState";
import {
  previewHero,
  StatTile,
  UpliftPill,
  VariantChip,
  WebpagePreview,
} from "../reports/variationCard";
import type { ReportFilterContext } from "../../pages/reports/reportFilters";
import {
  variantConversionsAllocated,
  variantVisitors,
} from "../../pages/reports/reportMetrics";
import {
  hasReport,
  type Campaign,
  type Variant,
} from "../../data/campaigns";
import { applyFilters } from "../../config/filters";
import { groupRows } from "../../config/grouping";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "../../lib/utils";
import { useQuickViewStore } from "../../store/quickView";
import { useVisibleCampaigns } from "../../store/rows";
import { useActiveViewState } from "../../store/views";
import { useTableStore } from "../../store/table";
import { TYPE_ICONS } from "../icons/campaignTypeIcons";
import { sortCampaigns } from "../table/CampaignTable";
import StatusMenu from "../ui/StatusMenu";

const formatNumber = (n: number) => n.toLocaleString("en-US");
const formatUplift = (n: number) => `${n >= 0 ? "+" : ""}${n}%`;
const formatStartDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const NAV_BUTTON =
  "h-auto w-auto p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-40";
const METRIC_LINK = "inline-flex items-center gap-1 text-foreground underline decoration-muted-foreground/40 underline-offset-2";

/** Completion percent of a value against its target (clamped 0–100). */
function pctOf(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

function ConclusionStat({
  label,
  achieved,
  rest,
  info,
  pct,
}: {
  label: string;
  achieved: string;
  rest: string;
  info?: boolean;
  pct?: number;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="flex items-center gap-1 text-[11px] leading-tight text-muted-foreground">
        <span className="truncate">{label}</span>
        {/* TODO: wire up conversions info tooltip */}
        {info && <Info className="h-3 w-3 shrink-0" aria-hidden />}
      </div>
      <div className="mt-1.5 flex min-w-0 items-baseline gap-1 tabular-nums">
        <span className="truncate text-lg font-semibold leading-none text-foreground">
          {achieved}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">{rest}</span>
      </div>
      {pct !== undefined && (
        // mt-auto pins the bar to the card bottom so bars line up across cards.
        <div className="mt-auto pt-2.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
            <div
              className="h-full rounded-full bg-foreground/70 transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
            />
          </div>
        </div>
      )}
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
}: {
  kind: "collecting" | "progress";
  title?: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <ConclusionStateIcon kind={kind} size={18} />
      <div className="text-xl font-semibold text-foreground">{title}</div>
    </div>
  );
}

function CollectingCard({ campaign }: { campaign: Campaign }) {
  const r = campaign.report;
  const { title } = conclusionCopy("collecting");
  return (
    <div className="rounded-lg border border-border p-4">
      <StateCardHeader kind="collecting" title={title} />
      <div className="mt-4 grid grid-cols-3 gap-2">
        <ConclusionStat
          label="Duration"
          achieved={`${r.elapsedDays}`}
          rest={r.elapsedDays === 1 ? "day" : "days"}
        />
        <ConclusionStat
          label="Min. unique visitors"
          achieved={formatNumber(campaign.visitors)}
          rest={`/ ${formatNumber(COLLECT_MIN_VISITORS)}`}
          pct={pctOf(campaign.visitors, COLLECT_MIN_VISITORS)}
        />
        <ConclusionStat
          label="Min. conversions"
          info
          achieved={formatNumber(campaign.uniqueConversions)}
          rest={`/ ${formatNumber(COLLECT_MIN_CONVERSIONS)}`}
          pct={pctOf(campaign.uniqueConversions, COLLECT_MIN_CONVERSIONS)}
        />
      </div>
    </div>
  );
}

function ProgressCard({ campaign }: { campaign: Campaign }) {
  const r = campaign.report;
  const remainingDays = Math.max(0, r.requiredDays - r.elapsedDays);
  const daysLabel = remainingDays === 1 ? "1 day" : `${remainingDays} days`;

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center gap-2.5">
        <ConclusionStateIcon kind="progress" size={18} />
        <div className="text-xl font-semibold text-foreground">
          Conclusion in{" "}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="underline decoration-muted-foreground/50 decoration-dotted underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {daysLabel}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="start"
                className="border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-md"
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium tabular-nums text-foreground">
                      {r.elapsedDays} / {r.requiredDays} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium text-foreground">
                      {formatStartDate(campaign.startedOn)}
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <ConclusionStat
          label="Unique visitors"
          achieved={formatNumber(campaign.visitors)}
          rest={`/ ${formatNumber(r.requiredVisitors)}`}
          pct={pctOf(campaign.visitors, r.requiredVisitors)}
        />
        <ConclusionStat
          label="Conversions"
          info
          achieved={formatNumber(campaign.uniqueConversions)}
          rest={`/ ${formatNumber(r.requiredConversions)}`}
          pct={pctOf(campaign.uniqueConversions, r.requiredConversions)}
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

/** Per-variation snapshot so you can see which one is ahead on the primary metric. */
function VariationsCard({ campaign }: { campaign: Campaign }) {
  const variants = campaign.report.variants;
  const bestId = campaignBestVariant(campaign).id;
  const control = variants[0];

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-sm font-medium text-foreground">Variations</div>
        <div className="truncate text-xs text-muted-foreground">
          {campaign.primaryMetric}
        </div>
      </div>

      {/* Same comparison as the reports Overview, scrolled sideways. Nested
          flex keeps start/end padding visible (padding on the overflow node
          itself is unreliable with snap scrolling). */}
      <div className="-mx-6 mt-3 overflow-x-auto overscroll-x-contain pb-2">
        <div className="flex w-max snap-x snap-mandatory gap-3 px-6">
          {variants.map((variant, index) => (
            <VariationRow
              key={variant.id}
              campaign={campaign}
              variant={variant}
              index={index}
              isControl={index === 0}
              isBest={variant.id === bestId && variant.id !== control?.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function VariationRow({
  campaign,
  variant,
  index,
  isControl,
  isBest,
}: {
  campaign: Campaign;
  variant: Variant;
  index: number;
  isControl: boolean;
  isBest: boolean;
}) {
  const collecting = variationCollecting(campaign, index);
  const visitors = variantVisitors(campaign, index, QUICKVIEW_FILTERS);
  const conversions = Math.round(
    variantConversionsAllocated(campaign, index, QUICKVIEW_FILTERS)
  );

  const hero = previewHero(index);

  return (
    <article
      className={cn(
        "w-[276px] shrink-0 snap-start rounded-lg border border-border p-3",
        isBest && "bg-muted/40"
      )}
    >
      <div className="flex h-[25px] items-center gap-2">
        <VariantChip>{variant.label}</VariantChip>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {variant.name}
        </span>
        {isBest && (
          <span className="flex h-[22px] shrink-0 items-center gap-1 rounded-md border border-border bg-background px-2">
            <Award className="h-3 w-3 text-decision-winner-fg" aria-hidden />
            <span className="text-[11px] font-medium text-decision-winner-fg">
              Leading
            </span>
          </span>
        )}
        {isControl && (
          <span className="shrink-0 text-[11px] text-muted-foreground">
            Original
          </span>
        )}
      </div>

      {collecting ? (
        <div className="mt-3">
          <CollectingInline />
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-2xl font-semibold leading-none tabular-nums tracking-tight text-foreground">
                {formatNumber(conversions)}
              </p>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Unique conversions
              </p>
            </div>
            <UpliftPill
              label={
                isControl || variant.uplift === null
                  ? "—"
                  : formatUplift(variant.uplift)
              }
            />
          </div>

          <dl className="mt-3 grid grid-cols-3 gap-1.5">
            <StatTile
              compact
              label={campaign.primaryMetric}
              value={`${variant.convRate.toFixed(2)}%`}
            />
            <StatTile compact label="Visitors" value={formatNumber(visitors)} />
            <StatTile
              compact
              label="Confidence"
              value={
                isControl || variant.confidence === null
                  ? "—"
                  : `${variant.confidence}%`
              }
            />
          </dl>

          <WebpagePreview
            compact
            headline={hero.headline}
            sub={hero.sub}
            cta={hero.cta}
            conversionsLabel={`${formatNumber(conversions)} conversions · ${variant.convRate.toFixed(2)}%`}
            isControl={isControl}
          />
        </>
      )}
    </article>
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
          <ReportsEmptyState campaign={campaign} compact />
        ) : (
          <div className="space-y-6">
            {/* A) Top card — kind-driven, mirrors report banner precedence */}
            <ConclusionStateCard campaign={campaign} />

            <VariationsCard campaign={campaign} />

            {/* B) Section label — kept tight to the cards it introduces */}
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Experiment context
              </div>

              <div className="mt-2 space-y-4">
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

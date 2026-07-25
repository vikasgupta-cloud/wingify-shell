import { type CSSProperties, type ReactNode, type RefObject, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowUpLeft,
  ArrowUpRight,
  Info,
  MousePointerClick,
  RefreshCw,
  Trophy,
  X,
} from "lucide-react";
import {
  hasReport,
  type Campaign,
  type CampaignStatus,
} from "../../data/campaigns";
import { useVisibleCampaigns } from "../../store/rows";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VitalsGlyph } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { ReportDataProvider, useReportData } from "./reportDataContext";
import ResultsTab from "./ResultsTab";
import VitalsTab from "./VitalsTab";
import vwoMark from "./vwo-mark.svg";
import WandzPanel from "../../components/wandz/WandzPanel";
import { useWandzStore } from "../../store/wandz";

// ---------------------------------------------------------------------------
// Overview UI — numbers always come from ReportDataProvider (one reactive source).
// PREVIEW_HERO only supplies marketing copy for variation preview cards.

type BadgeTone = "green" | "blue" | "purple" | "neutral";

type ReportVariant = {
  label: string;
  name: string;
  rank: number | null;
  tone: BadgeTone;
  isControl: boolean;
  isWinner: boolean;
  headline: string;
  sub: string;
  cta: string;
  conversions: number;
  ctaRate: string;
  visitors: string;
  confidence: string;
  upliftLabel: string;
};

/** Overview surfaces share listing-page corner radius. */
const overviewRadius = "rounded-lg";

type OverviewData = {
  lastUpdated: string;
  headline: string;
  body: string;
  stats: { value: string; label: string; accent: boolean }[];
  revenue: {
    best: { label: string; name: string };
    control: { label: string; name: string };
    projectedImpact: number;
    perVisitor: number;
    transactionRateLift: number;
    aovLift: number;
  };
  hypothesis: { expect: string; address: string };
  comparison: {
    heading: string;
    metric: string;
    variants: ReportVariant[];
  };
};

const PREVIEW_HERO = [
  {
    headline: "Make every customer experience count",
    sub: "Build, test, and ship digital experiences your customers choose.",
    cta: "Start free trial",
  },
  {
    headline: "Start testing in 30 seconds",
    sub: "Launch your first experiment today. No complex setup required.",
    cta: "Start testing free",
  },
  {
    headline: "Test ideas. Prove impact. Grow.",
    sub: "Move from intuition to evidence with one connected testing workspace.",
    cta: "Create your first test",
  },
  {
    headline: "Turn every visit into insight",
    sub: "Run experiments that reveal what your audience really wants.",
    cta: "Explore the platform",
  },
  {
    headline: "Build experiences people choose",
    sub: "Learn what works, understand why, and turn insight into growth.",
    cta: "See how it works",
  },
];

const VARIANT_TONES: BadgeTone[] = ["neutral", "green", "purple", "blue", "purple"];

function useOverviewData(): OverviewData {
  const { campaign, overview } = useReportData();
  return useMemo(() => {
    const variants: ReportVariant[] = overview.comparison.rows.map((row, index) => {
      const hero = PREVIEW_HERO[index % PREVIEW_HERO.length]!;
      return {
        label: row.label,
        name: row.name,
        rank: row.rank,
        tone: VARIANT_TONES[index % VARIANT_TONES.length]!,
        isControl: row.isControl,
        isWinner: row.isWinner,
        headline: hero.headline,
        sub: hero.sub,
        cta: hero.cta,
        conversions: row.conversions,
        ctaRate: row.ctaRate,
        visitors: row.visitors,
        confidence: row.confidence,
        upliftLabel: row.upliftLabel,
      };
    });
    return {
      lastUpdated: overview.lastUpdated,
      headline: overview.headline,
      body: overview.body,
      stats: overview.stats,
      revenue: overview.revenue,
      hypothesis: {
        expect: campaign.hypothesis,
        address: campaign.addresses,
      },
      comparison: {
        heading: overview.comparison.heading,
        metric: overview.comparison.metric,
        variants,
      },
    };
  }, [campaign.hypothesis, campaign.addresses, overview]);
}

// ---------------------------------------------------------------------------

/** Sticky report tab bar height — Results metrics nav stacks below it. */
const reportsTabsStickyHeightFallback = "3.25rem";

function LinkButton({ children }: { children: ReactNode }) {
  return (
    <Button variant="link" className="h-auto p-0 text-sm font-medium">
      {children}
    </Button>
  );
}

function DecisionBanner({
  overview,
  onViewFullStats,
}: {
  overview: OverviewData;
  onViewFullStats: () => void;
}) {
  return (
    <Card
      className={cn(
        overviewRadius,
        "border-border bg-background shadow-none lg:col-span-2"
      )}
    >
      <div className="flex h-full flex-col gap-6 px-8 py-8">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            {overview.headline}
          </h3>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            {overview.body}
          </p>
        </div>

        <div className="mt-auto space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            {overview.stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && (
                  <Separator orientation="vertical" className="h-10 bg-border" />
                )}
                <div>
                  <p
                    className={cn(
                      "text-2xl font-semibold tabular-nums",
                      stat.accent ? "text-success-fg" : "text-foreground"
                    )}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <Button className="rounded-md px-5">Rollout variation</Button>
            <Button
              type="button"
              variant="link"
              onClick={onViewFullStats}
              className="h-auto p-0 text-sm font-medium text-muted-foreground"
            >
              View full stats
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function GraphChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-5 min-w-[21px] items-center justify-center rounded-md border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function RevenueRow({
  label,
  value,
  pct,
  barClass,
}: {
  label: string;
  value: ReactNode;
  pct: number;
  barClass: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <p className="text-sm font-medium text-foreground/80">{label}</p>
        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      </div>
      <div className="flex items-baseline">{value}</div>
      <div className="flex h-1 w-full overflow-hidden rounded-full">
        <div className={cn("h-full", barClass)} style={{ width: `${pct}%` }} />
        <div className="h-full flex-1 bg-muted" />
      </div>
    </div>
  );
}

function RevenueImpactCard({ overview }: { overview: OverviewData }) {
  return (
    <Card className={cn(overviewRadius, "flex flex-col gap-6 border-border bg-background p-6 shadow-none")}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-semibold text-foreground">Revenue Impact</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 text-foreground">
            <GraphChip>{overview.revenue.best.label}</GraphChip>
            {overview.revenue.best.name}
          </span>
          <span>vs</span>
          <span className="flex items-center gap-1.5 text-foreground">
            <GraphChip>{overview.revenue.control.label}</GraphChip>
            {overview.revenue.control.name}
          </span>
        </div>
      </div>

      <RevenueRow
        label="Projected impact"
        pct={Math.min(100, Math.max(12, overview.revenue.projectedImpact / 40))}
        barClass="bg-foreground/80"
        value={
          <>
            <span className="text-2xl font-semibold leading-8 tabular-nums text-success-fg">
              +${overview.revenue.projectedImpact.toLocaleString("en-US")}
            </span>
            <span className="ml-0.5 text-sm text-muted-foreground">/ month</span>
            <span className="ml-1.5 text-sm font-medium text-foreground">
              (${overview.revenue.perVisitor.toFixed(2)}
            </span>
            <span className="ml-0.5 text-sm text-muted-foreground">/ visitor</span>
            <span className="ml-0.5 text-sm font-medium text-foreground">)</span>
            <ArrowUpRight className="ml-1 h-3.5 w-3.5 self-center text-success-fg" aria-hidden />
          </>
        }
      />
      <RevenueRow
        label="Transaction rate"
        pct={Math.min(
          100,
          Math.max(12, Math.abs(overview.revenue.transactionRateLift) * 20)
        )}
        barClass="bg-muted-foreground"
        value={
          <>
            <span className="text-2xl font-semibold leading-8 tabular-nums text-success-fg">
              {overview.revenue.transactionRateLift >= 0 ? "+" : ""}
              {overview.revenue.transactionRateLift.toFixed(2)}%
            </span>
            <ArrowUpRight className="ml-1 h-3.5 w-3.5 self-center text-success-fg" aria-hidden />
          </>
        }
      />
      <RevenueRow
        label="Average order value"
        pct={Math.min(100, Math.max(12, overview.revenue.aovLift * 20))}
        barClass="bg-foreground/50"
        value={
          <>
            <span className="text-2xl font-semibold leading-8 tabular-nums text-success-fg">
              +${overview.revenue.aovLift.toFixed(2)}
            </span>
            <span className="ml-1 text-sm text-muted-foreground">/ order</span>
            <ArrowUpLeft className="ml-1 h-3.5 w-3.5 self-center text-success-fg" aria-hidden />
          </>
        }
      />
    </Card>
  );
}

function HypothesisSection({ overview }: { overview: OverviewData }) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">
        What is being tested
      </h2>
      <Card className={cn(overviewRadius, "border-border bg-background shadow-none")}>
        <div className="space-y-4 p-6">
          <p className="text-sm font-semibold text-foreground">Hypothesis</p>
          <div className="max-w-6xl space-y-3 text-sm leading-6 text-muted-foreground">
            <p>I expect that {overview.hypothesis.expect}</p>
            <p>Will address: {overview.hypothesis.address}</p>
          </div>
          <LinkButton>View details</LinkButton>
        </div>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Variation comparison cards

function AnnotationDot({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn(
        "absolute z-10 flex h-[19px] w-[19px] items-center justify-center rounded-md border border-background bg-foreground text-[11px] font-semibold text-primary-foreground shadow-sm",
        className
      )}
      aria-hidden
    >
      {n}
    </span>
  );
}

function SkeletonTile() {
  return (
    <div className="flex h-[54px] w-[118px] flex-col rounded-[5px] border border-border/60 bg-background p-2.5">
      <span className="h-2.5 w-3.5 rounded-sm bg-muted" />
      <span className="mt-[7px] h-[3px] w-[70px] rounded-full bg-border" />
      <span className="mt-[5px] h-[3px] w-[46px] rounded-full bg-border" />
    </div>
  );
}

function WebpagePreview({
  headline,
  sub,
  cta,
  conversionsLabel,
  isControl,
}: {
  headline: string;
  sub: string;
  cta: string;
  conversionsLabel: string;
  isControl: boolean;
}) {
  return (
    <div className={cn("mt-2.5 flex h-[435px] flex-col overflow-hidden border border-border bg-background", overviewRadius)}>
      {/* Browser chrome */}
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border bg-muted/60 px-2.5">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/55" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/75" />
        </div>
        <div className="flex h-4 flex-1 items-center justify-center rounded-md border border-border bg-background text-[10px] leading-none text-muted-foreground">
          vwo.com/experience
        </div>
      </div>

      {/* Site nav */}
      <div className="flex h-[39px] shrink-0 items-center gap-3 border-b border-border px-3">
        <div className="flex items-center gap-1">
          <img src={vwoMark} alt="" className="h-3 w-3" />
          <span className="text-xs font-semibold text-foreground">VWO</span>
        </div>
        <div className="flex flex-1 justify-center gap-2">
          <span className="h-1 w-6 rounded-full bg-border" />
          <span className="h-1 w-6 rounded-full bg-border" />
          <span className="h-1 w-6 rounded-full bg-border" />
        </div>
        <span className="h-3 w-9 rounded bg-muted" />
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center bg-muted/20 px-5 pt-10">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Experiment with confidence
        </p>

        <div className="relative mt-2.5">
          {isControl ? (
            <p className="max-w-[290px] text-center text-lg font-semibold leading-[22px] tracking-tight text-foreground">
              {headline}
            </p>
          ) : (
            <span className="relative inline-block rounded-md bg-muted px-1.5 pb-1 pt-0.5">
              <AnnotationDot n={1} className="-left-2.5 -top-2" />
              <span className="whitespace-nowrap text-lg font-semibold leading-[22px] tracking-tight text-foreground">
                {headline}
              </span>
            </span>
          )}
        </div>

        <p className="mt-2.5 max-w-[300px] text-center text-xs leading-snug text-muted-foreground">
          {sub}
        </p>

        <div className="relative mt-8">
          <span
            className={cn(
              "flex h-[38px] items-center rounded-md px-4 text-[11px] font-semibold text-primary-foreground",
              isControl ? "bg-foreground/90" : "bg-foreground"
            )}
          >
            {cta}
          </span>
          {!isControl && <AnnotationDot n={2} className="-left-2.5 -top-2.5" />}
          <span
            className={cn(
              "absolute -bottom-4 left-12 flex h-[30px] items-center gap-1 whitespace-nowrap rounded-md border border-border bg-background px-2.5 shadow-sm"
            )}
          >
            <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            <span className="text-[10px] font-medium text-muted-foreground">{conversionsLabel}</span>
          </span>
        </div>

        <div className="mt-auto flex justify-center gap-2 pb-6 pt-8">
          <SkeletonTile />
          <SkeletonTile />
          <SkeletonTile />
        </div>
      </div>
    </div>
  );
}

function VariantChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[23px] min-w-[29px] items-center justify-center rounded-md border border-border bg-muted px-2 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function VariationCard({
  variant,
  metricLabel,
}: {
  variant: ReportVariant;
  metricLabel: string;
}) {
  const { isControl, isWinner } = variant;

  return (
    <article
      className={cn(
        "shrink-0 border border-border bg-background p-4",
        overviewRadius,
        isControl ? "w-[420px]" : "w-[450px]"
      )}
    >
      <div className="flex h-[34px] items-center gap-2">
        <VariantChip>{variant.label}</VariantChip>
        <span className="text-sm font-semibold text-foreground">{variant.name}</span>
        {variant.rank !== null && <VariantChip>#{variant.rank}</VariantChip>}
        {isWinner && (
          <span className="ml-auto flex h-[25px] items-center gap-1 rounded-md border border-border bg-muted px-2.5">
            <Trophy className="h-3 w-3 text-decision-winner-fg" aria-hidden />
            <span className="text-xs font-medium text-decision-winner-fg">Winner</span>
          </span>
        )}
        {isControl && <span className="ml-auto text-xs text-muted-foreground">Original</span>}
      </div>

      <WebpagePreview
        headline={variant.headline}
        sub={variant.sub}
        cta={variant.cta}
        conversionsLabel={`${variant.conversions} unique conversions · ${variant.ctaRate}`}
        isControl={isControl}
      />

      <div className="flex items-end justify-between pt-3">
        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
            {variant.conversions}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unique conversions</p>
        </div>
        <p
          className={cn(
            "pb-1 text-sm tabular-nums",
            isControl || variant.upliftLabel === "Baseline"
              ? "text-muted-foreground"
              : "font-semibold text-success-fg"
          )}
        >
          {variant.upliftLabel}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2.5">
        <div>
          <p className="text-xs text-muted-foreground">{metricLabel}</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
            {variant.ctaRate}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Visitors</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
            {variant.visitors}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="mt-1 text-sm font-medium tabular-nums text-foreground">
            {variant.confidence}
          </p>
        </div>
      </div>
    </article>
  );
}

function VariationComparison({ overview }: { overview: OverviewData }) {
  const [control, ...rest] = overview.comparison.variants;

  return (
    <section className="space-y-4">
      <h3 className="max-w-2xl text-sm font-semibold text-foreground">
        {overview.comparison.heading}
      </h3>

      <div className="flex items-start gap-5">
        <div className="sticky top-6 z-10 flex shrink-0 items-start">
          <VariationCard variant={control} metricLabel={overview.comparison.metric} />
          <span className="z-10 -mx-8 mt-[18px] flex h-[25px] shrink-0 translate-x-[26px] items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-sm">
            vs
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-start gap-5 overflow-x-auto overscroll-x-contain pb-2 pl-8">
          {rest.map((variant) => (
            <VariationCard
              key={variant.label}
              variant={variant}
              metricLabel={overview.comparison.metric}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VitalsBreachSection({ onViewDetails }: { onViewDetails: () => void }) {
  const { campaign } = useReportData();
  if (campaign.vitals !== "unhealthy") return null;

  return (
    <Card
      className={cn(
        overviewRadius,
        "border-border bg-background shadow-none"
      )}
    >
      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-vitals-unhealthy">
            <VitalsGlyph size={18} className="text-current" title="Vitals unhealthy" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-vitals-unhealthy text-background">
              <X className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
            </span>
          </span>
          <div className="min-w-0 space-y-1.5">
            <p className="text-sm font-semibold text-foreground">
              Experiment vitals breach
            </p>
            <p className="text-sm font-medium leading-snug text-vitals-unhealthy">
              Fault in experiment configuration as Metric was changed in a running
              campaign.
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              We recommend you flush data in this campaign for reliable results.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={onViewDetails}
        >
          View details
        </Button>
      </div>
    </Card>
  );
}

function ReportsOverview({
  onViewFullStats,
  onViewVitalsDetails,
}: {
  onViewFullStats: () => void;
  onViewVitalsDetails: () => void;
}) {
  const overview = useOverviewData();
  return (
    <div className="mx-auto max-w-[1384px] space-y-10 px-12 pb-12 pt-8">
      <VitalsBreachSection onViewDetails={onViewVitalsDetails} />
      <div className="grid gap-4 lg:grid-cols-3">
        <DecisionBanner overview={overview} onViewFullStats={onViewFullStats} />
        <RevenueImpactCard overview={overview} />
      </div>
      <HypothesisSection overview={overview} />
      <VariationComparison overview={overview} />
    </div>
  );
}

function ReportsChrome({
  activeTab,
  setActiveTab,
  tabsBarRef,
  tabsBarHeight,
}: {
  activeTab: string;
  setActiveTab: (value: string) => void;
  tabsBarRef: RefObject<HTMLDivElement | null>;
  tabsBarHeight: string;
}) {
  const { campaign, overview } = useReportData();
  const wandzOpen = useWandzStore((s) => s.open);
  const wandzFullPreview = useWandzStore((s) => s.fullPreview);

  return (
    <div
      className={cn(
        "flex min-h-full flex-col",
        activeTab === "vitals" ? "bg-background" : "bg-canvas"
      )}
      style={{ "--reports-tabs-height": tabsBarHeight } as CSSProperties}
    >
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-full flex-col"
      >
        <div
          ref={tabsBarRef}
          className="sticky top-0 z-40 flex h-14 shrink-0 items-end justify-between gap-4 border-b border-border bg-background px-4"
        >
          <TabsList className="h-auto gap-5 rounded-none bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tabValue(tab)}
                className="relative rounded-none border-0 bg-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-foreground after:transition-transform data-[state=active]:after:scale-x-100"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2 pb-2.5">
            <span className="text-sm text-muted-foreground">
              Last updated {overview.lastUpdated}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Refresh report">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 items-start">
          <div className="min-w-0 flex-1">
            <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
              <ReportsOverview
                onViewFullStats={() => setActiveTab("results")}
                onViewVitalsDetails={() => setActiveTab("vitals")}
              />
            </TabsContent>
            <TabsContent value="results" className="mt-0 focus-visible:outline-none">
              <ResultsTab
                key={campaign.id}
                campaign={campaign}
                onNavigateToVitals={() => setActiveTab("vitals")}
              />
            </TabsContent>
            <TabsContent value="behaviour" className="mt-0 focus-visible:outline-none">
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Behaviour coming soon.
              </div>
            </TabsContent>
            <TabsContent value="live-hits" className="mt-0 focus-visible:outline-none">
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Live hits coming soon.
              </div>
            </TabsContent>
            <TabsContent
              value="vitals"
              className="mt-0 bg-background focus-visible:outline-none"
            >
              <VitalsTab key={campaign.id} campaign={campaign} />
            </TabsContent>
          </div>
          {wandzOpen && wandzFullPreview ? <WandzPanel /> : null}
          {wandzOpen && !wandzFullPreview ? (
            <div
              className="sticky z-30 shrink-0 self-start pl-2 pr-4"
              style={
                {
                  top: "calc(var(--reports-tabs-height) + 1rem)",
                } as CSSProperties
              }
            >
              {/* static: outer wrapper owns sticky; panel measures its own max height. */}
              <WandzPanel className="static top-auto" />
            </div>
          ) : null}
        </div>
      </Tabs>
    </div>
  );
}

const TABS = ["Overview", "Results", "Behaviour", "Live hits", "Vitals"];
const tabValue = (tab: string) => tab.toLowerCase().replace(/\s+/g, "-");
const REPORT_TAB_VALUES = new Set(TABS.map(tabValue));

const OVERVIEW_DEFAULT_STATUSES: CampaignStatus[] = [
  "Paused",
  "In Analysis",
  "Ended",
];

function defaultReportTab(status: CampaignStatus): string {
  return OVERVIEW_DEFAULT_STATUSES.includes(status) ? "overview" : "results";
}

function ReportsEmptyIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 180"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="28"
        y="24"
        width="224"
        height="132"
        rx="12"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        fill="hsl(var(--background))"
      />
      <rect
        x="28"
        y="24"
        width="224"
        height="28"
        rx="12"
        fill="hsl(var(--muted))"
      />
      <rect x="28" y="40" width="224" height="12" fill="hsl(var(--muted))" />
      <circle cx="48" cy="38" r="4" fill="hsl(var(--muted-foreground) / 0.35)" />
      <circle cx="62" cy="38" r="4" fill="hsl(var(--muted-foreground) / 0.25)" />
      <circle cx="76" cy="38" r="4" fill="hsl(var(--muted-foreground) / 0.18)" />

      <path
        d="M56 128 V96 M88 128 V84 M120 128 V104 M152 128 V72 M184 128 V90 M216 128 V78"
        stroke="hsl(var(--border))"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M52 118 C84 108, 108 92, 140 86 C172 80, 196 70, 224 62"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.45"
      />
      <circle
        cx="224"
        cy="62"
        r="4"
        fill="hsl(var(--foreground))"
        fillOpacity="0.35"
      />

      <rect
        x="96"
        y="148"
        width="88"
        height="10"
        rx="5"
        fill="hsl(var(--muted))"
      />
      <rect
        x="114"
        y="164"
        width="52"
        height="6"
        rx="3"
        fill="hsl(var(--muted))"
        fillOpacity="0.7"
      />
    </svg>
  );
}

function ReportsEmptyState({ campaign }: { campaign: Campaign }) {
  const notStarted =
    campaign.status === "Draft" ||
    campaign.status === "In QA" ||
    campaign.status === "Ready to launch";
  const headline = notStarted
    ? "Reports unlock when this campaign starts"
    : "No report data for this campaign yet";
  const body = notStarted
    ? "You’ll be able to see results, variations, and insights here once the campaign is running and collecting data."
    : "This campaign isn’t in a reportable state right now. Start or resume it to collect data and view results.";

  return (
    <div className="flex h-full min-h-[28rem] items-center justify-center bg-canvas px-6 py-16">
      <div className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="mb-8 w-full max-w-[280px] text-muted-foreground">
          <ReportsEmptyIllustration className="h-auto w-full" />
        </div>
        <span className="mb-3 inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {campaign.status}
        </span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {headline}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
          {body}
        </p>
        <Button asChild variant="outline" className="mt-6 rounded-md">
          <Link to={`/web-experiment/c/${campaign.id}`}>
            Open campaign setup
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { entityId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === entityId);
  const tabsBarRef = useRef<HTMLDivElement>(null);
  const [tabsBarHeight, setTabsBarHeight] = useState(reportsTabsStickyHeightFallback);

  const defaultTab = campaign ? defaultReportTab(campaign.status) : "overview";
  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam && REPORT_TAB_VALUES.has(tabParam) ? tabParam : defaultTab;

  const setActiveTab = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === defaultTab) next.delete("tab");
        else next.set("tab", value);
        return next;
      },
      { replace: true }
    );
  };

  useLayoutEffect(() => {
    const el = tabsBarRef.current;
    if (!el) return;
    const sync = () => setTabsBarHeight(`${el.getBoundingClientRect().height}px`);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [campaign?.id, activeTab]);

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center bg-canvas">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
      </div>
    );
  }

  if (!hasReport(campaign.status)) {
    return <ReportsEmptyState campaign={campaign} />;
  }

  return (
    <ReportDataProvider campaign={campaign}>
      <ReportsChrome
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabsBarRef={tabsBarRef}
        tabsBarHeight={tabsBarHeight}
      />
    </ReportDataProvider>
  );
}

import { type ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  ArrowUpLeft,
  ArrowUpRight,
  ChevronDown,
  Info,
  MousePointerClick,
  RefreshCw,
  Trophy,
  Users,
} from "lucide-react";
import { hasReport } from "../../data/campaigns";
import { useVisibleCampaigns } from "../../store/rows";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import ResultsTab from "./ResultsTab";
import DateRangeDropdown from "./DateRangeDropdown";
import vwoMark from "./vwo-mark.svg";

// ---------------------------------------------------------------------------
// Reference model — the "Homepage Hero CTA Test" overview exactly as designed
// in Figma (node 2422:34944). The reports overview is a design showcase, so the
// copy and numbers below are the canonical sample content rather than being
// derived from the selected campaign.

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

/** Overview surfaces share one corner radius (decision banner + sibling cards). */
const overviewRadius = "rounded-[14px]";

const REPORT = {
  lastUpdated: "Jun 2, 2026",
  status: "Experiment complete · 21 days",
  runTime: "Run time: May 12 – Jun 2, 2026 · Conclusion reached 2 days early",
  headline: "Variation 1 is your best choice",
  body: "Roll it out to all traffic and monitor conversions for two weeks.",
  stats: [
    { value: "0.96%", label: "Conversion rate", accent: true },
    { value: "96%", label: "Confidence", accent: false },
    { value: "+$2,482", label: "Projected impact", accent: false },
  ],
  revenue: {
    best: { label: "V1", name: "Variation 1" },
    control: { label: "C", name: "Control" },
  },
  hypothesis: {
    expect:
      "replacing the generic hero message-only experience with explicit, role-aligned CTAs will help qualified visitors (government and enterprise buyers) self-identify and start high-intent conversations, increasing qualified inbound leads.",
    address:
      "Increase qualified inbound leads for solutions across Defence, Aerospace, and Cyber & Digital.",
  },
  comparison: {
    heading: 'Variation 1 increased “Start free” CTA clicks by 140% vs. Control',
    metric: "CTA click rate",
    audience: "All visitors",
    variants: [
      {
        label: "C",
        name: "Control",
        rank: null,
        tone: "neutral",
        isControl: true,
        isWinner: false,
        headline: "Make every customer experience count",
        sub: "Build, test, and ship digital experiences your customers choose.",
        cta: "Start free trial",
        conversions: 4,
        ctaRate: "0.40%",
        visitors: "1,002",
        confidence: "—",
        upliftLabel: "Baseline",
      },
      {
        label: "V1",
        name: "Variation 1",
        rank: 1,
        tone: "green",
        isControl: false,
        isWinner: true,
        headline: "Start testing in 30 seconds",
        sub: "Launch your first experiment today—no complex setup required.",
        cta: "Start testing free",
        conversions: 10,
        ctaRate: "0.96%",
        visitors: "1,041",
        confidence: "95%",
        upliftLabel: "+140%",
      },
      {
        label: "V2",
        name: "Variation 2",
        rank: 2,
        tone: "purple",
        isControl: false,
        isWinner: false,
        headline: "Test ideas. Prove impact. Grow.",
        sub: "Move from intuition to evidence with one connected testing workspace.",
        cta: "Create your first test",
        conversions: 8,
        ctaRate: "0.79%",
        visitors: "1,017",
        confidence: "88%",
        upliftLabel: "+98%",
      },
      {
        label: "V3",
        name: "Variation 3",
        rank: 3,
        tone: "blue",
        isControl: false,
        isWinner: false,
        headline: "Turn every visit into insight",
        sub: "Run experiments that reveal what your audience really wants.",
        cta: "Explore the platform",
        conversions: 7,
        ctaRate: "0.68%",
        visitors: "1,033",
        confidence: "78%",
        upliftLabel: "+70%",
      },
      {
        label: "V4",
        name: "Variation 4",
        rank: 4,
        tone: "purple",
        isControl: false,
        isWinner: false,
        headline: "Build experiences people choose",
        sub: "Learn what works, understand why, and turn insight into growth.",
        cta: "See how it works",
        conversions: 5,
        ctaRate: "0.47%",
        visitors: "1,071",
        confidence: "52%",
        upliftLabel: "+18%",
      },
    ] as ReportVariant[],
  },
};

// ---------------------------------------------------------------------------

function LinkButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="text-sm font-semibold text-report-link hover:underline">
      {children}
    </button>
  );
}

function DecisionBanner({ onViewFullStats }: { onViewFullStats: () => void }) {
  return (
    <section
      className={cn(
        overviewRadius,
        "border border-report-green-border bg-gradient-to-br from-report-green-tint via-report-green-tint/50 to-background lg:col-span-2"
      )}
    >
      <div className="flex h-full flex-col gap-7 px-10 py-9">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-report-green-badge px-2.5 py-1 text-sm font-semibold text-report-green">
            <span className="h-1.5 w-1.5 rounded-full bg-report-green" aria-hidden />
            {REPORT.status}
          </span>
          <p className="text-sm text-muted-foreground">{REPORT.runTime}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-[28px] font-semibold leading-9 tracking-tight text-foreground">
            {REPORT.headline}
          </h3>
          <p className="max-w-3xl text-[15px] leading-6 text-muted-foreground">{REPORT.body}</p>
        </div>

        <div className="mt-auto space-y-6">
          <div className="flex flex-wrap items-center gap-6">
            {REPORT.stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6">
                {i > 0 && (
                  <Separator orientation="vertical" className="h-10 bg-report-green-border/40" />
                )}
                <div>
                  <p
                    className={cn(
                      "text-2xl font-bold tabular-nums",
                      stat.accent ? "text-report-green" : "text-foreground"
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
            <Button className={cn(overviewRadius, "bg-report-green px-5 text-white hover:bg-report-green/90")}>
              Rollout variation
            </Button>
            <button
              type="button"
              onClick={onViewFullStats}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              View full stats
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GraphChip({ children, tone }: { children: ReactNode; tone: "blue" | "neutral" }) {
  return (
    <span
      className={cn(
        "flex h-5 min-w-[21px] items-center justify-center rounded-full border px-1.5 text-[10px] font-medium",
        tone === "blue"
          ? "border-report-blue-border bg-report-blue-bg text-report-blue-fg"
          : "border-border bg-background text-foreground/70"
      )}
    >
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
        <div className="h-full flex-1 bg-report-track" />
      </div>
    </div>
  );
}

function RevenueImpactCard() {
  return (
    <Card className={cn(overviewRadius, "flex flex-col gap-6 p-6 shadow-sm")}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-base font-semibold text-foreground/80">Revenue Impact</p>
        <div className="flex items-center gap-3 text-sm text-foreground/80">
          <span className="flex items-center gap-1.5">
            <GraphChip tone="blue">{REPORT.revenue.best.label}</GraphChip>
            {REPORT.revenue.best.name}
          </span>
          <span>vs</span>
          <span className="flex items-center gap-1.5">
            <GraphChip tone="neutral">{REPORT.revenue.control.label}</GraphChip>
            {REPORT.revenue.control.name}
          </span>
        </div>
      </div>

      <RevenueRow
        label="Projected impact"
        pct={93}
        barClass="bg-report-green-bar"
        value={
          <>
            <span className="text-2xl font-medium leading-8 tabular-nums text-report-green-deep">
              +$2,482
            </span>
            <span className="ml-0.5 text-sm text-muted-foreground">/ month</span>
            <span className="ml-1.5 text-sm font-medium text-foreground">($0.48</span>
            <span className="ml-0.5 text-sm text-muted-foreground">/ visitor</span>
            <span className="ml-0.5 text-sm font-medium text-foreground">)</span>
            <ArrowUpRight className="ml-1 h-3.5 w-3.5 self-center text-report-green-deep" aria-hidden />
          </>
        }
      />
      <RevenueRow
        label="Transaction rate"
        pct={50.5}
        barClass="bg-muted-foreground"
        value={
          <>
            <span className="text-2xl font-medium leading-8 tabular-nums text-report-green-deep">
              +1.40%
            </span>
            <ArrowUpRight className="ml-1 h-3.5 w-3.5 self-center text-report-green-deep" aria-hidden />
          </>
        }
      />
      <RevenueRow
        label="Average order value"
        pct={75}
        barClass="bg-report-green-mid"
        value={
          <>
            <span className="text-2xl font-medium leading-8 tabular-nums text-report-green-deep">
              +$3.20
            </span>
            <span className="ml-1 text-sm text-foreground/80">/ order</span>
            <ArrowUpLeft className="ml-1 h-3.5 w-3.5 self-center text-report-green-deep" aria-hidden />
          </>
        }
      />
    </Card>
  );
}

function HypothesisSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.086em] text-muted-foreground">
        What is being tested
      </h2>
      <Card className={cn(overviewRadius, "shadow-sm")}>
        <div className="space-y-4 p-6">
          <p className="text-base font-semibold text-foreground">Hypothesis</p>
          <div className="max-w-6xl space-y-3 text-[15px] leading-6 text-muted-foreground">
            <p>I expect that {REPORT.hypothesis.expect}</p>
            <p>Will address: {REPORT.hypothesis.address}</p>
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
        "absolute z-10 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-background bg-report-green-mid text-[11px] font-extrabold text-white shadow",
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
    <div className={cn("mt-2.5 flex h-[435px] flex-col overflow-hidden border border-border bg-background shadow-sm", overviewRadius)}>
      {/* Browser chrome */}
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-border/60 bg-muted/60 px-2.5">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-report-red/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-report-amber" />
          <span className="h-1.5 w-1.5 rounded-full bg-report-green/70" />
        </div>
        <div className="flex h-4 flex-1 items-center justify-center rounded-full border border-border bg-background text-[10px] leading-none text-muted-foreground">
          vwo.com/experience
        </div>
      </div>

      {/* Site nav */}
      <div className="flex h-[39px] shrink-0 items-center gap-3 border-b border-border/60 px-3">
        <div className="flex items-center gap-1">
          <img src={vwoMark} alt="" className="h-3 w-3" />
          <span className="text-xs font-extrabold text-foreground">VWO</span>
        </div>
        <div className="flex flex-1 justify-center gap-2">
          <span className="h-1 w-6 rounded-full bg-border" />
          <span className="h-1 w-6 rounded-full bg-border" />
          <span className="h-1 w-6 rounded-full bg-border" />
        </div>
        <span className="h-3 w-9 rounded bg-muted" />
      </div>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-background to-muted/40 px-5 pt-10">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Experiment with confidence
        </p>

        <div className="relative mt-2.5">
          {isControl ? (
            <p className="max-w-[290px] text-center text-lg font-bold leading-[22px] tracking-tight text-foreground">
              {headline}
            </p>
          ) : (
            <span className="relative inline-block rounded bg-report-green-mid/[0.07] px-1.5 pb-1 pt-0.5 shadow-[inset_0_-2px_0_0_hsl(var(--report-green-mid)/0.32)]">
              <AnnotationDot n={1} className="-left-2.5 -top-2" />
              <span className="whitespace-nowrap text-lg font-bold leading-[22px] tracking-tight text-foreground">
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
              "flex h-[38px] items-center rounded-md px-4 text-[11px] font-bold text-white",
              isControl
                ? "bg-foreground/90"
                : "bg-report-green-mid shadow-[0_0_0_4px_hsl(var(--report-green-mid)/0.15)]"
            )}
          >
            {cta}
          </span>
          {!isControl && <AnnotationDot n={2} className="-left-2.5 -top-2.5" />}
          <span
            className={cn(
              "absolute -bottom-4 left-12 flex h-[30px] items-center gap-1 whitespace-nowrap rounded-full border bg-background/95 px-2.5 shadow-sm",
              isControl ? "border-border" : "border-report-green-border"
            )}
          >
            <MousePointerClick
              className={cn(
                "h-3.5 w-3.5",
                isControl ? "text-muted-foreground" : "text-report-green-deep"
              )}
              aria-hidden
            />
            <span
              className={cn(
                "text-[10px] font-bold",
                isControl ? "text-foreground/70" : "text-report-green-deep"
              )}
            >
              {conversionsLabel}
            </span>
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

function VariantChip({ children, tone }: { children: ReactNode; tone: BadgeTone }) {
  return (
    <span
      className={cn(
        "flex h-[23px] min-w-[29px] items-center justify-center rounded-full border px-2 text-xs font-bold",
        tone === "green" && "border-report-green-border bg-report-green-badge text-report-green-deep",
        tone === "blue" && "border-report-blue-border bg-report-blue-bg text-report-blue-fg",
        tone === "purple" && "border-report-purple-border bg-report-purple-bg text-report-purple-fg",
        tone === "neutral" && "border-border bg-muted text-muted-foreground"
      )}
    >
      {children}
    </span>
  );
}

function VariationCard({ variant }: { variant: ReportVariant }) {
  const { isControl, isWinner } = variant;

  return (
    <article
      className={cn(
        "shrink-0 border bg-background p-4",
        overviewRadius,
        isControl ? "w-[420px]" : "w-[450px]",
        isWinner
          ? "border-report-green bg-background shadow-[0_0_0_1px_hsl(var(--report-green-mid)/0.08),0_5px_16px_hsl(var(--report-green-mid)/0.06)]"
          : "border-border shadow-sm"
      )}
    >
      <div className="flex h-[34px] items-center gap-2">
        <VariantChip tone={variant.tone}>{variant.label}</VariantChip>
        <span className="text-sm font-bold text-foreground/80">{variant.name}</span>
        {variant.rank !== null && (
          <VariantChip tone={isWinner ? "green" : "neutral"}>#{variant.rank}</VariantChip>
        )}
        {isWinner && (
          <span className="ml-auto flex h-[25px] items-center gap-1 rounded-full bg-report-green-badge px-2.5">
            <Trophy className="h-3 w-3 text-report-green-deep" aria-hidden />
            <span className="text-xs font-bold text-report-green-deep">Winner</span>
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
          <p
            className={cn(
              "text-[38px] font-semibold leading-10 tracking-[-0.025em] tabular-nums",
              isControl ? "text-foreground" : "text-report-green-deep"
            )}
          >
            {variant.conversions}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">Unique conversions</p>
        </div>
        <p
          className={cn(
            "pb-1 text-sm tabular-nums",
            isControl ? "text-muted-foreground" : "font-bold text-report-green-mid"
          )}
        >
          {variant.upliftLabel}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-2.5">
        <div>
          <p className="text-xs text-muted-foreground/90">{REPORT.comparison.metric}</p>
          <p className="mt-[3px] text-sm font-bold tabular-nums text-foreground/80">
            {variant.ctaRate}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/90">Visitors</p>
          <p className="mt-[3px] text-sm font-bold tabular-nums text-foreground/80">
            {variant.visitors}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground/90">Confidence</p>
          <p className="mt-[3px] text-sm font-bold tabular-nums text-foreground/80">
            {variant.confidence}
          </p>
        </div>
      </div>
    </article>
  );
}

function VariationComparison() {
  const [control, ...rest] = REPORT.comparison.variants;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h3 className="max-w-2xl text-base font-semibold text-foreground">
          {REPORT.comparison.heading}
        </h3>
        <div className="flex flex-wrap gap-2">
          <DateRangeDropdown variant="outline" />
          <Button variant="outline" size="sm" className="h-[34px] gap-2 rounded-lg font-normal">
            <Users className="h-[15px] w-[15px]" aria-hidden />
            {REPORT.comparison.audience}
            <ChevronDown className="h-[13px] w-[13px] opacity-60" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-5">
        <div className="sticky top-6 z-10 flex shrink-0 items-start">
          <VariationCard variant={control} />
          <span className="z-10 -mx-8 mt-[18px] flex h-[25px] shrink-0 translate-x-[26px] items-center rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground/70 shadow-sm">
            vs
          </span>
        </div>
        <div className="flex min-w-0 flex-1 items-start gap-5 overflow-x-auto overscroll-x-contain pb-2 pl-8">
          {rest.map((variant) => (
            <VariationCard key={variant.label} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReportsOverview({ onViewFullStats }: { onViewFullStats: () => void }) {
  return (
    <div className="mx-auto max-w-[1384px] space-y-12 px-14 pb-16 pt-10">
      <div className="grid gap-4 lg:grid-cols-3">
        <DecisionBanner onViewFullStats={onViewFullStats} />
        <RevenueImpactCard />
      </div>
      <HypothesisSection />
      <VariationComparison />
    </div>
  );
}

const TABS = ["Overview", "Results", "Behaviour", "Live hits", "Vitals"];
const tabValue = (tab: string) => tab.toLowerCase().replace(/\s+/g, "-");
const REPORT_TAB_VALUES = new Set(TABS.map(tabValue));

export default function ReportsPage() {
  const { entityId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const campaigns = useVisibleCampaigns();
  const campaign = campaigns.find((c) => c.id === entityId);

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam && REPORT_TAB_VALUES.has(tabParam) ? tabParam : "overview";

  const setActiveTab = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "overview") next.delete("tab");
        else next.set("tab", value);
        return next;
      },
      { replace: true }
    );
  };

  if (!campaign) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Campaign not found.</p>
      </div>
    );
  }

  if (!hasReport(campaign.status)) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">No report data yet.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col bg-background">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-full flex-col"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-7 pt-1.5">
          <TabsList className="h-auto gap-5 rounded-none bg-transparent p-0">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tabValue(tab)}
                className="relative rounded-none border-0 bg-transparent px-1 pb-3 pt-2 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:bg-transparent data-[state=active]:font-semibold data-[state=active]:text-foreground data-[state=active]:shadow-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-foreground after:transition-transform data-[state=active]:after:scale-x-100"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-2 pb-1.5">
            <span className="text-[13px] text-muted-foreground">
              Last updated {REPORT.lastUpdated}
            </span>
            <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Refresh report">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="overview" className="mt-0 flex-1 focus-visible:outline-none">
          <ReportsOverview onViewFullStats={() => setActiveTab("results")} />
        </TabsContent>
        <TabsContent value="results" className="mt-0 flex-1 focus-visible:outline-none">
          <ResultsTab campaign={campaign} />
        </TabsContent>
        {TABS.slice(2).map((tab) => (
          <TabsContent
            key={tab}
            value={tabValue(tab)}
            className="mt-0 flex-1 focus-visible:outline-none"
          >
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
              {tab} coming soon.
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

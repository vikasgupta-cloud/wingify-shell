/** Shared Upgrade product pricing layout — sticky tabs + compact plan header.
 * Driven by UpgradeProductCatalog. Reuses shadcn Accordion, Checkbox, Button, Input, Tabs.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Search,
  Sparkles,
  X,
} from "@/components/icons/protoLucide";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  formatUsd,
  type FeatureCell,
  type UpgradePlanId,
  type UpgradeProductCatalog,
} from "@/data/upgradeProductCatalog";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["feature-list", "add-ons", "faqs"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_TABS: { id: SectionId; label: string }[] = [
  { id: "feature-list", label: "Feature list" },
  { id: "add-ons", label: "Add-Ons" },
  { id: "faqs", label: "FAQs" },
];

const PLAN_GRID =
  "grid grid-cols-[minmax(12rem,1.2fr)_repeat(4,minmax(0,1fr))]";

function FeatureMark({ value }: { value: FeatureCell }) {
  if (value === true) {
    return (
      <CheckCircle2
        className="mx-auto size-5 text-[var(--success-fg)]"
        strokeWidth={1.75}
        aria-label="Included"
      />
    );
  }
  if (value === false) {
    return (
      <X
        className="mx-auto size-5 text-muted-foreground/50"
        strokeWidth={1.75}
        aria-label="Not included"
      />
    );
  }
  if (typeof value === "string") {
    return (
      <span className="text-xs text-muted-foreground">{value}</span>
    );
  }
  return (
    <Circle
      className="mx-auto size-5 text-muted-foreground/40"
      strokeWidth={1.75}
      aria-label="Not included"
    />
  );
}

function PlanCta({
  planId,
  label,
  secondary,
  compact,
}: {
  planId: UpgradePlanId;
  label: string;
  secondary?: string;
  compact?: boolean;
}) {
  const primary =
    planId === "growth" ? (
      <Button
        type="button"
        className={cn("w-full shadow-none", compact ? "h-8" : "h-9")}
      >
        {label}
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        className={cn("w-full shadow-none", compact ? "h-8" : "h-9")}
      >
        {label}
      </Button>
    );
  return (
    <div className={cn("space-y-1.5", compact && "space-y-1")}>
      {primary}
      {secondary ? (
        <button
          type="button"
          className="w-full text-center text-sm font-medium text-foreground underline-offset-2 hover:underline"
        >
          {secondary}
        </button>
      ) : null}
    </div>
  );
}

function scrollToSection(id: SectionId) {
  const sticky = document.getElementById("upgrade-sticky-tabs");
  const main = sticky?.closest("main") ?? document.querySelector("main");

  // Feature list → page top so MTU slider is visible again.
  if (id === "feature-list") {
    if (main instanceof HTMLElement) {
      main.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;
  const stickyH = sticky?.offsetHeight ?? 0;
  if (main instanceof HTMLElement) {
    const mainRect = main.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const nextTop = main.scrollTop + (elRect.top - mainRect.top) - stickyH;
    main.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function UpgradeProductLayout({
  catalog,
}: {
  catalog: UpgradeProductCatalog;
}) {
  const {
    mtuTiers,
    defaultMtuIndex,
    planColumns,
    activeSubscriptionPlan,
    activeSubscriptionLabel,
    featureCategories,
    defaultOpenCategories,
    productAddons,
    accountAddons,
    faqs,
    aiCore,
    aiAdvanced,
    mtuBlurb,
  } = catalog;

  const [mtuIndex, setMtuIndex] = useState(defaultMtuIndex);
  const [currency, setCurrency] = useState("usd");
  const [featureQuery, setFeatureQuery] = useState("");
  const [diffOnly, setDiffOnly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<SectionId>("feature-list");
  const [compact, setCompact] = useState(false);
  const stickSentinelRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const [tabsHeight, setTabsHeight] = useState(0);

  const tier = mtuTiers[mtuIndex] ?? mtuTiers[defaultMtuIndex];
  const savePct =
    tier.growthList && tier.growthSale
      ? Math.round((1 - tier.growthSale / tier.growthList) * 100)
      : 0;

  const filteredCategories = useMemo(() => {
    const q = featureQuery.trim().toLowerCase();
    return featureCategories.map((cat) => {
      let rows = cat.rows;
      if (q) {
        rows = rows.filter((r) => r.label.toLowerCase().includes(q));
      }
      if (diffOnly) {
        rows = rows.filter((r) => {
          const vals = planColumns.map((p) => r.cells[p.id]);
          return vals.some((v) => v !== vals[0]);
        });
      }
      return { ...cat, rows };
    }).filter((cat) => !q || cat.rows.length > 0 || cat.label.toLowerCase().includes(q));
  }, [featureQuery, diffOnly, featureCategories, planColumns]);

  useEffect(() => {
    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (n): n is HTMLElement => !!n
    );
    if (!nodes.length) return;
    const root = nodes[0].closest("main");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id as SectionId | undefined;
        if (top && SECTION_IDS.includes(top)) setActiveSection(top);
      },
      {
        root: root instanceof HTMLElement ? root : null,
        rootMargin: "-25% 0px -50% 0px",
        threshold: [0, 0.1, 0.25],
      }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const sync = () => setTabsHeight(tabs.offsetHeight);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(tabs);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const sentinel = stickSentinelRef.current;
    if (!sentinel) return;
    const root = sentinel.closest("main");
    const observer = new IntersectionObserver(
      ([entry]) => {
        setCompact(!entry?.isIntersecting);
      },
      {
        root: root instanceof HTMLElement ? root : null,
        threshold: 0,
        rootMargin: `-${tabsHeight}px 0px 0px 0px`,
      }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tabsHeight]);

  const expandAllFaqs = () => {
    setFaqOpen(faqs.map((f) => f.id));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-8 pb-20 pt-4">
      {/* Tabs stay sticky for the whole page */}
      <nav
        ref={tabsRef}
        id="upgrade-sticky-tabs"
        aria-label="Page sections"
        className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-canvas"
      >
        <div className="flex min-w-0 items-center gap-1">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSection(tab.id);
                scrollToSection(tab.id);
              }}
              className={cn(
                "border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                activeSection === tab.id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2 pb-0.5">
          <span className="text-sm text-muted-foreground">Currency</span>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="h-8 w-[120px] bg-background shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usd">USD ($)</SelectItem>
              <SelectItem value="eur">EUR (€)</SelectItem>
              <SelectItem value="gbp">GBP (£)</SelectItem>
              <SelectItem value="inr">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </nav>

      {/* MTU — scrolls away; not sticky */}
      <section className="space-y-4 py-8">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Monthly Tracked Users (MTU)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{mtuBlurb}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-5 py-6 shadow-sm">
          <Slider
            min={0}
            max={mtuTiers.length - 1}
            step={1}
            value={[mtuIndex]}
            onValueChange={(v) => setMtuIndex(v[0] ?? defaultMtuIndex)}
            aria-label="Monthly Tracked Users"
          />
          <div className="mt-3 flex justify-between text-[11px] font-medium text-muted-foreground">
            {mtuTiers.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMtuIndex(i)}
                className={cn(
                  "tabular-nums transition-colors hover:text-foreground",
                  i === mtuIndex && "font-semibold text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plan header sticky only while this section is in view */}
      <section
        id="feature-list"
        className="rounded-xl border border-border bg-background shadow-sm"
      >
        <div ref={stickSentinelRef} className="h-px w-full" aria-hidden />
        <div
          className={cn(
            PLAN_GRID,
            "sticky z-20 border-b border-border bg-background"
          )}
          style={{ top: tabsHeight }}
        >
          <div
            className={cn(
              "border-r border-border",
              compact ? "p-3" : "p-4"
            )}
          >
            <h2 className="text-sm font-semibold text-foreground">
              Feature List
            </h2>
            <div className={cn("relative", compact ? "mt-2" : "mt-3")}>
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={featureQuery}
                onChange={(e) => setFeatureQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search features"
                className="h-9 bg-background pl-8 shadow-none"
              />
            </div>
            <label
              className={cn(
                "flex cursor-pointer items-center gap-2 text-sm text-foreground",
                compact ? "mt-2" : "mt-3"
              )}
            >
              <Checkbox
                checked={diffOnly}
                onCheckedChange={(v) => setDiffOnly(v === true)}
              />
              Show Differences Only
            </label>
          </div>
          {planColumns.map((plan) => {
            const isActiveCol = plan.id === activeSubscriptionPlan;
            const showActiveBanner = isActiveCol && !compact;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative border-r border-border last:border-r-0",
                  compact ? "p-3" : "p-4",
                  plan.id === "growth" && "bg-muted/20"
                )}
              >
                {showActiveBanner ? (
                  <div className="absolute inset-x-2 top-2 rounded-full bg-[var(--success-bg)] px-2 py-1 text-center text-[10px] font-semibold leading-tight text-[var(--success-fg)]">
                    {activeSubscriptionLabel}
                  </div>
                ) : null}
                <div className={cn(showActiveBanner && "pt-8")}>
                  <h3 className="text-base font-semibold text-foreground">
                    {plan.name}
                  </h3>
                  {!compact ? (
                    <p className="mt-1 min-h-[2.5rem] text-xs text-muted-foreground">
                      {plan.blurb}
                    </p>
                  ) : null}

                  {plan.id === "starter" ? (
                    <p
                      className={cn(
                        "font-semibold text-foreground",
                        compact ? "mt-2 text-xl" : "mt-3 text-2xl"
                      )}
                    >
                      Free
                    </p>
                  ) : plan.id === "growth" ? (
                    tier.growthSale != null && tier.growthList != null ? (
                      <div
                        className={cn(
                          compact ? "mt-2 space-y-0.5" : "mt-3 space-y-1"
                        )}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm text-muted-foreground line-through">
                            {formatUsd(tier.growthList)}
                          </span>
                          <span className="rounded-full bg-[var(--success-bg)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--success-fg)]">
                            Save {savePct}%
                          </span>
                        </div>
                        <p className="text-xl font-semibold text-foreground">
                          {formatUsd(tier.growthSale)}
                          <span className="text-sm font-normal text-muted-foreground">
                            {" "}
                            /mo
                          </span>
                        </p>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                        >
                          billed annually
                          <ChevronDown className="size-3" strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-foreground">
                        Custom pricing
                      </p>
                    )
                  ) : !compact ? (
                    <p className="mt-3 min-h-[4.5rem] text-sm font-medium text-muted-foreground">
                      Custom pricing
                    </p>
                  ) : null}

                  {plan.includes.length > 0 ? (
                    <ul
                      className={cn(
                        compact ? "mt-2 space-y-1" : "mt-3 space-y-1.5"
                      )}
                    >
                      {plan.includes.map((line) => (
                        <li
                          key={line}
                          className="flex items-center gap-1.5 text-xs text-foreground"
                        >
                          <Sparkles
                            className="size-3.5 shrink-0 text-[var(--status-analysis-fg)]"
                            strokeWidth={2}
                            aria-hidden
                          />
                          <button
                            type="button"
                            className="inline-flex items-center gap-0.5 font-medium underline-offset-2 hover:underline"
                          >
                            {line}
                            <ChevronRight
                              className="size-3"
                              strokeWidth={1.75}
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className={cn(compact ? "mt-3" : "mt-4")}>
                    <PlanCta
                      planId={plan.id}
                      label={plan.ctaLabel}
                      secondary={plan.secondaryCta}
                      compact={compact}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Accordion
          type="multiple"
          defaultValue={defaultOpenCategories}
          className="w-full"
        >
          {filteredCategories.map((cat) => (
            <AccordionItem
              key={cat.id}
              value={cat.id}
              className="border-b border-border last:border-b-0"
            >
              <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
                {cat.label}
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                {cat.rows.length === 0 ? (
                  <p className="px-4 pb-4 text-sm text-muted-foreground">
                    Feature details coming soon in this mock.
                  </p>
                ) : (
                  <ul>
                    {cat.rows.map((row) => (
                      <li
                        key={row.id}
                        className={cn(PLAN_GRID, "border-t border-border")}
                      >
                        <div className="border-r border-border px-4 py-3 text-sm text-foreground">
                          {row.label}
                        </div>
                        {planColumns.map((plan) => (
                          <div
                            key={plan.id}
                            className="flex items-center justify-center border-r border-border px-2 py-3 last:border-r-0"
                          >
                            <FeatureMark value={row.cells[plan.id]} />
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <div className="mt-12 space-y-12">
      {/* Wingify AI */}
      <section className="flex flex-wrap items-stretch gap-6 rounded-xl border border-[var(--status-analysis-bg)] bg-[var(--status-analysis-bg)] px-6 py-5">
        <div className="flex min-w-[12rem] max-w-xs flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--status-analysis-fg)]/15 text-[var(--status-analysis-fg)]">
              <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
            </span>
            <h2 className="text-base font-semibold text-foreground">
              Wingify AI
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Accelerate experimentation with AI analysis and assistants.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--status-analysis-fg)] underline-offset-2 hover:underline"
          >
            Explore Plans
            <ChevronRight className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Core
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {aiCore.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check
                    className="size-3.5 text-[var(--status-analysis-fg)]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Advanced
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground">
              {aiAdvanced.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check
                    className="size-3.5 text-[var(--status-analysis-fg)]"
                    strokeWidth={2}
                    aria-hidden
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button
          type="button"
          size="icon"
          className="ml-auto size-9 shrink-0 self-center shadow-none"
          aria-label="Back to feature list"
          onClick={() => scrollToSection("feature-list")}
        >
          <ChevronRight className="size-4 -rotate-90" strokeWidth={1.75} />
        </Button>
      </section>

      {/* Add-ons */}
      <section id="add-ons" className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Add-Ons</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Extend your plan with optional capabilities.
          </p>
        </div>
        <Tabs defaultValue="product" className="w-full">
          <TabsList className="h-auto justify-start gap-0 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger
              value="product"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Product Add-ons
            </TabsTrigger>
            <TabsTrigger
              value="account"
              className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Account Add-ons
            </TabsTrigger>
          </TabsList>
          <TabsContent value="product" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {productAddons.map((addon) => (
                <article
                  key={addon.id}
                  className="flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {addon.name}
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {addon.priceLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {addon.availability}
                  </p>
                  <button
                    type="button"
                    className="mt-3 self-start text-sm font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    View details
                  </button>
                  <Button type="button" className="mt-4 h-9 w-full shadow-none">
                    Contact Sales
                  </Button>
                </article>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="account" className="mt-4">
            <div className="grid gap-4 md:grid-cols-3">
              {accountAddons.map((addon) => (
                <article
                  key={addon.id}
                  className="flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm"
                >
                  <h3 className="text-sm font-semibold text-foreground">
                    {addon.name}
                  </h3>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {addon.priceLabel}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {addon.availability}
                  </p>
                  <button
                    type="button"
                    className="mt-3 self-start text-sm font-medium text-foreground underline-offset-2 hover:underline"
                  >
                    View details
                  </button>
                  <Button type="button" className="mt-4 h-9 w-full shadow-none">
                    Contact Sales
                  </Button>
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* FAQ */}
      <section id="faqs" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
          <button
            type="button"
            onClick={expandAllFaqs}
            className="text-sm font-medium text-foreground underline-offset-2 hover:underline"
          >
            Expand All
          </button>
        </div>
        <Accordion
          type="multiple"
          value={faqOpen}
          onValueChange={setFaqOpen}
          className="rounded-xl border border-border bg-background px-4 shadow-sm"
        >
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-sm font-medium hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-4">
          <button type="button" className="hover:text-foreground">
            Show logged-in users
          </button>
          <button type="button" className="hover:text-foreground">
            Uptime Status
          </button>
        </div>
        <span className="font-semibold tracking-tight text-foreground">
          wingify
        </span>
      </footer>
      </div>
    </div>
  );
}

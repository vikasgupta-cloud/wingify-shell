/** Upgrade → Wingz — Core / Advanced plans, prerequisite notice (not the 4-plan MTU layout). */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Info,
  Search,
  Sparkles,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  WINGZ_ACCOUNT_ADDONS,
  WINGZ_FAQS,
  WINGZ_FEATURE_CATEGORIES,
  WINGZ_PLANS,
  WINGZ_PRODUCT,
  WINGZ_PRODUCT_ADDONS,
  type WingzFeatureCell,
} from "@/data/upgradeWingz";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["feature-list", "add-ons", "faqs"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_TABS: { id: SectionId; label: string }[] = [
  { id: "feature-list", label: "Feature list" },
  { id: "add-ons", label: "Add-Ons" },
  { id: "faqs", label: "FAQs" },
];

const PLAN_GRID = "grid grid-cols-[minmax(12rem,1.4fr)_repeat(2,minmax(0,1fr))]";

function FeatureMark({ value }: { value: WingzFeatureCell }) {
  if (value) {
    return (
      <CheckCircle2
        className="mx-auto size-5 text-[var(--success-fg)]"
        strokeWidth={1.75}
        aria-label="Included"
      />
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

function scrollToSection(id: SectionId) {
  const sticky = document.getElementById("upgrade-sticky-tabs");
  const main = sticky?.closest("main") ?? document.querySelector("main");

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

export default function UpgradeWingzPage() {
  const [currency, setCurrency] = useState("usd");
  const [featureQuery, setFeatureQuery] = useState("");
  const [diffOnly, setDiffOnly] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<SectionId>("feature-list");
  const [compact, setCompact] = useState(false);
  const [creditTier, setCreditTier] = useState(
    WINGZ_PLANS.find((p) => p.id === "advanced")?.defaultCredit ??
      "5k credits / month"
  );
  const stickSentinelRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const [tabsHeight, setTabsHeight] = useState(0);

  const filteredCategories = useMemo(() => {
    const q = featureQuery.trim().toLowerCase();
    return WINGZ_FEATURE_CATEGORIES.map((cat) => {
      let rows = cat.rows;
      if (q) rows = rows.filter((r) => r.label.toLowerCase().includes(q));
      if (diffOnly) {
        rows = rows.filter((r) => r.cells.core !== r.cells.advanced);
      }
      return { ...cat, rows };
    }).filter(
      (cat) => !q || cat.rows.length > 0 || cat.label.toLowerCase().includes(q)
    );
  }, [featureQuery, diffOnly]);

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
      ([entry]) => setCompact(!entry?.isIntersecting),
      {
        root: root instanceof HTMLElement ? root : null,
        threshold: 0,
        rootMargin: `-${tabsHeight}px 0px 0px 0px`,
      }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tabsHeight]);

  return (
    <div className="mx-auto w-full max-w-6xl px-8 pb-20 pt-4">
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

      {/* Product intro — scrolls away */}
      <div className="flex flex-wrap items-start justify-between gap-6 py-8">
        <div className="flex min-w-0 max-w-3xl gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground">
            <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {WINGZ_PRODUCT.name}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {WINGZ_PRODUCT.description}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
        <Info
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
        <p>{WINGZ_PRODUCT.prerequisite}</p>
      </div>

      <section
        id="feature-list"
        className="rounded-xl border border-border bg-background shadow-sm"
      >
        <div ref={stickSentinelRef} className="h-px w-full" aria-hidden />
        <div
          className={cn(PLAN_GRID, "sticky z-20 border-b border-border bg-background")}
          style={{ top: tabsHeight }}
        >
          <div className={cn("border-r border-border", compact ? "p-3" : "p-4")}>
            <h2 className="text-sm font-semibold text-foreground">Feature List</h2>
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

          {WINGZ_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "border-r border-border last:border-r-0",
                compact ? "p-3" : "p-4",
                plan.id === "advanced" && "bg-muted/20"
              )}
            >
              <h3 className="text-base font-semibold text-foreground">
                {plan.name}
              </h3>
              {!compact ? (
                <p className="mt-1 min-h-[2.5rem] text-xs text-muted-foreground">
                  {plan.blurb}
                </p>
              ) : null}
              <p
                className={cn(
                  "font-semibold text-foreground",
                  compact ? "mt-2 text-lg" : "mt-3 text-xl"
                )}
              >
                {plan.priceLabel}
              </p>
              {plan.creditOptions ? (
                <div className={cn(compact ? "mt-2" : "mt-3")}>
                  <Select value={creditTier} onValueChange={setCreditTier}>
                    <SelectTrigger className="h-8 bg-background shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {plan.creditOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
              {plan.cta === "request" ? (
                <Button
                  type="button"
                  variant="outline"
                  className={cn("w-full shadow-none", compact ? "mt-3 h-8" : "mt-4 h-9")}
                >
                  {plan.ctaLabel}
                </Button>
              ) : null}
            </div>
          ))}
        </div>

        <Accordion
          type="multiple"
          defaultValue={["capabilities"]}
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
                <ul>
                  {cat.rows.map((row) => (
                    <li
                      key={row.id}
                      className={cn(PLAN_GRID, "border-t border-border")}
                    >
                      <div className="border-r border-border px-4 py-3 text-sm text-foreground">
                        {row.label}
                      </div>
                      {WINGZ_PLANS.map((plan) => (
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
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <div className="mt-12 space-y-12">
        <section id="add-ons" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add-Ons</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional capabilities for Advanced Wingz.
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
              <div className="grid gap-4 md:grid-cols-2">
                {WINGZ_PRODUCT_ADDONS.map((addon) => (
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
              <div className="grid gap-4 md:grid-cols-2">
                {WINGZ_ACCOUNT_ADDONS.map((addon) => (
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

        <section id="faqs" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground">
              Frequently Asked Questions
            </h2>
            <button
              type="button"
              onClick={() => setFaqOpen(WINGZ_FAQS.map((f) => f.id))}
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
            {WINGZ_FAQS.map((faq) => (
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

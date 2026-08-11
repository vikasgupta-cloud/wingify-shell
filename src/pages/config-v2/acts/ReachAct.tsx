import { useRef } from "react";
import { Plus, Trash2 } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigV2Store } from "../../../store/configV2";
import type { UrlPredicate } from "../../../store/config";
import { ALL_SEGMENT_LABELS } from "../../../config/segments";
import { useExperimentReadiness } from "../../../lib/useExperimentReadiness";
import { DAILY_VISITORS } from "../../../data/siteAnalytics";

const PREDICATES: UrlPredicate[] = [
  "URL matches",
  "URL contains",
  "URL starts with",
  "URL ends with",
  "URL matches pattern",
  "URL matches regex",
];
const TRIGGERS = [
  "Page Viewed",
  "Element Clicked",
  "Element Visible",
  "Custom Event",
];
const FREQUENCIES = ["Always", "Once per visitor", "Once per session"];

const SURFACE_PHRASE: Record<string, string> = {
  home: "the homepage",
  collection: "collection pages",
  product: "product pages",
  cart: "the cart",
  checkout: "checkout",
  account: "account pages",
  landing: "landing pages",
};

function Fragment({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded underline decoration-dotted underline-offset-4 hover:decoration-solid focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}

export default function ReachAct({ campaignId }: { campaignId: string }) {
  const config = useConfigV2Store((s) => s.configs[campaignId]);
  const patchV2 = useConfigV2Store((s) => s.patchV2);
  const addRule = useConfigV2Store((s) => s.addRule);
  const removeRule = useConfigV2Store((s) => s.removeRule);
  const updateRule = useConfigV2Store((s) => s.updateRule);
  const addExcludeGroup = useConfigV2Store((s) => s.addExcludeGroup);
  const selectSegment = useConfigV2Store((s) => s.selectSegment);
  const model = useExperimentReadiness(campaignId);

  const pagesRef = useRef<HTMLDivElement>(null);
  const audienceRef = useRef<HTMLDivElement>(null);
  const trafficRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  if (!config) return null;

  const focus = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "auto", block: "center" });
    ref.current?.querySelector<HTMLElement>("input,button,[role=combobox]")?.focus();
  };

  const surfaceLabel = model ? SURFACE_PHRASE[model.surface] : "collection pages";
  const fraction =
    model && DAILY_VISITORS[model.surface] > 0
      ? Math.round((model.dailyIntoTest / DAILY_VISITORS[model.surface]) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* LIVE SENTENCE — the interface */}
      <section className="rounded-lg border border-border bg-muted/20 px-6 py-8">
        <p className="text-2xl font-medium leading-relaxed text-foreground">
          <Fragment onClick={() => focus(trafficRef)}>
            {config.trafficAllocation}%
          </Fragment>{" "}
          of{" "}
          <Fragment onClick={() => focus(audienceRef)}>{config.segment}</Fragment>{" "}
          landing on{" "}
          <Fragment onClick={() => focus(pagesRef)}>{surfaceLabel}</Fragment>,{" "}
          <Fragment onClick={() => focus(triggerRef)}>
            on {config.trigger.toLowerCase()}
          </Fragment>
          .
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Click any part to adjust it below.
        </p>
      </section>

      {/* MECHANICS */}
      <section className="space-y-8 rounded-lg border border-border bg-background p-6">
        {/* Pages */}
        <div ref={pagesRef} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Pages</h3>
          {config.pageGroups.map((group) => (
            <div key={group.id} className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.kind === "include" ? "Include" : "Exclude"}
              </p>
              {group.rules.map((rule) => (
                <div key={rule.id} className="flex items-center gap-2">
                  <Select
                    value={rule.predicate}
                    onValueChange={(v) =>
                      updateRule(campaignId, group.id, rule.id, {
                        predicate: v as UrlPredicate,
                      })
                    }
                  >
                    <SelectTrigger className="w-[190px]" aria-label="URL predicate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDICATES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={rule.value}
                    placeholder="https://…"
                    onChange={(e) =>
                      updateRule(campaignId, group.id, rule.id, {
                        value: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <button
                    type="button"
                    aria-label="Remove rule"
                    onClick={() => removeRule(campaignId, group.id, rule.id)}
                    className="text-muted-foreground hover:text-danger-fg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => addRule(campaignId, group.id)}
              >
                <Plus className="h-4 w-4" />
                Add URL
              </Button>
            </div>
          ))}
          {!config.pageGroups.some((g) => g.kind === "exclude") && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => addExcludeGroup(campaignId)}
            >
              <Plus className="h-4 w-4" />
              Add exclude rule
            </Button>
          )}
        </div>

        <div className="h-px bg-border" />

        {/* Audience */}
        <div ref={audienceRef} className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Audience</h3>
          <Select
            value={config.segment}
            onValueChange={(v) => selectSegment(campaignId, v)}
          >
            <SelectTrigger className="w-[280px]" aria-label="Segment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_SEGMENT_LABELS.map((label) => (
                <SelectItem key={label} value={label}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="h-px bg-border" />

        {/* Traffic */}
        <div ref={trafficRef} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Traffic allocation
            </h3>
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {config.trafficAllocation}%
            </span>
          </div>
          <Slider
            value={[config.trafficAllocation]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) =>
              patchV2(campaignId, { trafficAllocation: v })
            }
            aria-label="Traffic allocation"
          />
        </div>

        <div className="h-px bg-border" />

        {/* Trigger + frequency */}
        <div ref={triggerRef} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">Trigger</h3>
            <Select
              value={config.trigger}
              onValueChange={(v) => patchV2(campaignId, { trigger: v })}
            >
              <SelectTrigger aria-label="Trigger">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold text-foreground">Frequency</h3>
            <Select
              value={config.frequency}
              onValueChange={(v) => patchV2(campaignId, { frequency: v })}
            >
              <SelectTrigger aria-label="Frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* REACH READOUT */}
      <section className="flex flex-wrap gap-x-10 gap-y-2 rounded-lg border border-border bg-muted/20 px-6 py-4">
        <div>
          <div className="text-xs text-muted-foreground">Visitors/day into test</div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {model ? Math.round(model.dailyIntoTest).toLocaleString() : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">
            Share of this surface's traffic
          </div>
          <div className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
            {fraction}%
          </div>
        </div>
      </section>
    </div>
  );
}

import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigV2Store } from "../../../store/configV2";
import { METRICS, metricById } from "../../../data/metrics";
import { baselineRate } from "../../../data/siteAnalytics";
import { useExperimentReadiness } from "../../../lib/useExperimentReadiness";

// De-duplicated metric catalog (names repeat across categories in the source).
const METRIC_OPTIONS = (() => {
  const seen = new Set<string>();
  return METRICS.filter((m) => {
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
})();

const SURFACE_PHRASE: Record<string, string> = {
  home: "the homepage",
  collection: "collection pages",
  product: "product pages",
  cart: "the cart",
  checkout: "checkout",
  account: "account pages",
  landing: "landing pages",
};

const CONFIDENCE_NOTE: Record<number, string> = {
  90: "Fastest to conclude, but a higher chance of a false positive.",
  95: "The balanced default — a solid guard against chance results.",
  99: "Strictest evidence bar; expect the longest run to significance.",
};

function MetricChips({
  ids,
  onRemove,
}: {
  ids: string[];
  onRemove: (id: string) => void;
}) {
  if (ids.length === 0)
    return <p className="text-xs text-muted-foreground">None selected.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const m = metricById(id);
        return (
          <span
            key={id}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background py-0.5 pl-2 pr-1 text-xs text-foreground"
          >
            {m?.name ?? id}
            <button
              type="button"
              aria-label={`Remove ${m?.name ?? id}`}
              onClick={() => onRemove(id)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}

function AddMetric({
  exclude,
  onAdd,
  label,
}: {
  exclude: string[];
  onAdd: (id: string) => void;
  label: string;
}) {
  const options = METRIC_OPTIONS.filter((m) => !exclude.includes(m.id));
  return (
    <Select value="" onValueChange={(v) => v && onAdd(v)}>
      <SelectTrigger className="w-[240px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {options.map((m) => (
          <SelectItem key={m.id} value={m.id}>
            {m.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function VerdictAct({ campaignId }: { campaignId: string }) {
  const config = useConfigV2Store((s) => s.configs[campaignId]);
  const patchV2 = useConfigV2Store((s) => s.patchV2);
  const patchDecisionRule = useConfigV2Store((s) => s.patchDecisionRule);
  const model = useExperimentReadiness(campaignId);

  if (!config) return null;

  const surface = model?.surface ?? "collection";
  const successName = config.successMetric
    ? metricById(config.successMetric)?.name
    : undefined;
  const baseline = successName ? baselineRate(successName, surface) : null;

  const dr = config.decisionRule;

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            How we'll judge it
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One metric decides the outcome. Everything else is context.
          </p>
        </div>

        {/* Success metric */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Success metric
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={config.successMetric ?? ""}
              onValueChange={(v) => patchV2(campaignId, { successMetric: v })}
            >
              <SelectTrigger className="w-[280px]" aria-label="Success metric">
                <SelectValue placeholder="Choose the deciding metric" />
              </SelectTrigger>
              <SelectContent>
                {METRIC_OPTIONS.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {baseline !== null && (
              <span className="text-sm text-muted-foreground">
                Baseline on {SURFACE_PHRASE[surface]}:{" "}
                <span className="font-semibold tabular-nums text-foreground">
                  {baseline}%
                </span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            This is the number the forecast rests on.
          </p>
        </div>

        {/* Observation metrics */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Observation metrics
          </label>
          <MetricChips
            ids={config.observationMetrics}
            onRemove={(id) =>
              patchV2(campaignId, {
                observationMetrics: config.observationMetrics.filter(
                  (m) => m !== id
                ),
              })
            }
          />
          <AddMetric
            label="Add observation metric"
            exclude={config.observationMetrics}
            onAdd={(id) =>
              patchV2(campaignId, {
                observationMetrics: [...config.observationMetrics, id],
              })
            }
          />
        </div>

        {/* Guardrails */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Guardrail metrics
          </label>
          <MetricChips
            ids={config.protectionMetrics}
            onRemove={(id) =>
              patchV2(campaignId, {
                protectionMetrics: config.protectionMetrics.filter(
                  (m) => m !== id
                ),
              })
            }
          />
          <AddMetric
            label="Add guardrail metric"
            exclude={config.protectionMetrics}
            onAdd={(id) =>
              patchV2(campaignId, {
                protectionMetrics: [...config.protectionMetrics, id],
              })
            }
          />
        </div>
      </section>

      {/* DECISION RULE */}
      <section className="space-y-5 rounded-lg border border-border bg-muted/20 p-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Decide before you look
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Set the bar and the actions now, while you're still objective.
          </p>
        </div>

        {/* Confidence threshold */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Confidence threshold
          </label>
          <Select
            value={String(dr.confidenceThresholdPct)}
            onValueChange={(v) =>
              patchDecisionRule(campaignId, {
                confidenceThresholdPct: Number(v),
              })
            }
          >
            <SelectTrigger className="w-[130px]" aria-label="Confidence threshold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90">90%</SelectItem>
              <SelectItem value="95">95%</SelectItem>
              <SelectItem value="99">99%</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {CONFIDENCE_NOTE[dr.confidenceThresholdPct] ??
              CONFIDENCE_NOTE[95]}
          </p>
        </div>

        {/* Minimum runtime */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Minimum runtime
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={120}
              value={dr.minRuntimeDays}
              onChange={(e) =>
                patchDecisionRule(campaignId, {
                  minRuntimeDays: Math.max(1, Number(e.target.value) || 1),
                })
              }
              className="h-8 w-20 text-right tabular-nums"
              aria-label="Minimum runtime in days"
            />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Run at least two full weekly cycles to avoid day-of-week bias.
          </p>
        </div>

        {/* Commitments */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              If it wins, we will…
            </label>
            <Input
              value={dr.ifWins}
              onChange={(e) =>
                patchDecisionRule(campaignId, { ifWins: e.target.value })
              }
              placeholder="Ship it to 100% and monitor guardrails for a week."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              If it loses, we will…
            </label>
            <Input
              value={dr.ifLoses}
              onChange={(e) =>
                patchDecisionRule(campaignId, { ifLoses: e.target.value })
              }
              placeholder="Roll back and log the learning; don't re-run without a new idea."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              If it's inconclusive, we will…
            </label>
            <Input
              value={dr.ifInconclusive}
              onChange={(e) =>
                patchDecisionRule(campaignId, {
                  ifInconclusive: e.target.value,
                })
              }
              placeholder="Keep the control and try a bolder variation next."
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Committing now is the simplest guard against reading the result you
          hoped for.
        </p>
      </section>
    </div>
  );
}

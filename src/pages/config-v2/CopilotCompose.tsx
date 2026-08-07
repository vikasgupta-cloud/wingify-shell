import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVisibleCampaigns } from "../../store/rows";
import { METRICS } from "../../data/metrics";
import {
  draftFromPrompt,
  EXAMPLE_PROMPTS,
  type CopilotDraft,
} from "../../data/copilotDrafts";
import { buildReadinessModel } from "../../lib/useExperimentReadiness";
import { applyCopilotDraft } from "../../lib/applyCopilotDraft";
import { baselineRate, surfaceForUrl } from "../../data/siteAnalytics";

const DRAFTING_MS = 800;

function metricIdByName(name: string): string | null {
  return METRICS.find((m) => m.name === name)?.id ?? null;
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm tabular-nums text-foreground">{value}</span>
    </div>
  );
}

export default function CopilotCompose() {
  const navigate = useNavigate();
  const campaigns = useVisibleCampaigns();
  const [prompt, setPrompt] = useState("");
  const [stage, setStage] = useState<"compose" | "drafting" | "review">(
    "compose"
  );
  const [draft, setDraft] = useState<CopilotDraft | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (stage === "compose") textareaRef.current?.focus();
  }, [stage]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // Forecast for the drafted config, via the SAME engine the rail uses.
  const forecast = useMemo(() => {
    if (!draft) return null;
    return buildReadinessModel(
      {
        pageGroups: [
          {
            id: "draft-pg",
            kind: "include",
            rules: [
              {
                id: "draft-rule",
                predicate: "URL matches",
                value: draft.pageUrl,
                settings: {
                  ignoreQueryString: true,
                  ignoreFragment: true,
                  caseInsensitive: true,
                },
              },
            ],
          },
        ],
        successMetric: metricIdByName(draft.successMetricName),
        variations: draft.variations.map((v, i) => ({
          id: i === 0 ? "control" : `draft-${i}`,
          label: v.label,
          name: v.name,
          split: 0,
          modifications: 0,
          type: "editor" as const,
        })),
        trafficAllocation: draft.trafficAllocation,
        segment: draft.segmentLabel,
        observationMetrics: draft.observationMetricNames
          .map(metricIdByName)
          .filter((m): m is string => Boolean(m)),
        decisionRule: draft.decisionRule,
      },
      undefined,
      campaigns,
      "draft-preview"
    );
  }, [draft, campaigns]);

  const runDraft = () => {
    if (!prompt.trim()) return;
    const result = draftFromPrompt(prompt);
    setStage("drafting");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDraft(result);
      setStage("review");
    }, DRAFTING_MS);
  };

  const createCampaign = () => {
    if (!draft) return;
    const id = applyCopilotDraft(draft);
    navigate(`/web-experiment/c/${id}/configure-v2`);
  };

  // ── STAGE A: COMPOSE ───────────────────────────────────────────────────────
  if (stage === "compose" || stage === "drafting") {
    const drafting = stage === "drafting";
    return (
      <div className="min-h-full bg-canvas">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-[640px] flex-col justify-center px-6 py-16">
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background">
              <Sparkles className="h-5 w-5 text-foreground" aria-hidden />
            </span>
            <h1 className="mt-4 text-2xl font-semibold text-foreground">
              Create with Copilot
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe the test you want to run.
            </p>
          </div>

          <div className="mt-8">
            <Textarea
              ref={textareaRef}
              value={prompt}
              disabled={drafting}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runDraft();
              }}
              placeholder={EXAMPLE_PROMPTS[0]}
              className="min-h-[120px] resize-y text-base"
            />

            {!drafting && (
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-5 flex justify-center">
              <Button type="button" disabled={!prompt.trim() || drafting} onClick={runDraft}>
                <Sparkles className="h-4 w-4" />
                {drafting ? "Drafting…" : "Draft campaign"}
              </Button>
            </div>
          </div>

          {drafting && (
            <div
              className="mt-10 space-y-3 motion-reduce:animate-none"
              aria-hidden
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STAGE B: REVIEW ────────────────────────────────────────────────────────
  if (!draft) return null;
  const surface = surfaceForUrl(draft.pageUrl);
  const baseline = baselineRate(draft.successMetricName, surface);
  const forecastLabel =
    forecast && Number.isFinite(forecast.daysToSignificance)
      ? `~${forecast.daysToSignificance} days`
      : "Can't reach significance";

  return (
    <div className="min-h-full bg-canvas">
      <div className="mx-auto w-full max-w-[760px] px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" aria-hidden />
          Copilot drafted your campaign
        </div>
        <h1 className="mt-2 text-xl font-semibold text-foreground">
          {draft.summary}
        </h1>

        {/* FORECAST STRIP */}
        <div className="mt-5 flex flex-wrap items-center gap-x-10 gap-y-2 rounded-lg border border-border bg-muted/20 px-5 py-4">
          <div>
            <div className="text-xs text-muted-foreground">To significance</div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              {forecastLabel}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Visitors/day in test</div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              {forecast ? Math.round(forecast.dailyIntoTest).toLocaleString() : "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Baseline rate</div>
            <div className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
              {baseline}%
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {/* IDEA */}
          <Card title="Idea">
            <div className="flex items-start gap-2">
              {draft.hypothesisId && (
                <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-md border border-border bg-muted px-1.5 text-[11px] font-medium uppercase text-muted-foreground">
                  {draft.hypothesisId}
                </span>
              )}
              <p className="text-sm font-medium text-foreground">
                {draft.hypothesisText}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {draft.variations.map((v) => (
                <li key={v.label} className="flex items-start gap-2 text-sm">
                  <span className="inline-flex h-5 w-6 shrink-0 items-center justify-center rounded border border-border bg-muted text-[11px] font-medium text-muted-foreground">
                    {v.label}
                  </span>
                  <span className="text-foreground">
                    <span className="font-medium">{v.name}</span>{" "}
                    <span className="text-muted-foreground">— {v.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* REACH */}
          <Card title="Reach">
            <p className="text-base text-foreground">
              <span className="font-semibold tabular-nums">
                {draft.trafficAllocation}%
              </span>{" "}
              of {draft.segmentLabel} landing on{" "}
              {surface === "home" ? "the homepage" : `${surface} pages`}.
            </p>
            <div className="mt-3">
              <Row label="Page URL" value={draft.pageUrl} />
              <Row label="Audience" value={draft.segmentLabel} />
              <Row label="Campaign type" value={draft.campaignType} />
            </div>
          </Card>

          {/* VERDICT */}
          <Card title="Verdict">
            <Row
              label="Success metric"
              value={`${draft.successMetricName} · baseline ${baseline}%`}
            />
            <Row
              label="Observation metrics"
              value={draft.observationMetricNames.join(", ") || "None"}
            />
            <div className="mt-3 rounded-md border border-border bg-muted/20 p-3">
              <Row
                label="Confidence"
                value={`${draft.decisionRule.confidenceThresholdPct}%`}
              />
              <Row
                label="Minimum runtime"
                value={`${draft.decisionRule.minRuntimeDays} days`}
              />
              <div className="mt-2 space-y-1 text-sm">
                <p className="text-foreground">
                  <span className="text-muted-foreground">If it wins — </span>
                  {draft.decisionRule.ifWins}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">If it loses — </span>
                  {draft.decisionRule.ifLoses}
                </p>
                <p className="text-foreground">
                  <span className="text-muted-foreground">If inconclusive — </span>
                  {draft.decisionRule.ifInconclusive}
                </p>
              </div>
            </div>
          </Card>

          {/* WHY THIS DRAFT */}
          <Card title="Why this draft">
            <ul className="space-y-2">
              {draft.rationale.map((r) => (
                <li key={r.field} className="text-sm leading-relaxed">
                  <span className="font-medium text-foreground">{r.field}</span>
                  <span className="text-muted-foreground"> — {r.why}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* FOOTER */}
        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setStage("compose");
              setDraft(null);
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Start over
          </Button>
          <Button type="button" onClick={createCampaign}>
            Create campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

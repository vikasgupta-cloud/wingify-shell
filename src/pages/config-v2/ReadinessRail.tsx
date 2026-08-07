import { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useExperimentReadiness,
  DEFAULT_MDE_PCT,
} from "../../lib/useExperimentReadiness";
import type { ReadinessLevel, ReadinessFinding } from "../../lib/experimentReadiness";

// Worst-level ordering for the summary word + finding sort.
const LEVEL_RANK: Record<ReadinessLevel, number> = {
  blocked: 0,
  warn: 1,
  ok: 2,
};

const LEVEL_ICON: Record<ReadinessLevel, LucideIcon> = {
  ok: Check,
  warn: AlertTriangle,
  blocked: AlertCircle,
};

// Icon colour is the ONLY place status/success/danger tokens are used; all text
// stays grayscale (foreground / muted-foreground).
const LEVEL_ICON_CLASS: Record<ReadinessLevel, string> = {
  ok: "text-success-fg",
  warn: "text-foreground",
  blocked: "text-danger-fg",
};

const STATE_WORD: Record<ReadinessLevel, { label: string; className: string }> = {
  ok: { label: "Looks ready to run", className: "text-success-fg" },
  warn: { label: "Worth a second look", className: "text-foreground" },
  blocked: { label: "Not ready yet", className: "text-danger-fg" },
};

function worstLevel(findings: ReadinessFinding[]): ReadinessLevel {
  let worst: ReadinessLevel = "ok";
  for (const f of findings) {
    if (LEVEL_RANK[f.level] < LEVEL_RANK[worst]) worst = f.level;
  }
  return worst;
}

function formatDays(days: number): string {
  if (!Number.isFinite(days)) return "Can't reach significance";
  return `~${days.toLocaleString()} day${days === 1 ? "" : "s"}`;
}

function ReachRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm tabular-nums text-foreground">{value}</span>
    </div>
  );
}

function FindingItem({ finding }: { finding: ReadinessFinding }) {
  const Icon = LEVEL_ICON[finding.level];
  return (
    <li className="flex gap-2.5 py-2.5">
      <Icon
        className={cn("mt-0.5 h-4 w-4 shrink-0", LEVEL_ICON_CLASS[finding.level])}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{finding.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {finding.detail}
        </p>
      </div>
    </li>
  );
}

export default function ReadinessRail({ campaignId }: { campaignId: string }) {
  // Local probe for "the flip side" — how small a lift is detectable in N days.
  const [probeDays, setProbeDays] = useState(14);
  const model = useExperimentReadiness(campaignId);

  if (!model) {
    return (
      <aside className="rounded-lg border border-border bg-background p-5 text-sm text-muted-foreground">
        Configure the campaign to see a readiness forecast.
      </aside>
    );
  }

  const level = worstLevel(model.findings);
  const state = STATE_WORD[level];
  const sortedFindings = [...model.findings].sort(
    (a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level]
  );

  const clampedProbe = Math.min(90, Math.max(3, probeDays || 3));
  const probeMde = model.mdeAtDays(clampedProbe);
  const probeMdeLabel = Number.isFinite(probeMde)
    ? `${probeMde.toLocaleString()}%`
    : "no detectable lift";

  const surfaceLabel =
    model.surface.charAt(0).toUpperCase() + model.surface.slice(1);

  return (
    <aside className="flex max-h-[calc(100vh-7rem)] flex-col overflow-y-auto rounded-lg border border-border bg-background">
      {/* 1. HEADER */}
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">
          Experiment readiness
        </h2>
        <p className="mt-1 text-sm">
          <span className={cn("font-medium", state.className)}>
            {state.label}
          </span>
        </p>
      </div>

      {/* 2. FORECAST */}
      <div className="border-b border-border px-5 py-5">
        <div className="text-3xl font-semibold tabular-nums text-foreground">
          {formatDays(model.daysToSignificance)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          to significance
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>at {DEFAULT_MDE_PCT}% minimum detectable effect</p>
          <p className="tabular-nums">
            {Math.round(model.dailyIntoTest).toLocaleString()} visitors/day into
            the test
          </p>
          <p className="tabular-nums">
            {Number.isFinite(model.samplePerVariant)
              ? model.samplePerVariant.toLocaleString()
              : "—"}{" "}
            per variation needed
          </p>
        </div>
      </div>

      {/* 3. THE FLIP SIDE */}
      <div className="border-b border-border px-5 py-4">
        <p className="text-sm leading-relaxed text-foreground">
          In{" "}
          <input
            type="number"
            min={3}
            max={90}
            value={probeDays}
            onChange={(e) => setProbeDays(Number(e.target.value))}
            aria-label="Days to probe"
            className="mx-0.5 w-14 rounded-md border border-input bg-background px-2 py-1 text-sm tabular-nums text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
          />{" "}
          days you can detect a lift of{" "}
          <span className="font-semibold tabular-nums">{probeMdeLabel}</span> or
          more.
        </p>
      </div>

      {/* 4. REACH */}
      <div className="border-b border-border px-5 py-3">
        <ReachRow label="Surface" value={surfaceLabel} />
        <ReachRow label="Baseline rate" value={`${model.baselineRatePct}%`} />
        <ReachRow label="Variations" value={String(model.variantCount)} />
      </div>

      {/* 5. FINDINGS */}
      <div className="flex-1 px-5 py-3">
        {sortedFindings.length === 0 ? (
          <ul>
            <FindingItem
              finding={{
                id: "none",
                level: "ok",
                title: "No issues detected",
                detail: "Nothing is blocking or slowing this test right now.",
              }}
            />
          </ul>
        ) : (
          <ul className="divide-y divide-border">
            {sortedFindings.map((f) => (
              <FindingItem key={f.id} finding={f} />
            ))}
          </ul>
        )}
      </div>

      {/* 6. BRIEF */}
      <div className="px-5 pb-5 pt-1">
        <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            In plain words
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">
            {model.briefSentence}
          </p>
        </div>
      </div>
    </aside>
  );
}

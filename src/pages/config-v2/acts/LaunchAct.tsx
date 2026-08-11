import { useState } from "react";
import { AlertCircle, AlertTriangle, Check, CircleDashed } from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfigV2Store } from "../../../store/configV2";
import { useExperimentReadiness } from "../../../lib/useExperimentReadiness";
import type { ReadinessLevel } from "../../../lib/experimentReadiness";

const INTEGRATIONS = ["Google Analytics 4", "Segment", "Mixpanel", "Slack alerts"];

function ChecklistRow({
  done,
  title,
  hint,
  children,
}: {
  done: boolean;
  title: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-4 last:border-0">
      {done ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-fg" aria-hidden />
      ) : (
        <CircleDashed
          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

export default function LaunchAct({ campaignId }: { campaignId: string }) {
  const config = useConfigV2Store((s) => s.configs[campaignId]);
  const patchV2 = useConfigV2Store((s) => s.patchV2);
  const model = useExperimentReadiness(campaignId);
  const [connected, setConnected] = useState<string[]>([]);

  if (!config) return null;

  const blocked = model?.findings.filter((f) => f.level === "blocked") ?? [];
  const warnings = model?.findings.filter((f) => f.level === "warn") ?? [];
  const canLaunch = blocked.length === 0;

  const qa = config.qa;
  const setQa = (partial: Partial<typeof qa>) =>
    patchV2(campaignId, { qa: { ...qa, ...partial } });

  const levelIcon: Record<ReadinessLevel, typeof Check> = {
    ok: Check,
    warn: AlertTriangle,
    blocked: AlertCircle,
  };
  const levelClass: Record<ReadinessLevel, string> = {
    ok: "text-success-fg",
    warn: "text-foreground",
    blocked: "text-danger-fg",
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Before you launch
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A few optional steps, then the readiness check.
        </p>
      </div>

      {/* CHECKLIST */}
      <section className="rounded-lg border border-border bg-background px-6">
        <ChecklistRow
          done={connected.length > 0}
          title="Integrations"
          hint="Optional — forward results to your analytics or alerting tools."
        >
          <div className="flex flex-wrap gap-2">
            {INTEGRATIONS.map((name) => {
              const on = connected.includes(name);
              return (
                <Button
                  key={name}
                  type="button"
                  variant={on ? "secondary" : "outline"}
                  size="sm"
                  onClick={() =>
                    setConnected((prev) =>
                      on ? prev.filter((n) => n !== name) : [...prev, name]
                    )
                  }
                >
                  {on ? <Check className="h-3.5 w-3.5" /> : null}
                  {name}
                </Button>
              );
            })}
          </div>
        </ChecklistRow>

        <ChecklistRow
          done={Boolean(qa.previewUrl.trim())}
          title="QA & preview"
          hint="Optional — preview a variation and set a debug URL before going live."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Preview variation
              </label>
              <Select
                value={qa.previewVariationId}
                onValueChange={(v) => setQa({ previewVariationId: v })}
              >
                <SelectTrigger className="h-8" aria-label="Preview variation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.variations.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Preview URL
              </label>
              <Input
                value={qa.previewUrl}
                placeholder="https://"
                onChange={(e) => setQa({ previewUrl: e.target.value })}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Debug URL
              </label>
              <Input
                value={qa.debugUrl}
                placeholder="https://…?vwo_debug=1"
                onChange={(e) => setQa({ debugUrl: e.target.value })}
                className="h-8"
              />
            </div>
          </div>
        </ChecklistRow>

        <ChecklistRow
          done
          title="Advanced settings"
          hint="Statistical model and privacy — sensible defaults are already applied."
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="advanced" className="border-0">
              <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
                Show advanced settings
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <span className="text-muted-foreground">Stats model</span>
                    <span className="tabular-nums text-foreground">
                      {config.smartStats.statsModel}
                    </span>
                    <span className="text-muted-foreground">Approach</span>
                    <span className="text-foreground">
                      {config.smartStats.testingApproach}
                    </span>
                    <span className="text-muted-foreground">
                      Multiple-testing correction
                    </span>
                    <span className="text-foreground">
                      {config.smartStats.multipleTestingCorrection}
                    </span>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={config.trackAcrossDomains}
                      onCheckedChange={(c) =>
                        patchV2(campaignId, { trackAcrossDomains: c === true })
                      }
                    />
                    Track visitors across domains
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={config.hideCampaignNames}
                      onCheckedChange={(c) =>
                        patchV2(campaignId, { hideCampaignNames: c === true })
                      }
                    />
                    Hide campaign names from the page source
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ChecklistRow>
      </section>

      {/* READINESS SUMMARY */}
      <section className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-base font-semibold text-foreground">
            Readiness check
          </h3>
          <span className="text-sm tabular-nums text-muted-foreground">
            {model && Number.isFinite(model.daysToSignificance)
              ? `~${model.daysToSignificance} days to significance`
              : "Can't reach significance"}
          </span>
        </div>

        {(blocked.length > 0 || warnings.length > 0) && (
          <ul className="mt-4 divide-y divide-border">
            {[...blocked, ...warnings].map((f) => {
              const Icon = levelIcon[f.level];
              return (
                <li key={f.id} className="flex gap-2.5 py-2.5">
                  <Icon
                    className={cn("mt-0.5 h-4 w-4 shrink-0", levelClass[f.level])}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {f.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {f.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5">
          <Button
            type="button"
            disabled={!canLaunch}
            onClick={() => {
              /* TODO: launch action is a stub. */
            }}
          >
            Launch campaign
          </Button>
          {!canLaunch && (
            <p className="mt-2 text-xs text-danger-fg">
              Blocked: {blocked.map((f) => f.title).join("; ")}.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

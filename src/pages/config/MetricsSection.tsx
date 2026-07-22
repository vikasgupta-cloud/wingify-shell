import { type ReactNode } from "react";
import { Eye, Shield, Star, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import AskWandzButton from "./AskWandzButton";
import MetricCard from "./MetricCard";
import MetricPicker from "./MetricPicker";

// The header row shared by each metric block.
function BlockHeader({
  icon: Icon,
  title,
  suffix,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  suffix?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex w-fit cursor-default items-center gap-1.5 text-sm font-medium text-foreground">
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              {title}
              {suffix && (
                <span className="font-normal text-muted-foreground">{suffix}</span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// The dashed empty-state box; its CTA (the metric picker trigger) lives inside.
function EmptyState({ message, cta }: { message: string; cta?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-input bg-background p-8">
      <p className="text-sm text-muted-foreground">{message}</p>
      {cta}
    </div>
  );
}

export default function MetricsSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const openWandz = useWandzStore((s) => s.openWandz);

  if (!config) return null;

  const { successMetric, observationMetrics, protectionMetrics } = config;
  const hasObservation = observationMetrics.length > 0;

  return (
    <section>
      {/* Heading row. */}
      <div className="mb-6 flex items-center gap-1">
        <h2 className="text-lg font-semibold text-foreground">Metrics</h2>
        <AskWandzButton
          onClick={() =>
            openWandz({ kind: "section", campaignId: id, sectionLabel: "Metrics" })
          }
        />
      </div>

      <div className="flex flex-col gap-8">
        {/* A — Success Metric. The header CTA appears only once a metric is
            chosen; while empty, the CTA lives inside the box. */}
        <div>
          <BlockHeader
            icon={Star}
            title="Success Metric"
            suffix="(Mandatory)"
            description="Decisions will be based on this metric."
            action={
              successMetric ? (
                <MetricPicker
                  mode="success"
                  campaignId={id}
                  align="end"
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      Choose another metric
                    </Button>
                  }
                />
              ) : undefined
            }
          />
          {successMetric ? (
            <MetricCard metricId={successMetric} campaignId={id} defaultExpanded />
          ) : (
            <EmptyState
              message="No success metric selected."
              cta={
                <MetricPicker
                  mode="success"
                  campaignId={id}
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      Choose a metric
                    </Button>
                  }
                />
              }
            />
          )}
        </div>

        {/* B — Observation Metric. Same pattern: header CTA only once metrics
            are selected; otherwise the CTA is inside the empty box. */}
        <div>
          <BlockHeader
            icon={Eye}
            title={
              hasObservation
                ? `Observation Metric (${observationMetrics.length})`
                : "Observation Metric"
            }
            suffix="(Optional)"
            description="Track additional metrics for deeper campaign insights."
            action={
              hasObservation ? (
                <MetricPicker
                  mode="observation"
                  campaignId={id}
                  align="end"
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      Select Metrics
                    </Button>
                  }
                />
              ) : undefined
            }
          />
          {hasObservation ? (
            <div className="flex flex-col gap-3">
              {observationMetrics.map((mid) => (
                <MetricCard key={mid} metricId={mid} campaignId={id} />
              ))}
            </div>
          ) : (
            <EmptyState
              message="No observation metrics."
              cta={
                <MetricPicker
                  mode="observation"
                  campaignId={id}
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      Select Metrics
                    </Button>
                  }
                />
              }
            />
          )}
        </div>

        {/* C — Protection Metric (only when there is at least one). */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
            protectionMetrics.length > 0
              ? "max-h-[4000px] translate-y-0 opacity-100"
              : "pointer-events-none max-h-0 -translate-y-1 opacity-0"
          )}
        >
          <BlockHeader
            icon={Shield}
            title={`Protection Metric (${protectionMetrics.length})`}
            description="These metrics help identify and mitigate risk. Protection metrics are also tracked as observational metrics."
            action={
              <MetricPicker
                mode="protection"
                campaignId={id}
                align="end"
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    Select Metrics
                  </Button>
                }
              />
            }
          />
          <div className="flex flex-col gap-3">
            {protectionMetrics.map((mid) => (
              <MetricCard key={mid} metricId={mid} campaignId={id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

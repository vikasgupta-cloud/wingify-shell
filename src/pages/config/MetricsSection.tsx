import { useState } from "react";
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

type Mode = "success" | "observation" | "protection";

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
  action: React.ReactNode;
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
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function EmptyState({
  message,
  onChoose,
}: {
  message: string;
  onChoose?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-input bg-background p-8">
      <p className="text-sm text-muted-foreground">{message}</p>
      {onChoose && (
        <Button type="button" variant="outline" size="sm" onClick={onChoose}>
          Choose a metric
        </Button>
      )}
    </div>
  );
}

export default function MetricsSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const openWandz = useWandzStore((s) => s.openWandz);
  const [picker, setPicker] = useState<Mode | null>(null);

  if (!config) return null;

  const { successMetric, observationMetrics, protectionMetrics } = config;

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
        {/* A — Success Metric. */}
        <div>
          <BlockHeader
            icon={Star}
            title="Success Metric"
            suffix="(Mandatory)"
            description="Decisions will be based on this metric."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPicker("success")}
              >
                {successMetric ? "Choose another metric" : "Choose a metric"}
              </Button>
            }
          />
          {successMetric ? (
            <MetricCard metricId={successMetric} campaignId={id} defaultExpanded />
          ) : (
            <EmptyState
              message="No success metric selected."
              onChoose={() => setPicker("success")}
            />
          )}
        </div>

        {/* B — Observation Metric. */}
        <div>
          <BlockHeader
            icon={Eye}
            title={
              observationMetrics.length > 0
                ? `Observation Metric (${observationMetrics.length})`
                : "Observation Metric"
            }
            suffix="(Optional)"
            description="Track additional metrics for deeper campaign insights."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPicker("observation")}
              >
                Select Metrics
              </Button>
            }
          />
          {observationMetrics.length > 0 ? (
            <div className="flex flex-col gap-3">
              {observationMetrics.map((mid) => (
                <MetricCard key={mid} metricId={mid} campaignId={id} />
              ))}
            </div>
          ) : (
            <EmptyState message="No observation metrics." />
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
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPicker("protection")}
              >
                Select Metrics
              </Button>
            }
          />
          <div className="flex flex-col gap-3">
            {protectionMetrics.map((mid) => (
              <MetricCard key={mid} metricId={mid} campaignId={id} />
            ))}
          </div>
        </div>
      </div>

      {picker && (
        <MetricPicker
          open={picker !== null}
          onOpenChange={(o) => !o && setPicker(null)}
          mode={picker}
          campaignId={id}
        />
      )}
    </section>
  );
}

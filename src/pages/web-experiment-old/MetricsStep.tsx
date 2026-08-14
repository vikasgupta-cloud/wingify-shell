import { HelpCircle, Plus, RotateCcw } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import MetricCard from "@/pages/config/MetricCard";
import MetricPicker from "@/pages/config/MetricPicker";
import { useConfigStore } from "@/store/config";
import { OLD_STEPS } from "./oldFlow";

export default function MetricsStep() {
  const { entityId = "" } = useParams();
  const config = useConfigStore((s) => s.configs[entityId]);
  const meta = OLD_STEPS[2];

  if (!config) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-title flex items-center gap-2 text-2xl font-semibold text-foreground">
            {meta.label}
            <HelpCircle className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.description}{" "}
            <Button type="button" variant="link" className="h-auto p-0">
              Learn more
            </Button>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm">
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Primary metric (required)
            </h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Primary metric is the key performance indicator that directly
              influences test outcomes and determines decisions and winners
            </p>
          </div>
          <MetricPicker
            mode="success"
            campaignId={entityId}
            align="end"
            trigger={
              <Button type="button" variant="outline" size="sm">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
        </div>
        {config.successMetric ? (
          <MetricCard metricId={config.successMetric} campaignId={entityId} defaultExpanded />
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Secondary metrics</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Supplementary metric is tracked alongside primary metric to provide
              additional insights into the performance of a campaign
            </p>
          </div>
          <MetricPicker
            mode="observation"
            campaignId={entityId}
            align="end"
            trigger={
              <Button type="button" variant="outline" size="sm">
                <Plus className="size-3.5" />
                Add
              </Button>
            }
          />
        </div>
        {config.observationMetrics.map((id) => (
          <MetricCard key={id} metricId={id} campaignId={entityId} />
        ))}
      </section>
    </div>
  );
}

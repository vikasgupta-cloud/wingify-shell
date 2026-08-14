import { HelpCircle, MousePointerClick, Pencil, RotateCcw, Target } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import { useConfigStore } from "@/store/config";
import { OLD_STEPS } from "./oldFlow";

export default function TargetingStep() {
  const { entityId = "" } = useParams();
  const config = useConfigStore((s) => s.configs[entityId]);
  const meta = OLD_STEPS[3];

  if (!config) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-title flex items-center gap-2 text-2xl font-semibold text-foreground">
            {meta.label}
            <HelpCircle className="size-4 text-muted-foreground" />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
        <Button type="button" variant="outline" size="sm">
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Target className="size-4 text-muted-foreground" />
          Segments
          <HelpCircle className="size-3.5 text-muted-foreground" />
        </h3>
        <p className="text-sm text-muted-foreground">The campaign will target:</p>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {config.segment || "All Traffic"}
          <HelpCircle className="size-3.5 text-muted-foreground" />
          <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Edit segment">
            <Pencil className="size-3.5" />
          </Button>
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MousePointerClick className="size-4 text-muted-foreground" />
          Triggers
          <HelpCircle className="size-3.5 text-muted-foreground" />
        </h3>
        <p className="text-sm text-muted-foreground">The campaign will trigger on</p>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {config.trigger || "Page Viewed"}
          <HelpCircle className="size-3.5 text-muted-foreground" />
          <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Edit trigger">
            <Pencil className="size-3.5" />
          </Button>
        </p>
      </section>
    </div>
  );
}

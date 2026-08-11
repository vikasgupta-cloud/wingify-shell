import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  MoreVertical,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import { categoryIcon, metricById } from "../../data/metrics";

// A dotted-underline value that will become inline-editable later.
function EditableValue({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      // TODO: inline editing of metric definitions comes later
      className="border-b border-dashed border-muted-foreground/50 text-left text-foreground hover:border-foreground"
    >
      {children}
    </button>
  );
}

// One definition row: label : value.
function DefRow({
  label,
  labelInteractive,
  children,
}: {
  label: string;
  labelInteractive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[150px_auto_1fr] items-start gap-2 py-1.5">
      {labelInteractive ? (
        <span className="text-sm">
          <EditableValue>{label}</EditableValue>
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <span className="text-muted-foreground">:</span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="mt-3 flex overflow-x-auto rounded-md border border-border bg-muted/50">
      <div className="select-none border-r border-border px-3 py-2 text-right text-xs tabular-nums text-muted-foreground">
        {lines.map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <pre className="whitespace-pre px-3 py-2 font-mono text-xs text-foreground">
        {code}
      </pre>
    </div>
  );
}

export default function MetricCard({
  metricId,
  campaignId,
  defaultExpanded = false,
}: {
  metricId: string;
  campaignId: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const config = useConfigStore((s) => s.configs[campaignId]);
  const toggleGuardrail = useConfigStore((s) => s.toggleGuardrail);
  const setSuccessMetric = useConfigStore((s) => s.setSuccessMetric);
  const setObservationMetrics = useConfigStore((s) => s.setObservationMetrics);
  const setProtectionMetrics = useConfigStore((s) => s.setProtectionMetrics);

  const metric = metricById(metricId);
  if (!metric || !config) return null;

  const Icon = categoryIcon(metric.category);
  const isGuardrail = config.protectionMetrics.includes(metricId);

  const remove = () => {
    if (config.successMetric === metricId) setSuccessMetric(campaignId, null);
    if (config.observationMetrics.includes(metricId))
      setObservationMetrics(
        campaignId,
        config.observationMetrics.filter((id) => id !== metricId)
      );
    if (config.protectionMetrics.includes(metricId))
      setProtectionMetrics(
        campaignId,
        config.protectionMetrics.filter((id) => id !== metricId)
      );
  };

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-foreground">{metric.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {isGuardrail && <Badge variant="secondary">Added as guardrail</Badge>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Metric options"
                className="h-8 w-8 text-muted-foreground"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => toggleGuardrail(campaignId, metricId)}>
                {isGuardrail ? "Remove as guardrail" : "Add as guardrail"}
              </DropdownMenuItem>
              <DropdownMenuItem
              // TODO: edit metric definition
              >
                Edit metric
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={remove}>Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4">
        <DefRow label="Metric tracks">
          <EditableValue>{metric.tracks}</EditableValue>
        </DefRow>

        {/* The collapsible remainder. */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
            expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <DefRow label={metric.whereLabel}>
            <EditableValue>{metric.whereOperator}</EditableValue>
          </DefRow>

          {metric.conditions.map((c, i) => (
            <div
              key={i}
              className="grid grid-cols-[150px_auto_1fr] items-start gap-2 py-1.5"
            >
              <span />
              <span />
              <div className="pl-4 text-sm">
                <span className="text-muted-foreground">{c.label} </span>
                <span className="font-medium text-foreground">{c.value}</span>
              </div>
            </div>
          ))}

          <DefRow label="Metric Calculates">
            <span className="text-foreground">{metric.calculates}</span>
          </DefRow>
          <DefRow label="Conversion window">
            <span className="text-foreground">{metric.conversionWindow}</span>
          </DefRow>

          {metric.codeSnippet && (
            <>
              <DefRow label="Code Snippet">
                <div className="flex items-center gap-1">
                  <span className="text-foreground">
                    Add event tracking code snippet
                  </span>
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Copy"
                          className="h-6 w-6 text-muted-foreground"
                          // TODO: copy the snippet to clipboard
                        >
                          <Copy />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Copy</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </DefRow>
              <CodeBlock code={metric.codeSnippet} />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? (
            <>
              Show less <ChevronUp />
            </>
          ) : (
            <>
              Show more <ChevronDown />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

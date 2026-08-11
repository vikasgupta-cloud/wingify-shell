import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  HelpCircle,
  Plus,
  Search,
  X,
} from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import { HYPOTHESES, LABELS, priorityScore, type Hypothesis } from "../../data/hypotheses";
import AskWandzButton from "./AskWandzButton";
import SectionTitle from "./SectionTitle";

// A small "?" help icon with a tooltip, matching the field-help affordance.
function HelpHint({ text }: { text: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Help"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// First ~6 words of the observation, used as the muted supporting line in the
// hypothesis dropdown rows.
function supportingLine(observation: string): string {
  return observation.split(/\s+/).slice(0, 6).join(" ") + "…";
}

// One labelled bar for the prioritisation panel: grayscale fill (--foreground)
// on a --muted track, value out of 5.
function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-foreground"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs tabular-nums text-foreground">
        {value}/5
      </span>
    </div>
  );
}

function HypothesisCard({
  hypothesis,
  onClear,
}: {
  hypothesis: Hypothesis;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const score = priorityScore(hypothesis);

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-[1fr_260px]">
      {/* LEFT — badge + title + observation (clamped) with show more/less. */}
      <div className="flex flex-col gap-3 bg-background p-4">
        <div className="flex items-start gap-2">
          <Badge variant="secondary" className="shrink-0 rounded-md font-semibold">
            {hypothesis.code}
          </Badge>
          <p className="text-sm font-semibold text-foreground">{hypothesis.title}</p>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            Based on observations –
          </span>
          <p className={cn("text-sm text-foreground", !expanded && "line-clamp-2")}>
            {hypothesis.observation}
          </p>

          {expanded && hypothesis.willAddress && (
            <div className="mt-2 flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                will address –
              </span>
              <p className="text-sm text-foreground">{hypothesis.willAddress}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 self-start text-xs font-medium text-foreground underline-offset-2 hover:underline"
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        </div>
      </div>

      {/* RIGHT — prioritisation score + ICE bars, on a subtly distinct panel. */}
      <div className="relative flex flex-col gap-3 bg-muted/40 p-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear hypothesis"
          onClick={onClear}
          className="absolute right-2 top-2 h-6 w-6 text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="flex flex-col">
          <div className="flex items-baseline gap-0.5">
            <span className="text-2xl font-semibold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">/5</span>
          </div>
          <span className="text-xs text-muted-foreground">Prioritisation Score</span>
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-2.5">
          <ScoreBar label="Confidence" value={hypothesis.confidence} />
          <ScoreBar label="Importance" value={hypothesis.importance} />
          <ScoreBar label="Ease" value={hypothesis.ease} />
        </div>
      </div>
    </div>
  );
}

export default function MainInformation({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);
  const openWandz = useWandzStore((s) => s.openWandz);
  const askWandz = (sectionLabel: string) =>
    openWandz({ kind: "section", campaignId: id, sectionLabel });
  const [labelsOpen, setLabelsOpen] = useState(false);
  const [hypOpen, setHypOpen] = useState(false);

  if (!config) return null;

  const toggleLabel = (label: string) => {
    const next = config.labels.includes(label)
      ? config.labels.filter((l) => l !== label)
      : [...config.labels, label];
    patch(id, { labels: next });
  };

  const selectHypothesis = (h: Hypothesis) => {
    // Mirror the title into `hypothesis` so the "main" section completion check
    // keeps working without touching configSections.
    patch(id, { hypothesisId: h.id, hypothesis: h.title });
    setHypOpen(false);
  };
  const clearHypothesis = () => patch(id, { hypothesisId: null, hypothesis: null });

  const selectedHypothesis = HYPOTHESES.find((h) => h.id === config.hypothesisId) ?? null;

  return (
    <section>
      <div className="mb-3 flex items-center gap-1">
        <SectionTitle sectionId="main" className="text-lg" />
        <AskWandzButton onClick={() => askWandz("Main Information")} />
      </div>

      <div className="rounded-lg border border-border bg-background p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Campaign Name */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="campaign-name" className="text-sm font-medium text-foreground">
                Campaign Name
              </label>
              <span className="text-xs tabular-nums text-muted-foreground">
                {config.name.length}/40
              </span>
            </div>
            <Input
              id="campaign-name"
              maxLength={40}
              value={config.name}
              onChange={(e) => patch(id, { name: e.target.value })}
            />
          </div>

          {/* Labels — multi-select with removable chips. */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Labels</span>
              <HelpHint text="Organize campaigns with one or more labels." />
            </div>
            <Popover open={labelsOpen} onOpenChange={setLabelsOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex min-h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none transition-colors hover:bg-accent/40 focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex flex-1 flex-wrap items-center gap-1">
                    {config.labels.map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="gap-1 rounded font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {label}
                        <span
                          role="button"
                          tabIndex={-1}
                          aria-label={`Remove ${label}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLabel(label);
                          }}
                          className="-mr-0.5 rounded-sm text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </Badge>
                    ))}
                    {config.labels.length === 0 && (
                      <span className="text-muted-foreground">Select label</span>
                    )}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search labels..." />
                  <CommandList>
                    <CommandEmpty>No label found.</CommandEmpty>
                    <CommandGroup>
                      {LABELS.map((label) => {
                        const checked = config.labels.includes(label);
                        return (
                          <CommandItem
                            key={label}
                            value={label}
                            onSelect={() => toggleLabel(label)}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                checked ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="flex-1">{label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Hypothesis — full width. Dropdown when empty, rich card when set. */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Hypothesis</span>
              <HelpHint text="Pick the hypothesis this campaign tests." />
              <AskWandzButton onClick={() => askWandz("Hypothesis")} />
            </div>

            {selectedHypothesis ? (
              <HypothesisCard hypothesis={selectedHypothesis} onClear={clearHypothesis} />
            ) : (
              <Popover open={hypOpen} onOpenChange={setHypOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={hypOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate text-left text-muted-foreground">
                      Select Hypothesis
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search hypotheses..." />
                    <CommandList>
                      <CommandEmpty>No hypothesis found.</CommandEmpty>
                      <CommandGroup>
                        {HYPOTHESES.map((h) => (
                          <CommandItem
                            key={h.id}
                            value={`${h.code} ${h.title}`}
                            onSelect={() => selectHypothesis(h)}
                            className="items-start gap-2"
                          >
                            <Badge
                              variant="secondary"
                              className="mt-0.5 shrink-0 rounded font-semibold"
                            >
                              {h.code}
                            </Badge>
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-sm text-foreground">
                                {h.title}
                              </span>
                              <span className="truncate text-xs text-muted-foreground">
                                {supportingLine(h.observation)}
                              </span>
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <div className="border-t p-1">
                        <button
                          type="button"
                          onClick={() => {
                            /* TODO — Create hypothesis flow */
                          }}
                          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground outline-none hover:bg-accent"
                        >
                          <Plus className="h-4 w-4" />
                          Create hypothesis
                        </button>
                      </div>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

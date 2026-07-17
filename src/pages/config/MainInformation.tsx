import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, ChevronsUpDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import AskWandzButton from "./AskWandzButton";

const LABEL_OPTIONS = ["Homepage", "Checkout", "Mobile", "Q3", "Pricing", "Onboarding"];

const HYPOTHESES = [
  "Replacing the hero message with role-aligned CTAs will increase qualified leads.",
  "Adding social proof near the pricing table will lift plan-selection rate.",
  "Simplifying the checkout to a single step will reduce cart abandonment.",
  "Surfacing shipping costs earlier will cut surprise-driven drop-off at checkout.",
  "Personalizing the homepage for returning visitors will improve engagement.",
  "A more prominent search bar will help visitors find products faster and convert more.",
];

export default function MainInformation({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);
  const openWandz = useWandzStore((s) => s.openWandz);
  const askWandz = (sectionLabel: string) =>
    openWandz({ kind: "section", campaignId: id, sectionLabel });
  const [hypOpen, setHypOpen] = useState(false);

  if (!config) return null;

  const toggleLabel = (label: string) => {
    const next = config.labels.includes(label)
      ? config.labels.filter((l) => l !== label)
      : [...config.labels, label];
    patch(id, { labels: next });
  };

  return (
    <section>
      <div className="mb-3 flex items-center gap-1">
        <h2 className="text-lg font-semibold text-foreground">Main Information</h2>
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

          {/* Labels */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Labels</span>
            </div>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm outline-none transition-colors hover:bg-accent/40 focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {config.labels.length === 0 ? (
                    <span className="text-muted-foreground">Select label</span>
                  ) : (
                    <span className="flex flex-wrap gap-1">
                      {config.labels.map((label) => (
                        <span
                          key={label}
                          className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground"
                        >
                          {label}
                        </span>
                      ))}
                    </span>
                  )}
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  sideOffset={6}
                  className="z-50 w-[--radix-dropdown-menu-trigger-width] min-w-[200px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
                >
                  {LABEL_OPTIONS.map((label) => (
                    <DropdownMenu.CheckboxItem
                      key={label}
                      checked={config.labels.includes(label)}
                      onCheckedChange={() => toggleLabel(label)}
                      onSelect={(e) => e.preventDefault()}
                      className="relative flex cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pl-8 pr-2 outline-none data-[highlighted]:bg-accent"
                    >
                      <DropdownMenu.ItemIndicator className="absolute left-2 flex items-center">
                        <Check className="h-4 w-4" />
                      </DropdownMenu.ItemIndicator>
                      {label}
                    </DropdownMenu.CheckboxItem>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Hypothesis — full width */}
          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-foreground">Hypothesis</span>
              {/* NOTE: this Sparkles button replaces the help "?" icon in the design. */}
              <AskWandzButton onClick={() => askWandz("Hypothesis")} />
            </div>
            <Popover open={hypOpen} onOpenChange={setHypOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={hypOpen}
                  className="w-full justify-between font-normal"
                >
                  <span
                    className={cn(
                      "truncate text-left",
                      !config.hypothesis && "text-muted-foreground"
                    )}
                  >
                    {config.hypothesis ?? "Select Hypothesis"}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
              >
                <Command>
                  <CommandInput placeholder="Search hypotheses..." />
                  <CommandList>
                    <CommandEmpty>No hypothesis found.</CommandEmpty>
                    <CommandGroup>
                      {HYPOTHESES.map((h) => (
                        <CommandItem
                          key={h}
                          value={h}
                          onSelect={() => {
                            patch(id, { hypothesis: h });
                            setHypOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4",
                              config.hypothesis === h ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="flex-1">{h}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </section>
  );
}

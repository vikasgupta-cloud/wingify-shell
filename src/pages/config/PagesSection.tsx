import { useState } from "react";
import {
  ChevronRight,
  ChevronsUpDown,
  MinusCircle,
  PlusCircle,
  Save,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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
import {
  useConfigStore,
  DEFAULT_URL_SETTINGS,
  type PageGroup,
  type PageRule,
  type UrlSettings,
} from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import { PAGE_GROUPS } from "../../config/urlPredicates";
import AskWandzButton from "./AskWandzButton";
import PredicatePicker from "./PredicatePicker";

function PageGroupCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
            {value || "Select page group"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search page groups..." />
          <CommandList>
            <CommandEmpty>No page group found.</CommandEmpty>
            <CommandGroup>
              {PAGE_GROUPS.map((g) => (
                <CommandItem
                  key={g}
                  value={g}
                  onSelect={() => {
                    onChange(g);
                    setOpen(false);
                  }}
                >
                  {g}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const URL_SETTING_OPTIONS: {
  key: keyof UrlSettings;
  label: string;
  description?: string;
}[] = [
  {
    key: "ignoreQueryString",
    label: "Ignore query string",
    description: "Ignores text after the question mark (?) in the URL",
  },
  {
    key: "ignoreFragment",
    label: "Ignore fragment",
    description: "Ignores text after the pound sign (#) in the URL",
  },
  { key: "caseInsensitive", label: "Case insensitive" },
];

function UrlSettingsPopover({
  settings,
  onChange,
}: {
  settings: UrlSettings;
  onChange: (settings: UrlSettings) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="URL settings"
          className="rounded-l-none border border-l-0 border-input shadow-sm"
        >
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4">
        <div className="text-sm font-medium text-foreground">Configuration</div>
        <div className="mt-3 flex flex-col gap-3">
          {URL_SETTING_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex gap-2">
              <Checkbox
                checked={settings[opt.key]}
                onCheckedChange={(checked) =>
                  onChange({ ...settings, [opt.key]: checked === true })
                }
                className="mt-0.5"
              />
              <span className="text-sm leading-tight">
                <span className="text-foreground">{opt.label}</span>
                {opt.description && (
                  <span className="block text-xs text-muted-foreground">
                    {opt.description}
                  </span>
                )}
              </span>
            </label>
          ))}
        </div>
        <Separator className="my-3" />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs font-medium"
          onClick={() => onChange({ ...DEFAULT_URL_SETTINGS })}
        >
          Reset to default
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function RuleRow({
  campaignId,
  group,
  rule,
  showRemove,
  onRemove,
  focused,
  onFocus,
  onBlur,
}: {
  campaignId: string;
  group: PageGroup;
  rule: PageRule;
  showRemove: boolean;
  onRemove: () => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  const updateRule = useConfigStore((s) => s.updateRule);
  const isPageGroup = rule.predicate === "Page group is";

  return (
    <div>
      <div className="flex items-center gap-2">
        <PredicatePicker
          value={rule.predicate}
          onChange={(predicate) =>
            updateRule(campaignId, group.id, rule.id, { predicate })
          }
        />

        {isPageGroup ? (
          <div className="flex-1">
            <PageGroupCombobox
              value={rule.value}
              onChange={(value) => updateRule(campaignId, group.id, rule.id, { value })}
            />
          </div>
        ) : (
          <div className="flex flex-1 items-center">
            <Input
              placeholder="https://"
              value={rule.value}
              onChange={(e) =>
                updateRule(campaignId, group.id, rule.id, { value: e.target.value })
              }
              onFocus={onFocus}
              onBlur={onBlur}
              className="rounded-r-none"
            />
            <UrlSettingsPopover
              settings={rule.settings}
              onChange={(settings) =>
                updateRule(campaignId, group.id, rule.id, { settings })
              }
            />
          </div>
        )}

        {showRemove && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  className="shrink-0 text-muted-foreground"
                  onClick={onRemove}
                >
                  <MinusCircle />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {focused && !isPageGroup && (
        <div className="mt-1 text-xs text-muted-foreground">
          Some URL settings have been applied by default.{" "}
          <Button
            type="button"
            variant="link"
            size="sm"
            className="inline h-auto p-0 text-xs font-medium text-foreground"
            // TODO: update settings
          >
            Update settings
          </Button>
        </div>
      )}
    </div>
  );
}

function GroupBlock({
  campaignId,
  group,
  isFirstInclude,
  hasExclude,
}: {
  campaignId: string;
  group: PageGroup;
  isFirstInclude: boolean;
  hasExclude: boolean;
}) {
  const addRule = useConfigStore((s) => s.addRule);
  const addExcludeGroup = useConfigStore((s) => s.addExcludeGroup);
  const removeRule = useConfigStore((s) => s.removeRule);
  const [focusedRuleId, setFocusedRuleId] = useState<string | null>(null);

  const isExclude = group.kind === "exclude";
  // Floors: Include keeps a mandatory last row (removable only at 2+); Exclude
  // has a floor of 0 (every row removable, incl. the last one).
  const showRemove = isExclude ? true : group.rules.length > 1;

  // removeRule drops an emptied non-include group, so removing the last Exclude
  // row collapses the whole Exclude section — the "+ Exclude" button then
  // returns beside "+ Include" (its pre-exclude layout).
  const removeRow = (ruleId: string) => removeRule(campaignId, group.id, ruleId);

  return (
    <div className="p-6">
      <div className="text-sm font-medium text-foreground">
        {isExclude
          ? "Exclude any of the following  URL(s) / Page(s)"
          : "Include any of the following  URL(s) / Page(s)"}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {group.rules.map((rule) => (
          <RuleRow
            key={rule.id}
            campaignId={campaignId}
            group={group}
            rule={rule}
            showRemove={showRemove}
            onRemove={() => removeRow(rule.id)}
            focused={focusedRuleId === rule.id}
            onFocus={() => setFocusedRuleId(rule.id)}
            onBlur={() => setFocusedRuleId((cur) => (cur === rule.id ? null : cur))}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addRule(campaignId, group.id)}
        >
          <PlusCircle />
          {isExclude ? "Exclude" : "Include"}
        </Button>
        {isFirstInclude && !hasExclude && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addExcludeGroup(campaignId)}
          >
            <PlusCircle />
            Exclude
          </Button>
        )}
      </div>
    </div>
  );
}

export default function PagesSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const openWandz = useWandzStore((s) => s.openWandz);
  const [testOpen, setTestOpen] = useState(false);

  if (!config) return null;

  const hasExclude = config.pageGroups.some((g) => g.kind === "exclude");
  const firstIncludeId = config.pageGroups.find((g) => g.kind === "include")?.id;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold text-foreground">Pages</h2>
          <AskWandzButton
            onClick={() =>
              openWandz({ kind: "section", campaignId: id, sectionLabel: "Pages" })
            }
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          // TODO: save for future use
        >
          <Save />
          Save as page group
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background">
        {config.pageGroups.map((group, i) => (
          <div key={group.id}>
            {i > 0 && (
              <div className="relative mx-6 my-4 border-t border-dashed border-border">
                <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  AND
                </span>
              </div>
            )}
            <GroupBlock
              campaignId={id}
              group={group}
              isFirstInclude={group.id === firstIncludeId}
              hasExclude={hasExclude}
            />
          </div>
        ))}

        <div className="border-t border-border">
          <button
            type="button"
            onClick={() => setTestOpen((o) => !o)}
            className="flex w-full items-center gap-2 px-6 py-4 text-left"
          >
            <ChevronRight
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-150",
                testOpen && "rotate-90"
              )}
            />
            <span className="text-sm text-foreground">
              Test campaign eligibility for a URL
            </span>
          </button>
          {testOpen && (
            <div className="px-6 pb-4 text-sm text-muted-foreground">
              {/* TODO */}
              Coming later.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

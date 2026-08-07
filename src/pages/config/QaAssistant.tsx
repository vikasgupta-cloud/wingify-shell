import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  HelpCircle,
  MinusCircle,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import type { QaRuleKind } from "../../store/config";
import { IP_OPERATORS, NAMED_OPERATORS, type OperatorDef } from "../../config/qaOperators";
import OperatorPicker from "./OperatorPicker";

// Client-side placeholder — no real IP detection.
const YOUR_IP = "2401:4900:1c64:7e00:60f9:f55c:de2a:4572";

function HelpTip() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-help text-muted-foreground">
            <HelpCircle className="h-3.5 w-3.5" />
          </span>
        </TooltipTrigger>
        {/* TODO: real help copy */}
        <TooltipContent>More info</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// The "Your IP: … [copy]" pill shown beside the IP Address title.
function YourIpBadge() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(YOUR_IP);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
      <span>
        Your IP: <span className="font-medium text-foreground">{YOUR_IP}</span>
      </span>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy your IP address"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </span>
  );
}

// A Switch paired with a title + description block, plus an optional accessory
// (e.g. the "Your IP" badge) rendered beside the title.
function ToggleBlock({
  checked,
  onCheckedChange,
  title,
  description,
  accessory,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  title: string;
  description: string;
  accessory?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{title}</span>
          {accessory}
        </div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

// Loose shape covering both IP rules (no name) and named cookie/query rules.
type EditableRule = { id: string; operator: string; value: string; name?: string };

// Shared repeatable rule editor: optional name field + operator picker + value,
// with per-row remove and an "Add another" affordance.
function RulesEditor({
  id,
  kind,
  rules,
  operators,
  showName,
}: {
  id: string;
  kind: QaRuleKind;
  rules: EditableRule[];
  operators: OperatorDef[];
  showName?: boolean;
}) {
  const addQaRule = useConfigStore((s) => s.addQaRule);
  const removeQaRule = useConfigStore((s) => s.removeQaRule);
  const updateQaRule = useConfigStore((s) => s.updateQaRule);

  return (
    <>
      <div className="flex flex-col gap-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-2">
            {showName && (
              <Input
                className="flex-1"
                placeholder="Enter name"
                value={rule.name ?? ""}
                onChange={(e) => updateQaRule(id, kind, rule.id, { name: e.target.value })}
              />
            )}
            <OperatorPicker
              operators={operators}
              value={rule.operator}
              onChange={(op) => updateQaRule(id, kind, rule.id, { operator: op })}
            />
            <Input
              className="flex-1"
              placeholder="Enter value"
              value={rule.value}
              onChange={(e) => updateQaRule(id, kind, rule.id, { value: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove rule"
              className="shrink-0 text-muted-foreground"
              onClick={() => removeQaRule(id, kind, rule.id)}
            >
              <MinusCircle />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 text-foreground"
        onClick={() => addQaRule(id, kind)}
      >
        <Plus />
        Add another
      </Button>
    </>
  );
}

export default function QaAssistant({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);
  const addQaRule = useConfigStore((s) => s.addQaRule);

  if (!config) return null;

  const { qa } = config;

  // Toggling a section on seeds one rule the first time it opens. Reads the
  // freshest qa at click time so toggling one section never clobbers another.
  const toggleSection = (
    kind: QaRuleKind,
    enabledKey: "ipEnabled" | "cookieEnabled" | "queryEnabled",
    rulesKey: "ipRules" | "cookieRules" | "queryRules",
    v: boolean
  ) => {
    const fresh = useConfigStore.getState().configs[id]?.qa;
    if (!fresh) return;
    patch(id, { qa: { ...fresh, [enabledKey]: v } });
    if (v && fresh[rulesKey].length === 0) addQaRule(id, kind);
  };

  const bodyClass = (open: boolean) =>
    cn(
      "overflow-hidden pl-12 transition-all duration-150 ease-out motion-reduce:transition-none",
      open ? "mt-3 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
    );

  return (
    <div className="flex flex-col gap-6">
      {/* CARD 1 — Configurations. */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="mb-4 text-base font-medium text-foreground">Configurations</div>

        <div className="flex flex-col gap-6">
          {/* IP Address. */}
          <div>
            <ToggleBlock
              checked={qa.ipEnabled}
              onCheckedChange={(v) => toggleSection("ip", "ipEnabled", "ipRules", v)}
              title="IP Address"
              description="Restrict visibility to selected IP addresses."
              accessory={<YourIpBadge />}
            />
            <div className={bodyClass(qa.ipEnabled)}>
              <RulesEditor id={id} kind="ip" rules={qa.ipRules} operators={IP_OPERATORS} />
            </div>
          </div>

          {/* Cookie Value. */}
          <div>
            <ToggleBlock
              checked={qa.cookieEnabled}
              onCheckedChange={(v) =>
                toggleSection("cookie", "cookieEnabled", "cookieRules", v)
              }
              title="Cookie Value"
              description="Qualify visitors using a specific cookie."
            />
            <div className={bodyClass(qa.cookieEnabled)}>
              <RulesEditor
                id={id}
                kind="cookie"
                rules={qa.cookieRules}
                operators={NAMED_OPERATORS}
                showName
              />
            </div>
          </div>

          {/* Query Parameter. */}
          <div>
            <ToggleBlock
              checked={qa.queryEnabled}
              onCheckedChange={(v) => toggleSection("query", "queryEnabled", "queryRules", v)}
              title="Query Parameter"
              description="Query Parameter is a parameter appended to the URL of a web page."
            />
            <div className={bodyClass(qa.queryEnabled)}>
              <RulesEditor
                id={id}
                kind="query"
                rules={qa.queryRules}
                operators={NAMED_OPERATORS}
                showName
              />
            </div>
          </div>
        </div>

        {/* Live Preview. */}
        <div className="mt-8 text-base font-medium text-foreground">Live Preview</div>
        <div className="mt-3 flex items-center gap-3">
          <Select
            value={qa.previewVariationId}
            onValueChange={(v) => patch(id, { qa: { ...qa, previewVariationId: v } })}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.variations.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium text-foreground">
                      {v.label}
                    </span>
                    {v.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="flex-1"
            placeholder="https://www.example.com/home"
            value={qa.previewUrl}
            onChange={(e) => patch(id, { qa: { ...qa, previewUrl: e.target.value } })}
          />
          <Button
            type="button"
            variant="outline"
            // TODO: open live preview in a new tab
          >
            Preview on new tab
            <ExternalLink />
          </Button>
        </div>
      </div>

      {/* CARD 2 — Debug. */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="text-base font-medium text-foreground">Debug</div>
        <div className="text-sm text-muted-foreground">
          Test your campaign configurations on any web page
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Input
            className="flex-1"
            placeholder="https://www.example.com/home"
            value={qa.debugUrl}
            onChange={(e) => patch(id, { qa: { ...qa, debugUrl: e.target.value } })}
          />
          <Button
            type="button"
            variant="outline"
            // TODO: run debug against the given URL
          >
            Debug
            <ExternalLink />
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <span className="text-base font-medium text-foreground">Past runs</span>
          <div className="flex items-center gap-2">
            <div className="relative w-[260px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search web pages" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              // TODO: filter past runs
            >
              Filter by
              <ChevronDown />
            </Button>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-4 gap-4 bg-background px-4 py-2 text-xs font-medium text-muted-foreground">
            <span>Web page</span>
            <span>Run time</span>
            <span className="flex items-center gap-1">
              Run by
              <HelpTip />
            </span>
            <span>Status</span>
          </div>
          <div className="py-12 text-center text-sm text-muted-foreground">
            No debug history
          </div>
        </div>
      </div>
    </div>
  );
}

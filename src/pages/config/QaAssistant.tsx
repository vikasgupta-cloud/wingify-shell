import {
  ChevronDown,
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
import { IP_SUBJECTS, IP_OPERATORS } from "../../config/configOptions";

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

// A Switch paired with a title + description block.
function ToggleBlock({
  checked,
  onCheckedChange,
  title,
  description,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Switch checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

export default function QaAssistant({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);
  const addIpRule = useConfigStore((s) => s.addIpRule);
  const removeIpRule = useConfigStore((s) => s.removeIpRule);
  const updateIpRule = useConfigStore((s) => s.updateIpRule);

  if (!config) return null;

  const { qa } = config;

  const toggleIp = (v: boolean) => {
    patch(id, { qa: { ...qa, ipEnabled: v } });
    // Seed one rule the first time the block is opened.
    if (v && qa.ipRules.length === 0) addIpRule(id);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* CARD 1 — Configurations. */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="mb-4 text-base font-medium text-foreground">Configurations</div>

        <div className="flex flex-col gap-6">
          {/* IP address. */}
          <div>
            <ToggleBlock
              checked={qa.ipEnabled}
              onCheckedChange={toggleIp}
              title="IP address"
              description="User with a specific user id will qualify for the campaign"
            />
            <div
              className={cn(
                "overflow-hidden pl-12 transition-all duration-150 ease-out motion-reduce:transition-none",
                qa.ipEnabled ? "mt-3 max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="text-sm font-medium text-foreground">IP address of</div>
              <div className="mt-2 flex flex-col gap-2">
                {qa.ipRules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    <Select
                      value={rule.subject}
                      onValueChange={(v) => updateIpRule(id, rule.id, { subject: v })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IP_SUBJECTS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={rule.operator}
                      onValueChange={(v) => updateIpRule(id, rule.id, { operator: v })}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IP_OPERATORS.map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      className="flex-1"
                      placeholder="0.0.0.0"
                      value={rule.value}
                      onChange={(e) => updateIpRule(id, rule.id, { value: e.target.value })}
                    />
                    {qa.ipRules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove IP rule"
                        className="shrink-0 text-muted-foreground"
                        onClick={() => removeIpRule(id, rule.id)}
                      >
                        <MinusCircle />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => addIpRule(id)}
              >
                <Plus />
                Add another
              </Button>
            </div>
          </div>

          {/* Cookies. */}
          <ToggleBlock
            checked={qa.cookiesEnabled}
            onCheckedChange={(v) => patch(id, { qa: { ...qa, cookiesEnabled: v } })}
            title="Cookies"
            description="Target specific cookies to qualify for the campaign"
          />
          {/* TODO: cookie rules body */}

          {/* URL Parameters. */}
          <ToggleBlock
            checked={qa.urlParamsEnabled}
            onCheckedChange={(v) => patch(id, { qa: { ...qa, urlParamsEnabled: v } })}
            title="URL Parameters"
            description="[temp copy]"
          />
          {/* TODO: url parameter rules body */}
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
          <div className="grid grid-cols-4 gap-4 bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
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

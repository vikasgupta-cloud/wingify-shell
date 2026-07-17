import { useState } from "react";
import {
  Copy,
  FilePlus2,
  Lock,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfigStore, type ConfigVariation } from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import { SEGMENTS, TRIGGERS, FREQUENCIES } from "../../config/configOptions";
import AskWandzButton from "./AskWandzButton";

// The numbered header + card wrapper shared by all three sub-blocks.
function SubBlock({
  n,
  anchor,
  title,
  description,
  noPadding,
  children,
}: {
  n: number;
  anchor: string;
  title: string;
  description: string;
  noPadding?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={anchor} className="scroll-mt-20">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
          {n}
        </span>
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </div>
      <div
        className={cn(
          "rounded-lg border border-border bg-background",
          !noPadding && "p-6"
        )}
      >
        {children}
      </div>
    </div>
  );
}

// One "Label : <Select>" row in the targeting sub-block.
function TargetingRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[120px_auto_1fr] items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">:</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const VIEWS: { id: "desktop" | "mobile" | "tablet"; icon: typeof Monitor }[] = [
  { id: "desktop", icon: Monitor },
  { id: "tablet", icon: Tablet },
  { id: "mobile", icon: Smartphone },
];

function VariationRow({
  campaignId,
  variation,
  editable,
  showRemove,
}: {
  campaignId: string;
  variation: ConfigVariation;
  editable: boolean;
  showRemove: boolean;
}) {
  const renameVariation = useConfigStore((s) => s.renameVariation);
  const setSplit = useConfigStore((s) => s.setSplit);
  const toggleLock = useConfigStore((s) => s.toggleLock);
  const removeVariation = useConfigStore((s) => s.removeVariation);

  return (
    <div className="flex items-center gap-3 px-6 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium text-foreground">
        {variation.label}
      </span>

      <Input
        value={variation.name}
        onChange={(e) => renameVariation(campaignId, variation.id, e.target.value)}
        className="h-8 flex-1"
      />

      <span className="w-28 shrink-0 text-xs text-muted-foreground">
        {variation.modifications === 0
          ? "No changes"
          : `${variation.modifications} change${variation.modifications === 1 ? "" : "s"}`}
      </span>

      <div className="flex shrink-0 items-center gap-1">
        <Input
          type="number"
          value={variation.split}
          disabled={!editable}
          onChange={(e) => setSplit(campaignId, variation.id, Number(e.target.value))}
          className="h-8 w-16 tabular-nums"
        />
        <span className="text-sm text-muted-foreground">%</span>
      </div>

      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={!editable}
              aria-label={variation.locked ? "Unlock split" : "Lock split"}
              className="h-8 w-8 shrink-0 text-muted-foreground"
              onClick={() => toggleLock(campaignId, variation.id)}
            >
              {variation.locked ? <Lock /> : <Unlock />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{variation.locked ? "Unlock split" : "Lock split"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="w-8 shrink-0">
        {showRemove && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove variation"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => removeVariation(campaignId, variation.id)}
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove variation</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

const SPLIT_MODES: Array<"Manual" | "Equal" | "Auto"> = ["Manual", "Equal", "Auto"];

export default function VariationsSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);
  const addVariation = useConfigStore((s) => s.addVariation);
  const setSplitMode = useConfigStore((s) => s.setSplitMode);
  const openWorkflow = useConfigStore((s) => s.openWorkflow);
  const openWandz = useWandzStore((s) => s.openWandz);
  const [editingUrl, setEditingUrl] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  if (!config) return null;

  const inCampaign = config.trafficAllocation;
  const outCampaign = 100 - config.trafficAllocation;
  const manual = config.splitMode === "Manual";
  const total = config.variations.reduce((s, v) => s + v.split, 0);

  const setAllocation = (raw: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(raw || 0)));
    patch(id, { trafficAllocation: clamped });
  };

  return (
    <section>
      {/* Heading row. */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <h2 className="text-lg font-semibold text-foreground">Variations and Targets</h2>
          <AskWandzButton
            onClick={() =>
              openWandz({
                kind: "section",
                campaignId: id,
                sectionLabel: "Variations and Targets",
              })
            }
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => openWorkflow(id)}
        >
          Workflow Mode
        </Button>
      </div>

      <div className="flex flex-col gap-8">
        {/* 1 — Allocate traffic. */}
        <SubBlock
          n={1}
          anchor="section-variations-allocate"
          title="Allocate traffic"
          description="Select how much traffic needs to be diverted to this campaign"
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={config.trafficAllocation}
              onChange={(e) => setAllocation(Number(e.target.value))}
              className="w-[90px] tabular-nums"
            />
            <span className="text-sm text-foreground">
              % of users will landing on the test pages will be part of the campaign
            </span>
          </div>

          <Slider
            className="mt-6"
            value={[config.trafficAllocation]}
            onValueChange={([v]) => setAllocation(v)}
            min={0}
            max={100}
            step={1}
          />

          <div className="mt-6 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Switch
                checked={config.variationSplitEnabled}
                onCheckedChange={(v) => patch(id, { variationSplitEnabled: v })}
              />
              <span className="text-muted-foreground">Variation split</span>
            </div>
            <div className="h-4 border-l border-border" />
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-foreground" />
              <span className="text-muted-foreground">In campaign:</span>
              <span className="tabular-nums text-foreground">{inCampaign}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-muted-foreground/30" />
              <span className="text-muted-foreground">Not in campaign:</span>
              <span className="tabular-nums text-foreground">{outCampaign}%</span>
            </div>
          </div>
        </SubBlock>

        {/* 2 — Set targeting. */}
        <SubBlock
          n={2}
          anchor="section-variations-targeting"
          title="Set targeting"
          description="Select who, when and how users will see your campaign."
        >
          <div className="flex flex-col gap-4">
            <TargetingRow
              label="Segment"
              value={config.segment}
              options={SEGMENTS}
              onChange={(v) => patch(id, { segment: v })}
            />
            <TargetingRow
              label="Trigger"
              value={config.trigger}
              options={TRIGGERS}
              onChange={(v) => patch(id, { trigger: v })}
            />
            <TargetingRow
              label="Frequency"
              value={config.frequency}
              options={FREQUENCIES}
              onChange={(v) => patch(id, { frequency: v })}
            />
          </div>
        </SubBlock>

        {/* 3 — Variations. */}
        <SubBlock
          n={3}
          anchor="section-variations-variations"
          title="Variations"
          description="Create variations and set traffic split"
          noPadding
        >
          {/* Editor bar. */}
          <div className="flex items-center justify-between border-b border-border px-6 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-sm text-muted-foreground">Editor URL</span>
              {config.editorUrl && !editingUrl ? (
                <button
                  type="button"
                  onClick={() => setEditingUrl(true)}
                  className="truncate text-sm text-foreground hover:underline"
                >
                  {config.editorUrl}
                </button>
              ) : (
                <Input
                  autoFocus={editingUrl}
                  placeholder="https://"
                  value={config.editorUrl}
                  onChange={(e) => patch(id, { editorUrl: e.target.value })}
                  onBlur={() => setEditingUrl(false)}
                  className="h-8 w-[280px]"
                />
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="flex items-center rounded-md border border-border p-0.5">
                {VIEWS.map(({ id: view, icon: Icon }) => (
                  <Button
                    key={view}
                    type="button"
                    variant={config.editorView === view ? "secondary" : "ghost"}
                    size="icon"
                    aria-label={view}
                    className="h-7 w-7"
                    onClick={() => patch(id, { editorView: view })}
                  >
                    <Icon />
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                // TODO: launch the visual editor
              >
                Open Editor
              </Button>
            </div>
          </div>

          {/* Split-mode + add controls. */}
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center rounded-md border border-border p-0.5">
              {SPLIT_MODES.map((mode) => (
                <Button
                  key={mode}
                  type="button"
                  variant={config.splitMode === mode ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7"
                  onClick={() => setSplitMode(id, mode)}
                >
                  {mode}
                </Button>
              ))}
            </div>

            <Popover open={addOpen} onOpenChange={setAddOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Plus />
                  Add Variation
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                  onClick={() => {
                    addVariation(id, "blank");
                    setAddOpen(false);
                  }}
                >
                  <FilePlus2 className="h-4 w-4 text-muted-foreground" />
                  Blank variation
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground hover:bg-accent"
                  onClick={() => {
                    addVariation(id, "duplicate");
                    setAddOpen(false);
                  }}
                >
                  <Copy className="h-4 w-4 text-muted-foreground" />
                  Duplicate last
                </button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Variation list. */}
          <div className="divide-y divide-border border-t border-border">
            {config.variations.map((v) => (
              <VariationRow
                key={v.id}
                campaignId={id}
                variation={v}
                editable={manual}
                showRemove={v.id !== "control"}
              />
            ))}
          </div>

          {/* Split total readout. */}
          <div className="flex items-center justify-end gap-2 border-t border-border px-6 py-3 text-sm">
            <span className="text-muted-foreground">Total split</span>
            <span
              className={cn(
                "tabular-nums font-medium",
                total === 100 ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {total}%
            </span>
          </div>
        </SubBlock>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  ChevronDown,
  ChevronUp,
  CirclePlus,
  CornerUpRight,
  Focus,
  Image as ImageIcon,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
import { useConfigStore } from "../../../store/config";
import { TRIGGERS, FREQUENCIES } from "../../../config/configOptions";
import SegmentPicker from "../SegmentPicker";

type NodeData = { campaignId: string; variationId?: string };

// Connecting is disabled, so handles exist only to anchor edges — hide them.
const hiddenHandle = "!h-2 !w-2 !min-w-0 !border-0 !bg-transparent opacity-0";

function shell(selected: boolean | undefined, extra?: string) {
  return cn(
    "rounded-lg border border-border bg-background shadow-sm",
    selected && "ring-2 ring-foreground/20",
    extra
  );
}

// --- A) Traffic Allocation -------------------------------------------------
function TrafficAllocationNode({ data, selected }: NodeProps) {
  const { campaignId } = data as NodeData;
  const config = useConfigStore((s) => s.configs[campaignId]);
  const patch = useConfigStore((s) => s.patch);
  if (!config) return null;

  const set = (raw: number) =>
    patch(campaignId, {
      trafficAllocation: Math.max(0, Math.min(100, Math.round(raw || 0))),
    });

  return (
    <div className={shell(selected, "w-[280px] p-4")}>
      <div className="text-sm font-semibold text-foreground">Traffic Allocation</div>
      <div className="text-sm text-muted-foreground">
        % of Users that will be part of this campaign
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Slider
          className="flex-1 nodrag"
          value={[config.trafficAllocation]}
          onValueChange={([v]) => set(v)}
          min={0}
          max={100}
          step={1}
        />
        <div className="flex items-center">
          <Input
            type="number"
            value={config.trafficAllocation}
            onChange={(e) => set(Number(e.target.value))}
            className="h-8 w-[72px] tabular-nums nodrag"
          />
          <span className="ml-1 text-sm text-muted-foreground">%</span>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className={hiddenHandle} />
    </div>
  );
}

// --- B) Target -------------------------------------------------------------
function TargetNode({ data, selected }: NodeProps) {
  const { campaignId } = data as NodeData;
  const config = useConfigStore((s) => s.configs[campaignId]);
  const patch = useConfigStore((s) => s.patch);
  const [expanded, setExpanded] = useState(false);
  if (!config) return null;

  return (
    <div className={shell(selected, "w-[320px] p-4")}>
      <div className="text-center text-sm font-semibold text-foreground">Target</div>

      <div className="mt-3 flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Segment</span>
        <SegmentPicker campaignId={campaignId} triggerClassName="w-full" />
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out motion-reduce:transition-none",
          expanded ? "mt-3 max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Triggers</span>
            <Select
              value={config.trigger}
              onValueChange={(v) => patch(campaignId, { trigger: v })}
            >
              <SelectTrigger className="nodrag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGERS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Frequency</span>
            <Select
              value={config.frequency}
              onValueChange={(v) => patch(campaignId, { frequency: v })}
            >
              <SelectTrigger className="nodrag">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <Button
          type="button"
          variant="link"
          size="sm"
          className="nodrag"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? "Hide options" : "Additional options"}
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>

      <Handle type="target" position={Position.Left} className={hiddenHandle} />
      <Handle type="source" position={Position.Right} className={hiddenHandle} />
    </div>
  );
}

// --- C) Excluded -----------------------------------------------------------
function ExcludedNode({ data, selected }: NodeProps) {
  const { campaignId } = data as NodeData;
  const config = useConfigStore((s) => s.configs[campaignId]);
  if (!config) return null;

  return (
    <div className={shell(selected, "w-[320px] p-4")}>
      <div className="text-sm">
        <span className="font-semibold text-foreground">
          {100 - config.trafficAllocation}%
        </span>
        <span className="text-muted-foreground"> Users not part of the campaign</span>
      </div>
      <Handle type="target" position={Position.Left} className={hiddenHandle} />
    </div>
  );
}

// --- D) Traffic Split ------------------------------------------------------
const SPLIT_MODES: Array<"Manual" | "Equal" | "Auto"> = ["Manual", "Equal", "Auto"];

function TrafficSplitNode({ data, selected }: NodeProps) {
  const { campaignId } = data as NodeData;
  const config = useConfigStore((s) => s.configs[campaignId]);
  const setSplitMode = useConfigStore((s) => s.setSplitMode);
  if (!config) return null;

  return (
    <div className={shell(selected, "w-[160px] p-3 text-center")}>
      <div className="text-sm text-muted-foreground">Traffic Split</div>
      <div className="mt-1 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="nodrag">
              {config.splitMode}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            {SPLIT_MODES.map((mode) => (
              <DropdownMenuItem
                key={mode}
                onSelect={() => setSplitMode(campaignId, mode)}
              >
                {mode}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Handle type="target" position={Position.Left} className={hiddenHandle} />
      <Handle type="source" position={Position.Right} className={hiddenHandle} />
    </div>
  );
}

// --- E) Variation ----------------------------------------------------------
function VariationNode({ data, selected }: NodeProps) {
  const { campaignId, variationId } = data as NodeData;
  const config = useConfigStore((s) => s.configs[campaignId]);
  const renameVariation = useConfigStore((s) => s.renameVariation);
  const removeVariation = useConfigStore((s) => s.removeVariation);
  const addVariation = useConfigStore((s) => s.addVariation);
  const setSplit = useConfigStore((s) => s.setSplit);

  const variation = config?.variations.find((v) => v.id === variationId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  if (!config || !variation) return null;

  const isControl = variation.id === "control";
  const editable = config.splitMode === "Manual";
  const readonlyReason =
    config.splitMode === "Equal"
      ? "Splits are distributed evenly"
      : "Traffic is allocated automatically";

  const startEditing = () => {
    setDraft(variation.name);
    setEditing(true);
  };
  const commit = () => {
    renameVariation(campaignId, variation.id, draft.trim() || variation.name);
    setEditing(false);
  };

  return (
    <div className={shell(selected, "group w-[360px] overflow-hidden p-0")}>
      <div className="flex">
        {/* Thumbnail with hover Edit overlay. */}
        <div className="relative flex w-24 shrink-0 items-center justify-center bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground/50" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="nodrag"
              // TODO: open the visual editor for this variation
            >
              Edit
            </Button>
          </div>
        </div>

        <div className="flex-1 p-3">
          {/* Header row. */}
          <div className="flex items-center gap-2">
            {editing ? (
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(false);
                }}
                onBlur={commit}
                className="h-7 flex-1 nodrag"
              />
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="flex-1 truncate text-left text-sm font-medium text-foreground hover:underline"
              >
                {variation.name}
              </button>
            )}

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Preview"
                    className="h-7 w-7 shrink-0 text-muted-foreground nodrag"
                    // TODO: preview this variation
                  >
                    <Focus />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Variation options"
                  className="h-7 w-7 shrink-0 text-muted-foreground nodrag"
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => addVariation(campaignId, "duplicate")}>
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => startEditing()}>Rename</DropdownMenuItem>
                {!isControl && (
                  <DropdownMenuItem
                    onSelect={() => removeVariation(campaignId, variation.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Modifications or redirection URL. */}
          {variation.redirectUrl ? (
            <div className="mt-2 flex items-center gap-1.5">
              <CornerUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="shrink-0 text-sm text-muted-foreground">
                Redirection URL :
              </span>
              <span className="truncate text-sm text-foreground">
                {variation.redirectUrl}
              </span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-muted-foreground">
              Modifications : {String(variation.modifications).padStart(2, "0")}
            </div>
          )}

          {/* Split control. */}
          <div className="mt-3 flex items-center gap-3">
            {editable ? (
              <>
                <Slider
                  className="flex-1 nodrag"
                  value={[variation.split]}
                  onValueChange={([v]) => setSplit(campaignId, variation.id, v)}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex items-center">
                  <Input
                    type="number"
                    value={variation.split}
                    onChange={(e) =>
                      setSplit(campaignId, variation.id, Number(e.target.value))
                    }
                    className="h-8 w-16 tabular-nums nodrag"
                  />
                  <span className="ml-1 text-sm text-muted-foreground">%</span>
                </div>
              </>
            ) : (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-sm font-medium tabular-nums text-foreground">
                      {variation.split}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{readonlyReason}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      <Handle type="target" position={Position.Left} className={hiddenHandle} />
    </div>
  );
}

// --- F) Add variation ------------------------------------------------------
// A dashed action card below the last variation. Mirrors the Variations
// section's "Add variation" and adds a blank variation to the campaign.
function AddVariationNode({ data }: NodeProps) {
  const { campaignId } = data as NodeData;
  const addVariation = useConfigStore((s) => s.addVariation);
  return (
    <button
      type="button"
      onClick={() => addVariation(campaignId, "blank")}
      className="nodrag flex w-[360px] items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/60 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-accent hover:text-foreground"
    >
      <CirclePlus className="h-4 w-4" />
      Add variation
    </button>
  );
}

export const nodeTypes = {
  trafficAllocation: TrafficAllocationNode,
  target: TargetNode,
  excluded: ExcludedNode,
  trafficSplit: TrafficSplitNode,
  variation: VariationNode,
  addVariation: AddVariationNode,
};

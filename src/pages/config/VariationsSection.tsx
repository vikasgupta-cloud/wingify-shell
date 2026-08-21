// @summary Add settings gear icon UI in the Variations targeting block.
// Segment settings is still a stub; Trigger settings now opens a small dropdown
// (Once / Always) and the gear icon shows a tooltip reflecting the selection.
import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit2,
  HelpCircle,
  Lock,
  LockOpen,
  MinusCircle,
  Monitor,
  MoreVertical,
  PlusCircle,
  Rows3,
  Settings,
  Smartphone,
  Tablet,
  X,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  useConfigStore,
  type ConfigVariation,
  type RedirectMatchType,
} from "../../store/config";
import { useWandzStore } from "../../store/wandz";
import { TRIGGERS, FREQUENCIES } from "../../config/configOptions";
import AskWandzButton from "./AskWandzButton";
import SectionTitle from "./SectionTitle";
import SegmentPicker from "./SegmentPicker";

// The header + card wrapper shared by all three sub-blocks.
function SubBlock({
  anchor,
  title,
  description,
  noPadding,
  children,
}: {
  anchor: string;
  title: string;
  description: string;
  noPadding?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div id={anchor} className="scroll-mt-20">
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="mb-3 inline-block w-fit cursor-default text-sm font-medium text-foreground">
              {title}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right">{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-background",
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
  showSettings,
  settingsSelected,
  onSettingsChange,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  showSettings?: boolean;
  settingsSelected?: "Once" | "Always";
  onSettingsChange?: (v: "Once" | "Always") => void;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-[120px_auto_1fr] items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">:</span>
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[200px]">
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
        {showSettings ? (
          settingsSelected && onSettingsChange ? (
            <DropdownMenu>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`${label} settings`}
                        title={`Checking trigger conditions: ${settingsSelected}`}
                        className="h-7 w-7 shrink-0 text-muted-foreground"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    Checking trigger conditions: {settingsSelected}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                  Check trigger conditions for a visitor
                </div>
                <DropdownMenuItem
                  onSelect={() => onSettingsChange("Once")}
                  className={cn(
                    "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                    settingsSelected === "Once"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Once
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => onSettingsChange("Always")}
                  className={cn(
                    "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                    settingsSelected === "Always"
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  Always
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Stub (segment gear icon, or if settings wiring isn't provided).
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`${label} settings`}
              className="h-7 w-7 shrink-0 text-muted-foreground"
              onClick={() => {
                // Stub: future settings popover/drawer.
              }}
            >
              <Settings className="h-4 w-4" />
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}

const VIEWS: { id: "desktop" | "mobile" | "tablet"; icon: typeof Monitor }[] = [
  { id: "desktop", icon: Monitor },
  { id: "tablet", icon: Tablet },
  { id: "mobile", icon: Smartphone },
];

// Shared grid used by the table header and every variation row. Columns are FIXED
// widths so nothing gets congested — the redirect editor (URL match + URL + cancel +
// confirm) always has room. When the sum exceeds the panel, the wrapper scrolls
// horizontally (see the overflow-x-auto container) rather than squashing cells. The
// Variations (first) and actions (last) columns are pinned via STICKY_* below.
// items-stretch so each cell fills the row height and the pinned cells' opaque
// background fully masks the cells scrolling underneath them.
const GRID_BASE = "grid items-stretch gap-4";
// Default: flexible columns that fill the panel — no horizontal scroll.
const GRID_FIT =
  "grid-cols-[minmax(160px,1.5fr)_minmax(110px,0.8fr)_minmax(110px,0.8fr)_minmax(160px,1.3fr)_96px]";
// Once a redirect variation exists the Edit-with column needs the redirect editor
// (match + URL + cancel + confirm), so we switch to fixed widths + a min-width that
// triggers horizontal scroll rather than squashing the cells.
const GRID_SCROLL =
  "grid-cols-[220px_160px_140px_minmax(340px,1fr)_96px] min-w-[1020px]";
// Pinned first column (variation name) — sticks to the left edge while scrolling.
const STICKY_NAME =
  "sticky left-0 z-10 flex min-w-0 items-center overflow-hidden pl-6";
// Pinned last column (row actions) — sticks to the right edge while scrolling.
const STICKY_ACTIONS =
  "sticky right-0 z-10 flex items-center justify-end pr-4";

type RowHeight = "sm" | "md" | "lg";
// Body-row vertical padding per density. Header band is unaffected.
const ROW_PADDING: Record<RowHeight, string> = {
  sm: "py-1.5",
  md: "py-2.5",
  lg: "py-4",
};
const ROW_HEIGHT_OPTIONS: { id: RowHeight; label: string }[] = [
  { id: "sm", label: "Small" },
  { id: "md", label: "Medium" },
  { id: "lg", label: "Large" },
];

const REDIRECT_MATCH_LABELS: Record<RedirectMatchType, string> = {
  matches: "URL matches",
  contains: "URL contains",
  starts: "URL starts with",
  ends: "URL ends with",
};

// -- Editor URL row (card header band above the table). ----------------------
function EditorUrlRow({ campaignId }: { campaignId: string }) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const patch = useConfigStore((s) => s.patch);
  const [editing, setEditing] = useState(false);
  if (!config) return null;

  // Show the open input whenever the URL is empty (nothing to display yet) or
  // while the user is explicitly editing an existing value.
  const showInput = editing || !config.editorUrl;

  return (
    <div className="flex items-center justify-between gap-4 bg-background px-6 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-sm text-muted-foreground">Editor URL</span>
        {showInput ? (
          <Input
            autoFocus={editing}
            placeholder="https://"
            value={config.editorUrl}
            onChange={(e) => patch(campaignId, { editorUrl: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="h-8 w-[280px] bg-background"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="group inline-flex min-w-0 items-center gap-1.5"
          >
            <span
              className={cn(
                "truncate text-sm",
                config.editorUrl ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {config.editorUrl || "https://"}
            </span>
            <Edit2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none md:opacity-0" />
          </button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span className="text-sm text-muted-foreground">Editor view:</span>
        <div className="flex items-center rounded-md border border-border bg-background p-0.5">
          {VIEWS.map(({ id: view, icon: Icon }) => (
            <Button
              key={view}
              type="button"
              variant={config.editorView === view ? "secondary" : "ghost"}
              size="icon"
              aria-label={view}
              className="h-7 w-7"
              onClick={() => patch(campaignId, { editorView: view })}
            >
              <Icon />
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Editor settings"
          className="h-8 w-8 bg-background text-muted-foreground"
          // TODO: editor settings
        >
          <Settings />
        </Button>
      </div>
    </div>
  );
}

// -- Variations name cell (text -> hover pencil -> inline input). ------------
function NameCell({
  campaignId,
  variation,
  editing,
  onStart,
  onDone,
}: {
  campaignId: string;
  variation: ConfigVariation;
  editing: boolean;
  onStart: () => void;
  onDone: () => void;
}) {
  const renameVariation = useConfigStore((s) => s.renameVariation);
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="flex size-6 shrink-0 items-center justify-center rounded bg-[var(--report-brand-tint)] text-xs font-medium text-brand-deep">
        {variation.label}
      </span>
      {editing ? (
        <Input
          autoFocus
          placeholder="Variation name"
          value={variation.name}
          onChange={(e) => renameVariation(campaignId, variation.id, e.target.value)}
          onBlur={onDone}
          onKeyDown={(e) => e.key === "Enter" && onDone()}
          className="h-8 flex-1"
        />
      ) : (
        <button
          type="button"
          onClick={onStart}
          className="group inline-flex min-w-0 items-center gap-1.5"
        >
          <span
            title={variation.name}
            className="truncate text-sm text-foreground"
          >
            {variation.name}
          </span>
          <Edit2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-opacity duration-150 group-hover:opacity-100 motion-reduce:transition-none md:opacity-0" />
        </button>
      )}
    </div>
  );
}

// -- Variation traffic split cell. -------------------------------------------
function SplitCell({
  campaignId,
  variation,
  mode,
}: {
  campaignId: string;
  variation: ConfigVariation;
  mode: "Manual" | "Equal" | "Auto";
}) {
  const setSplit = useConfigStore((s) => s.setSplit);
  const toggleLock = useConfigStore((s) => s.toggleLock);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (mode !== "Manual") {
    return <span className="text-sm tabular-nums text-foreground">{variation.split}%</span>;
  }

  const commit = () => {
    const n = Number(draft);
    if (!Number.isNaN(n)) setSplit(campaignId, variation.id, n);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-1">
      {editing ? (
        <Input
          autoFocus
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && commit()}
          className="h-8 w-16 tabular-nums"
        />
      ) : (
        <>
          <span className="w-10 text-sm tabular-nums text-foreground">
            {variation.split}%
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit split"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => {
              setDraft(String(variation.split));
              setEditing(true);
            }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={variation.locked ? "Unlock split" : "Lock split"}
                  className="h-8 w-8 text-muted-foreground"
                  onClick={() => toggleLock(campaignId, variation.id)}
                >
                  {variation.locked ? <Lock /> : <LockOpen />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {variation.locked ? "Unlock split" : "Lock split"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}

// -- Redirect editor (committed + editing states) for the Edit-with cell. -----
function RedirectEditor({
  campaignId,
  variation,
  editing,
  onEdit,
  onDone,
}: {
  campaignId: string;
  variation: ConfigVariation;
  editing: boolean;
  onEdit: () => void;
  onDone: () => void;
}) {
  const updateVariation = useConfigStore((s) => s.updateVariation);
  const matchType = variation.redirectMatchType ?? "matches";
  const [draftUrl, setDraftUrl] = useState(variation.redirectUrl ?? "");
  const [draftMatch, setDraftMatch] = useState<RedirectMatchType>(matchType);

  // Seed the drafts from the committed values whenever we (re-)enter edit mode.
  useEffect(() => {
    if (editing) {
      setDraftUrl(variation.redirectUrl ?? "");
      setDraftMatch(variation.redirectMatchType ?? "matches");
    }
  }, [editing, variation.redirectUrl, variation.redirectMatchType]);

  if (editing) {
    const confirm = () => {
      updateVariation(campaignId, variation.id, {
        redirectUrl: draftUrl,
        redirectMatchType: draftMatch,
      });
      onDone();
    };
    return (
      // Single row: the match-type Select conveys "Redirect to …" (no separate
      // label needed), and the URL input flexes to fill the cell (min-w-0 lets
      // it shrink rather than wrap or force horizontal scroll).
      <div className="flex w-full items-center gap-2">
        <Select
          value={draftMatch}
          onValueChange={(v) => setDraftMatch(v as RedirectMatchType)}
        >
          <SelectTrigger className="h-8 w-[130px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(REDIRECT_MATCH_LABELS) as RedirectMatchType[]).map((k) => (
              <SelectItem key={k} value={k}>
                {REDIRECT_MATCH_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          autoFocus
          placeholder="https://"
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && confirm()}
          className="h-8 min-w-0 flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancel"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          onClick={onDone}
        >
          <X />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Confirm redirect"
          className="h-8 w-8 shrink-0"
          onClick={confirm}
        >
          <Check />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center gap-2">
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted-foreground">
          Redirect to {REDIRECT_MATCH_LABELS[matchType]}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            title={variation.redirectUrl || undefined}
            className={cn(
              "truncate text-sm",
              variation.redirectUrl ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {variation.redirectUrl || "https://"}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Edit redirect"
            className="h-7 w-7 shrink-0 text-muted-foreground"
            onClick={onEdit}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Redirection settings"
            className="h-8 shrink-0 gap-1 px-2 text-muted-foreground"
          >
            <Settings className="h-4 w-4" />
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 p-4">
          <div className="text-sm font-medium text-foreground">Redirection settings</div>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex gap-2">
              <Checkbox
                checked={!!variation.redirectExcludeQuery}
                onCheckedChange={(c) =>
                  updateVariation(campaignId, variation.id, {
                    redirectExcludeQuery: c === true,
                  })
                }
                className="mt-0.5"
              />
              <span className="text-sm leading-tight">
                <span className="text-foreground">Exclude Query String</span>
                <span className="block text-xs text-muted-foreground">
                  Excludes text after '?' while redirecting
                </span>
              </span>
            </label>
            <label className="flex gap-2">
              <Checkbox
                checked={!!variation.redirectExcludeFragments}
                onCheckedChange={(c) =>
                  updateVariation(campaignId, variation.id, {
                    redirectExcludeFragments: c === true,
                  })
                }
                className="mt-0.5"
              />
              <span className="text-sm leading-tight">
                <span className="text-foreground">Exclude Fragments</span>
                <span className="block text-xs text-muted-foreground">
                  Excludes text after '#' while redirecting
                </span>
              </span>
            </label>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// -- Edit-with cell dispatch. ------------------------------------------------
function EditWithCell({
  campaignId,
  variation,
  redirectEditing,
  onRedirectEdit,
  onRedirectDone,
}: {
  campaignId: string;
  variation: ConfigVariation;
  redirectEditing: boolean;
  onRedirectEdit: () => void;
  onRedirectDone: () => void;
}) {
  if (variation.id === "control") {
    return <span className="text-sm text-muted-foreground">View</span>;
  }
  if (variation.type === "redirect") {
    return (
      <RedirectEditor
        campaignId={campaignId}
        variation={variation}
        editing={redirectEditing}
        onEdit={onRedirectEdit}
        onDone={onRedirectDone}
      />
    );
  }
  return (
    <Button
      asChild
      variant="link"
      size="sm"
      className="h-auto p-0 text-sm font-medium"
    >
      <a
        href={`/web-experiment/c/${campaignId}/editor/${variation.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Launch Editor
      </a>
    </Button>
  );
}

// -- Actions cell (minus-remove + kebab). ------------------------------------
function ActionsCell({
  campaignId,
  variation,
}: {
  campaignId: string;
  variation: ConfigVariation;
}) {
  const removeVariation = useConfigStore((s) => s.removeVariation);
  const isControl = variation.id === "control";
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="flex items-center justify-end gap-0.5 pl-2"
      onClick={stop}
    >
      {!isControl && (
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Remove"
                className="shrink-0 text-muted-foreground"
                onClick={() => removeVariation(campaignId, variation.id)}
              >
                <MinusCircle />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="More actions"
            className="shrink-0 text-muted-foreground"
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled>Use this as baseline</DropdownMenuItem>
          <DropdownMenuItem disabled>Disable variation</DropdownMenuItem>
          <DropdownMenuItem
            // TODO: open live preview
          >
            Live Preview
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isControl}
            onSelect={() => removeVariation(campaignId, variation.id)}
          >
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

const SPLIT_MODES: Array<"Manual" | "Equal" | "Auto"> = ["Manual", "Equal", "Auto"];

// -- The variations table (SubBlock 3 body). ---------------------------------
function VariationsTable({ campaignId }: { campaignId: string }) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const patch = useConfigStore((s) => s.patch);
  const setSplitMode = useConfigStore((s) => s.setSplitMode);
  const addTypedVariation = useConfigStore((s) => s.addTypedVariation);

  const [nameEditingId, setNameEditingId] = useState<string | null>(null);
  const [redirectEditingId, setRedirectEditingId] = useState<string | null>(null);

  // Session-only table view state (row density only; no column resizing).
  const [rowHeight, setRowHeight] = useState<RowHeight>("md");

  if (!config) return null;

  // Only redirect variations need the wide Edit-with editor; without them the table
  // fits and must not scroll horizontally.
  const hasRedirect = config.variations.some((v) => v.type === "redirect");
  const gridClass = cn(GRID_BASE, hasRedirect ? GRID_SCROLL : GRID_FIT);

  const addEditor = () => {
    const id = addTypedVariation(campaignId, "editor");
    if (id) setNameEditingId(id);
  };
  const addRedirect = () => {
    const id = addTypedVariation(campaignId, "redirect");
    if (id) setRedirectEditingId(id);
  };

  return (
    <div>
      <EditorUrlRow campaignId={campaignId} />

      {/* Horizontally scrollable table. Columns keep generous fixed widths; when the
          redirect editor pushes the total past the panel, this scrolls instead of
          squeezing. The Variations and actions columns are pinned (STICKY_*). */}
      <div className="overflow-x-auto">
        {/* Header band — each column's label, with the split-mode and editor selects
            docked directly beneath their own column labels. */}
        <div className={cn(gridClass, "border-y border-border bg-background")}>
          <div className="sticky left-0 z-10 flex min-w-0 items-start overflow-hidden bg-background pl-6 py-3">
            <span className="truncate text-sm font-medium text-foreground">Variations</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 py-3">
            <span className="truncate text-sm font-medium text-foreground">Traffic Split</span>
            <Select
              value={config.splitMode}
              onValueChange={(v) => setSplitMode(campaignId, v as typeof config.splitMode)}
            >
              <SelectTrigger className="h-7 w-fit gap-1 border-0 bg-transparent px-0 text-sm text-foreground shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SPLIT_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m === "Auto" ? "Auto (multi-armed bandit)" : m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex min-w-0 items-start gap-1 py-3">
            <span className="truncate text-sm font-medium text-foreground">Modifications</span>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  Number of design changes made to this variation.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5 py-3">
            <span className="truncate text-sm font-medium text-foreground">Edit with</span>
            <Select
              value={config.editWith}
              onValueChange={(v) => patch(campaignId, { editWith: v as "visual" | "code" })}
            >
              <SelectTrigger className="h-7 w-fit gap-1 border-0 bg-transparent px-0 text-sm text-foreground shadow-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visual">Visual Editor</SelectItem>
                <SelectItem value="code">Code Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sticky right-0 z-10 flex items-start justify-end bg-background pr-4 py-3">
            <TooltipProvider delayDuration={150}>
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Row height"
                        className="h-8 w-8 text-muted-foreground"
                      >
                        <Rows3 />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Row height</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  {ROW_HEIGHT_OPTIONS.map((o) => (
                    <DropdownMenuCheckboxItem
                      key={o.id}
                      checked={rowHeight === o.id}
                      onCheckedChange={() => setRowHeight(o.id)}
                    >
                      {o.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          </div>
        </div>

        {/* Rows. */}
        <div className="divide-y divide-border">
          {config.variations.map((v) => {
            const isControl = v.id === "control";
            const mods = isControl || v.type === "redirect" ? "—" : "0";
            return (
              <div key={v.id} className={cn(gridClass, "bg-background")}>
                <div className={cn(STICKY_NAME, "bg-background", ROW_PADDING[rowHeight])}>
                  <NameCell
                    campaignId={campaignId}
                    variation={v}
                    editing={nameEditingId === v.id}
                    onStart={() => setNameEditingId(v.id)}
                    onDone={() => setNameEditingId((c) => (c === v.id ? null : c))}
                  />
                </div>
                <div className={cn("flex min-w-0 items-center overflow-hidden", ROW_PADDING[rowHeight])}>
                  <SplitCell campaignId={campaignId} variation={v} mode={config.splitMode} />
                </div>
                <span className={cn("flex min-w-0 items-center truncate text-sm tabular-nums text-muted-foreground", ROW_PADDING[rowHeight])}>
                  {mods}
                </span>
                <div className={cn("flex min-w-0 items-center overflow-hidden", ROW_PADDING[rowHeight])}>
                  <EditWithCell
                    campaignId={campaignId}
                    variation={v}
                    redirectEditing={redirectEditingId === v.id}
                    onRedirectEdit={() => setRedirectEditingId(v.id)}
                    onRedirectDone={() =>
                      setRedirectEditingId((c) => (c === v.id ? null : c))
                    }
                  />
                </div>
                <div className={cn(STICKY_ACTIONS, "bg-background", ROW_PADDING[rowHeight])}>
                  <ActionsCell campaignId={campaignId} variation={v} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: add-variation split button. */}
      <div className="flex items-center border-t border-border px-6 py-3">
        <div className="inline-flex items-stretch">
          <Button
            type="button"
            size="sm"
            className="relative rounded-r-none border-r-0 shadow-none focus-visible:z-10"
            onClick={addEditor}
          >
            <PlusCircle />
            Add variation
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                size="sm"
                aria-label="Add variation options"
                className="relative h-8 rounded-l-none border-l border-l-primary-foreground/25 px-1.5 shadow-none focus-visible:z-10"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuItem
                className="flex-col items-start gap-0.5"
                onSelect={addEditor}
              >
                <span className="text-sm text-foreground">Edit with the Editor</span>
                <span className="text-xs text-muted-foreground">
                  Make design changes directly on this page.
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex-col items-start gap-0.5"
                onSelect={addRedirect}
              >
                <span className="text-sm text-foreground">Redirect to another page</span>
                <span className="text-xs text-muted-foreground">
                  Send visitors to a different URL you've already built.
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function VariationsSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const patch = useConfigStore((s) => s.patch);
  const openWorkflow = useConfigStore((s) => s.openWorkflow);
  const openWandz = useWandzStore((s) => s.openWandz);

  if (!config) return null;

  const inCampaign = config.trafficAllocation;
  const outCampaign = 100 - config.trafficAllocation;

  const setAllocation = (raw: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(raw || 0)));
    patch(id, { trafficAllocation: clamped });
  };

  // Segment settings gear (visual “advanced targeting” stub) controls two
  // existing config fields:
  // - `frequency`: Once vs Always (simplified)
  // - `trigger`: visibility timing (best-effort mapping to our TRIGGERS list)
  const targetingConditions: "Once" | "Always" =
    config.frequency === "Always" ? "Always" : "Once";

  type VisibilityWhen = "Campaign executes" | "DOM Ready" | "Custom Event" | "Always";
  const visibilityWhen: VisibilityWhen =
    config.trigger === "Custom Event"
      ? "Custom Event"
      : config.trigger === "Scroll Depth"
        ? "Always"
        : config.trigger === "Element Clicked"
          ? "DOM Ready"
          : "Campaign executes";

  const setTargetingConditions = (v: "Once" | "Always") =>
    patch(id, {
      frequency: v === "Always" ? "Always" : "Once per visitor",
    });

  const setVisibilityWhen = (v: VisibilityWhen) =>
    patch(id, {
      trigger:
        v === "Campaign executes"
          ? "Page Viewed"
          : v === "DOM Ready"
            ? "Element Clicked"
            : v === "Custom Event"
              ? "Custom Event"
              : "Scroll Depth",
    });

  return (
    <section>
      {/* Heading row. Hidden in the guided view, where the step header owns the
          title and the Workflow Mode CTA (see ConfigPage). */}
      <div data-section-heading className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <SectionTitle sectionId="variations" className="text-lg" />
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
          anchor="section-variations-targeting"
          title="Set targeting"
          description="Select who, when and how users will see your campaign."
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[120px_auto_1fr] items-center gap-3">
              <span className="text-sm text-muted-foreground">Segment</span>
              <span className="text-muted-foreground">:</span>
              <div className="flex items-center gap-2">
                <SegmentPicker campaignId={id} triggerClassName="w-[200px]" />
                <DropdownMenu>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Segment settings"
                            title={`Targeting: ${targetingConditions} · Visible when: ${visibilityWhen}`}
                            className="h-7 w-7 shrink-0 text-muted-foreground"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        Targeting: {targetingConditions} · Visible when: {visibilityWhen}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenuContent align="end" className="w-80 p-2">
                    <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                      Check targeting conditions for a visitor
                    </div>

                    <DropdownMenuItem
                      onSelect={() => setTargetingConditions("Once")}
                      className={cn(
                        "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                        targetingConditions === "Once"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      Once
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setTargetingConditions("Always")}
                      className={cn(
                        "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                        targetingConditions === "Always"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      Always
                    </DropdownMenuItem>

                    <DropdownMenuSeparator className="my-2" />

                    <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                      Make modified elements visible when
                    </div>

                    <DropdownMenuItem
                      onSelect={() => setVisibilityWhen("Campaign executes")}
                      className={cn(
                        "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                        visibilityWhen === "Campaign executes"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      Campaign executes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setVisibilityWhen("DOM Ready")}
                      className={cn(
                        "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                        visibilityWhen === "DOM Ready"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      DOM Ready
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setVisibilityWhen("Custom Event")}
                      className={cn(
                        "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                        visibilityWhen === "Custom Event"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      Custom Event
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => setVisibilityWhen("Always")}
                      className={cn(
                        "mx-1 my-1 flex items-center justify-start rounded-md px-2 py-2 text-sm",
                        visibilityWhen === "Always"
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      Always (elements are not hidden)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <TargetingRow
              label="Trigger"
              value={config.trigger}
              options={TRIGGERS}
              showSettings
              settingsSelected={config.frequency === "Always" ? "Always" : "Once"}
              onSettingsChange={(v) =>
                patch(id, {
                  // "Once" is represented as "Once per visitor" in the full frequency list.
                  frequency: v === "Always" ? "Always" : "Once per visitor",
                })
              }
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
          anchor="section-variations-variations"
          title="Variations"
          description="Create variations and set traffic split"
          noPadding
        >
          <VariationsTable campaignId={id} />
        </SubBlock>
      </div>
    </section>
  );
}

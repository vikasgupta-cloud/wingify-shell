import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ChevronDown,
  Compass,
  Copy,
  Maximize2,
  Minimize2,
  MinusCircle,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SegmentConditionControls } from "@/components/segments/SegmentConditionControls";
import {
  SegmentDefinitionPanel,
  type SegmentDisplayDef,
} from "@/components/segments/SegmentDefinitionPanel";
import {
  describeCustomSegment,
  findSegmentByLabel,
  makeCondition,
  STANDARD_SEGMENTS,
  type SegmentAttribute,
  type SegmentCondition,
  type SegmentConnector,
} from "@/config/segments";

// ---------------------------------------------------------------------------
// Shared catalog (config + reports) — local aliases for list rendering.

type Segment = {
  name: string;
  description: string;
  attr?: SegmentAttribute;
  unsaved?: boolean;
};
type SegmentGroup = {
  id: string;
  pill: string;
  section: string;
  items: Segment[];
};

const SEGMENT_GROUPS: SegmentGroup[] = STANDARD_SEGMENTS.map((c) => ({
  id: c.id,
  pill: c.label,
  section: c.section,
  items: c.attributes.map((a) => ({
    name: a.label,
    description: a.description ?? "",
    attr: a,
  })),
}));

const ALL_SEGMENTS = SEGMENT_GROUPS.flatMap((g) => g.items);

function findSegment(name: string): Segment | undefined {
  return ALL_SEGMENTS.find((s) => s.name === name);
}

function stdDisplayDef(a: SegmentAttribute): SegmentDisplayDef {
  return {
    label: a.label,
    kind: "Standard",
    description: a.description,
    condition: a.condition,
  };
}

// ---------------------------------------------------------------------------
// Custom Logic — keep reports block/bracket layout; fields match Create custom.

const CONNECTORS = ["And", "Or"] as const;

type FilterBlock = {
  id: string;
  connector: SegmentConnector;
  conditions: SegmentCondition[];
};

let uidCounter = 0;
const uid = () => `q${++uidCounter}`;

function newCondition(): SegmentCondition {
  return { ...makeCondition(), id: uid() };
}

function newBlock(): FilterBlock {
  return { id: uid(), connector: "And", conditions: [newCondition()] };
}

function cloneBlock(block: FilterBlock): FilterBlock {
  return {
    id: uid(),
    connector: block.connector,
    conditions: block.conditions.map((c) => ({ ...c, id: uid() })),
  };
}

// ---------------------------------------------------------------------------

type CategoryId = "all" | "mine" | (string & {});

/** Metric-picker pill style — shared across segment + metric boxes. */
function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn(
        "rounded-full",
        active && "border-accent bg-accent text-foreground"
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

/* @undo Selected chips bar removed from SegmentsPickerPanel.
function SelectedTag({
  name,
  onRemove,
  onEdit,
}: {
  name: string;
  onRemove: () => void;
  onEdit?: () => void;
}) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-border bg-background pl-2.5 pr-1.5 text-sm text-foreground">
      <span className="max-w-[160px] truncate">{name}</span>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${name}`}
          className="flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-3 w-3" aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="flex h-4 w-4 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </span>
  );
}
*/

function SegmentRow({
  segment,
  checked,
  focused,
  unsaved,
  onToggle,
  onFocus,
  onSave,
  onEdit,
  onRename,
  onDelete,
}: {
  segment: Segment;
  checked: boolean;
  focused: boolean;
  unsaved?: boolean;
  onToggle: () => void;
  onFocus: () => void;
  onSave?: () => void;
  onEdit?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}) {
  const showKebab = !unsaved && (onEdit || onRename || onDelete);

  return (
    <div
      onMouseEnter={onFocus}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-2 transition-colors",
        focused ? "bg-muted/70" : "hover:bg-muted/50"
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle()}
        onFocus={onFocus}
        className="h-4 w-4 shrink-0 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <button
        type="button"
        onClick={onFocus}
        title={segment.name}
        className={cn(
          "min-w-0 max-w-[18ch] flex-1 truncate text-left text-sm",
          checked ? "font-medium text-foreground" : "text-foreground"
        )}
      >
        {segment.name}
      </button>
      {unsaved && onSave ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave();
          }}
          className="ml-auto shrink-0 text-xs font-semibold text-foreground underline-offset-2 hover:underline"
        >
          Save
        </button>
      ) : null}
      {showKebab ? (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              aria-label={`Actions for ${segment.name}`}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-[60] min-w-[140px] rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {onEdit ? (
                <DropdownMenu.Item
                  onSelect={onEdit}
                  className="cursor-pointer rounded-sm px-2.5 py-1.5 outline-none data-[highlighted]:bg-accent"
                >
                  Edit
                </DropdownMenu.Item>
              ) : null}
              {onRename ? (
                <DropdownMenu.Item
                  onSelect={onRename}
                  className="cursor-pointer rounded-sm px-2.5 py-1.5 outline-none data-[highlighted]:bg-accent"
                >
                  Rename
                </DropdownMenu.Item>
              ) : null}
              {onDelete ? (
                <DropdownMenu.Item
                  onSelect={onDelete}
                  className="cursor-pointer rounded-sm px-2.5 py-1.5 outline-none data-[highlighted]:bg-accent"
                >
                  Delete
                </DropdownMenu.Item>
              ) : null}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      ) : null}
    </div>
  );
}

/* @undo LeftTab removed — Custom Logic is now "Add custom" under My Segments. */

function ConnectorSelect({
  value,
  onChange,
}: {
  value: SegmentConnector;
  onChange: (v: SegmentConnector) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as SegmentConnector)}
    >
      <SelectTrigger className="h-8 w-[76px] gap-1 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CONNECTORS.map((c) => (
          <SelectItem key={c} value={c}>
            {c}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// The square brackets that flank each condition. Drawn with borders (left/right
// vertical bar + short top & bottom caps) rather than a full box, matching the
// design's grouping-bracket look.
function ConditionBracket({ side }: { side: "left" | "right" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "w-2.5 shrink-0 self-stretch border-border",
        side === "left"
          ? "rounded-l-md border-y border-l"
          : "rounded-r-md border-y border-r"
      )}
    />
  );
}

function ConditionItem({
  condition,
  first,
  canRemove,
  onChange,
  onRemove,
  onDuplicate,
}: {
  condition: SegmentCondition;
  first: boolean;
  canRemove: boolean;
  onChange: (next: SegmentCondition) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="space-y-2">
      {!first && (
        <ConnectorSelect
          value={condition.connector}
          onChange={(connector) => onChange({ ...condition, connector })}
        />
      )}
      <div className="flex items-stretch gap-2">
        <ConditionBracket side="left" />
        <div className="flex-1 space-y-2 py-2">
          <p className="text-xs text-muted-foreground">where</p>
          <SegmentConditionControls
            condition={condition}
            onChange={(patch) => onChange({ ...condition, ...patch })}
            attributeWidthClassName="w-[210px]"
          />
        </div>
        <ConditionBracket side="right" />
        <div className="flex flex-col justify-center gap-1">
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label="Remove condition"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <MinusCircle className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            aria-label="Duplicate condition"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Copy className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterBlockGroup({
  block,
  canRemove,
  onChangeCondition,
  onAddCondition,
  onRemoveCondition,
  onDuplicateCondition,
}: {
  block: FilterBlock;
  canRemove: boolean;
  onChangeCondition: (id: string, next: SegmentCondition) => void;
  onAddCondition: () => void;
  onRemoveCondition: (id: string) => void;
  onDuplicateCondition: (id: string) => void;
}) {
  return (
    <div>
      <div className="space-y-3">
        {block.conditions.map((condition, i) => (
          <ConditionItem
            key={condition.id}
            condition={condition}
            first={i === 0}
            canRemove={canRemove}
            onChange={(next) => onChangeCondition(condition.id, next)}
            onRemove={() => onRemoveCondition(condition.id)}
            onDuplicate={() => onDuplicateCondition(condition.id)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onAddCondition}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add another condition
      </button>
    </div>
  );
}

function CustomLogicBuilder({
  blocks,
  setBlocks,
  name,
  onNameChange,
  onNameBlur,
  nameError,
}: {
  blocks: FilterBlock[];
  setBlocks: Dispatch<SetStateAction<FilterBlock[]>>;
  name: string;
  onNameChange: (next: string) => void;
  onNameBlur?: () => void;
  nameError?: string | null;
}) {
  const [wandzOpen, setWandzOpen] = useState(false);
  const totalConditions = blocks.reduce((n, b) => n + b.conditions.length, 0);

  const changeCondition = (blockId: string, condId: string, next: SegmentCondition) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, conditions: b.conditions.map((c) => (c.id === condId ? next : c)) }
          : b
      )
    );

  const addCondition = (blockId: string) =>
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, conditions: [...b.conditions, newCondition()] }
          : b
      )
    );

  const duplicateCondition = (blockId: string, condId: string) =>
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const idx = b.conditions.findIndex((c) => c.id === condId);
        if (idx < 0) return b;
        const copy = { ...b.conditions[idx]!, id: uid() };
        return {
          ...b,
          conditions: [
            ...b.conditions.slice(0, idx + 1),
            copy,
            ...b.conditions.slice(idx + 1),
          ],
        };
      })
    );

  // Removing the last condition in a block drops the block; never leave the
  // builder empty.
  const removeCondition = (blockId: string, condId: string) =>
    setBlocks((prev) => {
      const next = prev
        .map((b) =>
          b.id === blockId
            ? { ...b, conditions: b.conditions.filter((c) => c.id !== condId) }
            : b
        )
        .filter((b) => b.conditions.length > 0);
      return next.length ? next : [newBlock()];
    });

  return (
    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
      <div className="space-y-1.5">
        <Label htmlFor="custom-segment-name" className="text-xs text-muted-foreground">
          Segment name
        </Label>
        <Input
          id="custom-segment-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameBlur}
          placeholder="Custom 1"
          className="h-9 max-w-sm font-medium"
        />
        {nameError ? (
          <p className="text-sm text-danger-fg">{nameError}</p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">All visitors…</p>
        <button
          type="button"
          onClick={() => setWandzOpen((o) => !o)}
          aria-expanded={wandzOpen}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium transition-colors",
            wandzOpen
              ? "bg-muted text-foreground"
              : "bg-background text-foreground hover:bg-muted/60"
          )}
        >
          Do it with
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          Wandz AI
        </button>
      </div>

      {wandzOpen ? (
        <div className="rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-medium text-foreground">
            Describe the segment you want
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Wandz will turn your prompt into custom logic conditions.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Input
              placeholder="e.g. Only mobile visitors from paid search"
              className="h-9 flex-1"
            />
            <Button type="button" size="sm">
              Generate
            </Button>
          </div>
        </div>
      ) : null}

      {blocks.map((block, bi) => (
        <Fragment key={block.id}>
          {bi > 0 && (
            <ConnectorSelect
              value={block.connector}
              onChange={(connector) =>
                setBlocks((prev) =>
                  prev.map((b) => (b.id === block.id ? { ...b, connector } : b))
                )
              }
            />
          )}
          <FilterBlockGroup
            block={block}
            canRemove={totalConditions > 1}
            onChangeCondition={(condId, next) =>
              changeCondition(block.id, condId, next)
            }
            onAddCondition={() => addCondition(block.id)}
            onRemoveCondition={(condId) => removeCondition(block.id, condId)}
            onDuplicateCondition={(condId) =>
              duplicateCondition(block.id, condId)
            }
          />
        </Fragment>
      ))}
    </div>
  );
}

// Shared picker state so the mini dropdown and full drawer stay in sync when
// expanding / collapsing without losing the in-progress draft.
function useSegmentsState(value: string[]) {
  const [draft, setDraft] = useState<string[]>(value);
  const [category, setCategory] = useState<CategoryId>("all");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState<string>(
    value[0] ?? ALL_SEGMENTS[0]!.name
  );
  // Unsaved drafts live here until Save; saved ones move to savedCustoms.
  const [unsavedCustoms, setUnsavedCustoms] = useState<
    Record<string, FilterBlock[]>
  >({});
  const [savedCustoms, setSavedCustoms] = useState<
    Record<string, FilterBlock[]>
  >({});
  const [nameError, setNameError] = useState<string | null>(null);

  const resetFromValue = (next: string[]) => {
    setDraft(next);
    setCategory("all");
    setSearch("");
    setFocused(next[0] ?? ALL_SEGMENTS[0]!.name);
    setUnsavedCustoms({});
    setNameError(null);
  };

  const toggle = (name: string) =>
    setDraft((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const nameTaken = (name: string, except?: string) => {
    const n = name.trim();
    if (!n) return true;
    if (except && n === except) return false;
    if (findSegment(n)) return true;
    if (n in savedCustoms && n !== except) return true;
    if (n in unsavedCustoms && n !== except) return true;
    return false;
  };

  const nextCustomName = () => {
    let n = 1;
    while (nameTaken(`Custom ${n}`)) n += 1;
    return `Custom ${n}`;
  };

  const addCustom = () => {
    const name = nextCustomName();
    setUnsavedCustoms((prev) => ({ ...prev, [name]: [newBlock()] }));
    setDraft((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setFocused(name);
    setCategory("mine");
    setNameError(null);
  };

  // Persist unsaved → My Segments. `asName` applies a pending name edit in the
  // same update (avoids reading stale unsavedCustoms after renameUnsaved).
  const saveCustom = (currentKey: string, asName?: string): boolean => {
    const blocks = unsavedCustoms[currentKey];
    if (!blocks) return false;
    const trimmed = (asName ?? currentKey).trim();
    if (!trimmed) {
      setNameError("Enter a segment name.");
      return false;
    }
    if (findSegment(trimmed)) {
      setNameError("This name is already used by a built-in segment.");
      return false;
    }
    if (trimmed !== currentKey && nameTaken(trimmed, currentKey)) {
      setNameError("This name is already in use.");
      return false;
    }
    setSavedCustoms((prev) => ({ ...prev, [trimmed]: blocks }));
    setUnsavedCustoms((prev) => {
      const next = { ...prev };
      delete next[currentKey];
      return next;
    });
    if (trimmed !== currentKey) {
      setDraft((prev) => prev.map((n) => (n === currentKey ? trimmed : n)));
    }
    setFocused(trimmed);
    setNameError(null);
    setCategory("mine");
    return true;
  };

  const renameUnsaved = (oldName: string, nextLabel: string) => {
    if (!(oldName in unsavedCustoms)) return false;
    const trimmed = nextLabel.trim();
    if (!trimmed || trimmed === oldName) {
      setNameError(null);
      return trimmed === oldName;
    }
    if (nameTaken(trimmed, oldName)) {
      setNameError("This name is already in use.");
      return false;
    }
    setUnsavedCustoms((prev) => {
      const blocks = prev[oldName];
      if (!blocks) return prev;
      const copy = { ...prev };
      delete copy[oldName];
      copy[trimmed] = blocks;
      return copy;
    });
    setDraft((prev) => prev.map((n) => (n === oldName ? trimmed : n)));
    setFocused(trimmed);
    setNameError(null);
    return true;
  };

  const renameSaved = (oldName: string, nextLabel: string): boolean => {
    if (!(oldName in savedCustoms)) return false;
    const trimmed = nextLabel.trim();
    if (!trimmed) {
      setNameError("Enter a segment name.");
      return false;
    }
    if (trimmed === oldName) {
      setNameError(null);
      return true;
    }
    if (nameTaken(trimmed, oldName)) {
      setNameError("This name is already in use.");
      return false;
    }
    setSavedCustoms((prev) => {
      const blocks = prev[oldName];
      if (!blocks) return prev;
      const copy = { ...prev };
      delete copy[oldName];
      copy[trimmed] = blocks;
      return copy;
    });
    setDraft((prev) => prev.map((n) => (n === oldName ? trimmed : n)));
    if (focused === oldName) setFocused(trimmed);
    setNameError(null);
    return true;
  };

  const deleteSaved = (name: string) => {
    setSavedCustoms((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setDraft((prev) => prev.filter((n) => n !== name));
    if (focused === name) {
      setFocused(ALL_SEGMENTS[0]!.name);
    }
  };

  // Move a saved custom back into the unsaved builder so it can be edited.
  const editSaved = (name: string) => {
    const blocks = savedCustoms[name];
    if (!blocks) return;
    setUnsavedCustoms((prev) => ({
      ...prev,
      [name]: blocks.map((b) => cloneBlock(b)),
    }));
    setSavedCustoms((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFocused(name);
    setCategory("mine");
    setNameError(null);
  };

  const setFocusedUnsavedBlocks: Dispatch<SetStateAction<FilterBlock[]>> = (
    action
  ) => {
    setUnsavedCustoms((prev) => {
      const current = prev[focused];
      if (!current) return prev;
      const next = typeof action === "function" ? action(current) : action;
      return { ...prev, [focused]: next };
    });
  };

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();

    const unsavedItems = Object.keys(unsavedCustoms)
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map((name) => ({
        name,
        description: "Unsaved custom segment — save to keep it in My Segments.",
        unsaved: true as const,
      }));

    const savedItems = Object.keys(savedCustoms)
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map((name) => ({
        name,
        description: describeCustomSegment(
          savedCustoms[name]!.flatMap((b) => b.conditions)
        ),
        unsaved: false as const,
      }));

    const mineItems = [...unsavedItems, ...savedItems];

    const groups: {
      id: string;
      pill: string;
      section: string;
      items: (Segment & { unsaved?: boolean })[];
    }[] = [];

    for (const g of SEGMENT_GROUPS) {
      const items = g.items.filter(
        (s) => !q || s.name.toLowerCase().includes(q)
      );
      if (items.length > 0) {
        groups.push({ ...g, items });
      }
    }

    // My Segments always last. Keep it when not searching so Add custom is reachable.
    if (!q || mineItems.length > 0) {
      groups.push({
        id: "mine",
        pill: "My Segments",
        section: "My Segments",
        items: mineItems,
      });
    }

    return groups;
  }, [search, unsavedCustoms, savedCustoms]);

  const focusedUnsaved = focused in unsavedCustoms;
  const focusedDisplayDef: SegmentDisplayDef | null = (() => {
    if (focusedUnsaved) return null;
    if (focused in savedCustoms) {
      const conditions = savedCustoms[focused]!.flatMap((b) => b.conditions);
      return {
        label: focused,
        kind: "Custom",
        description: describeCustomSegment(conditions),
      };
    }
    const a = findSegmentByLabel(focused);
    return a ? stdDisplayDef(a) : null;
  })();

  return {
    draft,
    setDraft,
    category,
    setCategory,
    search,
    setSearch,
    focused,
    setFocused,
    toggle,
    addCustom,
    saveCustom,
    renameUnsaved,
    renameSaved,
    deleteSaved,
    editSaved,
    setFocusedUnsavedBlocks,
    focusedUnsaved,
    focusedUnsavedBlocks: unsavedCustoms[focused] ?? null,
    nameError,
    setNameError,
    visibleGroups,
    focusedDisplayDef,
    resetFromValue,
    savedCustoms,
    unsavedCustoms,
    nameTaken,
  };
}

type SegmentsState = ReturnType<typeof useSegmentsState>;

// Shared chrome used by both the mega-dropdown and the full drawer so the two
// views stay identical — only the shell (popover vs dialog) differs.
function SegmentsPickerPanel({
  seg,
  onApply,
  titleAs,
  headerActions,
}: {
  seg: SegmentsState;
  onApply: () => void;
  titleAs: "h2" | "dialog";
  headerActions: React.ReactNode;
}) {
  const {
    draft,
    setDraft,
    category,
    setCategory,
    search,
    setSearch,
    focused,
    setFocused,
    toggle,
    addCustom,
    saveCustom,
    renameUnsaved,
    renameSaved,
    deleteSaved,
    editSaved,
    setFocusedUnsavedBlocks,
    focusedUnsaved,
    focusedUnsavedBlocks,
    nameError,
    setNameError,
    visibleGroups,
    focusedDisplayDef,
    savedCustoms,
    unsavedCustoms,
  } = seg;
  const hasResults = visibleGroups.some((g) => g.items.length > 0);
  const mySegmentCount =
    Object.keys(savedCustoms).length + Object.keys(unsavedCustoms).length;

  // Local name while editing an unsaved custom (so typing doesn't fight the map key).
  const [editName, setEditName] = useState(focused);
  useEffect(() => {
    if (focusedUnsaved) setEditName(focused);
  }, [focused, focusedUnsaved]);

  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  // Search expands like MetricPicker: icon → full input (hides pills).
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        !search.trim()
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [searchOpen, search]);

  // Scroll-spy: highlight the pill for the section under the reading line.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const compute = () => {
      const line = el.getBoundingClientRect().top + 48;
      let next: CategoryId = "all";
      for (const g of visibleGroups) {
        const ref = sectionRefs.current[g.id];
        if (ref && ref.getBoundingClientRect().top <= line) next = g.id;
      }
      if (el.scrollTop < 4) next = "all";
      setCategory(next);
    };
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [visibleGroups, setCategory]);

  const scrollToSection = (id: CategoryId) => {
    setCategory(id);
    const el = listRef.current;
    if (!el) return;
    if (id === "all") {
      el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const ref = sectionRefs.current[id];
    if (ref) el.scrollTo({ top: ref.offsetTop - el.offsetTop, behavior: "smooth" });
  };

  const handleAddCustom = () => {
    addCustom();
    requestAnimationFrame(() => {
      const el = listRef.current;
      const ref = sectionRefs.current.mine;
      if (el && ref) {
        el.scrollTo({ top: ref.offsetTop - el.offsetTop, behavior: "smooth" });
      }
    });
  };

  const commitName = () => {
    if (!focusedUnsaved) return;
    if (editName.trim() === focused) {
      setNameError(null);
      return;
    }
    if (!renameUnsaved(focused, editName)) {
      setEditName(focused);
    }
  };

  const handleSaveRow = (name: string) => {
    // Apply the builder's edited name in the same save (no stale-state rename).
    if (name === focused && focusedUnsaved) {
      if (saveCustom(name, editName)) {
        setEditName(editName.trim() || name);
      }
      return;
    }
    saveCustom(name);
  };

  const openRename = (name: string) => {
    setRenameTarget(name);
    setRenameValue(name);
    setRenameError(null);
  };

  const confirmRename = () => {
    if (!renameTarget) return;
    if (!renameValue.trim()) {
      setRenameError("Enter a segment name.");
      return;
    }
    if (!renameSaved(renameTarget, renameValue)) {
      setRenameError("This name is already in use.");
      return;
    }
    setRenameTarget(null);
    setRenameValue("");
    setRenameError(null);
  };

  const Title =
    titleAs === "dialog" ? DialogPrimitive.Title : "h2";

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Title className="flex items-center gap-2.5 text-base font-semibold text-foreground">
          <Users className="h-5 w-5" aria-hidden />
          Segments
        </Title>
        <div className="flex items-center gap-1">{headerActions}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Search icon before All; expanded search hides all pills (MetricPicker). */}
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-3 py-3">
          {searchOpen ? (
            <div ref={searchRef} className="relative w-full">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all segments"
                className="h-9 pl-9 pr-9"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("");
                    setSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Search segments"
                className="h-9 w-9 shrink-0 rounded-full"
                onClick={() => setSearchOpen(true)}
              >
                <Search />
              </Button>
              <CategoryPill
                active={category === "all"}
                onClick={() => scrollToSection("all")}
              >
                All
              </CategoryPill>
              {SEGMENT_GROUPS.map((g) => (
                <CategoryPill
                  key={g.id}
                  active={category === g.id}
                  onClick={() => scrollToSection(g.id)}
                >
                  {g.pill} ({g.items.length})
                </CategoryPill>
              ))}
              <CategoryPill
                active={category === "mine"}
                onClick={() => scrollToSection("mine")}
              >
                My Segments
                {mySegmentCount > 0 ? ` (${mySegmentCount})` : ""}
              </CategoryPill>
            </>
          )}
        </div>

        {/* List + definition / custom builder */}
        <div className="flex min-h-0 flex-1">
          <div
            ref={listRef}
            className="min-h-0 w-[calc(18ch+7.25rem)] shrink-0 overflow-y-auto border-r border-border p-2"
          >
            {hasResults || visibleGroups.length > 0 ? (
              <div className="space-y-3">
                {visibleGroups.map((g) => (
                  <div
                    key={g.id}
                    ref={(node) => {
                      sectionRefs.current[g.id] = node;
                    }}
                    className="space-y-0.5"
                  >
                    <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {g.section}
                    </p>
                    {g.items.map((segment) => {
                      const unsaved = Boolean(segment.unsaved);
                      const isSavedMine = g.id === "mine" && !unsaved;
                      return (
                        <SegmentRow
                          key={segment.name}
                          segment={segment}
                          checked={draft.includes(segment.name)}
                          focused={focused === segment.name}
                          unsaved={unsaved}
                          onToggle={() => toggle(segment.name)}
                          onFocus={() => {
                            setFocused(segment.name);
                            setNameError(null);
                          }}
                          onSave={
                            unsaved ? () => handleSaveRow(segment.name) : undefined
                          }
                          onEdit={
                            isSavedMine
                              ? () => editSaved(segment.name)
                              : undefined
                          }
                          onRename={
                            isSavedMine
                              ? () => openRename(segment.name)
                              : undefined
                          }
                          onDelete={
                            isSavedMine
                              ? () => deleteSaved(segment.name)
                              : undefined
                          }
                        />
                      );
                    })}
                    {g.id === "mine" ? (
                      <button
                        type="button"
                        onClick={handleAddCustom}
                        className="mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
                      >
                        <Plus className="h-4 w-4 shrink-0" aria-hidden />
                        Add custom
                      </button>
                    ) : null}
                    {g.id !== "mine" && g.items.length === 0 ? (
                      <p className="px-2.5 py-2 text-sm text-muted-foreground">
                        No segments in this group.
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                No segments match your search.
              </div>
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {focusedUnsaved && focusedUnsavedBlocks ? (
              <CustomLogicBuilder
                blocks={focusedUnsavedBlocks}
                setBlocks={setFocusedUnsavedBlocks}
                name={editName}
                onNameChange={(next) => {
                  setEditName(next);
                  setNameError(null);
                }}
                onNameBlur={commitName}
                nameError={nameError}
              />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <SegmentDefinitionPanel
                  def={focusedDisplayDef}
                  emptyText="Hover a segment to see its definition."
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commit rename when leaving the builder name field via blur is handled
          on Save; also commit when Apply if needed — blur on name input: */}
      {/* Footer */}
      <div className="flex h-14 shrink-0 items-center justify-end gap-3 border-t border-border px-4">
        <Button
          variant="ghost"
          onClick={() => setDraft([])}
          className="text-foreground"
        >
          Clear
        </Button>
        <Button
          onClick={() => {
            commitName();
            onApply();
          }}
        >
          Apply filters ({draft.length})
        </Button>
      </div>

      <DialogPrimitive.Root
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRenameTarget(null);
            setRenameError(null);
          }
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-foreground/20" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[70] w-[min(400px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground shadow-xl">
            <DialogPrimitive.Title className="text-sm font-medium text-foreground">
              Rename segment
            </DialogPrimitive.Title>
            <div className="mt-4 space-y-2">
              <Label htmlFor="rename-segment">Segment name</Label>
              <Input
                id="rename-segment"
                autoFocus
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value);
                  setRenameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmRename();
                  }
                }}
              />
              {renameError ? (
                <p className="text-sm text-danger-fg">{renameError}</p>
              ) : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRenameTarget(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={confirmRename}>
                Rename
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

function SegmentsDrawer({
  open,
  seg,
  onApply,
  onClose,
  onCollapse,
}: {
  open: boolean;
  seg: SegmentsState;
  onApply: () => void;
  onClose: () => void;
  onCollapse: () => void;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[980px] flex-col overflow-hidden bg-background shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          <SegmentsPickerPanel
            seg={seg}
            onApply={onApply}
            titleAs="dialog"
            headerActions={
              <>
                <button
                  type="button"
                  onClick={onCollapse}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="Collapse to dropdown"
                >
                  <Minimize2 className="h-[18px] w-[18px]" aria-hidden />
                </button>
                <DialogPrimitive.Close
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" aria-hidden />
                </DialogPrimitive.Close>
              </>
            }
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Public entry point — the filter chip that opens either the mini dropdown or
// the full drawer, toggling between them via expand / collapse.

export function SegmentsSelector({
  value,
  onChange,
  plain,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  /** Text-only chip for the results filter bar. */
  plain?: boolean;
}) {
  const [mode, setMode] = useState<"closed" | "mini" | "drawer">("closed");
  const modeRef = useRef(mode);
  modeRef.current = mode;
  // Skip the dismiss that fires when Popover/Dialog close during a deliberate
  // expand (mini → drawer) or collapse (drawer → mini) transition.
  const skipCloseRef = useRef(false);
  const seg = useSegmentsState(value);

  const summary =
    value.length === 0
      ? "Segments"
      : value.length === 1
        ? value[0]
        : `Segments(${value.length})`;

  const apply = () => {
    onChange(seg.draft);
    setMode("closed");
  };

  const dismiss = () => {
    if (skipCloseRef.current) {
      skipCloseRef.current = false;
      return;
    }
    setMode("closed");
  };

  const openMini = () => {
    if (modeRef.current === "closed") {
      seg.resetFromValue(value);
    }
    setMode("mini");
  };

  const expand = () => {
    skipCloseRef.current = true;
    setMode("drawer");
  };

  const collapse = () => {
    skipCloseRef.current = true;
    setMode("mini");
  };

  return (
    <>
      <Popover
        open={mode === "mini"}
        onOpenChange={(next) => {
          if (next) openMini();
          else dismiss();
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center rounded-md border border-border bg-background text-sm transition-colors hover:bg-muted/60 data-[state=open]:bg-muted/60",
              plain
                ? "h-8 px-3 text-foreground/80"
                : "h-7 gap-1.5 px-2.5 text-foreground/80",
              value.length > 0 &&
                (plain
                  ? "text-foreground"
                  : "border-foreground/30 bg-accent/40 text-foreground")
            )}
          >
            {!plain && <Compass className="h-3.5 w-3.5" aria-hidden />}
            <span className={cn("truncate", plain ? "" : "max-w-[140px]")}>
              {summary}
            </span>
            {!plain && (
              <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="flex h-[min(520px,var(--radix-popover-content-available-height,70vh))] w-[min(860px,var(--radix-popover-content-available-width,calc(100vw-2rem)))] flex-col overflow-hidden p-0"
        >
          <SegmentsPickerPanel
            seg={seg}
            onApply={apply}
            titleAs="h2"
            headerActions={
              <button
                type="button"
                onClick={expand}
                aria-label="Expand to full view"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <Maximize2 className="h-[18px] w-[18px]" aria-hidden />
              </button>
            }
          />
        </PopoverContent>
      </Popover>

      <SegmentsDrawer
        open={mode === "drawer"}
        seg={seg}
        onApply={apply}
        onClose={dismiss}
        onCollapse={collapse}
      />
    </>
  );
}

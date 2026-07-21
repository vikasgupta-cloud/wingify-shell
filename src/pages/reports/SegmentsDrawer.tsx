import {
  Fragment,
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
  HelpCircle,
  Maximize2,
  Minimize2,
  MinusCircle,
  MousePointerClick,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

// ---------------------------------------------------------------------------
// Segment catalog — grouped the same way as the Segments drawer design.

type Segment = { name: string; description: string };
type SegmentGroup = { id: string; pill: string; section: string; items: Segment[] };

const SEGMENT_GROUPS: SegmentGroup[] = [
  {
    id: "traffic",
    pill: "Traffic",
    section: "Traffic source",
    items: [
      {
        name: "All visitors",
        description:
          "Every visitor included in the campaign, with no traffic-source filtering applied.",
      },
      {
        name: "Direct traffic",
        description:
          "Visitors who reached the site by typing the URL directly or via a saved bookmark.",
      },
      {
        name: "Referral traffic",
        description: "Visitors who arrived from a link on another website.",
      },
      {
        name: "Social traffic",
        description:
          "Visitors who arrived from a social network such as Facebook, X or LinkedIn.",
      },
      {
        name: "Non-paid search traffic",
        description:
          "Visitors who arrived through organic, unpaid search-engine results.",
      },
      {
        name: "Paid search traffic",
        description: "Visitors who arrived by clicking a paid search advertisement.",
      },
      {
        name: "Email traffic",
        description: "Visitors who arrived from a link inside an email campaign.",
      },
    ],
  },
  {
    id: "device",
    pill: "Device type",
    section: "Device type",
    items: [
      {
        name: "Mobile and tablet traffic",
        description: "Visitors browsing on either a mobile phone or a tablet device.",
      },
      { name: "Mobile traffic", description: "Visitors browsing on a mobile phone." },
      {
        name: "Desktop traffic",
        description: "Visitors browsing on a desktop or laptop computer.",
      },
      { name: "Tablet traffic", description: "Visitors browsing on a tablet device." },
      {
        name: "Desktop and Tablet traffic",
        description: "Visitors browsing on either a desktop or a tablet device.",
      },
    ],
  },
  {
    id: "visitor",
    pill: "Visitor Type",
    section: "Visitor type",
    items: [
      {
        name: "New visitors",
        description:
          "Visitors viewing the site for the first time within the campaign window.",
      },
      {
        name: "Returning visitors",
        description:
          "Visitors who have viewed the site before during the campaign window.",
      },
      {
        name: "Logged-in visitors",
        description: "Visitors who are authenticated with an account during their session.",
      },
      {
        name: "First-time buyers",
        description: "Visitors completing their first purchase during the campaign.",
      },
    ],
  },
  {
    id: "os",
    pill: "Operating System",
    section: "Operating system",
    items: [
      {
        name: "Windows",
        description: "Visitors browsing from a device running Microsoft Windows.",
      },
      { name: "macOS", description: "Visitors browsing from a device running Apple macOS." },
      {
        name: "iOS",
        description: "Visitors browsing from an iPhone or iPad running iOS.",
      },
      { name: "Android", description: "Visitors browsing from a device running Android." },
      {
        name: "Linux",
        description: "Visitors browsing from a device running a Linux distribution.",
      },
    ],
  },
];

const ALL_SEGMENTS = SEGMENT_GROUPS.flatMap((g) => g.items);

function findSegment(name: string): Segment | undefined {
  return ALL_SEGMENTS.find((s) => s.name === name);
}

// ---------------------------------------------------------------------------
// Custom Logic — query builder model

const ATTRIBUTE_OPTIONS = [
  "Landing page URL",
  "Query Parameter",
  "Operating system",
  "Browser",
  "Device type",
  "Country",
  "Traffic source",
  "Cookie",
] as const;

const OPERATOR_OPTIONS = [
  { value: "eq-ci", label: "= ci" },
  { value: "neq-ci", label: "≠ ci" },
  { value: "contains", label: "contains" },
  { value: "not-contains", label: "does not contain" },
  { value: "starts", label: "starts with" },
  { value: "ends", label: "ends with" },
] as const;

const CONNECTORS = ["And", "Or"] as const;
type Connector = (typeof CONNECTORS)[number];

type Condition = {
  id: string;
  connector: Connector; // connector to the previous condition (ignored on first)
  attribute: string;
  operator: string;
  value: string;
};
type FilterBlock = {
  id: string;
  connector: Connector; // connector to the previous block (ignored on first)
  conditions: Condition[];
};

let uidCounter = 0;
const uid = () => `q${++uidCounter}`;

function newCondition(): Condition {
  return {
    id: uid(),
    connector: "And",
    attribute: ATTRIBUTE_OPTIONS[0],
    operator: OPERATOR_OPTIONS[0].value,
    value: "",
  };
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-7 shrink-0 items-center rounded-full px-3 text-sm transition-colors",
        active
          ? "bg-foreground font-medium text-background"
          : "border border-border text-foreground/80 hover:bg-muted/60"
      )}
    >
      {children}
    </button>
  );
}

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

function SegmentRow({
  segment,
  checked,
  focused,
  onToggle,
  onFocus,
}: {
  segment: Segment;
  checked: boolean;
  focused: boolean;
  onToggle: () => void;
  onFocus: () => void;
}) {
  return (
    <label
      onMouseEnter={onFocus}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors",
        focused ? "bg-muted/70" : "hover:bg-muted/50"
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle()}
        onFocus={onFocus}
        className="h-4 w-4 rounded-[4px] border-muted-foreground data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-sm",
          checked ? "font-medium text-foreground" : "text-foreground"
        )}
      >
        {segment.name}
      </span>
    </label>
  );
}

function LeftTab({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
        active
          ? "bg-muted font-medium text-foreground"
          : "text-foreground/70 hover:bg-muted/60"
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            active ? "text-foreground/70" : "text-muted-foreground"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ConnectorSelect({
  value,
  onChange,
}: {
  value: Connector;
  onChange: (v: Connector) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Connector)}>
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
  condition: Condition;
  first: boolean;
  canRemove: boolean;
  onChange: (next: Condition) => void;
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
          <div className="flex items-center gap-2">
            <Select
              value={condition.attribute}
              onValueChange={(attribute) => onChange({ ...condition, attribute })}
            >
              <SelectTrigger className="h-9 w-[210px] shrink-0 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ATTRIBUTE_OPTIONS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={condition.operator}
              onValueChange={(operator) => onChange({ ...condition, operator })}
            >
              <SelectTrigger className="h-9 w-[84px] shrink-0 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATOR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={condition.value}
              onChange={(e) => onChange({ ...condition, value: e.target.value })}
              placeholder="Enter a value"
              className="h-9 min-w-0 flex-1"
            />
          </div>
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
  onChangeCondition: (id: string, next: Condition) => void;
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
  onSave,
}: {
  blocks: FilterBlock[];
  setBlocks: Dispatch<SetStateAction<FilterBlock[]>>;
  onSave: () => void;
}) {
  const totalConditions = blocks.reduce((n, b) => n + b.conditions.length, 0);

  const changeCondition = (blockId: string, condId: string, next: Condition) =>
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-6">
        <p className="text-sm font-medium text-foreground">All visitors…</p>

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

      <div className="flex items-center justify-between border-t border-border px-6 py-3">
        <button
          type="button"
          onClick={onSave}
          className="text-sm font-medium text-foreground transition-colors hover:text-foreground/70"
        >
          Save Segment
        </button>
        <Button
          variant="outline"
          onClick={() => setBlocks((prev) => [...prev, newBlock()])}
        >
          Add another filter
        </Button>
      </div>
    </div>
  );
}

// Shared picker state so the mini dropdown and full drawer stay in sync when
// expanding / collapsing without losing the in-progress draft.
function useSegmentsState(value: string[]) {
  const [draft, setDraft] = useState<string[]>(value);
  const [leftTab, setLeftTab] = useState<"all" | "custom">("all");
  const [category, setCategory] = useState<CategoryId>("all");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState<string>(
    value[0] ?? ALL_SEGMENTS[0]!.name
  );
  const [blocks, setBlocks] = useState<FilterBlock[]>([newBlock()]);
  const [savedCustoms, setSavedCustoms] = useState<
    Record<string, FilterBlock[]>
  >({});

  const resetFromValue = (next: string[]) => {
    setDraft(next);
    setLeftTab("all");
    setCategory("all");
    setSearch("");
    setFocused(next[0] ?? ALL_SEGMENTS[0]!.name);
    setBlocks([newBlock()]);
    setSavedCustoms({});
  };

  const toggle = (name: string) =>
    setDraft((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const isCustom = (name: string) =>
    name in savedCustoms || /^Custom \d+$/.test(name);

  const saveSegment = () => {
    const used = Object.keys(savedCustoms).length;
    const name = `Custom ${used + 1}`;
    setSavedCustoms((prev) => ({ ...prev, [name]: blocks }));
    setDraft((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setBlocks([newBlock()]);
  };

  const editSegment = (name: string) => {
    const saved = savedCustoms[name];
    if (saved) setBlocks(saved.map((b) => cloneBlock(b)));
    setLeftTab("custom");
  };

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (leftTab === "custom" || category === "mine") return [];
    return SEGMENT_GROUPS.filter((g) => category === "all" || g.id === category)
      .map((g) => ({
        ...g,
        items: g.items.filter((s) => s.name.toLowerCase().includes(q)),
      }))
      .filter((g) => g.items.length > 0);
  }, [category, search, leftTab]);

  const focusedSegment = findSegment(focused);

  return {
    draft,
    setDraft,
    leftTab,
    setLeftTab,
    category,
    setCategory,
    search,
    setSearch,
    focused,
    setFocused,
    blocks,
    setBlocks,
    toggle,
    isCustom,
    saveSegment,
    editSegment,
    visibleGroups,
    focusedSegment,
    resetFromValue,
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
    leftTab,
    setLeftTab,
    category,
    setCategory,
    search,
    setSearch,
    focused,
    setFocused,
    blocks,
    setBlocks,
    toggle,
    isCustom,
    saveSegment,
    editSegment,
    visibleGroups,
    focusedSegment,
  } = seg;
  const hasResults = visibleGroups.length > 0;

  const Title =
    titleAs === "dialog" ? DialogPrimitive.Title : "h2";

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <Title className="flex items-center gap-2.5 text-base font-semibold text-foreground">
          <Users className="h-5 w-5" aria-hidden />
          Segments
        </Title>
        <div className="flex items-center gap-1">{headerActions}</div>
      </div>

      {/* Selected chips */}
      <div className="flex min-h-[48px] shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <span className="mr-1 text-sm text-muted-foreground">Selected :</span>
        {draft.length === 0 ? (
          <span className="text-sm text-muted-foreground/70">None</span>
        ) : (
          draft.map((name) => (
            <SelectedTag
              key={name}
              name={name}
              onRemove={() => toggle(name)}
              onEdit={isCustom(name) ? () => editSegment(name) : undefined}
            />
          ))
        )}
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left rail */}
        <div className="flex w-[180px] shrink-0 flex-col gap-1 border-r border-border p-2">
          <div className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-foreground">
            <Sparkles className="h-4 w-4 text-muted-foreground" aria-hidden />
            VWO AI
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          </div>
          <LeftTab
            active={leftTab === "all"}
            onClick={() => setLeftTab("all")}
            label="All Segments"
            count={ALL_SEGMENTS.length}
          />
          <LeftTab
            active={leftTab === "custom"}
            onClick={() => setLeftTab("custom")}
            label="Custom Logic"
          />
        </div>

        {/* Right pane */}
        <div className="flex min-w-0 flex-1 flex-col">
          {leftTab === "custom" ? (
            <CustomLogicBuilder
              blocks={blocks}
              setBlocks={setBlocks}
              onSave={saveSegment}
            />
          ) : (
            <>
              {/* Search + category pills */}
              <div className="shrink-0 space-y-2.5 border-b border-border p-3">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search all segments"
                    className="h-9 pl-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <CategoryPill
                    active={category === "all"}
                    onClick={() => setCategory("all")}
                  >
                    All
                  </CategoryPill>
                  <CategoryPill
                    active={category === "mine"}
                    onClick={() => setCategory("mine")}
                  >
                    My Segments
                  </CategoryPill>
                  {SEGMENT_GROUPS.map((g) => (
                    <CategoryPill
                      key={g.id}
                      active={category === g.id}
                      onClick={() => setCategory(g.id)}
                    >
                      {g.pill} ({g.items.length})
                    </CategoryPill>
                  ))}
                </div>
              </div>

              {/* List + detail */}
              <div className="flex min-h-0 flex-1">
                <div className="w-[260px] shrink-0 overflow-y-auto border-r border-border p-2">
                  {hasResults ? (
                    <div className="space-y-3">
                      {visibleGroups.map((g) => (
                        <div key={g.id} className="space-y-0.5">
                          <p className="px-2.5 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {g.section}
                          </p>
                          {g.items.map((segment) => (
                            <SegmentRow
                              key={segment.name}
                              segment={segment}
                              checked={draft.includes(segment.name)}
                              focused={focused === segment.name}
                              onToggle={() => toggle(segment.name)}
                              onFocus={() => setFocused(segment.name)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                      {category === "mine"
                        ? "You haven't saved any segments yet."
                        : "No segments match your search."}
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-4">
                  {focusedSegment ? (
                    <>
                      <h3 className="text-base font-semibold text-foreground">
                        {focusedSegment.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {focusedSegment.description}
                      </p>
                      <div className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-muted-foreground">
                        <MousePointerClick className="h-4 w-4" aria-hidden />
                        Created by
                        <span className="font-medium text-foreground">VWO</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                      Hover a segment to see its details.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-14 shrink-0 items-center justify-end gap-3 border-t border-border px-4">
        <Button
          variant="ghost"
          onClick={() => setDraft([])}
          className="text-foreground"
        >
          Clear
        </Button>
        <Button onClick={onApply}>Apply filters ({draft.length})</Button>
      </div>
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
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[940px] flex-col overflow-hidden bg-background shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
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
}: {
  value: string[];
  onChange: (next: string[]) => void;
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
              "inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm transition-colors hover:bg-muted/60 data-[state=open]:bg-muted/60",
              value.length > 0
                ? "border-foreground/30 bg-accent/40 text-foreground"
                : "text-foreground/80"
            )}
          >
            <Compass className="h-3.5 w-3.5" aria-hidden />
            <span className="max-w-[140px] truncate">{summary}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-50" aria-hidden />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="h-[min(520px,70vh)] w-[min(780px,calc(100vw-2rem))] overflow-hidden p-0"
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

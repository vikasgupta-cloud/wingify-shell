import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  PlusCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConfigStore } from "../../store/config";
import { useCustomSegmentsStore } from "../../store/customSegments";
import {
  describeCustomSegment,
  MY_SEGMENTS,
  STANDARD_COUNT,
  STANDARD_SEGMENTS,
  type CustomSegmentDef,
  type SegmentAttribute,
  type SegmentCategory,
} from "../../config/segments";
import CustomSegmentDrawer from "./CustomSegmentDrawer";

// Shape shown in the picker's right-hand definition panel.
type SegmentDef = { label: string; description?: string; example?: string };

// Look up a standard / my-segment definition by its display label.
function findDefByLabel(label: string): SegmentDef | null {
  for (const c of STANDARD_SEGMENTS) {
    const a = c.attributes.find((x) => x.label === label);
    if (a) return a;
  }
  const m = MY_SEGMENTS.find((x) => x.label === label);
  return m ?? null;
}

// One selectable attribute row (used inside categories and for My Segments).
function AttributeRow({
  attribute,
  selected,
  onSelect,
  onHover,
}: {
  attribute: SegmentAttribute;
  selected: boolean;
  onSelect: () => void;
  onHover?: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onMouseEnter={onHover}
      onFocus={onHover}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent",
        selected && "bg-accent"
      )}
    >
      <span className="flex items-center gap-1.5 text-foreground">
        {attribute.label}
        {attribute.label === "All Traffic" && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex text-muted-foreground"
                >
                  <Info className="h-3.5 w-3.5" />
                </span>
              </TooltipTrigger>
              {/* TODO: real copy for the default segment. */}
              <TooltipContent>Everyone who visits.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      {selected && <Check className="h-4 w-4 text-foreground" />}
    </div>
  );
}

// A collapsible standard category with its attributes.
function CategoryRow({
  category,
  selectedLabel,
  forceOpen,
  onSelect,
  onHover,
}: {
  category: SegmentCategory;
  selectedLabel: string;
  forceOpen: boolean;
  onSelect: (label: string) => void;
  onHover: (attribute: SegmentAttribute) => void;
}) {
  const hasSelection = category.attributes.some((a) => a.label === selectedLabel);
  const [open, setOpen] = useState(hasSelection);
  const expanded = forceOpen || open;

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((o) => !o);
          }
        }}
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent"
      >
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <span className="text-foreground">
          {category.label} ({category.attributes.length})
        </span>
      </div>
      {expanded && (
        <div className="pl-8">
          {category.attributes.map((a) => (
            <AttributeRow
              key={a.id}
              attribute={a}
              selected={a.label === selectedLabel}
              onSelect={() => onSelect(a.label)}
              onHover={() => onHover(a)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Small section heading shared by STANDARD / MY SEGMENTS / CUSTOM.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

type TabValue = "all" | "standard" | "my";

export default function SegmentPicker({ campaignId }: { campaignId: string }) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const selectSegment = useConfigStore((s) => s.selectSegment);
  const applyCustomSegment = useConfigStore((s) => s.applyCustomSegment);
  const savedCustom = useCustomSegmentsStore((s) => s.saved);
  const saveSegment = useCustomSegmentsStore((s) => s.saveSegment);

  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<TabValue>("all");
  // The segment whose definition shows on the right — driven by hover/focus,
  // falling back to the currently selected segment.
  const [hoverDef, setHoverDef] = useState<SegmentDef | null>(null);

  const value = config?.segment ?? "";
  const applied = config?.customSegment ?? null;
  // The applied custom segment only lives in the CUSTOM section until it is
  // saved to the library — once saved it moves down into "My Segments".
  const appliedUnsaved =
    applied && !savedCustom.some((s) => s.id === applied.id) ? applied : null;

  // Right-panel definition: hovered segment, else the selected one.
  const selectedDef: SegmentDef | null =
    applied && value === applied.label
      ? { label: applied.label, description: describeCustomSegment(applied.conditions) }
      : findDefByLabel(value);
  const displayDef = hoverDef ?? selectedDef;

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const matches = (label: string) => label.toLowerCase().includes(q);

  // Filter standard categories by query; drop empty ones while searching.
  const standardCategories = useMemo<SegmentCategory[]>(() => {
    if (!searching) return STANDARD_SEGMENTS;
    return STANDARD_SEGMENTS.map((c) => ({
      ...c,
      attributes: c.attributes.filter((a) => matches(a.label)),
    })).filter((c) => c.attributes.length > 0);
  }, [q, searching]);

  // My Segments = the static built-ins plus any saved custom segments.
  const myItems = useMemo<Array<SegmentAttribute & { def?: CustomSegmentDef }>>(
    () => [
      ...MY_SEGMENTS,
      ...savedCustom.map((d) => ({ id: d.id, label: d.label, def: d })),
    ],
    [savedCustom]
  );
  const myFiltered = searching
    ? myItems.filter((a) => matches(a.label))
    : myItems;

  const customVisible =
    tab === "all" && !!appliedUnsaved && (!searching || matches(appliedUnsaved.label));
  const showStandard = tab === "all" || tab === "standard";
  const showMy = tab === "all" || tab === "my";

  const standardVisible = showStandard && standardCategories.length > 0;
  const myVisible = showMy && myFiltered.length > 0;
  const empty = !customVisible && !standardVisible && !myVisible;

  const pickLabel = (label: string) => {
    selectSegment(campaignId, label);
    setOpen(false);
  };
  const pickCustom = (def: CustomSegmentDef) => {
    applyCustomSegment(campaignId, def);
    setOpen(false);
  };

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setHoverDef(null);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-[240px] justify-between font-normal"
          >
            <span className="truncate">{value}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 opacity-50 transition-transform duration-150",
                open && "rotate-180"
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex max-h-[440px] w-[700px] flex-col p-0"
        >
          {/* Search. */}
          <div className="shrink-0 border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search segments"
                className="pl-9"
              />
            </div>
          </div>

          {/* Tabs. */}
          <div className="shrink-0 border-b border-border px-4 pt-2">
            <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
              <TabsList className="h-auto justify-start gap-4 rounded-none bg-transparent p-0">
                {(
                  [
                    { value: "all", label: "All" },
                    { value: "standard", label: `Standard (${STANDARD_COUNT})` },
                    { value: "my", label: `My Segments (${myItems.length})` },
                  ] as { value: TabValue; label: string }[]
                ).map((t) => (
                  <TabsTrigger
                    key={t.value}
                    value={t.value}
                    className="rounded-none border-b-2 border-transparent px-0 pb-2 font-normal text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Body + definition panel. */}
          <div className="flex min-h-0 flex-1">
          <div className="min-h-0 flex-1 overflow-y-auto border-r border-border p-1.5">
            {empty ? (
              <div className="px-2 py-8 text-center text-sm text-muted-foreground">
                No segments found.
              </div>
            ) : (
              <>
                {customVisible && appliedUnsaved && (
                  <div>
                    <SectionHeading>Custom</SectionHeading>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() =>
                        setHoverDef({
                          label: appliedUnsaved.label,
                          description: describeCustomSegment(appliedUnsaved.conditions),
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setOpen(false);
                        }
                      }}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent",
                        value === appliedUnsaved.label && "bg-accent"
                      )}
                    >
                      {value === appliedUnsaved.label && (
                        <Check className="h-4 w-4 shrink-0 text-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        {appliedUnsaved.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          saveSegment(appliedUnsaved);
                        }}
                        className="shrink-0 text-sm font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {standardVisible && (
                  <div>
                    {tab === "all" && <SectionHeading>Standard</SectionHeading>}
                    {standardCategories.map((c) => (
                      <CategoryRow
                        key={c.id}
                        category={c}
                        selectedLabel={value}
                        forceOpen={searching}
                        onSelect={pickLabel}
                        onHover={setHoverDef}
                      />
                    ))}
                  </div>
                )}

                {standardVisible && myVisible && (
                  <div className="my-1.5 h-px bg-border" />
                )}

                {myVisible && (
                  <div>
                    {tab === "all" && <SectionHeading>My Segments</SectionHeading>}
                    {myFiltered.map((a) => (
                      <AttributeRow
                        key={a.id}
                        attribute={a}
                        selected={a.label === value}
                        onSelect={() =>
                          a.def ? pickCustom(a.def) : pickLabel(a.label)
                        }
                        onHover={() =>
                          setHoverDef(
                            a.def
                              ? {
                                  label: a.def.label,
                                  description: describeCustomSegment(a.def.conditions),
                                }
                              : a
                          )
                        }
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

            {/* Definition panel — mirrors the URL-condition picker. */}
            <div className="w-[240px] shrink-0 overflow-y-auto p-4">
              {displayDef ? (
                <>
                  <div className="text-sm font-medium text-foreground">
                    {displayDef.label}
                  </div>
                  {displayDef.description && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {displayDef.description}
                    </div>
                  )}
                  {displayDef.example && (
                    <div className="mt-4 rounded-md bg-muted p-3">
                      <div className="text-xs font-medium text-foreground">
                        For example
                      </div>
                      <div className="mt-1 break-words text-xs text-muted-foreground">
                        {displayDef.example}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Hover over a segment to see its definition.
                </div>
              )}
            </div>
          </div>

          {/* Footer. */}
          <div className="shrink-0 border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setOpen(false);
                setDrawerOpen(true);
              }}
            >
              <PlusCircle />
              Create custom segment
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CustomSegmentDrawer
        campaignId={campaignId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </>
  );
}

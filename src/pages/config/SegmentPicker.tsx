import { useEffect, useMemo, useRef, useState } from "react";
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
  type SegmentDefCondition,
} from "../../config/segments";
import CustomSegmentDrawer from "./CustomSegmentDrawer";

// Shape shown in the picker's right-hand definition panel.
type DisplayDef = {
  label: string;
  kind: "Standard" | "Custom";
  description?: string;
  condition?: SegmentDefCondition;
};

function findAttrByLabel(label: string): SegmentAttribute | null {
  for (const c of STANDARD_SEGMENTS) {
    const a = c.attributes.find((x) => x.label === label);
    if (a) return a;
  }
  return MY_SEGMENTS.find((x) => x.label === label) ?? null;
}

function stdDef(a: SegmentAttribute): DisplayDef {
  return { label: a.label, kind: "Standard", description: a.description, condition: a.condition };
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
              <TooltipContent>Everyone who visits.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </span>
      {selected && <Check className="h-4 w-4 shrink-0 text-foreground" />}
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
  onHover: (a: SegmentAttribute) => void;
}) {
  // Standard categories start expanded so all attributes are visible by default.
  const [open, setOpen] = useState(true);
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
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <span className="text-foreground">
          {category.label} ({category.attributes.length})
        </span>
      </div>
      {expanded && (
        <div className="pl-6">
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

type PillId = "all" | "standard" | "my";

export default function SegmentPicker({
  campaignId,
  triggerClassName = "w-[240px]",
}: {
  campaignId: string;
  triggerClassName?: string;
}) {
  const config = useConfigStore((s) => s.configs[campaignId]);
  const selectSegment = useConfigStore((s) => s.selectSegment);
  const applyCustomSegment = useConfigStore((s) => s.applyCustomSegment);
  const savedCustom = useCustomSegmentsStore((s) => s.saved);
  const saveSegment = useCustomSegmentsStore((s) => s.saveSegment);

  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activePill, setActivePill] = useState<PillId>("all");
  const [hoverDef, setHoverDef] = useState<DisplayDef | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const standardRef = useRef<HTMLDivElement>(null);
  const myRef = useRef<HTMLDivElement>(null);

  const value = config?.segment ?? "";
  const applied = config?.customSegment ?? null;
  const appliedUnsaved =
    applied && !savedCustom.some((s) => s.id === applied.id) ? applied : null;

  // Right-panel definition: hovered segment, else the selected one.
  const selectedDef: DisplayDef | null = (() => {
    if (applied && value === applied.label) {
      return {
        label: applied.label,
        kind: "Custom",
        description: describeCustomSegment(applied.conditions),
      };
    }
    const a = findAttrByLabel(value);
    return a ? stdDef(a) : null;
  })();
  const displayDef = hoverDef ?? selectedDef;

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const matches = (label: string) => label.toLowerCase().includes(q);

  const standardCategories = useMemo<SegmentCategory[]>(() => {
    if (!searching) return STANDARD_SEGMENTS;
    return STANDARD_SEGMENTS.map((c) => ({
      ...c,
      attributes: c.attributes.filter((a) => matches(a.label)),
    })).filter((c) => c.attributes.length > 0);
  }, [q, searching]);

  const myItems = useMemo<Array<SegmentAttribute & { def?: CustomSegmentDef }>>(
    () => [
      ...MY_SEGMENTS,
      ...savedCustom.map((d) => ({ id: d.id, label: d.label, def: d })),
    ],
    [savedCustom]
  );
  const myFiltered = searching ? myItems.filter((a) => matches(a.label)) : myItems;

  const customVisible =
    !!appliedUnsaved && (!searching || matches(appliedUnsaved.label));
  const standardVisible = standardCategories.length > 0;
  const myVisible = myFiltered.length > 0;
  const empty = !customVisible && !standardVisible && !myVisible;

  // Scroll-spy: highlight the pill for the section under a reading line.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const compute = () => {
      const line = el.getBoundingClientRect().top + 48;
      let next: PillId = "all";
      if (standardRef.current && standardRef.current.getBoundingClientRect().top <= line)
        next = "standard";
      if (myRef.current && myRef.current.getBoundingClientRect().top <= line) next = "my";
      if (el.scrollTop < 4) next = "all";
      setActivePill(next);
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
  }, [open, searching, standardVisible, myVisible]);

  const scrollToPill = (id: PillId) => {
    setActivePill(id);
    const el = listRef.current;
    if (!el) return;
    if (id === "all") {
      el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = id === "standard" ? standardRef.current : myRef.current;
    if (target) {
      el.scrollTo({
        top: target.offsetTop - el.offsetTop,
        behavior: "smooth",
      });
    }
  };

  const pickLabel = (label: string) => {
    selectSegment(campaignId, label);
    setOpen(false);
  };
  const pickCustom = (def: CustomSegmentDef) => {
    applyCustomSegment(campaignId, def);
    setOpen(false);
  };

  const pills: { id: PillId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "standard", label: `Standard (${STANDARD_COUNT})` },
    { id: "my", label: `My Segments (${myItems.length})` },
  ];

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setHoverDef(null);
          if (o) {
            setQuery("");
            setActivePill("all");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn("nodrag justify-between font-normal", triggerClassName)}
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
        <PopoverContent align="start" className="flex max-h-[460px] w-[680px] flex-col p-0">
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

          {/* Anchor pills. */}
          <div className="flex shrink-0 flex-wrap gap-2 border-b border-border px-4 py-3">
            {pills.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "rounded-full",
                  activePill === p.id && "border-accent bg-accent text-foreground"
                )}
                onClick={() => scrollToPill(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>

          {/* Body + definition panel. */}
          <div className="flex min-h-0 flex-1">
            <div
              ref={listRef}
              className="min-h-0 w-[320px] shrink-0 overflow-y-auto border-r border-border p-1.5"
            >
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
                            kind: "Custom",
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
                      <div ref={standardRef}>
                        <SectionHeading>Standard</SectionHeading>
                      </div>
                      {standardCategories.map((c) => (
                        <CategoryRow
                          key={c.id}
                          category={c}
                          selectedLabel={value}
                          forceOpen={searching}
                          onSelect={pickLabel}
                          onHover={(a) => setHoverDef(stdDef(a))}
                        />
                      ))}
                    </div>
                  )}

                  {standardVisible && myVisible && <div className="my-1.5 h-px bg-border" />}

                  {myVisible && (
                    <div>
                      <div ref={myRef}>
                        <SectionHeading>My Segments</SectionHeading>
                      </div>
                      {myFiltered.map((a) => (
                        <AttributeRow
                          key={a.id}
                          attribute={a}
                          selected={a.label === value}
                          onSelect={() => (a.def ? pickCustom(a.def) : pickLabel(a.label))}
                          onHover={() =>
                            setHoverDef(
                              a.def
                                ? {
                                    label: a.def.label,
                                    kind: "Custom",
                                    description: describeCustomSegment(a.def.conditions),
                                  }
                                : stdDef(a)
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Definition panel — "All Visitors" + optional where clause. */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {displayDef ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-foreground">
                      {displayDef.label}
                    </span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {displayDef.kind}
                    </span>
                  </div>
                  {displayDef.description && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {displayDef.description}
                    </p>
                  )}
                  <div className="mt-5">
                    <div className="text-sm font-semibold text-foreground">All Visitors</div>
                    {displayDef.condition && (
                      <div className="mt-2">
                        <div className="text-sm text-muted-foreground">where</div>
                        <div className="mt-1 text-sm">
                          <span className="font-semibold text-foreground">
                            {displayDef.condition.subject}
                          </span>{" "}
                          <span className="text-foreground">
                            {displayDef.condition.operator} {displayDef.condition.value}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
              className="w-full justify-center"
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

// Config segment picker — shared catalog + metric-style search/pills.
// Single-select; closes on pick; Create custom segment footer.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Info,
  PlusCircle,
  Search,
  X,
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
import {
  SegmentDefinitionPanel,
  type SegmentDisplayDef,
} from "@/components/segments/SegmentDefinitionPanel";
import { useConfigStore } from "../../store/config";
import { useCustomSegmentsStore } from "../../store/customSegments";
import {
  describeCustomSegment,
  findSegmentByLabel,
  MY_SEGMENTS,
  STANDARD_SEGMENTS,
  type CustomSegmentDef,
  type SegmentAttribute,
  type SegmentCategory,
} from "../../config/segments";
import CustomSegmentDrawer from "./CustomSegmentDrawer";

function stdDef(a: SegmentAttribute): SegmentDisplayDef {
  return {
    label: a.label,
    kind: "Standard",
    description: a.description,
    condition: a.condition,
  };
}

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
        {attribute.label === "All visitors" && (
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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {children}
    </div>
  );
}

type PillId = "all" | "my" | (string & {});

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [activePill, setActivePill] = useState<PillId>("all");
  const [hoverDef, setHoverDef] = useState<SegmentDisplayDef | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const value = config?.segment ?? "";
  const applied = config?.customSegment ?? null;
  const appliedUnsaved =
    applied && !savedCustom.some((s) => s.id === applied.id) ? applied : null;

  const selectedDef: SegmentDisplayDef | null = (() => {
    if (applied && value === applied.label) {
      return {
        label: applied.label,
        kind: "Custom",
        description: describeCustomSegment(applied.conditions),
      };
    }
    const a = findSegmentByLabel(value);
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

  useEffect(() => {
    if (!searchOpen) return;
    const onDown = (e: PointerEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node) &&
        !query.trim()
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [searchOpen, query]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const compute = () => {
      const line = el.getBoundingClientRect().top + 48;
      let next: PillId = "all";
      for (const c of standardCategories) {
        const ref = sectionRefs.current[c.id];
        if (ref && ref.getBoundingClientRect().top <= line) next = c.id;
      }
      if (
        myVisible &&
        sectionRefs.current.my &&
        sectionRefs.current.my.getBoundingClientRect().top <= line
      ) {
        next = "my";
      }
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
  }, [open, searching, standardCategories, myVisible]);

  const scrollToPill = (id: PillId) => {
    setActivePill(id);
    const el = listRef.current;
    if (!el) return;
    if (id === "all") {
      el.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = sectionRefs.current[id];
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

  return (
    <>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setHoverDef(null);
          if (o) {
            setQuery("");
            setSearchOpen(false);
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
        <PopoverContent
          align="start"
          sideOffset={6}
          collisionPadding={16}
          className="flex max-h-[min(460px,var(--radix-popover-content-available-height,100vh))] w-[min(680px,var(--radix-popover-content-available-width,calc(100vw-2rem)))] flex-col overflow-hidden p-0"
        >
          {/* Metric-style search: icon before All; expanded hides pills. */}
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-3">
            {searchOpen ? (
              <div ref={searchRef} className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search segments"
                  className="pl-9 pr-9"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => {
                      setQuery("");
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full",
                    activePill === "all" && "border-accent bg-accent text-foreground"
                  )}
                  onClick={() => scrollToPill("all")}
                >
                  All
                </Button>
                {STANDARD_SEGMENTS.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-full",
                      activePill === c.id && "border-accent bg-accent text-foreground"
                    )}
                    onClick={() => scrollToPill(c.id)}
                  >
                    {c.label} ({c.attributes.length})
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={cn(
                    "rounded-full",
                    activePill === "my" && "border-accent bg-accent text-foreground"
                  )}
                  onClick={() => scrollToPill("my")}
                >
                  My Segments ({myItems.length})
                </Button>
              </>
            )}
          </div>

          <div className="flex min-h-0 flex-1">
            <div
              ref={listRef}
              className="min-h-0 w-[min(320px,45%)] shrink-0 overflow-y-auto border-r border-border p-1.5"
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

                  {standardCategories.map((c) => (
                    <div
                      key={c.id}
                      ref={(node) => {
                        sectionRefs.current[c.id] = node;
                      }}
                    >
                      <SectionHeading>{c.section}</SectionHeading>
                      {c.attributes.map((a) => (
                        <AttributeRow
                          key={a.id}
                          attribute={a}
                          selected={a.label === value}
                          onSelect={() => pickLabel(a.label)}
                          onHover={() => setHoverDef(stdDef(a))}
                        />
                      ))}
                    </div>
                  ))}

                  {myVisible && (
                    <div
                      ref={(node) => {
                        sectionRefs.current.my = node;
                      }}
                    >
                      <SectionHeading>My Segments</SectionHeading>
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

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <SegmentDefinitionPanel def={displayDef} />
            </div>
          </div>

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

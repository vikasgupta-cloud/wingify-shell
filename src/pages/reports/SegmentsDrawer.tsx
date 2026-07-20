import { useEffect, useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  HelpCircle,
  MousePointerClick,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
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

function SelectedTag({ name, onRemove }: { name: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border bg-background pl-2.5 pr-1.5 text-sm text-foreground">
      <span className="max-w-[160px] truncate">{name}</span>
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

export default function SegmentsDrawer({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(value);
  const [leftTab, setLeftTab] = useState<"all" | "custom">("all");
  const [category, setCategory] = useState<CategoryId>("all");
  const [search, setSearch] = useState("");
  const [focused, setFocused] = useState<string>(
    value[0] ?? ALL_SEGMENTS[0]!.name
  );

  // Re-seed the local draft whenever the drawer is (re)opened so an
  // unconfirmed edit never leaks across sessions.
  useEffect(() => {
    if (open) {
      setDraft(value);
      setLeftTab("all");
      setCategory("all");
      setSearch("");
      setFocused(value[0] ?? ALL_SEGMENTS[0]!.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggle = (name: string) =>
    setDraft((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

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
  const hasResults = visibleGroups.length > 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[940px] flex-col bg-background shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-border px-4">
            <DialogPrimitive.Title className="flex items-center gap-2.5 text-lg font-semibold text-foreground">
              <Users className="h-5 w-5" aria-hidden />
              Segments
            </DialogPrimitive.Title>
            <DialogPrimitive.Close
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>

          {/* Selected chips */}
          <div className="flex min-h-[52px] shrink-0 flex-wrap items-center gap-2 border-b border-border px-4 py-2">
            <span className="mr-1 text-sm text-muted-foreground">Selected :</span>
            {draft.length === 0 ? (
              <span className="text-sm text-muted-foreground/70">None</span>
            ) : (
              draft.map((name) => (
                <SelectedTag key={name} name={name} onRemove={() => toggle(name)} />
              ))
            )}
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1">
            {/* Left rail */}
            <div className="flex w-[200px] shrink-0 flex-col gap-1 border-r border-border p-2">
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
              {/* Search + category pills */}
              <div className="shrink-0 space-y-3 border-b border-border p-4">
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search all segments"
                    className="h-10 pl-9"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                {/* Segment list */}
                <div className="w-[320px] shrink-0 overflow-y-auto border-r border-border p-3">
                  {hasResults ? (
                    <div className="space-y-4">
                      {visibleGroups.map((g) => (
                        <div key={g.id} className="space-y-1">
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
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                      {leftTab === "custom"
                        ? "Build a segment with custom logic."
                        : category === "mine"
                          ? "You haven't saved any segments yet."
                          : "No segments match your search."}
                    </div>
                  )}
                </div>

                {/* Detail pane */}
                <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
                  {focusedSegment ? (
                    <>
                      <h3 className="text-lg font-semibold text-foreground">
                        {focusedSegment.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {focusedSegment.description}
                      </p>
                      <div className="mt-auto flex items-center gap-1.5 pt-6 text-sm text-muted-foreground">
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
            </div>
          </div>

          {/* Footer */}
          <div className="flex h-[68px] shrink-0 items-center justify-end gap-3 border-t border-border px-5">
            <Button
              variant="ghost"
              onClick={() => setDraft([])}
              className="text-foreground"
            >
              Clear
            </Button>
            <Button
              onClick={() => {
                onChange(draft);
                onOpenChange(false);
              }}
            >
              Apply filters ({draft.length})
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

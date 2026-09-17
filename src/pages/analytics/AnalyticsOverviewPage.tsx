// @summary Journey Analytics → Overview. Collecting Data + Create live in TopBar.
// Recently viewed is a horizontal snap carousel; library rows link to detail.
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  LineChart,
  MoreHorizontal,
  SendHorizontal,
  Sparkles,
  Star,
  UserRound,
} from "@/components/icons/protoLucide";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ANALYTICS_LIBRARY,
  ANALYTICS_RECENT,
  analyticsItemPath,
  type AnalyticsItemKind,
  type AnalyticsOverviewItem,
} from "@/data/analyticsOverview";
import { cn } from "@/lib/utils";

type ScopeTab = "starred" | "mine";
type KindFilter = "all" | AnalyticsItemKind;

function KindIcon({
  kind,
  className,
}: {
  kind: AnalyticsItemKind;
  className?: string;
}) {
  const Icon = kind === "board" ? LayoutGrid : LineChart;
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground",
        className
      )}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

function RecentCard({ item }: { item: AnalyticsOverviewItem }) {
  return (
    <Link
      to={analyticsItemPath(item.id)}
      className="flex h-full min-w-0 flex-col gap-6 rounded-xl border border-border bg-background p-4 text-left shadow-sm transition-colors hover:bg-muted/40"
    >
      <KindIcon kind={item.kind} />
      <div className="flex min-w-0 items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {item.name}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {item.editedLabel}
          </p>
        </div>
        <Avatar className="size-7">
          <AvatarFallback className="bg-muted text-[10px] font-medium text-foreground">
            {item.creatorInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </Link>
  );
}

function RecentCarousel({ items }: { items: AnalyticsOverviewItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const syncEdges = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanPrev(el.scrollLeft > 4);
    setCanNext(max > 4 && el.scrollLeft < max - 4);
  };

  const scrollByCards = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const step = (card?.offsetWidth ?? 240) + 12;
    el.scrollBy({ left: dir * step * 2, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={(node) => {
          scrollerRef.current = node;
          if (node) {
            requestAnimationFrame(syncEdges);
          }
        }}
        onScroll={syncEdges}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
        aria-label="Recently viewed"
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-carousel-card
            className="w-[min(240px,70vw)] shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <RecentCard item={item} />
          </div>
        ))}
      </div>

      {canPrev ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous"
          onClick={() => scrollByCards(-1)}
          className="absolute -left-3 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full bg-background shadow-sm"
        >
          <ChevronLeft className="size-4" strokeWidth={1.75} />
        </Button>
      ) : null}
      {canNext ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next"
          onClick={() => scrollByCards(1)}
          className="absolute -right-3 top-1/2 z-10 size-8 -translate-y-1/2 rounded-full bg-background shadow-sm"
        >
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </Button>
      ) : null}
    </div>
  );
}

function LibraryRow({ item }: { item: AnalyticsOverviewItem }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_9rem_5rem_4.5rem] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <Link
        to={analyticsItemPath(item.id)}
        className="flex min-w-0 items-center gap-3 hover:underline"
      >
        <KindIcon kind={item.kind} className="size-7" />
        <span className="truncate text-sm font-medium text-foreground">
          {item.name}
        </span>
      </Link>
      <span className="text-sm text-muted-foreground">{item.editedLabel}</span>
      <span className="text-sm text-muted-foreground">{item.creatorInitials}</span>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={item.starred ? "Unstar" : "Star"}
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <Star
            className={cn("size-4", item.starred && "fill-foreground text-foreground")}
            strokeWidth={1.75}
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="More actions"
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="size-4" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  );
}

export default function AnalyticsOverviewPage() {
  const [prompt, setPrompt] = useState("");
  const [scope, setScope] = useState<ScopeTab>("starred");
  const [kind, setKind] = useState<KindFilter>("all");

  const rows = useMemo(() => {
    return ANALYTICS_LIBRARY.filter((item) => {
      if (scope === "starred" && !item.starred) return false;
      if (scope === "mine" && !item.createdByMe) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      return true;
    });
  }, [scope, kind]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-8 pb-16 pt-10">
      {/* Ask bar */}
      <div className="relative">
        <Sparkles
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me to analyze any board or report..."
          className="h-12 rounded-xl border-border bg-background pl-11 pr-12 text-sm shadow-sm"
          aria-label="Ask about boards or reports"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Send"
          className="absolute right-2 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <SendHorizontal className="size-4" strokeWidth={1.75} />
        </Button>
      </div>

      {/* Recently viewed */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5" strokeWidth={1.75} aria-hidden />
          <h2 className="font-medium">Recently viewed</h2>
        </div>
        <RecentCarousel items={ANALYTICS_RECENT} />
      </section>

      {/* Library */}
      <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2.5">
          <Tabs
            value={scope}
            onValueChange={(v) => setScope(v as ScopeTab)}
            className="w-auto"
          >
            <TabsList className="h-9 bg-transparent p-0">
              <TabsTrigger
                value="starred"
                className="gap-1.5 rounded-md px-3 data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                <Star className="size-3.5" strokeWidth={1.75} aria-hidden />
                Starred
              </TabsTrigger>
              <TabsTrigger
                value="mine"
                className="gap-1.5 rounded-md px-3 data-[state=active]:bg-muted data-[state=active]:shadow-none"
              >
                <UserRound className="size-3.5" strokeWidth={1.75} aria-hidden />
                Created by me
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div
            role="group"
            aria-label="Filter by type"
            className="inline-flex rounded-md border border-border bg-background p-0.5"
          >
            {(
              [
                ["all", "All"],
                ["board", "Boards"],
                ["report", "Reports"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setKind(value)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                  kind === value
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_9rem_5rem_4.5rem] gap-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Name</span>
          <span>Last edited</span>
          <span>Creator</span>
          <span className="sr-only">Actions</span>
        </div>

        <div>
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No items in this view.
            </p>
          ) : (
            rows.map((item) => <LibraryRow key={item.id} item={item} />)
          )}
        </div>
      </section>
    </div>
  );
}

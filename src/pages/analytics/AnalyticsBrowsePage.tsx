/** Journey Analytics → Browse. Search + list table; Create lives in TopBar. */
import { useMemo, useState } from "react";
import {
  ChevronDown,
  LayoutGrid,
  LineChart,
  MoreHorizontal,
  Plus,
  Rows3,
  Search,
  Star,
} from "@/components/icons/protoLucide";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ANALYTICS_BROWSE_BASE,
  ANALYTICS_ITEMS,
  analyticsItemPath,
  mapAnalyticsNameOverrides,
  type AnalyticsItemKind,
  type AnalyticsOverviewItem,
} from "@/data/analyticsOverview";
import { useAnalyticsRowsStore } from "@/store/analyticsRows";
import { cn } from "@/lib/utils";
import InlineEditableName from "@/components/ui/InlineEditableName";

function KindIcon({ kind }: { kind: AnalyticsItemKind }) {
  const Icon = kind === "board" ? LayoutGrid : LineChart;
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center rounded-md",
        kind === "board"
          ? "bg-[var(--info-bg)] text-[var(--info-fg)]"
          : "bg-muted text-foreground"
      )}
    >
      <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

/** Stable dummy view counts from id — no extra data fields required. */
function viewsFor(id: string): number {
  let n = 0;
  for (let i = 0; i < id.length; i++) n = (n * 31 + id.charCodeAt(i)) >>> 0;
  return (n % 400) + 12;
}

function BrowseRow({ item }: { item: AnalyticsOverviewItem }) {
  const rename = useAnalyticsRowsStore((s) => s.rename);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_9rem_4.5rem_5rem_5.5rem] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <KindIcon kind={item.kind} />
        <InlineEditableName
          name={item.name}
          to={analyticsItemPath(item.id, { basePath: ANALYTICS_BROWSE_BASE })}
          onRename={(next) => rename(item.id, next)}
          className="truncate text-sm font-medium text-foreground hover:underline"
        />
      </div>
      <span className="text-sm text-muted-foreground">{item.editedLabel}</span>
      <span className="text-sm tabular-nums text-muted-foreground">
        {viewsFor(item.id)}
      </span>
      <Avatar className="size-7">
        <AvatarFallback className="bg-muted text-[10px] font-medium text-foreground">
          {item.creatorInitials}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center justify-end gap-0.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={item.starred ? "Unstar" : "Star"}
          className="size-8 text-muted-foreground hover:text-foreground"
        >
          <Star
            className={cn(
              "size-4",
              item.starred && "fill-foreground text-foreground"
            )}
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

export default function AnalyticsBrowsePage() {
  const [search, setSearch] = useState("");
  const nameOverrides = useAnalyticsRowsStore((s) => s.nameOverrides);

  const rows = useMemo(() => {
    const items = mapAnalyticsNameOverrides(ANALYTICS_ITEMS, nameOverrides);
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [search, nameOverrides]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-8 pb-16 pt-8">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[14rem] flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5 sm:max-w-xs">
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            aria-label="Search boards and reports"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="gap-1 border-dashed text-muted-foreground"
        >
          Add filter
          <Plus className="size-3.5" strokeWidth={1.75} aria-hidden />
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length} item{rows.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            className="gap-1.5 text-muted-foreground"
          >
            Recently edited
            <ChevronDown className="size-3.5 opacity-70" aria-hidden />
          </Button>
          <div
            role="group"
            aria-label="Layout"
            className="inline-flex rounded-md border border-border bg-background p-0.5"
          >
            <button
              type="button"
              aria-pressed
              aria-label="List view"
              className="inline-flex size-8 items-center justify-center rounded bg-muted text-foreground"
            >
              <Rows3 className="size-3.5" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              aria-pressed={false}
              aria-label="Grid view"
              disabled
              className="inline-flex size-8 items-center justify-center rounded text-muted-foreground opacity-60"
            >
              <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)_9rem_4.5rem_5rem_5.5rem] gap-3 bg-muted/50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Name</span>
          <span>Last edited</span>
          <span>Views</span>
          <span>Creator</span>
          <span className="sr-only">Actions</span>
        </div>
        <div>
          {rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No items match your search.
            </p>
          ) : (
            rows.map((item) => <BrowseRow key={item.id} item={item} />)
          )}
        </div>
      </section>
    </div>
  );
}

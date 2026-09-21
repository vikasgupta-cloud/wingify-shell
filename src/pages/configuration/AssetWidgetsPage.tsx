/** Configuration → Assets Hub → Widgets — search, filters, grid/list, widget cards.
 * Create Widget CTA lives in DrillInShell header. Reuses shadcn Input/Button/Select/DropdownMenu.
 */

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  MoreVertical,
  Rows3,
  Search,
} from "@/components/icons/protoLucide";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ASSET_WIDGETS,
  WIDGET_CATEGORIES,
  WIDGET_TYPES,
  type AssetWidget,
} from "@/data/assetWidgets";
import { cn } from "@/lib/utils";

type Layout = "grid" | "list";

function BrowserPreview() {
  return (
    <div className="flex h-full items-center justify-center bg-muted/40 p-6">
      <div className="w-full max-w-[200px] overflow-hidden rounded-md border border-border bg-background shadow-sm">
        <div className="flex items-center gap-1 border-b border-border bg-muted/60 px-2 py-1.5">
          <span className="size-1.5 rounded-full bg-border" aria-hidden />
          <span className="size-1.5 rounded-full bg-border" aria-hidden />
          <span className="size-1.5 rounded-full bg-border" aria-hidden />
        </div>
        <div className="flex h-24 items-center justify-center gap-1.5 bg-muted/30">
          <span
            className="size-0 border-x-[6px] border-b-[10px] border-x-transparent border-b-[var(--status-running-fg)]"
            aria-hidden
          />
          <span className="size-2.5 rounded-sm bg-foreground" aria-hidden />
          <span className="size-2.5 rounded-full bg-foreground" aria-hidden />
        </div>
      </div>
    </div>
  );
}

function CodePreview() {
  return (
    <div className="flex h-full overflow-hidden bg-muted/30 p-3">
      <pre className="flex min-h-0 w-full overflow-hidden rounded-md border border-border bg-background font-mono text-[10px] leading-4 text-foreground shadow-sm">
        <div className="shrink-0 select-none border-r border-border bg-muted/50 px-2 py-2 text-right text-muted-foreground">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <code className="min-w-0 flex-1 overflow-hidden p-2 text-muted-foreground">
          <div>
            <span className="text-foreground">&lt;div</span> style=
            <span className="text-muted-foreground">
              &quot;--vwo-wf-primary…
            </span>
          </div>
          <div className="pl-2">
            class=<span className="text-muted-foreground">&quot;vwo-wf&quot;</span>
            &gt;
          </div>
          <div className="pl-2">&lt;div class=&quot;vwo-wf__wheel&quot;&gt;</div>
          <div className="pl-4">…</div>
          <div className="pl-2">&lt;/div&gt;</div>
          <div>&lt;/div&gt;</div>
        </code>
      </pre>
    </div>
  );
}

function WidgetCard({
  widget,
  layout,
}: {
  widget: AssetWidget;
  layout: Layout;
}) {
  const preview =
    widget.preview === "code" ? <CodePreview /> : <BrowserPreview />;

  if (layout === "list") {
    return (
      <article className="flex items-stretch gap-4 rounded-xl border border-border bg-background p-3">
        <div className="h-20 w-32 shrink-0 overflow-hidden rounded-md border border-border">
          {preview}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {widget.name}
            </h3>
            {widget.badge ? (
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {widget.badge}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{widget.category}</p>
          {widget.author ? (
            <p className="text-xs text-muted-foreground">
              {widget.author}
              {widget.updatedLabel ? ` · ${widget.updatedLabel}` : null}
            </p>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${widget.name}`}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
            <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex items-start justify-between gap-2 px-4 pb-2 pt-4">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground">
              {widget.name}
            </h3>
            {widget.badge ? (
              <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                {widget.badge}
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{widget.category}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${widget.name}`}
              className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              <MoreVertical className="size-4" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem disabled>Edit</DropdownMenuItem>
            <DropdownMenuItem disabled>Duplicate</DropdownMenuItem>
            <DropdownMenuItem disabled>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mx-4 mb-3 h-40 overflow-hidden rounded-lg border border-border">
        {preview}
      </div>

      {widget.author ? (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          <Avatar className="size-6">
            <AvatarFallback className="bg-muted text-[9px] font-medium text-foreground">
              {widget.authorInitials ?? "?"}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            {widget.author}
          </span>
          {widget.updatedLabel ? (
            <time className="shrink-0 text-xs text-muted-foreground">
              {widget.updatedLabel}
            </time>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function AssetWidgetsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(WIDGET_CATEGORIES[0]);
  const [widgetType, setWidgetType] = useState<string>(WIDGET_TYPES[0]);
  const [layout, setLayout] = useState<Layout>("grid");

  const widgets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSET_WIDGETS.filter((w) => {
      if (q && !w.name.toLowerCase().includes(q)) return false;
      if (category !== "All categories" && w.category !== category) return false;
      if (widgetType !== "All widget types" && w.widgetType !== widgetType) {
        return false;
      }
      return true;
    });
  }, [query, category, widgetType]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-8 pb-16 pt-10">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search widgets by name..."
            aria-label="Search widgets by name"
            className="h-9 bg-background pl-9 shadow-none"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[160px] bg-background shadow-none">
            <SelectValue>
              {category === "All categories" ? "Categories" : category}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {WIDGET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All categories" ? "Categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={widgetType} onValueChange={setWidgetType}>
          <SelectTrigger className="h-9 w-[170px] bg-background shadow-none">
            <SelectValue placeholder="All widget types" />
          </SelectTrigger>
          <SelectContent>
            {WIDGET_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          role="group"
          aria-label="Layout"
          className="ml-auto inline-flex rounded-md border border-border bg-background p-0.5"
        >
          <button
            type="button"
            aria-pressed={layout === "grid"}
            aria-label="Grid view"
            onClick={() => setLayout("grid")}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded transition-colors",
              layout === "grid"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={layout === "list"}
            aria-label="List view"
            onClick={() => setLayout("list")}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded transition-colors",
              layout === "list"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Rows3 className="size-3.5" strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      {widgets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
          No widgets match your filters.
        </p>
      ) : layout === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} layout="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {widgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} layout="list" />
          ))}
        </div>
      )}
    </div>
  );
}

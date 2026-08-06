import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AddTab = "widgets" | "elements" | "saved";

const PRESETS = [
  { title: "Halloween Banner", category: "Engagement" },
  { title: "Winter Sale Banner", category: "Promotion" },
  { title: "Tooltip", category: "Conversion" },
  { title: "Sticky Bar", category: "Engagement" },
  { title: "Countdown Timer", category: "Urgency" },
  { title: "Social Proof", category: "Trust" },
];

const CUSTOM = [
  { title: "Hero CTA Block", category: "Custom" },
  { title: "Promo Strip", category: "Custom" },
];

const TEMPLATES = [
  { title: "Announcement", category: "Template" },
  { title: "Exit Intent", category: "Template" },
];

function WidgetCard({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  return (
    <button
      type="button"
      className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 text-left outline-none transition-colors hover:bg-muted"
    >
      <span className="flex h-20 items-center justify-center rounded-md bg-muted">
        <Plus className="size-5 text-muted-foreground" strokeWidth={1.5} />
      </span>
      <span className="truncate text-xs font-semibold text-foreground">
        {title}
      </span>
      <span className="text-[10px] font-medium text-muted-foreground">
        {category}
      </span>
    </button>
  );
}

/** Add content in the bottom sheet — widgets, elements, saved changes. */
export function EditorAddPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<AddTab>("widgets");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const tabs: { id: AddTab; label: string }[] = [
    { id: "widgets", label: "Widgets" },
    { id: "elements", label: "Elements" },
    { id: "saved", label: "Saved changes" },
  ];

  const q = query.trim().toLowerCase();
  const match = (title: string, category: string) =>
    !q ||
    title.toLowerCase().includes(q) ||
    category.toLowerCase().includes(q);
  const presets = PRESETS.filter((w) => match(w.title, w.category));
  const customs = CUSTOM.filter((w) => match(w.title, w.category));
  const templates = TEMPLATES.filter((w) => match(w.title, w.category));

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-border px-4">
        <p className="text-sm font-semibold text-foreground">Add</p>
        <nav className="flex min-w-0 flex-1 items-center gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold outline-none transition-colors",
                tab === t.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="size-3.5" strokeWidth={1.75} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-b border-border px-4 py-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-8 text-xs shadow-none"
            autoFocus
          />
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === "widgets" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">
                  All Widgets
                </p>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {presets.length + customs.length + templates.length}
                </span>
              </div>
              <div className="flex max-w-md flex-1 items-center justify-end gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2">
                <p className="min-w-0 flex-1 text-xs leading-5 text-foreground">
                  Create your own widget with simple building blocks — no coding
                  required.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="h-7 shrink-0 text-xs font-semibold"
                >
                  Start building
                </Button>
              </div>
            </div>

            {presets.length > 0 && (
              <section className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  PRESETS
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {presets.map((w) => (
                    <WidgetCard key={w.title} {...w} />
                  ))}
                </div>
              </section>
            )}

            {customs.length > 0 && (
              <section className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  CUSTOM WIDGETS
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {customs.map((w) => (
                    <WidgetCard key={w.title} {...w} />
                  ))}
                </div>
              </section>
            )}

            {templates.length > 0 && (
              <section className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  TEMPLATES
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {templates.map((w) => (
                    <WidgetCard key={w.title} {...w} />
                  ))}
                </div>
              </section>
            )}

            {presets.length + customs.length + templates.length === 0 && (
              <p className="py-10 text-center text-xs text-muted-foreground">
                No widgets match “{query}”.
              </p>
            )}
          </div>
        )}

        {tab === "elements" && (
          <p className="py-12 text-center text-xs text-muted-foreground">
            HTML elements will appear here.
          </p>
        )}

        {tab === "saved" && (
          <p className="py-12 text-center text-xs text-muted-foreground">
            Saved changes will appear here.
          </p>
        )}
      </div>
    </aside>
  );
}

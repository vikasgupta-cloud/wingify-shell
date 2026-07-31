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
      <span className="flex h-16 items-center justify-center rounded-md bg-muted">
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

/** Left Add panel — widgets, elements, saved changes. */
export function EditorAddPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<AddTab>("widgets");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  const tabs: { id: AddTab; label: string }[] = [
    { id: "widgets", label: "Widgets" },
    { id: "elements", label: "Elements" },
    { id: "saved", label: "Saved changes" },
  ];

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <p className="text-sm font-semibold text-foreground">Add</p>
        <div className="flex items-center gap-0.5">
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
        <div className="border-b border-border px-3 py-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-7 text-xs shadow-none"
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[108px] shrink-0 flex-col gap-0.5 border-r border-border p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-2 py-1.5 text-left text-xs font-semibold outline-none",
                tab === t.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {tab === "widgets" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-foreground">
                  All Widgets
                </p>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  12
                </span>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs leading-5 text-foreground">
                  Create your own widget with simple building blocks — no coding
                  required.
                </p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-2 h-7 text-xs font-semibold"
                >
                  Start building
                </Button>
              </div>

              <section className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  PRESETS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((w) => (
                    <WidgetCard key={w.title} {...w} />
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  CUSTOM WIDGETS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CUSTOM.map((w) => (
                    <WidgetCard key={w.title} {...w} />
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">
                  TEMPLATES
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((w) => (
                    <WidgetCard key={w.title} {...w} />
                  ))}
                </div>
              </section>
            </div>
          )}

          {tab === "elements" && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              HTML elements will appear here.
            </p>
          )}

          {tab === "saved" && (
            <p className="py-8 text-center text-xs text-muted-foreground">
              Saved changes will appear here.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

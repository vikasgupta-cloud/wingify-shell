import { useState } from "react";
import { Filter, MoreVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChangesTab = "changes" | "variables";

const CHANGES = [
  {
    title: "Edit Styles",
    selector: "main .swiper-slide-active .text-heading-3",
    user: "Randeep",
    when: "Today, 11:42 AM",
  },
  {
    title: "Added Banner widget",
    selector: "body > main > section",
    user: "Randeep",
    when: "Today, 11:18 AM",
  },
  {
    title: "Moved after",
    selector: "header .nav-item:nth-child(2)",
    user: "Randeep",
    when: "Yesterday, 4:05 PM",
  },
  {
    title: "Changed Image",
    selector: "main .hero-image img",
    user: "Randeep",
    when: "Yesterday, 3:51 PM",
  },
  {
    title: "Edit Content",
    selector: "main .text-heading-3",
    user: "Randeep",
    when: "Mon, 2:14 PM",
  },
  {
    title: "Edit Attributes",
    selector: "a.cta-link",
    user: "Randeep",
    when: "Mon, 1:02 PM",
  },
];

/** Left Changes panel — change history list. */
export function EditorChangesPanel({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<ChangesTab>("changes");

  return (
    <aside className="flex h-full w-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-3">
        <p className="text-sm font-semibold text-foreground">Changes</p>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Filter"
          >
            <Filter className="size-3.5" strokeWidth={1.75} />
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

      <div className="flex gap-1 border-b border-border px-3 py-2">
        {(
          [
            ["changes", `Changes (${CHANGES.length})`],
            ["variables", "Used variables"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-7 rounded-md px-2.5 text-xs font-semibold outline-none",
              tab === id
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {tab === "changes" ? (
          <ul className="space-y-2">
            {CHANGES.map((c) => (
              <li
                key={`${c.title}-${c.when}`}
                className="rounded-lg border border-border p-2.5"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-bold text-foreground">
                    {c.title.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">
                        {c.title}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        aria-label="More"
                      >
                        <MoreVertical
                          className="size-3.5"
                          strokeWidth={1.75}
                        />
                      </Button>
                    </div>
                    <code className="mt-1 block truncate text-[10px] text-muted-foreground">
                      {c.selector}
                    </code>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">
                      {c.user} · {c.when}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No variables in use.
          </p>
        )}
      </div>
    </aside>
  );
}

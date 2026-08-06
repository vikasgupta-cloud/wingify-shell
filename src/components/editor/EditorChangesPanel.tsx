import { useState } from "react";
import { Filter, ListTree, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorFloatablePanel } from "./EditorFloatablePanel";
import type {
  EditorPanelChrome,
  EditorPanelGroupDragHandlers,
} from "./EditorFloatablePanel";

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

/** Changes panel — dockable / detachable change history. */
export function EditorChangesPanel({
  onClose,
  chrome,
  onChromeChange,
  onReattach,
  grouped,
  tabPane,
  groupDrag,
}: {
  onClose?: () => void;
  chrome: EditorPanelChrome;
  onChromeChange: (next: EditorPanelChrome) => void;
  onReattach?: () => void;
  grouped?: boolean;
  tabPane?: boolean;
  groupDrag?: EditorPanelGroupDragHandlers;
}) {
  const [tab, setTab] = useState<ChangesTab>("changes");

  return (
    <EditorFloatablePanel
      title="Changes"
      icon={<ListTree className="size-3.5 shrink-0" strokeWidth={1.75} />}
      onClose={onClose}
      bodyClassName="min-h-0 overflow-hidden"
      chrome={chrome}
      onChromeChange={onChromeChange}
      onReattach={onReattach}
      grouped={grouped}
      tabPane={tabPane}
      groupDrag={groupDrag}
    >
      <div className="flex h-9 shrink-0 items-center justify-end border-b border-border px-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Filter"
        >
          <Filter className="size-3.5" strokeWidth={1.75} />
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border px-3 py-2">
        {(
          [
            ["changes", "Changes"],
            ["variables", "Variables"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold outline-none",
              tab === id
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {tab === "changes" ? (
          <ul className="space-y-1">
            {CHANGES.map((change) => (
              <li key={`${change.title}-${change.selector}`}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left outline-none hover:bg-muted"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium text-foreground">
                      {change.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {change.selector}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {change.user} · {change.when}
                    </span>
                  </span>
                  <MoreVertical
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    strokeWidth={1.75}
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Variables will appear here.
          </p>
        )}
      </div>
    </EditorFloatablePanel>
  );
}

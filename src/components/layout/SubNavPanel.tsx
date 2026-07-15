import { NavLink } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PinOff } from "lucide-react";
import type { NavItem } from "../../config/navigation";
import { useUIStore } from "../../store/ui";
import { cn } from "../../lib/utils";

type SubNavPanelProps = {
  item: NavItem;
  variant: "docked" | "flyout";
  /** Called after the item is unpinned so a flyout host can dismiss itself. */
  onRequestClose?: () => void;
};

export default function SubNavPanel({
  item,
  variant,
  onRequestClose,
}: SubNavPanelProps) {
  const unpin = useUIStore((s) => s.unpin);

  if (!item.sections) return null;

  return (
    <nav
      className={cn(
        "w-[248px] shrink-0 overflow-y-auto py-6",
        variant === "docked" &&
          "h-full bg-panel text-panel-foreground border-r border-panel-border",
        variant === "flyout" &&
          "max-h-[calc(100vh-2rem)] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 pb-4">
        <div className="truncate text-sm font-semibold text-foreground">
          {item.label}
        </div>
        {item.pinnable && (
          <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label="Unpin from sidebar"
                  onClick={() => {
                    unpin(item.path);
                    onRequestClose?.();
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PinOff className="h-3.5 w-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={4}
                  className="z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
                >
                  Unpin from sidebar
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>
      <div className="flex flex-col gap-6 px-3">
        {item.sections.map((section, i) => (
          <div key={section.heading ?? i} className="flex flex-col gap-1">
            {section.heading && (
              <div className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {section.heading}
              </div>
            )}
            {section.items.map((leaf) => (
              <NavLink
                key={leaf.path}
                to={leaf.path}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted",
                    isActive && "bg-accent font-medium text-accent-foreground"
                  )
                }
              >
                {leaf.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}

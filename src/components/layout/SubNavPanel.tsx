import { NavLink } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PinOff } from "@/components/icons/protoLucide";
import type { NavItem } from "../../config/navigation";
import { canUnpinPath, useUIStore } from "../../store/ui";
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
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const canUnpin = (path: string) => canUnpinPath(pinnedPaths, path);

  if (!item.sections) return null;

  return (
    <nav
      className={cn(
        "w-[248px] shrink-0 overflow-y-auto py-6",
        variant === "docked" &&
          "h-full border-r border-[hsl(var(--appearance-main-nav-border,_var(--panel-border)))] bg-[hsl(var(--appearance-main-nav-background,_var(--panel)))] text-[hsl(var(--appearance-main-nav-text,_var(--panel-foreground)))]",
        variant === "flyout" &&
          "max-h-[calc(100vh-2rem)] rounded-lg border border-[hsl(var(--appearance-main-nav-border,_var(--border)))] bg-[hsl(var(--appearance-main-nav-background,_var(--popover)))] text-[hsl(var(--appearance-main-nav-text,_var(--popover-foreground)))] shadow-lg"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 pb-4">
        <div className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.label}
        </div>
        {item.pinnable && pinnedPaths.includes(item.path) && canUnpin(item.path) && (
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
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-current"
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
      <div className="flex flex-col px-3">
        {item.sections.map((section, i) => (
          <div key={section.heading ?? i} className="flex flex-col gap-1">
            {i > 0 && (
              <div
                className="my-3 h-px bg-[hsl(var(--appearance-main-nav-border,_var(--panel-border)))]"
                aria-hidden="true"
              />
            )}
            {section.items.map((leaf) => (
              <NavLink
                key={leaf.path}
                to={leaf.path}
                onClick={() => onRequestClose?.()}
                className={({ isActive }) =>
                  cn(
                    "rounded-md border border-transparent px-2.5 py-2 text-sm text-current transition-colors hover:border-[hsl(var(--appearance-main-nav-hover-border,_transparent))] hover:bg-[hsl(var(--appearance-main-nav-hover-background,_var(--main-nav-hover-background,_var(--muted))))] hover:text-[hsl(var(--appearance-main-nav-hover-text,_var(--main-nav-hover-foreground,_var(--appearance-main-nav-text,_var(--panel-foreground)))))]",
                    isActive &&
                      "border-[hsl(var(--appearance-main-nav-active-border,_transparent))] bg-[hsl(var(--appearance-main-nav-active-background,_var(--accent)))] font-medium text-[hsl(var(--appearance-main-nav-active-text,_var(--accent-foreground)))] hover:border-[hsl(var(--appearance-main-nav-active-border,_transparent))] hover:bg-[hsl(var(--appearance-main-nav-active-background,_var(--accent)))] hover:text-[hsl(var(--appearance-main-nav-active-text,_var(--accent-foreground)))]"
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

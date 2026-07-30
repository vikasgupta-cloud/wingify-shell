import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronDown, Pin, PinOff } from "lucide-react";
import { NAV, type NavItem } from "../../config/navigation";
import { findItemByPath, firstChildPath } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import { cn } from "../../lib/utils";

/** Width of the expanded (labeled) navigation sidebar — shared with the app grid. */
export const EXPANDED_NAV_WIDTH = 260;

const tooltipContentClass =
  "z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md";

// The expanded sidebar shown while the nav is "open" (docked). Every main-nav item
// is an icon + label row; items with sub-nav expand as a single-open accordion, with
// the active section auto-expanded. Collapsed mode keeps the icon rail + hover flyout
// (see PrimaryRail) — AppLayout switches between the two.
export default function ExpandedNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const pin = useUIStore((s) => s.pin);
  const unpin = useUIStore((s) => s.unpin);

  const activeItem = findItemByPath(pathname);
  // Single-open accordion: the one expanded section's path (null = all collapsed).
  const [openPath, setOpenPath] = useState<string | null>(
    activeItem?.sections ? activeItem.path : null
  );

  // Auto-expand the active section as the route changes.
  useEffect(() => {
    if (activeItem?.sections) setOpenPath(activeItem.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem?.path]);

  const isVisible = (i: NavItem) => !i.pinnable || pinnedPaths.includes(i.path);
  const group1 = NAV.filter((i) => i.group === 1 && isVisible(i));
  const group2 = NAV.filter((i) => i.group === 2 && isVisible(i));
  const group3 = NAV.filter((i) => i.group === 3);
  const unpinned = NAV.filter((i) => i.pinnable && !pinnedPaths.includes(i.path));

  const renderItem = (item: NavItem, inMore = false) => {
    const Icon = item.icon;
    const isActive = findItemByPath(pathname)?.path === item.path;
    const hasSections = !!item.sections;
    const open = openPath === item.path;

    const leadingIcon = item.initials ? (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-foreground">
        {item.initials}
      </span>
    ) : (
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
    );

    return (
      <div key={item.path}>
        <div
          className={cn(
            "group flex items-center gap-1 rounded-md pr-1 transition-colors hover:bg-muted",
            isActive && !hasSections && "bg-accent hover:bg-accent"
          )}
        >
          <button
            type="button"
            onClick={() => {
              // flyoutOnly + sections (avatar): expand options only — no navigation.
              if (item.flyoutOnly && hasSections) {
                setOpenPath(open ? null : item.path);
                return;
              }
              navigate(firstChildPath(item));
              if (hasSections) setOpenPath(open ? null : item.path);
            }}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-left text-sm text-foreground outline-none",
              isActive && !hasSections && "font-medium text-accent-foreground",
              isActive && hasSections && "font-medium"
            )}
          >
            {leadingIcon}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </button>
          {item.pinnable && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label={
                    inMore
                      ? `Pin ${item.label} to sidebar`
                      : `Unpin ${item.label} from sidebar`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    inMore ? pin(item.path) : unpin(item.path);
                  }}
                  className="shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition-colors hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                >
                  {inMore ? (
                    <Pin className="h-3.5 w-3.5" />
                  ) : (
                    <PinOff className="h-3.5 w-3.5" />
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content side="bottom" sideOffset={4} className={tooltipContentClass}>
                  {inMore ? "Pin to sidebar" : "Unpin from sidebar"}
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}
          {hasSections && (
            <button
              type="button"
              aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
              onClick={() => setOpenPath(open ? null : item.path)}
              className="shrink-0 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-150",
                  open && "rotate-180"
                )}
              />
            </button>
          )}
        </div>

        {hasSections && open && item.sections && (
          <div className="ml-[19px] mt-1 flex flex-col border-l border-panel-border pb-2 pl-3 pr-1">
            {item.sections.map((section, i) => (
              <div key={section.heading ?? i} className="flex flex-col gap-1">
                {i > 0 && (
                  <div className="my-2 h-px bg-panel-border" aria-hidden="true" />
                )}
                {section.items.map((leaf) => {
                  const LeafIcon = leaf.icon;
                  return (
                    <NavLink
                      key={leaf.path}
                      to={leaf.path}
                      className={({ isActive: leafActive }) =>
                        cn(
                          "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted",
                          leafActive && "bg-accent font-medium text-accent-foreground"
                        )
                      }
                    >
                      {LeafIcon && (
                        <LeafIcon
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          strokeWidth={1.75}
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">{leaf.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const separator = (
    <div className="mx-3 my-3 h-px shrink-0 bg-panel-border" aria-hidden="true" />
  );

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <nav
        className="flex h-full flex-col overflow-hidden border-r border-panel-border bg-panel py-4 text-panel-foreground"
        style={{ width: EXPANDED_NAV_WIDTH }}
      >
        <div className="flex shrink-0 items-center px-3 pb-3">
          <button
            type="button"
            aria-label="Go to Home dashboard"
            onClick={() => navigate("/home/dashboard")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rail-active text-base font-bold text-rail-active-foreground"
          >
            W
          </button>
        </div>

        <div className="flex shrink-0 flex-col gap-0.5 px-3">
          {group1.map((i) => renderItem(i))}
        </div>
        {separator}
        <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3">
          {group2.map((i) => renderItem(i))}
          {unpinned.length > 0 && (
            <>
              <div className="px-2 pb-0.5 pt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                More
              </div>
              {unpinned.map((i) => renderItem(i, true))}
            </>
          )}
        </div>
        {separator}
        <div className="flex shrink-0 flex-col gap-0.5 px-3">
          {group3.map((i) => renderItem(i))}
        </div>
      </nav>
    </Tooltip.Provider>
  );
}

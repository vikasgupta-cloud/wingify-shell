import { useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Tooltip from "@radix-ui/react-tooltip";
import { MoreHorizontal, Pin, PinOff } from "lucide-react";
import { NAV, type NavItem } from "../../config/navigation";
import { firstChildPath, RAIL_WIDTH } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import { cn } from "../../lib/utils";
import SubNavPanel from "./SubNavPanel";

const FLYOUT_CLOSE_GRACE_MS = 120;
const FLYOUT_VIEWPORT_MARGIN = 8;

const tooltipContentClass =
  "z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md";

export default function PrimaryRail() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDocked = useUIStore((s) => s.isDocked);
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const pin = useUIStore((s) => s.pin);
  const unpin = useUIStore((s) => s.unpin);

  // Hover flyout state is local to the rail: hovered item path + its rail-button top.
  const [flyout, setFlyout] = useState<{ path: string; top: number } | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const openFlyout = (item: NavItem, target: HTMLElement) => {
    if (isDocked) return;
    window.clearTimeout(closeTimer.current);
    setFlyout(
      item.sections
        ? { path: item.path, top: target.getBoundingClientRect().top }
        : null
    );
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setFlyout(null),
      FLYOUT_CLOSE_GRACE_MS
    );
  };
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  // Clamp the flyout inside the viewport once its height is measurable.
  useLayoutEffect(() => {
    const el = flyoutRef.current;
    if (!el || !flyout) return;
    const maxTop = window.innerHeight - el.offsetHeight - FLYOUT_VIEWPORT_MARGIN;
    el.style.top = `${Math.max(FLYOUT_VIEWPORT_MARGIN, Math.min(flyout.top, maxTop))}px`;
  }, [flyout]);

  const isVisible = (item: NavItem) =>
    !item.pinnable || pinnedPaths.includes(item.path);
  const group1 = NAV.filter((i) => i.group === 1 && isVisible(i));
  const group2 = NAV.filter((i) => i.group === 2 && isVisible(i));
  const group3 = NAV.filter((i) => i.group === 3);
  const unpinned = NAV.filter(
    (i) => i.pinnable && !pinnedPaths.includes(i.path)
  );
  const flyoutItem = flyout
    ? NAV.find((i) => i.path === flyout.path)
    : undefined;

  const renderRailButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + "/");
    const button = (
      <button
        type="button"
        aria-label={item.label}
        onClick={() => navigate(firstChildPath(item))}
        onMouseEnter={(e) => openFlyout(item, e.currentTarget)}
        onMouseLeave={scheduleClose}
        onFocus={(e) => openFlyout(item, e.currentTarget)}
        onBlur={scheduleClose}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-rail-foreground transition-colors hover:bg-accent",
          isActive &&
            "bg-rail-active text-rail-active-foreground hover:bg-rail-active"
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </button>
    );

    // Items with a flyout panel reveal their name there — no tooltip needed.
    if (item.sections) {
      return <span key={item.path}>{button}</span>;
    }

    // Direct pinnable items: tooltip-styled HoverCard with an inline unpin control.
    if (item.pinnable) {
      return (
        <HoverCard.Root key={item.path} openDelay={150} closeDelay={150}>
          <HoverCard.Trigger asChild>{button}</HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content
              side="right"
              sideOffset={8}
              className={cn(tooltipContentClass, "flex items-center gap-2")}
            >
              <span>{item.label}</span>
              <button
                type="button"
                aria-label={`Unpin ${item.label} from sidebar`}
                onClick={(e) => {
                  e.stopPropagation();
                  unpin(item.path);
                }}
                className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <PinOff className="h-3 w-3" />
              </button>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      );
    }

    // Direct non-pinnable items (Helpdesk, Activity timeline): plain tooltip.
    return (
      <Tooltip.Root key={item.path}>
        <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content side="right" sideOffset={8} className={tooltipContentClass}>
            {item.label}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    );
  };

  const separator = (
    <div className="my-3 h-px w-10 shrink-0 bg-panel-border" aria-hidden="true" />
  );

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div className="relative h-full">
        <div
          className="flex h-full flex-col items-center bg-rail py-4"
          style={{ width: RAIL_WIDTH }}
        >
          <button
            type="button"
            aria-label="Go to Home dashboard"
            onClick={() => navigate("/home/dashboard")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rail-active text-base font-bold text-rail-active-foreground"
          >
            W
          </button>

          <div className="mt-5 flex shrink-0 flex-col items-center gap-2">
            {group1.map(renderRailButton)}
          </div>
          {separator}
          <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {group2.map(renderRailButton)}
            {unpinned.length > 0 && (
              <DropdownMenu.Root modal={false}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <DropdownMenu.Trigger asChild>
                      <button
                        type="button"
                        aria-label="More navigation items"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-rail-foreground transition-colors hover:bg-accent"
                      >
                        <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
                      </button>
                    </DropdownMenu.Trigger>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={8}
                      className={tooltipContentClass}
                    >
                      More
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    side="right"
                    align="start"
                    sideOffset={6}
                    className="z-50 min-w-[240px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
                  >
                    {unpinned.map((item) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenu.Item
                          key={item.path}
                          onSelect={() => navigate(firstChildPath(item))}
                          className="group flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent"
                        >
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1 truncate">{item.label}</span>
                          <button
                            type="button"
                            aria-label={`Pin ${item.label} to sidebar`}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              pin(item.path);
                            }}
                            className="rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                        </DropdownMenu.Item>
                      );
                    })}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
          {separator}
          <div className="flex shrink-0 flex-col items-center gap-2">
            {group3.map(renderRailButton)}
          </div>
        </div>

        {!isDocked && flyout && flyoutItem?.sections && (
          <div
            ref={flyoutRef}
            className="fixed z-40 pl-1.5"
            style={{ left: RAIL_WIDTH, top: flyout.top }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <SubNavPanel
              item={flyoutItem}
              variant="flyout"
              onRequestClose={() => setFlyout(null)}
            />
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}

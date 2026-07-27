import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Tooltip from "@radix-ui/react-tooltip";
import { MoreHorizontal, Pin, PinOff } from "lucide-react";
import { NAV, type NavItem } from "../../config/navigation";
import { firstChildPath, RAIL_WIDTH } from "../../lib/nav";
import { useUIStore } from "../../store/ui";
import { cn } from "../../lib/utils";
import SubNavPanel from "./SubNavPanel";

const FLYOUT_CLOSE_GRACE_MS = 120;
const MORE_CLOSE_GRACE_MS = 150;
const FLYOUT_VIEWPORT_MARGIN = 8;
const MORE_FLYOUT_WIDTH = 248;

const tooltipContentClass =
  "z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md";

/** Clamp a fixed-position flyout inside the viewport once its height is measurable. */
function useClampedFlyoutTop(
  ref: React.RefObject<HTMLDivElement | null>,
  state: { top: number } | null
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !state) return;
    const maxTop = window.innerHeight - el.offsetHeight - FLYOUT_VIEWPORT_MARGIN;
    el.style.top = `${Math.max(FLYOUT_VIEWPORT_MARGIN, Math.min(state.top, maxTop))}px`;
  }, [ref, state]);
}

type PrimaryRailProps = {
  /** Open hover flyouts even when docked — used by the level-2 nav overlay, which has no docked panel. */
  forceFlyout?: boolean;
  /** Whether the docked panel column is showing the More panel — owned by AppLayout, which renders that column. */
  moreSelected?: boolean;
  onMoreSelectedChange?: (selected: boolean) => void;
};

export default function PrimaryRail({
  forceFlyout = false,
  moreSelected = false,
  onMoreSelectedChange,
}: PrimaryRailProps) {
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

  // More flyout (undocked mode B): click-opened list of unpinned items, plus a
  // nested sub-nav flyout for the hovered row.
  const [moreFlyout, setMoreFlyout] = useState<{ top: number } | null>(null);
  const [moreNested, setMoreNested] = useState<{ path: string; top: number } | null>(null);
  const moreCloseTimer = useRef<number | undefined>(undefined);
  const moreFlyoutRef = useRef<HTMLDivElement>(null);
  const moreNestedRef = useRef<HTMLDivElement>(null);

  const closeMore = () => {
    setMoreFlyout(null);
    setMoreNested(null);
  };
  const scheduleMoreClose = () => {
    window.clearTimeout(moreCloseTimer.current);
    moreCloseTimer.current = window.setTimeout(closeMore, MORE_CLOSE_GRACE_MS);
  };
  const cancelMoreClose = () => window.clearTimeout(moreCloseTimer.current);

  const openFlyout = (item: NavItem, target: HTMLElement) => {
    if (isDocked && !forceFlyout) return;
    window.clearTimeout(closeTimer.current);
    // Item flyouts and the More flyout occupy the same strip — never both.
    closeMore();
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMore();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(moreCloseTimer.current);
    };
  }, []);

  useClampedFlyoutTop(flyoutRef, flyout);
  useClampedFlyoutTop(moreFlyoutRef, moreFlyout);
  useClampedFlyoutTop(moreNestedRef, moreNested);

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
  // Resolving from `unpinned` auto-dismisses the nested flyout when its item gets pinned.
  const moreNestedItem = moreNested
    ? unpinned.find((i) => i.path === moreNested.path)
    : undefined;
  const moreUsesDock = isDocked && !forceFlyout;

  // Hover, focus, and click all open the More flyout (never toggle it shut),
  // matching the other rail items' immediate hover-open behavior.
  const openMoreFlyout = (target: HTMLElement) => {
    if (moreUsesDock) return;
    cancelMoreClose();
    setFlyout(null);
    setMoreFlyout({ top: target.getBoundingClientRect().top });
  };

  const handleMoreClick = (target: HTMLElement) => {
    if (moreUsesDock) {
      onMoreSelectedChange?.(true);
      return;
    }
    openMoreFlyout(target);
  };

  const revealMoreNested = (item: NavItem, target: HTMLElement) => {
    cancelMoreClose();
    setMoreNested(
      item.sections
        ? { path: item.path, top: target.getBoundingClientRect().top }
        : null
    );
  };

  const renderRailButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.path || pathname.startsWith(item.path + "/");
    // Profile (and any flyoutOnly item with sections) still gets a SubNav flyout —
    // flyoutOnly only suppresses click-navigation for leaf items like Activity/Help.
    const hasSections = !!item.sections;
    const tooltipOnly = !!item.flyoutOnly && !hasSections;
    const button = (
      <button
        type="button"
        aria-label={item.label}
        onClick={
          tooltipOnly
            ? undefined
            : () => {
                onMoreSelectedChange?.(false);
                navigate(firstChildPath(item));
              }
        }
        onMouseEnter={
          tooltipOnly ? undefined : (e) => openFlyout(item, e.currentTarget)
        }
        onMouseLeave={tooltipOnly ? undefined : scheduleClose}
        onFocus={
          tooltipOnly ? undefined : (e) => openFlyout(item, e.currentTarget)
        }
        onBlur={tooltipOnly ? undefined : scheduleClose}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-rail-foreground transition-colors hover:bg-accent",
          isActive &&
            "bg-rail-active text-rail-active-foreground hover:bg-rail-active"
        )}
      >
        {item.initials ? (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-medium text-foreground",
              isActive && "bg-rail-active text-rail-active-foreground"
            )}
          >
            {item.initials}
          </span>
        ) : (
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        )}
      </button>
    );

    // Leaf flyout-only items (Activity, Help): no navigation, no sub-nav flyout —
    // just a plain tooltip naming the item.
    if (tooltipOnly) {
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
    }

    // Items with a flyout panel reveal their name there — no tooltip needed.
    if (hasSections) {
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

    // Direct non-pinnable items: plain tooltip.
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
          className="flex h-full flex-col items-center border-r border-border bg-rail py-4"
          style={{ width: RAIL_WIDTH }}
        >
          <button
            type="button"
            aria-label="Go to Home dashboard"
            onClick={() => {
              onMoreSelectedChange?.(false);
              navigate("/home/dashboard");
            }}
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
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    aria-label="More navigation items"
                    onClick={(e) => handleMoreClick(e.currentTarget)}
                    onMouseEnter={(e) => openMoreFlyout(e.currentTarget)}
                    onMouseLeave={scheduleMoreClose}
                    onFocus={(e) => openMoreFlyout(e.currentTarget)}
                    onBlur={scheduleMoreClose}
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-rail-foreground transition-colors hover:bg-accent",
                      (moreUsesDock ? moreSelected : !!moreFlyout) &&
                        "bg-rail-active text-rail-active-foreground hover:bg-rail-active"
                    )}
                  >
                    <MoreHorizontal className="h-5 w-5" strokeWidth={1.75} />
                  </button>
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
            )}
          </div>
          {separator}
          <div className="flex shrink-0 flex-col items-center gap-2">
            {group3.map(renderRailButton)}
          </div>
        </div>

        {(!isDocked || forceFlyout) && flyout && flyoutItem?.sections && (
          <div
            ref={flyoutRef}
            className="fixed z-40 animate-scale-in pl-1.5 duration-150"
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

        {moreFlyout && unpinned.length > 0 && (
          <div
            ref={moreFlyoutRef}
            className="fixed z-40 animate-scale-in pl-1.5 duration-150"
            style={{ left: RAIL_WIDTH, top: moreFlyout.top }}
            onMouseEnter={cancelMoreClose}
            onMouseLeave={scheduleMoreClose}
          >
            <div
              className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
              style={{ width: MORE_FLYOUT_WIDTH }}
            >
              {unpinned.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onMouseEnter={(e) => revealMoreNested(item, e.currentTarget)}
                    onFocus={(e) => revealMoreNested(item, e.currentTarget)}
                    className={cn(
                      "flex items-center gap-1 rounded-sm pr-1.5 transition-colors hover:bg-accent",
                      moreNestedItem?.path === item.path && "bg-accent"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        navigate(firstChildPath(item));
                        closeMore();
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left outline-none"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{item.label}</span>
                    </button>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          aria-label={`Pin ${item.label} to sidebar`}
                          onClick={(e) => {
                            e.stopPropagation();
                            pin(item.path);
                          }}
                          className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Pin className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="bottom"
                          sideOffset={4}
                          className={tooltipContentClass}
                        >
                          Pin to sidebar
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {moreFlyout && moreNested && moreNestedItem?.sections && (
          <div
            ref={moreNestedRef}
            className="fixed z-40 animate-scale-in pl-1.5 duration-150"
            style={{
              left: RAIL_WIDTH + 6 + MORE_FLYOUT_WIDTH,
              top: moreNested.top,
            }}
            onMouseEnter={cancelMoreClose}
            onMouseLeave={scheduleMoreClose}
            onClick={(e) => {
              // Sub-nav link clicks navigate; dismiss the whole More stack.
              if ((e.target as HTMLElement).closest("a")) closeMore();
            }}
          >
            <SubNavPanel
              item={moreNestedItem}
              variant="flyout"
              onRequestClose={closeMore}
            />
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
}

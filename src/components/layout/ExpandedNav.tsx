import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Tooltip from "@radix-ui/react-tooltip";
import { ChevronDown, MoreHorizontal, Pin, PinOff } from "@/components/icons/protoLucide";
import { LOGOUT_PATH, NAV, type NavItem } from "../../config/navigation";
import { findItemByPath, firstChildPath, RAIL_WIDTH } from "../../lib/nav";
import { canUnpinPath, useUIStore } from "../../store/ui";
import { useMascotPreviewStore } from "../../store/mascotPreview";
import { mascotForPath } from "../../config/mascots";
import { cn } from "../../lib/utils";
import SubNavPanel from "./SubNavPanel";
import ProfileMenuPanel from "./ProfileMenuPanel";
import ColorModeToggle from "./ColorModeToggle";
import WingifyLogoButton from "./WingifyLogoButton";
import ProfileAvatar from "./ProfileAvatar";

/** Width of the expanded (labeled) navigation sidebar — shared with the app grid. */
export const EXPANDED_NAV_WIDTH = 280;

const FLYOUT_CLOSE_GRACE_MS = 120;
const MORE_CLOSE_GRACE_MS = 150;
const FLYOUT_VIEWPORT_MARGIN = 8;
const MORE_FLYOUT_WIDTH = 248;
/** Rail ↔ expanded morph — keep label/accordion timing in sync. */
const WIDTH_MS = 280;
const WIDTH_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
const widthTransition = `width ${WIDTH_MS}ms ${WIDTH_EASE}`;
const revealTransition = `opacity ${WIDTH_MS}ms ${WIDTH_EASE}, transform ${WIDTH_MS}ms ${WIDTH_EASE}`;
const accordionTransition = `grid-template-rows ${WIDTH_MS}ms ${WIDTH_EASE}, opacity ${WIDTH_MS}ms ${WIDTH_EASE}`;

const tooltipContentClass =
  "z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md";

function useClampedFlyoutTop(
  ref: React.RefObject<HTMLDivElement | null>,
  state: { top: number } | null
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !state) return;
    const maxTop =
      window.innerHeight - el.offsetHeight - FLYOUT_VIEWPORT_MARGIN;
    el.style.top = `${Math.max(FLYOUT_VIEWPORT_MARGIN, Math.min(state.top, maxTop))}px`;
  }, [ref, state]);
}

/**
 * Single sidebar for AppLayout: width morphs between rail and expanded.
 * Inner content stays EXPANDED_NAV_WIDTH so icons keep the same x-position;
 * the outer clips when collapsed. Collapsed mode uses hover flyouts; expanded
 * mode uses accordion sub-nav.
 *
 * `forceCollapsed` pins it to the rail regardless of the docked setting — used
 * by the detail and drill-in shells, whose nav is an edge-reveal overlay.
 */
export default function ExpandedNav({
  forceCollapsed = false,
}: {
  forceCollapsed?: boolean;
} = {}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isDocked = useUIStore((s) => s.isDocked);
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const pin = useUIStore((s) => s.pin);
  const unpin = useUIStore((s) => s.unpin);
  const setMascotPreview = useMascotPreviewStore((s) => s.setPreview);
  const previewMascot = useMascotPreviewStore((s) => s.preview);
  const scheduleMascotClear = useMascotPreviewStore((s) => s.scheduleClear);
  const canUnpin = (path: string) => canUnpinPath(pinnedPaths, path);

  const previewMascotFor = (item: NavItem) => {
    previewMascot(mascotForPath(item.path));
  };
  const clearMascotPreview = () => setMascotPreview(null);

  const expanded = !forceCollapsed && isDocked;
  const activeItem = findItemByPath(pathname);
  const [openPath, setOpenPath] = useState<string | null>(() =>
    activeItem?.sections ? activeItem.path : null
  );

  // Hover flyouts (collapsed only).
  const [flyout, setFlyout] = useState<{ path: string; top: number } | null>(
    null
  );
  const closeTimer = useRef<number | undefined>(undefined);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [moreFlyout, setMoreFlyout] = useState<{ top: number } | null>(null);
  const [moreNested, setMoreNested] = useState<{
    path: string;
    top: number;
  } | null>(null);
  const moreCloseTimer = useRef<number | undefined>(undefined);
  const moreFlyoutRef = useRef<HTMLDivElement>(null);
  const moreNestedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && activeItem?.sections) setOpenPath(activeItem.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem?.path, expanded]);

  useEffect(() => {
    if (expanded) {
      setFlyout(null);
      setMoreFlyout(null);
      setMoreNested(null);
      return;
    }
    // Keep accordion mounted while the rail clips shut so content slides away
    // with the width morph instead of vanishing on the first frame.
    const clearOpen = window.setTimeout(() => setOpenPath(null), WIDTH_MS);
    return () => window.clearTimeout(clearOpen);
  }, [expanded]);

  const closeMore = () => {
    window.clearTimeout(moreCloseTimer.current);
    setMoreFlyout(null);
    setMoreNested(null);
    clearMascotPreview();
  };
  const scheduleMoreClose = () => {
    window.clearTimeout(moreCloseTimer.current);
    moreCloseTimer.current = window.setTimeout(closeMore, MORE_CLOSE_GRACE_MS);
  };
  const cancelMoreClose = () => window.clearTimeout(moreCloseTimer.current);

  const openFlyout = (item: NavItem, target: HTMLElement) => {
    if (expanded) return;
    window.clearTimeout(closeTimer.current);
    closeMore();
    previewMascotFor(item);
    setFlyout(
      item.sections
        ? { path: item.path, top: target.getBoundingClientRect().top }
        : null
    );
  };
  const scheduleClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setFlyout(null);
      clearMascotPreview();
    }, FLYOUT_CLOSE_GRACE_MS);
  };
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMore();
        setFlyout(null);
        clearMascotPreview();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(moreCloseTimer.current);
      window.clearTimeout(closeTimer.current);
      clearMascotPreview();
    };
  }, [setMascotPreview]);

  useClampedFlyoutTop(flyoutRef, flyout);
  useClampedFlyoutTop(moreFlyoutRef, moreFlyout);
  useClampedFlyoutTop(moreNestedRef, moreNested);

  const isVisible = (i: NavItem) => !i.pinnable || pinnedPaths.includes(i.path);
  const group1 = NAV.filter((i) => i.group === 1 && isVisible(i));
  const group2 = NAV.filter((i) => i.group === 2 && isVisible(i));
  const group3 = NAV.filter((i) => i.group === 3);
  const unpinned = NAV.filter(
    (i) => i.pinnable && !pinnedPaths.includes(i.path)
  );
  const flyoutItem = flyout
    ? NAV.find((i) => i.path === flyout.path)
    : undefined;
  const moreNestedItem = moreNested
    ? unpinned.find((i) => i.path === moreNested.path)
    : undefined;

  const openMoreFlyout = (target: HTMLElement) => {
    if (expanded) return;
    cancelMoreClose();
    setFlyout(null);
    setMoreFlyout({ top: target.getBoundingClientRect().top });
  };

  const revealMoreNested = (item: NavItem, target: HTMLElement) => {
    cancelMoreClose();
    setMoreNested(
      item.sections
        ? { path: item.path, top: target.getBoundingClientRect().top }
        : null
    );
  };

  const labelClass = cn(
    "min-w-0 flex-1 truncate text-left font-main-menu will-change-transform",
    expanded
      ? "translate-x-0 opacity-100"
      : "pointer-events-none -translate-x-1.5 opacity-0"
  );
  const chromeClass = cn(
    "shrink-0 will-change-transform",
    expanded
      ? "translate-x-0 opacity-100"
      : "pointer-events-none translate-x-1 opacity-0"
  );

  const renderItem = (item: NavItem, inMore = false) => {
    const Icon = item.icon;
    const isActive = findItemByPath(pathname)?.path === item.path;
    const hasSections = !!item.sections;
    const open = openPath === item.path;
    const tooltipOnly = !!item.flyoutOnly && !hasSections;
    const expandOnly = !!item.flyoutOnly && hasSections;
    const showUnpin = !inMore && item.pinnable && canUnpin(item.path);

    const leadingIcon = item.initials ? (
      <ProfileAvatar
        initials={item.initials}
        size="sm"
        onDark={isActive && !expanded}
      />
    ) : (
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          isActive && !expanded
            ? "text-rail-active-foreground"
            : "text-foreground"
        )}
        strokeWidth={1.75}
      />
    );

    const row = (
      <div
        className={cn(
          "group flex items-center gap-0.5 rounded-lg transition-[background-color,color,width] duration-200 hover:bg-muted",
          // Collapsed rows clamp to the icon so the active pill can't bleed past the rail.
          expanded ? "w-full pr-1.5" : "w-10 justify-start",
          isActive && expanded && !hasSections && "bg-accent hover:bg-accent",
          isActive &&
            !expanded &&
            "bg-rail-active text-rail-active-foreground hover:bg-rail-active"
        )}
        onMouseEnter={(e) => {
          previewMascotFor(item);
          if (!expanded && !tooltipOnly) openFlyout(item, e.currentTarget);
        }}
        onMouseLeave={() => {
          if (!expanded && !tooltipOnly) scheduleClose();
          else scheduleMascotClear();
        }}
        onFocus={(e) => {
          previewMascotFor(item);
          if (!expanded && !tooltipOnly) openFlyout(item, e.currentTarget);
        }}
        onBlur={() => {
          if (!expanded && !tooltipOnly) scheduleClose();
          else scheduleMascotClear();
        }}
      >
        <button
          type="button"
          aria-label={item.label}
          onClick={() => {
            if (tooltipOnly) return;
            if (expandOnly) {
              if (expanded) setOpenPath(open ? null : item.path);
              return;
            }
            navigate(firstChildPath(item));
            if (expanded) {
              // Direct items collapse any open accordion; section items toggle.
              setOpenPath(hasSections ? (open ? null : item.path) : null);
            }
          }}
          className={cn(
            "flex h-10 shrink-0 items-center gap-3 text-sm outline-none",
            // Collapsed: the label + gap overflow the 40px box, so centering
            // would pull the icon left. Start-align and let it spill right.
            // No left padding when expanded: the icon slot must sit at the same
            // x in both states so nothing shifts while the width animates.
            expanded
              ? "min-w-0 flex-1 pr-1.5 text-left text-foreground"
              : "w-10 justify-start overflow-hidden",
            isActive && expanded && "font-medium"
          )}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center">
            {leadingIcon}
          </span>
          <span className={labelClass} style={{ transition: revealTransition }}>
            {item.label}
          </span>
        </button>

        {item.pinnable && (inMore || showUnpin) && (
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
                className={cn(
                  chromeClass,
                  "rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground",
                  // Collapsed rows have no room for it: stay hidden even on hover.
                  expanded
                    ? "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                    : "opacity-0"
                )}
                style={{ transition: revealTransition }}
              >
                {inMore ? (
                  <Pin className="h-3.5 w-3.5" />
                ) : (
                  <PinOff className="h-3.5 w-3.5" />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                sideOffset={4}
                className={tooltipContentClass}
              >
                {inMore ? "Pin to sidebar" : "Unpin from sidebar"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}

        {hasSections && (
          <button
            type="button"
            aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
            onClick={() => {
              if (!expanded) return;
              setOpenPath(open ? null : item.path);
            }}
            className={cn(
              chromeClass,
              "rounded-sm p-1 text-muted-foreground hover:text-foreground"
            )}
            style={{ transition: revealTransition }}
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        )}
      </div>
    );

    // Collapsed rail: an icon alone doesn't name itself. Items with a sub-nav
    // flyout are labelled there; direct items get a tooltip, and pinnable ones
    // carry an inline unpin next to the label (hidden at the pin minimum).
    let hoverRow = row;
    if (!expanded && !inMore && !hasSections) {
      hoverRow = item.pinnable ? (
        <HoverCard.Root openDelay={150} closeDelay={150}>
          <HoverCard.Trigger asChild>{row}</HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content
              side="right"
              sideOffset={8}
              className={cn(tooltipContentClass, "flex items-center gap-2")}
            >
              <span className="font-main-menu">{item.label}</span>
              {canUnpin(item.path) && (
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
              )}
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      ) : (
        <Tooltip.Root>
          <Tooltip.Trigger asChild>{row}</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={8}
              className={tooltipContentClass}
            >
              <span className="font-main-menu">{item.label}</span>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      );
    }

    return (
      <div key={item.path}>
        {hoverRow}

        {hasSections && item.sections && (
          <div
            className="grid"
            style={{
              gridTemplateRows: open ? "1fr" : "0fr",
              opacity: open ? 1 : 0,
              transition: accordionTransition,
            }}
            aria-hidden={!open}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="ml-[22px] mt-1.5 flex flex-col border-l border-panel-border pb-2 pl-3">
                {item.sections.map((section, i) => {
                  const isLogoutSection = section.items.some(
                    (leaf) => leaf.path === LOGOUT_PATH
                  );
                  return (
                    <div
                      key={section.heading ?? i}
                      className="flex flex-col gap-1"
                    >
                      {i > 0 && (
                        <div
                          className="my-2 h-px bg-panel-border"
                          aria-hidden="true"
                        />
                      )}
                      {item.path === "/profile" && isLogoutSection ? (
                        <>
                          <ColorModeToggle className="px-0" />
                          <div
                            className="my-2 h-px bg-panel-border"
                            aria-hidden="true"
                          />
                        </>
                      ) : null}
                      {section.items.map((leaf) => {
                        const LeafIcon = leaf.icon;
                        return (
                          <NavLink
                            key={leaf.path}
                            to={leaf.path}
                            tabIndex={open ? undefined : -1}
                            className={({ isActive: leafActive }) =>
                              cn(
                                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted",
                                leafActive &&
                                  "bg-accent font-medium text-accent-foreground hover:bg-accent"
                              )
                            }
                          >
                            {LeafIcon && (
                              <LeafIcon
                                className="h-4 w-4 shrink-0 text-foreground"
                                strokeWidth={1.75}
                              />
                            )}
                            <span className="min-w-0 flex-1 truncate">
                              {leaf.label}
                            </span>
                          </NavLink>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const separator = (
    <div className="my-3 shrink-0 px-3" aria-hidden="true">
      {/* Collapsed rule spans the icon slot exactly, so it stays inside the rail. */}
      <div
        className="h-px bg-panel-border"
        style={{
          width: expanded ? "100%" : 40,
          transition: widthTransition,
        }}
      />
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        className="relative h-full shrink-0 overflow-hidden"
        style={{
          width: expanded ? EXPANDED_NAV_WIDTH : RAIL_WIDTH,
          transition: widthTransition,
        }}
      >
        <nav
          data-slot="app-nav"
          className="flex h-full flex-col overflow-hidden border-r border-panel-border bg-panel pb-4 text-panel-foreground"
          style={{ width: EXPANDED_NAV_WIDTH }}
        >
          {/* Inner stays full expanded width so icons never shift while the outer clips. */}
          <div
            className="flex h-full flex-col"
            style={{ width: EXPANDED_NAV_WIDTH }}
          >
            {/* h-14 matches the top bar / detail headers, and the 40px slot the
                icon rows, so the mark never moves between views. */}
            <div className="flex h-14 shrink-0 items-center px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center">
                <WingifyLogoButton />
              </span>
            </div>

            <div className="mt-5 flex shrink-0 flex-col gap-0.5 px-3">
              {group1.map((i) => renderItem(i))}
            </div>
            {separator}
            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {group2.map((i) => renderItem(i))}
              {unpinned.length > 0 && (
                <>
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: expanded ? "1fr" : "0fr",
                      opacity: expanded ? 1 : 0,
                      transition: accordionTransition,
                    }}
                    aria-hidden={!expanded}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="px-2.5 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        More
                      </div>
                      {unpinned.map((i) => renderItem(i, true))}
                    </div>
                  </div>
                  <div
                    className="grid"
                    style={{
                      gridTemplateRows: expanded ? "0fr" : "1fr",
                      opacity: expanded ? 0 : 1,
                      transition: accordionTransition,
                    }}
                    aria-hidden={expanded}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <button
                        type="button"
                        aria-label="More navigation items"
                        tabIndex={expanded ? -1 : undefined}
                        onClick={(e) => openMoreFlyout(e.currentTarget)}
                        onMouseEnter={(e) => openMoreFlyout(e.currentTarget)}
                        onMouseLeave={scheduleMoreClose}
                        onFocus={(e) => openMoreFlyout(e.currentTarget)}
                        onBlur={scheduleMoreClose}
                        className={cn(
                          "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted",
                          !!moreFlyout && "bg-muted"
                        )}
                      >
                        <MoreHorizontal
                          className="h-5 w-5"
                          strokeWidth={1.75}
                        />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            {separator}
            <div className="flex shrink-0 flex-col gap-0.5 px-3">
              {group3.map((i) => renderItem(i))}
            </div>
          </div>
        </nav>

        {!expanded && flyout && flyoutItem?.sections && (
          <div
            ref={flyoutRef}
            className="fixed z-40 animate-scale-in pl-1.5 duration-150"
            style={{ left: RAIL_WIDTH, top: flyout.top }}
            onMouseEnter={() => {
              cancelClose();
              if (flyoutItem) previewMascotFor(flyoutItem);
            }}
            onMouseLeave={scheduleClose}
          >
            {flyoutItem.path === "/profile" ? (
              <ProfileMenuPanel
                item={flyoutItem}
                onRequestClose={() => setFlyout(null)}
              />
            ) : (
              <SubNavPanel
                item={flyoutItem}
                variant="flyout"
                onRequestClose={() => setFlyout(null)}
              />
            )}
          </div>
        )}

        {!expanded && moreFlyout && unpinned.length > 0 && (
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
                    onMouseEnter={(e) => {
                      previewMascotFor(item);
                      revealMoreNested(item, e.currentTarget);
                    }}
                    onFocus={(e) => {
                      previewMascotFor(item);
                      revealMoreNested(item, e.currentTarget);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-sm pr-1.5 transition-colors hover:bg-muted",
                      moreNestedItem?.path === item.path && "bg-muted"
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
                      <Icon className="h-4 w-4 shrink-0 text-foreground" />
                      <span className="flex-1 truncate font-main-menu">{item.label}</span>
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

        {!expanded && moreFlyout && moreNested && moreNestedItem?.sections && (
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

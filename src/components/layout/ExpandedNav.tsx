/*
 * Change summary: expand/collapse is a dwell-armed full-height seam on the nav
 * edge (click or drag). Overflow products live under "Other". Profile row shows
 * Bottom utility bar (Avatar · Settings · Help · Activity from the avatar):
 * vertical when collapsed, one icon row when expanded; label tooltip on hover,
 * panels on click.
 * Sub-nav rows also highlight on their page-tab pages (leafOwnsPath from lib/nav).
 * Suites (Analytics): SuiteProductSwitcher above the accordion, showing only the active product's pages.
 * Locked rail (`forceCollapsed`, e.g. Settings / Configuration / Upgrade): empty gutter is inert.
 * Settings gear + Profile avatar open their menus on hover (close on leave, like products) and
 * show no name tooltip; click still opens. Previous click-to-toggle kept as @undo.
 * Activity / Help tooltips hide immediately on click and stay hidden until the pointer leaves.
 * Expanded nav: the Settings menu opens above the gear (not to the right over the other icons).
 * Docked sub-nav rows (pages, accordion parents, nested children) show the leaf's nav icon via
 * SubNavPanel's `LeafIcon` (reused, same as the flyout).
 */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as HoverCard from "@radix-ui/react-hover-card";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ChevronDown,
  Crown,
  ExternalLink,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "@/components/icons/protoLucide";
import {
  leafLandPath,
  visibleNav,
  type NavItem,
  type NavSection,
} from "../../config/navigation";
import {
  activeProductIndex,
  findItemByPath,
  firstChildPath,
  leafOwnsPath,
  RAIL_WIDTH,
  suiteProducts,
} from "../../lib/nav";
import SuiteProductSwitcher from "./SuiteProductSwitcher";
import { GET_STARTED_PATH, isGetStartedHomeLeaf } from "@/lib/getStartedGate";
import {
  useGetStartedNavLockTooltip,
  useIsGetStartedLocked,
} from "@/store/getStartedOnboarding";
import { canUnpinPath, useUIStore } from "../../store/ui";
import { cn } from "../../lib/utils";
import { IconVariantOverride } from "../icons/IconLibraryProvider";
import SubNavPanel, { LeafIcon, toSentenceCase } from "./SubNavPanel";
import ProfileMenuPanel from "./ProfileMenuPanel";
import OldNavFeedbackDialog from "./OldNavFeedbackDialog";
import ActivityOverviewPopover from "./ActivityOverviewPopover";
import HelpSupportPopover from "./HelpSupportPopover";
import WingifyLogoButton from "./WingifyLogoButton";
import ProfileAvatar from "./ProfileAvatar";
import { useProfileSubmenuStore } from "@/store/profileSubmenu";

/** Bottom rail icons (order remapped for collapsed vs expanded). */
const UTILITY_BAR_PATHS = [
  "/activity-timeline",
  "/settings",
  "/helpdesk",
  "/profile",
] as const;

/** Collapsed (top → bottom): Activity → Help → Settings → Avatar. */
const UTILITY_ORDER_COLLAPSED = [
  "/activity-timeline",
  "/helpdesk",
  "/settings",
  "/profile",
] as const;

/** Expanded (left → right): Avatar → Settings → Help → Activity. */
const UTILITY_ORDER_EXPANDED = [
  "/profile",
  "/settings",
  "/helpdesk",
  "/activity-timeline",
] as const;

type FlyoutState = {
  path: string;
  top: number;
  /** Icon bottom — used when placement is "above" / "right-end". */
  anchorBottom?: number;
  left?: number;
  /**
   * above = utility bar expanded; right = product / default utility;
   * right-end = Settings — to the right, bottom-aligned to the icon.
   */
  placement: "right" | "above" | "right-end";
};

/** Suite items (Analytics) get the product switcher above their pages; other items render as-is. */
function SuiteSections({
  products,
  activeIndex,
  tabIndex,
  children,
}: {
  products: NavSection[] | null;
  activeIndex: number;
  tabIndex?: number;
  children: ReactNode;
}) {
  if (!products) return <>{children}</>;
  return (
    <SuiteProductSwitcher
      products={products}
      activeIndex={activeIndex}
      tabIndex={tabIndex}
    >
      {/* Pages keep the accordion's indent + guide line under the full-width switcher. */}
      <div className="ml-[14px] flex flex-col border-l border-panel-border pl-3">
        {children}
      </div>
    </SuiteProductSwitcher>
  );
}

/** Width of the expanded (labeled) navigation sidebar — shared with the app grid. */
export const EXPANDED_NAV_WIDTH = 240;

/** Collapsed icon hit-target (px). Sized for RAIL_WIDTH 56 with px-2 gutters. */
const RAIL_ICON_SLOT = 40;

const FLYOUT_CLOSE_GRACE_MS = 120;
const MORE_CLOSE_GRACE_MS = 150;
const FLYOUT_VIEWPORT_MARGIN = 8;
const MORE_FLYOUT_WIDTH = 248;
/** Horizontal gap between rail ↔ flyout and Other ↔ nested. -1 overlaps borders. */
const FLYOUT_PANEL_GAP_PX = -1;
/** Rail ↔ expanded morph — keep label/accordion timing in sync. */
const WIDTH_MS = 280;
const WIDTH_EASE = "var(--ease-smooth)";
const widthTransition = `width ${WIDTH_MS}ms ${WIDTH_EASE}`;
const revealTransition = `opacity ${WIDTH_MS}ms ${WIDTH_EASE}, transform ${WIDTH_MS}ms ${WIDTH_EASE}`;
const accordionTransition = `grid-template-rows ${WIDTH_MS}ms ${WIDTH_EASE}, opacity ${WIDTH_MS}ms ${WIDTH_EASE}`;

const tooltipContentClass =
  "z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md";

/** Seam cursor: vertical line with left + right arrows. Hotspot at center. */
const SEAM_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
    <g stroke="#fff" stroke-width="3.25" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 5v22"/>
      <path d="M12 16H5M8 12.5 5 16l3 3.5"/>
      <path d="M20 16h7M24 12.5 27 16l-3 3.5"/>
    </g>
    <g stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M16 5v22"/>
      <path d="M12 16H5M8 12.5 5 16l3 3.5"/>
      <path d="M20 16h7M24 12.5 27 16l-3 3.5"/>
    </g>
  </svg>`
)}") 16 16, col-resize`;

/** Dwell before showing the blue line + custom cursor on the seam. */
/** Short dwell; pass-by is filtered by resetting when the pointer keeps moving. */
const SEAM_HOVER_DELAY_MS = 50;

function withNavLockTooltip(
  node: ReactElement,
  tooltip: string | null,
  enabled: boolean
): ReactElement {
  if (!enabled || !tooltip) return node;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{node}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className={cn(tooltipContentClass, "max-w-[240px]")}
        >
          {tooltip}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

type ClampedFlyoutPos = {
  top: number;
  left?: number;
  anchorBottom?: number;
  placement?: "right" | "above" | "right-end";
};

function useClampedFlyoutPosition(
  ref: { current: HTMLDivElement | null },
  state: ClampedFlyoutPos | null
) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !state) return;

    const height = el.offsetHeight;
    const width = el.offsetWidth;
    const gap = 8;

    if (state.placement === "above") {
      // Sit above the icon; left edge aligns with icon’s left.
      const anchorBottom =
        typeof state.anchorBottom === "number"
          ? state.anchorBottom
          : state.top;
      let bottom = window.innerHeight - anchorBottom + gap;
      // Prefer keeping the panel fully above the icon; clamp into the viewport.
      const topEdge = window.innerHeight - bottom - height;
      if (topEdge < FLYOUT_VIEWPORT_MARGIN) {
        bottom = window.innerHeight - height - FLYOUT_VIEWPORT_MARGIN;
      }
      const left = Math.max(
        FLYOUT_VIEWPORT_MARGIN,
        Math.min(
          state.left ?? FLYOUT_VIEWPORT_MARGIN,
          window.innerWidth - width - FLYOUT_VIEWPORT_MARGIN
        )
      );
      el.style.top = "auto";
      el.style.bottom = `${bottom}px`;
      el.style.left = `${left}px`;
      return;
    }

    if (state.placement === "right-end") {
      // Right of icon, bottom edge aligned to icon bottom (bottom-right anchor).
      const anchorBottom =
        typeof state.anchorBottom === "number"
          ? state.anchorBottom
          : state.top;
      let top = anchorBottom - height;
      top = Math.max(
        FLYOUT_VIEWPORT_MARGIN,
        Math.min(top, window.innerHeight - height - FLYOUT_VIEWPORT_MARGIN)
      );
      const left = Math.max(
        FLYOUT_VIEWPORT_MARGIN,
        Math.min(
          (state.left ?? FLYOUT_VIEWPORT_MARGIN) + gap,
          window.innerWidth - width - FLYOUT_VIEWPORT_MARGIN
        )
      );
      el.style.bottom = "auto";
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      return;
    }

    // Right of icon — no top/bottom edge lock; keep top near the icon.
    el.style.bottom = "auto";
    const maxTop = window.innerHeight - height - FLYOUT_VIEWPORT_MARGIN;
    el.style.top = `${Math.max(
      FLYOUT_VIEWPORT_MARGIN,
      Math.min(state.top, maxTop)
    )}px`;
    if (typeof state.left === "number") {
      el.style.left = `${Math.max(
        FLYOUT_VIEWPORT_MARGIN,
        Math.min(
          state.left,
          window.innerWidth - width - FLYOUT_VIEWPORT_MARGIN
        )
      )}px`;
    }
  }, [ref, state]);
}

/**
 * Single sidebar for AppLayout: width morphs between rail and expanded.
 * Inner content stays EXPANDED_NAV_WIDTH so icons keep the same x-position;
 * the outer clips when collapsed. Collapsed mode uses hover flyouts; expanded
 * mode uses accordion sub-nav. Profile (`flyoutOnly` + sections) always uses a
 * floating ProfileMenuPanel — never the inline accordion.
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
  const toggleDock = useUIStore((s) => s.toggleDock);
  const setDocked = useUIStore((s) => s.setDocked);
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const pin = useUIStore((s) => s.pin);
  const unpin = useUIStore((s) => s.unpin);
  const canUnpin = (path: string) => canUnpinPath(pinnedPaths, path);
  const nav = visibleNav();
  const navLocked = useIsGetStartedLocked();
  const lockTooltip = useGetStartedNavLockTooltip();
  const profileSubmenuOpen = useProfileSubmenuStore((s) => s.openCount > 0);

  const expanded = !forceCollapsed && isDocked;
  const activeItem = findItemByPath(pathname);
  const [openPath, setOpenPath] = useState<string | null>(() =>
    activeItem?.sections ? activeItem.path : null
  );
  const [openSubPath, setOpenSubPath] = useState<string | null>(null);
  // Utility-bar tooltips (Activity / Help): hidden on click until the pointer leaves the icon.
  const [utilityTooltipPath, setUtilityTooltipPath] = useState<string | null>(null);
  const [utilityTooltipMuted, setUtilityTooltipMuted] = useState<string | null>(null);

  // Hover flyouts (collapsed products) + click flyouts (utility bar).
  const [flyout, setFlyout] = useState<FlyoutState | null>(null);
  const [oldNavFeedbackOpen, setOldNavFeedbackOpen] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const [moreFlyout, setMoreFlyout] = useState<{ top: number } | null>(null);
  const [moreNested, setMoreNested] = useState<{
    path: string;
    top: number;
  } | null>(null);
  /** Expanded-rail More accordion — collapsed by default. */
  const [moreOpen, setMoreOpen] = useState(false);
  const moreCloseTimer = useRef<number | undefined>(undefined);
  const moreFlyoutRef = useRef<HTMLDivElement>(null);
  const moreNestedRef = useRef<HTMLDivElement>(null);
  /** Seam drag: expand/collapse when the pointer crosses a horizontal threshold. */
  const seamDragRef = useRef<{
    pointerId: number;
    startX: number;
    startDocked: boolean;
    didDrag: boolean;
  } | null>(null);
  const seamHoverTimer = useRef<number | undefined>(undefined);
  const seamHoverOrigin = useRef<{ x: number; y: number } | null>(null);
  const [seamDragging, setSeamDragging] = useState(false);
  /** True after dwelling still on the seam — unlocks cursor, line, click/drag. */
  const [seamArmed, setSeamArmed] = useState(false);
  const seamActive = seamArmed || seamDragging;

  const armSeamAfterDwell = (x: number, y: number) => {
    window.clearTimeout(seamHoverTimer.current);
    seamHoverOrigin.current = { x, y };
    seamHoverTimer.current = window.setTimeout(() => {
      setSeamArmed(true);
    }, SEAM_HOVER_DELAY_MS);
  };

  useEffect(() => {
    if (!seamDragging) return;
    const prev = document.body.style.cursor;
    document.body.style.cursor = SEAM_CURSOR;
    return () => {
      document.body.style.cursor = prev;
    };
  }, [seamDragging]);

  useEffect(() => {
    return () => window.clearTimeout(seamHoverTimer.current);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    // Accordion: open the active product's sub-nav; close when on a direct item.
    // Profile is flyout-only — never pin it open as an inline accordion.
    const accordionItem =
      activeItem?.sections && !activeItem.flyoutOnly ? activeItem : null;
    setOpenPath(accordionItem ? accordionItem.path : null);
    if (accordionItem?.sections) {
      let match: string | null = null;
      for (const section of accordionItem.sections) {
        for (const leaf of section.items) {
          if (
            leaf.items?.length &&
            leaf.items.some(
              (c) =>
                pathname === c.path || pathname.startsWith(c.path + "/")
            )
          ) {
            match = leaf.path;
          }
        }
      }
      setOpenSubPath(match);
    } else {
      setOpenSubPath(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem?.path, expanded, pathname]);

  useEffect(() => {
    if (expanded) {
      setFlyout(null);
      setMoreFlyout(null);
      setMoreNested(null);
      setMoreOpen(false);
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
  };
  const scheduleMoreClose = () => {
    window.clearTimeout(moreCloseTimer.current);
    moreCloseTimer.current = window.setTimeout(closeMore, MORE_CLOSE_GRACE_MS);
  };
  const cancelMoreClose = () => window.clearTimeout(moreCloseTimer.current);

  const openFlyout = (item: NavItem, target: HTMLElement) => {
    // Settings/Profile float in both modes; product flyouts are collapsed-only.
    if (expanded && !(item.flyoutOnly && item.sections)) return;
    if (navLocked && item.path !== "/home") return;
    if (!item.sections?.length) return;
    window.clearTimeout(closeTimer.current);
    closeMore();
    const rect = target.getBoundingClientRect();
    const isUtility = (UTILITY_BAR_PATHS as readonly string[]).includes(
      item.path
    );

    // Settings (collapsed rail): bottom-right of the gear (right of icon, bottom-aligned).
    // Expanded (horizontal icons) falls through to "above" so it never covers neighbouring icons.
    if (item.path === "/settings" && !expanded) {
      setFlyout({
        path: item.path,
        top: rect.top,
        anchorBottom: rect.bottom,
        left: rect.right,
        placement: "right-end",
      });
      return;
    }

    // Expanded (horizontal icons): open above, left-aligned to the icon.
    // Collapsed (vertical icons): open to the right of the icon.
    if (isUtility && expanded) {
      setFlyout({
        path: item.path,
        top: rect.top,
        anchorBottom: rect.top,
        left: rect.left,
        placement: "above",
      });
      return;
    }
    setFlyout({
      path: item.path,
      top: rect.top,
      left: isUtility ? rect.right + 8 : undefined,
      placement: "right",
    });
  };

  const toggleFlyout = (item: NavItem, target: HTMLElement) => {
    if (flyout?.path === item.path) {
      setFlyout(null);
      return;
    }
    openFlyout(item, target);
  };

  const scheduleClose = () => {
    if (profileSubmenuOpen) return;
    // @undo — Settings/Profile used to stay open until click-out (now hover menus like products):
    // if (flyout?.path === "/profile" || flyout?.path === "/settings") return;
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setFlyout(null);
    }, FLYOUT_CLOSE_GRACE_MS);
  };
  const cancelClose = () => window.clearTimeout(closeTimer.current);

  useEffect(() => {
    if (profileSubmenuOpen) cancelClose();
  }, [profileSubmenuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMore();
        setFlyout(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(moreCloseTimer.current);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  // Settings/Profile flyouts: click-outside dismisses the floating panel.
  useEffect(() => {
    if (
      !flyout ||
      (flyout.path !== "/profile" && flyout.path !== "/settings")
    ) {
      return;
    }
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!(target instanceof Element) && !(target instanceof Node)) return;
      if (flyoutRef.current?.contains(target)) return;
      const row = document.querySelector(`[data-nav-item="${flyout.path}"]`);
      if (row?.contains(target)) return;
      // Language / Notifications popovers portal outside the flyout.
      if (
        target instanceof Element &&
        target.closest("[data-profile-submenu]")
      ) {
        return;
      }
      setFlyout(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expanded, flyout]);

  useClampedFlyoutPosition(flyoutRef, flyout);
  useClampedFlyoutPosition(moreFlyoutRef, moreFlyout);
  useClampedFlyoutPosition(moreNestedRef, moreNested);

  const isVisible = (i: NavItem) => !i.pinnable || pinnedPaths.includes(i.path);
  // Welcome preview: real rail chrome, but product links have not appeared yet —
  // only Help + Profile (group 3) stay active.
  const welcomeChrome = pathname === "/design/welcome-start";
  const group1 = welcomeChrome
    ? []
    : nav.filter((i) => i.group === 1 && isVisible(i));
  const group2 = welcomeChrome
    ? []
    : nav.filter((i) => i.group === 2 && isVisible(i));
  const group3 = welcomeChrome
    ? nav.filter(
        (i) =>
          i.group === 3 &&
          (i.path === "/helpdesk" ||
            i.path === "/profile" ||
            i.path === "/settings")
      )
    : nav.filter((i) => i.group === 3);
  const utilityOrder = expanded
    ? UTILITY_ORDER_EXPANDED
    : UTILITY_ORDER_COLLAPSED;
  const utilityItems = utilityOrder
    .map((path) => group3.find((i) => i.path === path))
    .filter((i): i is NavItem => Boolean(i));

  /** FLIP: animate utility icons between vertical ↔ horizontal slots. */
  const utilityFlipRefs = useRef(new Map<string, HTMLElement | null>());
  const utilityPrevRects = useRef(new Map<string, DOMRect>());
  const utilityExpandedRef = useRef(expanded);

  useLayoutEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nextRects = new Map<string, DOMRect>();
    for (const [path, el] of utilityFlipRefs.current) {
      if (el) nextRects.set(path, el.getBoundingClientRect());
    }

    const orientationChanged = utilityExpandedRef.current !== expanded;
    utilityExpandedRef.current = expanded;

    if (orientationChanged && !reduceMotion) {
      for (const [path, el] of utilityFlipRefs.current) {
        if (!el) continue;
        const first = utilityPrevRects.current.get(path);
        const last = nextRects.get(path);
        if (!first || !last) continue;
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx === 0 && dy === 0) continue;
        el.style.transition = "none";
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      // Force layout so the browser commits the inverted positions.
      void document.body.offsetHeight;

      for (const [, el] of utilityFlipRefs.current) {
        if (!el?.style.transform) continue;
        el.style.transition = `transform ${WIDTH_MS}ms ${WIDTH_EASE}`;
        el.style.transform = "translate(0, 0)";
      }

      const clearId = window.setTimeout(() => {
        for (const [, el] of utilityFlipRefs.current) {
          if (!el) continue;
          el.style.transition = "";
          el.style.transform = "";
        }
      }, WIDTH_MS + 50);

      utilityPrevRects.current = nextRects;
      return () => window.clearTimeout(clearId);
    }

    utilityPrevRects.current = nextRects;
  }, [expanded, utilityItems]);

  const unpinned = welcomeChrome
    ? []
    : nav.filter((i) => i.pinnable && !pinnedPaths.includes(i.path));
  /** Current route lives under an unpinned product — select it in More / … */
  const unpinnedActivePath = unpinned.find(
    (i) => activeItem?.path === i.path
  )?.path;

  const flyoutItem = flyout
    ? nav.find((i) => i.path === flyout.path)
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
    const navDisabled = navLocked && item.path !== "/home";

    const iconTone =
      isActive && !expanded
        ? "text-rail-active-foreground"
        : "text-foreground";
    const ActiveIcon = item.activeIcon;
    const iconEl = (
      <Icon
        className={cn("h-4 w-4 shrink-0", iconTone)}
        strokeWidth={1.75}
      />
    );
    const leadingIcon = item.initials ? (
      <ProfileAvatar
        initials={item.initials}
        size="sm"
        onDark={isActive && !expanded}
        showUnreadDot={false}
      />
    ) : isActive && ActiveIcon ? (
      <ActiveIcon className={cn("h-4 w-4 shrink-0", iconTone)} />
    ) : isActive ? (
      <IconVariantOverride libraryId="phosphor" variant="fill">
        {iconEl}
      </IconVariantOverride>
    ) : (
      iconEl
    );

    const row = (
      <div
        data-nav-item={item.path}
        className={cn(
          "group flex items-center gap-0.5 rounded-md transition-[background-color,color,width] duration-[280ms] hover:bg-muted",
          // Collapsed rows clamp to the icon so the active pill can't bleed past the rail.
          // Expanded: 4px inset inside selection → icon/chevron sit 16px from nav
          // (12px container + 4px).
          expanded ? "w-full" : "w-9 justify-start",
          isActive && expanded && !hasSections && "bg-accent hover:bg-accent",
          isActive &&
            !expanded &&
            "bg-rail-active text-rail-active-foreground hover:bg-rail-active",
          expandOnly &&
            flyout?.path === item.path &&
            "bg-muted hover:bg-muted",
          navDisabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
        )}
        onMouseEnter={(e) => {
          if (navDisabled) return;
          // Product flyouts: hover when collapsed. Settings/Profile: click only.
          if (expandOnly) return;
          if (!expanded && !tooltipOnly) {
            openFlyout(item, e.currentTarget);
          }
        }}
        onMouseLeave={() => {
          if (expandOnly) return;
          if (!expanded && !tooltipOnly) scheduleClose();
        }}
        onFocus={(e) => {
          if (navDisabled) return;
          if (expandOnly) return;
          if (!expanded && !tooltipOnly) {
            openFlyout(item, e.currentTarget);
          }
        }}
        onBlur={() => {
          if (expandOnly) return;
          if (!expanded && !tooltipOnly) scheduleClose();
        }}
      >
        <button
          type="button"
          aria-label={item.label}
          aria-expanded={expandOnly ? flyout?.path === item.path : undefined}
          onClick={(e) => {
            if (navDisabled) return;
            if (tooltipOnly) return;
            if (expandOnly) {
              const rowEl = (e.currentTarget as HTMLElement).closest(
                "[data-nav-item]"
              ) as HTMLElement | null;
              if (rowEl) toggleFlyout(item, rowEl);
              return;
            }
            if (navLocked && item.path === "/home") {
              navigate(GET_STARTED_PATH);
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
            "flex h-9 shrink-0 items-center gap-2 text-sm outline-none",
            // Collapsed: the label + gap overflow the icon box, so centering
            // would pull the icon left. Start-align and let it spill right.
            // No left padding when expanded: the icon slot must sit at the same
            // x in both states so nothing shifts while the width animates.
            expanded
              ? "min-w-0 flex-1 text-left text-foreground"
              : "w-9 justify-start overflow-hidden",
            isActive && expanded && "font-medium"
          )}
        >
          {/* Same 36px slot in both states so glyphs don't resize or slide. */}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center">
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
                    ? `Show ${item.label} in sidebar`
                    : `Hide ${item.label} from sidebar`
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
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="bottom"
                sideOffset={4}
                className={tooltipContentClass}
              >
                {inMore ? "Show in sidebar" : "Hide from sidebar"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}

        {hasSections && !expandOnly && (
          <button
            type="button"
            aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
            onClick={() => {
              if (!expanded) return;
              setOpenPath(open ? null : item.path);
            }}
            className={cn(
              chromeClass,
              // Icon-sized control so glyph sits 16px from nav edge (12px + 4px).
              "flex size-4 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
            )}
            style={{ transition: revealTransition }}
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-[280ms]",
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
    if (navDisabled && lockTooltip) {
      hoverRow = withNavLockTooltip(row, lockTooltip, true);
    } else if (
      !expanded &&
      !inMore &&
      !hasSections &&
      item.path !== "/activity-timeline"
    ) {
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
                  aria-label={`Hide ${item.label} from sidebar`}
                  onClick={(e) => {
                    e.stopPropagation();
                    unpin(item.path);
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <EyeOff className="h-3 w-3" />
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

    // Bottom utility bar renders Activity / Settings / Help / Profile.
    if ((UTILITY_BAR_PATHS as readonly string[]).includes(item.path)) {
      return null;
    }

    const products = suiteProducts(item);
    const activeProduct = products ? activeProductIndex(products, pathname) : 0;
    const visibleSections = products
      ? [products[activeProduct]]
      : item.sections ?? [];

    return (
      <div key={item.path}>
        {hoverRow}

        {hasSections && item.sections && !expandOnly && (
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
              <div
                className={cn(
                  "mt-1.5 flex flex-col pb-2",
                  products
                    ? "pl-2"
                    : "ml-[22px] border-l border-panel-border pl-3"
                )}
              >
                <SuiteSections
                  products={products}
                  activeIndex={activeProduct}
                  tabIndex={open ? undefined : -1}
                >
                {visibleSections.map((section, i) => {
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
                      {/* Same label treatment as the flyout (SubNavPanel) so both states match. */}
                      {!products && section.heading ? (
                        <div className="px-2.5 pb-0.5 pt-0.5 text-sm font-normal text-muted-foreground">
                          {toSentenceCase(section.heading)}
                        </div>
                      ) : null}
                      {section.items.map((leaf) => {
                        const hasChildren = !!leaf.items?.length;
                        const subOpen = openSubPath === leaf.path;

                        if (hasChildren) {
                          const childActive = leaf.items!.some(
                            (c) =>
                              pathname === c.path ||
                              pathname.startsWith(c.path + "/")
                          );
                          return (
                            <div key={leaf.path}>
                              <div className="flex items-center gap-1 rounded-md pr-0.5 hover:bg-muted">
                                <button
                                  type="button"
                                  tabIndex={open ? undefined : -1}
                                  onClick={() => {
                                    setOpenSubPath(subOpen ? null : leaf.path);
                                    if (!subOpen) navigate(leafLandPath(leaf));
                                  }}
                                  className={cn(
                                    "flex min-w-0 flex-1 items-center gap-3 px-2.5 py-2 text-left text-sm text-foreground outline-none",
                                    childActive && "font-medium"
                                  )}
                                >
                                  <LeafIcon leaf={leaf} />
                                  <span className="min-w-0 flex-1 truncate">
                                    {leaf.label}
                                  </span>
                                  {leaf.badge === "premium" && (
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                                      <Crown className="size-3" aria-hidden />
                                    </span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  tabIndex={open ? undefined : -1}
                                  aria-label={
                                    subOpen
                                      ? `Collapse ${leaf.label}`
                                      : `Expand ${leaf.label}`
                                  }
                                  onClick={() =>
                                    setOpenSubPath(subOpen ? null : leaf.path)
                                  }
                                  className="shrink-0 rounded-sm p-1 text-muted-foreground hover:text-foreground"
                                >
                                  <ChevronDown
                                    className={cn(
                                      "h-4 w-4 transition-transform duration-[280ms]",
                                      subOpen && "rotate-180"
                                    )}
                                  />
                                </button>
                              </div>
                              {subOpen && (
                                <div className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-panel-border pb-1 pl-2.5">
                                  {leaf.items!.map((child) => {
                                    if (child.external) {
                                      return (
                                        <a
                                          key={child.path}
                                          href={child.path}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          tabIndex={open ? undefined : -1}
                                          className="flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-muted"
                                        >
                                          <LeafIcon leaf={child} />
                                          <span className="min-w-0 flex-1 truncate">
                                            {child.label}
                                          </span>
                                          <ExternalLink
                                            className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                                            aria-hidden
                                          />
                                        </a>
                                      );
                                    }
                                    return (
                                      <NavLink
                                        key={child.path}
                                        to={child.path}
                                        tabIndex={open ? undefined : -1}
                                        className={({ isActive: childIsActive }) =>
                                          cn(
                                            "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-foreground hover:bg-muted",
                                            childIsActive &&
                                              "bg-accent font-medium text-accent-foreground hover:bg-accent"
                                          )
                                        }
                                      >
                                        <LeafIcon leaf={child} />
                                        <span className="min-w-0 flex-1 truncate">
                                          {child.label}
                                        </span>
                                      </NavLink>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          (() => {
                            const leafDisabled =
                              navLocked && !isGetStartedHomeLeaf(leaf.path);
                            const leafContent = (
                              <>
                                <LeafIcon leaf={leaf} />
                                <span className="min-w-0 flex-1 truncate">
                                  {leaf.label}
                                </span>
                                {leaf.badge === "premium" && (
                                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                                    <Crown className="size-3" aria-hidden />
                                  </span>
                                )}
                              </>
                            );

                            if (leafDisabled) {
                              return (
                                <div key={leaf.path}>
                                  {withNavLockTooltip(
                                    <span
                                      aria-disabled="true"
                                      className="flex cursor-not-allowed items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground opacity-40"
                                    >
                                      {leafContent}
                                    </span>,
                                    lockTooltip,
                                    true
                                  )}
                                </div>
                              );
                            }

                            return (
                              <NavLink
                                key={leaf.path}
                                to={leaf.path}
                                tabIndex={open ? undefined : -1}
                                className={({ isActive: leafActive }) =>
                                  cn(
                                    "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted",
                                    (leafActive || leafOwnsPath(leaf, pathname)) &&
                                      "bg-accent font-medium text-accent-foreground hover:bg-accent"
                                  )
                                }
                              >
                                {leafContent}
                              </NavLink>
                            );
                          })()
                        );
                      })}
                    </div>
                  );
                })}
                </SuiteSections>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const separator = (
    <div
      className="my-2.5 shrink-0 px-2"
      aria-hidden="true"
    >
      {/* Collapsed rule spans the icon slot exactly, so it stays inside the rail. */}
      <div
        className="h-px bg-panel-border"
        style={{
          width: expanded ? "100%" : RAIL_ICON_SLOT,
          transition: widthTransition,
        }}
      />
    </div>
  );

  return (
    <Tooltip.Provider delayDuration={300} skipDelayDuration={100}>
      <div
        className="group/nav relative h-full shrink-0"
        style={{
          width: expanded ? EXPANDED_NAV_WIDTH : RAIL_WIDTH,
          transition: widthTransition,
        }}
      >
        <div className="h-full overflow-hidden">
        <nav
          data-slot="app-nav"
          className="flex h-full flex-col overflow-hidden border-r border-panel-border bg-panel text-panel-foreground"
          style={{ width: EXPANDED_NAV_WIDTH }}
        >
          {/* Inner stays full expanded width so icons never shift while the outer clips. */}
          <div
            className="flex h-full flex-col"
            style={{ width: EXPANDED_NAV_WIDTH }}
          >
            {/* h-[56px] matches the top bar. 8px inset keeps the icon slot
                centered in the 56px rail in both states. */}
            <div className="flex h-[56px] shrink-0 items-center px-2">
              <WingifyLogoButton showWordmark={expanded} />
            </div>

            {!welcomeChrome && (
              <div
                className="mt-4 flex shrink-0 flex-col gap-0.5 px-2"
              >
                {group1.map((i) => renderItem(i))}
              </div>
            )}
            {!welcomeChrome && separator}
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                "px-2",
                welcomeChrome && "mt-4"
              )}
            >
              <div className="flex shrink-0 flex-col gap-0.5">
                {!welcomeChrome && group2.map((i) => renderItem(i))}
                {!welcomeChrome && unpinned.length > 0 && (
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
                        <button
                          type="button"
                          aria-expanded={moreOpen}
                          aria-label={
                            moreOpen ? "Collapse Other" : "Expand Other"
                          }
                          tabIndex={expanded ? undefined : -1}
                          onClick={() => setMoreOpen((open) => !open)}
                          className={cn(
                            "mt-3 flex w-full items-center gap-0.5 rounded-md px-0 py-0 text-left hover:bg-muted",
                            !!unpinnedActivePath && !moreOpen && "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-9 min-w-0 flex-1 items-center gap-2 text-sm",
                              unpinnedActivePath
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                              <MoreHorizontal
                                className="h-4 w-4"
                                strokeWidth={1.75}
                              />
                            </span>
                            <span className="font-medium">Other</span>
                          </span>
                          <span className="flex size-4 shrink-0 items-center justify-center text-muted-foreground">
                            <ChevronDown
                              className={cn(
                                "size-4 transition-transform duration-[280ms]",
                                moreOpen && "rotate-180"
                              )}
                            />
                          </span>
                        </button>
                        <div
                          className="grid"
                          style={{
                            gridTemplateRows: moreOpen ? "1fr" : "0fr",
                            opacity: moreOpen ? 1 : 0,
                            transition: accordionTransition,
                          }}
                          aria-hidden={!moreOpen}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="flex flex-col gap-0.5 pb-1">
                              {unpinned.map((i) => renderItem(i, true))}
                            </div>
                          </div>
                        </div>
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
                          aria-label="Other products"
                          tabIndex={expanded ? -1 : undefined}
                          onClick={(e) => openMoreFlyout(e.currentTarget)}
                          onMouseEnter={(e) => openMoreFlyout(e.currentTarget)}
                          onMouseLeave={scheduleMoreClose}
                          onFocus={(e) => openMoreFlyout(e.currentTarget)}
                          onBlur={scheduleMoreClose}
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted",
                            unpinnedActivePath &&
                              "bg-rail-active text-rail-active-foreground hover:bg-rail-active",
                            !unpinnedActivePath && !!moreFlyout && "bg-muted"
                          )}
                        >
                          <MoreHorizontal
                            className="h-4 w-4"
                            strokeWidth={1.75}
                          />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* Empty rail gutter — click toggles expand/collapse (icons stay interactive). No hover tooltip.
                  Locked rails (forceCollapsed) get an inert spacer so the docked preference can't flip. */}
              {forceCollapsed ? (
                <div className="mt-1 min-h-0 w-full flex-1" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  aria-label={
                    expanded ? "Collapse navigation" : "Expand navigation"
                  }
                  aria-pressed={isDocked}
                  onClick={() => toggleDock()}
                  className="mt-1 min-h-0 w-full flex-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              )}
              {/* @undo — tooltip that wrapped the gutter button:
              <Tooltip.Root>
                <Tooltip.Trigger asChild>{gutter button}</Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" sideOffset={8} className={tooltipContentClass}>
                    {expanded ? "Collapse navigation" : "Expand navigation"}
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
              */}
            </div>
            <div className="mt-2.5 shrink-0 px-2" aria-hidden="true">
              <div
                className="h-px bg-panel-border"
                style={{
                  width: expanded ? "100%" : RAIL_ICON_SLOT,
                  transition: widthTransition,
                }}
              />
            </div>
            <div
              className={cn(
                "flex shrink-0 px-2 py-2",
                expanded
                  ? "flex-row items-center gap-0.5"
                  : "flex-col gap-1"
              )}
            >
              {utilityItems.map((item) => {
                const Icon = item.icon;
                const flyoutOpen = flyout?.path === item.path;
                const isHoverMenu =
                  item.path === "/settings" || item.path === "/profile";
                const iconButton = (
                  <button
                    type="button"
                    data-nav-item={item.path}
                    aria-label={item.label}
                    aria-expanded={
                      item.path === "/settings" || item.path === "/profile"
                        ? flyoutOpen
                        : undefined
                    }
                    // Settings / Profile are menus: open on hover (click still opens for keyboard / touch).
                    onMouseEnter={(e) => {
                      if (isHoverMenu) openFlyout(item, e.currentTarget);
                    }}
                    onMouseLeave={() => {
                      if (isHoverMenu) scheduleClose();
                    }}
                    onClick={(e) => {
                      if (isHoverMenu) openFlyout(item, e.currentTarget);
                    }}
                    /* @undo — click-to-toggle:
                    onClick={(e) => {
                      if (
                        item.path === "/settings" ||
                        item.path === "/profile"
                      ) {
                        toggleFlyout(item, e.currentTarget);
                      }
                    }}
                    */
                    className={cn(
                      "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted",
                      flyoutOpen && "bg-muted hover:bg-muted"
                    )}
                  >
                    {item.initials ? (
                      <ProfileAvatar initials={item.initials} size="sm" />
                    ) : (
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                );

                let control: ReactElement = iconButton;
                if (item.path === "/activity-timeline") {
                  control = (
                    <ActivityOverviewPopover
                      side={expanded ? "top" : "right"}
                      align="start"
                      openMode="click"
                    >
                      {iconButton}
                    </ActivityOverviewPopover>
                  );
                } else if (item.path === "/helpdesk") {
                  control = (
                    <HelpSupportPopover
                      side={expanded ? "top" : "right"}
                      align="start"
                      openMode="click"
                    >
                      {iconButton}
                    </HelpSupportPopover>
                  );
                }

                return (
                  <div
                    key={item.path}
                    ref={(el) => {
                      utilityFlipRefs.current.set(item.path, el);
                    }}
                    className="inline-flex will-change-transform"
                  >
                    {/* Hover menus (Settings / Profile) open their panel on hover — no name tooltip. */}
                    {isHoverMenu ? (
                      <span className="inline-flex">{control}</span>
                    ) : (
                    <Tooltip.Root
                      open={utilityTooltipPath === item.path}
                      onOpenChange={(next) =>
                        setUtilityTooltipPath(
                          next && utilityTooltipMuted !== item.path
                            ? item.path
                            : null
                        )
                      }
                    >
                      <Tooltip.Trigger asChild>
                        <span
                          className="inline-flex"
                          onPointerDownCapture={() => {
                            setUtilityTooltipPath(null);
                            setUtilityTooltipMuted(item.path);
                          }}
                          onPointerLeave={() =>
                            setUtilityTooltipMuted((muted) =>
                              muted === item.path ? null : muted
                            )
                          }
                        >
                          {control}
                        </span>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side={expanded ? "top" : "right"}
                          sideOffset={8}
                          className={tooltipContentClass}
                        >
                          {item.label}
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
        </div>

        {/* Seam hit target — click or drag to expand/collapse. Blue line is
            inset by --radius so it stops at the content sheet’s rounded corners. */}
        {!forceCollapsed && !welcomeChrome && (
          <Tooltip.Root open={seamArmed && !seamDragging} delayDuration={0}>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                aria-label={
                  isDocked ? "Collapse navigation" : "Expand navigation"
                }
                aria-pressed={isDocked}
                onPointerEnter={(e) => {
                  if (seamDragRef.current) return;
                  armSeamAfterDwell(e.clientX, e.clientY);
                }}
                onPointerLeave={() => {
                  window.clearTimeout(seamHoverTimer.current);
                  seamHoverOrigin.current = null;
                  if (!seamDragRef.current) setSeamArmed(false);
                }}
                onPointerDown={(e) => {
                  // Entire seam UX (click/drag) only after a still dwell.
                  if (e.button !== 0 || !seamArmed) return;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  seamDragRef.current = {
                    pointerId: e.pointerId,
                    startX: e.clientX,
                    startDocked: isDocked,
                    didDrag: false,
                  };
                  setSeamDragging(true);
                }}
                onPointerMove={(e) => {
                  const drag = seamDragRef.current;
                  if (drag && e.pointerId === drag.pointerId) {
                    const dx = e.clientX - drag.startX;
                    if (Math.abs(dx) > 4) drag.didDrag = true;
                    // Drag right → expand; drag left → collapse.
                    if (dx >= 48) setDocked(true);
                    else if (dx <= -48) setDocked(false);
                    else if (drag.didDrag) setDocked(drag.startDocked);
                    return;
                  }
                  // Still moving through the seam — keep resetting the dwell.
                  if (seamArmed) return;
                  const origin = seamHoverOrigin.current;
                  if (!origin) return;
                  const dist = Math.hypot(
                    e.clientX - origin.x,
                    e.clientY - origin.y
                  );
                  if (dist > 12) armSeamAfterDwell(e.clientX, e.clientY);
                }}
                onPointerUp={(e) => {
                  const drag = seamDragRef.current;
                  if (!drag || e.pointerId !== drag.pointerId) return;
                  const didDrag = drag.didDrag;
                  seamDragRef.current = null;
                  setSeamDragging(false);
                  try {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  } catch {
                    /* already released */
                  }
                  if (!didDrag) toggleDock();
                }}
                onPointerCancel={() => {
                  seamDragRef.current = null;
                  seamHoverOrigin.current = null;
                  setSeamDragging(false);
                  setSeamArmed(false);
                }}
                style={{ cursor: seamActive ? SEAM_CURSOR : "default" }}
                className={cn(
                  "absolute inset-y-0 right-0 z-50 w-3 translate-x-1/2 cursor-default touch-none border-0 bg-transparent outline-none",
                  "after:pointer-events-none after:absolute after:left-1/2 after:w-px after:-translate-x-1/2 after:rounded-full after:bg-transparent after:transition-[width,background-color]",
                  // Start below top-bar + body radius so the line stops at the sheet’s curve.
                  "after:top-[calc(56px+var(--radius))] after:bottom-[var(--radius)]",
                  seamActive && "after:w-[2px] after:bg-[var(--ocean-500)]"
                )}
              />
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={10}
                className={tooltipContentClass}
              >
                Click or drag to expand/collapse
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        )}

        {flyout && flyoutItem?.sections && (
          <div
            ref={flyoutRef}
            className="fixed z-40 animate-scale-in duration-200"
            style={
              flyout.placement === "above"
                ? {
                    // Final left/bottom applied in useClampedFlyoutPosition.
                    left: flyout.left,
                    bottom: 0,
                  }
                : {
                    left:
                      typeof flyout.left === "number"
                        ? flyout.left
                        : (expanded ? EXPANDED_NAV_WIDTH : RAIL_WIDTH) +
                          FLYOUT_PANEL_GAP_PX,
                    top: flyout.top,
                  }
            }
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            {flyoutItem.path === "/profile" ? (
              <ProfileMenuPanel
                item={flyoutItem}
                onRequestClose={() => setFlyout(null)}
                onSwitchToOldNav={() => setOldNavFeedbackOpen(true)}
                welcomeChrome={welcomeChrome}
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
            className="fixed z-40 animate-scale-in duration-200"
            style={{
              left: RAIL_WIDTH + FLYOUT_PANEL_GAP_PX,
              top: moreFlyout.top,
            }}
            onMouseEnter={cancelMoreClose}
            onMouseLeave={scheduleMoreClose}
          >
            <div
              className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-lg border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
              style={{ width: MORE_FLYOUT_WIDTH }}
            >
              {unpinned.map((item) => {
                const Icon = item.icon;
                const isActive = unpinnedActivePath === item.path;
                const isNestedOpen = moreNestedItem?.path === item.path;
                return (
                  <div
                    key={item.path}
                    onMouseEnter={(e) => {
                      revealMoreNested(item, e.currentTarget);
                    }}
                    onFocus={(e) => {
                      revealMoreNested(item, e.currentTarget);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-sm pr-1.5 transition-colors hover:bg-muted",
                      isActive &&
                        "bg-accent font-medium text-accent-foreground hover:bg-accent",
                      !isActive && isNestedOpen && "bg-muted"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        navigate(firstChildPath(item));
                        closeMore();
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left outline-none"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-foreground" />
                      <span className="flex-1 truncate font-main-menu">{item.label}</span>
                    </button>
                    <Tooltip.Root>
                      <Tooltip.Trigger asChild>
                        <button
                          type="button"
                          aria-label={`Show ${item.label} in sidebar`}
                          onClick={(e) => {
                            e.stopPropagation();
                            pin(item.path);
                          }}
                          className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="bottom"
                          sideOffset={4}
                          className={tooltipContentClass}
                        >
                          Show in sidebar
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
            className="fixed z-40 animate-scale-in duration-200"
            style={{
              left:
                RAIL_WIDTH +
                FLYOUT_PANEL_GAP_PX +
                MORE_FLYOUT_WIDTH +
                FLYOUT_PANEL_GAP_PX,
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
      <OldNavFeedbackDialog
        open={oldNavFeedbackOpen}
        onOpenChange={setOldNavFeedbackOpen}
      />
    </Tooltip.Provider>
  );
}

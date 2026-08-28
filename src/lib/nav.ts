import type { LucideIcon } from "lucide-react";
import {
  NAV,
  PROFILE_MODES,
  WEB_EXPERIMENT_OLD_PATH,
  findProfileMode,
  firstModePath,
  flattenNavLeaves,
  leafLandPath,
  type NavItem,
  type NavLeaf,
} from "../config/navigation";

/** Width of the primary rail in px — shared by the rail, its flyout, and the app grid. */
export const RAIL_WIDTH = 64;

/** Width of the detail-surface utility rail (right) in px. */
export const UTILITY_RAIL_WIDTH = 56;

/** Width of the Profile-mode (Settings, …) drill-in sidebar in px. */
export const SETTINGS_NAV_WIDTH = 260;

/** The main-nav item whose path prefixes the given pathname. */
export function findItemByPath(pathname: string): NavItem | undefined {
  const mode = findProfileMode(pathname);
  if (mode) {
    // All Profile-mode drill-ins highlight the JD avatar (Settings is flyout-only).
    return NAV.find((i) => i.path === "/profile");
  }
  return NAV.find(
    (item) =>
      pathname === item.path || pathname.startsWith(item.path + "/")
  );
}

/**
 * Icon for a path: sub-nav items have no icon of their own, so they inherit the
 * icon of the main-nav item that owns their path. For a main-nav item's own
 * path, that's its own icon.
 */
export function iconForPath(pathname: string): LucideIcon | undefined {
  return findItemByPath(pathname)?.icon;
}

/** First sub-nav item path for items with sections, else the item's own path. */
export function firstChildPath(item: NavItem): string {
  if (item.path === "/profile") {
    const first = PROFILE_MODES[0];
    return first ? firstModePath(first) : item.path;
  }
  const first = item.sections?.[0]?.items[0];
  return first ? leafLandPath(first) : item.path;
}

export type Breadcrumb = {
  item?: NavItem;
  /** Active sub-nav leaf, when the main-nav item has sections. */
  leaf?: NavLeaf;
  /** Sibling sub-nav items across all sections, for the jump dropdown. */
  siblings: NavLeaf[];
};

export function resolveBreadcrumb(pathname: string): Breadcrumb {
  const item = findItemByPath(pathname);
  if (!item || !item.sections) return { item, siblings: [] };
  const siblings = flattenNavLeaves(item.sections);
  const leaf = [...siblings]
    .sort((a, b) => b.path.length - a.path.length)
    .find(
      (l) => pathname === l.path || pathname.startsWith(l.path + "/")
    );
  return { item, leaf, siblings };
}

/** Href for the main-nav breadcrumb segment: the current leaf's path, falling back to the section's first child. */
export function mainNavCrumbPath(pathname: string): string {
  const { item, leaf } = resolveBreadcrumb(pathname);
  if (leaf) return leaf.path;
  return item ? firstChildPath(item) : "/";
}

/** Whether the top bar's Create button shows on this path, per nav config. */
export function showsCreate(pathname: string): boolean {
  if (findProfileMode(pathname)) return false;
  const { item, leaf } = resolveBreadcrumb(pathname);
  if (leaf) return !leaf.hideCreate;
  return !item?.hideCreate;
}

/** Feature Management report listings — Summarise here, not on Feature Flags. */
const FEATURE_MANAGEMENT_SUMMARISE_PATHS = [
  "/feature-management/flag-rollout",
  "/feature-management/flag-testing",
  "/feature-management/flag-personalize",
  "/feature-management/flag-multivariate",
] as const;

/** Summarise never shows on these routes (even when Create does). */
const SUMMARISE_EXCLUDED_PATHS = new Set([
  "/insights/dashboard",
  "/feature-management/feature-flags",
  "/data-360/profiles",
  "/data-360/attributes",
  "/data-360/events",
  "/data-360/segments",
  "/data-360/metrics",
  "/data-360/funnels",
  "/data-360/data-studio",
  "/data-360/triggers",
]);

/** Summarise on these listing routes without a Create button. */
const SUMMARISE_EXTRA_PATHS = new Set([
  ...FEATURE_MANAGEMENT_SUMMARISE_PATHS,
  "/commerce/catalog",
]);

/** Summarise CTA — beside Create on create pages, plus selected report/catalog listings. */
export function showsSummarise(pathname: string): boolean {
  if (findProfileMode(pathname)) return false;
  if (SUMMARISE_EXCLUDED_PATHS.has(pathname)) return false;
  if (SUMMARISE_EXTRA_PATHS.has(pathname)) return true;
  return showsCreate(pathname);
}

/** Pages that mount WandzPanel themselves (AppLayout uses a global dock elsewhere). */
export function hasInlineWandzHost(pathname: string): boolean {
  if (
    pathname === "/web-experiment" ||
    pathname.startsWith("/web-experiment/")
  ) {
    return !pathname.startsWith(WEB_EXPERIMENT_OLD_PATH);
  }
  return pathname === "/personalize" || pathname.startsWith("/personalize/");
}

/** Label for the current page: drill-in leaf, sub-nav leaf, direct item, or fallback. */
export function pageLabel(pathname: string): string {
  const mode = findProfileMode(pathname);
  if (mode) {
    for (const section of mode.nav) {
      if (section.items) {
        const leaf = section.items.find(
          (l) => pathname === l.path || pathname.startsWith(l.path + "/")
        );
        if (leaf) return leaf.label;
      }
      if (pathname === section.path || pathname.startsWith(section.path + "/")) {
        return section.label;
      }
    }
    return mode.label;
  }
  const { item, leaf } = resolveBreadcrumb(pathname);
  return leaf?.label ?? item?.label ?? "Not Found";
}

/** True when `path` belongs to a Profile-mode drill-in (outside AppLayout). */
export function isProfileModePath(path: string): boolean {
  return Boolean(findProfileMode(path));
}

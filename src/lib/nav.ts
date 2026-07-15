import { NAV, type NavItem, type NavLeaf } from "../config/navigation";

/** Width of the primary rail in px — shared by the rail, its flyout, and the app grid. */
export const RAIL_WIDTH = 64;

/** The main-nav item whose path prefixes the given pathname. */
export function findItemByPath(pathname: string): NavItem | undefined {
  return NAV.find(
    (item) =>
      pathname === item.path || pathname.startsWith(item.path + "/")
  );
}

/** First sub-nav item path for items with sections, else the item's own path. */
export function firstChildPath(item: NavItem): string {
  const first = item.sections?.[0]?.items[0];
  return first ? first.path : item.path;
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
  const siblings = item.sections.flatMap((s) => s.items);
  const leaf = siblings.find(
    (l) => pathname === l.path || pathname.startsWith(l.path + "/")
  );
  return { item, leaf, siblings };
}

/** Label for the current page: sub-nav leaf label, direct item label, or fallback. */
export function pageLabel(pathname: string): string {
  const { item, leaf } = resolveBreadcrumb(pathname);
  return leaf?.label ?? item?.label ?? "Not Found";
}

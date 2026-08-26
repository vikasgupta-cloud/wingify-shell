import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Search } from "@/components/icons/protoLucide";
import {
  findProfileMode,
  sectionLandPath,
  type DrillInNavItem,
  type NavLeaf,
  type ProfileMode,
} from "../../config/navigation";
import { SETTINGS_NAV_WIDTH } from "../../lib/nav";
import { cn } from "../../lib/utils";
import { Input } from "../ui/input";

function isUnder(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

function activeSectionPath(
  pathname: string,
  items: DrillInNavItem[]
): string | null {
  for (const item of items) {
    if (item.items && !item.alwaysOpen && isUnder(pathname, item.path)) {
      return item.path;
    }
  }
  return null;
}

function matchesQuery(label: string, q: string) {
  return !q || label.toLowerCase().includes(q);
}

function CountPill({ count }: { count: number }) {
  return (
    <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
      {count}
    </span>
  );
}

function LeafLink({ leaf }: { leaf: NavLeaf }) {
  const Icon = leaf.icon;
  return (
    <NavLink
      to={leaf.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted",
          isActive &&
            !leaf.action &&
            "bg-accent font-medium text-accent-foreground hover:bg-accent"
        )
      }
    >
      {Icon && (
        <Icon
          className="h-4 w-4 shrink-0 text-foreground"
          strokeWidth={1.75}
        />
      )}
      <span className="min-w-0 flex-1 truncate">{leaf.label}</span>
      {leaf.count != null && <CountPill count={leaf.count} />}
    </NavLink>
  );
}

/**
 * Linear-style drill-in sidebar for any Profile mode (Settings, Profile, …):
 * back to main menu + accordion / static section / leaf list from that mode's `nav`.
 */
export default function DrillInNav({ mode }: { mode: ProfileMode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openPath, setOpenPath] = useState<string | null>(() =>
    activeSectionPath(pathname, mode.nav)
  );

  useEffect(() => {
    // Accordion: open only the section that owns the current path; close when
    // landing on a leaf with no children (e.g. Campaigns, Workspaces).
    setOpenPath(activeSectionPath(pathname, mode.nav));
  }, [pathname, mode.nav]);

  useEffect(() => {
    setQuery("");
  }, [mode.id]);

  const goBack = () => {
    navigate("/home/dashboard");
  };

  const q = query.trim().toLowerCase();

  const filteredNav: DrillInNavItem[] = mode.nav
    .map((item) => {
      if (!item.items?.length) {
        return matchesQuery(item.label, q) ? item : null;
      }
      const items = item.items.filter((leaf) => matchesQuery(leaf.label, q));
      if (!q) return item;
      if (!items.length && !matchesQuery(item.label, q)) return null;
      return { ...item, items: items.length ? items : item.items };
    })
    .filter(Boolean) as DrillInNavItem[];

  const renderItem = (item: DrillInNavItem) => {
    const Icon = item.icon;
    const hasItems = !!item.items?.length;
    const open = item.alwaysOpen || openPath === item.path;
    const sectionActive = isUnder(pathname, item.path);

    if (!hasItems) {
      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-muted",
              isActive && "bg-accent font-medium text-accent-foreground hover:bg-accent"
            )
          }
        >
          {Icon && (
            <Icon
              className="h-4 w-4 shrink-0 text-foreground"
              strokeWidth={1.75}
            />
          )}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.count != null && <CountPill count={item.count} />}
        </NavLink>
      );
    }

    if (item.alwaysOpen) {
      return (
        <div key={item.path} className="flex flex-col gap-0.5">
          <div className="px-2 pb-1 pt-3 text-xs font-medium text-muted-foreground">
            {item.label}
          </div>
          {item.items!.map((leaf) => (
            <LeafLink key={leaf.path} leaf={leaf} />
          ))}
        </div>
      );
    }

    return (
      <div key={item.path}>
        <div className="group flex items-center gap-1 rounded-md pr-1 transition-colors hover:bg-muted">
          <button
            type="button"
            onClick={() => {
              const next = open ? null : item.path;
              setOpenPath(next);
              if (!open) navigate(sectionLandPath(item));
            }}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-left text-sm text-foreground outline-none",
              sectionActive && "font-medium"
            )}
          >
            {Icon && (
              <Icon
                className="h-4 w-4 shrink-0 text-foreground"
                strokeWidth={1.75}
              />
            )}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
          </button>
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
        </div>
        {open && item.items && (
          <div className="ml-[19px] mt-1 flex flex-col gap-0.5 border-l border-panel-border pb-2 pl-3 pr-1">
            {item.items.map((leaf) => (
              <LeafLink key={leaf.path} leaf={leaf} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav
      className="flex h-full flex-col overflow-hidden border-r border-panel-border bg-background py-4 text-foreground"
      style={{ width: SETTINGS_NAV_WIDTH }}
    >
      <div className="flex shrink-0 items-center px-3 pb-3">
        <button
          type="button"
          aria-label="Back to main menu"
          onClick={goBack}
          className="flex min-w-0 items-center gap-1 rounded-md px-1 py-1 text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-semibold">Back to app</span>
        </button>
      </div>

      {mode.searchPlaceholder && (
        <div className="shrink-0 px-3 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={mode.searchPlaceholder}
              className="h-8 bg-muted/50 pl-8 shadow-none"
              aria-label={mode.searchPlaceholder}
            />
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {filteredNav.map(renderItem)}
      </div>
    </nav>
  );
}

/** Resolve the active Profile mode for the current URL (null if none). */
export function useActiveProfileMode(): ProfileMode | undefined {
  const { pathname } = useLocation();
  return findProfileMode(pathname);
}

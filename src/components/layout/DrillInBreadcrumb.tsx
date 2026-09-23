// Drill-in (Settings / Profile modes) breadcrumb — JD mode switcher, then
// section / leaf switchers (Upgrade is flat: mode + product menu only).
// Website detail adds a third crumb to switch between Connected sites.
// Integration detail crumb mirrors DetailShell (search + ListFilter + max-h list).
// Landing uses sectionLandPath (root page when landable, else first child).

import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, ListFilter, Search } from "@/components/icons/protoLucide";
import { Checkbox } from "@/components/ui/checkbox";
import {
  findDrillInLeaf,
  findDrillInSection,
  jdSwitcherItems,
  modeLeaves,
  resolveJdSwitcherItem,
  sectionLandPath,
  type DrillInNavItem,
  type ProfileMode,
} from "../../config/navigation";
import {
  WEBSITES_AND_APPS,
  WNA_SITES_BASE,
  getWebsiteById,
  websiteDetailPath,
} from "@/data/websitesAndApps";
import {
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  INTEGRATIONS_BASE,
  integrationById,
  integrationDetailPath,
} from "@/data/integrations";
import { cn } from "../../lib/utils";

/** Matches DetailShell entity switcher — fixed scroll area so menus stay the same height. */
const CRUMB_MENU_H = "h-64 max-h-64";


type CrumbItem = {
  label: string;
  path: string;
  /** Identity for active highlight (defaults to path). */
  id?: string;
  icon?: DrillInNavItem["icon"];
};

function parseWebsiteDetailId(pathname: string): string | null {
  if (!pathname.startsWith(`${WNA_SITES_BASE}/`)) return null;
  const id = pathname.slice(WNA_SITES_BASE.length + 1).split("/")[0];
  return id || null;
}

function parseIntegrationDetailId(pathname: string): string | null {
  if (!pathname.startsWith(`${INTEGRATIONS_BASE}/`)) return null;
  const id = pathname.slice(INTEGRATIONS_BASE.length + 1).split("/")[0];
  return id || null;
}

function CrumbDropdown({
  label,
  ariaLabel,
  activeId,
  items,
  groups,
  strong = false,
}: {
  label: string;
  ariaLabel: string;
  activeId: string;
  items?: CrumbItem[];
  /** Optional grouped list (JD mode switcher) — separators between groups. */
  groups?: CrumbItem[][];
  /** Current page crumb — heavier weight. */
  strong?: boolean;
}) {
  const sections = groups ?? (items ? [items] : []);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "flex items-center gap-0.5 truncate rounded-md px-1 py-0.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
            strong
              ? "font-semibold text-foreground"
              : "font-normal text-foreground"
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className={cn(
            "z-50 min-w-[220px] overflow-y-auto rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg",
            CRUMB_MENU_H
          )}
        >
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {sectionIndex > 0 && (
                <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
              )}
              {section.map((entry) => {
                const Icon = entry.icon;
                const isActive = (entry.id ?? entry.path) === activeId;
                return (
                  <DropdownMenu.Item key={entry.id ?? entry.path} asChild>
                    <NavLink
                      to={entry.path}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                        isActive && "bg-accent font-medium"
                      )}
                    >
                      {Icon && (
                        <Icon
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          aria-hidden
                        />
                      )}
                      <span className="truncate">{entry.label}</span>
                    </NavLink>
                  </DropdownMenu.Item>
                );
              })}
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/**
 * Integration detail crumb — DetailShell-style search + ListFilter, name-only rows.
 * Category filter is multi-select (checkboxes); while searching, filter is hidden
 * and matching runs across the full list (same as web-exp entity switcher).
 */
function IntegrationCrumbDropdown({
  label,
  activeId,
  strong = false,
}: {
  label: string;
  activeId: string;
  strong?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of INTEGRATIONS) {
      counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      return INTEGRATIONS.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (categories.length === 0) return INTEGRATIONS;
    return INTEGRATIONS.filter((i) => categories.includes(i.category));
  }, [categories, query]);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setFilterMenuOpen(false);
        }
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Switch integration"
          className={cn(
            "flex items-center gap-0.5 truncate rounded-md px-1 py-0.5 outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
            strong
              ? "font-semibold text-foreground"
              : "font-normal text-foreground"
          )}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[300px] rounded-md border border-border bg-popover p-2 text-sm text-popover-foreground shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setFilterMenuOpen(false);
                }}
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            {!query.trim() ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  title="Filter by category"
                  aria-label={
                    categories.length > 0
                      ? `Filter by category, ${categories.length} selected`
                      : "Filter by category"
                  }
                  aria-expanded={filterMenuOpen}
                  onClick={() => setFilterMenuOpen((o) => !o)}
                  className={cn(
                    "relative flex items-center justify-center rounded-md border border-input p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    categories.length > 0 &&
                      "border-transparent bg-secondary text-secondary-foreground"
                  )}
                >
                  <ListFilter className="h-4 w-4" />
                  {categories.length > 0 ? (
                    <span
                      aria-hidden
                      className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-none tabular-nums text-background"
                    >
                      {categories.length}
                    </span>
                  ) : null}
                </button>
                {filterMenuOpen && (
                  <div
                    className={cn(
                      "absolute right-0 top-full z-10 mt-1 w-64 overflow-y-auto rounded-md border border-border bg-popover p-1 shadow-lg",
                      CRUMB_MENU_H
                    )}
                  >
                    {INTEGRATION_CATEGORIES.map((category) => (
                      <label
                        key={category}
                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-muted"
                      >
                        <Checkbox
                          checked={categories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <span className="min-w-0 flex-1 truncate text-foreground">
                          {category}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          ({categoryCounts.get(category) ?? 0})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className={cn("mt-2 flex flex-col gap-0.5 overflow-y-auto", CRUMB_MENU_H)}>
            {filtered.length === 0 ? (
              <p className="px-2.5 py-1.5 text-muted-foreground">
                No integrations match.
              </p>
            ) : (
              filtered.map((row) => {
                const isActive = row.id === activeId;
                return (
                  <NavLink
                    key={row.id}
                    to={integrationDetailPath(row.id)}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center rounded-sm px-2.5 py-1.5 transition-colors hover:bg-[var(--neutral-50)]",
                      isActive && "bg-[var(--neutral-50)] font-medium"
                    )}
                  >
                    <span className="truncate">{row.name}</span>
                  </NavLink>
                );
              })
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** True when nav is heading groups only (Upgrade) — no section crumb. */
function isFlatProductNav(mode: ProfileMode): boolean {
  const withChildren = mode.nav.filter((item) => item.items?.length);
  return (
    withChildren.length > 0 && withChildren.every((item) => item.alwaysOpen)
  );
}

function ModeSwitcher({
  mode,
  pathname,
}: {
  mode: ProfileMode;
  pathname: string;
}) {
  const active = resolveJdSwitcherItem(pathname);
  // Flat list — Configuration / Settings / Upgrade (no Profile row).
  const items = jdSwitcherItems();

  return (
    <CrumbDropdown
      label={active?.label ?? mode.label}
      ariaLabel="Switch JD destination"
      activeId={active?.id ?? mode.path}
      items={items}
    />
  );
}

export default function DrillInBreadcrumb({
  mode,
  pathname,
}: {
  mode: ProfileMode;
  pathname: string;
}) {
  const flat = isFlatProductNav(mode);
  const section = findDrillInSection(pathname, mode);
  const leaf = section ? findDrillInLeaf(pathname, section) : undefined;
  const websiteId = parseWebsiteDetailId(pathname);
  const website = websiteId ? getWebsiteById(websiteId) : undefined;
  const integrationId = parseIntegrationDetailId(pathname);
  const integration = integrationId
    ? integrationById(integrationId)
    : undefined;

  // Flat catalog: Upgrade / [product ▼] across all products.
  if (flat) {
    const products: CrumbItem[] = modeLeaves(mode).map((item) => ({
      id: item.path,
      label: item.label,
      path: item.path,
      icon: item.icon,
    }));
    const active =
      products.find(
        (p) => pathname === p.path || pathname.startsWith(`${p.path}/`)
      ) ?? products[0];

    return (
      <div className="flex min-w-0 items-center gap-1 text-sm">
        <ModeSwitcher mode={mode} pathname={pathname} />
        {active && (
          <>
            <span className="text-muted-foreground" aria-hidden>
              /
            </span>
            <CrumbDropdown
              label={active.label}
              ariaLabel={`Switch ${mode.label} page`}
              activeId={active.id ?? active.path}
              items={products}
              strong
            />
          </>
        )}
      </div>
    );
  }

  const sectionItems: CrumbItem[] = mode.nav.map((item) => ({
    id: item.path,
    label: item.label,
    path: sectionLandPath(item),
    icon: item.icon,
  }));

  const leafItems: CrumbItem[] = [];
  if (section?.items?.length) {
    if (section.landRoot) {
      leafItems.push({
        id: section.path,
        label: section.label,
        path: section.path,
        icon: section.icon,
      });
    }
    for (const item of section.items) {
      leafItems.push({
        id: item.path,
        label: item.label,
        path: item.path,
        icon: item.icon,
      });
    }
  }

  const leafLabel =
    leaf?.label ??
    (section?.landRoot && pathname === section.path ? section.label : null);
  const leafActiveId =
    leaf?.path ??
    (section?.landRoot && pathname === section.path ? section.path : null);

  const websiteItems: CrumbItem[] = WEBSITES_AND_APPS.map((row) => ({
    id: row.id,
    label: row.name,
    path: websiteDetailPath(row.id),
  }));

  const hasLeafCrumb =
    !!section && leafItems.length > 0 && !!leafLabel && !!leafActiveId;
  const hasWebsiteCrumb = !!website && !!websiteId;
  const hasIntegrationCrumb = !!integration && !!integrationId;

  return (
    <div className="flex min-w-0 items-center gap-1 text-sm">
      <ModeSwitcher mode={mode} pathname={pathname} />

      {section && (
        <>
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          <CrumbDropdown
            label={section.label}
            ariaLabel={`Switch ${mode.label} section`}
            activeId={section.path}
            items={sectionItems}
            strong={!hasLeafCrumb && !hasWebsiteCrumb && !hasIntegrationCrumb}
          />
        </>
      )}

      {hasLeafCrumb && (
        <>
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          <CrumbDropdown
            label={leafLabel!}
            ariaLabel={`Switch ${section!.label} page`}
            activeId={leafActiveId!}
            items={leafItems}
            strong={!hasWebsiteCrumb && !hasIntegrationCrumb}
          />
        </>
      )}

      {hasWebsiteCrumb && (
        <>
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          <CrumbDropdown
            label={website!.name}
            ariaLabel="Switch website"
            activeId={websiteId!}
            items={websiteItems}
            strong
          />
        </>
      )}

      {hasIntegrationCrumb && (
        <>
          <span className="text-muted-foreground" aria-hidden>
            /
          </span>
          <IntegrationCrumbDropdown
            label={integration!.name}
            activeId={integrationId!}
            strong
          />
        </>
      )}
    </div>
  );
}

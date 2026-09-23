// Drill-in (Settings / Profile modes) breadcrumb — JD mode switcher, then
// section / leaf switchers (Upgrade is flat: mode + product menu only).
// Website detail adds a third crumb to switch between Connected sites.
// Integration detail adds a third crumb with category filter + fixed-height list.
// Landing uses sectionLandPath (root page when landable, else first child).

import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, ChevronRight } from "@/components/icons/protoLucide";
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
 * Integration detail crumb — Filter by Category (same pattern as Integrations list)
 * plus a fixed-height scrollable app list.
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
  const [categories, setCategories] = useState<string[]>([]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of INTEGRATIONS) {
      counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    if (categories.length === 0) return INTEGRATIONS;
    return INTEGRATIONS.filter((i) => categories.includes(i.category));
  }, [categories]);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
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
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          className="z-50 flex w-72 flex-col overflow-hidden rounded-md border border-border bg-popover p-0 text-sm text-popover-foreground shadow-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="shrink-0 border-b border-border p-1.5">
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger className="flex cursor-default items-center justify-between gap-2 rounded-sm px-2.5 py-2 outline-none data-[highlighted]:bg-accent data-[state=open]:bg-accent">
                <span className="font-medium text-foreground">
                  Filter by Category
                  {categories.length > 0 ? (
                    <span className="ml-1 font-normal text-muted-foreground">
                      ({categories.length})
                    </span>
                  ) : null}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  sideOffset={6}
                  alignOffset={-4}
                  className={cn(
                    "z-50 w-64 overflow-y-auto rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg",
                    CRUMB_MENU_H
                  )}
                >
                  {INTEGRATION_CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 hover:bg-accent"
                      onClick={(e) => e.preventDefault()}
                      onPointerDown={(e) => e.preventDefault()}
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
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          </div>

          <div className={cn("overflow-y-auto p-1.5", CRUMB_MENU_H)}>
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-muted-foreground">
                No integrations match.
              </p>
            ) : (
              filtered.map((row) => {
                const isActive = row.id === activeId;
                return (
                  <DropdownMenu.Item key={row.id} asChild>
                    <NavLink
                      to={integrationDetailPath(row.id)}
                      className={cn(
                        "flex cursor-pointer items-center rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                        isActive && "bg-accent font-medium"
                      )}
                    >
                      <span className="truncate">{row.name}</span>
                    </NavLink>
                  </DropdownMenu.Item>
                );
              })
            )}
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
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

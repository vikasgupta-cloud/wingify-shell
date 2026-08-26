// Drill-in (Settings / Profile modes) breadcrumb — same dropdown pattern as
// product BreadcrumbNav: plain mode label, section switcher, then leaf switcher.
// Landing uses sectionLandPath (root page when landable, else first child).
// alwaysOpen section groups (Upgrade) skip the section crumb — one flat product menu.

import { NavLink } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@/components/icons/protoLucide";
import {
  findDrillInLeaf,
  findDrillInSection,
  modeLeaves,
  sectionLandPath,
  type DrillInNavItem,
  type ProfileMode,
} from "../../config/navigation";
import { cn } from "../../lib/utils";

type CrumbItem = {
  label: string;
  path: string;
  /** Identity for active highlight (defaults to path). */
  id?: string;
  icon?: DrillInNavItem["icon"];
};

function CrumbDropdown({
  label,
  ariaLabel,
  activeId,
  items,
}: {
  label: string;
  ariaLabel: string;
  activeId: string;
  items: CrumbItem[];
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="flex items-center gap-1 truncate rounded-md px-1.5 py-1 font-semibold text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[220px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
        >
          {items.map((entry) => {
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
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <span className="truncate px-1.5 font-semibold text-foreground">
          {mode.label}
        </span>
        {active && (
          <>
            <span className="text-muted-foreground">/</span>
            <CrumbDropdown
              label={active.label}
              ariaLabel={`Switch ${mode.label} page`}
              activeId={active.id ?? active.path}
              items={products}
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

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <span className="truncate px-1.5 font-semibold text-foreground">
        {mode.label}
      </span>

      {section && (
        <>
          <span className="text-muted-foreground">/</span>
          <CrumbDropdown
            label={section.label}
            ariaLabel={`Switch ${mode.label} section`}
            activeId={section.path}
            items={sectionItems}
          />
        </>
      )}

      {section && leafItems.length > 0 && leafLabel && leafActiveId && (
        <>
          <span className="text-muted-foreground">/</span>
          <CrumbDropdown
            label={leafLabel}
            ariaLabel={`Switch ${section.label} page`}
            activeId={leafActiveId}
            items={leafItems}
          />
        </>
      )}
    </div>
  );
}

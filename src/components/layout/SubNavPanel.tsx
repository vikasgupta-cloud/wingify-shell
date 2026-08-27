// Product sub-nav (docked / flyout) — supports nested accordion leaves,
// icons, premium badge, and section separators (Commerce-style).

import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ChevronDown,
  Crown,
  ExternalLink,
  PinOff,
} from "@/components/icons/protoLucide";
import {
  leafLandPath,
  type NavItem,
  type NavLeaf,
} from "../../config/navigation";
import { canUnpinPath, useUIStore } from "../../store/ui";
import { cn } from "../../lib/utils";

type SubNavPanelProps = {
  item: NavItem;
  variant: "docked" | "flyout";
  /** Called after the item is unpinned so a flyout host can dismiss itself. */
  onRequestClose?: () => void;
};

function isUnder(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(path + "/");
}

function leafActive(pathname: string, leaf: NavLeaf): boolean {
  if (leaf.items?.length) {
    return leaf.items.some((child) => leafActive(pathname, child));
  }
  return isUnder(pathname, leaf.path);
}

function activeAccordionPath(
  pathname: string,
  sections: NonNullable<NavItem["sections"]>
): string | null {
  for (const section of sections) {
    for (const leaf of section.items) {
      if (leaf.items?.length && leafActive(pathname, leaf)) return leaf.path;
    }
  }
  return null;
}

function PremiumBadge() {
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
      title="Premium"
      aria-label="Premium"
    >
      <Crown className="size-3" strokeWidth={1.75} aria-hidden />
    </span>
  );
}

function LeafRow({
  leaf,
  onRequestClose,
  nested = false,
}: {
  leaf: NavLeaf;
  onRequestClose?: () => void;
  nested?: boolean;
}) {
  const Icon = leaf.icon;
  const content = (
    <>
      {Icon && (
        <Icon
          className="h-4 w-4 shrink-0 text-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
      <span className="min-w-0 flex-1 truncate">{leaf.label}</span>
      {leaf.badge === "premium" && <PremiumBadge />}
      {leaf.external && (
        <ExternalLink
          className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
      )}
    </>
  );

  const className = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted",
      nested && "py-1.5",
      isActive && "bg-accent font-medium text-accent-foreground hover:bg-accent"
    );

  if (leaf.external) {
    return (
      <a
        href={leaf.path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onRequestClose?.()}
        className={cn(
          "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-muted",
          nested && "py-1.5"
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <NavLink
      to={leaf.path}
      onClick={() => onRequestClose?.()}
      className={className}
    >
      {content}
    </NavLink>
  );
}

function AccordionLeaf({
  leaf,
  open,
  onToggle,
  onNavigate,
  onRequestClose,
}: {
  leaf: NavLeaf;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  onRequestClose?: () => void;
}) {
  const Icon = leaf.icon;
  const { pathname } = useLocation();
  const sectionActive = leafActive(pathname, leaf);

  return (
    <div>
      <div className="group flex items-center gap-1 rounded-md pr-1 transition-colors hover:bg-muted">
        <button
          type="button"
          onClick={() => {
            onToggle();
            if (!open) onNavigate();
          }}
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 px-2.5 py-2 text-left text-sm text-foreground outline-none",
            sectionActive && "font-medium"
          )}
        >
          {Icon && (
            <Icon
              className="h-4 w-4 shrink-0 text-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
          <span className="min-w-0 flex-1 truncate">{leaf.label}</span>
          {leaf.badge === "premium" && <PremiumBadge />}
        </button>
        <button
          type="button"
          aria-label={open ? `Collapse ${leaf.label}` : `Expand ${leaf.label}`}
          onClick={onToggle}
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
      {open && leaf.items && (
        <div className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-panel-border pb-1 pl-2.5">
          {leaf.items.map((child) => (
            <LeafRow
              key={child.path}
              leaf={child}
              nested
              onRequestClose={onRequestClose}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubNavPanel({
  item,
  variant,
  onRequestClose,
}: SubNavPanelProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const unpin = useUIStore((s) => s.unpin);
  const pinnedPaths = useUIStore((s) => s.pinnedPaths);
  const canUnpin = (path: string) => canUnpinPath(pinnedPaths, path);
  const [openPath, setOpenPath] = useState<string | null>(() =>
    item.sections ? activeAccordionPath(pathname, item.sections) : null
  );

  useEffect(() => {
    if (!item.sections) return;
    const next = activeAccordionPath(pathname, item.sections);
    setOpenPath((prev) => (prev === next ? prev : next));
  }, [pathname, item.path, item.sections]);

  if (!item.sections) return null;

  return (
    <nav
      className={cn(
        "w-[248px] shrink-0 overflow-y-auto py-6",
        variant === "docked" &&
          "h-full bg-panel text-panel-foreground border-r border-panel-border",
        variant === "flyout" &&
          "max-h-[calc(100vh-2rem)] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      )}
    >
      <div className="flex items-center justify-between gap-2 px-5 pb-4">
        <div className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {item.label}
        </div>
        {item.pinnable && pinnedPaths.includes(item.path) && canUnpin(item.path) && (
          <Tooltip.Provider delayDuration={300}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  aria-label="Unpin from sidebar"
                  onClick={() => {
                    unpin(item.path);
                    onRequestClose?.();
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PinOff className="h-3.5 w-3.5" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={4}
                  className="z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
                >
                  Unpin from sidebar
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </div>
      <div className="flex flex-col px-3">
        {item.sections.map((section, i) => (
          <div key={section.heading ?? i} className="flex flex-col gap-0.5">
            {i > 0 && (
              <div className="my-3 h-px bg-panel-border" aria-hidden="true" />
            )}
            {section.items.map((leaf) =>
              leaf.items?.length ? (
                <AccordionLeaf
                  key={leaf.path}
                  leaf={leaf}
                  open={openPath === leaf.path}
                  onToggle={() =>
                    setOpenPath((prev) =>
                      prev === leaf.path ? null : leaf.path
                    )
                  }
                  onNavigate={() => navigate(leafLandPath(leaf))}
                  onRequestClose={onRequestClose}
                />
              ) : (
                <LeafRow
                  key={leaf.path}
                  leaf={leaf}
                  onRequestClose={onRequestClose}
                />
              )
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

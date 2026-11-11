// Product sub-nav (docked / flyout) — nested accordion leaves, premium
// crown badge, section separators, leading leaf icons (LeafIcon).
// Change summary: `toSentenceCase` is exported so the open nav (ExpandedNav) reuses it for group labels.
// A row also highlights on its page-tab pages (leafOwnsPath from lib/nav); existing NavLink styling reused.
// Suites (Analytics): SuiteProductSwitcher on top, then only the active product's pages (section
// rendering moved into renderSections, markup unchanged).
// Suite hover flyout (NavItem `suite`): SuitePanels — products left, hovered product's pages right.
// Rows now show the leaf's nav icon (new exported `LeafIcon`, also used by ExpandedNav) — replaces
// the earlier "sub-leaf leading icons omitted" choice. Rows without an icon render as before.

import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ChevronDown,
  ChevronRight,
  Crown,
  ExternalLink,
  EyeOff,
} from "@/components/icons/protoLucide";
import {
  leafLandPath,
  type NavItem,
  type NavLeaf,
  type NavSection,
} from "../../config/navigation";
import SuiteProductSwitcher from "./SuiteProductSwitcher";
import { canUnpinPath, useUIStore } from "../../store/ui";
import { GET_STARTED_PATH } from "@/lib/getStartedGate";
import {
  useGetStartedNavLockTooltip,
  useIsGetStartedLocked,
} from "@/store/getStartedOnboarding";
import { cn } from "../../lib/utils";
import { activeProductIndex, leafOwnsPath, suiteProducts } from "../../lib/nav";

const lockTooltipClass =
  "z-50 max-w-[240px] rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md";

/** "Feature Management" → "Feature management" for flyout chrome. */
export function toSentenceCase(label: string): string {
  const trimmed = label.trim();
  if (!trimmed) return label;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function withLockTooltip(node: React.ReactNode, tooltip: string | null) {
  if (!tooltip) return node;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{node}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="right" sideOffset={8} className={lockTooltipClass}>
          {tooltip}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

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

/** Leading glyph for a sub-nav row; nothing when the leaf has no icon. */
export function LeafIcon({ leaf }: { leaf: NavLeaf }) {
  const Icon = leaf.icon;
  if (!Icon) return null;
  return (
    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
  );
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
  disabled = false,
  lockTooltip = null,
}: {
  leaf: NavLeaf;
  onRequestClose?: () => void;
  nested?: boolean;
  disabled?: boolean;
  lockTooltip?: string | null;
}) {
  const { pathname } = useLocation();
  const content = (
    <>
      <LeafIcon leaf={leaf} />
      <span className="min-w-0 flex-1 truncate">
        {toSentenceCase(leaf.label)}
      </span>
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

  const leafClass = cn(
    "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
    nested && "py-1"
  );

  const className = ({ isActive }: { isActive: boolean }) =>
    cn(
      leafClass,
      (isActive || leafOwnsPath(leaf, pathname)) &&
        "bg-accent text-accent-foreground hover:bg-accent"
    );

  if (leaf.external) {
    if (disabled) {
      return withLockTooltip(
        <span
          aria-disabled="true"
          className={cn(leafClass, "cursor-not-allowed opacity-40 hover:bg-transparent")}
        >
          {content}
        </span>,
        lockTooltip
      );
    }
    return (
      <a
        href={leaf.path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onRequestClose?.()}
        className={leafClass}
      >
        {content}
      </a>
    );
  }

  if (disabled) {
    return withLockTooltip(
      <span
        aria-disabled="true"
        className={cn(leafClass, "cursor-not-allowed opacity-40 hover:bg-transparent")}
      >
        {content}
      </span>,
      lockTooltip
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
  navLocked = false,
  lockTooltip = null,
}: {
  leaf: NavLeaf;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  onRequestClose?: () => void;
  navLocked?: boolean;
  lockTooltip?: string | null;
}) {
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
            "flex min-w-0 flex-1 items-center gap-3 px-2.5 py-1.5 text-left text-sm font-medium text-foreground outline-none",
            sectionActive && "text-accent-foreground"
          )}
        >
          <LeafIcon leaf={leaf} />
          <span className="min-w-0 flex-1 truncate">
            {toSentenceCase(leaf.label)}
          </span>
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
              disabled={navLocked && child.path !== GET_STARTED_PATH}
              lockTooltip={lockTooltip}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Delay before a hovered product takes over the pages panel, so a diagonal move toward a page doesn't switch products on the way. */
const PRODUCT_HOVER_INTENT_MS = 90;

/**
 * Suite flyout (e.g. Analytics): products on the left, the hovered product's pages on the right —
 * any page is one click away. Defaults to the product that owns the current page.
 */
function SuitePanels({
  products,
  onRequestClose,
  leafDisabled,
  lockTooltip,
}: {
  products: NavLeaf[];
  onRequestClose?: () => void;
  leafDisabled: (path: string) => boolean;
  lockTooltip: string | null;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentPath =
    products.find((p) => leafActive(pathname, p))?.path ?? products[0]?.path;
  const [shownPath, setShownPath] = useState(currentPath);
  const hoverTimer = useRef<number | undefined>(undefined);

  useEffect(() => setShownPath(currentPath), [currentPath]);
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const shown = products.find((p) => p.path === shownPath) ?? products[0];
  if (!shown) return null;

  const showSoon = (path: string) => {
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(
      () => setShownPath(path),
      PRODUCT_HOVER_INTENT_MS
    );
  };

  return (
    <div className="flex gap-2">
      <div className="flex w-[200px] shrink-0 flex-col gap-0.5">
        {products.map((product) => {
          const isShown = product.path === shown.path;
          return (
            <button
              key={product.path}
              type="button"
              aria-current={leafActive(pathname, product) ? "true" : undefined}
              onMouseEnter={() => showSoon(product.path)}
              onMouseLeave={() => window.clearTimeout(hoverTimer.current)}
              onFocus={() => setShownPath(product.path)}
              onClick={() => {
                navigate(leafLandPath(product));
                onRequestClose?.();
              }}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted",
                isShown && "bg-muted"
              )}
            >
              <LeafIcon leaf={product} />
              <span className="min-w-0 flex-1 truncate">
                {toSentenceCase(product.label)}
              </span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-opacity",
                  !isShown && "opacity-0"
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      {/* Every product's list shares one grid cell so the panel keeps the tallest list's height
          (no jumping while hovering); only the shown list is visible. */}
      <div className="grid w-[220px] shrink-0 border-l border-panel-border pl-2">
        {products.map((product) => {
          const isShown = product.path === shown.path;
          return (
            <div
              key={product.path}
              className={cn(
                "col-start-1 row-start-1 flex flex-col gap-0.5",
                !isShown && "invisible"
              )}
              aria-hidden={!isShown}
              aria-label={`${product.label} pages`}
            >
              {product.items?.map((leaf) => (
                <LeafRow
                  key={leaf.path}
                  leaf={leaf}
                  onRequestClose={onRequestClose}
                  disabled={leafDisabled(leaf.path)}
                  lockTooltip={lockTooltip}
                />
              ))}
            </div>
          );
        })}
      </div>
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
  const navLocked = useIsGetStartedLocked();
  const lockTooltip = useGetStartedNavLockTooltip();
  const panelLocked = navLocked && item.path !== "/home";
  const leafDisabled = (path: string) =>
    panelLocked || (navLocked && path !== GET_STARTED_PATH);
  const [openPath, setOpenPath] = useState<string | null>(() =>
    item.sections ? activeAccordionPath(pathname, item.sections) : null
  );

  useEffect(() => {
    if (!item.sections) return;
    const next = activeAccordionPath(pathname, item.sections);
    setOpenPath((prev) => (prev === next ? prev : next));
  }, [pathname, item.path, item.sections]);

  if (!item.sections) return null;
  const products = suiteProducts(item);
  const activeProduct = products ? activeProductIndex(products, pathname) : 0;
  const twoPanel = variant === "flyout" && !!item.suite;

  // Gear flyout: rail already says “Settings” — skip the duplicate panel title.
  const showTitle =
    !(variant === "flyout" && item.path === "/settings" && item.flyoutOnly);
  const showUnpin =
    item.pinnable && pinnedPaths.includes(item.path) && canUnpin(item.path);

  return (
    <nav
      className={cn(
        "shrink-0 overflow-y-auto py-2.5",
        twoPanel ? "w-auto" : "w-[248px]",
        variant === "docked" &&
          "h-full bg-panel text-panel-foreground border-r border-panel-border",
        variant === "flyout" &&
          "max-h-[calc(100vh-2rem)] rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
      )}
    >
      {(showTitle || showUnpin) && (
        <div className="flex items-center justify-between gap-2 px-5 pb-1.5">
          {showTitle ? (
            <div className="truncate text-sm font-normal text-muted-foreground">
              {toSentenceCase(item.label)}
            </div>
          ) : (
            <span />
          )}
          {showUnpin && (
            <Tooltip.Provider delayDuration={300}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    type="button"
                    aria-label="Hide from sidebar"
                    onClick={() => {
                      unpin(item.path);
                      onRequestClose?.();
                    }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <EyeOff className="h-3.5 w-3.5" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={4}
                    className="z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md"
                  >
                    Hide from sidebar
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
      )}
      <Tooltip.Provider delayDuration={300}>
        <div className="flex flex-col px-3">
          {twoPanel ? (
            <SuitePanels
              products={item.sections.flatMap((s) => s.items)}
              onRequestClose={onRequestClose}
              leafDisabled={leafDisabled}
              lockTooltip={lockTooltip}
            />
          ) : products ? (
            <SuiteProductSwitcher products={products} activeIndex={activeProduct}>
              {renderSections([products[activeProduct]], false)}
            </SuiteProductSwitcher>
          ) : (
            renderSections(item.sections, true)
          )}
        </div>
      </Tooltip.Provider>
    </nav>
  );

  function renderSections(sections: NavSection[], showHeadings: boolean) {
    return sections.map((section, i) => (
            <div key={section.heading ?? i} className="flex flex-col gap-0.5">
              {i > 0 && (
                <div className="my-1 h-px bg-panel-border" aria-hidden="true" />
              )}
              {showHeadings && section.heading ? (
                <div className="px-2.5 pb-0.5 pt-0.5 text-sm font-normal text-muted-foreground">
                  {toSentenceCase(section.heading)}
                </div>
              ) : null}
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
                    navLocked={navLocked}
                    lockTooltip={lockTooltip}
                  />
                ) : (
                  <LeafRow
                    key={leaf.path}
                    leaf={leaf}
                    onRequestClose={onRequestClose}
                    disabled={leafDisabled(leaf.path)}
                    lockTooltip={lockTooltip}
                  />
                )
              )}
            </div>
    ));
  }
}

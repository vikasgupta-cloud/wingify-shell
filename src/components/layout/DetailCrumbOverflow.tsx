/** Detail header — leading overflow crumb. Hover shows everything before the last two trail segments. */
/* Change summary: the earlier path (workspace, product, extra links) now shows inline as compact
 * icon steps; the ⋯ popover is only used when the trail runs out of room (an entity name marked
 * `data-crumb-fit` would truncate, or the row overflows). Reuses WorkspaceSwitcher / ProductCrumb
 * (new `iconOnly` mode) and the existing popover unchanged.
 * @undo: return the `overflowTrigger` popover unconditionally (drop the inline branch + measuring).
 * Follow-up: the trail is now always inline (icons everywhere except the entity name), so folding
 * into ⋯ is opt-in via `collapsible` (off by default). Earlier links with an `icon` show icon-only.
 * Follow-up: workspace shows icon + name + #number (same switcher as list pages); when tight its
 * name gives way first (shrinkable lead), then the entity name truncates.
 * Follow-up: order flipped — the entity name shortens first (down to half, see DetailShell), then
 * the workspace name, then its #number, folding to the icon. Lead keeps a measured floor
 * (useShrinkFloor) so icons/separators never overlap. */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as Popover from "@radix-ui/react-popover";
import { MoreHorizontal, type LucideIcon } from "@/components/icons/protoLucide";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useIsGetStartedLocked } from "@/store/getStartedOnboarding";
import { useShrinkFloor } from "@/lib/useShrinkFloor";
import {
  CrumbIconTooltip,
  crumbIconTriggerClass,
  ProductCrumb,
} from "./CrumbSwitchers";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const OPEN_MS = 120;
const CLOSE_MS = 220;

export type OverflowCrumb = { label: string; to: string; icon?: LucideIcon };

type Props = {
  /** Collapsed product node (opens product switcher). */
  product?: NavItem;
  /** Extra plain links after workspace / product (e.g. analytics list crumb). */
  earlier?: OverflowCrumb[];
  /** Fold the inline steps into ⋯ when the entity name would truncate. */
  collapsible?: boolean;
};

/** Width of the ⋯ trigger that replaces the inline steps when collapsed. */
const OVERFLOW_TRIGGER_PX = 22;

function TrailSeparator() {
  return (
    <span className="shrink-0 text-muted-foreground" aria-hidden>
      /
    </span>
  );
}

function EarlierLink({ crumb }: { crumb: OverflowCrumb }) {
  const Icon = crumb.icon;
  if (Icon) {
    return (
      <CrumbIconTooltip label={crumb.label}>
        <Link to={crumb.to} aria-label={crumb.label} className={crumbIconTriggerClass}>
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        </Link>
      </CrumbIconTooltip>
    );
  }
  return (
    <Link
      to={crumb.to}
      title={crumb.label}
      className="max-w-[10rem] shrink-0 truncate rounded-md px-1 py-0.5 font-normal text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted"
    >
      {crumb.label}
    </Link>
  );
}

/** How far the trail is short of fitting: truncated `data-crumb-fit` text + row overflow. */
function trailDeficit(row: HTMLElement): number {
  let deficit = Math.max(0, row.scrollWidth - row.clientWidth);
  row.querySelectorAll<HTMLElement>("[data-crumb-fit]").forEach((el) => {
    deficit = Math.max(deficit, el.scrollWidth - el.clientWidth);
  });
  return deficit > 1 ? deficit : 0;
}

export default function DetailCrumbOverflow({
  product,
  earlier = [],
  collapsible = false,
}: Props) {
  const navLocked = useIsGetStartedLocked();
  const { pathname } = useLocation();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const leadRef = useRef<HTMLSpanElement>(null);
  useShrinkFloor(leadRef);
  /** Collapsed per page — navigating to another entity re-tries the inline trail. */
  const [collapsedPath, setCollapsedPath] = useState<string | null>(null);
  const collapsed = collapsedPath === pathname;
  /** Header width at which the inline trail fits again (set when collapsing). */
  const reopenAtRef = useRef(0);

  const fitTrail = () => {
    const row = anchorRef.current?.parentElement;
    if (!row) return;
    if (!collapsible) {
      if (collapsed) setCollapsedPath(null);
      return;
    }
    const bounds = row.closest("header") ?? row;
    if (!collapsed) {
      const deficit = trailDeficit(row);
      if (deficit === 0) return;
      const freed = (leadRef.current?.offsetWidth ?? 0) - OVERFLOW_TRIGGER_PX;
      reopenAtRef.current = bounds.clientWidth + deficit;
      if (freed > 0) setCollapsedPath(pathname);
      return;
    }
    if (bounds.clientWidth >= reopenAtRef.current) setCollapsedPath(null);
  };
  const fitTrailRef = useRef(fitTrail);
  fitTrailRef.current = fitTrail;

  useLayoutEffect(() => {
    fitTrailRef.current();
  });

  useEffect(() => {
    const row = anchorRef.current?.parentElement;
    if (!row || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => fitTrailRef.current());
    observer.observe(row.closest("header") ?? row);
    return () => observer.disconnect();
  }, []);

  const [open, setOpen] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  /** Nested menus portal outside this popover — keep overflow open while any are open. */
  const nestedCountRef = useRef(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  const nestedOpen = () => nestedCountRef.current > 0;

  const scheduleOpen = () => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => setOpen(true), OPEN_MS);
  };

  const scheduleClose = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      if (nestedOpen()) return;
      setOpen(false);
    }, CLOSE_MS);
  };

  const handleNestedOpenChange = (next: boolean) => {
    nestedCountRef.current = Math.max(
      0,
      nestedCountRef.current + (next ? 1 : -1)
    );
    if (nestedOpen()) {
      window.clearTimeout(closeTimer.current);
      setOpen(true);
      return;
    }
    // Last nested menu closed — dismiss overflow unless pointer is still over it.
    scheduleClose();
  };

  const overflowPopover = (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && nestedOpen()) return;
        setOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Show earlier path"
          title="Show earlier path"
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={scheduleOpen}
          onBlur={scheduleClose}
          className={cn(
            "inline-flex h-7 shrink-0 items-center justify-center rounded-md px-1 text-muted-foreground outline-none transition-colors",
            "hover:bg-muted/60 hover:text-foreground focus-visible:bg-muted/60 focus-visible:text-foreground",
            open && "text-foreground"
          )}
        >
          <MoreHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (nestedOpen()) e.preventDefault();
          }}
          className="z-50 rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg outline-none"
        >
          <div className="flex flex-wrap items-center gap-1 text-sm">
            <WorkspaceSwitcher
              compact
              tone="muted"
              onOpenChange={handleNestedOpenChange}
            />
            {product ? (
              <>
                <span className="shrink-0 text-muted-foreground" aria-hidden>
                  /
                </span>
                <ProductCrumb
                  item={product}
                  locked={navLocked}
                  tone="muted"
                  onOpenChange={handleNestedOpenChange}
                />
              </>
            ) : null}
            {earlier.map((crumb) => (
              <span key={crumb.to} className="contents">
                <span className="shrink-0 text-muted-foreground" aria-hidden>
                  /
                </span>
                <Link
                  to={crumb.to}
                  title={crumb.label}
                  className="max-w-[10rem] truncate rounded-md px-1 py-0.5 font-normal text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted"
                >
                  {crumb.label}
                </Link>
              </span>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );

  return (
    <span ref={anchorRef} className="contents">
      {collapsed ? (
        overflowPopover
      ) : (
        // @undo className="flex min-w-0 shrink-[999] items-center gap-1" (workspace gave way first)
        <span ref={leadRef} className="flex min-w-0 shrink items-center gap-1">
          {/* @undo <WorkspaceSwitcher iconOnly /> — workspace now matches the list-page trail. */}
          <WorkspaceSwitcher />
          {product ? (
            <>
              <TrailSeparator />
              <ProductCrumb item={product} locked={navLocked} iconOnly />
            </>
          ) : null}
          {earlier.map((crumb) => (
            <span key={crumb.to} className="contents">
              <TrailSeparator />
              <EarlierLink crumb={crumb} />
            </span>
          ))}
        </span>
      )}
    </span>
  );
}

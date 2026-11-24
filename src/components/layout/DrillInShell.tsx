/*
 * Change summary: the main nav (existing ExpandedNav, locked collapsed via `forceCollapsed`) is
 * always shown on the left of Settings / Configuration / Upgrade; it cannot be expanded. The
 * left-edge slide-out overlay and the "[" shortcut are commented out (@undo) as redundant.
 * A hairline (existing border-panel-border token) separates the rail from the sub-nav.
 * Follow-up: the breadcrumb header spans the full width next to the main rail; Settings /
 * Configuration / Upgrade sub-nav starts below that header (not beside it).
 * Follow-up: Tag status badge (Badge + Tooltip) only on Websites and Apps → Introduction.
 */
// @undo — edge slide-out state: import { useEffect, useRef, useState } from "react";
// @undo — edge slide-out portal: import { createPortal } from "react-dom";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  ChevronDown,
  CircleMinus,
  CirclePlus,
  Download,
  FileText,
  History,
  MoreVertical,
} from "@/components/icons/protoLucide";
// @undo RefreshCw — Tag badge no longer shows a leading icon
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  downloadMtuCycles,
  MTU_BILLING_CYCLES,
  MTU_HISTORY_PATH,
} from "@/data/webExperimentationSubscription";
import { findProfileMode } from "../../config/navigation";
// @undo — only used by the edge slide-out: import { cn } from "../../lib/utils";
import { useIntegrationRequestStore } from "@/store/integrationRequest";
import DrillInBreadcrumb from "./DrillInBreadcrumb";
import DrillInNav from "./DrillInNav";
import ExpandedNav from "./ExpandedNav";
import UpgradeNav from "./UpgradeNav";
// @undo — logo lived in header; now inside DrillInNav like ExpandedNav
// import WingifyLogoButton from "./WingifyLogoButton";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

// @undo — edge slide-out timings:
// const EDGE_OPEN_DELAY_MS = 240;
// const OVERLAY_CLOSE_GRACE_MS = 250;

const WNA_SITES_PATH = "/configuration/websites-and-apps/sites";
const WNA_INTRODUCTION_PATH = "/configuration/websites-and-apps/introduction";
const INTEGRATIONS_PATH = "/configuration/integrations";
const ACCOUNT_USERS_PATH = "/settings/accounts/users";

/** Dummy tag compile status — DS neutral light pill Badge + rich Tooltip. */
function TagStatusBadge() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Tag status"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {/* @undo variant="outline" — DS sample is tone=neutral fill=light pill */}
            {/* DS medium = 28px → Badge size="lg" (h-7). @undo size="md" (24px) */}
            <Badge
              tone="neutral"
              fill="light"
              size="lg"
              className="pointer-events-none font-medium"
            >
              {/* @undo <RefreshCw strokeWidth={1.75} aria-hidden /> */}
              Tag
            </Badge>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="max-w-[20rem] border border-border bg-popover px-3 py-3 text-left text-popover-foreground shadow-md"
        >
          {/* @undo — info callout removed:
          <p className="rounded-md bg-[var(--info-bg)] …">Compiling the tag…</p>
          */}
          <div className="flex flex-col gap-1 text-xs leading-snug text-foreground">
            <p>
              Tag version:{" "}
              {/* @undo text-[var(--badge-berry-light-fg)] */}
              <span className="font-semibold text-foreground">next</span>
            </p>
            <p className="text-muted-foreground">
              Last update: 11/19/2026 - 6:04:13 AM - UTC -05:00
            </p>
          </div>
          <TooltipArrow width={12} height={6} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
/** Header CTAs (schedule / view plan / more) for every Subscription + Inactive Subscriptions leaf. */
const SUBSCRIPTION_CTA_PREFIXES = [
  "/settings/subscription/",
  "/settings/inactive/",
] as const;

/** Assets Hub leaf → primary header CTA label (stub actions for now). */
const ASSETS_HUB_HEADER_CTAS: Record<string, string> = {
  "/configuration/assets-hub/images": "Upload Image",
  "/configuration/assets-hub/widgets": "Create Widget",
  "/configuration/assets-hub/themes": "Create Theme",
  "/configuration/assets-hub/code-snippets": "Add Code Snippet",
};

/**
 * Linear-style drill-in surface for every Profile flyout destination (Settings,
 * Configuration, …). Collapsed main rail (not expandable) + drill-in sidebar.
 * Header CTAs: Add new (WNA sites), Request new integration (list) /
 * Create connection (integration detail).
 * Workspace status banners live in RootChrome (above header).
 */
export default function DrillInShell() {
  const { pathname } = useLocation();
  const mode = findProfileMode(pathname);
  const openIntegrationRequest = useIntegrationRequestStore((s) => s.openRequest);
  const showAddWebsite = pathname === WNA_SITES_PATH;
  const showTagBadge = pathname === WNA_INTRODUCTION_PATH;
  const showRequestIntegration = pathname === INTEGRATIONS_PATH;
  const showCreateConnection =
    pathname.startsWith(`${INTEGRATIONS_PATH}/`) &&
    pathname.length > INTEGRATIONS_PATH.length + 1;
  const isWebsiteDetail =
    pathname.startsWith(`${WNA_SITES_PATH}/`) &&
    pathname.length > WNA_SITES_PATH.length + 1;
  // Campaign detail hides workspace + mode crumbs; same on these entity pages.
  const hideParentCrumbs = showCreateConnection || isWebsiteDetail;
  const showAddUser = pathname === ACCOUNT_USERS_PATH;
  const isMtuHistory = pathname === MTU_HISTORY_PATH;
  const showSubscriptionCtas =
    !isMtuHistory &&
    pathname !== "/settings/subscription/invoice-history" &&
    pathname !== "/settings/subscription/billing-profile" &&
    pathname !== "/settings/subscription/visitor-allocation" &&
    SUBSCRIPTION_CTA_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const assetsHubCtaLabel = ASSETS_HUB_HEADER_CTAS[pathname];
  /* @undo — left-edge slide-out of the main nav (replaced by the always-visible rail):
  const [navOpen, setNavOpen] = useState(false);
  const [navRendered, setNavRendered] = useState(false);
  const [navShown, setNavShown] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);

  const cancelOpen = () => window.clearTimeout(openTimer.current);
  const cancelScheduledClose = () => window.clearTimeout(closeTimer.current);
  const scheduleEdgeOpen = () => {
    cancelScheduledClose();
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(
      () => setNavOpen(true),
      EDGE_OPEN_DELAY_MS
    );
  };
  const scheduleOverlayClose = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => setNavOpen(false),
      OVERLAY_CLOSE_GRACE_MS
    );
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "Escape") setNavOpen(false);
      else if (e.key === "[" && tag !== "INPUT" && tag !== "TEXTAREA")
        setNavOpen((open) => !open);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (navOpen) {
      setNavRendered(true);
      let raf2: number | undefined;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setNavShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2 !== undefined) cancelAnimationFrame(raf2);
      };
    }
    setNavShown(false);
    const unmountTimer = window.setTimeout(() => setNavRendered(false), 280);
    return () => window.clearTimeout(unmountTimer);
  }, [navOpen]);
  */

  if (!mode) {
    return <Navigate to="/home/dashboard" replace />;
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      {/* Hairline separates the main rail from the header + drill-in column. */}
      <div className="flex h-full shrink-0 border-r border-panel-border">
        <ExpandedNav forceCollapsed />
      </div>

      {/* @undo — sub-nav sat beside the header:
          {mode.id === "upgrade" ? <UpgradeNav … /> : <DrillInNav … />}
          then a column with header + main only.
          Now the breadcrumb header spans to the main rail; sub-nav starts below it. */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[56px] shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
          <div className="flex min-w-0 items-center gap-1.5">
            {/* @undo — <WingifyLogoButton /> removed from header; bird is in DrillInNav */}
            {hideParentCrumbs ? null : (
              <>
                <WorkspaceSwitcher />
                <span className="text-sm text-muted-foreground" aria-hidden>
                  /
                </span>
              </>
            )}
            <DrillInBreadcrumb
              mode={mode}
              pathname={pathname}
              hideModeSwitcher={hideParentCrumbs}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {showTagBadge ? <TagStatusBadge /> : null}
            {showAddWebsite ? (
              <Button type="button" className="h-9 gap-1.5 px-3 shadow-none">
                <CirclePlus className="size-4" strokeWidth={1.75} aria-hidden />
                Add new
              </Button>
            ) : null}
            {showAddUser ? (
              <Button type="button" className="h-9 gap-1.5 px-3 shadow-none">
                <CirclePlus className="size-4" strokeWidth={1.75} aria-hidden />
                Add User
              </Button>
            ) : null}
            {showRequestIntegration ? (
              <Button
                type="button"
                className="h-9 shadow-none"
                onClick={openIntegrationRequest}
              >
                Request new integration
              </Button>
            ) : null}
            {showCreateConnection ? (
              <Button type="button" className="h-9 gap-1.5 px-3 shadow-none">
                <CirclePlus className="size-4" strokeWidth={1.75} aria-hidden />
                Create connection
              </Button>
            ) : null}
            {assetsHubCtaLabel ? (
              <Button type="button" className="h-9 gap-1.5 px-3 shadow-none">
                <CirclePlus className="size-4" strokeWidth={1.75} aria-hidden />
                {assetsHubCtaLabel}
              </Button>
            ) : null}
            {isMtuHistory ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5 shadow-none"
                  >
                    <Download className="size-4" strokeWidth={1.75} aria-hidden />
                    Export CSV
                    <ChevronDown className="size-3.5" strokeWidth={1.75} aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2">
                  <DropdownMenuItem
                    className="flex-col items-start gap-1 whitespace-normal rounded-md px-3 py-3"
                    onSelect={() =>
                      downloadMtuCycles(
                        MTU_BILLING_CYCLES.filter((cycle) => cycle.current)
                      )
                    }
                  >
                    <span className="font-semibold text-foreground">
                      Current billing cycle
                    </span>
                    <span className="text-sm font-normal leading-snug text-muted-foreground">
                      Export monthly MTU usage for the current billing cycle
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex-col items-start gap-1 whitespace-normal rounded-md px-3 py-3"
                    onSelect={() => downloadMtuCycles(MTU_BILLING_CYCLES)}
                  >
                    <span className="font-semibold text-foreground">
                      All Billing Cycles
                    </span>
                    <span className="text-sm font-normal leading-snug text-muted-foreground">
                      Export monthly MTU usage for all billing cycles
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            {showSubscriptionCtas ? (
              <>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Setup a meeting"
                        className="size-9 shadow-none"
                      >
                        <Calendar className="size-4" strokeWidth={1.75} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Setup a meeting</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="View Plan"
                        className="size-9 shadow-none"
                      >
                        <ArrowUpRight className="size-4" strokeWidth={1.75} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">View Plan</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label="More subscription actions"
                      className="size-9 shadow-none"
                    >
                      <MoreVertical className="size-4" strokeWidth={1.75} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem className="gap-2">
                      <FileText
                        className="size-4 text-muted-foreground"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      All Invoices
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <History
                        className="size-4 text-muted-foreground"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      Timeline
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <CircleMinus
                        className="size-4 text-muted-foreground"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      Cancel Subscription
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : null}
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          {mode.id === "upgrade" ? (
            <UpgradeNav title={mode.label} />
          ) : (
            <DrillInNav mode={mode} />
          )}
          <main className="min-h-0 flex-1 overflow-y-auto bg-canvas">
            <Outlet />
          </main>
        </div>
      </div>

      {/* @undo — left-edge hover zone + slide-out overlay of the main nav:
      <div
        className="fixed inset-y-0 left-0 z-40 w-3"
        onMouseEnter={scheduleEdgeOpen}
        onMouseLeave={cancelOpen}
      />

      {navRendered &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-50",
              !navShown && "pointer-events-none"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-foreground transition-opacity [transition-duration:280ms] ease-out",
                navShown ? "opacity-20" : "opacity-0"
              )}
              onClick={() => setNavOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-y-0 left-0 flex bg-background shadow-xl transition-transform [transition-duration:280ms] ease-out motion-reduce:transition-none",
                navShown ? "translate-x-0" : "-translate-x-full"
              )}
              onMouseEnter={cancelScheduledClose}
              onMouseLeave={scheduleOverlayClose}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a") || target.closest("nav button")) {
                  setNavOpen(false);
                }
              }}
            >
              <ExpandedNav forceCollapsed />
            </div>
          </div>,
          document.body
        )}
      */}
    </div>
  );
}

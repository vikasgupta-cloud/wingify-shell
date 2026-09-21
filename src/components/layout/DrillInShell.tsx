import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { CirclePlus } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { findProfileMode } from "../../config/navigation";
import { cn } from "../../lib/utils";
import { useIntegrationRequestStore } from "@/store/integrationRequest";
import {
  useIsCancellationRevokeWorkspace,
  useIsTrialOverWorkspace,
} from "@/store/workspace";
import CancellationRequestNotice from "./CancellationRequestNotice";
import TrialOverNotice from "./TrialOverNotice";
import DrillInBreadcrumb from "./DrillInBreadcrumb";
import DrillInNav from "./DrillInNav";
import ExpandedNav from "./ExpandedNav";
import UpgradeNav from "./UpgradeNav";
// @undo — logo lived in header; now inside DrillInNav like ExpandedNav
// import WingifyLogoButton from "./WingifyLogoButton";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const EDGE_OPEN_DELAY_MS = 240;
const OVERLAY_CLOSE_GRACE_MS = 250;

const WNA_SITES_PATH = "/configuration/websites-and-apps/sites";
const INTEGRATIONS_PATH = "/configuration/integrations";

/** Assets Hub leaf → primary header CTA label (stub actions for now). */
const ASSETS_HUB_HEADER_CTAS: Record<string, string> = {
  "/configuration/assets-hub/images": "Upload Image",
  "/configuration/assets-hub/widgets": "Create Widget",
  "/configuration/assets-hub/themes": "Create Theme",
  "/configuration/assets-hub/code-snippets": "Add Code Snippet",
};

/** Profile drill-ins that show workspace notices in the header. */
const WORKSPACE_NOTICE_MODE_IDS = new Set([
  "configuration",
  "settings",
  "upgrade",
]);

/**
 * Linear-style drill-in surface for every Profile flyout destination (Settings,
 * Configuration, …). Sidebar + back control + left-edge main-rail reveal.
 * Header CTAs: Add new (WNA sites), Request new integration (Integrations).
 */
export default function DrillInShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const mode = findProfileMode(pathname);
  const openIntegrationRequest = useIntegrationRequestStore((s) => s.openRequest);
  const isCancellationWorkspace = useIsCancellationRevokeWorkspace();
  const isTrialOverWorkspace = useIsTrialOverWorkspace();
  const showWorkspaceNotice =
    mode != null && WORKSPACE_NOTICE_MODE_IDS.has(mode.id);
  const showAddWebsite = pathname === WNA_SITES_PATH;
  const showRequestIntegration = pathname === INTEGRATIONS_PATH;
  const assetsHubCtaLabel = ASSETS_HUB_HEADER_CTAS[pathname];
  const [revoked, setRevoked] = useState(false);
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
    const unmountTimer = window.setTimeout(() => setNavRendered(false), 180);
    return () => window.clearTimeout(unmountTimer);
  }, [navOpen]);

  useEffect(() => {
    setRevoked(false);
  }, [isCancellationWorkspace]);

  if (!mode) {
    return <Navigate to="/home/dashboard" replace />;
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      {mode.id === "upgrade" ? <UpgradeNav /> : <DrillInNav mode={mode} />}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
          <div className="flex min-w-0 items-center gap-2">
            {/* @undo — <WingifyLogoButton /> removed from header; bird is in DrillInNav */}
            <WorkspaceSwitcher />
            <span className="text-sm text-muted-foreground">/</span>
            <DrillInBreadcrumb mode={mode} pathname={pathname} />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {isTrialOverWorkspace && showWorkspaceNotice && (
              <TrialOverNotice onUpgrade={() => navigate("/upgrade")} />
            )}
            {isCancellationWorkspace && !revoked && showWorkspaceNotice && (
              <CancellationRequestNotice onRevoke={() => setRevoked(true)} />
            )}
            {showAddWebsite ? (
              <Button type="button" className="h-9 gap-1.5 px-3 shadow-none">
                <CirclePlus className="size-4" strokeWidth={1.75} aria-hidden />
                Add new
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
            {assetsHubCtaLabel ? (
              <Button type="button" className="h-9 gap-1.5 px-3 shadow-none">
                <CirclePlus className="size-4" strokeWidth={1.75} aria-hidden />
                {assetsHubCtaLabel}
              </Button>
            ) : null}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-canvas">
          <Outlet />
        </main>
      </div>

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
                "absolute inset-0 bg-foreground transition-opacity [transition-duration:180ms] ease-out",
                navShown ? "opacity-20" : "opacity-0"
              )}
              onClick={() => setNavOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-y-0 left-0 flex bg-background shadow-xl transition-transform [transition-duration:180ms] ease-out motion-reduce:transition-none",
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
    </div>
  );
}

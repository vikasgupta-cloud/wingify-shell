import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { findProfileMode } from "../../config/navigation";
import { cn } from "../../lib/utils";
import DrillInBreadcrumb from "./DrillInBreadcrumb";
import DrillInNav from "./DrillInNav";
import ExpandedNav from "./ExpandedNav";
import UpgradeNav from "./UpgradeNav";
import WingifyLogoButton from "./WingifyLogoButton";
import WorkspaceSwitcher from "./WorkspaceSwitcher";

const EDGE_OPEN_DELAY_MS = 240;
const OVERLAY_CLOSE_GRACE_MS = 250;

/**
 * Linear-style drill-in surface for every Profile flyout destination (Settings,
 * Profile, Websites and Apps, …). Sidebar + back control + left-edge main-rail
 * reveal (same pattern as DetailShell / reports).
 */
export default function DrillInShell() {
  const { pathname } = useLocation();
  const mode = findProfileMode(pathname);
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

  if (!mode) {
    return <Navigate to="/home/dashboard" replace />;
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      {mode.id === "upgrade" ? <UpgradeNav /> : <DrillInNav mode={mode} />}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
          <WingifyLogoButton />
          <WorkspaceSwitcher />
          <span className="text-sm text-muted-foreground">/</span>
          <DrillInBreadcrumb mode={mode} pathname={pathname} />
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

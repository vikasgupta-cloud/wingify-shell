// @summary Full-page Wingz chrome: TopBar without main rail; edge-reveal nav like DetailShell.
// Reuses ExpandedNav (forceCollapsed), TopBar, and GlobalWingzDock from layout.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Outlet } from "react-router-dom";
import ExpandedNav from "@/components/layout/ExpandedNav";
import GlobalWingzDock from "@/components/layout/GlobalWingzDock";
import TopBar from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

const EDGE_OPEN_DELAY_MS = 240;
const OVERLAY_CLOSE_GRACE_MS = 250;
const OVERLAY_ANIM_MS = 180;

export default function WingzChatShell() {
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
      const id = requestAnimationFrame(() => setNavShown(true));
      return () => cancelAnimationFrame(id);
    }
    setNavShown(false);
    const t = window.setTimeout(() => setNavRendered(false), OVERLAY_ANIM_MS);
    return () => window.clearTimeout(t);
  }, [navOpen]);

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-panel">
        <TopBar showLogo />
        <main
          data-slot="wingz-chat-body"
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background"
        >
          <Outlet />
        </main>
        <GlobalWingzDock />
      </div>

      <div
        className="fixed inset-y-0 left-0 z-40 w-3"
        onMouseEnter={scheduleEdgeOpen}
        onMouseLeave={cancelOpen}
        aria-hidden
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

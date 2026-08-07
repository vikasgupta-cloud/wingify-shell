import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Palette, Type, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import FontPicker from "./FontPicker";
import CtaColorPicker from "./CtaColorPicker";

/** Dwell on the far-right edge this long before the playground opens. */
const EDGE_OPEN_DELAY_MS = 5000;
const CLOSE_ANIM_MS = 180;
/** Pointer must stay within this many px of the right viewport edge. */
const EDGE_ZONE_PX = 16;

/**
 * Hidden design playground — keep the cursor on the extreme right edge for 5s
 * to open fonts + CTA color. Close returns it to hidden.
 */
export default function FontController() {
  const [open, setOpen] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const [dwellMs, setDwellMs] = useState(0);
  const openTimer = useRef(0);
  const dwellStartedAt = useRef<number | null>(null);
  const rafRef = useRef(0);
  const inZoneRef = useRef(false);
  const lastXRef = useRef(0);
  const openRef = useRef(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const cancelOpen = () => {
    window.clearTimeout(openTimer.current);
    openTimer.current = 0;
    dwellStartedAt.current = null;
    inZoneRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setDwellMs(0);
  };

  const tickDwell = () => {
    if (dwellStartedAt.current == null) return;
    const elapsed = Date.now() - dwellStartedAt.current;
    setDwellMs(Math.min(EDGE_OPEN_DELAY_MS, elapsed));
    if (elapsed < EDGE_OPEN_DELAY_MS) {
      rafRef.current = requestAnimationFrame(tickDwell);
    }
  };

  const beginDwell = () => {
    if (openRef.current || inZoneRef.current) return;
    inZoneRef.current = true;
    dwellStartedAt.current = Date.now();
    setDwellMs(0);
    window.clearTimeout(openTimer.current);
    openTimer.current = window.setTimeout(() => {
      setOpen(true);
      cancelOpen();
    }, EDGE_OPEN_DELAY_MS);
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tickDwell);
  };

  const close = () => {
    setOpen(false);
    cancelOpen();
    // If the pointer is still parked on the edge, arm dwell again.
    requestAnimationFrame(() => {
      if (lastXRef.current >= window.innerWidth - EDGE_ZONE_PX) {
        beginDwell();
      }
    });
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      lastXRef.current = e.clientX;
      if (openRef.current) return;
      const nearRight = e.clientX >= window.innerWidth - EDGE_ZONE_PX;
      if (nearRight) beginDwell();
      else if (inZoneRef.current) cancelOpen();
    };
    const onLeaveWindow = () => {
      if (!openRef.current) cancelOpen();
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      cancelOpen();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      setRendered(true);
      let raf2: number | undefined;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(raf1);
        if (raf2 !== undefined) cancelAnimationFrame(raf2);
      };
    }
    setShown(false);
    const unmountTimer = window.setTimeout(
      () => setRendered(false),
      CLOSE_ANIM_MS
    );
    return () => window.clearTimeout(unmountTimer);
  }, [open]);

  const progress = dwellMs / EDGE_OPEN_DELAY_MS;

  return (
    <>
      {/* Dwell progress — only while holding the right edge. */}
      {!open && progress > 0 ? (
        <div
          className="pointer-events-none fixed inset-y-0 right-0 z-[80] w-1 bg-border"
          aria-hidden
        >
          <div
            className="absolute bottom-0 right-0 w-full bg-foreground transition-[height] duration-75 ease-linear"
            style={{ height: `${progress * 100}%` }}
          />
        </div>
      ) : null}

      {rendered &&
        createPortal(
          <div
            className={cn(
              "fixed inset-0 z-[70]",
              !shown && "pointer-events-none"
            )}
          >
            <button
              type="button"
              aria-label="Dismiss design controller"
              className={cn(
                "absolute inset-0 bg-foreground transition-opacity ease-out motion-reduce:transition-none",
                shown ? "opacity-20" : "opacity-0"
              )}
              style={{ transitionDuration: `${CLOSE_ANIM_MS}ms` }}
              onClick={close}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Design controller"
              className={cn(
                "absolute inset-y-0 right-0 flex w-[min(100vw-1.5rem,340px)] flex-col border-l border-border bg-background shadow-xl transition-transform ease-out motion-reduce:transition-none",
                shown ? "translate-x-0" : "translate-x-full"
              )}
              style={{ transitionDuration: `${CLOSE_ANIM_MS}ms` }}
            >
              <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2 text-foreground">
                    <Type className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                    <span className="text-sm font-semibold tracking-tight">
                      Design controller
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Fonts · CTA color from tokens
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  aria-label="Close design controller"
                  onClick={close}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <FontPicker />
                <div className="border-t border-border">
                  <div className="flex items-center gap-2 px-3 pt-2.5 text-muted-foreground">
                    <Palette className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="text-[11px] font-medium uppercase tracking-wide">
                      Theme color
                    </span>
                  </div>
                  <CtaColorPicker />
                </div>
                <p className="px-3 pb-4 text-[10px] leading-relaxed text-muted-foreground">
                  Hold the far-right edge for 5 seconds to open again after
                  closing. A thin progress bar fills while you wait.
                </p>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

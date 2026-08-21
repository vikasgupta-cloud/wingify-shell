import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Palette, RotateCcw, X } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { DESIGN_CONTROLLER_ENABLED } from "@/store/designController";
import { useSessionRecordingDesignStore } from "@/store/sessionRecordingDesign";

const CLOSE_ANIM_MS = 180;

/**
 * Page-scoped design controller for the session recording player.
 * Mount only from SessionRecordingPlayerPage — not RootChrome.
 */
export default function SessionRecordingDesignController() {
  if (!DESIGN_CONTROLLER_ENABLED) return null;

  const open = useSessionRecordingDesignStore((s) => s.open);
  const setOpen = useSessionRecordingDesignStore((s) => s.setOpen);
  const panelSeparator = useSessionRecordingDesignStore((s) => s.panelSeparator);
  const setPanelSeparator = useSessionRecordingDesignStore(
    (s) => s.setPanelSeparator
  );
  const reset = useSessionRecordingDesignStore((s) => s.reset);

  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const [tabHover, setTabHover] = useState(false);

  useEffect(() => {
    if (open) setTabHover(false);
  }, [open]);

  const close = () => setOpen(false);

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

  return (
    <>
      {!open ? (
        <div
          data-design-controller=""
          className="pointer-events-none fixed inset-y-0 right-0 z-[65] flex items-center"
        >
          <button
            type="button"
            aria-label="Open session recording design controller"
            onClick={() => setOpen(true)}
            onMouseEnter={() => setTabHover(true)}
            onMouseLeave={() => setTabHover(false)}
            onFocus={() => setTabHover(true)}
            onBlur={() => setTabHover(false)}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 rounded-l-lg border border-r-0 border-border bg-background text-foreground shadow-md transition-[padding] duration-200 ease-out motion-reduce:transition-none",
              tabHover ? "py-2 pl-2 pr-2.5" : "p-2"
            )}
          >
            <Palette
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-xs font-semibold tracking-tight transition-[max-width,opacity] duration-200",
                tabHover
                  ? "max-w-[7.5rem] opacity-100"
                  : "max-w-0 opacity-0"
              )}
            >
              Recording
            </span>
          </button>
        </div>
      ) : null}

      {rendered &&
        createPortal(
          <div
            data-design-controller=""
            className={cn(
              "fixed inset-0 z-[70]",
              !shown && "pointer-events-none"
            )}
          >
            <button
              type="button"
              aria-label="Dismiss recording design controller"
              className={cn(
                "absolute inset-0 bg-foreground transition-opacity ease-out motion-reduce:transition-none",
                shown ? "opacity-[0.18]" : "opacity-0"
              )}
              style={{ transitionDuration: `${CLOSE_ANIM_MS}ms` }}
              onClick={close}
            />

            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Session recording design controller"
              className={cn(
                "absolute inset-y-0 right-0 flex w-[min(100vw-1rem,360px)] flex-col border-l border-border bg-background shadow-xl transition-transform ease-out motion-reduce:transition-none",
                shown ? "translate-x-0" : "translate-x-full"
              )}
              style={{ transitionDuration: `${CLOSE_ANIM_MS}ms` }}
            >
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4">
                <div className="min-w-0 space-y-0.5">
                  <h2 className="font-title text-lg font-semibold tracking-tight text-foreground">
                    Recording design
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Layout and chrome for the session player
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground"
                  aria-label="Close recording design controller"
                  onClick={close}
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </Button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <section className="space-y-3 border-b border-border px-4 py-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Layout
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Gaps and edges between the stage, side panel, and control
                      dock.
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <Label
                      htmlFor="recording-panel-separator"
                      className="cursor-pointer text-sm font-medium text-foreground"
                    >
                      Separator between panels
                    </Label>
                    <Switch
                      id="recording-panel-separator"
                      checked={panelSeparator}
                      onCheckedChange={setPanelSeparator}
                      aria-label="Show separator between panels"
                    />
                  </div>
                </section>
              </div>

              <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={reset}
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.75} />
                  Reset
                </Button>
              </footer>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

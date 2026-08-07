import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useDesignControllerStore } from "../../store/designController";
import { Button } from "@/components/ui/button";
import FontPicker from "./FontPicker";
import CtaColorPicker from "./CtaColorPicker";

/** Blank-space clicks required to open the playground (hidden gesture). */
const OPEN_CLICKS = 5;
/** Max gap between blank clicks before the streak resets. */
const CLICK_STREAK_MS = 2500;
const CLOSE_ANIM_MS = 180;

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  "option",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='option']",
  "[role='tab']",
  "[role='checkbox']",
  "[role='radio']",
  "[role='switch']",
  "[role='slider']",
  "[role='combobox']",
  "[contenteditable='true']",
  "[data-design-controller]",
].join(",");

function isBlankSpaceClick(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("[data-design-controller]")) return false;
  if (target.closest(INTERACTIVE_SELECTOR)) return false;
  return true;
}

/**
 * Design playground for fonts + CTA color. Open from the profile menu CTA,
 * or by clicking blank space 5 times on any page.
 */
export default function FontController() {
  const open = useDesignControllerStore((s) => s.open);
  const setOpen = useDesignControllerStore((s) => s.setOpen);
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const openRef = useRef(false);
  const clickCount = useRef(0);
  const lastClickAt = useRef(0);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  const close = () => {
    setOpen(false);
    clickCount.current = 0;
    lastClickAt.current = 0;
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (openRef.current) return;
      if (e.button !== 0) return;
      if (!isBlankSpaceClick(e.target)) {
        clickCount.current = 0;
        lastClickAt.current = 0;
        return;
      }

      const now = Date.now();
      if (now - lastClickAt.current > CLICK_STREAK_MS) {
        clickCount.current = 0;
      }
      lastClickAt.current = now;
      clickCount.current += 1;

      if (clickCount.current >= OPEN_CLICKS) {
        clickCount.current = 0;
        lastClickAt.current = 0;
        setOpen(true);
      }
    };

    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [setOpen]);

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
              aria-label="Dismiss design controller"
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
              aria-label="Design controller"
              className={cn(
                "absolute inset-y-0 right-0 flex w-[min(100vw-1rem,440px)] flex-col border-l border-border bg-background shadow-xl transition-transform ease-out motion-reduce:transition-none",
                shown ? "translate-x-0" : "translate-x-full"
              )}
              style={{ transitionDuration: `${CLOSE_ANIM_MS}ms` }}
            >
              <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5">
                <div className="min-w-0 space-y-1">
                  <h2 className="font-title text-xl font-semibold tracking-tight text-foreground">
                    Design controller
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fonts and primary CTA color
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-muted-foreground"
                  aria-label="Close design controller"
                  onClick={close}
                >
                  <X className="h-5 w-5" strokeWidth={1.75} />
                </Button>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto">
                <FontPicker />
                <div className="border-t border-border">
                  <CtaColorPicker />
                </div>
                <p className="px-6 pb-8 pt-2 text-xs leading-relaxed text-muted-foreground">
                  Open from your profile menu, or click blank space 5 times on
                  any page.
                </p>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, Download, Palette, RotateCcw, X } from "@/components/icons/protoLucide";
import { cn } from "../../lib/utils";
import { useDesignControllerStore } from "../../store/designController";
import { useThemeStore } from "../../store/theme";
import { useFontStore } from "../../store/fonts";
import {
  downloadDesignTokensCss,
  downloadDesignTokensJson,
} from "../../config/exportDesignTokens";
import { Button } from "@/components/ui/button";
import ThemePicker from "./ThemePicker";
import FontPicker from "./FontPicker";
import CtaColorPicker from "./CtaColorPicker";
import BackgroundColorPicker from "./BackgroundColorPicker";
import SurfacePicker from "./SurfacePicker";
import HeaderColorPicker from "./HeaderColorPicker";
import IconLibraryPicker from "./IconLibraryPicker";

/** Blank-space clicks required to open (hidden gesture). */
const OPEN_CLICKS = 5;
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
 * Floating design CTA — compact icon tab on the right; expands label on hover;
 * stays fully open until dismissed. Hosts appearance, fonts, and CTA color.
 */
export default function FontController() {
  const open = useDesignControllerStore((s) => s.open);
  const setOpen = useDesignControllerStore((s) => s.setOpen);
  const resetDesign = useDesignControllerStore((s) => s.resetDesign);
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const formElementSchemeId = useThemeStore((s) => s.formElementSchemeId);
  const surfaceSchemeId = useThemeStore((s) => s.surfaceSchemeId);
  const fontAssignments = useFontStore((s) => s.assignments);
  const [rendered, setRendered] = useState(false);
  const [shown, setShown] = useState(false);
  const [tabHover, setTabHover] = useState(false);
  const openRef = useRef(false);
  const clickCount = useRef(0);
  const lastClickAt = useRef(0);

  const exportOptions = {
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    formElementSchemeId,
    surfaceSchemeId,
    fontAssignments,
  };

  useEffect(() => {
    openRef.current = open;
    if (open) setTabHover(false);
  }, [open]);

  const close = () => {
    setOpen(false);
    clickCount.current = 0;
    lastClickAt.current = 0;
  };

  const resetAll = resetDesign;

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

  const tabExpanded = tabHover;

  return (
    <>
      {/* Compact icon tab — always visible; label expands on hover. */}
      {!open ? (
        <div
          data-design-controller=""
          className="pointer-events-none fixed inset-y-0 right-0 z-[65] flex items-center"
        >
          <button
            type="button"
            aria-label="Open design controller"
            onClick={() => setOpen(true)}
            onMouseEnter={() => setTabHover(true)}
            onMouseLeave={() => setTabHover(false)}
            onFocus={() => setTabHover(true)}
            onBlur={() => setTabHover(false)}
            className={cn(
              "pointer-events-auto flex items-center gap-1.5 rounded-l-lg border border-r-0 border-border bg-background text-foreground shadow-md transition-[padding] duration-200 ease-out motion-reduce:transition-none",
              tabExpanded ? "py-2 pl-2 pr-2.5" : "p-2"
            )}
          >
            <Palette
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
            />
            <span
              className={cn(
                "overflow-hidden whitespace-nowrap text-xs font-semibold tracking-tight transition-[max-width,opacity] duration-200",
                tabExpanded
                  ? "max-w-[5.5rem] opacity-100"
                  : "max-w-0 opacity-0"
              )}
            >
              Appearance
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
                "absolute inset-y-0 right-0 flex w-[min(100vw-1rem,360px)] flex-col border-l border-border bg-background shadow-xl transition-transform ease-out motion-reduce:transition-none",
                shown ? "translate-x-0" : "translate-x-full"
              )}
              style={{ transitionDuration: `${CLOSE_ANIM_MS}ms` }}
            >
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4">
                <div className="min-w-0 space-y-0.5">
                  <h2 className="font-title text-lg font-semibold tracking-tight text-foreground">
                    Design controller
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Appearance, fonts, tokens, and charts
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
                <div className="border-b border-border px-3 py-2">
                  <ThemePicker />
                </div>
                <div className="border-b border-border">
                  <SurfacePicker />
                </div>
                <div className="border-b border-border">
                  <BackgroundColorPicker />
                </div>
                <div className="border-b border-border">
                  <HeaderColorPicker />
                </div>
                <div className="border-b border-border">
                  <IconLibraryPicker />
                </div>
                <FontPicker />
                <div className="border-t border-border">
                  <CtaColorPicker />
                </div>

                <div className="space-y-3 border-t border-border px-4 py-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Tokens
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Download scales, semantic values, fonts, and resolved
                      roles for light and dark.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => downloadDesignTokensJson(exportOptions)}
                    >
                      <Download className="size-3.5" strokeWidth={1.75} />
                      JSON
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => downloadDesignTokensCss(exportOptions)}
                    >
                      <Download className="size-3.5" strokeWidth={1.75} />
                      CSS
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 border-t border-border px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Analytics charts
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Browse Mixpanel/Amplitude-style chart types on a full page.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    asChild
                  >
                    <Link to="/design/charts" onClick={close}>
                      Open chart gallery
                      <ArrowRight className="size-3.5" strokeWidth={1.75} />
                    </Link>
                  </Button>
                </div>

                <div className="space-y-2 border-t border-border px-4 py-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Form elements
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Inputs, dropdowns, buttons, sliders, radios, and checkboxes
                    in a real campaign form.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    asChild
                  >
                    <Link to="/design/forms" onClick={close}>
                      Open form gallery
                      <ArrowRight className="size-3.5" strokeWidth={1.75} />
                    </Link>
                  </Button>
                </div>

                <p className="px-4 pb-4 pt-2 text-xs leading-relaxed text-muted-foreground">
                  Selections are saved in this browser. Use the palette tab on
                  the right edge anytime — light/dark is also in your profile
                  menu.
                </p>
              </div>

              <footer className="shrink-0 border-t border-border px-4 py-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={resetAll}
                >
                  <RotateCcw className="size-3.5" strokeWidth={1.75} />
                  Reset all
                </Button>
              </footer>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

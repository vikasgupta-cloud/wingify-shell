/**
 * Embedded design controller — docks as a right-hand column so the page stays
 * usable while colours, fonts, and tokens are tweaked. Compact palette tab on
 * the right edge when closed, shown only when Settings → General enables it.
 */
import { useEffect, useState } from "react";
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
import SavedThemesPicker from "./SavedThemesPicker";
import FontPicker from "./FontPicker";
import HeaderColorPicker from "./HeaderColorPicker";
import IconLibraryPicker from "./IconLibraryPicker";
import ComponentAppearancePicker from "./ComponentAppearancePicker";

const PANEL_WIDTH_PX = 360;

export default function FontController() {
  const open = useDesignControllerStore((s) => s.open);
  const setOpen = useDesignControllerStore((s) => s.setOpen);
  const tabVisible = useDesignControllerStore((s) => s.tabVisible);
  const resetDesign = useDesignControllerStore((s) => s.resetDesign);
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const fontAssignments = useFontStore((s) => s.assignments);
  const [tabHover, setTabHover] = useState(false);

  const exportOptions = {
    themeId,
    colorMode,
    ctaTokenId,
    backgroundTokenId,
    headerTokenId,
    fontAssignments,
  };

  useEffect(() => {
    if (open) setTabHover(false);
  }, [open]);

  const close = () => setOpen(false);

  const resetAll = resetDesign;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const tabExpanded = tabHover;

  // Opt-in via Settings → General. Rendering nothing (rather than a hidden
  // tab) keeps the zero-width column out of the layout entirely.
  if (!open && !tabVisible) return null;

  // Zero-width column at the right edge; the tab peeks into the page so it
  // never covers interactive content until opened (then it docks and pushes).
  if (!open) {
    return (
      <div
        data-design-controller=""
        className="pointer-events-none relative w-0 shrink-0 self-stretch"
      >
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[65] flex items-center">
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
      </div>
    );
  }

  return (
    <aside
      data-design-controller=""
      role="complementary"
      aria-label="Design controller"
      className="flex h-full shrink-0 flex-col border-l border-border bg-background"
      style={{ width: PANEL_WIDTH_PX }}
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
          <SavedThemesPicker />
        </div>
        <div className="border-b border-border">
          <HeaderColorPicker />
        </div>
        <div className="border-b border-border">
          <IconLibraryPicker />
        </div>
        <ComponentAppearancePicker />
        <FontPicker />

        <div className="space-y-3 border-t border-border px-4 py-4">
          <div className="space-y-0.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tokens
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Download scales, semantic values, fonts, and resolved roles for
              light and dark.
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
            <Link to="/design/charts">
              Open chart gallery
              <ArrowRight className="size-3.5" strokeWidth={1.75} />
            </Link>
          </Button>
        </div>

        <p className="px-4 pb-4 pt-2 text-xs leading-relaxed text-muted-foreground">
          Docked beside the app so you can tweak and use the page at the same
          time. Selections are saved in this browser — light/dark is also in
          your profile menu.
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
  );
}

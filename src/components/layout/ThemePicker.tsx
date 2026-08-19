/**
 * Appearance picker — palette pack (Current/New/Koto), light/dark, and theme presets.
 */
import { Moon, Palette, Sun } from "@/components/icons/protoLucide";
import {
  PALETTE_IDS,
  PALETTE_LABELS,
  getPaletteScales,
  type PaletteId,
} from "@/config/palettes";
import { THEMES, type ThemeId } from "@/config/themes";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";

function themeAccent(themeId: ThemeId, colorMode: "light" | "dark", paletteId: PaletteId) {
  const scales = getPaletteScales(paletteId);
  if (themeId === "yellow") return scales.yellow["50"]!;
  if (themeId === "maroon") {
    return colorMode === "dark" ? scales.maroon["400"]! : scales.maroon["900"]!;
  }
  if (themeId === "cherry") return scales.cherry["400"]!;
  if (themeId === "black-yellow") return scales.midnight.base!;
  return scales.midnight.base!;
}

function themeSecondaryAccent(themeId: ThemeId, paletteId: PaletteId): string | null {
  if (themeId !== "black-yellow") return null;
  return getPaletteScales(paletteId).yellow["50"]!;
}

export default function ThemePicker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const colorMode = useThemeStore((s) => s.colorMode);
  const themeId = useThemeStore((s) => s.themeId);
  const paletteId = useThemeStore((s) => s.paletteId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setColorMode = useThemeStore((s) => s.setColorMode);
  const setPalette = useThemeStore((s) => s.setPalette);

  return (
    <div className={cn(compact ? "px-1.5 py-2.5" : "px-3 py-3.5", className)}>
      <div
        className={cn(
          "flex items-center justify-between gap-2",
          compact ? "px-2" : "px-0.5"
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Palette className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="text-xs font-medium uppercase tracking-wide">
            Appearance
          </span>
        </div>

        <div
          role="group"
          aria-label="Light or dark"
          className="inline-flex rounded-lg border border-border bg-background p-0.5"
        >
          <button
            type="button"
            aria-pressed={colorMode === "light"}
            aria-label="Light"
            onClick={() => setColorMode("light")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
              colorMode === "light"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun className="size-3.5" strokeWidth={1.75} />
            Light
          </button>
          <button
            type="button"
            aria-pressed={colorMode === "dark"}
            aria-label="Dark"
            onClick={() => setColorMode("dark")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
              colorMode === "dark"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="size-3.5" strokeWidth={1.75} />
            Dark
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide text-muted-foreground",
            compact ? "px-2" : "px-0.5"
          )}
        >
          Palette
        </p>
        <div
          role="group"
          aria-label="Colour palette pack"
          className="grid grid-cols-3 gap-2"
        >
          {PALETTE_IDS.map((id) => {
            const selected = id === paletteId;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setPalette(id)}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  selected
                    ? "border-foreground bg-accent text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                {PALETTE_LABELS[id]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <p
          className={cn(
            "text-xs font-medium uppercase tracking-wide text-muted-foreground",
            compact ? "px-2" : "px-0.5"
          )}
        >
          Theme
        </p>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => {
            const accent = themeAccent(
              theme.id as ThemeId,
              colorMode,
              paletteId
            );
            const secondary = themeSecondaryAccent(
              theme.id as ThemeId,
              paletteId
            );
            const selected = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setTheme(theme.id as ThemeId)}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs font-medium transition-colors",
                  selected
                    ? "border-foreground bg-accent text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex shrink-0 overflow-hidden rounded-sm border border-black/20">
                  <span
                    className="size-3"
                    style={{ backgroundColor: accent }}
                  />
                  {secondary ? (
                    <span
                      className="size-3"
                      style={{ backgroundColor: secondary }}
                    />
                  ) : null}
                </span>
                {theme.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import { Moon, Palette, Sun } from "lucide-react";
import { THEMES, type ThemeId } from "../../config/themes";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Profile appearance picker — button-color accents + independent light/dark mode.
 * Midnight = midnight primary buttons, not a dark theme.
 */
export default function ThemePicker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setColorMode = useThemeStore((s) => s.setColorMode);

  return (
    <div className={cn(compact ? "px-1 py-2" : "px-3 py-2.5", className)}>
      <div
        className={cn(
          "mb-2 flex items-center justify-between gap-2",
          compact ? "px-2" : "px-0.5"
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Palette className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="text-[11px] font-medium uppercase tracking-wide">
            Appearance
          </span>
        </div>

        <div
          role="group"
          aria-label="Light or dark"
          className="inline-flex rounded-md border border-border bg-background p-0.5"
        >
          <button
            type="button"
            aria-pressed={colorMode === "light"}
            aria-label="Light"
            onClick={() => setColorMode("light")}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium transition-colors",
              colorMode === "light"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun className="size-3" strokeWidth={1.75} />
            Light
          </button>
          <button
            type="button"
            aria-pressed={colorMode === "dark"}
            aria-label="Dark"
            onClick={() => setColorMode("dark")}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium transition-colors",
              colorMode === "dark"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="size-3" strokeWidth={1.75} />
            Dark
          </button>
        </div>
      </div>

      <p
        className={cn(
          "mb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
          compact ? "px-2" : "px-0.5"
        )}
      >
        Button color
      </p>

      <TooltipProvider delayDuration={200}>
        <div
          role="radiogroup"
          aria-label="Button color"
          className="grid grid-cols-5 gap-1.5"
        >
          {THEMES.map((theme) => {
            const selected = theme.id === themeId;
            const [surface, accent, ink] =
              colorMode === "dark" ? theme.swatchesDark : theme.swatchesLight;
            return (
              <Tooltip key={theme.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${theme.label} button color`}
                    onClick={() => setTheme(theme.id as ThemeId)}
                    className={cn(
                      "group flex flex-col items-stretch gap-1 rounded-md p-1 outline-none transition-colors",
                      "hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                      selected && "bg-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "relative block aspect-[5/4] w-full overflow-hidden rounded border transition-[box-shadow,border-color]",
                        selected
                          ? "border-foreground shadow-sm"
                          : "border-border group-hover:border-foreground/40"
                      )}
                      style={{ backgroundColor: surface }}
                      aria-hidden
                    >
                      <span
                        className="absolute inset-x-1 top-1 h-1 rounded-sm"
                        style={{ backgroundColor: ink, opacity: 0.35 }}
                      />
                      <span
                        className="absolute bottom-1 left-1 size-2 rounded-sm"
                        style={{ backgroundColor: accent }}
                      />
                      <span
                        className="absolute bottom-1 right-1 h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: accent }}
                      />
                    </span>
                    <span className="truncate px-0.5 text-center text-[10px] font-medium leading-none text-foreground">
                      {theme.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[180px]">
                  <p className="font-medium">{theme.label} buttons</p>
                  <p className="text-muted-foreground">{theme.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}

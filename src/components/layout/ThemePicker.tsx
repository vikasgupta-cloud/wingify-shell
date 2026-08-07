import { Palette } from "lucide-react";
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
 * Compact theme thumbnails for the profile menu — dense grid so many themes fit.
 */
export default function ThemePicker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const themeId = useThemeStore((s) => s.themeId);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className={cn(compact ? "px-1 py-2" : "px-3 py-2.5", className)}>
      <div
        className={cn(
          "mb-2 flex items-center gap-2 text-muted-foreground",
          compact ? "px-2" : "px-0.5"
        )}
      >
        <Palette className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          Theme
        </span>
      </div>

      <TooltipProvider delayDuration={200}>
        <div
          role="radiogroup"
          aria-label="App theme"
          className="grid grid-cols-4 gap-1.5"
        >
          {THEMES.map((theme) => {
            const selected = theme.id === themeId;
            const [surface, accent, ink] = theme.swatches;
            return (
              <Tooltip key={theme.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={theme.label}
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
                      style={{ backgroundColor: `hsl(${surface})` }}
                      aria-hidden
                    >
                      <span
                        className="absolute inset-x-1 top-1 h-1 rounded-sm"
                        style={{ backgroundColor: `hsl(${ink})`, opacity: 0.2 }}
                      />
                      <span
                        className="absolute bottom-1 left-1 size-2 rounded-sm"
                        style={{ backgroundColor: `hsl(${accent})` }}
                      />
                      <span
                        className="absolute bottom-1 right-1 h-1.5 w-3 rounded-sm"
                        style={{ backgroundColor: `hsl(${ink})` }}
                      />
                    </span>
                    <span className="truncate px-0.5 text-center text-[10px] font-medium leading-none text-foreground">
                      {theme.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[180px]">
                  <p className="font-medium">{theme.label}</p>
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

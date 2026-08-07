import { Palette } from "lucide-react";
import { THEMES, type ThemeId } from "../../config/themes";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * Theme switcher for the profile menu — picks a `data-theme` and updates
 * semantic CSS tokens so chrome, canvas, and surfaces change live.
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
    <div className={cn(compact ? "px-1 py-2" : "px-3 py-3", className)}>
      <div
        className={cn(
          "flex items-center gap-2 text-muted-foreground",
          compact ? "mb-1.5 px-2" : "mb-2.5 px-1"
        )}
      >
        <Palette className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          Theme
        </span>
      </div>

      <RadioGroup
        value={themeId}
        onValueChange={(value) => setTheme(value as ThemeId)}
        className="gap-1"
        aria-label="App theme"
      >
        {THEMES.map((theme) => {
          const selected = theme.id === themeId;
          return (
            <label
              key={theme.id}
              htmlFor={`theme-${theme.id}`}
              className={cn(
                "flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-2 transition-colors hover:bg-muted",
                selected && "bg-accent"
              )}
            >
              <RadioGroupItem
                id={`theme-${theme.id}`}
                value={theme.id}
                className="mt-0.5 border-foreground text-foreground shadow-none [&_svg]:fill-foreground"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {theme.label}
                  </span>
                  <span className="flex items-center gap-0.5" aria-hidden>
                    {theme.swatches.map((hsl, i) => (
                      <span
                        key={i}
                        className="size-2.5 rounded-full border border-border"
                        style={{ backgroundColor: `hsl(${hsl})` }}
                      />
                    ))}
                  </span>
                </span>
                {!compact ? (
                  <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">
                    {theme.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

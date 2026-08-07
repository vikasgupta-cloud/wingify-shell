import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";

/**
 * Light / dark mode control for the profile menu.
 * Button-color accents live in the design floating CTA, not here.
 */
export default function ColorModeToggle({
  className,
}: {
  className?: string;
}) {
  const colorMode = useThemeStore((s) => s.colorMode);
  const setColorMode = useThemeStore((s) => s.setColorMode);

  return (
    <div className={cn("px-3 py-2.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-foreground">Theme</span>
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
              "inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors",
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
              "inline-flex h-7 items-center gap-1.5 rounded px-2 text-xs font-medium transition-colors",
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
    </div>
  );
}

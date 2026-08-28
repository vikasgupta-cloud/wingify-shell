import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeId } from "@/config/themes";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/utils";

export function themeColorPath(themeId: ThemeId): string {
  return `/design-system/themes/${themeId}`;
}

export default function ThemeColorGallery({ themeId }: { themeId: ThemeId }) {
  const setTheme = useThemeStore((s) => s.setTheme);
  const colorMode = useThemeStore((s) => s.colorMode);
  const active = THEMES.find((t) => t.id === themeId) ?? THEMES[0]!;
  const swatches =
    colorMode === "dark" ? active.swatchesDark : active.swatchesLight;

  useEffect(() => {
    setTheme(themeId);
  }, [themeId, setTheme]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-1.5">
        {THEMES.map((theme) => (
          <NavLink
            key={theme.id}
            to={themeColorPath(theme.id)}
            className={({ isActive }) =>
              cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            {theme.label}
          </NavLink>
        ))}
      </div>

      <div className="max-w-2xl space-y-2">
        <h2 className="font-title text-xl font-semibold text-foreground">
          {active.label}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {active.description}. Route{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">
            {themeColorPath(active.id)}
          </code>{" "}
          applies this accent across the shell.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Preview swatches ({colorMode})
        </p>
        <div className="flex overflow-hidden rounded-lg border border-border">
          {swatches.map((hex, i) => (
            <div
              key={`${active.id}-${i}`}
              className="h-16 min-w-0 flex-1"
              style={{ backgroundColor: hex }}
              title={hex}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] tabular-nums text-muted-foreground">
          {swatches.map((hex) => (
            <span key={hex}>{hex}</span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          CTA hierarchy
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button">Primary</Button>
          <Button type="button" variant="outline">
            Outline
          </Button>
          <Button type="button" variant="secondary">
            Secondary
          </Button>
          <Button type="button" variant="tertiary">
            Tertiary
          </Button>
          <Button type="button" variant="ghost">
            Ghost
          </Button>
          <Button type="button" variant="link">
            Link
          </Button>
          <Button type="button" variant="destructive">
            Destructive
          </Button>
          <Button type="button" variant="ai">
            AI
          </Button>
        </div>
      </div>
    </div>
  );
}

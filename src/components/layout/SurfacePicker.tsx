// Design controller — surface presets for chrome (top + side nav), body, cards.

import { Layers } from "@/components/icons/protoLucide";
import {
  SURFACE_SCHEMES,
  surfaceSchemeById,
  type SurfaceSchemeId,
} from "../../config/surfaceTokens";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

export default function SurfacePicker({ className }: { className?: string }) {
  const surfaceSchemeId = useThemeStore((s) => s.surfaceSchemeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const setSurfaceScheme = useThemeStore((s) => s.setSurfaceScheme);
  const active = surfaceSchemeById(surfaceSchemeId);

  return (
    <section className={cn("px-6 py-6", className)}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 text-foreground">
            <Layers className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <h3 className="text-base font-semibold tracking-tight">Surface</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {active
              ? active.description
              : "How nav, body, and cards stack — dark mode uses the matching deep tones"}
          </p>
        </div>
        {surfaceSchemeId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 px-3 text-sm text-muted-foreground"
            onClick={() => setSurfaceScheme(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label="Surface preset"
        className="grid grid-cols-3 gap-3"
      >
        {SURFACE_SCHEMES.map((scheme) => {
          const selected = scheme.id === surfaceSchemeId;
          const fills =
            colorMode === "dark" ? scheme.preview.dark : scheme.preview.light;
          return (
            <button
              key={scheme.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${scheme.label} — ${scheme.description}`}
              title={scheme.description}
              onClick={() => setSurfaceScheme(scheme.id as SurfaceSchemeId)}
              className={cn(
                "group flex flex-col items-stretch gap-1.5 rounded-lg p-1.5 outline-none transition-colors",
                "hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                selected && "bg-accent"
              )}
            >
              <span
                className={cn(
                  "relative flex aspect-[4/3] w-full overflow-hidden rounded-md ring-1 ring-inset transition-shadow",
                  selected
                    ? "ring-2 ring-foreground"
                    : "ring-border group-hover:ring-foreground/40"
                )}
                style={{ backgroundColor: fills.body }}
                aria-hidden
              >
                {/* side nav */}
                <span
                  className="h-full w-[22%] shrink-0 border-r border-border/60"
                  style={{ backgroundColor: fills.chrome }}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  {/* top bar */}
                  <span
                    className="h-[26%] w-full border-b border-border/60"
                    style={{ backgroundColor: fills.chrome }}
                  />
                  {/* card on the body */}
                  <span className="flex-1 p-1">
                    <span
                      className="block h-full w-full rounded-[3px] border border-border/60"
                      style={{ backgroundColor: fills.card }}
                    />
                  </span>
                </span>
              </span>
              <span className="truncate px-0.5 text-center text-[11px] font-medium leading-none text-foreground">
                {scheme.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

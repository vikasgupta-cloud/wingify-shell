// Design controller — surface presets for chrome (top + side nav), body, cards.

import { Layers } from "@/components/icons/protoLucide";
import {
  SURFACE_SCHEMES,
  surfaceSchemeById,
  type SurfaceLayerFills,
  type SurfaceSchemeId,
} from "../../config/surfaceTokens";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

/** Mini app shell — rail + top bar + card, tones from the preset fills. */
function SurfaceThumb({
  fills,
  selected,
}: {
  fills: SurfaceLayerFills;
  selected: boolean;
}) {
  const chromeEqualsBody = fills.chrome === fills.body;
  const cardFloats = fills.card !== fills.body;
  const hairline = "rgb(from var(--foreground) r g b / 0.08)";
  const railRule = chromeEqualsBody ? hairline : "rgb(from var(--foreground) r g b / 0.06)";

  return (
    <span
      className={cn(
        "relative flex aspect-[5/4] w-full overflow-hidden rounded-md border transition-[border-color]",
        selected
          ? "border-foreground"
          : "border-border group-hover:border-foreground/40"
      )}
      style={{ backgroundColor: fills.body }}
      aria-hidden
    >
      {/* Side nav */}
      <span
        className="flex h-full w-[26%] shrink-0 flex-col gap-[3px] px-[5px] py-1.5"
        style={{
          backgroundColor: fills.chrome,
          boxShadow: `inset -1px 0 0 ${railRule}`,
        }}
      >
        <span
          className="mb-0.5 size-1.5 rounded-[2px]"
          style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.22)" }}
        />
        <span
          className="h-[2px] w-full rounded-full"
          style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.14)" }}
        />
        <span
          className="h-[2px] w-[85%] rounded-full"
          style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.1)" }}
        />
        <span
          className="h-[2px] w-[70%] rounded-full"
          style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.1)" }}
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <span
          className="flex h-[22%] w-full shrink-0 items-center gap-1 px-1.5"
          style={{
            backgroundColor: fills.chrome,
            boxShadow: chromeEqualsBody
              ? `inset 0 -1px 0 ${hairline}`
              : `inset 0 -1px 0 rgb(from var(--foreground) r g b / 0.05)`,
          }}
        >
          <span
            className="h-[2px] w-3 rounded-full"
            style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.14)" }}
          />
          <span
            className="h-[2px] w-2 rounded-full"
            style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.08)" }}
          />
        </span>

        {/* Body + card */}
        <span className="flex min-h-0 flex-1 p-1.5">
          <span
            className="flex min-h-0 w-full flex-1 flex-col gap-1 rounded-[4px] p-1.5"
            style={{
              backgroundColor: fills.card,
              boxShadow: cardFloats
                ? `inset 0 0 0 1px ${hairline}, 0 1px 2px rgb(from var(--foreground) r g b / 0.06)`
                : `inset 0 0 0 1px ${hairline}`,
            }}
          >
            <span
              className="h-[2px] w-[48%] rounded-full"
              style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.18)" }}
            />
            <span
              className="h-[2px] w-[78%] rounded-full"
              style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.08)" }}
            />
            <span
              className="h-[2px] w-[62%] rounded-full"
              style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.08)" }}
            />
            <span
              className="mt-auto h-[28%] w-full rounded-[2px]"
              style={{ backgroundColor: "rgb(from var(--foreground) r g b / 0.05)" }}
            />
          </span>
        </span>
      </span>
    </span>
  );
}

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
              <SurfaceThumb fills={fills} selected={selected} />
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

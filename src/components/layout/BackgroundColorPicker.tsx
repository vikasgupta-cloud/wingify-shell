// Design controller — page canvas greys (full Neutral scale).

import { Square } from "@/components/icons/protoLucide";
import {
  NEUTRAL_TOKEN_OPTIONS,
  neutralTokenById,
} from "../../config/backgroundTokens";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

export default function BackgroundColorPicker({
  className,
}: {
  className?: string;
}) {
  const backgroundTokenId = useThemeStore((s) => s.backgroundTokenId);
  const setBackgroundToken = useThemeStore((s) => s.setBackgroundToken);
  const active = neutralTokenById(backgroundTokenId);

  return (
    <section className={cn("px-6 py-6", className)}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 text-foreground">
            <Square className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <h3 className="text-base font-semibold tracking-tight">
              Background
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {active
              ? `${active.label} · ${active.hex} — page canvas only`
              : "Full Neutral scale — tints the page behind cards/tables"}
          </p>
        </div>
        {backgroundTokenId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 px-3 text-sm text-muted-foreground"
            onClick={() => setBackgroundToken(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label="Background neutral"
        className="grid grid-cols-6 gap-2"
      >
        {NEUTRAL_TOKEN_OPTIONS.map((token) => {
          const selected = token.id === backgroundTokenId;
          return (
            <button
              key={token.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${token.label} ${token.hex}`}
              title={`${token.label} ${token.hex}`}
              onClick={() => setBackgroundToken(token.id)}
              className={cn(
                "flex flex-col items-stretch gap-1 rounded-lg border p-1 outline-none transition-colors",
                selected
                  ? "border-foreground bg-accent"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span
                className="block aspect-square w-full rounded-md border border-border"
                style={{ backgroundColor: token.hex }}
                aria-hidden
              />
              <span className="truncate text-center text-[10px] font-medium leading-none text-muted-foreground">
                {token.step}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

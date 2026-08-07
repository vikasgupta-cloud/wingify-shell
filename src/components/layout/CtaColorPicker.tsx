import { useMemo, useState } from "react";
import {
  CTA_FAMILIES,
  CTA_TOKEN_OPTIONS,
  type CtaFamily,
} from "../../config/ctaTokens";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

const FAMILY_LABEL: Record<CtaFamily, string> = {
  yellow: "Yellow",
  cherry: "Cherry",
  green: "Green",
  berry: "Berry",
  ocean: "Ocean",
  maroon: "Maroon",
  amber: "Amber",
  neutral: "Neutral",
  midnight: "Midnight",
};

/**
 * Pick any VWO scale token as the primary CTA color; surround aesthetics
 * (ring, selection, links, report brand) follow the same family.
 */
export default function CtaColorPicker({ className }: { className?: string }) {
  const ctaTokenId = useThemeStore((s) => s.ctaTokenId);
  const setCtaToken = useThemeStore((s) => s.setCtaToken);
  const [family, setFamily] = useState<CtaFamily>(() => {
    const current = CTA_TOKEN_OPTIONS.find((t) => t.id === ctaTokenId);
    return current?.family ?? "green";
  });

  const tokens = useMemo(
    () => CTA_TOKEN_OPTIONS.filter((t) => t.family === family),
    [family]
  );

  const active = CTA_TOKEN_OPTIONS.find((t) => t.id === ctaTokenId);

  return (
    <div className={cn("px-3 py-2.5", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            CTA color
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            {active
              ? `${active.label} · ${active.hex}`
              : "Using theme preset"}
          </p>
        </div>
        {ctaTokenId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 shrink-0 px-1.5 text-[10px] text-muted-foreground"
            onClick={() => setCtaToken(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="Token family"
        className="mb-2 flex flex-wrap gap-1"
      >
        {CTA_FAMILIES.map((id) => {
          const selected = id === family;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFamily(id)}
              className={cn(
                "rounded-md border px-1.5 py-1 text-[10px] font-medium transition-colors",
                selected
                  ? "border-foreground bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {FAMILY_LABEL[id]}
            </button>
          );
        })}
      </div>

      <div
        role="radiogroup"
        aria-label={`${FAMILY_LABEL[family]} CTA tokens`}
        className="grid grid-cols-5 gap-1.5"
      >
        {tokens.map((token) => {
          const selected = token.id === ctaTokenId;
          return (
            <button
              key={token.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${token.label} ${token.hex}`}
              title={`${token.label} ${token.hex}`}
              onClick={() => setCtaToken(token.id)}
              className={cn(
                "flex flex-col items-stretch gap-1 rounded-md border p-1 outline-none transition-colors",
                selected
                  ? "border-foreground bg-accent"
                  : "border-border hover:border-foreground/40"
              )}
            >
              <span
                className="block aspect-square w-full rounded-sm border border-border"
                style={{ backgroundColor: token.hex }}
                aria-hidden
              />
              <span className="truncate text-center text-[9px] leading-none text-muted-foreground">
                {token.step}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

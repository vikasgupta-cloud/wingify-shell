import { useMemo, useState } from "react";
import { Palette } from "lucide-react";
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
    <section className={cn("px-6 py-6", className)}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 text-foreground">
            <Palette className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <h3 className="text-base font-semibold tracking-tight">
              Theme color
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {active
              ? `${active.label} · ${active.hex}`
              : "Using theme preset — pick a token to override"}
          </p>
        </div>
        {ctaTokenId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 px-3 text-sm text-muted-foreground"
            onClick={() => setCtaToken(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div
        role="tablist"
        aria-label="Token family"
        className="mb-5 flex flex-wrap gap-2"
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
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
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
        className="grid grid-cols-5 gap-2.5"
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
                "flex flex-col items-stretch gap-1.5 rounded-lg border p-1.5 outline-none transition-colors",
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
              <span className="truncate text-center text-[11px] font-medium leading-none text-muted-foreground">
                {token.step}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

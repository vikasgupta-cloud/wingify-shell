// Design controller — shared listing header greys (tables, kanban, gantt).

import { Rows3 } from "lucide-react";
import {
  NEUTRAL_TOKEN_OPTIONS,
  neutralTokenById,
} from "../../config/backgroundTokens";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

export default function HeaderColorPicker({
  className,
}: {
  className?: string;
}) {
  const headerTokenId = useThemeStore((s) => s.headerTokenId);
  const setHeaderToken = useThemeStore((s) => s.setHeaderToken);
  const active = neutralTokenById(headerTokenId);

  return (
    <section className={cn("px-6 py-6", className)}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2.5 text-foreground">
            <Rows3 className="h-5 w-5 shrink-0" strokeWidth={1.75} />
            <h3 className="text-base font-semibold tracking-tight">
              Headers
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {active
              ? `${active.label} · ${active.hex} — tables, kanban & gantt`
              : "All tables app-wide (Data 360, Web Exp, Flags…) — header row only"}
          </p>
        </div>
        {headerTokenId ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0 px-3 text-sm text-muted-foreground"
            onClick={() => setHeaderToken(null)}
          >
            Clear
          </Button>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label="Header neutral"
        className="grid grid-cols-6 gap-2"
      >
        {NEUTRAL_TOKEN_OPTIONS.map((token) => {
          const selected = token.id === headerTokenId;
          return (
            <button
              key={token.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${token.label} ${token.hex}`}
              title={`${token.label} ${token.hex}`}
              onClick={() => setHeaderToken(token.id)}
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

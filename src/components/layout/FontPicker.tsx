import { Type } from "lucide-react";
import {
  FONTS,
  FONT_ROLE_OPTIONS,
  type FontId,
  type FontRole,
} from "../../config/fonts";
import { useFontStore } from "../../store/fonts";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Font playground content — assign Ergon / Lyon / DM Sans to typography roles.
 * Hosted by FontController (hidden right-edge reveal), not profile chrome.
 */
export default function FontPicker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const assignments = useFontStore((s) => s.assignments);
  const setRoleFont = useFontStore((s) => s.setRoleFont);
  const resetFonts = useFontStore((s) => s.resetFonts);

  return (
    <div className={cn(compact ? "px-1 py-2" : "px-3 py-2.5", className)}>
      <div
        className={cn(
          "mb-2 flex items-center justify-between gap-2",
          compact ? "px-2" : "px-0.5"
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Type className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span className="text-[11px] font-medium uppercase tracking-wide">
            Fonts
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[10px] text-muted-foreground"
          onClick={resetFonts}
        >
          Reset
        </Button>
      </div>

      <div className="space-y-2.5">
        {FONT_ROLE_OPTIONS.map((role) => (
          <FontRoleRow
            key={role.id}
            role={role.id}
            label={role.label}
            description={role.description}
            preview={role.preview}
            value={assignments[role.id]}
            onChange={(fontId) => setRoleFont(role.id, fontId)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function FontRoleRow({
  role,
  label,
  description,
  preview,
  value,
  onChange,
  compact,
}: {
  role: FontRole;
  label: string;
  description: string;
  preview: string;
  value: FontId;
  onChange: (fontId: FontId) => void;
  compact: boolean;
}) {
  const active = FONTS.find((f) => f.id === value) ?? FONTS[0];

  return (
    <div className={cn(compact ? "px-1" : "px-0")}>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-foreground">{label}</p>
          <p className="truncate text-[10px] text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <p
        className="mb-1.5 truncate rounded-md border border-border bg-muted/40 px-2 py-1.5 text-[12px] leading-snug text-foreground"
        style={{ fontFamily: active.stack }}
        title={preview}
        data-font-role={role}
      >
        {preview}
      </p>

      <div
        role="radiogroup"
        aria-label={`${label} font`}
        className="grid grid-cols-3 gap-1"
      >
        {FONTS.map((font) => {
          const selected = font.id === value;
          return (
            <button
              key={font.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${label}: ${font.label}`}
              onClick={() => onChange(font.id)}
              className={cn(
                "rounded-md border px-1 py-1.5 text-center text-[10px] leading-none transition-colors",
                selected
                  ? "border-foreground bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
              style={{ fontFamily: font.stack }}
            >
              {font.sample}
            </button>
          );
        })}
      </div>
    </div>
  );
}

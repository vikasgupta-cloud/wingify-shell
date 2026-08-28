import { Type } from "@/components/icons/protoLucide";
import {
  FONTS,
  FONT_ROLE_OPTIONS,
  type FontId,
  type FontRole,
} from "../../config/fonts";
import { useFontStore } from "../../store/fonts";
import { cn } from "../../lib/utils";

/**
 * Font playground — assign Lyon / DM Sans to typography roles.
 * Hosted by FontController (profile CTA or blank-space gesture).
 */
export default function FontPicker({ className }: { className?: string }) {
  const assignments = useFontStore((s) => s.assignments);
  const setRoleFont = useFontStore((s) => s.setRoleFont);

  return (
    <section className={cn("px-6 py-6", className)}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-foreground">
          <Type className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          <h3 className="text-base font-semibold tracking-tight">Fonts</h3>
        </div>
      </div>

      <div className="space-y-8">
        {FONT_ROLE_OPTIONS.map((role) => (
          <FontRoleRow
            key={role.id}
            role={role.id}
            label={role.label}
            description={role.description}
            preview={role.preview}
            value={assignments[role.id]}
            onChange={(fontId) => setRoleFont(role.id, fontId)}
          />
        ))}
      </div>
    </section>
  );
}

function FontRoleRow({
  role,
  label,
  description,
  preview,
  value,
  onChange,
}: {
  role: FontRole;
  label: string;
  description: string;
  preview: string;
  value: FontId;
  onChange: (fontId: FontId) => void;
}) {
  const active = FONTS.find((f) => f.id === value) ?? FONTS[0];

  return (
    <div className="space-y-3">
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <p
        className="truncate rounded-lg border border-border bg-muted/50 px-4 py-3.5 text-lg leading-snug text-foreground"
        style={{ fontFamily: active.stack }}
        title={preview}
        data-font-role={role}
      >
        {preview}
      </p>

      <div
        role="radiogroup"
        aria-label={`${label} font`}
        className="grid grid-cols-3 gap-2"
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
                "rounded-lg border px-2 py-3 text-center text-sm leading-none transition-colors",
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

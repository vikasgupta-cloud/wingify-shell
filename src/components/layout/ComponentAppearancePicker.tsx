/**
 * Component colour overrides in the design controller.
 * Fields are grouped by interaction state (default, hover, selected, focus,
 * disabled, read-only) wherever that state exists for the component.
 */
import { useMemo, useState } from "react";
import { ChevronDown } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  COLOR_FIELD_LABELS,
  COMPONENT_FIELD_GROUPS,
  getColorPaletteFamilies,
  COMPONENT_APPEARANCE_LABELS,
  COMPONENT_COLOR_FIELDS,
  componentCssVar,
  hexToHslChannels,
  hslChannelsToHex,
  NONE_COLOUR,
  resolveComponentColour,
  type ComponentColourReference,
  type ComponentAppearanceId,
} from "@/config/componentAppearance";
import { useComponentAppearanceStore } from "@/store/componentAppearance";
import { useThemeStore } from "@/store/theme";

const APPEARANCE_IDS = Object.keys(
  COMPONENT_COLOR_FIELDS
) as ComponentAppearanceId[];

/** Checkerboard swatch for the "No colour" / transparent pick. */
function NoColourSwatch({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative size-4 shrink-0 overflow-hidden rounded border border-border",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(45deg, hsl(var(--muted-foreground)/0.25) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted-foreground)/0.25) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted-foreground)/0.25) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted-foreground)/0.25) 75%)",
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
        backgroundColor: "hsl(var(--background))",
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="block h-px w-full rotate-45 bg-danger-fg" />
      </span>
    </span>
  );
}

function isLowContrast(text: string, background: string): boolean {
  // Skip contrast checks when either side is transparent / none.
  if (text.includes("/") || background.includes("/")) return false;
  const luminance = (channels: string) => {
    const [h, s, l] = channels.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
    const chroma = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100);
    const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l / 100 - chroma / 2;
    const [r, g, b] =
      h < 60 ? [chroma, x, 0] : h < 120 ? [x, chroma, 0] :
      h < 180 ? [0, chroma, x] : h < 240 ? [0, x, chroma] :
      h < 300 ? [x, 0, chroma] : [chroma, 0, x];
    const linear = [r + m, g + m, b + m].map((c) =>
      c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    );
    return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  };
  const a = luminance(text);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) < 4.5;
}

function shadeLabelForColour(
  colour: ComponentColourReference | undefined
): string | null {
  if (!colour) return null;
  if (colour.kind === "none") return "No colour";
  return colour.kind === "palette"
    ? `${colour.family} ${colour.step}`
    : "Custom";
}

function FieldColourPickers({
  field,
  colour,
  onPick,
  families,
}: {
  field: string;
  colour: ComponentColourReference | undefined;
  onPick: (colour: ComponentColourReference) => void;
  families: ReturnType<typeof getColorPaletteFamilies>;
}) {
  const [open, setOpen] = useState(false);
  const paletteId = useThemeStore((s) => s.paletteId);
  const label = shadeLabelForColour(colour);
  const isNone = colour?.kind === "none";
  const value = colour ? resolveComponentColour(colour, paletteId) : undefined;
  const preview =
    !isNone && value && !value.includes("/")
      ? hslChannelsToHex(value)
      : undefined;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-2 px-2"
            aria-label={`Palette ${COLOR_FIELD_LABELS[field] ?? field}`}
          >
            {isNone ? (
              <NoColourSwatch />
            ) : (
              <span
                className="size-4 shrink-0 rounded border border-border"
                style={{
                  backgroundColor: preview ?? "hsl(var(--muted))",
                }}
              />
            )}
            <span className="max-w-[7rem] truncate text-xs">
              {label ?? "Palette"}
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          data-design-controller=""
          className="z-[90] w-72 max-h-80 space-y-2.5 overflow-y-auto p-3"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              None
            </p>
            <button
              type="button"
              title="No colour"
              aria-label={`No colour ${COLOR_FIELD_LABELS[field] ?? field}`}
              onClick={() => {
                onPick(NONE_COLOUR);
                setOpen(false);
              }}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                isNone
                  ? "border-foreground bg-accent text-foreground ring-1 ring-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              <NoColourSwatch className="size-5" />
              No colour
            </button>
          </div>

          {families.map((family) => (
            <div key={family.id} className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {family.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {family.shades.map((shade) => (
                  <button
                    key={shade.label}
                    type="button"
                    title={shade.label}
                    aria-label={`${shade.label} ${COLOR_FIELD_LABELS[field] ?? field}`}
                    onClick={() => {
                      onPick({
                        kind: "palette",
                        family: family.id,
                        step: shade.step,
                      });
                      setOpen(false);
                    }}
                    className={cn(
                      "size-5 rounded border transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      colour?.kind === "palette" &&
                        colour.family === family.id &&
                        colour.step === shade.step
                        ? "border-foreground ring-1 ring-foreground"
                        : "border-border"
                    )}
                    style={{ backgroundColor: shade.hex }}
                  />
                ))}
              </div>
            </div>
          ))}
        </PopoverContent>
      </Popover>

      <label className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground">
        Custom
        <input
          type="color"
          aria-label={`Custom ${COLOR_FIELD_LABELS[field] ?? field}`}
          value={preview ?? "#1e2022"}
          onChange={(event) => {
            const next = hexToHslChannels(event.target.value);
            if (next) onPick({ kind: "custom", value: next });
          }}
          className="size-5 cursor-pointer border-0 bg-transparent p-0"
        />
      </label>
    </div>
  );
}

/** Global component colour controls, with optional custom HSL overrides. */
export default function ComponentAppearancePicker() {
  const overrides = useComponentAppearanceStore((s) => s.overrides);
  const setOverride = useComponentAppearanceStore((s) => s.setOverride);
  const paletteId = useThemeStore((s) => s.paletteId);
  const families = useMemo(
    () => getColorPaletteFamilies(paletteId),
    [paletteId]
  );
  const [selected, setSelected] = useState<ComponentAppearanceId>("cta-primary");
  const fields = COMPONENT_COLOR_FIELDS[selected];
  const groups = COMPONENT_FIELD_GROUPS[selected];

  const selectedValues = fields.map(
    (field) => {
      const colour = overrides[componentCssVar(selected, field)]?.colour;
      return colour ? resolveComponentColour(colour, paletteId) : "";
    }
  );
  const background =
    selectedValues.find((_, index) =>
      fields[index]?.toLowerCase().includes("background")
    ) ?? "";
  const text =
    selectedValues.find((_, index) =>
      fields[index]?.toLowerCase().includes("text")
    ) ?? "";
  const warning = Boolean(background && text && isLowContrast(text, background));

  return (
    <section className="space-y-4 border-t border-border px-4 py-4">
      <div className="space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Component colours
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Override colours per component and interaction state (default, hover,
          selected, focus, disabled, read-only where it applies). Open Palette
          for the active pack (including No colour), or Custom for any colour.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {APPEARANCE_IDS.map((id) => (
          <Button
            key={id}
            type="button"
            variant={selected === id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelected(id)}
          >
            {COMPONENT_APPEARANCE_LABELS[id]}
          </Button>
        ))}
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-3">
        {groups.map((group) => (
          <div key={group.id} className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.label}
            </p>
            {group.fields.map((field) => {
              const key = componentCssVar(selected, field);
              const colour = overrides[key]?.colour;
              return (
                <div key={field} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-foreground">
                      {COLOR_FIELD_LABELS[field] ?? field}
                    </p>
                    {colour ? (
                      <button
                        type="button"
                        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        onClick={() => setOverride(selected, field, null)}
                      >
                        Use theme default
                      </button>
                    ) : null}
                  </div>
                  <FieldColourPickers
                    field={field}
                    colour={colour}
                    families={families}
                    onPick={(nextColour) =>
                      setOverride(selected, field, nextColour)
                    }
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {warning ? (
        <p className="rounded-md border border-warning-fg/30 bg-warning-bg px-3 py-2 text-xs text-warning-fg">
          Contrast warning: this text/background combination may be difficult to
          read. It is saved because you chose to allow it.
        </p>
      ) : null}
    </section>
  );
}

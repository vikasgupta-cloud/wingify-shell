import { Moon, Palette, Sun } from "@/components/icons/protoLucide";
import { THEMES, type ThemeId } from "../../config/themes";
import {
  FORM_ELEMENT_SCHEMES,
  type FormElementSchemeId,
} from "../../config/formElementSchemes";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Profile appearance picker — button-color accents, yellow form-element
 * sub-themes, and independent light/dark mode. Hosted by the design CTA.
 */
export default function ThemePicker({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const themeId = useThemeStore((s) => s.themeId);
  const colorMode = useThemeStore((s) => s.colorMode);
  const formElementSchemeId = useThemeStore((s) => s.formElementSchemeId);
  const setTheme = useThemeStore((s) => s.setTheme);
  const setColorMode = useThemeStore((s) => s.setColorMode);
  const setFormElementScheme = useThemeStore((s) => s.setFormElementScheme);
  const yellowSelected = themeId === "yellow";

  return (
    <div className={cn(compact ? "px-1.5 py-2.5" : "px-3 py-3.5", className)}>
      <div
        className={cn(
          "mb-3 flex items-center justify-between gap-2",
          compact ? "px-2" : "px-0.5"
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Palette className="size-4 shrink-0" strokeWidth={1.75} />
          <span className="text-xs font-medium uppercase tracking-wide">
            Appearance
          </span>
        </div>

        <div
          role="group"
          aria-label="Light or dark"
          className="inline-flex rounded-lg border border-border bg-background p-0.5"
        >
          <button
            type="button"
            aria-pressed={colorMode === "light"}
            aria-label="Light"
            onClick={() => setColorMode("light")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
              colorMode === "light"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun className="size-3.5" strokeWidth={1.75} />
            Light
          </button>
          <button
            type="button"
            aria-pressed={colorMode === "dark"}
            aria-label="Dark"
            onClick={() => setColorMode("dark")}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors",
              colorMode === "dark"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon className="size-3.5" strokeWidth={1.75} />
            Dark
          </button>
        </div>
      </div>

      <p
        className={cn(
          "mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground",
          compact ? "px-2" : "px-0.5"
        )}
      >
        Button color
      </p>

      <TooltipProvider delayDuration={200}>
        <div
          role="radiogroup"
          aria-label="Button color"
          className="grid grid-cols-5 gap-2"
        >
          {THEMES.map((theme) => {
            const selected = theme.id === themeId;
            const [surface, accent, ink] =
              colorMode === "dark" ? theme.swatchesDark : theme.swatchesLight;
            return (
              <Tooltip key={theme.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={`${theme.label} button color`}
                    onClick={() => setTheme(theme.id as ThemeId)}
                    className={cn(
                      "group flex flex-col items-stretch gap-1.5 rounded-lg p-1.5 outline-none transition-colors",
                      "hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                      selected && "bg-accent"
                    )}
                  >
                    <SwatchCard
                      surface={surface}
                      field={ink}
                      fieldOpacity={0.35}
                      control={accent}
                      cta={accent}
                      selected={selected}
                    />
                    <span className="truncate px-0.5 text-center text-[11px] font-medium leading-none text-foreground">
                      {theme.label}
                    </span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[180px]">
                  <p className="font-medium">{theme.label} buttons</p>
                  <p className="text-muted-foreground">{theme.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {yellowSelected ? (
          <>
            <p
              className={cn(
                "mb-2 mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                compact ? "px-2" : "px-0.5"
              )}
            >
              Yellow · form elements
            </p>

            <div
              role="radiogroup"
              aria-label="Yellow form element secondary color"
              className="grid grid-cols-4 gap-2"
            >
              {FORM_ELEMENT_SCHEMES.map((scheme) => {
                const selected = scheme.id === formElementSchemeId;
                const swatch =
                  colorMode === "dark" ? scheme.swatch.dark : scheme.swatch.light;
                return (
                  <Tooltip key={scheme.id}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        aria-label={`${scheme.label} secondary form color`}
                        onClick={() =>
                          setFormElementScheme(
                            scheme.id as FormElementSchemeId
                          )
                        }
                        className={cn(
                          "group flex flex-col items-stretch gap-1.5 rounded-lg p-1.5 outline-none transition-colors",
                          "hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                          selected && "bg-accent"
                        )}
                      >
                        <SwatchCard
                          surface={swatch.surface}
                          field={swatch.field}
                          tint={swatch.tint}
                          control={swatch.control}
                          cta={swatch.cta}
                          roundControl
                          selected={selected}
                        />
                        <span className="truncate px-0.5 text-center text-[11px] font-medium leading-none text-foreground">
                          {scheme.label}
                        </span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <p className="font-medium">
                        Yellow · {scheme.label}
                      </p>
                      <p className="text-muted-foreground">
                        {scheme.description}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </>
        ) : null}
      </TooltipProvider>
    </div>
  );
}

/**
 * Miniature form card used by both swatch grids — input rail, selection tint,
 * control (round for form-element schemes), and the CTA pill.
 */
function SwatchCard({
  surface,
  field,
  fieldOpacity,
  tint,
  control,
  cta,
  roundControl = false,
  selected,
}: {
  surface: string;
  field: string;
  fieldOpacity?: number;
  tint?: string;
  control: string;
  cta: string;
  roundControl?: boolean;
  selected: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex aspect-[5/4] w-full flex-col justify-between gap-1 overflow-hidden rounded-lg p-1.5",
        "ring-1 ring-inset transition-shadow",
        selected
          ? "ring-2 ring-foreground"
          : "ring-border group-hover:ring-foreground/40"
      )}
      style={{ backgroundColor: surface }}
      aria-hidden
    >
      <span className="flex flex-col gap-1">
        <span
          className="h-1 rounded-full"
          style={{ backgroundColor: field, opacity: fieldOpacity }}
        />
        {tint ? (
          <span
            className="h-1 w-3/5 rounded-full"
            style={{ backgroundColor: tint }}
          />
        ) : null}
      </span>
      <span className="flex items-end justify-between">
        <span
          className={cn("size-2.5", roundControl ? "rounded-full" : "rounded-[3px]")}
          style={{ backgroundColor: control }}
        />
        <span
          className="h-2 w-4 rounded-full"
          style={{ backgroundColor: cta }}
        />
      </span>
    </span>
  );
}

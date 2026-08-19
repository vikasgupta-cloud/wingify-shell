/*
 * Page H1 with optional hover description (same pattern as config SectionTitle).
 *
 * Header icons sit in a consistent New-palette yellow/200 box, with a filled
 * glyph from the active icon library in Neutral 950.
 *
 * Reused: getPaletteScales("new"), filledVariantForLibrary, IconVariantOverride.
 */

import { useMemo } from "react";
import type { LucideIcon } from "@/components/icons/protoLucide";
import { IconVariantOverride } from "@/components/icons/IconLibraryProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { hexToHslChannels } from "@/config/componentAppearance";
import { filledVariantForLibrary } from "@/config/iconLibraries";
import { getPaletteScales } from "@/config/palettes";
import { useIconLibraryStore } from "@/store/iconLibrary";

const NEW_YELLOW_200 = getPaletteScales("new").yellow["200"]!;
const NEW_YELLOW_500 = getPaletteScales("new").yellow["500"]!;
const NEUTRAL_950 = getPaletteScales("new").neutral["950"]!;

function hslFromHex(hex: string, fallback: string): string {
  const channels = hexToHslChannels(hex);
  return channels ? `hsl(${channels})` : fallback;
}

export default function PageHeader({
  title,
  icon: Icon,
  description,
}: {
  title: string;
  icon?: LucideIcon;
  /** Shown in a tooltip on hover of the title — not as a visible subline. */
  description?: string;
}) {
  const libraryId = useIconLibraryStore((s) => s.libraryId);
  const filledVariant = filledVariantForLibrary(libraryId);

  const iconBox = useMemo(() => {
    const yellow200 = hslFromHex(
      NEW_YELLOW_200,
      "hsl(var(--vwo-yellow-200))"
    );
    return {
      backgroundColor: yellow200,
      borderColor: hslFromHex(NEW_YELLOW_500, "hsl(var(--vwo-yellow-500))"),
      color: hslFromHex(NEUTRAL_950, "hsl(var(--vwo-neutral-950))"),
    };
  }, []);

  const heading = (
    <h1 className="font-title w-fit cursor-default text-3xl font-semibold tracking-tight text-foreground">
      {title}
    </h1>
  );

  return (
    <div className="flex items-center gap-3 px-12 pt-10">
      {Icon && (
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border shadow-none"
          style={{
            backgroundColor: iconBox.backgroundColor,
            borderColor: iconBox.borderColor,
            color: iconBox.color,
          }}
        >
          <IconVariantOverride variant={filledVariant}>
            <Icon className="h-5 w-5 shrink-0" size={20} />
          </IconVariantOverride>
        </span>
      )}
      {description ? (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{heading}</TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        heading
      )}
    </div>
  );
}

// @undo
// Restore the previous PageHeader icon (muted outline, no yellow box) and
// remove IconVariantOverride usage plus filledVariantForLibrary.

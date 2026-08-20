// Page H1 with optional hover description (same pattern as config SectionTitle).

import type { LucideIcon } from "@/components/icons/protoLucide";
import { IconVariantOverride } from "@/components/icons/IconLibraryProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const heading = (
    <h1 className="font-title w-fit cursor-default text-3xl font-semibold tracking-tight text-foreground">
      {title}
    </h1>
  );

  return (
    <div className="flex items-center gap-3 px-12 pt-10">
      {Icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-rail-active text-rail-active-foreground">
          <IconVariantOverride libraryId="phosphor" variant="fill">
            <Icon className="h-6 w-6" aria-hidden />
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

// Page H1 with optional hover description (same pattern as config SectionTitle).

import type { LucideIcon } from "lucide-react";
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
        <Icon
          className="h-6 w-6 shrink-0 text-muted-foreground"
          strokeWidth={1.75}
          aria-hidden
        />
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

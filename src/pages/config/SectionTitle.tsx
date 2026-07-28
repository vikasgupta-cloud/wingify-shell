import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SECTIONS, type SectionId } from "../../config/configSections";
import { cn } from "@/lib/utils";

// Section heading with its one-line description on hover. Used in guided and
// scroll config views so both surfaces share the same tooltip behaviour.
export default function SectionTitle({
  sectionId,
  label,
  description,
  as: Tag = "h2",
  className,
}: {
  sectionId?: SectionId;
  label?: string;
  description?: string;
  as?: "h2" | "span";
  className?: string;
}) {
  const section = sectionId ? SECTIONS.find((s) => s.id === sectionId) : undefined;
  const resolvedLabel = label ?? section?.label ?? "";
  const resolvedDescription = description ?? section?.description ?? "";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Tag
            className={cn(
              "w-fit cursor-default font-semibold text-foreground",
              className
            )}
          >
            {resolvedLabel}
          </Tag>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start">
          {resolvedDescription}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

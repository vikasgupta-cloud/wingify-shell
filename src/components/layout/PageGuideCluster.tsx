import type { ReactNode } from "react";
import {
  CircleHelp,
  ExternalLink,
  Info,
  Play,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { PageGuide } from "@/config/navigation";

function IconTip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export default function PageGuideCluster({ guide }: { guide?: PageGuide }) {
  if (
    !guide || (!guide.tutorial && !guide.help && !guide.info)
  ) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="ml-0.5 flex shrink-0 items-center gap-0.5">
        {guide.tutorial && (
          <IconTip label={guide.tutorial.label ?? "Play tutorial"}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground"
              aria-label={guide.tutorial.label ?? "Play tutorial"}
            >
              <Play className="size-3.5" aria-hidden />
            </Button>
          </IconTip>
        )}
        {guide.help && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
                aria-label="Help"
              >
                <CircleHelp className="size-3.5" aria-hidden />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-2">
              <p className="text-sm font-semibold text-foreground">
                {guide.help.title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {guide.help.body}
              </p>
              {guide.help.href && (
                <a
                  href={guide.help.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-link hover:text-link-hover"
                >
                  Read more
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              )}
            </PopoverContent>
          </Popover>
        )}
        {guide.info && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground"
                aria-label="About this page"
              >
                <Info className="size-3.5" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" className="max-w-xs">
              {guide.info}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

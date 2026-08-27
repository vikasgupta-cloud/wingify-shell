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

export default function PageGuideCluster({ guide }: { guide?: PageGuide }) {
  if (!guide || (!guide.tutorial && !guide.help && !guide.info)) {
    return null;
  }

  const tutorialLabel = guide.tutorial?.label ?? "Play tutorial";

  return (
    <TooltipProvider delayDuration={200}>
      <div className="ml-0.5 flex shrink-0 items-center gap-0.5">
        {guide.tutorial && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="group h-7 gap-0 overflow-hidden px-1.5 !text-[var(--neutral-700)] hover:bg-muted hover:!text-foreground"
            aria-label={tutorialLabel}
          >
            <Play className="size-3.5 shrink-0 text-[var(--neutral-700)] group-hover:text-foreground" aria-hidden />
            <span className="inline-block max-w-0 overflow-hidden whitespace-nowrap text-xs font-medium text-[var(--neutral-700)] opacity-0 transition-[max-width,opacity,margin,color] duration-200 ease-out group-hover:ml-1.5 group-hover:max-w-[8rem] group-hover:text-foreground group-hover:opacity-100 group-focus-visible:ml-1.5 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100">
              {tutorialLabel}
            </span>
          </Button>
        )}
        {guide.help && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 !text-[var(--neutral-700)]"
                aria-label="Help"
              >
                <CircleHelp className="size-3.5 text-[var(--neutral-700)]" aria-hidden />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 space-y-3 p-3">
              <p className="text-sm font-semibold text-foreground">
                {guide.help.title}
              </p>
              {guide.help.video && (
                <button
                  type="button"
                  className="group relative block w-full overflow-hidden rounded-md border border-border text-left outline-none transition-colors hover:border-hover focus-visible:ring-1 focus-visible:ring-ring"
                  aria-label={`Play ${guide.help.video.title}`}
                >
                  <img
                    src={guide.help.video.poster}
                    alt=""
                    className="aspect-video w-full object-cover"
                  />
                  <span className="absolute inset-0 bg-foreground/25 transition-colors group-hover:bg-foreground/35" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex size-9 items-center justify-center rounded-full border border-background/80 bg-background/90 text-foreground shadow-sm">
                      <Play className="size-4" aria-hidden />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-foreground/70 to-transparent px-2.5 pb-2 pt-8">
                    <span className="truncate text-xs font-medium text-background">
                      {guide.help.video.title}
                    </span>
                    <span className="shrink-0 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-foreground">
                      {guide.help.video.duration}
                    </span>
                  </span>
                </button>
              )}
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
                className="size-7 !text-[var(--neutral-700)]"
                aria-label="About this page"
              >
                <Info className="size-3.5 text-[var(--neutral-700)]" aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              align="start"
              className="max-w-xs border-transparent bg-[var(--neutral-700)] text-primary-foreground"
            >
              {guide.info}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

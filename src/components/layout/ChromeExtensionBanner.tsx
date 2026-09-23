/**
 * Dashboard-only Chrome extension promo in the TopBar.
 * Single-line control — must stay ≤ other TopBar actions (never grow past 52px chrome).
 * Collapsed → small icon that re-opens the promo.
 * When preferCollapsed (right-side TopBar notice present), start as the small icon.
 */

import { useEffect, useState } from "react";
import { X } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEFAULT_MASCOT_ID, mascotAsset } from "@/config/mascots";
import { useChromeExtensionBannerStore } from "@/store/chromeExtensionBanner";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/utils";

/** Wingify bird on brand yellow (same yellow as left-nav selection). */
function MascotBadge({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  const colorMode = useThemeStore((s) => s.colorMode);
  const src = mascotAsset(DEFAULT_MASCOT_ID, colorMode);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-accent",
        className
      )}
      aria-hidden
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className={cn("object-contain", imgClassName)}
      />
    </span>
  );
}

export default function ChromeExtensionBanner({
  preferCollapsed = false,
}: {
  /** When a competing TopBar notice is visible, default to the small mascot. */
  preferCollapsed?: boolean;
}) {
  const storeCollapsed = useChromeExtensionBannerStore((s) => s.collapsed);
  const collapse = useChromeExtensionBannerStore((s) => s.collapse);
  const expand = useChromeExtensionBannerStore((s) => s.expand);
  // Session expand so preferCollapsed can start small without blocking a manual open.
  const [sessionExpanded, setSessionExpanded] = useState(false);

  useEffect(() => {
    if (preferCollapsed) setSessionExpanded(false);
  }, [preferCollapsed]);

  const collapsed = preferCollapsed
    ? !sessionExpanded
    : storeCollapsed;

  const handleExpand = () => {
    setSessionExpanded(true);
    expand();
  };

  const handleCollapse = () => {
    setSessionExpanded(false);
    collapse();
  };

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Open Wingify Chrome Extension promo"
              onClick={handleExpand}
              className={cn(
                "relative flex size-8 shrink-0 items-center justify-center rounded-full",
                "outline-none transition-transform hover:scale-105",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "animate-in fade-in-0 zoom-in-95"
              )}
            >
              <MascotBadge className="size-8" imgClassName="size-5" />
              <span
                className="absolute right-0 top-0 size-1.5 rounded-full bg-foreground ring-2 ring-panel"
                aria-hidden
              />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Wingify Chrome Extension — for enhanced capabilities
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div
        role="region"
        aria-label="Wingify Chrome Extension"
        className={cn(
          // Match Create / Summarise control height — never taller than TopBar actions.
          "flex h-8 max-h-8 shrink-0 items-center gap-2 overflow-hidden rounded-full",
          "border border-border/80 bg-muted/40 py-0 pl-0 pr-1",
          "animate-in fade-in-0 duration-200"
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex min-w-0 shrink items-center gap-2">
              {/* Full-height badge flush to left + top of the pill. */}
              <MascotBadge
                className="size-8 rounded-none"
                imgClassName="size-[18px]"
              />
              <span className="hidden min-w-0 truncate text-xs sm:inline">
                <span className="font-semibold text-foreground">
                  Wingify Chrome Extension
                </span>
                <span className="font-normal text-muted-foreground">
                  {" "}
                  — for enhanced capabilities
                </span>
              </span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Wingify Chrome Extension — for enhanced capabilities
          </TooltipContent>
        </Tooltip>

        <span className="h-3.5 w-px shrink-0 bg-border" aria-hidden />

        <div className="flex shrink-0 items-center gap-0">
          <Button
            type="button"
            variant="shadow"
            size="sm"
            className="h-6 rounded-full px-2.5 text-xs"
            onClick={() => {
              /* stub — Chrome Web Store install */
            }}
          >
            Install
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Minimize extension promo"
                onClick={handleCollapse}
                className="size-6 shrink-0 rounded-full text-muted-foreground hover:bg-background/80 hover:text-foreground"
              >
                <X className="size-3" strokeWidth={2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Minimize</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}

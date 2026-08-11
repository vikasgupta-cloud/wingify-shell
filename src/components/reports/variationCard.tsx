import type { ReactNode } from "react";
import { MousePointerClick } from "@/components/icons/protoLucide";
import { cn } from "../../lib/utils";
import vwoMark from "../../pages/reports/vwo-mark.svg";

/**
 * Building blocks of the Reports Overview variation card, shared so the Quick
 * view renders the same design at a smaller scale (`compact`).
 */

/** Marketing copy for the variation previews — numbers never come from here. */
export const PREVIEW_HERO = [
  {
    headline: "Make every customer experience count",
    sub: "Build, test, and ship digital experiences your customers choose.",
    cta: "Start free trial",
  },
  {
    headline: "Start testing in 30 seconds",
    sub: "Launch your first experiment today. No complex setup required.",
    cta: "Start testing free",
  },
  {
    headline: "Test ideas. Prove impact. Grow.",
    sub: "Move from intuition to evidence with one connected testing workspace.",
    cta: "Create your first test",
  },
  {
    headline: "Turn every visit into insight",
    sub: "Run experiments that reveal what your audience really wants.",
    cta: "Explore the platform",
  },
  {
    headline: "Build experiences people choose",
    sub: "Learn what works, understand why, and turn insight into growth.",
    cta: "See how it works",
  },
];

export function previewHero(index: number) {
  return PREVIEW_HERO[index % PREVIEW_HERO.length]!;
}

export function VariantChip({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-[23px] min-w-[29px] shrink-0 items-center justify-center rounded-md border border-border bg-muted px-2 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function UpliftPill({ label }: { label: string }) {
  const positive = label.startsWith("+");
  const negative = label.startsWith("-");
  return (
    <span
      className={cn(
        "shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
        positive && "bg-success-fg/10 text-success-fg",
        negative && "bg-danger-fg/10 text-danger-fg",
        !positive && !negative && "bg-muted text-muted-foreground"
      )}
    >
      {label}
    </span>
  );
}

export function StatTile({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-lg bg-muted/50",
        compact ? "px-2 py-2" : "px-3 py-2.5"
      )}
    >
      <dt
        className={cn(
          "truncate leading-none text-muted-foreground",
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "truncate font-semibold tabular-nums text-foreground",
          compact ? "mt-1 text-xs" : "mt-1.5 text-sm"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

export function AnnotationDot({
  n,
  className,
}: {
  n: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "absolute z-10 flex h-[19px] w-[19px] items-center justify-center rounded-md border border-background bg-foreground text-[11px] font-semibold text-primary-foreground shadow-sm",
        className
      )}
      aria-hidden
    >
      {n}
    </span>
  );
}

export function SkeletonTile({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[5px] border border-border/60 bg-background",
        compact ? "h-[34px] w-[70px] p-1.5" : "h-[54px] w-[118px] p-2.5"
      )}
    >
      <span className="h-2.5 w-3.5 rounded-sm bg-muted" />
      <span
        className={cn(
          "mt-[7px] h-[3px] rounded-full bg-border",
          compact ? "w-[42px]" : "w-[70px]"
        )}
      />
      <span
        className={cn(
          "mt-[5px] h-[3px] rounded-full bg-border",
          compact ? "w-[28px]" : "w-[46px]"
        )}
      />
    </div>
  );
}

/** Mock landing page behind each variation card. `compact` fits the quick view. */
export function WebpagePreview({
  headline,
  sub,
  cta,
  conversionsLabel,
  isControl,
  compact = false,
}: {
  headline: string;
  sub: string;
  cta: string;
  conversionsLabel: string;
  isControl: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-border bg-background",
        compact ? "mt-3 h-[250px]" : "mt-5 h-[435px]"
      )}
    >
      {/* Browser chrome */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-border bg-background",
          compact ? "h-6 px-2" : "h-8 px-2.5"
        )}
      >
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/35" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/55" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/75" />
        </div>
        <div
          className={cn(
            "flex flex-1 items-center justify-center rounded-md border border-border bg-background leading-none text-muted-foreground",
            compact ? "h-3.5 text-[8px]" : "h-4 text-[10px]"
          )}
        >
          vwo.com/experience
        </div>
      </div>

      {/* Site nav */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b border-border",
          compact ? "h-7 px-2.5" : "h-[39px] px-3"
        )}
      >
        <div className="flex items-center gap-1">
          <img
            src={vwoMark}
            alt=""
            className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3")}
          />
          <span
            className={cn(
              "font-semibold text-foreground",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            VWO
          </span>
        </div>
        <div className="flex flex-1 justify-center gap-2">
          <span className="h-1 w-6 rounded-full bg-border" />
          <span className="h-1 w-6 rounded-full bg-border" />
          <span className="h-1 w-6 rounded-full bg-border" />
        </div>
        <span
          className={cn("rounded bg-muted", compact ? "h-2.5 w-7" : "h-3 w-9")}
        />
      </div>

      {/* Hero */}
      <div
        className={cn(
          "flex flex-1 flex-col items-center bg-muted/20",
          compact ? "px-3 pt-5" : "px-5 pt-10"
        )}
      >
        <p
          className={cn(
            "font-medium uppercase tracking-wider text-muted-foreground",
            compact ? "text-[8px]" : "text-[11px]"
          )}
        >
          Experiment with confidence
        </p>

        <div className={cn("relative", compact ? "mt-1.5" : "mt-2.5")}>
          {isControl ? (
            <p
              className={cn(
                "text-center font-semibold tracking-tight text-foreground",
                compact
                  ? "max-w-[180px] text-[11px] leading-[15px]"
                  : "max-w-[290px] text-lg leading-[22px]"
              )}
            >
              {headline}
            </p>
          ) : (
            <span
              className={cn(
                "relative inline-block rounded-md bg-muted",
                compact ? "px-1 pb-0.5 pt-0.5" : "px-1.5 pb-1 pt-0.5"
              )}
            >
              <AnnotationDot
                n={1}
                className={cn(
                  compact
                    ? "-left-2 -top-1.5 h-[14px] w-[14px] text-[9px]"
                    : "-left-2.5 -top-2"
                )}
              />
              <span
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  compact
                    ? "text-[11px] leading-[15px]"
                    : "whitespace-nowrap text-lg leading-[22px]"
                )}
              >
                {headline}
              </span>
            </span>
          )}
        </div>

        <p
          className={cn(
            "text-center text-muted-foreground",
            compact
              ? "mt-1.5 max-w-[190px] text-[9px] leading-snug"
              : "mt-2.5 max-w-[300px] text-xs leading-snug"
          )}
        >
          {sub}
        </p>

        <div className={cn("relative", compact ? "mt-5" : "mt-8")}>
          <span
            className={cn(
              "flex items-center rounded-md font-semibold text-primary-foreground",
              compact ? "h-7 px-2.5 text-[9px]" : "h-[38px] px-4 text-[11px]",
              isControl ? "bg-foreground/90" : "bg-foreground"
            )}
          >
            {cta}
          </span>
          {!isControl && (
            <AnnotationDot
              n={2}
              className={cn(
                compact
                  ? "-left-2 -top-2 h-[14px] w-[14px] text-[9px]"
                  : "-left-2.5 -top-2.5"
              )}
            />
          )}
          <span
            className={cn(
              "absolute flex items-center gap-1 whitespace-nowrap rounded-md border border-border bg-background shadow-sm",
              compact
                ? "-bottom-3 left-7 h-[22px] px-1.5"
                : "-bottom-4 left-12 h-[30px] px-2.5"
            )}
          >
            <MousePointerClick
              className={cn(
                "text-muted-foreground",
                compact ? "h-2.5 w-2.5" : "h-3.5 w-3.5"
              )}
              aria-hidden
            />
            <span
              className={cn(
                "font-medium text-muted-foreground",
                compact ? "text-[8px]" : "text-[10px]"
              )}
            >
              {conversionsLabel}
            </span>
          </span>
        </div>

        <div
          className={cn(
            "mt-auto flex justify-center gap-2",
            compact ? "pb-4 pt-5" : "pb-6 pt-8"
          )}
        >
          <SkeletonTile compact={compact} />
          <SkeletonTile compact={compact} />
          <SkeletonTile compact={compact} />
        </div>
      </div>
    </div>
  );
}

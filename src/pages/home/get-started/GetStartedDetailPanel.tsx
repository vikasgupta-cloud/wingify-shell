/** Get Started — detail card with copy, video stub, and actions (screenshot layout). */

import {
  Check,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  LayoutGrid,
  Play,
  Target,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import type { GetStartedDetail } from "@/data/getStarted";
import { cn } from "@/lib/utils";

type GetStartedDetailPanelProps = {
  label: string;
  detail: GetStartedDetail;
};

function HeaderIcon({ type }: { type: GetStartedDetail["headerIcon"] }) {
  const iconClass = "size-4";
  switch (type) {
    case "target":
      return <Target className={iconClass} aria-hidden />;
    case "flask":
      return <FlaskConical className={iconClass} aria-hidden />;
    case "grid":
      return <LayoutGrid className={iconClass} aria-hidden />;
    default:
      return <Check className={iconClass} aria-hidden />;
  }
}

export default function GetStartedDetailPanel({
  label,
  detail,
}: GetStartedDetailPanelProps) {
  return (
    <div className="min-w-0 flex-1 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-success-bg text-success-fg">
            <HeaderIcon type={detail.headerIcon} />
          </span>
          <h2 className="text-lg font-semibold text-foreground">{label}</h2>
        </div>
        {detail.durationLabel && (
          <p className="text-sm italic text-muted-foreground">
            {detail.durationLabel}
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">
            {detail.taskTitle}
          </h3>
          <div className="flex shrink-0 items-center gap-3">
            {detail.cardDuration && (
              <span className="text-sm text-muted-foreground">
                {detail.cardDuration}
              </span>
            )}
            {detail.completed && (
              <CheckCircle2
                className="size-4 text-success-fg"
                aria-label="Completed"
              />
            )}
          </div>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>{detail.description}</p>
            {detail.linkLabel && (
              <button
                type="button"
                className="font-medium text-link underline-offset-2 hover:text-link-hover hover:underline"
              >
                {detail.linkLabel}
              </button>
            )}
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-[color-mix(in_srgb,var(--foreground)_88%,var(--background)_12%)]">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-background/80">
                wingify
              </span>
              <span className="rounded-md border border-border/30 bg-background/10 px-2 py-0.5 text-[10px] font-medium text-background/90">
                {detail.videoDuration}
              </span>
            </div>
            <div className="relative flex min-h-[180px] items-center justify-center px-4 py-8">
              <span
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgb(from var(--background) r g b / 0.35) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
                aria-hidden
              />
              <button
                type="button"
                className="relative flex size-11 items-center justify-center rounded-full border border-border/40 bg-background/15 text-background transition-colors hover:bg-background/25"
                aria-label={`Play ${detail.videoTitle}`}
              >
                <Play className="size-4 fill-current" aria-hidden />
              </button>
            </div>
            <div className="border-t border-border/40 px-4 py-3">
              <p className="text-sm font-medium text-background/95">
                {detail.videoTitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-4">
          {detail.actions.map((action) => (
            <Button
              key={action.label}
              type="button"
              variant={action.variant === "outline" ? "outline" : "default"}
              size="sm"
              className={cn(action.external && "gap-1.5")}
            >
              {action.label}
              {action.external && (
                <ExternalLink className="size-3.5" aria-hidden />
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

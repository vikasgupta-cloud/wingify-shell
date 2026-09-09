// @summary Activity overview popover — Account Usage + Activity Timeline.
// Opens near the Activity icon (main rail + detail utility rail). Overlay only;
// does not dismiss Wingz or Quick View. Dummy data; View Details → settings paths.
import {
  cloneElement,
  useState,
  type ReactElement,
} from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Monitor,
  MousePointerClick,
  Plus,
  Smartphone,
  UserCircle,
} from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ACCOUNT_USAGE_DETAILS_PATH,
  ACCOUNT_USAGE_PRODUCTS,
  ACTIVITY_OVERVIEW_EVENTS,
  ACTIVITY_TIMELINE_DETAILS_PATH,
  type AccountUsageProduct,
  type ActivityOverviewEvent,
} from "../../data/activityOverview";

function UsageIcon({ icon }: { icon: AccountUsageProduct["icon"] }) {
  const Icon =
    icon === "monitor"
      ? Monitor
      : icon === "smartphone"
        ? Smartphone
        : MousePointerClick;
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-foreground"
      aria-hidden
    >
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}

function TimelineGlyph({ icon }: { icon: ActivityOverviewEvent["icon"] }) {
  if (icon === "ab") {
    return (
      <span
        className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-foreground"
        aria-hidden
      >
        A/B
      </span>
    );
  }
  const Icon = icon === "globe" ? Globe : UserCircle;
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center" aria-hidden>
      <span className="flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground">
        <Icon className="size-3.5" strokeWidth={1.75} />
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-[var(--success-solid)] text-[var(--success-fg)] ring-2 ring-background">
        <Plus className="size-2.5" strokeWidth={3} />
      </span>
    </span>
  );
}

function ActivityOverviewContent({ onNavigate }: { onNavigate?: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex max-h-[min(32rem,calc(100vh-4rem))] w-[min(44rem,calc(100vw-2rem))] overflow-hidden rounded-lg">
      {/* Account Usage */}
      <section className="flex min-w-0 flex-[1.35] flex-col bg-background">
        <header className="shrink-0 border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">Account Usage</h2>
        </header>
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {ACCOUNT_USAGE_PRODUCTS.map((product, i) => (
            <li
              key={product.id}
              className={cn(
                "px-5 py-4",
                i > 0 && "border-t border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <UsageIcon icon={product.icon} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-foreground">
                        {product.name}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <Badge
                        tone={product.plan === "FREE" ? "green" : "ocean"}
                        fill="light"
                        size="sm"
                        variant="pill"
                      >
                        {product.plan}
                      </Badge>
                      <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                        {product.remaining}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-medium text-foreground">
                      {product.metricLabel}
                    </div>
                    <div className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                      {product.metricValue}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <footer className="shrink-0 border-t border-border px-5 py-3">
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-sm">
            <Link to={ACCOUNT_USAGE_DETAILS_PATH} onClick={onNavigate}>
              View Details
            </Link>
          </Button>
        </footer>
      </section>

      {/* Activity Timeline */}
      <section className="flex min-w-0 flex-1 flex-col border-l border-border bg-muted/30">
        <header className="shrink-0 border-b border-border px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">
            Activity Timeline
          </h2>
        </header>
        <ol className="min-h-0 flex-1 space-y-0 overflow-y-auto px-5 py-4">
          {ACTIVITY_OVERVIEW_EVENTS.map((event, i) => {
            const expanded = expandedId === event.id;
            const showMore =
              Boolean(event.detail) &&
              (event.detail!.length > 90 || event.detail!.includes(","));
            const preview =
              event.detail && !expanded && showMore
                ? `${event.detail.slice(0, 88).trim()}…`
                : event.detail;

            return (
              <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                {i < ACTIVITY_OVERVIEW_EVENTS.length - 1 && (
                  <span
                    className="absolute left-[15px] top-8 bottom-0 w-px bg-border"
                    aria-hidden
                  />
                )}
                <TimelineGlyph icon={event.icon} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="text-[11px] text-muted-foreground">
                    {event.at}
                    <span className="mx-1.5 text-border">|</span>
                    {event.actor}
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    {event.title}
                  </div>
                  {preview && (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {preview}
                    </p>
                  )}
                  {showMore && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 px-2.5 text-xs"
                      onClick={() =>
                        setExpandedId(expanded ? null : event.id)
                      }
                    >
                      {expanded ? "View less" : "View more"}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        <footer className="shrink-0 border-t border-border bg-muted/50 px-5 py-3">
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-sm">
            <Link to={ACTIVITY_TIMELINE_DETAILS_PATH} onClick={onNavigate}>
              View Details
            </Link>
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default function ActivityOverviewPopover({
  children,
  side = "right",
  align = "end",
}: {
  children: ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}) {
  const [open, setOpen] = useState(false);

  const trigger = cloneElement(children, {
    "aria-expanded": open,
    "aria-haspopup": "dialog",
    className: cn(
      (children.props as { className?: string }).className,
      open && "bg-muted hover:bg-muted"
    ),
  } as Partial<typeof children.props> & {
    "aria-expanded": boolean;
    "aria-haspopup": string;
    className: string;
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={10}
        collisionPadding={12}
        className="z-50 w-auto max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-border bg-popover p-0 text-popover-foreground shadow-lg"
      >
        <ActivityOverviewContent onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

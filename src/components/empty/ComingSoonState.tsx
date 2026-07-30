import { Link } from "react-router-dom";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ComingSoonIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      aria-hidden
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Back cards suggest the surface being assembled */}
      <rect
        x="46"
        y="30"
        width="228"
        height="132"
        rx="14"
        fill="hsl(var(--muted) / 0.5)"
      />
      <rect
        x="32"
        y="44"
        width="256"
        height="132"
        rx="14"
        fill="hsl(var(--background))"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
      />
      <path
        d="M32 58a14 14 0 0 1 14-14h228a14 14 0 0 1 14 14v14H32V58Z"
        fill="hsl(var(--muted))"
      />
      <circle cx="52" cy="58" r="4" fill="hsl(var(--muted-foreground) / 0.35)" />
      <circle cx="66" cy="58" r="4" fill="hsl(var(--muted-foreground) / 0.25)" />
      <circle cx="80" cy="58" r="4" fill="hsl(var(--muted-foreground) / 0.18)" />

      {/* Skeleton content blocks */}
      <rect
        x="52"
        y="92"
        width="96"
        height="10"
        rx="5"
        fill="hsl(var(--muted))"
      />
      <rect
        x="52"
        y="112"
        width="168"
        height="8"
        rx="4"
        fill="hsl(var(--muted) / 0.75)"
      />
      <rect
        x="52"
        y="128"
        width="132"
        height="8"
        rx="4"
        fill="hsl(var(--muted) / 0.55)"
      />
      <rect
        x="52"
        y="148"
        width="72"
        height="12"
        rx="6"
        fill="hsl(var(--muted))"
      />

      {/* Dashed "under construction" frame on the right */}
      <rect
        x="212"
        y="92"
        width="60"
        height="68"
        rx="10"
        stroke="hsl(var(--border))"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      <path
        d="M228 138 v-14 M242 138 v-24 M256 138 v-18"
        stroke="hsl(var(--muted-foreground) / 0.45)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Shown on every route that isn't built yet: explains why the page is empty and
 * routes to Web Experimentation, the surface that is fully built.
 */
export default function ComingSoonState({
  title,
  icon: Icon,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[30rem] flex-1 items-center justify-center px-6 py-16",
        className
      )}
    >
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-8 w-full max-w-[320px] text-muted-foreground">
          <ComingSoonIllustration className="h-auto w-full" />
        </div>

        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          <Sparkles className="h-3 w-3" aria-hidden />
          In design
        </span>

        <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
          {Icon && <Icon className="h-6 w-6 shrink-0" aria-hidden />}
          {title}
        </h2>

        <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          This section is still in progress. Explore Web Experimentation in the
          meantime.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link to="/web-experiment">
              Explore Web Experimentation
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/home/dashboard">
              <Compass className="h-4 w-4" aria-hidden />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

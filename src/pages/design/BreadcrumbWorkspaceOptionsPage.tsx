/** Design preview — ways to keep workspace upfront in detail breadcrumbs. */

import type { ComponentType, ReactNode, SVGProps } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FlaskConical,
  Layers,
  MoreHorizontal,
} from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import WorkspaceSwitcher from "@/components/layout/WorkspaceSwitcher";
import { cn } from "@/lib/utils";

const CAMPAIGN = "PDP — sticky Add to Bag on mobile";
const SECTION = "Web Experimentation";
const PRODUCT = "Experimentation";

type IconType = ComponentType<SVGProps<SVGSVGElement> & { strokeWidth?: number }>;

function Slash() {
  return (
    <span className="shrink-0 text-muted-foreground" aria-hidden>
      /
    </span>
  );
}

function Crumb({
  label,
  strong = false,
  muted = false,
  switcher = false,
}: {
  label: string;
  strong?: boolean;
  muted?: boolean;
  switcher?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      className={cn(
        "flex max-w-[12rem] items-center gap-0.5 truncate rounded-md px-1 py-0.5 outline-none transition-colors hover:bg-muted",
        strong && "font-semibold text-foreground",
        muted && "font-normal text-muted-foreground",
        !strong && !muted && "font-normal text-foreground"
      )}
    >
      <span className="truncate">{label}</span>
      {switcher ? (
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      ) : null}
    </button>
  );
}

function Ellipsis() {
  return (
    <button
      type="button"
      aria-label="Show earlier path"
      className="inline-flex h-7 shrink-0 items-center justify-center rounded-md px-1 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    >
      <MoreHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

function Back() {
  return (
    <button
      type="button"
      aria-label="Back"
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

/** Middle crumb reduced to an icon (tooltip via title). */
function IconCrumb({
  label,
  icon: Icon,
}: {
  label: string;
  icon: IconType;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
    </button>
  );
}

function Frame({
  title,
  blurb,
  recommend,
  children,
}: {
  title: string;
  blurb: string;
  recommend?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            {recommend ? (
              <Badge tone="neutral" fill="light" size="sm" variant="pill">
                Leadership-friendly
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{blurb}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <div className="flex h-14 items-center gap-1.5 border-b border-border px-3">
          {children}
        </div>
        <div className="flex h-10 items-center gap-4 px-4 text-sm text-muted-foreground">
          <span>Overview</span>
          <span className="font-medium text-foreground underline decoration-2 underline-offset-8">
            Results
          </span>
          <span>Behaviour</span>
          <span>Surveys</span>
          <span>Live hits</span>
          <span>Vitals</span>
        </div>
        <div className="px-4 py-8 text-sm text-muted-foreground">
          Primary Metric · sample detail body
        </div>
      </div>
    </section>
  );
}

export default function BreadcrumbWorkspaceOptionsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-10">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Design preview
          </p>
          <h1 className="font-title text-2xl font-semibold tracking-tight text-foreground">
            Workspace upfront — breadcrumb options
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Today workspace lives inside the{" "}
            <span className="text-foreground">…</span> overflow. Leadership wants it
            visible without hover — and the trail must stay short on small screens.
            Live detail headers collapse the middle under … below the{" "}
            <code className="rounded bg-muted px-1 text-foreground">md</code>{" "}
            breakpoint.
          </p>
          <p className="text-xs text-muted-foreground">
            Open anytime:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
              /design/breadcrumb-workspace
            </code>
          </p>
        </header>

        {/* Current (problem) */}
        <Frame
          title="Current (problem)"
          blurb="Workspace + product only appear after hovering …"
        >
          <Back />
          <Ellipsis />
          <Slash />
          <Crumb label={SECTION} switcher muted />
          <Slash />
          <Crumb label={CAMPAIGN} strong />
        </Frame>

        <Frame
          title="1. Always-show workspace — LIVE alternate"
          blurb="Pin workspace before … Minimal change to today’s trail. Product sits under …; section stays labeled."
        >
          <Back />
          <WorkspaceSwitcher compact tone="muted" />
          <Slash />
          <Ellipsis />
          <Slash />
          <Crumb label={SECTION} switcher muted />
          <Slash />
          <Crumb label={CAMPAIGN} strong />
        </Frame>

        <Frame
          title="2. Two-row header — LIVE alternate"
          blurb="Row 1 = account context (workspace + product). Row 2 = where you are (back + section + campaign)."
        >
          <div className="flex w-full min-w-0 flex-col gap-1 py-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <WorkspaceSwitcher compact tone="muted" />
              <span className="text-muted-foreground">·</span>
              <Crumb label={PRODUCT} switcher muted />
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <Back />
              <Crumb label={SECTION} switcher muted />
              <Slash />
              <Crumb label={CAMPAIGN} strong />
            </div>
          </div>
        </Frame>

        <Frame
          title="3. Workspace chip outside the breadcrumb — LIVE alternate"
          blurb="Workspace is chrome next to back; path starts at section (product omitted from the trail)."
        >
          <Back />
          <WorkspaceSwitcher compact />
          <span className="mx-1 h-4 w-px shrink-0 bg-border" aria-hidden />
          <Crumb label={SECTION} switcher muted />
          <Slash />
          <Crumb label={CAMPAIGN} strong />
        </Frame>

        <Frame
          title="4. Truncate the middle, never the start — LIVE alternate"
          blurb="Keep workspace + product first and section + campaign last; only true middle collapses under …"
        >
          <Back />
          <WorkspaceSwitcher compact tone="muted" />
          <Slash />
          <Crumb label={PRODUCT} switcher muted />
          <Slash />
          <Ellipsis />
          <Slash />
          <Crumb label={SECTION} switcher muted />
          <Slash />
          <Crumb label={CAMPAIGN} strong />
        </Frame>

        <Frame
          title="5. Split Account vs Where am I — LIVE alternate"
          blurb="Workspace is a persistent account control on the right; breadcrumb is product hierarchy only."
        >
          <div className="flex w-full min-w-0 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <Back />
              <Crumb label={PRODUCT} switcher muted />
              <Slash />
              <Crumb label={SECTION} switcher muted />
              <Slash />
              <Crumb label={CAMPAIGN} strong />
            </div>
            <WorkspaceSwitcher compact />
          </div>
        </Frame>

        <Frame
          title="6. First + last only (middle under …) — LIVE alternate"
          blurb="Show workspace first and campaign last. Product / section and anything in between sit under …"
        >
          <Back />
          <WorkspaceSwitcher compact tone="muted" />
          <Slash />
          <Ellipsis />
          <Slash />
          <Crumb label={CAMPAIGN} strong />
        </Frame>

        <Frame
          title="7. First + last, middle as icons — FINAL"
          blurb="Shipped: short workspace + distinct middle icons (no repeats) + campaign. Narrow screens collapse middle under …."
          recommend
        >
          <Back />
          <WorkspaceSwitcher compact tone="muted" />
          <Slash />
          <IconCrumb label={PRODUCT} icon={FlaskConical} />
          <Slash />
          <IconCrumb label={SECTION} icon={Layers} />
          <Slash />
          <Crumb label={CAMPAIGN} strong />
        </Frame>
      </main>
    </div>
  );
}

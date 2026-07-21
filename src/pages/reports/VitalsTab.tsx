import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Calendar,
  Construction,
  FlaskConical,
  GitFork,
  Info,
  MoreVertical,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Campaign } from "../../data/campaigns";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type VitalId =
  | "data-tracking"
  | "conversion-tracking"
  | "minimum-runtime"
  | "experimentation-conduct"
  | "guardrails";

type VitalTab = {
  id: VitalId;
  label: string;
  icon: LucideIcon | "calendar-7";
  alert?: boolean;
  showAlertsToggle?: boolean;
  alertsHelp: string;
  description: ReactNode;
};

function CalendarSevenIcon({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex h-5 w-5 items-center justify-center", className)}>
      <Calendar className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      <span className="pointer-events-none absolute inset-x-0 top-[9px] text-center text-[8px] font-semibold leading-none">
        7
      </span>
    </span>
  );
}

const VITAL_TABS: VitalTab[] = [
  {
    id: "data-tracking",
    label: "Data Tracking",
    icon: BarChart3,
    showAlertsToggle: true,
    alertsHelp: "Get notified when visitor tracking drops below expected levels.",
    description: (
      <>
        <p>
          When a campaign is tracking a low volume of visitors, it means that
          either there is an issue with a campaign setup or the corresponding
          page does not have any traffic. In any case, it is futile to let the
          campaign run and we strongly recommend checking the campaign setup.
        </p>
        <p>
          These checks are done during the initial days of the campaign and once
          the traffic criteria is met, alerts are disabled for the remaining
          duration of the campaign.
        </p>
      </>
    ),
  },
  {
    id: "conversion-tracking",
    label: "Conversion Tracking",
    icon: GitFork,
    showAlertsToggle: true,
    alertsHelp: "Get notified when conversion events stop firing as expected.",
    description: (
      <p>
        When no conversions are being tracked in a campaign, it means that either
        there is an issue with a campaign setup or the corresponding page does
        not have any traffic. In any case, it is futile to let the campaign run
        and we strongly recommend checking the campaign setup.
      </p>
    ),
  },
  {
    id: "minimum-runtime",
    label: "Minimum Runtime Alert",
    icon: "calendar-7",
    showAlertsToggle: false,
    alertsHelp: "",
    description: (
      <p>
        Visitor behavior on modern websites often changes during the course of
        the week revealing cyclic patterns. All A/B tests are hence recommended
        to be run for at least 7 days to ensure reliability of the campaign.
        Wingify highlights if the campaign duration is less than 7 days or if you
        have received a recommendation in less than 7 days.
      </p>
    ),
  },
  {
    id: "experimentation-conduct",
    label: "Experimentation Conduct",
    icon: FlaskConical,
    alert: true,
    showAlertsToggle: false,
    alertsHelp: "",
    description: (
      <p>
        Changing metric definitions in a running campaign can invalidate collected
        data and lead to unreliable decisions. Wingify flags these configuration
        changes so you can reset or ignore them consciously.
      </p>
    ),
  },
  {
    id: "guardrails",
    label: "Guardrails",
    icon: Construction,
    showAlertsToggle: true,
    alertsHelp: "Get notified when guardrail metrics breach configured thresholds.",
    description: (
      <p>
        Guardrail metrics help you monitor the impact of experimentation on key
        business metrics. Wingify alerts you when a guardrail metric shows a
        statistically significant negative impact so you can take action early.
      </p>
    ),
  },
];

function AlertsToggle({
  checked,
  onCheckedChange,
  help,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  help: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-[hsl(var(--report-brand))]"
        aria-label="Alerts"
      />
      <span className="text-sm font-medium text-foreground">Alerts</span>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="About alerts"
          >
            <Info className="h-3.5 w-3.5" aria-hidden />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          {help}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function PausedStatus() {
  return (
    <div className="rounded-lg border border-border bg-muted/40 px-5 py-4">
      <p className="text-sm font-semibold text-foreground">Campaign is paused.</p>
    </div>
  );
}

function ConductFaultStatus() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/30 px-5 py-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-vitals-unhealthy text-background">
          <X className="h-2.5 w-2.5" strokeWidth={3} aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold leading-snug text-vitals-unhealthy">
            Fault in experiment configuration as Metric was changed in a running
            campaign.
          </p>
          <p className="text-xs text-muted-foreground">26 Jun 2026, 13:51</p>
        </div>
      </div>
      <p className="text-sm leading-5 text-foreground/80">
        We recommend you to flush all data in this campaign for reliable results.
      </p>
      <div className="flex items-center gap-6 pt-1">
        <button
          type="button"
          className="text-sm font-medium text-report-brand-fg transition-colors hover:text-report-brand"
        >
          Flush Data
        </button>
        <button
          type="button"
          className="text-sm font-medium text-report-brand-fg transition-colors hover:text-report-brand"
        >
          Ignore
        </button>
      </div>
    </div>
  );
}

function GuardrailsStatus({ campaign }: { campaign: Campaign }) {
  const metricLabel = campaign.primaryMetric || "Form submits on checkout";

  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3.5">
      <span className="inline-flex shrink-0 items-center rounded-full bg-[hsl(var(--report-ctrl-bg))] px-2.5 py-0.5 text-xs font-semibold text-report-brand-fg">
        M5005
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
        {metricLabel}
      </span>
      <span className="shrink-0 text-sm text-muted-foreground">
        Campaign is paused.
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-muted-foreground"
        aria-label="More actions"
      >
        <MoreVertical className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}

function VitalStatus({
  vitalId,
  campaign,
}: {
  vitalId: VitalId;
  campaign: Campaign;
}) {
  if (vitalId === "experimentation-conduct") return <ConductFaultStatus />;
  if (vitalId === "guardrails") return <GuardrailsStatus campaign={campaign} />;
  return <PausedStatus />;
}

export default function VitalsTab({ campaign }: { campaign: Campaign }) {
  const [activeId, setActiveId] = useState<VitalId>(
    campaign.vitals === "unhealthy" ? "experimentation-conduct" : "data-tracking"
  );
  const [alertsOn, setAlertsOn] = useState<Record<string, boolean>>({
    "data-tracking": true,
    "conversion-tracking": true,
    guardrails: true,
  });

  const active = VITAL_TABS.find((t) => t.id === activeId) ?? VITAL_TABS[0]!;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="mx-auto max-w-[920px] space-y-8 px-12 pb-16 pt-10">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Report: Experiment Vitals
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            These vitals serve as checks and balances to maintain the integrity of
            this process.{" "}
            <button
              type="button"
              className="font-medium text-report-brand-fg transition-colors hover:text-report-brand"
            >
              Learn more
            </button>
          </p>
        </header>

        <nav
          className="flex items-end gap-1 border-b border-border"
          aria-label="Experiment vitals"
        >
          {VITAL_TABS.map((tab) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                aria-label={tab.label}
                aria-current={selected ? "page" : undefined}
                className={cn(
                  "relative flex h-12 w-14 items-center justify-center text-muted-foreground transition-colors hover:text-foreground",
                  selected && "text-foreground"
                )}
              >
                <span className="relative inline-flex">
                  {tab.icon === "calendar-7" ? (
                    <CalendarSevenIcon />
                  ) : (
                    <tab.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                  )}
                  {tab.alert ? (
                    <span className="absolute -bottom-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-vitals-unhealthy text-background">
                      <X className="h-2 w-2" strokeWidth={3} aria-hidden />
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "absolute inset-x-2 bottom-0 h-0.5 origin-center rounded-full bg-[hsl(var(--report-brand))] transition-transform",
                    selected ? "scale-x-100" : "scale-x-0"
                  )}
                />
              </button>
            );
          })}
        </nav>

        <section className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-foreground">
              {active.label}
            </h2>
            {active.showAlertsToggle ? (
              <AlertsToggle
                checked={alertsOn[active.id] ?? true}
                onCheckedChange={(v) =>
                  setAlertsOn((prev) => ({ ...prev, [active.id]: v }))
                }
                help={active.alertsHelp}
              />
            ) : null}
          </div>

          <div className="space-y-4 text-sm leading-6 text-muted-foreground">
            {active.description}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Status</h3>
            <VitalStatus vitalId={active.id} campaign={campaign} />
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}

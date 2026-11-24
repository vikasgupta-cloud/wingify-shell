/**
 * All-metrics scroll shell for Web Experimentation reports.
 * Groups metrics with one section divider each; rail jumps scroll the pane.
 * Block chrome (Focus-style table / graphs) is rendered by the parent.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Focus, Rows3 } from "@/components/icons/protoLucide";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  reportGuardrailMetrics,
  reportSecondaryMetrics,
  type Campaign,
} from "../../data/campaigns";

export type MetricRole = "primary" | "secondary" | "guardrail";

export type MetricNavItem = {
  name: string;
  role: MetricRole;
};

export function metricSectionId(name: string): string {
  return `metric-section-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function buildMetricNavItems(campaign: Campaign): MetricNavItem[] {
  return [
    { name: campaign.primaryMetric, role: "primary" },
    ...reportSecondaryMetrics(campaign.report).map((m) => ({
      name: m.name,
      role: "secondary" as const,
    })),
    ...reportGuardrailMetrics(campaign.report).map((m) => ({
      name: m.name,
      role: "guardrail" as const,
    })),
  ];
}

const ROLE_LABEL: Record<MetricRole, string> = {
  primary: "Primary",
  secondary: "Secondary",
  guardrail: "Guardrails",
};

const ROLE_ORDER: MetricRole[] = ["primary", "secondary", "guardrail"];

/**
 * Theme-switcher style: muted track, active = raised pill with icon+label,
 * inactive = icon only (tooltip for the label).
 */
function MetricsLayoutSwitch({
  value,
  onChange,
}: {
  value: "focus" | "all";
  onChange: (next: "focus" | "all") => void;
}) {
  const options = [
    { id: "focus" as const, label: "One metric", Icon: Focus },
    { id: "all" as const, label: "All metrics", Icon: Rows3 },
  ];

  return (
    <div
      className="inline-flex h-9 items-center gap-0.5 rounded-lg border border-border bg-secondary p-1"
      role="group"
      aria-label="Choose how to view metrics"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        const button = (
          <button
            type="button"
            aria-label={opt.label}
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "inline-flex h-7 items-center justify-center gap-1.5 rounded-md text-sm transition-colors",
              active
                ? "bg-background px-2.5 font-medium text-foreground shadow-sm"
                : "w-7 text-muted-foreground hover:text-foreground"
            )}
          >
            <opt.Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {active ? <span>{opt.label}</span> : null}
          </button>
        );

        if (active) {
          return <span key={opt.id}>{button}</span>;
        }

        return (
          <Tooltip key={opt.id}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="bottom">{opt.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

export { MetricsLayoutSwitch };

export default function AllMetricsView({
  campaign,
  scrollRootRef,
  activeMetric,
  onActiveMetricChange,
  jumpRequest,
  renderMetric,
}: {
  campaign: Campaign;
  scrollRootRef: RefObject<HTMLElement | null>;
  activeMetric: string;
  onActiveMetricChange: (name: string) => void;
  jumpRequest: number;
  renderMetric: (item: MetricNavItem) => ReactNode;
}) {
  const items = useMemo(() => buildMetricNavItems(campaign), [campaign]);
  const groups = useMemo(() => {
    return ROLE_ORDER.map((role) => ({
      role,
      label: ROLE_LABEL[role],
      items: items.filter((item) => item.role === role),
    })).filter((g) => g.items.length > 0);
  }, [items]);

  const [flashName, setFlashName] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jumpingRef = useRef(false);
  const jumpClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMetricRef = useRef(activeMetric);
  activeMetricRef.current = activeMetric;

  const scrollToMetric = useCallback(
    (name: string) => {
      const root = scrollRootRef.current;
      const el = document.getElementById(metricSectionId(name));
      if (!root || !el) return;

      jumpingRef.current = true;
      if (jumpClearTimer.current) clearTimeout(jumpClearTimer.current);

      const rootRect = root.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const nextTop = Math.max(
        0,
        elRect.top - rootRect.top + root.scrollTop - 12
      );

      root.scrollTo({ top: nextTop, behavior: "smooth" });
      setFlashName(name);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashName(null), 700);

      const clearJump = () => {
        jumpingRef.current = false;
        root.removeEventListener("scrollend", clearJump);
      };
      root.addEventListener("scrollend", clearJump);
      jumpClearTimer.current = setTimeout(clearJump, 700);
    },
    [scrollRootRef]
  );

  useEffect(() => {
    if (!jumpRequest) return;
    scrollToMetric(activeMetric);
  }, [jumpRequest, activeMetric, scrollToMetric]);

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
      if (jumpClearTimer.current) clearTimeout(jumpClearTimer.current);
    };
  }, []);

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const sections = items
      .map((item) => document.getElementById(metricSectionId(item.name)))
      .filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (jumpingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0)
          );
        const name = visible[0]?.target.getAttribute("data-metric-name");
        if (name && name !== activeMetricRef.current) {
          onActiveMetricChange(name);
        }
      },
      {
        root,
        rootMargin: "-10% 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items, scrollRootRef, onActiveMetricChange, campaign.id]);

  return (
    <div className="flex flex-col gap-10">
      {groups.map((group) => (
        <div key={group.role} className="flex flex-col gap-8">
          {group.role !== "primary" ? (
            <div className="flex items-center gap-3" aria-hidden>
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {group.label}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          ) : null}
          {group.items.map((item) => (
            <section
              key={item.name}
              id={metricSectionId(item.name)}
              data-metric-name={item.name}
              className={cn(
                "scroll-mt-4 transition-[box-shadow] duration-300",
                flashName === item.name && "ring-2 ring-foreground/25 rounded-lg"
              )}
            >
              {renderMetric(item)}
            </section>
          ))}
        </div>
      ))}
    </div>
  );
}

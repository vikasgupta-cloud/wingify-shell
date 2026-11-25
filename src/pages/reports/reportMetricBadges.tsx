/**
 * Colored metric ID badges (M1, M2…) for Web Experimentation reports rail + headers.
 * Soft tint pairs — allowed status-like color for metric identity (screenshot parity).
 */
import { Star } from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";

const METRIC_BADGE_TONES = [
  {
    bg: "var(--metric-badge-1-bg)",
    fg: "var(--metric-badge-1-fg)",
  },
  {
    bg: "var(--metric-badge-2-bg)",
    fg: "var(--metric-badge-2-fg)",
  },
  {
    bg: "var(--metric-badge-3-bg)",
    fg: "var(--metric-badge-3-fg)",
  },
  {
    bg: "var(--metric-badge-4-bg)",
    fg: "var(--metric-badge-4-fg)",
  },
  {
    bg: "var(--metric-badge-5-bg)",
    fg: "var(--metric-badge-5-fg)",
  },
] as const;

export function metricBadgeIndex(metricName: string, orderedNames: string[]): number {
  const idx = orderedNames.indexOf(metricName);
  return idx >= 0 ? idx : Math.abs(hashName(metricName)) % METRIC_BADGE_TONES.length;
}

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return h;
}

export function metricCode(index: number): string {
  return `M${index + 1}`;
}

export function MetricIdBadge({
  index,
  starred,
  className,
}: {
  /** 0-based index into the campaign’s metric order (primary first). */
  index: number;
  starred?: boolean;
  className?: string;
}) {
  const tone = METRIC_BADGE_TONES[index % METRIC_BADGE_TONES.length]!;
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center gap-0.5 rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
        className
      )}
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      {starred ? <Star className="h-2.5 w-2.5 fill-current" aria-hidden /> : null}
      {metricCode(index)}
    </span>
  );
}

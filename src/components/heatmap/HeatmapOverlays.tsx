// Per-visualization overlays for the heatmap viewer. Each one paints on top of
// the preview iframe and is purely presentational — data lives in
// src/data/heatmapViewer.ts, color comes from the report tokens only.

import { useState } from "react";
import { Info } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CLICK_AREA_SELECTION,
  CLICK_TARGETS,
  CLICKMAP_TOOLTIP,
  CLICKMAP_TOTAL,
  ELEMENT_LIST_TOTAL,
  ELEMENT_ROWS,
  FRICTION_DOTS,
  HEAT_DOTS,
  HOVER_DOTS,
  SCROLL_BANDS,
  SCROLLMAP_STATS,
  ZONALMAP_TOOLTIP,
  ZONALMAP_TOTAL,
  ZONES,
  EDIT_ZONE_DRAFTS,
  type HeatDot,
  type HeatTier,
  type Rect,
} from "@/data/heatmapViewer";

/**
 * Cool -> warm ramp shared by every density overlay, so a hotspot reads the
 * same whether it came from clicks, hovers, or friction. Index = heat tier.
 */
const HEAT_RAMP: Record<HeatTier, string> = {
  0: "rgb(from var(--report-link) r g b / 0.85) 0%, rgb(from var(--report-link) r g b / 0.4) 40%, transparent 72%",
  1: "rgb(from var(--report-green-mid) r g b / 0.9) 0%, rgb(from var(--report-link) r g b / 0.55) 45%, transparent 76%",
  2: "rgb(from var(--report-red) r g b / 0.95) 0%, rgb(from var(--warning-solid) r g b / 0.85) 22%, rgb(from var(--report-green-mid) r g b / 0.6) 46%, rgb(from var(--report-link) r g b / 0.4) 66%, transparent 82%",
};

/** Same ramp as a vertical bar — used by the scrollmap and zonal legends. */
const LEGEND_GRADIENT =
  "linear-gradient(to top, var(--report-link), var(--report-green-mid), var(--report-green), var(--warning-solid), var(--report-red))";

const ZONE_FILL: Record<HeatTier, string> = {
  0: "rgb(from var(--report-link) r g b / 0.32)",
  1: "rgb(from var(--warning-solid) r g b / 0.38)",
  2: "rgb(from var(--report-red) r g b / 0.55)",
};

function rectStyle([left, top, width, height]: Rect) {
  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${width}%`,
    height: `${height}%`,
  };
}

/** Dark scrim the density overlays sit on so the glows stay readable. */
function Scrim() {
  return (
    <div
      className="pointer-events-none absolute inset-0 bg-foreground/70"
      aria-hidden
    />
  );
}

function DotField({ dots }: { dots: readonly HeatDot[] }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 mix-blend-screen"
      aria-hidden
    >
      {dots.map(([left, top, size, heat], i) => (
        <span
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: size,
            height: size,
            background: `radial-gradient(circle, ${HEAT_RAMP[heat]})`,
          }}
        />
      ))}
    </div>
  );
}

/** Floating stat card — the shape every overlay reuses for hover readouts. */
function StatCard({
  at,
  title,
  children,
  className,
}: {
  at: readonly [number, number];
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "absolute w-[268px] rounded-lg border border-border bg-background p-4 shadow-xl",
        className
      )}
      style={{ left: `${at[0]}%`, top: `${at[1]}%` }}
    >
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{children}</p>
    </div>
  );
}

export function HeatmapOverlay() {
  return (
    <>
      <Scrim />
      <DotField dots={HEAT_DOTS} />
    </>
  );
}

export function HovermapOverlay() {
  return (
    <>
      <Scrim />
      <DotField dots={HOVER_DOTS} />
    </>
  );
}

export function FrictionmapOverlay() {
  return (
    <>
      <Scrim />
      <DotField dots={FRICTION_DOTS} />
    </>
  );
}

/** Dashed outlines on every tracked element, plus one parked readout. */
export function ClickmapOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {CLICK_TARGETS.map((target) => (
        <span
          key={target.id}
          className="absolute border border-dashed border-foreground/45"
          style={rectStyle(target.rect)}
          aria-hidden
        />
      ))}
      <StatCard at={CLICKMAP_TOOLTIP.at} title={`${CLICKMAP_TOOLTIP.clicks} Clicks`}>
        <span className="font-medium text-foreground">
          {CLICKMAP_TOOLTIP.share}
        </span>{" "}
        of total{" "}
        <span className="font-semibold text-foreground">{CLICKMAP_TOTAL}</span>{" "}
        clicks on page
      </StatCard>
    </div>
  );
}

/** Coach mark first; once dismissed the drawn comparison region shows. */
export function ClickAreaOverlay() {
  const [coachOpen, setCoachOpen] = useState(true);

  return (
    <div className="absolute inset-0">
      {coachOpen ? (
        <div className="absolute left-1/2 top-[22%] w-[400px] -translate-x-1/2 rounded-lg border border-border bg-background p-5 shadow-xl">
          <div className="flex items-center gap-2">
            <Info className="size-4 text-muted-foreground" aria-hidden />
            <p className="text-lg font-semibold text-foreground">Click Area</p>
          </div>
          <p className="mt-3 text-sm leading-5 text-muted-foreground">
            Click and Drag to select areas of the page that you want to compare
          </p>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={() => setCoachOpen(false)}>
              Got it
            </Button>
          </div>
        </div>
      ) : (
        <span
          className="pointer-events-none absolute border-2 border-foreground/70"
          style={rectStyle(CLICK_AREA_SELECTION)}
          aria-hidden
        />
      )}
    </div>
  );
}

/** Scroll-depth bands, the fold marker, and the depth legend. */
export function ScrollmapOverlay() {
  const { totalViews, foldAt, foldViews, foldShare } = SCROLLMAP_STATS;
  let previous = 0;

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 mix-blend-multiply" aria-hidden>
        {SCROLL_BANDS.map((band) => {
          const top = previous;
          previous = band.to;
          return (
            <span
              key={band.to}
              className="absolute inset-x-0 block"
              style={{
                top: `${top}%`,
                height: `${band.to - top}%`,
                background: `rgb(from var(${band.token}) r g b / ${band.alpha})`,
              }}
            />
          );
        })}
      </div>

      <p className="absolute left-4 top-[13%] -translate-y-1/2 text-sm font-semibold text-background">
        100% <span className="font-normal">({totalViews}) views</span>
      </p>

      {/* Fold marker: full-width rule with the running total parked on it. */}
      <div className="absolute inset-x-0" style={{ top: `${foldAt}%` }}>
        <span className="block h-0.5 w-full bg-background" aria-hidden />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-background px-4 py-1.5 text-sm text-foreground shadow-md">
          {foldViews} Views{" "}
          <span className="font-semibold">({foldShare})</span> up to this point
        </span>
      </div>

      <div className="absolute right-6 top-1/2 flex -translate-y-1/2 items-stretch gap-2">
        <ul className="flex flex-col justify-between text-right text-xs font-medium text-foreground">
          {[100, 90, 80, 70, 60, 50, 40, 30, 20, 10].map((tick) => (
            <li key={tick}>{tick}%</li>
          ))}
        </ul>
        <span
          className="w-2.5 rounded-sm"
          style={{ background: LEGEND_GRADIENT }}
          aria-hidden
        />
      </div>
    </div>
  );
}

/** Zone fills with their click share, plus a High/Low legend. */
export function ZonalmapOverlay() {
  const tooltipZone = ZONES.find((z) => z.id === ZONALMAP_TOOLTIP.zoneId);

  return (
    <div className="pointer-events-none absolute inset-0">
      {ZONES.map((zone) => (
        <span
          key={zone.id}
          className="absolute flex items-center justify-center"
          style={{
            ...rectStyle(zone.rect),
            background: ZONE_FILL[zone.tier],
          }}
        >
          <span className="rounded-md bg-foreground/70 px-2 py-0.5 text-2xl font-semibold tabular-nums text-background">
            {zone.label}
          </span>
        </span>
      ))}

      {tooltipZone ? (
        <StatCard
          at={ZONALMAP_TOOLTIP.at}
          title={`${tooltipZone.clicks} Clicks`}
        >
          <span className="font-semibold text-foreground">
            {tooltipZone.label}
          </span>{" "}
          of total{" "}
          <span className="font-semibold text-foreground">
            {ZONALMAP_TOTAL}
          </span>{" "}
          clicks on this page
        </StatCard>
      ) : null}

      <div className="absolute bottom-24 right-6 flex flex-col items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">High</span>
        <span
          className="h-48 w-2.5 rounded-sm"
          style={{ background: LEGEND_GRADIENT }}
          aria-hidden
        />
        <span className="text-xs font-medium text-foreground">Low</span>
      </div>
    </div>
  );
}

/** Ranked table of tracked elements, docked to the right edge. */
export function ElementListOverlay() {
  const [scope, setScope] = useState("visible");
  const top = ELEMENT_ROWS[0]?.clicks ?? 1;

  return (
    <aside className="absolute right-0 top-0 flex max-h-[72vh] w-[520px] flex-col border border-border bg-background shadow-xl">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <p className="text-base font-semibold text-foreground">Element List</p>
        <Select value={scope} onValueChange={setScope}>
          <SelectTrigger className="h-8 w-[112px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visible">visible</SelectItem>
            <SelectItem value="all">all</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-background">
            <tr className="border-b border-border text-left text-muted-foreground">
              <th scope="col" className="px-4 py-2 font-medium">
                Element
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                Type
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                Clicks
              </th>
              <th scope="col" className="py-2 pr-4 font-medium">
                % of Total
              </th>
            </tr>
          </thead>
          <tbody>
            {ELEMENT_ROWS.map((row, i) => (
              <tr key={`${row.element}-${i}`} className="border-b border-border">
                <td className="max-w-[190px] truncate px-4 py-2.5 text-foreground">
                  {row.element}
                </td>
                <td className="py-2.5 pr-4 text-foreground">{row.type}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-foreground">
                  {row.clicks}
                </td>
                <td className="py-2.5 pr-4">
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3.5 w-1.5 shrink-0 rounded-sm bg-report-link"
                      style={{ opacity: Math.max(0.35, row.clicks / top) }}
                      aria-hidden
                    />
                    <span className="flex-1 text-right tabular-nums text-foreground">
                      {row.share}
                    </span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="shrink-0 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        {ELEMENT_ROWS.length} of {ELEMENT_LIST_TOTAL} tracked clicks
      </p>
    </aside>
  );
}

/**
 * Edit-zones mode. Draft regions read as hatched placeholders at 0% so they're
 * clearly "not measured yet" rather than a zone with no clicks.
 */
export function EditZonesLayer() {
  return (
    <div className="absolute inset-x-0 bottom-14 top-0 z-20">
      {EDIT_ZONE_DRAFTS.map((rect, i) => (
        <span
          key={i}
          className="absolute flex items-center justify-center border border-foreground/25"
          style={{
            ...rectStyle(rect),
            backgroundImage:
              "repeating-linear-gradient(45deg, rgb(from var(--foreground) r g b / 0.16) 0 8px, transparent 8px 16px)",
          }}
        >
          <span className="rounded-md bg-foreground/70 px-2 py-0.5 text-2xl font-semibold tabular-nums text-background">
            0%
          </span>
        </span>
      ))}
    </div>
  );
}

// @summary Live traffic-allocation breakdown for Variations and Targets.
// In/out cards, clear In vs Out mix bar with labels, then campaign-split bar
// + chip legend. Live from trafficAllocation + variation splits.
import { useMemo, type ReactElement, type ReactNode } from "react";
import { HelpCircle } from "@/components/icons/protoLucide";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CHART } from "../../config/chartTokens";
import { useConfigStore, type ConfigVariation } from "../../store/config";

type Slice = {
  id: string;
  label: string;
  ofCampaign: number;
  ofSite: number;
  fill: string;
};

type Model = {
  inCampaign: number;
  outCampaign: number;
  slices: Slice[];
};

/** High-contrast categorical order (token numbers) for adjacent variations. */
const SERIES_ORDER = [6, 3, 1, 5, 8, 2, 4, 7] as const;

/** “Out” stays on baseline chrome — never a categorical series colour. */
const OUT_FILL = CHART.baseline;
const OUT_BG = CHART.baselineBg;
const IN_FILL = "var(--chart-6)";
const IN_TINT = "color-mix(in srgb, var(--chart-6) 12%, var(--background))";

const MIN_VISUAL_PCT = 4;

function seriesFill(tone: number) {
  const n = SERIES_ORDER[tone % SERIES_ORDER.length]!;
  return `var(--chart-${n})`;
}

function buildModel(
  trafficAllocation: number,
  variations: ConfigVariation[]
): Model {
  const inCampaign = Math.max(0, Math.min(100, trafficAllocation));
  const outCampaign = 100 - inCampaign;
  const slices = variations.map((v, i) => ({
    id: v.id,
    label: v.name || v.label,
    ofCampaign: v.split,
    ofSite: Math.round(((inCampaign * v.split) / 100) * 10) / 10,
    fill: seriesFill(i),
  }));
  return { inCampaign, outCampaign, slices };
}

/** Expand tiny positive shares so bars stay hoverable; renormalize to 100. */
function visualWeights(values: number[]): number[] {
  const positive = values.map((v) => (v > 0 ? Math.max(v, MIN_VISUAL_PCT) : 0));
  const sum = positive.reduce((a, b) => a + b, 0);
  if (sum <= 0) return values.map(() => 0);
  return positive.map((v) => (v / sum) * 100);
}

function Tip({
  label,
  detail,
  children,
  side = "top",
}: {
  label: string;
  detail: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip delayDuration={120}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        className="max-w-[280px] border px-3 py-2.5 shadow-md"
        style={{
          background: CHART.tooltipBg,
          color: CHART.tooltipText,
          borderColor: "var(--border)",
        }}
      >
        <div className="space-y-1">
          <div className="text-xs font-semibold">{label}</div>
          <div
            className="text-xs leading-relaxed"
            style={{ color: CHART.tooltipTextSecondary }}
          >
            {detail}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function SliceDetail({
  ofSite,
  ofCampaign,
  inCampaign,
}: {
  ofSite: number;
  ofCampaign: number;
  inCampaign: number;
}) {
  return (
    <>
      About{" "}
      <span className="tabular-nums font-medium" style={{ color: CHART.tooltipText }}>
        {ofCampaign}%
      </span>{" "}
      of people in the campaign see this variation.
      <br />
      That is roughly{" "}
      <span className="tabular-nums font-medium" style={{ color: CHART.tooltipText }}>
        {ofSite}%
      </span>{" "}
      of everyone on the test pages
      {inCampaign < 100 ? ` (because only ${inCampaign}% are in the campaign).` : "."}
    </>
  );
}

export default function TrafficAllocationViz({ campaignId }: { campaignId: string }) {
  const trafficAllocation = useConfigStore(
    (s) => s.configs[campaignId]?.trafficAllocation ?? 0
  );
  const variations = useConfigStore(
    (s) => s.configs[campaignId]?.variations ?? []
  );

  const model = useMemo(
    () => buildModel(trafficAllocation, variations),
    [trafficAllocation, variations]
  );

  const inOutWeights = useMemo(
    () => visualWeights([model.inCampaign, model.outCampaign]),
    [model.inCampaign, model.outCampaign]
  );

  const campaignWeights = useMemo(
    () => visualWeights(model.slices.map((s) => s.ofCampaign)),
    [model.slices]
  );

  if (!variations.length) return null;

  return (
    <TooltipProvider delayDuration={150}>
      <div id="section-variations-traffic-viz" className="scroll-mt-20">
        <div className="mb-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block text-sm font-medium text-foreground">
              How traffic is allocated
            </span>
            <Tip
              label="What this shows"
              detail="Traffic allocation decides how many visitors enter the campaign. Variation split then divides those visitors across Control and each variation. Hover the mix bar or chips for details."
              side="right"
            >
              <button
                type="button"
                className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="About traffic allocation"
              >
                <HelpCircle className="size-3.5" />
              </button>
            </Tip>
          </div>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Live view of how test-page traffic enters the campaign and how that
            share splits across variations.
          </p>
        </div>

        <div className="space-y-4 overflow-hidden rounded-lg border border-border bg-background p-6">
          {/* In / Out */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Tip
              label="In campaign"
              detail="Visitors allocated into this experiment by the traffic slider."
            >
              <div
                className="cursor-default rounded-xl border border-border px-4 py-3 transition-shadow hover:shadow-md"
                style={{ background: IN_TINT }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: IN_FILL }}
                    aria-hidden
                  />
                  In campaign
                </div>
                <div className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {model.inCampaign}%
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/80">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${model.inCampaign}%`,
                      background: IN_FILL,
                    }}
                  />
                </div>
              </div>
            </Tip>

            <Tip
              label="Not in campaign"
              detail="Held out by traffic allocation — never see a variation."
            >
              <div
                className="cursor-default rounded-xl border border-dashed border-border px-4 py-3 transition-shadow hover:shadow-md"
                style={{ background: OUT_BG }}
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: OUT_FILL }}
                    aria-hidden
                  />
                  Not in campaign
                </div>
                <div className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {model.outCampaign}%
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background/80">
                  <div
                    className="h-full rounded-full transition-[width] duration-300"
                    style={{
                      width: `${model.outCampaign}%`,
                      background: OUT_FILL,
                    }}
                  />
                </div>
              </div>
            </Tip>
          </div>

          {/* Site mix: In vs Out first, then variation split inside campaign */}
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Site traffic mix
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  100%
                </span>
              </div>

              <div
                className="flex h-4 w-full gap-0.5 overflow-hidden rounded-full"
                role="img"
                aria-label={`In campaign ${model.inCampaign}%, not in campaign ${model.outCampaign}%`}
              >
                {model.inCampaign > 0 && (
                  <Tip
                    label="In campaign"
                    detail={
                      <>
                        <span
                          className="tabular-nums font-medium"
                          style={{ color: CHART.tooltipText }}
                        >
                          {model.inCampaign}%
                        </span>{" "}
                        of test-page visitors enter the experiment.
                      </>
                    }
                  >
                    <div
                      className="cursor-default rounded-l-full transition-[flex-grow] duration-300 hover:brightness-110"
                      style={{
                        flexGrow: inOutWeights[0],
                        flexBasis: 0,
                        background: IN_FILL,
                        minWidth: 8,
                        borderRadius:
                          model.outCampaign > 0
                            ? "9999px 4px 4px 9999px"
                            : 9999,
                      }}
                    />
                  </Tip>
                )}
                {model.outCampaign > 0 && (
                  <Tip
                    label="Not in campaign"
                    detail={
                      <>
                        <span
                          className="tabular-nums font-medium"
                          style={{ color: CHART.tooltipText }}
                        >
                          {model.outCampaign}%
                        </span>{" "}
                        are held out and never see a variation.
                      </>
                    }
                  >
                    <div
                      className="cursor-default transition-[flex-grow] duration-300 hover:brightness-105"
                      style={{
                        flexGrow: inOutWeights[1],
                        flexBasis: 0,
                        background: OUT_FILL,
                        minWidth: 8,
                        borderRadius:
                          model.inCampaign > 0
                            ? "4px 9999px 9999px 4px"
                            : 9999,
                      }}
                    />
                  </Tip>
                )}
              </div>

              {/* Explicit labels under the bar — easy In vs Out read */}
              <div
                className="mt-1.5 flex gap-0.5 text-xs"
                style={{ minHeight: "1.25rem" }}
              >
                {model.inCampaign > 0 && (
                  <div
                    className="flex min-w-0 items-center gap-1.5 truncate"
                    style={{
                      flexGrow: inOutWeights[0],
                      flexBasis: 0,
                    }}
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: IN_FILL }}
                      aria-hidden
                    />
                    <span className="truncate text-muted-foreground">
                      In{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        {model.inCampaign}%
                      </span>
                    </span>
                  </div>
                )}
                {model.outCampaign > 0 && (
                  <div
                    className="flex min-w-0 items-center justify-end gap-1.5 truncate"
                    style={{
                      flexGrow: inOutWeights[1],
                      flexBasis: 0,
                    }}
                  >
                    <span className="truncate text-muted-foreground">
                      Out{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        {model.outCampaign}%
                      </span>
                    </span>
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: OUT_FILL }}
                      aria-hidden
                    />
                  </div>
                )}
              </div>
            </div>

            {model.inCampaign > 0 && (
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Who sees which variation
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Of the {model.inCampaign}% in the campaign
                  </span>
                </div>

                <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
                  {model.slices.map((s, i) =>
                    s.ofCampaign > 0 ? (
                      <Tip
                        key={s.id}
                        label={s.label}
                        detail={
                          <SliceDetail
                            ofSite={s.ofSite}
                            ofCampaign={s.ofCampaign}
                            inCampaign={model.inCampaign}
                          />
                        }
                      >
                        <div
                          className="cursor-default transition-[flex-grow] duration-300 hover:brightness-110"
                          style={{
                            flexGrow: campaignWeights[i],
                            flexBasis: 0,
                            background: s.fill,
                            minWidth: 4,
                          }}
                        />
                      </Tip>
                    ) : null
                  )}
                </div>

                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {model.slices.map((s) => (
                    <Tip
                      key={s.id}
                      label={s.label}
                      detail={
                        <SliceDetail
                          ofSite={s.ofSite}
                          ofCampaign={s.ofCampaign}
                          inCampaign={model.inCampaign}
                        />
                      }
                    >
                      <li className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border/70 bg-muted/20 px-2.5 py-1 text-xs transition-colors hover:bg-muted/40">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ background: s.fill }}
                          aria-hidden
                        />
                        <span className="max-w-[9rem] truncate font-medium text-foreground">
                          {s.label}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {s.ofCampaign}%
                          </span>
                          {" of campaign"}
                        </span>
                      </li>
                    </Tip>
                  ))}
                </ul>

                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Percentages above add up to 100% of campaign visitors. Hover a
                  chip to see what that means as a share of all test-page
                  traffic.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

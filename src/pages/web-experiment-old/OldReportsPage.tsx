import { useParams } from "react-router-dom";
import {
  Filter,
  HelpCircle,
  Info,
  MoreVertical,
  Play,
  RefreshCw,
  Settings,
  Sparkles,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVisibleCampaigns } from "@/store/rows";
import { cn } from "@/lib/utils";

function linePath(values: number[], w: number, h: number) {
  if (values.length === 0) return "";
  const max = Math.max(...values, 0.01);
  return values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - (v / max) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function OldReportsPage() {
  const { entityId = "" } = useParams();
  const campaign = useVisibleCampaigns().find((c) => c.id === entityId);
  if (!campaign) return null;

  const variants = campaign.report.variants;
  const control = variants.find((v) => v.isBest === false && v.label === "C") ?? variants[0];
  const v1 = variants.find((v) => v.label !== "C") ?? variants[1];
  const controlSeries = [0.2, 0.3, 0.4, 0.45, 0.48, 0.48, control?.convRate ?? 0.5];
  const v1Series = [1, 2.5, 4, 6, 7.5, 8.5, v1?.convRate ?? 9.5];

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Metrics</h3>
          <Button type="button" variant="outline" size="sm">
            Compare
          </Button>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
              M4
            </span>
            <span className="min-w-0 truncate font-medium text-foreground">
              {campaign.primaryMetric}
            </span>
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
              Primary
            </span>
          </div>
          {campaign.report.otherMetrics.slice(0, 6).map((m, i) => (
            <button
              key={m.name}
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground">
                M{i + 1}
              </span>
              <span className="truncate">{m.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Behavior Analysis
          </p>
          <p className="text-sm">Heatmaps</p>
          <p className="text-sm">Session Recordings</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-y-auto bg-canvas p-8">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-title flex items-center gap-2 text-2xl font-semibold">
            Report
            <Play className="size-4 text-muted-foreground" />
          </h2>
          <Button type="button" variant="outline" size="sm">
            <Sparkles className="size-3.5" />
            Summary ready
          </Button>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-md border border-border bg-background px-4 py-2.5 text-sm">
          <p>
            <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
              V1
            </span>
            Variation 1 will be deployed to visitors once you start
          </p>
          <Button type="button" size="sm" disabled>
            Start Now
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Filter className="size-3.5" />
            May 15, 2026 – Aug 14, 2026
          </span>
          <span className="text-border">|</span>
          <span>All Visitors</span>
          <span className="text-border">|</span>
          <span className="text-muted-foreground">–</span>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
              M4 {campaign.primaryMetric}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch id="indepth" />
                <Label htmlFor="indepth" className="text-sm font-medium">
                  In-depth data review
                </Label>
              </div>
              <Button type="button" variant="ghost" size="icon" className="size-8">
                <RefreshCw className="size-3.5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-8">
                <Settings className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="border-b border-border px-4 py-4">
            <p className="mb-2 flex items-center gap-2 text-sm">
              Collecting minimum data for statistical calculations
              <Info className="size-3.5 text-muted-foreground" />
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-1/6 bg-foreground" />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Variations</th>
                <th className="px-4 py-2.5 font-medium">Unique Conversions / Visitors</th>
                <th className="px-4 py-2.5 font-medium">Expected Conversion Rate</th>
                <th className="px-4 py-2.5 font-medium">Expected Improvement</th>
                <th className="px-4 py-2.5 font-medium">
                  Probability to be Better
                </th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.id} className="border-b border-border">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-[11px] font-semibold",
                          v.label === "C"
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground"
                        )}
                      >
                        {v.label}
                      </span>
                      <span>
                        <span className="block font-medium">{v.name}</span>
                        {v.label === "C" && (
                          <span className="text-xs text-muted-foreground">Baseline</span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {Math.round((v.convRate / 100) * 200) || 0} /{" "}
                    {v.label === "C" ? 210 : 200}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{v.convRate.toFixed(2)}%</td>
                  <td className="px-4 py-3 tabular-nums">
                    {v.uplift == null ? "–" : `${v.uplift.toFixed(2)}%`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      Collecting Data
                      <HelpCircle className="size-3.5" />
                    </span>
                  </td>
                  <td className="px-2">
                    <MoreVertical className="size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 pb-4 pt-5">
            <div className="flex gap-6 border-b border-border text-sm">
              <span className="-mb-px border-b-2 border-foreground pb-2 font-medium">
                Date Range Graph
              </span>
              <span className="pb-2 text-muted-foreground">Expected Improvement Graph</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Select defaultValue="cr">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cr">Conversion Rate</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="cum">
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cum">Cumulative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <svg viewBox="0 0 640 220" className="mt-4 h-56 w-full" preserveAspectRatio="none">
              <path
                d={linePath(controlSeries, 640, 200)}
                fill="none"
                stroke="hsl(var(--foreground))"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={linePath(v1Series, 640, 200)}
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                opacity="0.7"
              />
            </svg>
            <div className="mt-2 flex items-center gap-6 text-sm">
              <label className="flex items-center gap-2">
                <Checkbox defaultChecked /> Control
              </label>
              <label className="flex items-center gap-2">
                <Checkbox defaultChecked /> Variation 1
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

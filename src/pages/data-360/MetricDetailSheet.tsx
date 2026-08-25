// Right sheet for a Data360 metric — Definition / Metadata / Campaigns / Funnels.

import { useState } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  EllipsisVertical,
  Settings2,
} from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Data360Metric } from "@/data/data360Metrics";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || "–"}</dd>
    </div>
  );
}

function DefRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1 border-b border-border py-3 last:border-b-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function MetricSheetBody({ metric }: { metric: Data360Metric }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      <SheetHeader className="space-y-1 border-b border-border p-6 text-left">
        <div className="flex items-start justify-between gap-3 pr-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SheetTitle className="text-xl font-semibold">
                {metric.name}
              </SheetTitle>
              <Badge variant="secondary" className="font-medium">
                {metric.kind}
              </Badge>
            </div>
            {metric.description ? (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {metric.description}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <Settings2 className="size-3.5" />
              Tracking settings
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="More actions"
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </div>
        </div>
      </SheetHeader>

      <Tabs
        defaultValue="definition"
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="border-b border-border px-6">
          <TabsList className="h-auto w-full justify-start gap-5 rounded-none bg-transparent p-0">
            <TabsTrigger
              value="definition"
              className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Definition
            </TabsTrigger>
            <TabsTrigger
              value="metadata"
              className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Metadata
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Campaigns
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium tabular-nums text-secondary-foreground">
                {metric.campaigns.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="funnels"
              className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Funnels
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="definition" className="mt-0 space-y-4 p-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Definition</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Description of calculation logic and event the metric is based on.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background px-4">
            <DefRow label="Metric measures">
              {metric.measures}
              {metric.propertyName ? (
                <span className="text-muted-foreground">
                  {" "}
                  ({metric.propertyName})
                </span>
              ) : null}
            </DefRow>
            <DefRow label="For event">{metric.event}</DefRow>
            {metric.where.length > 0 && (
              <DefRow label="Where">
                <ul className="space-y-1">
                  {metric.where.map((w) => (
                    <li key={`${w.subject}-${w.value}`}>
                      {w.subject}{" "}
                      <span className="font-semibold">{w.operator}</span>{" "}
                      <span className="font-mono text-xs">{w.value}</span>
                    </li>
                  ))}
                </ul>
              </DefRow>
            )}
            <DefRow label="Direction of Better">{metric.direction}</DefRow>
            <DefRow label="Conversion Window">{metric.conversionWindow}</DefRow>
          </div>

          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-muted/40"
            >
              <ChevronRight
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  advancedOpen && "rotate-90"
                )}
              />
              Advanced Settings
            </button>
            {advancedOpen && (
              <div className="space-y-5 border-t border-border px-4 py-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Statistical Parameters
                  </h4>
                  <dl className="mt-2">
                    <MetaRow
                      label="Testing Objective"
                      value={metric.advanced.testingObjective}
                    />
                    <MetaRow
                      label="Minimum Detectable Effect (MDE)"
                      value={
                        <span className="tabular-nums">{metric.advanced.mde}</span>
                      }
                    />
                    <MetaRow
                      label="Region of Practical Equivalence (ROPE)"
                      value={
                        <span className="tabular-nums">
                          {metric.advanced.rope}
                        </span>
                      }
                    />
                    <MetaRow
                      label="Statistical Power (1 − β)"
                      value={
                        <span className="tabular-nums">
                          {metric.advanced.statisticalPower}
                        </span>
                      }
                    />
                    <MetaRow
                      label="False Positive Rate (α)"
                      value={
                        <span className="tabular-nums">
                          {metric.advanced.falsePositiveRate}
                        </span>
                      }
                    />
                  </dl>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Guardrail Parameters
                  </h4>
                  <dl className="mt-2">
                    <MetaRow
                      label="Minimum Detectable Reduction"
                      value={
                        <span className="tabular-nums">
                          {metric.advanced.guardrailMdr}
                        </span>
                      }
                    />
                    <MetaRow
                      label="Statistical Power (1 − β)"
                      value={
                        <span className="tabular-nums">
                          {metric.advanced.guardrailPower}
                        </span>
                      }
                    />
                    <MetaRow
                      label="False Positive Rate (α)"
                      value={
                        <span className="tabular-nums">
                          {metric.advanced.guardrailAlpha}
                        </span>
                      }
                    />
                    <MetaRow
                      label="Action Taken On Breach"
                      value={metric.advanced.breachAction}
                    />
                  </dl>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="mt-0 space-y-3 p-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Basic information about the metric
            </p>
          </div>
          <dl>
            <MetaRow label="Name" value={metric.name} />
            <MetaRow label="Description" value={metric.description || "–"} />
            <MetaRow label="Created By" value={metric.createdBy} />
            <MetaRow label="Created On" value={formatDate(metric.createdOn)} />
          </dl>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0 space-y-3 p-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Campaigns</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              View the campaigns that are linked with this metric
            </p>
          </div>
          {metric.campaigns.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No campaign is associated with this metric yet.
            </p>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-listing-header text-left text-xs font-medium text-listing-header-foreground">
                    <th className="px-3 py-2.5">Campaign Name</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Created On</th>
                    <th className="px-3 py-2.5">
                      <span className="sr-only">Action</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {metric.campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="max-w-[200px] truncate px-3 py-2.5 font-medium text-foreground">
                        {c.name}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-foreground">
                        {formatDate(c.createdOn)}
                      </td>
                      <td className="px-3 py-2.5">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="h-auto gap-1 px-0"
                        >
                          Go to campaign
                          <ArrowUpRight className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="funnels" className="mt-0 space-y-3 p-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Funnels</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              View the funnels that are linked with this metric
            </p>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-listing-header text-left text-xs font-medium text-listing-header-foreground">
                  <th className="px-3 py-2.5">Funnel Name</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Created On</th>
                </tr>
              </thead>
              <tbody>
                {metric.funnels.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-3 py-10 text-center text-sm text-muted-foreground"
                    >
                      No funnel is associated with this metric yet.
                    </td>
                  </tr>
                ) : (
                  metric.funnels.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-3 py-2.5 font-medium text-foreground">
                        {f.name}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant="secondary">{f.status}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-foreground">
                        {formatDate(f.createdOn)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default function MetricDetailSheet({
  metric,
  open,
  onOpenChange,
}: {
  metric: Data360Metric | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        {metric && <MetricSheetBody key={metric.id} metric={metric} />}
      </SheetContent>
    </Sheet>
  );
}

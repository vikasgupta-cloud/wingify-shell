// Right sheet for a Data 360 segment — Definition + Metadata tabs.

import { EllipsisVertical } from "lucide-react";
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
import type { DataSegment } from "@/data/segments";

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
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, "0")}, ${d.getUTCFullYear()}`;
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || "–"}</dd>
    </div>
  );
}

export default function SegmentDetailSheet({
  segment,
  open,
  onOpenChange,
}: {
  segment: DataSegment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        {segment && (
          <>
            <SheetHeader className="space-y-1 border-b border-border p-6 text-left">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle className="text-xl font-semibold">
                      {segment.name}
                    </SheetTitle>
                    <Badge variant="secondary" className="font-medium">
                      {segment.kind}
                    </Badge>
                  </div>
                  {segment.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {segment.description}
                    </p>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label="More actions"
                >
                  <EllipsisVertical className="size-4" />
                </Button>
              </div>
            </SheetHeader>

            <Tabs
              key={segment.id}
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
                </TabsList>
              </div>

              <TabsContent value="definition" className="mt-0 space-y-3 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Definition
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Description of conditions for this segment
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background p-4 text-sm text-foreground">
                  <p className="font-medium">All Visitors</p>
                  {segment.condition ? (
                    <>
                      <p className="mt-2 text-muted-foreground">where</p>
                      <p className="mt-2">
                        {segment.condition.subject}{" "}
                        <span className="font-semibold">
                          {segment.condition.operator}
                        </span>{" "}
                        {segment.condition.value}
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-muted-foreground">
                      No additional conditions
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="mt-0 space-y-3 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Metadata
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Basic information about the segment
                  </p>
                </div>
                <dl>
                  <MetaRow label="Name" value={segment.name} />
                  <MetaRow
                    label="Description"
                    value={segment.description || "–"}
                  />
                  <MetaRow label="Created By" value={segment.createdBy} />
                  {segment.kind === "My Segment" && (
                    <MetaRow
                      label="Created On"
                      value={formatDate(segment.createdOn)}
                    />
                  )}
                </dl>
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Right sheet for a Data 360 event — tabs vary by kind (Standard / My Event / Computed).

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  EllipsisVertical,
  Hash,
  RefreshCw,
  Type,
} from "lucide-react";
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
import type { DataEvent, EventDataType } from "@/data/events";
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

function formatDate(iso: string, withTime = false) {
  const d = new Date(iso);
  const base = `${String(d.getUTCDate()).padStart(2, "0")} ${MONTHS[d.getUTCMonth()]}, ${d.getUTCFullYear()}`;
  if (!withTime) return base;
  return `${base}, ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

const API_PLATFORMS = [
  "Web",
  "Node.js/JavaScript",
  "Java",
  "PHP",
  "Python",
  ".NET",
  "Ruby",
  "Go",
  "React.js",
  "Java (Android)",
  "Kotlin (Android)",
  "Swift",
  "React Native",
  "Flutter",
] as const;

type ApiPlatform = (typeof API_PLATFORMS)[number];

function eventApiSnippet(
  apiName: string,
  props: { apiName?: string; name: string }[],
  platform: ApiPlatform
): string {
  const propLines =
    props.length > 0
      ? props
          .map((p) => `    "${p.apiName ?? p.name}": "<text_value>",`)
          .join("\n")
      : `    // add properties here`;

  switch (platform) {
    case "Web":
      return `<script>
  // Do not change anything in the following two lines
  window.VWO = window.VWO || [];
  VWO.event = VWO.event || function () { (VWO.push(["event"].concat([].slice.call(arguments))))};

  // Replace the property values with your actual values
  VWO.event("${apiName}", {
${propLines}
  });
</script>`;
    case "Node.js/JavaScript":
    case "React.js":
      return `// Track the event for a visitor
const properties = {
${propLines}
};

vwoClient.track("${apiName}", properties, userContext);`;
    default:
      return `// Track event "${apiName}" via your ${platform} SDK
const properties = {
${propLines}
};

track("${apiName}", properties, userContext);`;
  }
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value || "–"}</dd>
    </div>
  );
}

function DataTypeCell({ type }: { type: EventDataType }) {
  const Icon = type === "Number" ? Hash : Type;
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground">
      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
      {type}
    </span>
  );
}

function dash(value?: string) {
  return value && value.trim() ? value : "–";
}

export default function EventDetailSheet({
  event,
  open,
  onOpenChange,
}: {
  event: DataEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [platform, setPlatform] = useState<ApiPlatform>("Web");
  const [copied, setCopied] = useState(false);

  const isStandard = event?.kind === "Standard";
  const isComputed = event?.kind === "Computed Event";
  const isMyEvent = event?.kind === "My Event";
  const defaultTab = isComputed ? "definition" : "properties";

  const snippet = useMemo(
    () =>
      event ? eventApiSnippet(event.apiName, event.properties, platform) : "",
    [event, platform]
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        {event && (
          <>
            <SheetHeader className="space-y-1 border-b border-border p-6 text-left">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle className="text-xl font-semibold">
                      {event.name}
                    </SheetTitle>
                    <Badge variant="secondary" className="font-medium">
                      {event.kind}
                    </Badge>
                  </div>
                  {event.description ? (
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      {event.description}
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
              key={event.id}
              defaultValue={defaultTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="border-b border-border px-6">
                <TabsList className="h-auto w-full justify-start gap-5 rounded-none bg-transparent p-0">
                  {isComputed && (
                    <TabsTrigger
                      value="definition"
                      className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Definition
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="properties"
                    className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Properties
                    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-xs font-medium text-secondary-foreground">
                      {event.properties.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Metadata
                  </TabsTrigger>
                  {isMyEvent && (
                    <>
                      <TabsTrigger
                        value="api"
                        className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        API
                      </TabsTrigger>
                      <TabsTrigger
                        value="samples"
                        className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                      >
                        Sample Values
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              </div>

              {isComputed && (
                <TabsContent value="definition" className="mt-0 space-y-3 p-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Definition
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Select the events that will be used to compute this new event.
                    </p>
                  </div>
                  {event.definition && (
                    <div className="rounded-lg border border-border bg-background p-4">
                      <ul className="space-y-2">
                        {event.definition.events.map((name, i) => (
                          <li key={name}>
                            {i > 0 && (
                              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {event.definition!.operator}
                              </div>
                            )}
                            <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium text-foreground">
                              {name}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="properties" className="mt-0 space-y-6 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Properties
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Add properties specific to your event for more context
                  </p>
                </div>

                {event.properties.length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
                    No property added yet. Modify this event to add multiple
                    properties
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground">
                          <th className="px-3 py-2.5">
                            {isComputed ? "Property Name" : "Property"}
                          </th>
                          <th className="px-3 py-2.5">Data Type</th>
                          {isMyEvent && (
                            <th className="px-3 py-2.5">API Name</th>
                          )}
                          {isComputed && (
                            <>
                              <th className="px-3 py-2.5">Source Event</th>
                              <th className="px-3 py-2.5">Source Property</th>
                            </>
                          )}
                          {!isComputed && (
                            <th className="px-3 py-2.5">Description</th>
                          )}
                          {(isStandard || isMyEvent) && (
                            <th className="px-3 py-2.5">Filtering</th>
                          )}
                          {isComputed && (
                            <th className="px-3 py-2.5">Description</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {event.properties.map((prop) => (
                          <tr
                            key={`${prop.name}-${prop.apiName ?? ""}`}
                            className="border-b border-border last:border-b-0"
                          >
                            <td className="px-3 py-2.5 font-medium text-foreground">
                              {prop.name}
                            </td>
                            <td className="px-3 py-2.5">
                              <DataTypeCell type={prop.dataType} />
                            </td>
                            {isMyEvent && (
                              <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                                {prop.apiName ?? prop.name}
                              </td>
                            )}
                            {isComputed && (
                              <>
                                <td className="px-3 py-2.5 text-foreground">
                                  <div className="flex flex-col gap-0.5">
                                    {(prop.sourceEvents ?? []).map((s) => (
                                      <span key={s}>{s}</span>
                                    ))}
                                  </div>
                                </td>
                                <td className="px-3 py-2.5 text-foreground">
                                  <div className="flex flex-col gap-0.5">
                                    {(prop.sourceProperties ?? []).map((s) => (
                                      <span key={s}>{s}</span>
                                    ))}
                                  </div>
                                </td>
                              </>
                            )}
                            {!isComputed && (
                              <td className="px-3 py-2.5 text-muted-foreground">
                                {dash(prop.description)}
                              </td>
                            )}
                            {(isStandard || isMyEvent) && (
                              <td className="px-3 py-2.5 text-muted-foreground">
                                {dash(prop.filtering)}
                              </td>
                            )}
                            {isComputed && (
                              <td className="px-3 py-2.5 text-muted-foreground">
                                {dash(prop.description)}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isMyEvent &&
                  event.unregisteredProperties &&
                  event.unregisteredProperties.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Unregistered Properties
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Additional properties that were received with this
                            event but were not defined in the event definition
                          </p>
                        </div>
                        <Button type="button" size="sm">
                          Save Unregistered Properties
                        </Button>
                      </div>
                      <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted text-left text-xs font-medium text-muted-foreground">
                              <th className="px-3 py-2.5">API Name</th>
                              <th className="px-3 py-2.5">Data Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {event.unregisteredProperties.map((p) => (
                              <tr
                                key={p.apiName}
                                className="border-b border-border last:border-b-0"
                              >
                                <td className="px-3 py-2.5 font-mono text-xs text-foreground">
                                  {p.apiName}
                                </td>
                                <td className="px-3 py-2.5">
                                  <DataTypeCell type={p.dataType} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </TabsContent>

              <TabsContent value="metadata" className="mt-0 space-y-3 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Metadata
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Basic information about the event
                  </p>
                </div>
                <dl>
                  <MetaRow label="Name" value={event.name} />
                  {!isStandard && (
                    <MetaRow label="API Name" value={event.apiName} />
                  )}
                  {event.lastModified && (
                    <MetaRow
                      label="Last Modified"
                      value={formatDate(event.lastModified, true)}
                    />
                  )}
                  <MetaRow label="Description" value={dash(event.description)} />
                  <MetaRow label="Created by" value={event.createdBy} />
                  <MetaRow
                    label="Created on"
                    value={formatDate(event.createdOn)}
                  />
                </dl>
              </TabsContent>

              {isMyEvent && (
                <>
                  <TabsContent value="api" className="mt-0 space-y-4 p-6">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        API Code Snippet
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Use the events API to trigger an event for a visitor.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 border-b border-border pb-2">
                      {API_PLATFORMS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPlatform(p)}
                          className={cn(
                            "rounded-md px-2.5 py-1.5 text-xs transition-colors",
                            platform === p
                              ? "bg-secondary font-medium text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <div className="relative rounded-md border border-border bg-muted/40">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 size-8"
                        onClick={copy}
                        aria-label="Copy snippet"
                      >
                        {copied ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                      <pre className="overflow-x-auto p-4 pr-12 text-xs leading-relaxed text-foreground">
                        <code>{snippet}</code>
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="samples" className="mt-0 space-y-4 p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">
                          Sample Values
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          These are the values captured for this event in last 3
                          days.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                      >
                        <RefreshCw className="size-3.5" aria-hidden />
                        Refresh
                      </Button>
                    </div>
                    {(event.sampleValues ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No sample values captured yet.
                      </p>
                    ) : (
                      <ol className="space-y-3">
                        {(event.sampleValues ?? []).map((sample, i) => {
                          const json = JSON.stringify(sample, null, 2);
                          const lines = json.split("\n");
                          return (
                            <li key={i} className="flex gap-3">
                              <span className="w-5 shrink-0 pt-3 text-xs text-muted-foreground">
                                {i + 1}
                              </span>
                              <div className="min-w-0 flex-1 overflow-hidden rounded-md border border-border bg-muted/30">
                                <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-foreground">
                                  <code>
                                    {lines.map((line, li) => (
                                      <div key={li} className="flex gap-3">
                                        <span className="w-4 shrink-0 select-none text-right text-muted-foreground">
                                          {li + 1}
                                        </span>
                                        <span>{line}</span>
                                      </div>
                                    ))}
                                  </code>
                                </pre>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

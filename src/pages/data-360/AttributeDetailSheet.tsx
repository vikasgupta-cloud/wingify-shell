// Right sheet for an attribute — Metadata / API / Sample Values (+ Store Data Config for custom).

import { useMemo, useState } from "react";
import { Check, Copy, EllipsisVertical, RefreshCw } from "lucide-react";
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
import type { Attribute } from "@/data/attributes";
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
] as const;

type ApiPlatform = (typeof API_PLATFORMS)[number];

function apiSnippet(apiName: string, platform: ApiPlatform): string {
  switch (platform) {
    case "Web":
      return `<script>
  // Do not change anything in the following two lines
  window.VWO = window.VWO || [];
  VWO.visitor = VWO.visitor || function () {VWO.push(["visitor"].concat([].slice.call(arguments)))};

  // Replace "<text_value>" with your actual attribute value
  VWO.visitor({ "${apiName}": "<text_value>" });
</script>`;
    case "Node.js/JavaScript":
    case "React.js":
      return `// Send the attributes to Wingify
// Replace "<text_value>" and userContext with actual values
const attributes = { "${apiName}": "<text_value>" };

vwoClient.setAttribute(attributes, userContext);`;
    case "Java":
      return `// Send the user attributes to Wingify
// Replace "<text_value>" and userContext with actual values
HashMap<String, Object> attributes = new HashMap<>();
attributes.put("${apiName}", "<text_value>");

vwoClient.setAttribute(attributes, userContext);`;
    case "PHP":
      return `<?php
// Send the user attributes to Wingify
// Replace "<text_value>" and $userContext with actual values
$attributes = [
  "${apiName}" => "<text_value>"
];

$vwoClient->setAttribute($attributes, $userContext);`;
    case "Python":
      return `# Send the user attributes to Wingify
# Replace "<text_value>" and user_context with actual values
attributes = { "${apiName}": "<text_value>" }

vwo_client.set_attribute(attributes, user_context)`;
    default:
      return `// Send attribute "${apiName}" via your ${platform} SDK
// Replace <text_value> with the real visitor value
setAttribute({ "${apiName}": "<text_value>" }, userContext);`;
  }
}

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 border-b border-border py-3 last:border-b-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}

export default function AttributeDetailSheet({
  attribute,
  open,
  onOpenChange,
}: {
  attribute: Attribute | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [platform, setPlatform] = useState<ApiPlatform>("Web");
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(
    () => (attribute ? apiSnippet(attribute.apiName, platform) : ""),
    [attribute, platform]
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

  const isCustom = attribute?.kind === "My Attribute";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-y-auto p-0 sm:max-w-2xl"
      >
        {attribute && (
          <>
            <SheetHeader className="space-y-1 border-b border-border p-6 text-left">
              <div className="flex items-start justify-between gap-3 pr-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle className="text-xl font-semibold">
                      {attribute.name}
                    </SheetTitle>
                    <Badge variant="secondary" className="font-medium">
                      {attribute.kind}
                    </Badge>
                  </div>
                  {attribute.displayName && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {attribute.displayName}
                    </p>
                  )}
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

            <Tabs defaultValue="metadata" className="flex min-h-0 flex-1 flex-col">
              <div className="border-b border-border px-6">
                <TabsList className="h-auto w-full justify-start gap-5 rounded-none bg-transparent p-0">
                  {(
                    [
                      "metadata",
                      "api",
                      "samples",
                      ...(isCustom ? (["store"] as const) : []),
                    ] as const
                  ).map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none border-b-2 border-transparent px-0 pb-2.5 pt-3 text-sm capitalize shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      {tab === "samples"
                        ? "Sample Values"
                        : tab === "store"
                          ? "Store Data Config"
                          : tab === "api"
                            ? "API"
                            : "Metadata"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value="metadata" className="mt-0 space-y-4 p-6">
                {attribute.description && (
                  <p className="text-sm text-muted-foreground">
                    {attribute.description}
                  </p>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Basic information about the attribute.
                  </p>
                  <dl className="mt-3">
                    <MetaRow label="Name" value={attribute.name} />
                    <MetaRow label="API Name" value={attribute.apiName} />
                    <MetaRow label="Data Type" value={attribute.dataType} />
                    <MetaRow
                      label="Description"
                      value={attribute.description || "–"}
                    />
                    <MetaRow label="Created by" value={attribute.createdBy} />
                    <MetaRow
                      label="Created on"
                      value={formatDate(attribute.createdOn)}
                    />
                  </dl>
                </div>
              </TabsContent>

              <TabsContent value="api" className="mt-0 space-y-4 p-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    API Code Snippet
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Use the attributes API to update an attribute value for a visitor.
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
                      These are the values captured for this attribute in last 3 days.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="gap-1.5">
                    <RefreshCw className="size-3.5" aria-hidden />
                    Refresh
                  </Button>
                </div>
                <div className="flex min-h-[160px] items-center justify-center rounded-md border border-border bg-background px-4 py-8 text-center">
                  {attribute.sampleValues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No data has been captured in last 3 days.
                    </p>
                  ) : (
                    <ul className="flex w-full flex-wrap gap-2">
                      {attribute.sampleValues.map((v) => (
                        <li
                          key={v}
                          className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground"
                        >
                          {v}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>

              {isCustom && (
                <TabsContent value="store" className="mt-0 space-y-4 p-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Unmasked List
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(attribute.unmaskedList ?? [".*"]).map((pattern) => (
                        <span
                          key={pattern}
                          className="rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-xs text-foreground"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

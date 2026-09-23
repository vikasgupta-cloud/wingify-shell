// @summary Integration detail — Config tab with dummy active connections.
// Opened from Integrations cards. Header CTA (Create connection) lives in DrillInShell.
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  CircleHelp,
  CircleMinus,
  Info,
  Pencil,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  INTEGRATIONS_BASE,
  connectionsForIntegration,
  integrationById,
  monogram,
  type IntegrationConnection,
} from "@/data/integrations";

function MonogramTile({ name, className }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-base font-semibold text-foreground",
        className
      )}
    >
      {monogram(name)}
    </div>
  );
}

function ConnectionCard({
  connection,
  onToggleDefault,
}: {
  connection: IntegrationConnection;
  onToggleDefault: (id: string, next: boolean) => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {connection.title}
          </h3>
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            ↗ {connection.kind}
          </span>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="About this connection type"
                >
                  <CircleHelp className="size-3.5" strokeWidth={1.75} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                Dummy help — connection delivery style.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
            onClick={() => {
              /* dummy */
            }}
          >
            <Pencil className="size-3.5" strokeWidth={1.75} aria-hidden />
            Edit
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-danger-fg transition-colors hover:opacity-80"
            onClick={() => {
              /* dummy */
            }}
          >
            <CircleMinus className="size-3.5" strokeWidth={1.75} aria-hidden />
            Delete
          </button>
        </div>
      </div>

      <div className="m-5 mt-4 rounded-lg bg-muted/60 px-4 py-3">
        <dl className="grid gap-3 sm:grid-cols-[auto_1fr] sm:gap-x-8 sm:gap-y-2.5">
          <dt className="text-sm text-muted-foreground">Connection Name</dt>
          <dd className="text-sm font-medium text-foreground">
            {connection.connectionName}
          </dd>
          <dt className="text-sm text-muted-foreground">Created</dt>
          <dd className="text-sm font-medium text-foreground">
            {connection.created}
          </dd>
          <dt className="text-sm text-muted-foreground">Default</dt>
          <dd className="flex items-center">
            <Switch
              checked={connection.isDefault}
              onCheckedChange={(next) =>
                onToggleDefault(connection.id, next)
              }
              aria-label={`Default connection ${connection.connectionName}`}
            />
          </dd>
        </dl>
      </div>
    </article>
  );
}

export default function IntegrationDetailPage() {
  const { integrationId = "" } = useParams();
  const integration = integrationById(integrationId);

  const seed = useMemo(
    () => (integration ? connectionsForIntegration(integration) : []),
    [integration]
  );
  const [connections, setConnections] = useState(seed);

  useEffect(() => {
    setConnections(seed);
  }, [seed]);

  if (!integration) {
    return <Navigate to={INTEGRATIONS_BASE} replace />;
  }

  const toggleDefault = (id: string, next: boolean) => {
    setConnections((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, isDefault: next }
          : next
            ? { ...c, isDefault: false }
            : c
      )
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-8 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <MonogramTile name={integration.name} className="size-11" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {integration.name}
        </h1>
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {integration.category}
        </span>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="info"
            className="rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Info
          </TabsTrigger>
          <TabsTrigger
            value="help"
            className="rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Help
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="rounded-none border-b-2 border-transparent bg-transparent px-0 pb-2.5 pt-0 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6 focus-visible:outline-none">
          <p className="text-sm text-muted-foreground">
            Placeholder — Info content for {integration.name}.
          </p>
          <Button asChild variant="link" className="mt-2 h-auto px-0">
            <Link to={INTEGRATIONS_BASE}>Back to Integrations</Link>
          </Button>
        </TabsContent>

        <TabsContent value="help" className="mt-6 focus-visible:outline-none">
          <p className="text-sm text-muted-foreground">
            Placeholder — Help content for {integration.name}.
          </p>
        </TabsContent>

        <TabsContent
          value="config"
          className="mt-6 space-y-6 focus-visible:outline-none"
        >
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-foreground">
            <Info
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <p>
              Only admins and owners have access to edit this section. Please
              contact them to get edit access.
            </p>
          </div>

          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">
                Active Connections
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your configured connections. Each connection can handle
                different data flows.
              </p>
            </div>

            <div className="space-y-3">
              {connections.map((connection) => (
                <ConnectionCard
                  key={connection.id}
                  connection={connection}
                  onToggleDefault={toggleDefault}
                />
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { ChevronDown, Plus } from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfigStore } from "../../store/config";
import {
  INTEGRATIONS,
  RECOMMENDED_INTEGRATION_IDS,
  monogram,
  type Integration,
} from "../../data/integrations";
import IntegrationsBrowseSheet from "./IntegrationsBrowseSheet";
import SectionTitle from "./SectionTitle";

function MonogramTile({ name, className }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-border bg-[var(--report-brand-tint)] text-xs font-semibold text-brand-deep",
        className
      )}
    >
      {monogram(name)}
    </div>
  );
}

function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-fg/10 px-2 py-0.5 text-xs font-medium text-success-fg">
      Active
    </span>
  );
}

function ConnectedIntegrationRow({
  integration,
  onManage,
}: {
  integration: Integration;
  onManage: () => void;
}) {
  const disconnect = useConfigStore((s) => s.disconnectIntegration);

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 flex-1 gap-3">
        <MonogramTile name={integration.name} className="h-10 w-10 text-[11px]" />
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-foreground">
              {integration.name}
            </span>
            <ActiveBadge />
          </div>
          <p className="text-xs text-muted-foreground">{integration.category}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {integration.description}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Manage
            <ChevronDown className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onManage}>Open settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect(integration.id)}>
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function StarterIntegrationChip({ integration }: { integration: Integration }) {
  const connect = useConfigStore((s) => s.connectIntegration);

  return (
    <button
      type="button"
      onClick={() => connect(integration.id)}
      aria-label={`Connect ${integration.name}`}
      title={integration.description}
      className="group flex w-full min-w-0 items-center gap-2 rounded-full border border-border bg-background py-1.5 pl-1.5 pr-3 text-left transition-colors hover:border-input hover:bg-muted"
    >
      <MonogramTile
        name={integration.name}
        className="h-6 w-6 shrink-0 rounded-full text-[9px]"
      />
      <span className="min-w-0 truncate text-sm font-medium text-foreground">
        {integration.name}
      </span>
      <span className="hidden min-w-0 truncate text-xs text-muted-foreground sm:inline">
        {integration.category}
      </span>
      <Plus
        className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
    </button>
  );
}

function EmptyIntegrationsPanel() {
  const starters = RECOMMENDED_INTEGRATION_IDS.map((id) =>
    INTEGRATIONS.find((i) => i.id === id)
  ).filter((i): i is Integration => Boolean(i));

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {starters.map((i) => (
        <StarterIntegrationChip key={i.id} integration={i} />
      ))}
    </div>
  );
}

export default function IntegrationsSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const connectedIds = useConfigStore((s) => s.connectedIntegrations);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!config) return null;

  const connected = INTEGRATIONS.filter((i) => connectedIds.includes(i.id));

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <SectionTitle sectionId="integrations" className="text-lg" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="size-3.5" strokeWidth={1.75} />
          Browse integrations
        </Button>
      </div>

      {connected.length === 0 ? (
        <EmptyIntegrationsPanel />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {connected.length}
            </span>{" "}
            connected {connected.length === 1 ? "app" : "apps"}
          </p>

          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
            {connected.map((i) => (
              <ConnectedIntegrationRow
                key={i.id}
                integration={i}
                onManage={() => setSheetOpen(true)}
              />
            ))}
          </div>
        </div>
      )}

      <IntegrationsBrowseSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </section>
  );
}

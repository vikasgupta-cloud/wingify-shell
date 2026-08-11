import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  CircleHelp,
  Link2,
  Plus,
  Search,
  X,
} from "@/components/icons/protoLucide";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  INTEGRATION_CONNECTION_TYPES,
  monogram,
  type Integration,
} from "../../data/integrations";
import { useConfigStore } from "../../store/config";

function MonogramTile({ name, className }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-semibold text-foreground",
        className
      )}
    >
      {monogram(name)}
    </div>
  );
}

function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-2 py-0.5 text-xs font-medium text-success-fg">
      <span className="size-1.5 rounded-full bg-success-fg" aria-hidden />
      Active
    </span>
  );
}

function CategoryChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  );
}

function IntegrationCard({
  integration,
  connected,
}: {
  integration: Integration;
  connected: boolean;
}) {
  const connect = useConfigStore((s) => s.connectIntegration);
  const disconnect = useConfigStore((s) => s.disconnectIntegration);
  const showConnections =
    connected && (integration.connectionCount ?? 0) > 0;

  return (
    <article className="flex flex-col rounded-xl border border-border bg-background">
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <MonogramTile name={integration.name} className="size-10" />
          {connected ? <ActiveBadge /> : null}
        </div>
        <div className="min-w-0 space-y-1.5">
          <h3 className="truncate text-base font-semibold text-foreground">
            {integration.name}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {integration.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
        {showConnections ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="size-3.5 shrink-0" strokeWidth={1.75} />
            <span className="truncate">
              {integration.connectionCount} connections
            </span>
          </span>
        ) : (
          <CategoryChip label={integration.category} />
        )}

        {connected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                Manage
                <ArrowRight className="size-3.5" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => disconnect(integration.id)}>
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={() => connect(integration.id)}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
          >
            Connect
            <ArrowRight className="size-3.5" strokeWidth={1.75} />
          </button>
        )}
      </div>
    </article>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-foreground/25 bg-background px-2.5 py-1 text-xs font-medium text-foreground">
      <span className="truncate">{label}</span>
      <button
        type="button"
        aria-label={`Remove filter ${label}`}
        onClick={onRemove}
        className="rounded-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="size-3.5" strokeWidth={1.75} />
      </button>
    </span>
  );
}

export default function IntegrationsPage() {
  const connectedIds = useConfigStore((s) => s.connectedIntegrations);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [connectionTypes, setConnectionTypes] = useState<string[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestSent, setRequestSent] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of INTEGRATIONS) {
      counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
    }
    return counts;
  }, []);

  const matchesFilters = (i: Integration) => {
    const q = query.trim().toLowerCase();
    if (q && !i.name.toLowerCase().includes(q) && !i.description.toLowerCase().includes(q)) {
      return false;
    }
    if (categories.length > 0 && !categories.includes(i.category)) return false;
    if (connectionTypes.length > 0) {
      const types = i.connectionTypes ?? [];
      if (!connectionTypes.some((t) => types.includes(t))) return false;
    }
    return true;
  };

  const connected = useMemo(
    () =>
      INTEGRATIONS.filter((i) => connectedIds.includes(i.id)).filter(
        matchesFilters
      ),
    [connectedIds, query, categories, connectionTypes]
  );

  const available = useMemo(
    () =>
      INTEGRATIONS.filter((i) => !connectedIds.includes(i.id)).filter(
        matchesFilters
      ),
    [connectedIds, query, categories, connectionTypes]
  );

  const toggleCategory = (category: string) =>
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );

  const toggleConnectionType = (type: string) =>
    setConnectionTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );

  const connectionTypeChipLabel =
    connectionTypes.length === 0
      ? null
      : `Connection type is ${connectionTypes.join(", ")}`;

  const submitRequest = () => {
    setRequestSent(true);
    window.setTimeout(() => {
      setRequestOpen(false);
      setRequestName("");
      setRequestSent(false);
    }, 900);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-8 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-title text-3xl font-semibold tracking-tight text-foreground">
              Integrations
            </h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="rounded-full text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="About integrations"
                  >
                    <CircleHelp className="size-4" strokeWidth={1.75} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Connect analytics, CRM, CDP, and ABM tools to Wingify.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-muted-foreground">
            Wingify integrates with your favorite tools.
          </p>
        </div>
        <Button type="button" onClick={() => setRequestOpen(true)}>
          Request new integration
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Integrations"
            className="bg-background pl-9"
          />
        </div>

        {connectionTypeChipLabel ? (
          <FilterChip
            label={connectionTypeChipLabel}
            onRemove={() => setConnectionTypes([])}
          />
        ) : null}
        {categories.map((category) => (
          <FilterChip
            key={category}
            label={`Category is ${category}`}
            onRemove={() =>
              setCategories((prev) => prev.filter((c) => c !== category))
            }
          />
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              Add filter
              <Plus className="size-3.5" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Connection type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {INTEGRATION_CONNECTION_TYPES.map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={connectionTypes.includes(type)}
                  onCheckedChange={() => toggleConnectionType(type)}
                />
                <span className="text-foreground">{type}</span>
              </label>
            ))}
            {INTEGRATION_CONNECTION_TYPES.length === 0 ? (
              <DropdownMenuItem disabled>No connection types</DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="ml-auto">
              Filter by Category
              {categories.length > 0 ? (
                <span className="text-muted-foreground">
                  ({categories.length})
                </span>
              ) : null}
              <ChevronDown className="size-3.5" strokeWidth={1.75} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {INTEGRATION_CATEGORIES.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Checkbox
                  checked={categories.includes(category)}
                  onCheckedChange={() => toggleCategory(category)}
                />
                <span className="min-w-0 flex-1 truncate text-foreground">
                  {category}
                </span>
                <span className="tabular-nums text-muted-foreground">
                  ({categoryCounts.get(category) ?? 0})
                </span>
              </label>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {connected.length > 0 ? (
        <section className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            Connected Apps
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
              {connected.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {connected.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                connected
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          Available Apps
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {available.length}
          </span>
        </h2>
        {available.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {available.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                connected={false}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background px-6 py-12 text-center text-sm text-muted-foreground">
            No integrations match your filters.
          </div>
        )}
      </section>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request new integration</DialogTitle>
            <DialogDescription>
              Tell us which tool you want connected. We review requests in
              product planning.
            </DialogDescription>
          </DialogHeader>
          {requestSent ? (
            <p className="text-sm text-foreground">Request submitted. Thanks!</p>
          ) : (
            <Input
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              placeholder="Integration name"
              autoFocus
            />
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!requestName.trim() || requestSent}
              onClick={submitRequest}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

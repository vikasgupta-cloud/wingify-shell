import { useMemo, useState } from "react";
import { ChevronDown, Plug, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  INTEGRATIONS,
  INTEGRATION_CATEGORIES,
  monogram,
  type Integration,
} from "../../data/integrations";
import { useConfigStore } from "../../store/config";

// Neutral grayscale monogram tile — deliberately NOT a real brand logo.
function MonogramTile({ name, className }: { name: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-border bg-accent text-xs font-semibold text-muted-foreground",
        className
      )}
    >
      {monogram(name)}
    </div>
  );
}

// The only colored element on the whole surface: the "Active" badge.
function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-fg/10 px-2 py-0.5 text-xs font-medium text-success-fg">
      Active
    </span>
  );
}

function ConnectedCard({ integration }: { integration: Integration }) {
  const disconnect = useConfigStore((s) => s.disconnectIntegration);
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <MonogramTile name={integration.name} className="h-9 w-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">
              {integration.name}
            </div>
            <div className="text-xs text-muted-foreground">{integration.category}</div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ActiveBadge />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Manage
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* TODO: settings panel not yet implemented. */}
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => disconnect(integration.id)}>
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{integration.description}</p>
    </div>
  );
}

function AvailableCard({ integration }: { integration: Integration }) {
  const connect = useConfigStore((s) => s.connectIntegration);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-3">
        <MonogramTile name={integration.name} className="h-9 w-9" />
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            {integration.name}
          </div>
          <div className="text-xs text-muted-foreground">{integration.category}</div>
        </div>
      </div>
      <p className="flex-1 text-sm text-muted-foreground">{integration.description}</p>
      <button
        type="button"
        onClick={() => connect(integration.id)}
        className="self-start text-sm font-medium text-foreground hover:underline"
      >
        Click to connect →
      </button>
    </div>
  );
}

export default function IntegrationsBrowseSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const connectedIds = useConfigStore((s) => s.connectedIntegrations);
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const connected = useMemo(
    () => INTEGRATIONS.filter((i) => connectedIds.includes(i.id)),
    [connectedIds]
  );

  // Counts are derived from the full catalog so they stay stable regardless of
  // search or connection state.
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of INTEGRATIONS) counts.set(i.category, (counts.get(i.category) ?? 0) + 1);
    return counts;
  }, []);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTEGRATIONS.filter((i) => !connectedIds.includes(i.id))
      .filter((i) => (q === "" ? true : i.name.toLowerCase().includes(q)))
      .filter((i) => (categories.length === 0 ? true : categories.includes(i.category)));
  }, [connectedIds, query, categories]);

  const toggleCategory = (category: string) =>
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl"
      >
        {/* Header. */}
        <div className="flex items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <Plug className="h-5 w-5 text-muted-foreground" aria-hidden />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
              <p className="text-sm text-muted-foreground">
                Wingify integrates with your favorite tools
              </p>
            </div>
          </div>
          {/* SheetContent renders the top-right X close automatically. */}
        </div>

        {/* Toolbar. */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-6">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Integrations"
              className="pl-9"
            />
          </div>

          {/* Add filter — non-functional stubs. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {/* TODO: these filter dimensions are not yet wired. */}
              <DropdownMenuItem disabled>Product</DropdownMenuItem>
              <DropdownMenuItem disabled>Connection type</DropdownMenuItem>
              <DropdownMenuItem disabled>Status</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Filter by Category — functional multi-select. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                Filter by Category
                {categories.length > 0 && (
                  <span className="ml-1 text-muted-foreground">({categories.length})</span>
                )}
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
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
                  <span className="flex-1 text-foreground">{category}</span>
                  <span className="text-muted-foreground">
                    ({categoryCounts.get(category) ?? 0})
                  </span>
                </label>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Scrollable body. */}
        <div className="flex-1 overflow-y-auto p-6">
          {connected.length > 0 && (
            <section className="mb-8">
              <h3 className="mb-3 text-sm font-medium text-foreground">
                Connected Apps {connected.length}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {connected.map((i) => (
                  <ConnectedCard key={i.id} integration={i} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h3 className="mb-3 text-sm font-medium text-foreground">
              Available Apps {available.length}
            </h3>
            {available.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {available.map((i) => (
                  <AvailableCard key={i.id} integration={i} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-input p-8 text-center text-sm text-muted-foreground">
                No integrations match your filters.
              </div>
            )}
          </section>
        </div>

        {/* Footer. */}
        <div className="flex justify-end border-t border-border p-6">
          <SheetClose asChild>
            <Button type="button">Done</Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

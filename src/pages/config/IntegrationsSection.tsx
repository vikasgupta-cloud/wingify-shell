import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useConfigStore } from "../../store/config";
import { INTEGRATIONS, monogram } from "../../data/integrations";
import IntegrationsBrowseSheet from "./IntegrationsBrowseSheet";
import SectionTitle from "./SectionTitle";

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

export default function IntegrationsSection({ id }: { id: string }) {
  const config = useConfigStore((s) => s.configs[id]);
  const connectedIds = useConfigStore((s) => s.connectedIntegrations);
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!config) return null;

  const connected = INTEGRATIONS.filter((i) => connectedIds.includes(i.id));

  return (
    <section>
      {/* Heading. */}
      <div className="mb-6">
        <SectionTitle sectionId="integrations" className="text-lg" />
      </div>

      {connected.length === 0 ? (
        <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background p-10 text-center">
          <p className="text-sm font-medium text-foreground">No integrations enabled</p>
          <p className="text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="font-medium text-foreground hover:underline"
            >
              Click here
            </button>{" "}
            to browse integrations
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {connected.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MonogramTile name={i.name} className="h-8 w-8" />
                  <span className="truncate text-sm font-medium text-foreground">
                    {i.name}
                  </span>
                  {/* The only colored element: the Active badge. */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-fg/10 px-2 py-0.5 text-xs font-medium text-success-fg">
                    Active
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSheetOpen(true)}
                >
                  Manage
                </Button>
              </div>
            ))}
          </div>
          <div>
            <Button type="button" variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
              Browse integrations
            </Button>
          </div>
        </div>
      )}

      <IntegrationsBrowseSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </section>
  );
}

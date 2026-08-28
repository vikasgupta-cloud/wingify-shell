/** Get Started — accordion sidebar with nested items (screenshot layout). */

import {
  CheckCircle2,
  ChevronDown,
  LayoutGrid,
  Layers,
  Plug,
  Shield,
  Sparkles,
  WandSparkles,
  Zap,
} from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  GET_STARTED_GROUPS,
  GET_STARTED_TOP_LINKS,
} from "@/data/getStarted";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace";

type GetStartedSidebarProps = {
  activeItemId: string;
  openGroups: Record<string, boolean>;
  onItemSelect: (itemId: string) => void;
  onToggleGroup: (groupId: string) => void;
};

const groupIcon = {
  grid: LayoutGrid,
  layers: Layers,
  shield: Shield,
} as const;

/** Selected row — neutral grey fill on canvas (screenshot, not accent/yellow). */
const navItemActive =
  "bg-secondary font-medium text-secondary-foreground hover:bg-secondary-hover";
const navItemIdle =
  "text-muted-foreground hover:bg-muted/60 hover:text-foreground";

export default function GetStartedSidebar({
  activeItemId,
  openGroups,
  onItemSelect,
  onToggleGroup,
}: GetStartedSidebarProps) {
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);
  const basicSetup = GET_STARTED_TOP_LINKS.find((link) => link.id === "basic-setup");
  const integrations = GET_STARTED_TOP_LINKS.find((link) => link.id === "integrations");

  return (
    <aside className="flex w-[220px] shrink-0 flex-col gap-6">
      <nav className="space-y-1">
        {basicSetup && (
          <button
            key={basicSetup.id}
            type="button"
            onClick={() => onItemSelect(basicSetup.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
              activeItemId === basicSetup.id ? navItemActive : navItemIdle
            )}
          >
            <Zap
              className={cn(
                "size-3.5 shrink-0",
                activeItemId === basicSetup.id
                  ? "text-secondary-foreground"
                  : "text-muted-foreground"
              )}
              aria-hidden
            />
            {basicSetup.label}
          </button>
        )}

        {GET_STARTED_GROUPS.map((group) => {
          const Icon = groupIcon[group.icon];
          const isOpen = openGroups[group.id] ?? false;
          const groupActive = group.items.some((item) => item.id === activeItemId);

          return (
            <div key={group.id} className="space-y-1">
              <button
                type="button"
                onClick={() => onToggleGroup(group.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                  groupActive && !isOpen ? navItemActive : navItemIdle
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "size-3.5 shrink-0",
                      groupActive && !isOpen
                        ? "text-secondary-foreground"
                        : "text-muted-foreground"
                    )}
                    aria-hidden
                  />
                  {group.label}
                </span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 opacity-60 transition-transform",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden
                />
              </button>

              {isOpen && (
                <div className="space-y-0.5 pl-3">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onItemSelect(item.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors",
                        activeItemId === item.id ? navItemActive : navItemIdle
                      )}
                    >
                      <span>{item.label}</span>
                      {item.completed && (
                        <CheckCircle2
                          className="size-3.5 shrink-0 text-success-fg"
                          aria-label="Completed"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {integrations && (
          <button
            type="button"
            onClick={() => onItemSelect(integrations.id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
              activeItemId === integrations.id ? navItemActive : navItemIdle
            )}
          >
            <Plug
              className={cn(
                "size-3.5 shrink-0",
                activeItemId === integrations.id
                  ? "text-secondary-foreground"
                  : "text-muted-foreground"
              )}
              aria-hidden
            />
            {integrations.label}
          </button>
        )}
      </nav>

      <div className="mt-auto rounded-lg border border-border bg-background p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
            <Sparkles className="size-4 text-foreground" aria-hidden />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-semibold text-foreground">
              See Wingify in Action
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Browse prebuilt experiments and sample data to see Wingify in
              action, no setup required.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={() => setWorkspaceId("demo")}
        >
          <WandSparkles aria-hidden />
          Explore Demo Workspace
        </Button>
      </div>
    </aside>
  );
}

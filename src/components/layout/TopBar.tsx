import { ChevronDown, PanelLeft, Plus } from "lucide-react";
import { useUIStore } from "../../store/ui";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import BreadcrumbNav from "./BreadcrumbNav";

export default function TopBar() {
  const toggleDock = useUIStore((s) => s.toggleDock);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Toggle docked navigation panel"
          onClick={toggleDock}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
        <WorkspaceSwitcher />
        <span className="text-sm text-muted-foreground">/</span>
        <BreadcrumbNav />
      </div>

      {/* Actions slot — global for now; swap per-page via an outlet/context later. */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
          Create
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}

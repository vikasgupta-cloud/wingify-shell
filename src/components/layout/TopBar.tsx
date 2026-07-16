import { ChevronDown, PanelLeft, Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUIStore } from "../../store/ui";
import { showsCreate, pageLabel } from "../../lib/nav";
import { getCreateOptions, type CreateOption } from "../../config/createMenu";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import BreadcrumbNav from "./BreadcrumbNav";

function CreateItem({ option }: { option: CreateOption }) {
  const Icon = option.icon;
  // Non-functional stub for now.
  return (
    <DropdownMenu.Item
      onSelect={() => {}}
      className="flex cursor-pointer items-start gap-3 rounded-md px-2.5 py-2.5 outline-none hover:bg-accent focus:bg-accent data-[highlighted]:bg-accent"
    >
      <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{option.label}</span>
        {option.description && (
          <span className="text-[13px] leading-snug text-muted-foreground">
            {option.description}
          </span>
        )}
      </div>
    </DropdownMenu.Item>
  );
}

export default function TopBar() {
  const toggleDock = useUIStore((s) => s.toggleDock);
  const { pathname } = useLocation();
  const createOptions = getCreateOptions(pathname, pageLabel(pathname));
  const aiOptions = createOptions.filter((o) => o.group === "ai");
  const restOptions = createOptions.filter((o) => o.group !== "ai");

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
        <span className="text-sm text-muted-foreground">/</span>
        <WorkspaceSwitcher />
        <span className="text-sm text-muted-foreground">/</span>
        <BreadcrumbNav />
      </div>

      {/* Actions slot — global for now; swap per-page via an outlet/context later. */}
      <div className="flex shrink-0 items-center gap-2">
        {showsCreate(pathname) && (
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                <Plus className="h-4 w-4" />
                Create
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 w-[340px] rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg"
              >
                {/* TODO: wire up Create options — all items are non-functional stubs for now. */}
                {aiOptions.map((option) => (
                  <CreateItem key={option.id} option={option} />
                ))}
                {aiOptions.length > 0 && restOptions.length > 0 && (
                  <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
                )}
                {restOptions.map((option) => (
                  <CreateItem key={option.id} option={option} />
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  );
}

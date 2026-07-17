import { ChevronDown, PanelLeft, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUIStore } from "../../store/ui";
import { useRowsStore } from "../../store/rows";
import { showsCreate, pageLabel } from "../../lib/nav";
import { getCreateOptions, type CreateOption } from "../../config/createMenu";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import BreadcrumbNav from "./BreadcrumbNav";

function CreateItem({ option, onSelect }: { option: CreateOption; onSelect: () => void }) {
  const Icon = option.icon;
  // Options with a campaignType mint a campaign; the rest stay stubs.
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
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
  const navigate = useNavigate();
  const createCampaign = useRowsStore((s) => s.createCampaign);
  const { pathname } = useLocation();
  const createOptions = getCreateOptions(pathname, pageLabel(pathname));
  const aiOptions = createOptions.filter((o) => o.group === "ai");
  const restOptions = createOptions.filter((o) => o.group !== "ai");

  const handleSelect = (option: CreateOption) => {
    if (!option.campaignType) return; // stub
    const id = createCampaign(option.campaignType);
    navigate(`/web-experiment/c/${id}`);
  };

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
              <Button
                type="button"
                className="h-auto gap-1.5 px-3 py-1.5 shadow-none [&>svg:last-child]:size-3.5"
              >
                <Plus className="h-4 w-4" />
                Create
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 w-[340px] rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
              >
                {/* Options with a campaignType mint a campaign; Copilot + generic fallback stay stubs. */}
                {aiOptions.map((option) => (
                  <CreateItem key={option.id} option={option} onSelect={() => handleSelect(option)} />
                ))}
                {aiOptions.length > 0 && restOptions.length > 0 && (
                  <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
                )}
                {restOptions.map((option) => (
                  <CreateItem key={option.id} option={option} onSelect={() => handleSelect(option)} />
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        )}
      </div>
    </header>
  );
}

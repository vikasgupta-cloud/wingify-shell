import { ChevronDown, PanelLeft, Plus } from "@/components/icons/protoLucide";
import { useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUIStore } from "../../store/ui";
import { useRowsStore } from "../../store/rows";
import { showsCreate, pageLabel } from "../../lib/nav";
import {
  CREATE_GROUP_LABELS,
  getCreateOptions,
  type CreateOption,
} from "../../config/createMenu";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import BreadcrumbNav from "./BreadcrumbNav";

function CreateItem({ option, onSelect }: { option: CreateOption; onSelect: () => void }) {
  const Icon = option.icon;
  // Options with a campaignType mint a campaign; the rest stay stubs.
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-start gap-3 rounded-md p-2 outline-none hover:bg-muted focus:bg-muted data-[highlighted]:bg-muted"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
        <Icon className="h-[18px] w-[18px]" size={18} aria-hidden />
      </span>
      <div className="flex flex-col gap-0.5 pt-0.5">
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

function CreateSection({
  heading,
  options,
  onSelect,
}: {
  heading?: string;
  options: CreateOption[];
  onSelect: (option: CreateOption) => void;
}) {
  if (options.length === 0) return null;
  return (
    <DropdownMenu.Group className="p-2">
      {heading && (
        <DropdownMenu.Label className="px-2 pb-1 pt-0.5 text-[13px] font-medium text-muted-foreground">
          {heading}
        </DropdownMenu.Label>
      )}
      {options.map((option) => (
        <CreateItem key={option.id} option={option} onSelect={() => onSelect(option)} />
      ))}
    </DropdownMenu.Group>
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
  // A single ungrouped fallback option reads better without a heading over it.
  const showHeadings = aiOptions.length > 0 && restOptions.length > 0;

  const handleSelect = (option: CreateOption) => {
    // Route-backed options (e.g. Create with Copilot) navigate to their screen.
    if (option.route) {
      navigate(option.route);
      return;
    }
    if (!option.campaignType) return; // stub
    const id = createCampaign(option.campaignType);
    const base = pathname.startsWith("/web-experiment-old")
      ? "/web-experiment-old"
      : "/web-experiment";
    navigate(`${base}/c/${id}`);
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Toggle docked navigation panel"
          onClick={toggleDock}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:outline-none"
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
        {showsCreate(pathname) &&
          (createOptions.length === 1 ? (
            // Single option (e.g. Attributes): Create fires directly — no dropdown.
            <Button
              type="button"
              className="h-auto gap-1.5 px-3 py-1.5 shadow-none"
              onClick={() => handleSelect(createOptions[0])}
            >
              <Plus className="h-4 w-4" />
              Create
            </Button>
          ) : (
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
                  className="z-50 w-[380px] rounded-xl border border-border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                  {/* Options with a campaignType mint a campaign; Copilot + generic fallback stay stubs. */}
                  <CreateSection
                    heading={showHeadings ? CREATE_GROUP_LABELS.ai : undefined}
                    options={aiOptions}
                    onSelect={handleSelect}
                  />
                  {aiOptions.length > 0 && restOptions.length > 0 && (
                    <DropdownMenu.Separator className="h-px bg-border" />
                  )}
                  <CreateSection
                    heading={showHeadings ? CREATE_GROUP_LABELS.default : undefined}
                    options={restOptions}
                    onSelect={handleSelect}
                  />
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ))}
      </div>
    </header>
  );
}

import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "@/components/icons/protoLucide";
import { useLocation, useNavigate } from "react-router-dom";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRowsStore } from "../../store/rows";
import { useRecommendationRowsStore } from "../../store/recommendationRows";
import { showsCreate, pageLabel } from "../../lib/nav";
import {
  CREATE_GROUP_LABELS,
  getCreateOptions,
  type CreateOption,
} from "../../config/createMenu";
import {
  useIsCancellationRevokeWorkspace,
  useIsTrialOverWorkspace,
} from "@/store/workspace";
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

/** First-level TopBar only — trial expired notice + Upgrade CTA (screenshot). */
function TrialOverNotice({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div
      role="status"
      className="flex max-w-full items-center gap-1.5 rounded-md border border-danger-fg/35 bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger-fg"
    >
      <span className="truncate">Your trial is over</span>
      <span className="shrink-0 text-danger-fg/50" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={onUpgrade}
        className="shrink-0 underline underline-offset-2 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-danger-fg/40"
      >
        Upgrade
      </button>
    </div>
  );
}

/** First-level TopBar only — cancellation notice + Revoke CTA (screenshot). */
function CancellationRequestNotice({
  onRevoke,
}: {
  onRevoke: () => void;
}) {
  return (
    <div
      role="status"
      className="flex max-w-full items-center gap-1.5 rounded-md border border-danger-fg/35 bg-danger-bg px-2.5 py-1 text-xs font-medium text-danger-fg"
    >
      <span className="truncate">Cancellation Request Received</span>
      <span className="shrink-0 text-danger-fg/50" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={onRevoke}
        className="shrink-0 underline underline-offset-2 outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-danger-fg/40"
      >
        Revoke
      </button>
    </div>
  );
}

export default function TopBar() {
  const navigate = useNavigate();
  const createCampaign = useRowsStore((s) => s.createCampaign);
  const createRecommendation = useRecommendationRowsStore((s) => s.create);
  const { pathname } = useLocation();
  const createOptions = getCreateOptions(pathname, pageLabel(pathname));
  const aiOptions = createOptions.filter((o) => o.group === "ai");
  const restOptions = createOptions.filter((o) => o.group !== "ai");
  // A single ungrouped fallback option reads better without a heading over it.
  const showHeadings = aiOptions.length > 0 && restOptions.length > 0;
  const isCancellationWorkspace = useIsCancellationRevokeWorkspace();
  const isTrialOverWorkspace = useIsTrialOverWorkspace();
  const [revoked, setRevoked] = useState(false);

  useEffect(() => {
    setRevoked(false);
  }, [isCancellationWorkspace]);

  const handleSelect = (option: CreateOption) => {
    // Route-backed options (e.g. Create with Copilot) navigate to their screen.
    if (option.route) {
      navigate(option.route);
      return;
    }
    if (option.id === "recommendation") {
      const id = createRecommendation();
      navigate(`/commerce/recommendation/c/${id}`);
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
    <header data-slot="top-bar" className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-panel/95 px-4 text-panel-foreground backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2">
        <WorkspaceSwitcher />
        <span className="text-sm text-muted-foreground">/</span>
        <BreadcrumbNav />
      </div>

      {/* Actions slot — first-level TopBar only (not DetailShell / DrillIn). */}
      <div className="flex shrink-0 items-center gap-2">
        {isTrialOverWorkspace && (
          <TrialOverNotice onUpgrade={() => navigate("/upgrade")} />
        )}
        {isCancellationWorkspace && !revoked && (
          <CancellationRequestNotice onRevoke={() => setRevoked(true)} />
        )}
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

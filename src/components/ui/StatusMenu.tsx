import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Clock, Info } from "@/components/icons/protoLucide";
import type { CampaignStatus } from "../../data/campaigns";
import { BLOCKED_NOTICE, STATUS_WORKFLOW } from "../../config/statusWorkflow";
import { useRowsStore } from "../../store/rows";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import StatusBadge from "./StatusBadge";

// Status color applied as a SOLID fill on the trigger — this is the page's
// primary CTA, so it reads as a filled button (status -fg as background, white
// text) rather than an outline.
const STATUS_TRIGGER: Record<CampaignStatus, string> = {
  Draft: "border-transparent bg-status-draft-fg text-white hover:bg-status-draft-fg/90",
  "In QA": "border-transparent bg-status-qa-fg text-white hover:bg-status-qa-fg/90",
  "Ready to launch":
    "border-transparent bg-status-ready-fg text-white hover:bg-status-ready-fg/90",
  Running: "border-transparent bg-status-running-fg text-white hover:bg-status-running-fg/90",
  "In Analysis":
    "border-transparent bg-status-analysis-fg text-white hover:bg-status-analysis-fg/90",
  Paused: "border-transparent bg-status-paused-fg text-white hover:bg-status-paused-fg/90",
  Ended: "border-transparent bg-status-ended-fg text-white hover:bg-status-ended-fg/90",
};

// Standalone: this menu can be reused in the level-2 detail top bar later.
// `triggerVariant` defaults to the colored pill (table rows + Kanban cards);
// the config header opts into the button look via triggerVariant="button".
export default function StatusMenu({
  campaign,
  triggerVariant = "badge",
  onSetStatus,
}: {
  campaign: { id: string; status: CampaignStatus };
  triggerVariant?: "badge" | "button";
  /** Override store write — Personalize listing passes its own rows store. */
  onSetStatus?: (id: string, status: CampaignStatus) => void;
}) {
  const rowsSetStatus = useRowsStore((s) => s.setStatus);
  const setStatus = onSetStatus ?? rowsSetStatus;
  const transitions = STATUS_WORKFLOW[campaign.status];
  const notice = BLOCKED_NOTICE[campaign.status];

  // Ended (no transitions): non-interactive, no chevron, no dropdown.
  if (transitions.length === 0) {
    // Header: a static, disabled filled control (no chevron), solid-tinted
    // with the current status color.
    if (triggerVariant === "button") {
      return (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          aria-label={`Status ${campaign.status}`}
          className={cn("disabled:opacity-100 w-[140px]", STATUS_TRIGGER[campaign.status])}
        >
          {campaign.status}
        </Button>
      );
    }
    // Default (table + Kanban): plain colored pill.
    return <StatusBadge status={campaign.status} />;
  }

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        {triggerVariant === "button" ? (
          // Filled button look (size sm) — solid status color background with
          // white text + chevron; the page's primary CTA.
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={stop}
            aria-label={`Change status from ${campaign.status}`}
            className={cn("group w-[140px] hover:text-white", STATUS_TRIGGER[campaign.status])}
          >
            {campaign.status}
            <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-150 group-data-[state=open]:rotate-180" />
          </Button>
        ) : (
          // Default: the original colored pill used by table rows + Kanban.
          <button
            type="button"
            onClick={stop}
            aria-label={`Change status from ${campaign.status}`}
            className="group inline-flex outline-none"
          >
            <StatusBadge status={campaign.status} className="gap-1">
              <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-150 group-data-[state=open]:rotate-180" />
            </StatusBadge>
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          onClick={stop}
          className="z-50 w-[280px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {notice && (
            <div className="mx-1 mb-1 flex gap-2 rounded-md border border-border bg-muted px-2.5 py-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-[13px] leading-snug text-muted-foreground">
                {notice}
              </span>
            </div>
          )}

          <DropdownMenu.Label className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Next Steps
          </DropdownMenu.Label>

          {transitions.map((t) => (
            <DropdownMenu.Item
              key={t.to}
              onSelect={() => setStatus(campaign.id, t.to)}
              className="flex cursor-pointer flex-col gap-0.5 rounded-md px-2 py-2 outline-none hover:bg-accent data-[highlighted]:bg-accent"
            >
              <StatusBadge status={t.to} className="w-fit self-start" />
              <span className="text-[13px] leading-snug text-muted-foreground">
                {t.description}
              </span>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1.5 h-px bg-border" />

          {/* TODO: wire up Schedule Campaign */}
          <DropdownMenu.Item
            onSelect={(e) => e.preventDefault()}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground outline-none",
              "hover:bg-accent data-[highlighted]:bg-accent"
            )}
          >
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            Schedule Campaign
          </DropdownMenu.Item>
          {/* TODO: wire up See status workflow */}
          <DropdownMenu.Item
            onSelect={(e) => e.preventDefault()}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground outline-none",
              "hover:bg-accent data-[highlighted]:bg-accent"
            )}
          >
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            See status workflow
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

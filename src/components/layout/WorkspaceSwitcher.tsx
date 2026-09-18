/** Workspace switcher — golden crown for main, building for subs, #id badge; selected = neutral-50 (no check). */

import { useState, type MouseEvent } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Check,
  ChevronDown,
  Copy,
  Crown,
} from "@/components/icons/protoLucide";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GET_STARTED_PATH } from "@/lib/getStartedGate";
import {
  WORKSPACES,
  useActiveWorkspace,
  useWorkspaceStore,
  type Workspace,
  type WorkspaceId,
} from "@/store/workspace";
import { cn } from "@/lib/utils";

/** Neutral #id badge with copy — copies the number only (no #). */
function WorkspaceIdBadge({
  accountId,
  className,
}: {
  accountId: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copyId = async (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(accountId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  };

  return (
    <Badge
      tone="neutral"
      fill="light"
      size="sm"
      className={cn("shrink-0 gap-1 font-normal tabular-nums", className)}
    >
      <span>#{accountId}</span>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              role="button"
              tabIndex={0}
              data-copy-id=""
              aria-label={copied ? "Copied" : "Copy workspace number"}
              onClick={copyId}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  void copyId(e as unknown as MouseEvent);
                }
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {copied ? (
                <Check className="size-2.5" strokeWidth={2.25} aria-hidden />
              ) : (
                <Copy className="size-2.5" strokeWidth={1.75} aria-hidden />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {copied ? "Copied" : "Copy number"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </Badge>
  );
}

function WorkspaceKindIcon({
  workspace,
  className,
}: {
  workspace: Workspace;
  className?: string;
}) {
  if (workspace.isMainAccount) {
    return (
      <Crown
        className={cn(
          "h-4 w-4 shrink-0 text-[var(--amber-300)]",
          className
        )}
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  return (
    <Building2
      className={cn("h-4 w-4 shrink-0 text-muted-foreground", className)}
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

export default function WorkspaceSwitcher() {
  const navigate = useNavigate();
  const active = useActiveWorkspace();
  const setWorkspaceId = useWorkspaceStore((s) => s.setWorkspaceId);

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
        >
          <WorkspaceKindIcon workspace={active} />
          <span className="max-w-[12rem] truncate">{active.triggerLabel}</span>
          <WorkspaceIdBadge accountId={active.accountId} />
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[280px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace(s)
          </DropdownMenu.Label>
          {WORKSPACES.map((ws) => (
            <DropdownMenu.Item
              key={ws.id}
              onSelect={(e) => {
                // Don't switch when the user is clicking the copy control.
                const target = e.target as HTMLElement | null;
                if (target?.closest("[data-copy-id]")) {
                  e.preventDefault();
                  return;
                }
                setWorkspaceId(ws.id as WorkspaceId);
                if (ws.getStartedGate) {
                  navigate(GET_STARTED_PATH);
                }
              }}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-[var(--neutral-50)]",
                ws.id === active.id && "bg-[var(--neutral-50)] font-medium"
              )}
            >
              <WorkspaceKindIcon workspace={ws} />
              <span className="min-w-0 flex-1 truncate">{ws.label}</span>
              <WorkspaceIdBadge accountId={ws.accountId} />
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Workspace switcher — selection drives playground banner via workspace store. */

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Building2, Check, ChevronDown } from "@/components/icons/protoLucide";
import { GET_STARTED_PATH } from "@/lib/getStartedGate";
import {
  WORKSPACES,
  useActiveWorkspace,
  useWorkspaceStore,
  type WorkspaceId,
} from "@/store/workspace";
import { cn } from "@/lib/utils";

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
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="max-w-[14rem] truncate">{active.triggerLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[240px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace(s)
          </DropdownMenu.Label>
          {WORKSPACES.map((ws) => (
            <DropdownMenu.Item
              key={ws.id}
              onSelect={() => {
                setWorkspaceId(ws.id as WorkspaceId);
                if (ws.getStartedGate) {
                  navigate(GET_STARTED_PATH);
                }
              }}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent",
                ws.id === active.id && "font-medium"
              )}
            >
              <span>{ws.label}</span>
              {ws.id === active.id && (
                <Check className="size-3.5 shrink-0 text-foreground" aria-hidden />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

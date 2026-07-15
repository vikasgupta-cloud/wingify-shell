import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Building2, ChevronDown, Plus } from "lucide-react";

// Visual only — workspace selection is not wired up.
export default function WorkspaceSwitcher() {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
        >
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span>Wingify Delhi #4532345</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 min-w-[240px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg"
        >
          <DropdownMenu.Label className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Workspace(s)
          </DropdownMenu.Label>
          <DropdownMenu.Item className="cursor-pointer rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent">
            Wingify Delhi
          </DropdownMenu.Item>
          <DropdownMenu.Item className="cursor-pointer rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent">
            VWO Bangalore team
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-border" />
          <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 outline-none data-[highlighted]:bg-accent">
            <Plus className="h-4 w-4" />
            Create workspace
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

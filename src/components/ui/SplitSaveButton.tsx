import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SplitSaveButtonProps = {
  /** Primary label on the left half (e.g. "Save view"). */
  label?: string;
  /** Target name shown in "Save changes to …". */
  existingLabel: string;
  /** Second menu item label. */
  saveAsNewLabel?: string;
  onSaveExisting: () => void;
  onSaveAsNew: () => void;
  size?: "default" | "sm";
  className?: string;
  menuClassName?: string;
  /** Radix: keep focus on an inline rename field after "Save as new". */
  onCloseAutoFocus?: (event: Event) => void;
};

/**
 * Split primary control: left half saves to the current view/filter;
 * right chevron opens Save-to-existing vs Save-as-new.
 */
export default function SplitSaveButton({
  label = "Save view",
  existingLabel,
  saveAsNewLabel = "Save as new view",
  onSaveExisting,
  onSaveAsNew,
  size = "sm",
  className,
  menuClassName,
  onCloseAutoFocus,
}: SplitSaveButtonProps) {
  return (
    <div className={cn("inline-flex items-stretch", className)}>
      <Button
        type="button"
        size={size}
        onClick={onSaveExisting}
        className="rounded-r-none border-r border-primary-foreground/20 shadow-none"
      >
        {label}
      </Button>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            type="button"
            size={size}
            aria-label={`${label} options`}
            className={cn(
              "rounded-l-none px-2 shadow-none",
              size === "sm" && "px-1.5"
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            onCloseAutoFocus={onCloseAutoFocus}
            className={cn(
              "z-50 min-w-[200px] rounded-md border border-border bg-popover p-1.5 text-sm text-popover-foreground shadow-lg",
              menuClassName
            )}
          >
            <DropdownMenu.Item
              onSelect={onSaveExisting}
              className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
            >
              Save changes to “{existingLabel}”
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={onSaveAsNew}
              className="cursor-pointer rounded-sm px-3 py-1.5 outline-none data-[highlighted]:bg-accent"
            >
              {saveAsNewLabel}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}

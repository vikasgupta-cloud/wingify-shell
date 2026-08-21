import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "group peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-[var(--appearance-toggle-off-border,_transparent)] bg-[var(--appearance-toggle-off-background,_var(--input))] text-[var(--appearance-toggle-off-text,_var(--foreground))] shadow-sm transition-colors hover:border-[var(--appearance-toggle-hover-border,_var(--appearance-toggle-off-border,_transparent))] hover:bg-[var(--appearance-toggle-hover-background,_var(--appearance-toggle-off-background,_var(--input)))] hover:text-[var(--appearance-toggle-hover-text,_var(--appearance-toggle-off-text,_var(--foreground)))] focus-visible:outline-none focus-visible:border-[var(--appearance-toggle-focus-border,_var(--appearance-toggle-off-border,_transparent))] focus-visible:bg-[var(--appearance-toggle-focus-background,_var(--appearance-toggle-off-background,_var(--input)))] focus-visible:text-[var(--appearance-toggle-focus-text,_var(--appearance-toggle-off-text,_var(--foreground)))] focus-visible:ring-2 focus-visible:ring-[var(--appearance-toggle-focus-ring,_var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:border-[var(--appearance-toggle-disabled-border,_var(--appearance-toggle-off-border,_transparent))] disabled:bg-[var(--appearance-toggle-disabled-background,_var(--input))] disabled:text-[var(--appearance-toggle-disabled-text,_var(--muted-foreground))] disabled:opacity-50 data-[state=checked]:border-[var(--appearance-toggle-on-border,_var(--control-selected-border,_transparent))] data-[state=checked]:bg-[var(--appearance-toggle-on-background,_var(--control-selected-bg,_var(--primary)))] data-[state=checked]:text-[var(--appearance-toggle-on-text,_var(--control-selected-fg,_var(--primary-foreground)))] data-[state=checked]:hover:border-[var(--appearance-toggle-hover-border,_var(--appearance-toggle-on-border,_var(--control-selected-border,_transparent)))] data-[state=checked]:hover:bg-[var(--appearance-toggle-hover-background,_var(--appearance-toggle-on-background,_var(--control-selected-bg,_var(--primary))))] data-[state=checked]:hover:text-[var(--appearance-toggle-hover-text,_var(--appearance-toggle-on-text,_var(--control-selected-fg,_var(--primary-foreground))))]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-[var(--appearance-toggle-thumb,_var(--background))] shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 group-disabled:bg-[var(--appearance-toggle-disabled-thumb,_var(--appearance-toggle-thumb,_var(--background)))]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }

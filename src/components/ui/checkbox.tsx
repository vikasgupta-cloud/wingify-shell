import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"

/** Stroke tick — weight + round caps match the pack checkbox mark. */
function Tick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3.5 8.2 6.4 11.1 12.5 4.5" />
    </svg>
  )
}

function Dash({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M4 8h8" />
    </svg>
  )
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    data-slot="checkbox"
    className={cn(
      "peer size-4 shrink-0 overflow-hidden rounded-[4px] border-[1px] border-solid border-[var(--appearance-checkbox-default-border,_var(--semantic-border-strong))] bg-[var(--appearance-checkbox-default-background,_var(--background))] text-[var(--appearance-checkbox-default-text,_var(--control-selected-fg,_var(--control-foreground)))] shadow-none transition-colors hover:border-[var(--appearance-checkbox-hover-border,_var(--semantic-border-focus))] hover:bg-[var(--appearance-checkbox-hover-background,_var(--appearance-checkbox-default-background,_var(--background)))] focus-visible:outline-none focus-visible:border-[var(--appearance-checkbox-focus-border,_var(--control-selected-border,_var(--control-border)))] focus-visible:bg-[var(--appearance-checkbox-focus-background,_var(--appearance-checkbox-default-background,_var(--background)))] focus-visible:ring-1 focus-visible:ring-[var(--appearance-checkbox-focus-ring,_var(--ring))] disabled:cursor-not-allowed disabled:border-[var(--appearance-checkbox-disabled-border,_var(--appearance-checkbox-default-border,_var(--semantic-border-strong)))] disabled:bg-[var(--appearance-checkbox-disabled-background,_var(--appearance-checkbox-default-background,_var(--background)))] disabled:opacity-50 data-[state=checked]:border-[var(--appearance-checkbox-selected-border,_var(--control-selected-border,_var(--control-border)))] data-[state=checked]:bg-[var(--appearance-checkbox-selected-background,_var(--control-selected-bg,_var(--control)))] data-[state=checked]:text-[var(--appearance-checkbox-selected-text,_var(--control-selected-fg,_var(--control-foreground)))] data-[state=indeterminate]:border-[var(--appearance-checkbox-selected-border,_var(--control-selected-border,_var(--control-border)))] data-[state=indeterminate]:bg-[var(--appearance-checkbox-selected-background,_var(--control-selected-bg,_var(--control)))] data-[state=indeterminate]:text-[var(--appearance-checkbox-selected-text,_var(--control-selected-fg,_var(--control-foreground)))]",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {props.checked === "indeterminate" ? (
        <Dash className="size-3.5" />
      ) : (
        <Tick className="size-3.5" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

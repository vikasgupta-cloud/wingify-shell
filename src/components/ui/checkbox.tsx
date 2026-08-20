import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "@/components/icons/protoLucide"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-[hsl(var(--appearance-checkbox-default-border,_var(--input)))] bg-[hsl(var(--appearance-checkbox-default-background,_var(--background)))] text-[hsl(var(--appearance-checkbox-default-text,_var(--foreground)))] shadow-none transition-colors hover:border-[hsl(var(--appearance-checkbox-hover-border,_var(--foreground)/0.4))] hover:bg-[hsl(var(--appearance-checkbox-hover-background,_var(--appearance-checkbox-default-background,_var(--background))))] hover:text-[hsl(var(--appearance-checkbox-hover-text,_var(--appearance-checkbox-default-text,_var(--foreground))))] focus-visible:outline-none focus-visible:border-[hsl(var(--appearance-checkbox-focus-border,_var(--appearance-checkbox-default-border,_var(--input))))] focus-visible:bg-[hsl(var(--appearance-checkbox-focus-background,_var(--appearance-checkbox-default-background,_var(--background))))] focus-visible:text-[hsl(var(--appearance-checkbox-focus-text,_var(--appearance-checkbox-default-text,_var(--foreground))))] focus-visible:ring-1 focus-visible:ring-[hsl(var(--appearance-checkbox-focus-ring,_var(--ring)))] disabled:cursor-not-allowed disabled:border-[hsl(var(--appearance-checkbox-disabled-border,_var(--appearance-checkbox-default-border,_var(--input))))] disabled:bg-[hsl(var(--appearance-checkbox-disabled-background,_var(--appearance-checkbox-default-background,_var(--background))))] disabled:text-[hsl(var(--appearance-checkbox-disabled-text,_var(--appearance-checkbox-default-text,_var(--foreground))))] disabled:opacity-50 data-[state=checked]:border-[hsl(var(--appearance-checkbox-selected-border,_var(--control-selected-border,_var(--primary))))] data-[state=checked]:bg-[hsl(var(--appearance-checkbox-selected-background,_var(--control-selected-bg,_var(--primary))))] data-[state=checked]:text-[hsl(var(--appearance-checkbox-selected-text,_var(--control-selected-fg,_var(--primary-foreground))))] data-[state=indeterminate]:border-[hsl(var(--appearance-checkbox-selected-border,_var(--control-selected-border,_var(--primary))))] data-[state=indeterminate]:bg-[hsl(var(--appearance-checkbox-selected-background,_var(--control-selected-bg,_var(--primary))))] data-[state=indeterminate]:text-[hsl(var(--appearance-checkbox-selected-text,_var(--control-selected-fg,_var(--primary-foreground))))]",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {props.checked === "indeterminate" ? (
        <Minus className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-[hsl(var(--appearance-radio-default-border,_var(--input)))] bg-[hsl(var(--appearance-radio-default-background,_var(--background)))] shadow-none transition-colors hover:border-[hsl(var(--appearance-radio-hover-border,_var(--foreground)/0.4))] hover:bg-[hsl(var(--appearance-radio-hover-background,_var(--appearance-radio-default-background,_var(--background))))] focus:outline-none focus-visible:border-[hsl(var(--appearance-radio-focus-border,_var(--appearance-radio-default-border,_var(--input))))] focus-visible:bg-[hsl(var(--appearance-radio-focus-background,_var(--appearance-radio-default-background,_var(--background))))] focus-visible:ring-1 focus-visible:ring-[hsl(var(--appearance-radio-focus-ring,_var(--ring)))] disabled:cursor-not-allowed disabled:border-[hsl(var(--appearance-radio-disabled-border,_var(--appearance-radio-default-border,_var(--input))))] disabled:bg-[hsl(var(--appearance-radio-disabled-background,_var(--appearance-radio-default-background,_var(--background))))] disabled:opacity-50 data-[state=checked]:border-[hsl(var(--appearance-radio-selected-border,_var(--control-selected-border,_var(--primary-border))))] data-[state=checked]:bg-[hsl(var(--appearance-radio-selected-background,_var(--control-selected-bg,_var(--primary))))]",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
        {/* Solid disc — not an icon path, so Active dot always fills (icons are often stroke-only). */}
        <span
          aria-hidden
          className="block h-1.5 w-1.5 rounded-full bg-[hsl(var(--appearance-radio-dot,_var(--appearance-radio-selected-text,_var(--control-selected-fg,_var(--primary-foreground)))))]"
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }

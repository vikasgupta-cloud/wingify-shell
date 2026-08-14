import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

import { cn } from "@/lib/utils"

/** Geometry — not the icon library. Library glyphs overflow this 16px control. */
function CheckGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden>
      <path
        d="M3.5 8.5 6.75 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MinusGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden>
      <path
        d="M3.5 8h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Unchecked reads as a control outline (border-input), not as the accent:
      // a pale accent border is near-invisible on white. The accent lands on
      // the checked fill, where it carries meaning and has contrast behind it.
      "peer flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[3px] border border-input bg-background shadow-none transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-control-border data-[state=checked]:bg-control data-[state=checked]:text-control-foreground data-[state=indeterminate]:border-control-border data-[state=indeterminate]:bg-control data-[state=indeterminate]:text-control-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex size-full items-center justify-center text-current"
    >
      {props.checked === "indeterminate" ? <MinusGlyph /> : <CheckGlyph />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

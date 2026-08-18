import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * CTA hierarchy:
 * 1. primary   (`default`)  — primary fill
 * 2. secondary              — outline on primary border; soft hover fill
 * 3. tertiary               — soft fill (Wingify: feather); outline elsewhere
 * 4. ghost / shadow         — no fill, no border
 * 5. link                   — link-styled button
 * 6. destructive            — danger fill
 * 7. ai                     — AI CTA fill
 *
 * `outline` → tertiary alias (back-compat).
 * `shadow` → ghost alias (product naming).
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:border-transparent disabled:bg-cta-disabled disabled:text-cta-disabled-foreground disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // 1. Primary — filled brand CTA
        default:
          "border border-primary-border bg-primary font-cta text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
        // 2. Secondary — primary-color outline; label follows --cta-secondary-fg
        secondary:
          "border border-primary-border bg-background font-cta text-cta-secondary hover:bg-secondary-hover active:bg-secondary-hover",
        // 3. Tertiary — soft fill (tokenized; Wingify uses feather)
        tertiary:
          "border border-cta-tertiary-border bg-cta-tertiary font-cta text-cta-tertiary-foreground hover:bg-cta-tertiary-hover active:bg-cta-tertiary-hover",
        // Back-compat alias for tertiary
        outline:
          "border border-cta-tertiary-border bg-cta-tertiary font-cta text-cta-tertiary-foreground hover:bg-cta-tertiary-hover active:bg-cta-tertiary-hover",
        // 4. Ghost / shadow — no fill, no border
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        // Product alias for ghost
        shadow:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        // 5. Link — link-colored button; supports leading/trailing icons
        link:
          "h-auto border-transparent bg-transparent px-0 text-link underline-offset-4 hover:bg-transparent hover:text-link-hover hover:underline active:bg-transparent disabled:bg-transparent",
        // 6. Destructive
        destructive:
          "border border-transparent bg-destructive font-cta text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        // 7. AI CTA
        ai:
          "border border-transparent bg-cta-ai font-cta text-cta-ai-foreground hover:bg-cta-ai-hover active:bg-cta-ai-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        class: "h-auto px-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

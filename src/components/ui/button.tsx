import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * CTA hierarchy:
 * 1. default / outline     — surface fill, foreground stroke
 * 2. inverted              — foreground fill
 * 3. secondary             — muted fill
 * 4. tertiary              — tokenized soft fill
 * 5. ghost / shadow        — no fill, no border
 * 6. link                  — --link
 * 7. destructive           — outline; inverted fill; shadow text
 * 8. ai                    — AI CTA fill
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:border-transparent disabled:bg-cta-disabled disabled:text-cta-disabled-foreground disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // 1. Default — surface fill, foreground stroke
        default:
          "border border-foreground bg-background font-cta text-foreground hover:bg-muted active:bg-muted",
        // Default inverted — foreground fill
        inverted:
          "border border-foreground bg-foreground font-cta text-background hover:bg-foreground/90 active:bg-foreground/80",
        // 2. Secondary — muted fill, no stroke
        secondary:
          "border border-transparent bg-secondary font-cta text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover",
        // 3. Tertiary — tokenized soft fill
        tertiary:
          "border border-cta-tertiary-border bg-cta-tertiary font-cta text-cta-tertiary-foreground hover:bg-cta-tertiary-hover active:bg-cta-tertiary-hover",
        // Back-compat: same as default outline
        outline:
          "border border-foreground bg-background font-cta text-foreground hover:bg-muted active:bg-muted",
        // 4. Ghost / shadow — no fill, no border
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        shadow:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        // 5. Link — --link (ocean) CTA
        link:
          "h-auto border-transparent bg-transparent px-0 font-cta text-link underline-offset-4 hover:bg-transparent hover:text-link-hover hover:underline active:bg-transparent disabled:bg-transparent",
        // 6. Destructive — outline / inverted fill / text-only
        destructive:
          "border border-destructive bg-background font-cta text-destructive hover:bg-danger-bg active:bg-danger-bg",
        destructiveInverted:
          "border border-destructive bg-destructive font-cta text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        destructiveShadow:
          "border border-transparent bg-transparent font-cta text-destructive hover:bg-danger-bg active:bg-danger-bg",
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

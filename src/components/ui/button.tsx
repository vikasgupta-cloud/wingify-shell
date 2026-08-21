import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * CTA hierarchy:
 * 1. default (Primary CTA) — semantic action primary fill (Create, Send, Save)
 * 2. outline               — semantic action secondary stroke (secondary CTA)
 * 3. secondary             — muted fill
 * 4. tertiary              — tokenized soft fill
 * 5. ghost / shadow        — no fill, no border
 * 6. link                  — --link
 * 7. destructive           — outline; filled; shadow text
 * 8. ai / aiOutline        — AI CTA fill / AI outline
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:border-transparent disabled:bg-cta-disabled disabled:text-cta-disabled-foreground disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA — semantic/action/primary-*
        default:
          "border border-[var(--semantic-action-primary-bg)] bg-[var(--semantic-action-primary-bg)] font-cta text-[var(--semantic-action-primary-text)] hover:border-[var(--semantic-action-primary-bg-hover)] hover:bg-[var(--semantic-action-primary-bg-hover)] active:border-[var(--semantic-action-primary-bg-active)] active:bg-[var(--semantic-action-primary-bg-active)]",
        // Muted fill
        secondary:
          "border border-transparent bg-secondary font-cta text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover",
        // Soft fill
        tertiary:
          "border border-cta-tertiary-border bg-cta-tertiary font-cta text-cta-tertiary-foreground hover:bg-cta-tertiary-hover active:bg-cta-tertiary-hover",
        // Secondary CTA — semantic/action/secondary-*
        outline:
          "border border-[var(--semantic-action-secondary-border)] bg-background font-cta text-[var(--semantic-action-secondary-text)] hover:bg-muted active:bg-muted",
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        shadow:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        link:
          "h-auto border-transparent bg-transparent px-0 font-cta text-link underline-offset-4 hover:bg-transparent hover:text-link-hover hover:underline active:bg-transparent disabled:bg-transparent",
        destructive:
          "border border-destructive bg-background font-cta text-destructive hover:bg-danger-bg active:bg-danger-bg",
        destructiveInverted:
          "border border-destructive bg-destructive font-cta text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
        destructiveShadow:
          "border border-transparent bg-transparent font-cta text-destructive hover:bg-danger-bg active:bg-danger-bg",
        ai:
          "border border-transparent bg-cta-ai font-cta text-cta-ai-foreground hover:bg-cta-ai-hover active:bg-cta-ai-hover",
        aiOutline:
          "border border-cta-ai bg-background font-cta text-cta-ai hover:bg-highlight-bg hover:text-cta-ai active:bg-highlight-bg",
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

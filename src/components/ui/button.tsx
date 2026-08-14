import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * CTA hierarchy (6):
 * 1. primary   (`default`)  — primary fill
 * 2. secondary              — primary-color outline; feather grey on hover
 * 3. tertiary               — light grey border, dark text
 * 4. ghost                  — no fill, no border
 * 5. link                   — link-styled button (leading/trailing icons OK)
 * 6. destructive            — danger fill
 *
 * `outline` → tertiary alias (back-compat).
 */
const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // 1. Primary — filled brand CTA
        default:
          "border border-primary-border bg-primary font-cta text-primary-foreground hover:bg-primary-hover",
        // 2. Secondary — primary-color outline; feather grey fill on hover
        secondary:
          "border border-primary-border bg-background font-cta text-foreground hover:bg-brand-feather",
        // 3. Tertiary — light grey border, dark grey text
        tertiary:
          "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
        // Back-compat alias for tertiary
        outline:
          "border border-border bg-background text-foreground hover:bg-muted hover:text-foreground",
        // 4. Ghost — no fill, no border
        ghost:
          "border border-transparent bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        // 5. Link — link-colored button; supports leading/trailing icons
        link:
          "h-auto border-transparent bg-transparent px-0 text-link underline-offset-4 hover:bg-transparent hover:text-link-hover hover:underline",
        // 6. Destructive
        destructive:
          "border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

// @summary: Prevent Tailwind from extracting a comment-only example as a utility class (fixes Vite CSS minify failure).
// Reuses existing button variant/token class strings; only the comment example text was changed.
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * CTA appearance classes must be full static strings so Tailwind JIT emits them.
 * If you template-construct arbitrary values, Tailwind may not detect them and
 * borders/fills can silently fall back to defaults.
 * Underscores stand in for spaces inside arbitrary values (Tailwind comma rule).
 */
const CTA_PRIMARY =
  "border border-[hsl(var(--appearance-cta-primary-border,_var(--primary-border)))] bg-[hsl(var(--appearance-cta-primary-background,_var(--primary)))] text-[hsl(var(--appearance-cta-primary-text,_var(--primary-foreground)))] hover:border-[hsl(var(--appearance-cta-primary-hover-border,_var(--appearance-cta-primary-border,_var(--primary-border))))] hover:bg-[hsl(var(--appearance-cta-primary-hover-background,_var(--primary-hover)))] hover:text-[hsl(var(--appearance-cta-primary-hover-text,_var(--appearance-cta-primary-text,_var(--primary-hover-foreground,_var(--primary-foreground)))))] focus-visible:border-[hsl(var(--appearance-cta-primary-focus-border,_var(--appearance-cta-primary-border,_var(--primary-border))))] focus-visible:bg-[hsl(var(--appearance-cta-primary-focus-background,_var(--appearance-cta-primary-background,_var(--primary))))] focus-visible:text-[hsl(var(--appearance-cta-primary-focus-text,_var(--appearance-cta-primary-text,_var(--primary-foreground))))] focus-visible:ring-[hsl(var(--appearance-cta-primary-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-cta-primary-disabled-border,_var(--appearance-cta-primary-border,_var(--primary-border))))] disabled:bg-[hsl(var(--appearance-cta-primary-disabled-background,_var(--appearance-cta-primary-background,_var(--primary))))] disabled:text-[hsl(var(--appearance-cta-primary-disabled-text,_var(--appearance-cta-primary-text,_var(--primary-foreground))))] disabled:opacity-50"

const CTA_SECONDARY =
  "border border-[hsl(var(--appearance-cta-secondary-border,_var(--border)))] bg-[hsl(var(--appearance-cta-secondary-background,_var(--secondary)))] text-[hsl(var(--appearance-cta-secondary-text,_var(--secondary-foreground)))] hover:border-[hsl(var(--appearance-cta-secondary-hover-border,_var(--appearance-cta-secondary-border,_var(--border))))] hover:bg-[hsl(var(--appearance-cta-secondary-hover-background,_var(--secondary-hover)))] hover:text-[hsl(var(--appearance-cta-secondary-hover-text,_var(--appearance-cta-secondary-text,_var(--secondary-foreground))))] focus-visible:border-[hsl(var(--appearance-cta-secondary-focus-border,_var(--appearance-cta-secondary-border,_var(--border))))] focus-visible:bg-[hsl(var(--appearance-cta-secondary-focus-background,_var(--appearance-cta-secondary-background,_var(--secondary))))] focus-visible:text-[hsl(var(--appearance-cta-secondary-focus-text,_var(--appearance-cta-secondary-text,_var(--secondary-foreground))))] focus-visible:ring-[hsl(var(--appearance-cta-secondary-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-cta-secondary-disabled-border,_var(--appearance-cta-secondary-border,_var(--border))))] disabled:bg-[hsl(var(--appearance-cta-secondary-disabled-background,_var(--appearance-cta-secondary-background,_var(--secondary))))] disabled:text-[hsl(var(--appearance-cta-secondary-disabled-text,_var(--appearance-cta-secondary-text,_var(--secondary-foreground))))] disabled:opacity-50"

const CTA_TERTIARY =
  "border border-[hsl(var(--appearance-cta-tertiary-border,_var(--border)))] bg-[hsl(var(--appearance-cta-tertiary-background,_var(--background)))] text-[hsl(var(--appearance-cta-tertiary-text,_var(--foreground)))] hover:border-[hsl(var(--appearance-cta-tertiary-hover-border,_var(--appearance-cta-tertiary-border,_var(--border))))] hover:bg-[hsl(var(--appearance-cta-tertiary-hover-background,_var(--muted)))] hover:text-[hsl(var(--appearance-cta-tertiary-hover-text,_var(--appearance-cta-tertiary-text,_var(--foreground))))] focus-visible:border-[hsl(var(--appearance-cta-tertiary-focus-border,_var(--appearance-cta-tertiary-border,_var(--border))))] focus-visible:bg-[hsl(var(--appearance-cta-tertiary-focus-background,_var(--appearance-cta-tertiary-background,_var(--background))))] focus-visible:text-[hsl(var(--appearance-cta-tertiary-focus-text,_var(--appearance-cta-tertiary-text,_var(--foreground))))] focus-visible:ring-[hsl(var(--appearance-cta-tertiary-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-cta-tertiary-disabled-border,_var(--appearance-cta-tertiary-border,_var(--border))))] disabled:bg-[hsl(var(--appearance-cta-tertiary-disabled-background,_var(--appearance-cta-tertiary-background,_var(--background))))] disabled:text-[hsl(var(--appearance-cta-tertiary-disabled-text,_var(--appearance-cta-tertiary-text,_var(--foreground))))] disabled:opacity-50"

/** Ghost defaults to no chrome; Appearance border/fill/text apply when set. */
const CTA_GHOST =
  "border border-[hsl(var(--appearance-cta-ghost-border,_var(--transparent)))] bg-[hsl(var(--appearance-cta-ghost-background,_var(--transparent)))] text-[hsl(var(--appearance-cta-ghost-text,_var(--foreground)))] hover:border-[hsl(var(--appearance-cta-ghost-hover-border,_var(--appearance-cta-ghost-border,_var(--transparent))))] hover:bg-[hsl(var(--appearance-cta-ghost-hover-background,_var(--muted)))] hover:text-[hsl(var(--appearance-cta-ghost-hover-text,_var(--appearance-cta-ghost-text,_var(--foreground))))] focus-visible:border-[hsl(var(--appearance-cta-ghost-focus-border,_var(--appearance-cta-ghost-border,_var(--transparent))))] focus-visible:bg-[hsl(var(--appearance-cta-ghost-focus-background,_var(--appearance-cta-ghost-background,_var(--transparent))))] focus-visible:text-[hsl(var(--appearance-cta-ghost-focus-text,_var(--appearance-cta-ghost-text,_var(--foreground))))] focus-visible:ring-[hsl(var(--appearance-cta-ghost-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-cta-ghost-disabled-border,_var(--appearance-cta-ghost-border,_var(--transparent))))] disabled:bg-[hsl(var(--appearance-cta-ghost-disabled-background,_var(--appearance-cta-ghost-background,_var(--transparent))))] disabled:text-[hsl(var(--appearance-cta-ghost-disabled-text,_var(--appearance-cta-ghost-text,_var(--foreground))))] disabled:opacity-50"

/** Link defaults to text-only (underline on hover); Appearance can add border/fill. */
const CTA_LINK =
  "border border-[hsl(var(--appearance-cta-link-border,_var(--transparent)))] bg-[hsl(var(--appearance-cta-link-background,_var(--transparent)))] text-[hsl(var(--appearance-cta-link-text,_var(--link)))] hover:border-[hsl(var(--appearance-cta-link-hover-border,_var(--appearance-cta-link-border,_var(--transparent))))] hover:bg-[hsl(var(--appearance-cta-link-hover-background,_var(--transparent)))] hover:text-[hsl(var(--appearance-cta-link-hover-text,_var(--appearance-cta-link-text,_var(--link))))] focus-visible:border-[hsl(var(--appearance-cta-link-focus-border,_var(--appearance-cta-link-border,_var(--transparent))))] focus-visible:bg-[hsl(var(--appearance-cta-link-focus-background,_var(--appearance-cta-link-background,_var(--transparent))))] focus-visible:text-[hsl(var(--appearance-cta-link-focus-text,_var(--appearance-cta-link-text,_var(--link))))] focus-visible:ring-[hsl(var(--appearance-cta-link-focus-ring,_var(--ring)))] disabled:border-[hsl(var(--appearance-cta-link-disabled-border,_var(--appearance-cta-link-border,_var(--transparent))))] disabled:bg-[hsl(var(--appearance-cta-link-disabled-background,_var(--appearance-cta-link-background,_var(--transparent))))] disabled:text-[hsl(var(--appearance-cta-link-disabled-text,_var(--appearance-cta-link-text,_var(--link))))] disabled:opacity-50"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "font-cta shadow-[0_1px_2px_hsl(var(--brand-midnight)/0.06)] " +
          CTA_PRIMARY,
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 focus-visible:ring-ring disabled:opacity-50",
        outline: "shadow-sm " + CTA_TERTIARY,
        secondary: "shadow-sm " + CTA_SECONDARY,
        ghost: CTA_GHOST,
        link: "underline-offset-4 hover:underline " + CTA_LINK,
        tertiary: "shadow-sm " + CTA_TERTIARY,
        ai: "font-cta shadow-[0_1px_2px_hsl(var(--brand-midnight)/0.06)] " + CTA_PRIMARY,
        shadow: "shadow-sm " + CTA_SECONDARY,
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
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

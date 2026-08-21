import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-[var(--appearance-inputs-border,_var(--input))] bg-[var(--appearance-inputs-background,_var(--background))] px-3 py-2 text-sm text-[var(--appearance-inputs-text,_var(--foreground))] shadow-sm placeholder:text-muted-foreground hover:border-[var(--appearance-inputs-hover-border,_var(--appearance-inputs-border,_var(--input)))] hover:bg-[var(--appearance-inputs-hover-background,_var(--appearance-inputs-background,_var(--background)))] hover:text-[var(--appearance-inputs-hover-text,_var(--appearance-inputs-text,_var(--foreground)))] focus-visible:outline-none focus-visible:border-[var(--appearance-inputs-focus-border,_var(--appearance-inputs-border,_var(--input)))] focus-visible:bg-[var(--appearance-inputs-focus-background,_var(--appearance-inputs-background,_var(--background)))] focus-visible:text-[var(--appearance-inputs-focus-text,_var(--appearance-inputs-text,_var(--foreground)))] focus-visible:ring-1 focus-visible:ring-[var(--appearance-inputs-focus-ring,_var(--appearance-inputs-focus-border,_var(--ring)))] disabled:cursor-not-allowed disabled:border-[var(--appearance-inputs-disabled-border,_var(--appearance-inputs-border,_var(--input)))] disabled:bg-[var(--appearance-inputs-disabled-background,_var(--appearance-inputs-background,_var(--background)))] disabled:text-[var(--appearance-inputs-disabled-text,_var(--appearance-inputs-text,_var(--foreground)))] disabled:opacity-50 read-only:border-[var(--appearance-inputs-read-only-border,_var(--appearance-inputs-border,_var(--input)))] read-only:bg-[var(--appearance-inputs-read-only-background,_var(--muted))] read-only:text-[var(--appearance-inputs-read-only-text,_var(--appearance-inputs-text,_var(--foreground)))]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }

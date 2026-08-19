import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

/** "pill" = filled active chip; "underline" = text tabs with an active bottom line. */
export type TabsVariant = "pill" | "underline"

const TabsVariantContext = React.createContext<TabsVariant>("pill")

const listVariants: Record<TabsVariant, string> = {
  pill: "inline-flex h-9 items-center justify-center rounded-lg border border-[hsl(var(--appearance-tabs-list-border,_transparent))] bg-[hsl(var(--appearance-tabs-list-background,_var(--muted)))] p-1 text-[hsl(var(--appearance-tabs-list-text,_var(--appearance-tabs-inactive-text,_var(--muted-foreground))))]",
  underline:
    "inline-flex h-auto items-center justify-start gap-6 rounded-none border-b border-[hsl(var(--appearance-tabs-list-border,_var(--border)))] bg-[hsl(var(--appearance-tabs-list-background,_transparent))] p-0 text-[hsl(var(--appearance-tabs-list-text,_var(--appearance-tabs-inactive-text,_var(--muted-foreground))))]",
}

const triggerBase =
  "inline-flex cursor-pointer items-center justify-center whitespace-nowrap text-sm font-medium text-[hsl(var(--appearance-tabs-inactive-text,_var(--muted-foreground)))] ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--appearance-tabs-focus-ring,_var(--ring)))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:text-[hsl(var(--appearance-tabs-disabled-text,_var(--appearance-tabs-inactive-text,_var(--muted-foreground))))] disabled:opacity-50"

const triggerVariants: Record<TabsVariant, string> = {
  pill: "rounded-md border border-transparent px-3 py-1 hover:border-[hsl(var(--appearance-tabs-hover-border,_transparent))] hover:bg-[hsl(var(--appearance-tabs-hover-background,_transparent))] hover:text-[hsl(var(--appearance-tabs-hover-text,_var(--appearance-tabs-inactive-text,_var(--muted-foreground))))] focus-visible:border-[hsl(var(--appearance-tabs-focus-border,_transparent))] focus-visible:bg-[hsl(var(--appearance-tabs-focus-background,_transparent))] focus-visible:text-[hsl(var(--appearance-tabs-focus-text,_var(--appearance-tabs-inactive-text,_var(--muted-foreground))))] disabled:border-[hsl(var(--appearance-tabs-disabled-border,_transparent))] disabled:bg-[hsl(var(--appearance-tabs-disabled-background,_transparent))] data-[state=active]:border-[hsl(var(--appearance-tabs-active-border,_transparent))] data-[state=active]:bg-[hsl(var(--appearance-tabs-active-background,_var(--background)))] data-[state=active]:text-[hsl(var(--appearance-tabs-active-text,_var(--foreground)))] data-[state=active]:shadow data-[state=active]:hover:bg-[hsl(var(--appearance-tabs-active-background,_var(--background)))] data-[state=active]:hover:text-[hsl(var(--appearance-tabs-active-text,_var(--foreground)))]",
  // -mb-px lets the active line sit on top of the list's bottom border.
  underline:
    "-mb-px rounded-none border-0 border-b-2 border-transparent bg-transparent px-0.5 pb-2.5 pt-2 shadow-none hover:border-[hsl(var(--appearance-tabs-hover-border,_transparent))] hover:bg-[hsl(var(--appearance-tabs-hover-background,_transparent))] hover:text-[hsl(var(--appearance-tabs-hover-text,_var(--foreground)))] focus-visible:text-[hsl(var(--appearance-tabs-focus-text,_var(--appearance-tabs-inactive-text,_var(--muted-foreground))))] data-[state=active]:border-[hsl(var(--appearance-tabs-active-border,_var(--appearance-tabs-active-text,_var(--foreground))))] data-[state=active]:bg-[hsl(var(--appearance-tabs-active-background,_transparent))] data-[state=active]:text-[hsl(var(--appearance-tabs-active-text,_var(--foreground)))] data-[state=active]:shadow-none",
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: TabsVariant
  }
>(({ className, variant = "pill", ...props }, ref) => (
  <TabsVariantContext.Provider value={variant}>
    <TabsPrimitive.List
      ref={ref}
      className={cn(listVariants[variant], className)}
      {...props}
    />
  </TabsVariantContext.Provider>
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant
  }
>(({ className, variant, ...props }, ref) => {
  const inherited = React.useContext(TabsVariantContext)
  const resolved = variant ?? inherited
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(triggerBase, triggerVariants[resolved], className)}
      {...props}
    />
  )
})
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

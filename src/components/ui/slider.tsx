import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      data-slot="slider-track"
      className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-[hsl(var(--appearance-sliders-track,_var(--muted)))]"
    >
      <SliderPrimitive.Range
        data-slot="slider-range"
        className="absolute h-full bg-[hsl(var(--appearance-sliders-value,_var(--foreground)))]"
      />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      className="block h-4 w-4 rounded-full border border-[hsl(var(--appearance-sliders-thumb-border,_var(--foreground)))] bg-[hsl(var(--appearance-sliders-thumb,_var(--background)))] text-[hsl(var(--appearance-sliders-hover-text,_var(--foreground)))] shadow-none transition-colors hover:border-[hsl(var(--appearance-sliders-hover-thumb-border,_var(--appearance-sliders-hover-border,_var(--foreground))))] hover:bg-[hsl(var(--appearance-sliders-hover-background,_var(--appearance-sliders-thumb,_var(--background))))] focus-visible:outline-none focus-visible:border-[hsl(var(--appearance-sliders-focus-border,_var(--appearance-sliders-thumb-border,_var(--foreground))))] focus-visible:bg-[hsl(var(--appearance-sliders-focus-background,_var(--appearance-sliders-thumb,_var(--background))))] focus-visible:text-[hsl(var(--appearance-sliders-focus-text,_var(--foreground)))] focus-visible:ring-1 focus-visible:ring-[hsl(var(--appearance-sliders-focus-ring,_var(--ring)))] disabled:pointer-events-none disabled:border-[hsl(var(--appearance-sliders-disabled-border,_var(--appearance-sliders-thumb-border,_var(--foreground))))] disabled:bg-[hsl(var(--appearance-sliders-disabled-thumb,_var(--appearance-sliders-disabled-background,_var(--appearance-sliders-thumb,_var(--background)))))] disabled:text-[hsl(var(--appearance-sliders-disabled-text,_var(--muted-foreground)))] disabled:opacity-50"
    />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }

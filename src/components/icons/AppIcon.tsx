import { HelpCircle } from "lucide-react";
import type { AppIconName } from "@/config/iconNames";
import { cn } from "@/lib/utils";
import { useIconRegistry } from "./IconLibraryProvider";

export type AppIconProps = {
  name: AppIconName;
  size?: number | string;
  className?: string;
  /** Ignored when a library style variant controls weight (Lucide / Tabler stroke). */
  strokeWidth?: number;
  color?: string;
} & React.SVGAttributes<SVGElement>;

/** Renders the active icon-library mapping for a Lucide-compatible icon name. */
export default function AppIcon({
  name,
  size,
  className,
  strokeWidth: _strokeWidth,
  ...props
}: AppIconProps) {
  const { registry, ready } = useIconRegistry();
  const Icon = registry[name];

  if (Icon) {
    // Style weight/variant comes from the registry wrapper — do not let
    // call-site strokeWidth={1.75} override Thin / Bold / Duotone picks.
    return (
      <Icon
        {...props}
        size={size}
        className={cn("shrink-0", className)}
      />
    );
  }

  if (!ready) {
    // Keep layout and colour while the active pack loads — never render blank.
    return (
      <HelpCircle
        {...props}
        size={size}
        className={cn("shrink-0", className)}
        strokeWidth={1.75}
      />
    );
  }

  return (
    <HelpCircle
      {...props}
      size={size}
      className={cn("shrink-0", className)}
      strokeWidth={1.75}
    />
  );
}

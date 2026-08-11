import { HelpCircle } from "lucide-react";
import type { AppIconName } from "@/config/iconNames";
import { cn } from "@/lib/utils";
import { useIconRegistry } from "./IconLibraryProvider";

export type AppIconProps = {
  name: AppIconName;
  size?: number | string;
  className?: string;
  strokeWidth?: number;
  color?: string;
} & React.SVGAttributes<SVGElement>;

/** Renders the active icon-library mapping for a Lucide-compatible icon name. */
export default function AppIcon({
  name,
  size,
  className,
  strokeWidth = 1.75,
  ...props
}: AppIconProps) {
  const { registry, ready, libraryId } = useIconRegistry();
  const Icon = registry[name];

  if (Icon) {
    return (
      <Icon
        {...props}
        {...(libraryId === "lucide" ? { strokeWidth } : {})}
        size={size}
        className={cn("shrink-0", className)}
      />
    );
  }

  if (!ready) {
    return (
      <span
        aria-hidden
        className={cn("inline-block shrink-0", className)}
        style={{
          width: typeof size === "number" ? size : 16,
          height: typeof size === "number" ? size : 16,
        }}
      />
    );
  }

  return (
    <HelpCircle
      {...props}
      size={size}
      className={cn("shrink-0 opacity-40", className)}
      strokeWidth={strokeWidth}
    />
  );
}
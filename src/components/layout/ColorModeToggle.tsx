import { Monitor, Moon, Sun, SwatchBook } from "@/components/icons/protoLucide";
import type { ColorModePreference } from "../../config/themes";
import { useThemeStore } from "../../store/theme";
import { cn } from "../../lib/utils";

const OPTIONS: {
  value: ColorModePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Light / dark / system mode control for the profile menu.
 * Button-color accents live in the design floating CTA, not here.
 */
export default function ColorModeToggle({
  className,
}: {
  className?: string;
}) {
  const colorModePreference = useThemeStore((s) => s.colorModePreference);
  const setColorMode = useThemeStore((s) => s.setColorMode);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5",
        className
      )}
    >
      <SwatchBook
        className="h-4 w-4 shrink-0 text-muted-foreground"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="text-sm text-foreground">Theme</span>
      <div
        role="group"
        aria-label="Light, dark, or system"
        className="ml-auto inline-flex rounded-md border border-border bg-background p-0.5"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={colorModePreference === value}
            aria-label={label}
            title={label}
            onClick={() => setColorMode(value)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded transition-colors",
              colorModePreference === value
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </div>
  );
}

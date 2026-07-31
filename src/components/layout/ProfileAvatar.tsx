import { cn } from "@/lib/utils";

type ProfileAvatarSize = "sm" | "md" | "lg";

const SIZE: Record<ProfileAvatarSize, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-9 w-9 text-xs",
};

/**
 * Current-user mark: soft neutral wash, hairline ring, and weighty initials.
 * Pass `onDark` when it sits inside the collapsed active pill.
 */
export default function ProfileAvatar({
  initials,
  size = "md",
  onDark = false,
  className,
}: {
  initials: string;
  size?: ProfileAvatarSize;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase tracking-[0.06em]",
        SIZE[size],
        onDark
          ? "bg-background text-foreground ring-1 ring-inset ring-border"
          : [
              "bg-[linear-gradient(180deg,hsl(var(--muted))_0%,hsl(var(--surface))_100%)]",
              "text-foreground",
              "ring-1 ring-inset ring-border",
              "shadow-[inset_0_1px_0_hsl(var(--background)/0.85),0_1px_2px_hsl(var(--foreground)/0.06)]",
            ],
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

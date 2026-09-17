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
 * Pass `showUnreadDot` for the green unread-notifications indicator.
 */
export default function ProfileAvatar({
  initials,
  size = "md",
  onDark = false,
  showUnreadDot = false,
  className,
}: {
  initials: string;
  size?: ProfileAvatarSize;
  onDark?: boolean;
  showUnreadDot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.06em]",
          SIZE[size],
          onDark
            ? "bg-background text-foreground ring-1 ring-inset ring-border"
            : [
                "bg-muted",
                "text-foreground",
                "ring-1 ring-inset ring-border",
                "shadow-[inset_0_1px_0_rgb(from var(--background) r g b / 0.85),0_1px_2px_rgb(from var(--foreground) r g b / 0.06)]",
              ]
        )}
        aria-hidden
      >
        {initials}
      </span>
      {showUnreadDot ? (
        <span
          className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[var(--status-running-fg)] ring-2 ring-panel"
          aria-hidden
        />
      ) : null}
    </span>
  );
}

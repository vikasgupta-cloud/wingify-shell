import { cn } from "@/lib/utils";

type ProfileAvatarSize = "sm" | "md" | "lg";

const SIZE: Record<ProfileAvatarSize, string> = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-9 w-9 text-xs",
};

/**
 * Current-user mark. Dark fill + light initials so it reads on the white rail;
 * pass `onDark` when it sits inside the collapsed active pill.
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
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase tracking-[0.04em]",
        SIZE[size],
        onDark
          ? "bg-background text-foreground ring-1 ring-inset ring-border"
          : "bg-foreground text-background shadow-[0_1px_2px_hsl(var(--foreground)/0.12)]",
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}

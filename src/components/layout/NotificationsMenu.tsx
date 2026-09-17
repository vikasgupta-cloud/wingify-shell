/** JD profile header → Notifications popover (right of menu; dummy rows). */
import { useState } from "react";
import { Bell } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useHasUnreadNotifications,
  useNotificationsStore,
} from "@/store/notifications";
import { useProfileSubmenuStore } from "@/store/profileSubmenu";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const items = useNotificationsStore((s) => s.items);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const hasUnread = useHasUnreadNotifications();
  const openSubmenu = useProfileSubmenuStore((s) => s.open);
  const closeSubmenu = useProfileSubmenuStore((s) => s.close);

  return (
    <Popover
      modal={false}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) openSubmenu();
        else closeSubmenu();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          aria-expanded={open}
          className="relative size-8 shrink-0 text-muted-foreground"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Bell className="size-4" strokeWidth={1.75} aria-hidden />
          {hasUnread ? (
            <span
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--status-running-fg)] ring-2 ring-popover"
              aria-hidden
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        collisionPadding={16}
        data-profile-submenu=""
        className="z-[60] flex w-80 flex-col gap-0 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // Keep open when interacting with the profile flyout chrome.
          const target = e.target as Element | null;
          if (target?.closest('[data-nav-item="/profile"]')) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Mark all as read
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex min-h-[10rem] items-center justify-center px-4 py-8">
            <p className="text-sm text-muted-foreground">
              Nothing new to see here yet
            </p>
          </div>
        ) : (
          <ul className="max-h-72 overflow-y-auto py-1" role="list">
            {items.map((item) => (
              <li key={item.id}>
                <div
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/60",
                    item.unread && "bg-muted/40"
                  )}
                >
                  <span className="mt-1.5 flex w-2 shrink-0 justify-center">
                    {item.unread ? (
                      <span
                        className="size-1.5 rounded-full bg-[var(--status-running-fg)]"
                        aria-label="Unread"
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.timeLabel}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

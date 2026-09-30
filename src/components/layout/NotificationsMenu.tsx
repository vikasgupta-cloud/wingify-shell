/** JD profile header → Notifications popover (right of menu; dummy rows).
 * Unread rows can be marked read one at a time; the bell shows the unread count.
 * Reuses the notifications store and shadcn Popover/Button. */
import { useState } from "react";
import { Bell } from "@/components/icons/protoLucide";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNotificationsStore } from "@/store/notifications";
import { useProfileSubmenuStore } from "@/store/profileSubmenu";

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const unreadCount = items.filter((item) => item.unread).length;
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
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
          aria-expanded={open}
          className="relative size-8 shrink-0 text-muted-foreground"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Bell className="size-4" strokeWidth={1.75} aria-hidden />
          {/* @undo — green unread dot replaced by a numeric count
          {hasUnread ? (
            <span
              className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[var(--status-running-fg)] ring-2 ring-popover"
              aria-hidden
            />
          ) : null}
          */}
          {unreadCount > 0 ? (
            <span
              className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold leading-none text-background"
              aria-hidden
            >
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={12}
        collisionPadding={16}
        data-profile-submenu=""
        className="z-[60] flex w-[28rem] flex-col gap-0 p-0"
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
            disabled={unreadCount === 0}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
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
                <button
                  type="button"
                  aria-label={`${item.title}. ${item.unread ? "Unread" : "Read"}`}
                  onClick={() => {
                    if (item.unread) markRead(item.id);
                  }}
                  className={cn(
                    "flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60",
                    item.unread ? "bg-muted/40" : "bg-transparent"
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
                    <p
                      className={cn(
                        "text-sm text-foreground",
                        item.unread ? "font-semibold" : "font-normal"
                      )}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.timeLabel}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}

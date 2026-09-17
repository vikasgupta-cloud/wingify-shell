/** Dummy JD-profile notifications (client-side only). */
import { create } from "zustand";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  unread: boolean;
};

type NotificationsState = {
  items: AppNotification[];
  markAllRead: () => void;
};

const INITIAL: AppNotification[] = [
  {
    id: "n1",
    title: "Campaign reached significance",
    body: "Homepage Hero CTA Test crossed your primary goal threshold.",
    timeLabel: "2h ago",
    unread: true,
  },
  {
    id: "n2",
    title: "New session recording",
    body: "A high-friction recording was flagged on /pricing.",
    timeLabel: "Yesterday",
    unread: true,
  },
  {
    id: "n3",
    title: "Hypothesis shared with you",
    body: "Priya Sharma shared “Sticky filter rail on PLP”.",
    timeLabel: "3d ago",
    unread: false,
  },
];

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: INITIAL,
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((item) => ({ ...item, unread: false })),
    })),
}));

export function useHasUnreadNotifications() {
  return useNotificationsStore((s) => s.items.some((item) => item.unread));
}

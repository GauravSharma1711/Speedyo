import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import notificationsService, { Notification } from "@/services/notificationsService";

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  nextCursor: string | null;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: (limit?: number, cursor?: string) => Promise<void>;
  markAsRead: (notificationIds: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
  triggerVehicleNotification: (vehicleId: string) => Promise<void>;
  triggerPostNotification: (postId: string) => Promise<void>;
  triggerAdminNotification: (userId: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationState>()(
  immer((set, get) => ({
    notifications: [],
    unreadCount: 0,
    nextCursor: null,
    isLoading: false,
    error: null,

    fetchNotifications: async (limit = 20, cursor?: string) => {
      set({ isLoading: true, error: null });
      try {
        const res = await notificationsService.getNotifications(limit, cursor);
        set({
          notifications: res.notifications,
          nextCursor: res.nextCursor,
          unreadCount: res.unreadCount,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to fetch notifications",
        });
      }
    },

    markAsRead: async (notificationIds: string[]) => {
      try {
        await notificationsService.markAsRead(notificationIds);
        set((state) => {
          const updatedIds = new Set(notificationIds);
          state.notifications = state.notifications.map((n) =>
            updatedIds.has(n.id) ? { ...n, read: true } : n
          );
          state.unreadCount = Math.max(0, state.unreadCount - notificationIds.length);
        });
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    },

    markAllAsRead: async () => {
      try {
        await notificationsService.markAllAsRead();
        set((state) => {
          state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
          state.unreadCount = 0;
        });
      } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
      }
    },

    addNotification: (notification: Notification) => {
      set((state) => {
        state.notifications.unshift(notification);
        if (!notification.read) {
          state.unreadCount += 1;
        }
      });
    },

    clearError: () => set({ error: null }),

    triggerVehicleNotification: async (vehicleId: string) => {
      try {
        await notificationsService.notifyFollowersOnNewVehicle(vehicleId);
      } catch (error) {
        console.error("Failed to trigger vehicle notification:", error);
      }
    },

    triggerPostNotification: async (postId: string) => {
      try {
        await notificationsService.notifyFollowersOnNewPost(postId);
      } catch (error) {
        console.error("Failed to trigger post notification:", error);
      }
    },

    triggerAdminNotification: async (userId: string) => {
      try {
        await notificationsService.notifyAdminOfNewUser(userId);
      } catch (error) {
        console.error("Failed to trigger admin notification:", error);
      }
    },
  }))
);
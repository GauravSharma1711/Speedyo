import api from "@/lib/axios";

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string | null;
  type: string;
  content: string;
  read: boolean;
  related_entity_type?: string;
  related_entity_id?: string;
  url?: string;
  icon?: string;
  createdAt: string;
  sender?: {
    id: string;
    full_name: string;
    profile_image: string | null;
  };
}

const notificationsService = {
  getNotifications: async (limit: number = 20, cursor?: string) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append("cursor", cursor);
    const res = await api.get(`/api/notifications?${params.toString()}`);
    return res.data;
  },

  markAsRead: async (notificationIds: string[]) => {
    const res = await api.post("/api/notifications/mark-read", { notificationIds });
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.post("/api/notifications/mark-read", { markAll: true });
    return res.data;
  },

  // Trigger notifications via service (for frontend/admin use)
  notifyFollowersOnNewVehicle: async (vehicleId: string) => {
    const res = await api.post("/api/notify/notifyFollowersOnNewVehicle", { vehicleId });
    return res.data;
  },

  notifyFollowersOnNewPost: async (postId: string) => {
    const res = await api.post("/api/notify/notifyFollowersOnNewPost", { postId });
    return res.data;
  },

  notifyAdminOfNewUser: async (userId: string) => {
    const res = await api.post("/api/notify/notifyAdminOfNewUser", { userId });
    return res.data;
  },
};

export default notificationsService;
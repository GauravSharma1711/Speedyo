import axios from "@/lib/axios";

export type DashboardNotification = {
  id: string;
  recipient_id?: string | null;
  sender_id?: string | null;
  type?: string | null;
  content?: string | null;
  icon?: string | null;
  url?: string | null;
  read?: boolean | null;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  createdAt?: string | Date | null;
};

export const notificationService = {
  async list(limit = 20): Promise<DashboardNotification[]> {
    const res = await axios.get<{ notifications: DashboardNotification[] }>("/api/notifications", {
      params: { limit },
    });
    return res.data.notifications ?? [];
  },

  async create(data: {
    recipientId: string;
    senderId?: string;
    type?: string;
    content?: string;
    icon?: string;
    url?: string;
    related_entity_type?: string;
    related_entity_id?: string;
  }): Promise<DashboardNotification> {
    const res = await axios.post<{ success: true; notification: DashboardNotification }>(
      "/api/notifications",
      data
    );
    return res.data.notification;
  },

  async markRead(id: string): Promise<void> {
    await axios.patch(`/api/notifications/mark-read`, { id });
  },
};

import api from "@/lib/axios";

export interface NotificationPreferences {
  email_notifications: {
    all_emails: boolean;
    new_follower_post: boolean;
    new_follower_vehicle: boolean;
  };
  inapp_notifications: {
    all_notifications: boolean;
    new_follower_post: boolean;
    new_follower_vehicle: boolean;
  };
}

const notificationSettingsService = {
  getSettings: async () => {
    const res = await api.get("/api/user/notification-settings");
    return res.data;
  },

  updateSettings: async (preferences: NotificationPreferences) => {
    const res = await api.put("/api/user/notification-settings", preferences);
    return res.data;
  },
};

export default notificationSettingsService;

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
    const res = await api.get("/api/seller/settings/notifications");
    return res.data.data;
  },

  updateSettings: async (preferences: NotificationPreferences) => {
    const res = await api.patch("/api/seller/settings/notifications", {
          email: preferences.email_notifications,   
          in_app: preferences.inapp_notifications,
    });
    return res.data;
  },
};

export default notificationSettingsService;

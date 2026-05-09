import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import notificationSettingsService, {
  NotificationPreferences,
} from "@/services/notificationSettingsService";

interface NotificationSettingsState {
  emailSettings: {
    all_emails: boolean;
    new_follower_post: boolean;
    new_follower_vehicle: boolean;
  };
  inappSettings: {
    all_notifications: boolean;
    new_follower_post: boolean;
    new_follower_vehicle: boolean;
  };
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  fetchSettings: () => Promise<void>;
  updateSettings: (emailSettings: NotificationSettingsState["emailSettings"], inappSettings: NotificationSettingsState["inappSettings"]) => Promise<boolean>;
  setEmailSetting: (key: keyof NotificationSettingsState["emailSettings"], value: boolean) => void;
  setInappSetting: (key: keyof NotificationSettingsState["inappSettings"], value: boolean) => void;
}

export const useNotificationSettingsStore = create<NotificationSettingsState>()(
  immer((set, get) => ({
    emailSettings: {
      all_emails: true,
      new_follower_post: true,
      new_follower_vehicle: true,
    },
    inappSettings: {
      all_notifications: true,
      new_follower_post: true,
      new_follower_vehicle: true,
    },
    isLoading: false,
    isSaving: false,
    error: null,

    fetchSettings: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await notificationSettingsService.getSettings();
        if (res.email_notifications) {
          set({
            emailSettings: {
              all_emails: res.email_notifications.all_emails,
              new_follower_post: res.email_notifications.new_follower_post,
              new_follower_vehicle: res.email_notifications.new_follower_vehicle,
            },
          });
        }
        if (res.inapp_notifications) {
          set({
            inappSettings: {
              all_notifications: res.inapp_notifications.all_notifications,
              new_follower_post: res.inapp_notifications.new_follower_post,
              new_follower_vehicle: res.inapp_notifications.new_follower_vehicle,
            },
          });
        }
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to fetch settings",
        });
      }
    },

    updateSettings: async (emailSettings, inappSettings) => {
      set({ isSaving: true, error: null });
      try {
        await notificationSettingsService.updateSettings({
          email_notifications: emailSettings,
          inapp_notifications: inappSettings,
        });
        set({ isSaving: false });
        return true;
      } catch (error: any) {
        set({
          isSaving: false,
          error: error?.response?.data?.message ?? "Failed to save settings",
        });
        return false;
      }
    },

    setEmailSetting: (key, value) => {
      set((state) => {
        state.emailSettings[key] = value;
      });
    },

    setInappSetting: (key, value) => {
      set((state) => {
        state.inappSettings[key] = value;
      });
    },
  }))
);

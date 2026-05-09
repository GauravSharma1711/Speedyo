import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userService } from "@/services/user/userService";

interface User {
  id: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profile_image: string | null;
  user_type: string;
  role: string;
  verified: boolean;
  setup_completed: boolean;
  welcome_email_sent: boolean;
  created_date: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  fetchMe: () => Promise<void>;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    user: null,
    isLoading: false,
    error: null,

    fetchMe: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await userService.me();
        set({ user: res.user, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.error ?? "Failed to fetch user",
        });
      }
    },

    clearUser: () => set({ user: null, error: null }),
  }))
);
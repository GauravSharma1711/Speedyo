import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import userService from "@/services/admin/user";

export type User = {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  profile_image: string | null;
  user_type: string;
  location: string | null;
  phone: string | null;
  dealership_verification_status: string;
  dealership_selected_tier: string | null;
  business_name: string | null;
  business_address: string | null;
  business_city: string | null;
  business_state: string | null;
  business_zip: string | null;
  business_license_urls: string[];
  dealer_License_Number: string | null;
  verification_fee_paid: boolean;
  admin_verification_notes: string | null;
  welcome_email_sent: boolean;
  setup_completed: boolean;
  isVerified: boolean;
  verification_status: string;
};

export type UpdateUserData = {
  user_type?: string;
  verification_status?: string;
  role?: string;
  dealership_verification_status?: string;
  dealership_selected_tier?: string | null;
  admin_verification_notes?: string;
  full_name?: string;
  phone?: string;
  location?: string;
};

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  update: (userId: string, data: UpdateUserData) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    users: [],
    isLoading: false,
    error: null,

    clearError() {
      set({ error: null });
    },

    async getAll() {
      set({ isLoading: true, error: null });
      try {
        const res = await userService.getAll();
        set({ users: res.users, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to fetch users",
        });
        throw error;
      }
    },

    async update(userId, data) {
      set({ isLoading: true, error: null });
      try {
        const res = await userService.update(userId, data);
        set((state) => {
          const index = state.users.findIndex((u) => u.id === userId);
          if (index !== -1) state.users[index] = res.user;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to update user",
        });
        throw error;
      }
    },
  }))
);
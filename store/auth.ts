import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import authService from "@/services/authService";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type SignUpData = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordData = {
  password: string;
  newPassword: string;
};

export type VerifyOtpData = {
  otp: string;
};

export type ForgotPasswordData = {
  email: string;
};

// LoginData and logoutUser are NOT here — NextAuth handles login/logout.
// Use signIn("Credentials", { email, password }) and signOut() in your components.

interface AuthState {
  authUser: User | null;
  hydrated: boolean;
  isLoading: boolean;
  error: string | null;

  setHydrated: () => void;

  signUpUser: (data: SignUpData) => Promise<void>;
  getUserProfile: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  verifyOtp: (data: VerifyOtpData) => Promise<void>;
  resendOtp: () => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      authUser: null,
      hydrated: false,
      isLoading: false,
      error: null,

      setHydrated() {
        set({ hydrated: true });
      },

      clearError() {
        set({ error: null });
      },

      async signUpUser(data: SignUpData) {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.signUp(data);
          // After sign up, user typically needs to verify OTP before login.
          // So we don't set authUser here — just stop loading.
          set({ isLoading: false });
          return res;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Sign up failed",
          });
          throw error;
        }
      },

      async getUserProfile() {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.getUserProfile();
          set({ authUser: res.user, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Failed to fetch profile",
          });
          throw error;
        }
      },

      async forgotPassword(data: ForgotPasswordData) {
        set({ isLoading: true, error: null });
        try {
          await authService.forgotPassword(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Failed to send reset email",
          });
          throw error;
        }
      },

      async verifyOtp(data: VerifyOtpData) {
        set({ isLoading: true, error: null });
        try {
          await authService.verifyOtp(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "OTP verification failed",
          });
          throw error;
        }
      },

      async resendOtp() {
        set({ isLoading: true, error: null });
        try {
          await authService.resendOtp();
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Failed to resend OTP",
          });
          throw error;
        }
      },

      async resetPassword(data: ResetPasswordData) {
        set({ isLoading: true, error: null });
        try {
          await authService.resetPassword(data);
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Password reset failed",
          });
          throw error;
        }
      },
    })),
    {
      name: "auth",
      // Only persist the user profile — everything else resets on page load
      partialize: (state) => ({ authUser: state.authUser }),
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    }
  )
);
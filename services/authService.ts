import api from "@/lib/axios";
import { SignUpData, ResetPasswordData, VerifyOtpData, ForgotPasswordData } from "@/store/auth";

// Login and logout are handled by NextAuth's signIn() / signOut() — not here.
// This service only covers routes NextAuth doesn't handle.

const authService = {
  signUp: async (data: SignUpData) => {
    const res = await api.post("/api/auth/signup", data);
    return res.data;
  },

  getUserProfile: async () => {
    const res = await api.get("/api/user/profile");
    return res.data;
  },

  forgotPassword: async (data: ForgotPasswordData) => {
    const res = await api.post("/api/auth/forgot-password", data);
    return res.data;
  },

  verifyOtp: async (data: VerifyOtpData) => {
    const res = await api.post("/api/auth/verify-otp", data);
    return res.data;
  },

  resendOtp: async () => {
    const res = await api.post("/api/auth/resend-otp");
    return res.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const res = await api.post("/api/auth/reset-password", data);
    return res.data;
  },
};

export default authService;
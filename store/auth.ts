import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type LoginData = {
  email: string;
  password: string;
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

interface AuthState {
  authUser: User | null;
  hydrated: boolean;

  setHydrated: () => void;

  signUpUser: (data: SignUpData) => Promise<void>;
  loginUser: (data: LoginData) => Promise<void>;
  logoutUser: () => Promise<void>;
  getUserProfile: () => Promise<void>;

  resetPassword: (data: ResetPasswordData) => Promise<void>;
  verifyOtp: (data: VerifyOtpData) => Promise<void>;
  resendOtp: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      authUser: null,
      hydrated: false,

      setHydrated() {
        set({ hydrated: true });
      },

      async signUpUser({ email, password, confirmPassword }: SignUpData) {
      try {
        
      } catch (error) {
        
      }
      },

      async loginUser({ email, password }: LoginData) {
       try {
        
       } catch (error) {
        
       }
      },

      async logoutUser() {
      try {
        
          set({ authUser: null });
      } catch (error) {
        
      }
      },

      async getUserProfile() {
      try {
        
      } catch (error) {
        
      }
      },

      async verifyOtp({ otp }: VerifyOtpData) {
       try {
        
       } catch (error) {
        
       }
      },

      async resendOtp() {
        try {
            
        } catch (error) {
            
        }
      },

      async forgotPassword({ email }: ForgotPasswordData) {
       try {
        
       } catch (error) {
        
       }
      },

      async resetPassword({ password, newPassword }: ResetPasswordData) {
        try {
            
        } catch (error) {
            
        }
      },
    })),
    {
      name: 'auth',
      onRehydrateStorage() {
        return (state, error) => {
          if (!error) state?.setHydrated();
        };
      },
    }
  )
);
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { downgradeToGuest, updateMe, type UpdateUserInput } from "@/services/profile/profileUpdateServices";

type State = {
  isSaving: boolean;
  isDowngrading: boolean;
  error: string | null;
  save: (input: UpdateUserInput) => Promise<void>;
  downgradeToGuest: () => Promise<{ vehiclesHidden: number }>;
};

export const useProfileUpdateStore = create<State>()(
  immer((set) => ({
    isSaving: false,
    isDowngrading: false,
    error: null,


    async save(input) {
      set((s) => {
        s.isSaving = true;
        s.error = null;
      });

      try {
        await updateMe(input);
      } catch (e: any) {
        set((s) => {
          s.error = e?.response?.data?.error ?? e?.message ?? "Failed to update profile";
        });
        throw e;
      } finally {
        set((s) => {
          s.isSaving = false;
        });
      }
    },


      async downgradeToGuest() {
      set((s) => {
        s.isDowngrading = true;
        s.error = null;
      });
      try {
        const res = await downgradeToGuest();
        return res.data;
      } catch (e: any) {
        const msg = e?.response?.data?.error ?? e?.message ?? "Failed to downgrade account";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isDowngrading = false;
        });
      }
    },

  
  
  }))
);
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { updateMe, type UpdateUserInput } from "@/services/profile/profileUpdateServices";

type State = {
  isSaving: boolean;
  error: string | null;
  save: (input: UpdateUserInput) => Promise<void>;
};

export const useProfileUpdateStore = create<State>()(
  immer((set) => ({
    isSaving: false,
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
  }))
);
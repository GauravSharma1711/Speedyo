import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  dealershipRegistrationService,
  type DealershipRegistrationInput,
} from "@/services/dealership/dealershipRegistrationService";

type State = {
  isSaving: boolean;
  error: string | null;
  register: (input: DealershipRegistrationInput) => Promise<void>;
};

export const useDealershipRegistrationStore = create<State>()(
  immer((set) => ({
    isSaving: false,
    error: null,

    async register(input) {
      set((s) => {
        s.isSaving = true;
        s.error = null;
      });
      try {
        await dealershipRegistrationService.register(input);
      } catch (e: any) {
        const msg = e?.response?.data?.error ?? e?.message ?? "Registration failed";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isSaving = false;
        });
      }
    },
  }))
);
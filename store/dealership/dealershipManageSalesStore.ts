import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  dealershipManageSaleService,
  type DealershipManageSalesInput,
} from "@/services/dealership/dealershipManageSalesService";

type State = {
  isSaving: boolean;
  error: string | null;
  inquiry: (input: DealershipManageSalesInput) => Promise<void>;
};

export const useDealershipManageSaleStore = create<State>()(
  immer((set) => ({
    isSaving: false,
    error: null,

    async inquiry(input) {
      set((s) => {
        s.isSaving = true;
        s.error = null;
      });
      try {
      const res =   await dealershipManageSaleService.inquiry(input);
      return res.data;
      } catch (e: any) {
        const msg = e?.response?.data?.error ?? e?.message ?? "Inquiry failed";
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
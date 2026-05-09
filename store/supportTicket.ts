import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { supportTicketService } from "@/services/supportTicketServices";
import type {
  CreateSupportTicketBody,
  SupportTicketApi,
} from "@/services/supportTicketServices";

type SupportTicketSubmitState = {
  isSubmitting: boolean;
  error: string | null;
  lastCreated: SupportTicketApi | null;
};

type SupportTicketSubmitActions = {
  submit: (body: CreateSupportTicketBody) => Promise<SupportTicketApi>;
  reset: () => void;
};

export const useSupportTicketSubmitStore = create<
  SupportTicketSubmitState & SupportTicketSubmitActions
>()(
  immer((set) => ({
    isSubmitting: false,
    error: null,
    lastCreated: null,

    submit: async (body) => {
      set((s) => {
        s.isSubmitting = true;
        s.error = null;
      });

      try {
        const res = await supportTicketService.raise(body);
        set((s) => {
          s.lastCreated = res.ticket;
        });
        return res.ticket;
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to submit ticket")
            : e instanceof Error
              ? e.message
              : "Failed to submit ticket";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isSubmitting = false;
        });
      }
    },

    reset: () =>
      set((s) => {
        s.isSubmitting = false;
        s.error = null;
        s.lastCreated = null;
      }),
  }))
);


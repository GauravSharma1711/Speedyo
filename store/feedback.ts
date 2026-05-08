import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { feedbackService } from "@/services/feedbackServices";
import type { SubmitFeedbackBody, SubmittedFeedback } from "@/services/feedbackServices";

type FeedbackSubmitState = {
  isSubmitting: boolean;
  error: string | null;
  lastSubmitted: SubmittedFeedback | null;
};

type FeedbackSubmitActions = {
  submit: (body: SubmitFeedbackBody) => Promise<SubmittedFeedback>;
  reset: () => void;
};

export const useFeedbackSubmitStore = create<FeedbackSubmitState & FeedbackSubmitActions>()(
  immer((set) => ({
    isSubmitting: false,
    error: null,
    lastSubmitted: null,

    submit: async (body) => {
      set((s) => {
        s.isSubmitting = true;
        s.error = null;
      });

      try {
        const res = await feedbackService.submit(body);
        set((s) => {
          s.lastSubmitted = res.feedback;
        });
        return res.feedback;
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to submit feedback")
            : e instanceof Error
              ? e.message
              : "Failed to submit feedback";

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
        s.lastSubmitted = null;
      }),
  }))
);
import api from "@/lib/axios";

export const FEEDBACK_CATEGORIES = [
  "general",
  "marketplace",
  "feed",
  "messaging",
  "managed_sales",
  "dashboard",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export type SubmitFeedbackBody = {
  satisfaction_rating: number; 
  feedback_text: string; 
  category?: FeedbackCategory;
};

export type SubmittedFeedbackUser = {
  id: string;
  full_name: string | null;
  profile_image: string | null;
  user_type: string | null;
};

export type SubmittedFeedback = {
  id: string;
  createdAt: string;
  updatedAt: string;

  satisfaction_rating: number;
  feedback_text: string;

  userId: string | null;
  user_email: string | null;
  user_name: string | null;

  category: FeedbackCategory;
  status: "new" | "resolved" | "in_progress" | string;
  admin_notes: string | null;

  user: SubmittedFeedbackUser | null;
};

export type SubmitFeedbackResponse = {
  success: true;
  feedback: SubmittedFeedback;
};

export const feedbackService = {
  submit: async (body: SubmitFeedbackBody) => {
    const res = await api.post<SubmitFeedbackResponse>("/api/user/giveFeedback", body);
    return res.data;
  },
};
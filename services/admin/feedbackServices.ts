import api from "@/lib/axios";

export type FeedbackStatus = "new" | "reviewed" | "in_progress" | "resolved";
export type FeedbackCategory =
  | "general"
  | "marketplace"
  | "feed"
  | "messaging"
  | "managed_sales"
  | "dashboard"
  | "other";

export type FeedbackApi = {
  id: string;
  createdAt: string;
  updatedAt: string;
  satisfaction_rating: number;
  feedback_text: string;
  userId: string | null;
  user_email: string | null;
  user_name: string | null;
  category: FeedbackCategory;
  status: FeedbackStatus;
  admin_notes: string | null;
};

export type ListFeedbackResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  items: FeedbackApi[];
};

export type UpdateFeedbackBody = {
  status?: FeedbackStatus;
  admin_notes?: string | null;
};

export type FeedbackStatsResponse = {
  success: boolean;
  totalAll: number;
  totalNew: number;
  avgRatingAll: number;
};

const feedbackService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: FeedbackStatus;
    category?: FeedbackCategory;
  }) => {
    const res = await api.get<ListFeedbackResponse>("/api/admin/feedback", { params });
    return res.data;
  },

  update: async (id: string, body: UpdateFeedbackBody) => {
    const res = await api.patch<{ success: boolean; feedback: FeedbackApi }>(`/api/admin/feedback/${id}`, body);
    return res.data;
  },

  stats: async () => {
    const res = await api.get<FeedbackStatsResponse>("/api/admin/feedback/stats");
    return res.data;
  },
};

export default feedbackService;


import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import feedbackService, {
  FeedbackApi,
  FeedbackCategory,
  FeedbackStatus,
  UpdateFeedbackBody,
} from "@/services/admin/feedbackServices";

type State = {
  items: FeedbackApi[];
  isLoading: boolean;
  error: string | null;
  totalsLoading: boolean;
  totalsLoaded: boolean;
  page: number;
  limit: number;
  total: number;
  totalAll: number;
  totalNew: number;
  avgRatingAll: string;
  search: string;
  statusFilter: "" | FeedbackStatus;
  categoryFilter: "" | FeedbackCategory;
};

type Actions = {
  fetch: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refresh: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: "" | FeedbackStatus) => void;
  setCategoryFilter: (category: "" | FeedbackCategory) => void;
  setPage: (page: number) => void;
  update: (id: string, patch: UpdateFeedbackBody) => Promise<void>;
};

type FeedbackState = State & Actions;

export const useFeedbackStore = create<FeedbackState>()(
  immer((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    totalsLoading: false,
    totalsLoaded: false,
    page: 1,
    limit: 50,
    total: 0,
    totalAll: 0,
    totalNew: 0,
    avgRatingAll: "0",
    search: "",
    statusFilter: "",
    categoryFilter: "",

    fetch: async () => {
      if (get().isLoading) return;
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });
      try {
        const { page, limit, search, statusFilter, categoryFilter, totalsLoaded } = get();
        const res = await feedbackService.list({
          page,
          limit,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
        });

        // If we're on the default (unfiltered) first page, use it to set stable stats
        const isDefaultQuery =
          page === 1 && !search.trim() && !statusFilter && !categoryFilter;

        const avgFromPage =
          (res.items?.length ?? 0) > 0
            ? (
                res.items.reduce((sum, f) => sum + (Number(f.satisfaction_rating) || 0), 0) /
                res.items.length
              ).toFixed(1)
            : "0";

        set((s) => {
          s.items = res.items;
          s.total = res.total;
          s.page = res.page;
          s.limit = res.limit;
          if (isDefaultQuery && !totalsLoaded) {
            s.totalAll = res.total;
            s.avgRatingAll = avgFromPage;
            s.totalsLoaded = true;
          }
        });
      } catch (e) {
        set((s) => {
          s.error = "Failed to load feedback";
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },

    refresh: async () => {
      await get().fetch();
    },

    fetchStats: async () => {
      const { totalsLoading } = get();
      if (totalsLoading) return;

      set((s) => {
        s.totalsLoading = true;
      });
      try {
        const res = await feedbackService.stats();
        set((s) => {
          s.totalAll = res.totalAll;
          s.totalNew = res.totalNew;
          s.avgRatingAll = String(res.avgRatingAll);
          s.totalsLoaded = true;
        });
      } catch (e) {
      } finally {
        set((s) => {
          s.totalsLoading = false;
        });
      }
    },

    setSearch: (search: string) =>
      set((s) => {
        s.search = search;
        s.page = 1;
      }),
    setStatusFilter: (status) =>
      set((s) => {
        s.statusFilter = status;
        s.page = 1;
      }),
    setCategoryFilter: (category) =>
      set((s) => {
        s.categoryFilter = category;
        s.page = 1;
      }),
    setPage: (page: number) =>
      set((s) => {
        s.page = page;
      }),

    update: async (id: string, patch: UpdateFeedbackBody) => {
      const prev = get().items;
      set((s) => {
        const idx = s.items.findIndex((it) => it.id === id);
        if (idx !== -1) {
          s.items[idx] = { ...s.items[idx], ...patch, updatedAt: new Date().toISOString() };
        }
      });

      try {
        const res = await feedbackService.update(id, patch);
        set((s) => {
          const idx = s.items.findIndex((it) => it.id === id);
          if (idx !== -1) s.items[idx] = res.feedback;
        });
      } catch (e) {
        set((s) => {
          s.items = prev;
        });
        throw e;
      }
    },
  }))
);


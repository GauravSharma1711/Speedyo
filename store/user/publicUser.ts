import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { publicUserService, type PublicUserProfile } from "@/services/user/publicUserServices";

type State = {
  byUserId: Record<string, PublicUserProfile | undefined>;
  loadingByUserId: Record<string, boolean>;
  errorByUserId: Record<string, string | null>;

  ensure: (userId: string) => Promise<void>;
};

export const usePublicUserStore = create<State>()(
  immer((set, get) => ({
    byUserId: {},
    loadingByUserId: {},
    errorByUserId: {},

    async ensure(userId) {
      if (!userId) return;
      if (get().byUserId[userId]) return;
      if (get().loadingByUserId[userId]) return;

      set((s) => {
        s.loadingByUserId[userId] = true;
        s.errorByUserId[userId] = null;
      });

      try {
        const profile = await publicUserService.getByUserId(userId);
        set((s) => {
          s.byUserId[userId] = profile;
        });
      } catch (e: any) {
        set((s) => {
          s.errorByUserId[userId] = e?.response?.data?.error ?? e?.message ?? "Failed to load user";
        });
      } finally {
        set((s) => {
          s.loadingByUserId[userId] = false;
        });
      }
    },
  }))
);
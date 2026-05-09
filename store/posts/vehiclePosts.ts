import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { vehiclePostsService } from "@/services/posts/vehiclePostsServices";
import type { VehiclePostApi } from "@/services/posts/vehiclePostsServices";

type VehiclePostsState = {
  items: VehiclePostApi[];
  page: number;
  limit: number;
  total: number;
  isLoading: boolean;
  error: string | null;
};

type VehiclePostsActions = {
  fetch: (vehicleId: string, params?: { page?: number; limit?: number }) => Promise<void>;
  clear: () => void;
};

export const useVehiclePostsStore = create<VehiclePostsState & VehiclePostsActions>()(
  immer((set, get) => ({
    items: [],
    page: 1,
    limit: 10,
    total: 0,
    isLoading: false,
    error: null,

    clear: () =>
      set((s) => {
        s.items = [];
        s.page = 1;
        s.limit = 10;
        s.total = 0;
        s.isLoading = false;
        s.error = null;
      }),

    fetch: async (vehicleId, params) => {
      if (get().isLoading) return;
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });
      try {
        const res = await vehiclePostsService.listByVehicle(vehicleId, {
          page: params?.page ?? get().page,
          limit: params?.limit ?? get().limit,
        });
        set((s) => {
          s.items = res.posts;
          s.page = res.page;
          s.limit = res.limit;
          s.total = res.total;
        });
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to load posts")
            : e instanceof Error
              ? e.message
              : "Failed to load posts";
        set((s) => {
          s.error = msg;
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },
  }))
);


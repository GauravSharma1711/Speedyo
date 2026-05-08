import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import vehicleEditRequestService, {
  UpdateVehicleEditRequestBody,
  VehicleEditRequestApi,
  VehicleEditRequestStatus,
} from "@/services/admin/vehicleEditRequestServices";

type State = {
  items: VehicleEditRequestApi[];
  isLoading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  statusFilter: "" | VehicleEditRequestStatus;
};

type Actions = {
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  setStatusFilter: (status: "" | VehicleEditRequestStatus) => void;
  setPage: (page: number) => void;
  update: (requestId: string, body: UpdateVehicleEditRequestBody) => Promise<void>;
};

type VehicleEditRequestsState = State & Actions;

export const useVehicleEditRequestsStore = create<VehicleEditRequestsState>()(
  immer((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    page: 1,
    limit: 50,
    total: 0,
    statusFilter: "",

    fetch: async () => {
      if (get().isLoading) return;
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });
      try {
        const { page, limit, statusFilter } = get();
        const res = await vehicleEditRequestService.list({
          page,
          limit,
          status: statusFilter || undefined,
        });
        set((s) => {
          s.items = res.requests;
          s.total = res.total;
          s.page = res.page;
          s.limit = res.limit;
        });
      } catch (e) {
        set((s) => {
          s.error = "Failed to load edit requests";
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

    setStatusFilter: (status) =>
      set((s) => {
        s.statusFilter = status;
        s.page = 1;
      }),

    setPage: (page) =>
      set((s) => {
        s.page = page;
      }),

    update: async (requestId, body) => {
      const prev = get().items;
      // optimistic update of status + notes
      set((s) => {
        const idx = s.items.findIndex((r) => r.id === requestId);
        if (idx !== -1) {
          s.items[idx] = {
            ...s.items[idx],
            status: body.status,
            admin_notes: body.admin_notes ?? s.items[idx].admin_notes,
            processed_by_admin: s.items[idx].processed_by_admin ?? "admin",
            processed_at: new Date().toISOString(),
          };
        }
      });

      try {
        const res = await vehicleEditRequestService.update(requestId, body);
        set((s) => {
          const idx = s.items.findIndex((r) => r.id === requestId);
          if (idx !== -1) s.items[idx] = res.updatedRequest;
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


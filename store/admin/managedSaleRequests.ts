import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import managedSaleRequestService, {
  ManagedSaleRequestDetailApi,
  ManagedSaleRequestListItemApi,
  ManagedSaleRequestStatus,
} from "@/services/admin/managedSaleRequestServices";

type State = {
  items: ManagedSaleRequestListItemApi[];
  current: ManagedSaleRequestDetailApi | null;
  isLoading: boolean;
  error: string | null;
  page: number;
  total: number;
  limit: number;
  search: string;
  statusFilter: "" | ManagedSaleRequestStatus;
};

type Actions = {
  fetch: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: "" | ManagedSaleRequestStatus;
  }) => Promise<void>;
  refresh: () => Promise<void>;
  setSearch: (search: string) => void;
  setStatusFilter: (status: "" | ManagedSaleRequestStatus) => void;
  setPage: (page: number) => void;
  getById: (id: string) => Promise<void>;
  adminPatch: (id: string, formData: FormData) => Promise<void>;
  delete: (id: string, opts?: { deleteVehicle?: boolean }) => Promise<void>;
  approveAndList: (id: string, body: { adminNotes?: string | null; userFacingNotes?: string | null }) => Promise<void>;
  patchStatus: (id: string, body: { status: string; userFacingNotes?: string | null; adminNotes?: string | null; recurringAvailability?: unknown; recurring_availability?: unknown }) => Promise<void>;
  updateAvailability: (id: string, body: { recurringAvailability?: unknown; recurring_availability?: unknown }) => Promise<void>;
  markSold: (id: string) => Promise<void>;
  approveCancellation: (id: string) => Promise<void>;
  declineCancellation: (id: string, reason: string) => Promise<void>;
  approveEditRequest: (id: string, index: number, adminNotes?: string | null) => Promise<void>;
  declineEditRequest: (id: string, index: number, reason: string) => Promise<void>;
  getChecklistAttached: (id: string) => Promise<void>;
};

type ManagedSaleRequestsState = State & Actions;

export const useManagedSaleRequestsStore = create<ManagedSaleRequestsState>()(
  immer((set, get) => ({
    items: [],
    current: null,
    isLoading: false,
    error: null,
    page: 1,
    total: 0,
    limit: 50,
    search: "",
    statusFilter: "",

    fetch: async (params) => {
      if (get().isLoading) return;
      const prev = get();
      const page = params?.page ?? prev.page;
      const limit = params?.limit ?? prev.limit;
      const search = params?.search ?? prev.search;
      const statusFilter = params?.status ?? prev.statusFilter;
      set((s) => {
        s.isLoading = true;
        s.error = null;
        s.page = page;
        s.limit = limit;
        s.search = search;
        s.statusFilter = statusFilter;
      });
      try {
        const res = await managedSaleRequestService.list({
          page,
          limit,
          search: search.trim() || undefined,
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
          s.error = "Failed to load managed sale requests";
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

    setSearch: (search) =>
      set((s) => {
        s.search = search;
        s.page = 1;
      }),

    setStatusFilter: (status) =>
      set((s) => {
        s.statusFilter = status;
        s.page = 1;
      }),

    setPage: (page) =>
      set((s) => {
        s.page = page;
      }),

    getById: async (id) => {
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });
      try {
        const res = await managedSaleRequestService.getById(id);
        set((s) => {
          s.current = res.request;
        });
      } catch (e) {
        set((s) => {
          s.error = "Failed to load managed sale request";
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },

    adminPatch: async (id, formData) => {
      const res = await managedSaleRequestService.adminPatch(id, formData);
      set((s) => {
        s.current = res.request;
        const idx = s.items.findIndex((r) => r.id === id);
        if (idx !== -1) s.items[idx] = { ...s.items[idx], ...res.request } as any;
      });
    },

    delete: async (id, opts) => {
      const prev = get().items;
      set((s) => {
        s.items = s.items.filter((r) => r.id !== id);
      });
      try {
        await managedSaleRequestService.delete(id, opts);
      } catch (e) {
        set((s) => {
          s.items = prev;
        });
        throw e;
      }
    },

    approveAndList: async (id, body) => {
      await managedSaleRequestService.approveAndList(id, body);
      await get().getById(id);
      await get().fetch();
    },

    patchStatus: async (id, body) => {
      const res = await managedSaleRequestService.patchStatus(id, body);
      set((s) => {
        s.current = res.request;
        const idx = s.items.findIndex((r) => r.id === id);
        if (idx !== -1) s.items[idx] = { ...s.items[idx], ...res.request } as any;
      });
    },

    updateAvailability: async (id, body) => {
      const res = await managedSaleRequestService.updateAvailability(id, body);
      set((s) => {
        s.current = res.request;
      });
    },

    markSold: async (id) => {
      const res = await managedSaleRequestService.markSold(id);
      set((s) => {
        s.current = res.request;
        const idx = s.items.findIndex((r) => r.id === id);
        if (idx !== -1) s.items[idx] = { ...s.items[idx], ...res.request } as any;
      });
    },

    approveCancellation: async (id) => {
      const res = await managedSaleRequestService.approveCancellation(id);
      set((s) => {
        s.current = res.request;
      });
      await get().fetch();
    },

    declineCancellation: async (id, reason) => {
      const res = await managedSaleRequestService.declineCancellation(id, { reason });
      set((s) => {
        s.current = res.request;
      });
      await get().fetch();
    },

    approveEditRequest: async (id, index, adminNotes) => {
      const res = await managedSaleRequestService.approveEditRequest(id, index, { adminNotes });
      set((s) => {
        s.current = res.request;
      });
      await get().fetch();
    },

    declineEditRequest: async (id, index, reason) => {
      const res = await managedSaleRequestService.declineEditRequest(id, index, { reason });
      set((s) => {
        s.current = res.request;
      });
      await get().fetch();
    },

    getChecklistAttached: async (id) => {
      const res = await managedSaleRequestService.getChecklistAttached(id);
      set((s) => {
        if (s.current && s.current.id === id) {
          (s.current as any).inspectionChecklists = res.checklists;
        }
      });
    },
  }))
);


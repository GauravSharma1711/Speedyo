import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import inspectionChecklistService, { ChecklistApi, CreateChecklistBody } from "@/services/admin/inspectionChecklistService";

type State = {
  items: ChecklistApi[];
  isLoading: boolean;
  error: string | null;
  total: number;
  page: number;
  search: string;
  managedSaleRequestIdFilter: string;
};

type Actions = {
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  create: (body: CreateChecklistBody) => Promise<ChecklistApi>;
  update: (id: string, body: Partial<CreateChecklistBody>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  linkMSR: (id: string, managedSaleRequestId: string | null) => Promise<void>;
  setSearch: (search: string) => void;
  setPage: (page: number) => void;
  setMSRFilter: (msrId: string) => void;
};

type InspectionChecklistState = State & Actions;

export const useInspectionChecklistStore = create<InspectionChecklistState>()(
  immer((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    total: 0,
    page: 1,
    search: "",
    managedSaleRequestIdFilter: "",

    fetch: async () => {
      set((s) => { s.isLoading = true; s.error = null; });
      try {
        const { search, page, managedSaleRequestIdFilter } = get();
        const res = await inspectionChecklistService.list({
          search: search || undefined,
          managedSaleRequestId: managedSaleRequestIdFilter || undefined,
          page,
          limit: 100,
        });
        set((s) => {
          s.items = res.items;
          s.total = res.total;
        });
      } catch (e) {
        set((s) => { s.error = "Failed to load checklists"; });
      } finally {
        set((s) => { s.isLoading = false; });
      }
    },

    refresh: async () => { await get().fetch(); },

    create: async (body: CreateChecklistBody) => {
      const res = await inspectionChecklistService.create(body);
      set((s) => { s.items.unshift(res.checklist); s.total += 1; });
      return res.checklist;
    },

    update: async (id: string, body: Partial<CreateChecklistBody>) => {
      const res = await inspectionChecklistService.update(id, body);
      set((s) => {
        const idx = s.items.findIndex((it) => it.id === id);
        if (idx !== -1) s.items[idx] = res.checklist;
      });
    },

    remove: async (id: string) => {
      // Optimistic
      set((s) => {
        s.items = s.items.filter((it) => it.id !== id);
        s.total = Math.max(0, s.total - 1);
      });
      await inspectionChecklistService.delete(id);
    },

    linkMSR: async (id: string, managedSaleRequestId: string | null) => {
      const res = await inspectionChecklistService.linkMSR(id, managedSaleRequestId);
      set((s) => {
        const idx = s.items.findIndex((it) => it.id === id);
        if (idx !== -1) s.items[idx] = res.checklist;
      });
    },

    setSearch: (search: string) => set((s) => { s.search = search; }),
    setPage: (page: number) => set((s) => { s.page = page; }),
    setMSRFilter: (msrId: string) => set((s) => { s.managedSaleRequestIdFilter = msrId; }),
  }))
);
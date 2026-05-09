import oistTradeInService, { TradeInRequestApi, TradeInStatus } from "@/services/admin/oistTradeInServices"
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type OistTradeInState = {
    items: TradeInRequestApi[];
    isLoading: boolean;
    error: string | null;
    page: number;
    total: number;
    statusFilter: TradeInStatus | "";
    search: string;

    setStatusFilter: (status: TradeInStatus | "") => void;
    setSearch: (search: string) => void;
    setPage: (page: number) => void;
    fetch: () => Promise<void>;
    updateStatus: (id: string, status: TradeInStatus) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useOistTradeInStore = create<OistTradeInState>()(
    immer((set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      page: 1,
      total: 0,
      statusFilter: "",
      search: "",
      setStatusFilter(status) {
        set({ statusFilter: status, page: 1 });
      },
      setSearch(search) {
        set({ search, page: 1 });
      },
      setPage(page) {
        set({ page });
      },
      async fetch() {
        const { statusFilter, search, page } = get();
        set({ isLoading: true, error: null });
        try {
          const res = await oistTradeInService.list({
            status: statusFilter || undefined,
            search: search || undefined,
            page,
            limit: 50,
          });
          set({
            items: res.items,
            total: res.total,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.error ?? "Failed to load trade-in requests",
          });
          throw error;
        }
      },
      async updateStatus(id, status) {
        const prevItems = get().items;
        set((state) => {
          state.items = state.items.map((t) =>
            t.id === id ? { ...t, status } : t
          );
        });
        try {
          const updated = await oistTradeInService.updateStatus(id, status);
          set((state) => {
            state.items = state.items.map((t) =>
              t.id === id ? updated : t
            );
          });
        } catch (error: any) {
          set({ items: prevItems });
          set({
            error: error?.response?.data?.error ?? "Failed to update status",
          });
          throw error;
        }
      },
      async refresh() {
        await get().fetch();
      },
    }))
  );
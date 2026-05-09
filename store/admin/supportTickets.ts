import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import supportTicketService, {
  SupportTicketApi,
  TicketPriority,
  TicketStatus,
  TicketType,
  UpdateSupportTicketBody,
} from "@/services/admin/supportTicketServices";

type State = {
  items: SupportTicketApi[];
  isLoading: boolean;
  error: string | null;
  statusFilter: "" | TicketStatus;
  typeFilter: "" | TicketType;
  priorityFilter: "" | TicketPriority;
};

type Actions = {
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  setStatusFilter: (status: "" | TicketStatus) => void;
  setTypeFilter: (type: "" | TicketType) => void;
  setPriorityFilter: (priority: "" | TicketPriority) => void;
  update: (ticketId: string, patch: UpdateSupportTicketBody) => Promise<void>;
  updateStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
};

type SupportTicketsState = State & Actions;

export const useSupportTicketsStore = create<SupportTicketsState>()(
  immer((set, get) => ({
    items: [],
    isLoading: false,
    error: null,
    statusFilter: "",
    typeFilter: "",
    priorityFilter: "",

    fetch: async () => {
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });
      try {
        const { statusFilter, typeFilter, priorityFilter } = get();
        const res = await supportTicketService.list({
          status: statusFilter || undefined,
          ticket_type: typeFilter || undefined,
          priority: priorityFilter || undefined,
        });
        set((s) => {
          s.items = res.tickets;
        });
      } catch (e) {
        set((s) => {
          s.error = "Failed to load support tickets";
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
      }),
    setTypeFilter: (type) =>
      set((s) => {
        s.typeFilter = type;
      }),
    setPriorityFilter: (priority) =>
      set((s) => {
        s.priorityFilter = priority;
      }),

    update: async (ticketId: string, patch: UpdateSupportTicketBody) => {
      const prev = get().items;
      set((s) => {
        const idx = s.items.findIndex((t) => t.id === ticketId);
        if (idx !== -1) {
          s.items[idx] = { ...s.items[idx], ...patch, updatedAt: new Date().toISOString() };
        }
      });
      try {
        const res = await supportTicketService.update(ticketId, patch);
        set((s) => {
          const idx = s.items.findIndex((t) => t.id === ticketId);
          if (idx !== -1) s.items[idx] = res.ticket;
        });
      } catch (e) {
        set((s) => {
          s.items = prev;
        });
        throw e;
      }
    },

    updateStatus: async (ticketId: string, status: TicketStatus) => {
      await get().update(ticketId, { status });
    },
  }))
);


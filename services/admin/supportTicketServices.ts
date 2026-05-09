import api from "@/lib/axios";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketType = "general" | "billing" | "technical" | "listing_issue";

export type SupportTicketApi = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  ticket_type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  resolution_notes: string | null;
};

export type ListSupportTicketsResponse = {
  success: boolean;
  tickets: SupportTicketApi[];
};

export type UpdateSupportTicketBody = Partial<Pick<
  SupportTicketApi,
  "status" | "priority" | "ticket_type" | "assigned_to" | "resolution_notes"
>>;

const supportTicketService = {
  list: async (params?: {
    status?: TicketStatus;
    ticket_type?: TicketType;
    priority?: TicketPriority;
  }) => {
    const res = await api.get<ListSupportTicketsResponse>("/api/admin/tickets", { params });
    return res.data;
  },

  update: async (ticketId: string, body: UpdateSupportTicketBody) => {
    const res = await api.patch<{ success: boolean; ticket: SupportTicketApi }>(
      `/api/admin/tickets/${ticketId}/updateStatus`,
      body
    );
    return res.data;
  },
};

export default supportTicketService;


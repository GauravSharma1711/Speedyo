import api from "@/lib/axios";

export const SUPPORT_TICKET_TYPES = [
  "general",
  "billing",
  "technical",
  "listing_issue",
] as const;

export type SupportTicketType = (typeof SUPPORT_TICKET_TYPES)[number];

export const SUPPORT_TICKET_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type SupportTicketPriority = (typeof SUPPORT_TICKET_PRIORITIES)[number];

export type CreateSupportTicketBody = {
  name: string;
  email: string;
  subject: string;
  message: string;
  ticket_type?: SupportTicketType;
  priority?: SupportTicketPriority;
};

export type SupportTicketApi = {
  id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  email: string;
  subject: string;
  message: string;

  ticket_type: SupportTicketType | string;
  status: "open" | "in_progress" | "resolved" | string;
  priority: SupportTicketPriority | string;

  assigned_to: string | null;
  resolution_notes: string | null;
};

export type CreateSupportTicketResponse = {
  success: true;
  ticket: SupportTicketApi;
};

export const supportTicketService = {
  raise: async (body: CreateSupportTicketBody) => {
    const res = await api.post<CreateSupportTicketResponse>("/api/user/raiseTicket", body);
    return res.data;
  },
};


import api from "@/lib/axios";

export type ManagedSaleRequestStatus =
  | "pending_initial_review"
  | "pending_review"
  | "approved"
  | "declined"
  | "listed"
  | "sold"
  | "cancelled"
  | "cancellation_requested"
  | "edit_requested";

export type ManagedSaleRequestListItemApi = {
  id: string;
  status?: ManagedSaleRequestStatus;
  listing_type?: 'managed_sales' | 'direct';
  createdAt?: string;
  updatedAt?: string;

  vehicle_title?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: string | number | null;

  contact_full_name?: string | null;
  contact_email?: string | null;

  submittedByUser?: {
    id: string;
    email: string | null;
    full_name: string | null;
    profile_image: string | null;
  } | null;
};

export type ListManagedSaleRequestsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  requests: ManagedSaleRequestListItemApi[];
};

export type ManagedSaleRequestDetailApi = Record<string, unknown> & {
  id: string;
  status?: ManagedSaleRequestStatus;
  createdAt?: string;
  updatedAt?: string;
  submittedByUser?: Record<string, unknown> | null;
  createdVehicle?: Record<string, unknown> | null;
  inspectionChecklists?: unknown[];
};

export type ManagedSaleRequestChecklistApi = Record<string, unknown> & {
  id: string;
  createdAt?: string;
};

export type ApproveAndListBody = {
  adminNotes?: string | null;
  userFacingNotes?: string | null;
};

export type PatchStatusBody = {
  status: ManagedSaleRequestStatus | string;
  userFacingNotes?: string | null;
  adminNotes?: string | null;
  recurringAvailability?: unknown;
  recurring_availability?: unknown;
};

export type UpdateAvailabilityBody = {
  recurringAvailability?: unknown;
  recurring_availability?: unknown;
};

const managedSaleRequestService = {
  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ManagedSaleRequestStatus | string;
  }) => {
    const res = await api.get<ListManagedSaleRequestsResponse>("/api/admin/managed-sale-requests", { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}`
    );
    return res.data;
  },

  adminPatch: async (id: string, formData: FormData) => {
    const res = await api.patch<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },

  delete: async (id: string, params?: { deleteVehicle?: boolean }) => {
    const res = await api.delete<{ success: boolean }>(`/api/admin/managed-sale-requests/${id}`, { params });
    return res.data;
  },

  approveAndList: async (id: string, body: ApproveAndListBody) => {
    const res = await api.post<{ success: boolean } & Record<string, unknown>>(
      `/api/admin/managed-sale-requests/${id}/approve-list`,
      body
    );
    return res.data;
  },

  patchStatus: async (id: string, body: PatchStatusBody) => {
    const res = await api.patch<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/status`,
      body
    );
    return res.data;
  },

  getChecklistAttached: async (id: string) => {
    const res = await api.get<{ success: boolean; checklists: ManagedSaleRequestChecklistApi[] }>(
      `/api/admin/managed-sale-requests/${id}/checklist-attached`
    );
    return res.data;
  },

  updateAvailability: async (id: string, body: UpdateAvailabilityBody) => {
    const res = await api.patch<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/availability`,
      body
    );
    return res.data;
  },

  markSold: async (id: string) => {
    const res = await api.patch<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/mark-sold`
    );
    return res.data;
  },

  approveCancellation: async (id: string) => {
    const res = await api.post<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/cancellation/approve`
    );
    return res.data;
  },

  declineCancellation: async (id: string, body: { reason: string }) => {
    const res = await api.post<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/cancellation/decline`,
      body
    );
    return res.data;
  },

  approveEditRequest: async (id: string, index: number, body?: { adminNotes?: string | null }) => {
    const res = await api.post<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/edit-requests/${index}/approve`,
      body ?? {}
    );
    return res.data;
  },

  declineEditRequest: async (id: string, index: number, body: { reason: string }) => {
    const res = await api.post<{ success: boolean; request: ManagedSaleRequestDetailApi }>(
      `/api/admin/managed-sale-requests/${id}/edit-requests/${index}/decline`,
      body
    );
    return res.data;
  },
};

export default managedSaleRequestService;


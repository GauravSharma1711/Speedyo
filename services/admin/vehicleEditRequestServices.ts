import api from "@/lib/axios";

export type VehicleEditRequestStatus = "pending" | "approved" | "declined";

export type VehicleEditRequestApi = {
  id: string;
  createdAt: string;
  updatedAt: string;
  vehicleId: string;
  requestedByUserId: string;
  requested_changes: Record<string, unknown>;
  reason: string;
  status: VehicleEditRequestStatus;
  admin_notes: string | null;
  processed_by_admin: string | null;
  processed_at: string | null;
  requestedByUser: {
    id: string;
    email: string;
    full_name: string;
    profile_image: string | null;
    user_type: string;
  };
  vehicle: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: string;
    mileage: number;
    condition: string;
    location: string;
    status: string;
    primary_image: string | null;
    featured: boolean;
    verified: boolean;
    website_managed: boolean;
  } | null;
};

export type ListVehicleEditRequestsResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  requests: VehicleEditRequestApi[];
};

export type UpdateVehicleEditRequestBody = {
  status: "approved" | "declined";
  admin_notes?: string;
  apply_changes?: boolean;
};

export type UpdateVehicleEditRequestResponse = {
  success: boolean;
  updatedRequest: VehicleEditRequestApi;
  updatedVehicle: unknown | null;
  changesWereApplied: boolean;
};

const vehicleEditRequestService = {
  list: async (params?: { page?: number; limit?: number; status?: VehicleEditRequestStatus }) => {
    const res = await api.get<ListVehicleEditRequestsResponse>("/api/admin/vehicles/edit-requests", { params });
    return res.data;
  },

  update: async (requestId: string, body: UpdateVehicleEditRequestBody) => {
    const res = await api.patch<UpdateVehicleEditRequestResponse>(
      `/api/admin/vehicles/edit-requests/${requestId}`,
      body
    );
    return res.data;
  },
};

export default vehicleEditRequestService;


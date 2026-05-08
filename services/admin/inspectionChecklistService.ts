import api from "@/lib/axios";

export type ChecklistApi = {
  id: string;
  createdAt: string;
  updatedAt: string;
  date_of_inspection: string;
  inspector_name: string;
  dealership_name: string | null;
  warranty: string | null;
  repair_service_details: string | null;
  verified_by_speedio: string | null;
  dealership_representative: string | null;
  inspection_notes: string | null;
  overall_condition: string | null;
  recommended_sale_price: string | number | null;
  vehicle_info: Record<string, unknown>;
  exterior_condition: unknown[];
  interior_condition: unknown[];
  engine_mechanical: unknown[];
  documentation: unknown[];
  photos_media: unknown[];
  managedSaleRequestId: string | null;
  managedSaleRequest: {
    id: string;
    status: string;
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: string | null;
  } | null;
};

export type CreateChecklistBody = {
  date_of_inspection: string;       
  inspector_name: string;
  dealership_name?: string;
  warranty?: string;
  repair_service_details?: string;
  verified_by_speedio?: string;
  dealership_representative?: string;
  inspection_notes?: string;
  overall_condition?: string;
  recommended_sale_price?: number | null;
  vehicle_info?: Record<string, unknown>;
  exterior_condition?: unknown[];
  interior_condition?: unknown[];
  engine_mechanical?: unknown[];
  documentation?: unknown[];
  photos_media?: unknown[];
  managedSaleRequestId?: string | null;
};

const inspectionChecklistService = {
  list: async (params?: { search?: string; managedSaleRequestId?: string; page?: number; limit?: number }) => {
    const res = await api.get<{ success: boolean; page: number; limit: number; total: number; items: ChecklistApi[] }>(
      "/api/admin/inspection-checklists",
      { params }
    );
    return res.data;
  },

  create: async (body: CreateChecklistBody) => {
    const res = await api.post<{ success: boolean; checklist: ChecklistApi }>(
      "/api/admin/inspection-checklists",
      body
    );
    return res.data;
  },

  update: async (id: string, body: Partial<CreateChecklistBody>) => {
    const res = await api.patch<{ success: boolean; checklist: ChecklistApi }>(
      `/api/admin/inspection-checklists/${id}`,
      body
    );
    return res.data;
  },

  delete: async (id: string) => {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/api/admin/inspection-checklists/${id}`
    );
    return res.data;
  },

  linkMSR: async (id: string, managedSaleRequestId: string | null) => {
    const res = await api.patch<{ success: boolean; checklist: ChecklistApi }>(
      `/api/admin/inspection-checklists/${id}/link-msr`,
      { managedSaleRequestId }
    );
    return res.data;
  },
};

export default inspectionChecklistService;
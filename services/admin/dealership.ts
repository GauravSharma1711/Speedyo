import api from "@/lib/axios";

export type CreateDealershipAgreementData = {
  dealership_name: string;
  representative_name: string;
  email: string;
  address?: string;
  phone?: string;
  license_number?: string;
  service_fee_amount?: string; // Decimal as string
  admin_notes?: string;
};

export type UpdateDealershipAgreementData = {
  dealership_name?: string;
  representative_name?: string;
  email?: string;
  address?: string;
  phone?: string;
  license_number?: string;
  service_fee_amount?: string;
  status?: string;
  admin_notes?: string;
  agreement_url?: string;
};

const dealershipAgreementService = {
  getAll: async () => {
    const res = await api.get("/api/admin/dealership-agreements");
    return res.data;
  },

  create: async (data: CreateDealershipAgreementData) => {
    const res = await api.post("/api/admin/dealership-agreements", data);
    return res.data;
  },

  update: async (agreementId: string, data: UpdateDealershipAgreementData) => {
    const res = await api.patch(
      `/api/admin/dealership-agreements/${agreementId}`,
      data
    );
    return res.data;
  },

  delete: async (agreementId: string) => {
    const res = await api.delete(
      `/api/admin/dealership-agreements/${agreementId}`
    );
    return res.data;
  },
};

export default dealershipAgreementService;
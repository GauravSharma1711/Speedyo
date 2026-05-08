import api from "@/lib/axios";

export type SubmitManagedSaleRequestResponse = {
  success: boolean;
  message?: string;
  managedSaleRequest?: unknown;
  error?: string;
};

export const managedSaleRequestService = {
  submit: async (formData: FormData) => {
    const res = await api.post<SubmitManagedSaleRequestResponse>(
      "/api/user/requestManagedSaleService",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data;
  },
};

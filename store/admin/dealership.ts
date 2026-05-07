import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import dealershipAgreementService, {
  CreateDealershipAgreementData,
  UpdateDealershipAgreementData,
} from "@/services/admin/dealership";


export type DealershipAgreement = {
  id: string;
  createdAt: string;
  updatedAt: string;
  dealership_name: string;
  representative_name: string;
  email: string;
  address: string | null;
  phone: string | null;
  license_number: string | null;
  service_fee_amount: string | null; 
  status: string;                   
  agreement_url: string | null;
  agreement_accepted: boolean;
  signed_by_name: string | null;
  signed_at: string | null;
  created_by_admin_id: string | null;
  admin_notes: string | null;
};


interface DealershipAgreementState {
  agreements: DealershipAgreement[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  create: (data: CreateDealershipAgreementData) => Promise<void>;
  update: (agreementId: string, data: UpdateDealershipAgreementData) => Promise<void>;
  delete: (agreementId: string) => Promise<void>;
}


export const useDealershipAgreementStore = create<DealershipAgreementState>()(
  immer((set) => ({
    agreements: [],
    isLoading: false,
    error: null,

    clearError() {
      set({ error: null });
    },

    async getAll() {
      set({ isLoading: true, error: null });
      try {
        const res = await dealershipAgreementService.getAll();
        // API should return { agreements: DealershipAgreement[] }
        set({ agreements: res.agreements, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ??
            "Failed to fetch dealership agreements",
        });
        throw error;
      }
    },

    async create(data) {
      set({ isLoading: true, error: null });
      try {
        const res = await dealershipAgreementService.create(data);
        // API should return { agreement: DealershipAgreement }
        set((state) => {
          state.agreements.unshift(res.agreement);
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ??
            "Failed to create dealership agreement",
        });
        throw error;
      }
    },

    async update(agreementId, data) {
      set({ isLoading: true, error: null });
      try {
        const res = await dealershipAgreementService.update(agreementId, data);
        // API should return { agreement: DealershipAgreement }
        set((state) => {
          const index = state.agreements.findIndex((a) => a.id === agreementId);
          if (index !== -1) state.agreements[index] = res.agreement;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ??
            "Failed to update dealership agreement",
        });
        throw error;
      }
    },

    async delete(agreementId) {
      set({ isLoading: true, error: null });
      try {
        await dealershipAgreementService.delete(agreementId);
        set((state) => {
          state.agreements = state.agreements.filter((a) => a.id !== agreementId);
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ??
            "Failed to delete dealership agreement",
        });
        throw error;
      }
    },
  }))
);
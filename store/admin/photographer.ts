import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import photographerAgreementService, {
  CreatePhotographerAgreementData,
} from "@/services/admin/photographer";

export type PhotographerAgreement = {
  id: string;
  createdAt: string;
  updatedAt: string;
  agreement_title: string;
  position_title: string;
  fixed_percentage: string;
  termination_notice_days: number;
  agreement_start_date: string | null;
  agreement_end_date: string | null;
  status: string;
  agreement_url: string | null;
  created_by_admin_id: string | null;
  admin_notes: string | null;
  photographer_email: string;
  application_id: string | null;
  application: PhotographerApplication | null;
};

export type PhotographerApplication = {
  id: string;
  createdAt: string;
  updatedAt: string;
  full_name: string;
  email: string;
  phone: string;
  photography_experience_years: number;
  motivation: string;
  address: string | null;
  automotive_photography_experience: string | null;
  portfolio_url: string | null;
  equipment: string | null;
  availability: string | null;
  location_preferences: string | null;
  sample_work_urls: string[];
  status: string;
  admin_notes: string | null;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
};

export interface PhotographerAgreementState {
  agreements: PhotographerAgreement[];
  agreement: PhotographerAgreement | null;
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  getAgreementById: (id: string) => Promise<void>;
  create: (data: CreatePhotographerAgreementData) => Promise<void>;
  delete: (agreementId: string) => Promise<void>;
  addApplication: (agreementId: string, data: FormData) => Promise<void>;
  sendSigningMail: (agreementId: string) => Promise<void>;
}

// ✅ Key fix: explicitly type the slice so immer correctly infers the return type
type PhotographerAgreementSlice = StateCreator<
  PhotographerAgreementState,
  [["zustand/immer", never]],
  [],
  PhotographerAgreementState
>;

const createStore: PhotographerAgreementSlice = (set) => ({
  agreements: [],
  agreement: null,
  isLoading: false,
  error: null,

  clearError() {
    set({ error: null });
  },

  async getAll() {
    set({ isLoading: true, error: null });
    try {
      const res = await photographerAgreementService.getAll();
      set({ agreements: res.agreements, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ??
          "Failed to fetch photographer agreements",
      });
      throw error;
    }
  },

  async create(data) {
    set({ isLoading: true, error: null });
    try {
      const res = await photographerAgreementService.create(data);
      set((state) => {
        state.agreements.unshift(res.agreement);
        state.isLoading = false;
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ??
          "Failed to create photographer agreement",
      });
      throw error;
    }
  },

  async delete(agreementId) {
    set({ isLoading: true, error: null });
    try {
      await photographerAgreementService.delete(agreementId);
      set((state) => {
        state.agreements = state.agreements.filter(
          (a) => a.id !== agreementId
        );
        state.isLoading = false;
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ??
          "Failed to delete photographer agreement",
      });
      throw error;
    }
  },

  async addApplication(agreementId, data) {
    set({ isLoading: true, error: null });
    try {
      const res = await photographerAgreementService.addApplication(
        agreementId,
        data
      );
      set((state) => {
        const index = state.agreements.findIndex((a) => a.id === agreementId);
        if (index !== -1 && res.agreement) {
          state.agreements[index] = res.agreement;
        }
          if (state.agreement?.id === agreementId && res.agreement) {
        state.agreement = res.agreement;
      }
        state.isLoading = false;
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ??
          "Failed to add application to agreement",
      });
      throw error;
    }
  },

  async sendSigningMail(agreementId) {
    set({ isLoading: true, error: null });
    try {
      const res = await photographerAgreementService.sendSigningMail(agreementId);
      set({ isLoading: false });
      return res;
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ??
          "Failed to send agreement form mail",
      });
      throw error;
    }
  },

  async getAgreementById(id) {
    set({ isLoading: true, error: null });
    try {
      const res = await photographerAgreementService.getAgreementById(id);
      set({ agreement: res.agreement, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error?.response?.data?.message ??
          "Failed to fetch agreement",
      });
      throw error;
    }
  },
});

export const usePhotographerAgreementStore =
  create<PhotographerAgreementState>()(immer(createStore));
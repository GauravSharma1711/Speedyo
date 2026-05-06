import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import lisisonAgreementService, {
  CreateLiaisonAgreementData,
  AddApplicationToAgreementData,
} from "@/services/admin/liaison";
import { User } from "../auth";



export type liaisonAgreement = {
  id: string;
  createdAt: string;
  updatedAt: string;
  agreement_title: string;
  position_title: string;
  fixed_fee_percentage: string;
  residual_pay_percentage:string;
  termination_notice_days: number;
  agreement_start_date: string | null;
  agreement_end_date: string | null;
  status: string;
  agreement_url: string | null;
  created_by_admin_id: string | null;
  admin_notes: string | null;
  photographer_email: string;
  application_id: string | null;
  application: liaisonApplication | null;
};



export type liaisonApplication = {
  id: string;
  createdAt: string;
  updatedAt: string;
  full_name: string;
  email: string;
  phone: string;
  language_proficiency: string;
  motivation: string;
  address: string | null;
  previous_experience: string | null;
  automotive_knowledge: string | null;
  availability: string | null;
  resume_url: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by_admin_id: string | null;
  reviewed_at: string | null;
  liaisonAgreement:liaisonAgreement
  reviewedByAdmin:User
};

interface liaisonAgreementState {
  agreements: liaisonAgreement[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  create: (data: CreateLiaisonAgreementData) => Promise<void>;
  delete: (agreementId: string) => Promise<void>;
  addApplication: (
    agreementId: string,
    data: AddApplicationToAgreementData
  ) => Promise<void>;
}

export const useLiaisonAgreementStore =
  create<liaisonAgreementState>()(
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
          const res = await lisisonAgreementService.getAll();
          set({ agreements: res.liaisonAgreements, isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.response?.data?.message ??
              "Failed to fetch liaison agreements",
          });
          throw error;
        }
      },

      async create(data) {
        set({ isLoading: true, error: null });
        try {
          const res = await lisisonAgreementService.create(data);
          set((state) => {
            state.agreements.unshift(res.agreement);
          });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.response?.data?.message ??
              "Failed to create liaison agreement",
          });
          throw error;
        }
      },

      async delete(agreementId) {
        set({ isLoading: true, error: null });
        try {
          await lisisonAgreementService.delete(agreementId);
          set((state) => {
            state.agreements = state.agreements.filter(
              (a) => a.id !== agreementId
            );
          });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error:
              error?.response?.data?.message ??
              "Failed to delete liaison agreement",
          });
          throw error;
        }
      },

      async addApplication(agreementId, data) {
        set({ isLoading: true, error: null });
        try {
          const res =
            await lisisonAgreementService.addApplication(
              agreementId,
              data
            );
          set((state) => {
            const index = state.agreements.findIndex(
              (a) => a.id === agreementId
            );
            if (index !== -1) state.agreements[index] = res.agreement;
          });
          set({ isLoading: false });
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
    }))
  );
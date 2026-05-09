import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import transferService from "@/services/admin/transfer";

export type Transfer = {
  id: string;
  vehicleId: string;
  buyerId: string;
  sellerId?: string;
  transfer_type: string;
  admin_notes: string;
  user_facing_notes: string;
  current_step?: string;
  steps_completed?: number[];
  status: string;
   createdAt: string;
  vehicle?: { id: string; title: string };
  buyer?: { id: string; full_name: string; email: string };
  seller?: { id: string; full_name: string; email: string }
};

export type CreateTransferData = {
  vehicleId: string;
  buyerId: string;
  sellerId?: string;
  transfer_type: string;
  admin_notes: string;
  user_facing_notes: string;
};

export type UpdateTransferData = {
  steps_completed?: number[];
  status?: string;
  admin_notes?: string;
  user_facing_notes?: string;
};

interface TransferState {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  create: (data: CreateTransferData) => Promise<void>;
  update: (transferId: string, data: UpdateTransferData) => Promise<void>;
  getAll: () => Promise<void>;
}

export const useTransferStore = create<TransferState>()( 

    immer((set) => ({
      transfers: [],
      isLoading: false,
      error: null,

      clearError() {
        set({ error: null });
      },

      async create(data: CreateTransferData) {  
        set({ isLoading: true, error: null });
        try {
          const res = await transferService.create(data);
          set({ isLoading: false });
          return res;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Failed to create transfer",
          });
          throw error;
        }
      },

      async update(transferId: string, data: UpdateTransferData) { 
        set({ isLoading: true, error: null });
        try {
          const res = await transferService.update(transferId, data);
          set({ isLoading: false });
          return res;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Failed to update transfer",
          });
          throw error;
        }
      },

      async getAll() {  // fix: missing async
        set({ isLoading: true, error: null });
        try {
          const res = await transferService.getAll();
         
          set({ transfers: res.transfers, isLoading: false });  
        } catch (error: any) {
          set({
            isLoading: false,
            error: error?.response?.data?.message ?? "Failed to fetch transfers",
          });
          throw error;
        }
      },
    })),
   
);
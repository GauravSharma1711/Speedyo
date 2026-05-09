

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import vehicleListingService from "@/services/admin/vehicleListing";

export type Vehicle = {
  id: string;
  createdAt: string;
  dealershipAgreement:{
    id: string;
    dealership_name: string;
  }
  updatedAt: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage?: number | null;
  condition?: string | null;
  description?: string | null;
  location?: string | null;
  fuel_type?: string | null;
  transmission?: string | null;
  primary_image?: string | null;
  primary_image_thumbnail?: string | null;
  primary_image_small?: string | null;   
  images: string[];
  verified: boolean;
  featured: boolean;
  website_managed: boolean;             
  status: string;
  views: number;
  authorId?: string | null;
  dealershipAgreementId?: string | null;
  dealership_name?: string | null;       
  recurring_availability?: any[];        
  author?: { id: string; full_name: string; email: string } | null;
};

export type UpdateVehicleData = {
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  condition?: string;
  description?: string;
  location?: string;
  fuel_type?: string;
  transmission?: string;
  status?: "available" | "sold";
  images?: string[]; 
  primary_image?: string | null; 
};

export type ManageAvailabilityData = {
  requested_date: string;
  requested_time: string;
  additional_notes?: string;
}[];

interface VehicleListingState {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  update: (vehicleId: string, data: FormData) => Promise<void>;
  remove: (vehicleId: string) => Promise<void>;
  toggleFeatured: (vehicleId: string) => Promise<void>;
  markSold: (vehicleId: string) => Promise<void>;
  associateDealership: (vehicleId: string, dealershipId: string) => Promise<void>;
  removeDealershipAssociation: (vehicleId: string) => Promise<void>;
  manageTestDriveAvailability: (vehicleId: string, data: ManageAvailabilityData) => Promise<void>;
}

export const useVehicleListingStore = create<VehicleListingState>()(
  immer((set) => ({
    vehicles: [],
    isLoading: false,
    error: null,

    clearError() {
      set({ error: null });
    },

    async getAll() {
      set({ isLoading: true, error: null });
      try {
        const res = await vehicleListingService.getAll();
        set({ vehicles: res.vehicles ?? [], isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to fetch vehicles",
        });
        throw error;
      }
    },

    async update(vehicleId, data) {
      set({ isLoading: true, error: null });
      try {
        const res = await vehicleListingService.update(vehicleId, data);
        set((state) => {
          const index = state.vehicles.findIndex((v) => v.id === vehicleId);
          if (index !== -1) state.vehicles[index] = res.vehicle;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to update vehicle",
        });
        throw error;
      }
    },

    async remove(vehicleId) {
      set({ isLoading: true, error: null });
      try {
        await vehicleListingService.delete(vehicleId);
        set((state) => {
          state.vehicles = state.vehicles.filter((v) => v.id !== vehicleId);
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to delete vehicle",
        });
        throw error;
      }
    },

    async toggleFeatured(vehicleId) {
      set({ isLoading: true, error: null });
      try {
        const res = await vehicleListingService.toggleFeatured(vehicleId);
        set((state) => {
          const index = state.vehicles.findIndex((v) => v.id === vehicleId);
          if (index !== -1) state.vehicles[index] = res.vehicle;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to toggle featured",
        });
        throw error;
      }
    },

    async markSold(vehicleId) {
      set({ isLoading: true, error: null });
      try {
        const res = await vehicleListingService.markSold(vehicleId);
        set((state) => {
          const index = state.vehicles.findIndex((v) => v.id === vehicleId);
          if (index !== -1) state.vehicles[index] = res.vehicle;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to mark as sold",
        });
        throw error;
      }
    },

    async associateDealership(vehicleId, dealershipId) {
      set({ isLoading: true, error: null });
      try {
        const res = await vehicleListingService.associateDealership(vehicleId, dealershipId);
        set((state) => {
          const index = state.vehicles.findIndex((v) => v.id === vehicleId);
          if (index !== -1) state.vehicles[index] = res.vehicle;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to associate dealership",
        });
        throw error;
      }
    },

    async removeDealershipAssociation(vehicleId) {
  set({ isLoading: true, error: null });
  try {
    const res = await vehicleListingService.removeDealershipAssociation(vehicleId);
    set((state) => {
      const idx = state.vehicles.findIndex((v) => v.id === vehicleId);
      if (idx !== -1) state.vehicles[idx] = res.vehicle;
    });
    set({ isLoading: false });
  } catch (error: any) {
    set({
      isLoading: false,
      error: error?.response?.data?.message ?? "Failed to remove dealership association",
    });
    throw error;
  }
},

    async manageTestDriveAvailability(vehicleId, data) {
      set({ isLoading: true, error: null });
      try {
      const res = await vehicleListingService.manageTestDriveAvailability(vehicleId, data);
set((state) => {
  const idx = state.vehicles.findIndex((v) => v.id === vehicleId);
  if (idx !== -1) {
    state.vehicles[idx].recurring_availability = res.vehicle.recurring_availability;
  }
});
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to manage test drive availability",
        });
        throw error;
      }
    },
  }))
);
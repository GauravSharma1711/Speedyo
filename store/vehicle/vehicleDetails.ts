import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { vehicleDetailsService } from "@/services/vehicle/vehicleDetailsServices";
import { publicManagedSaleService } from "@/services/managedSales/publicManagedSaleServices";
import type { VehicleDetailsApi, SellerProfileApi } from "@/services/vehicle/vehicleDetailsServices";
import type { PublicManagedSaleByVehicle } from "@/services/managedSales/publicManagedSaleServices";

type VehicleDetailsState = {
  vehicle: VehicleDetailsApi | null;
  seller: SellerProfileApi | null;
  msr: PublicManagedSaleByVehicle | null;
 sellerVehicles: SellerVehicleSummary[]; 
   isSellerVehiclesLoading: boolean; 
  isLoading: boolean;
  isSellerLoading: boolean;
  isMsrLoading: boolean;
  error: string | null;
};

export type SellerVehicleSummary = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string;
  mileage: number | null;
  condition: string | null;
  status: string;
  verified: boolean;
  featured: boolean;
  views: number;
  primary_image: string | null;
  primary_image_thumbnail: string | null;
  location: string | null;
  fuel_type: string | null;
  transmission: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    vehicleLikes: number;
    vehicleSaves: number;
    testDriveRequests: number;
  };
}

type VehicleDetailsActions = {
  fetchVehicle: (vehicleId: string) => Promise<void>;
  fetchSellerVehicles:()=>Promise<void>;
  incrementViews: (vehicleId: string) => Promise<void>;
  fetchSeller: (vehicleId: string) => Promise<void>;
  fetchMsrByVehicle: (vehicleId: string) => Promise<void>;
  clear: () => void;
};

export const useVehicleDetailsStore = create<VehicleDetailsState & VehicleDetailsActions>()(
  immer((set, get) => ({
    vehicle: null,
    seller: null,
    msr: null,
  sellerVehicles: [],  
    isLoading: false,
    isSellerLoading: false,
    isMsrLoading: false,
    error: null,
    isSellerVehiclesLoading: false, 

    clear: () =>
      set((s) => {
        s.vehicle = null;
        s.seller = null;
        s.msr = null;
        s.isLoading = false;
        s.isSellerLoading = false;
        s.isMsrLoading = false;
        s.error = null;
      }),

    fetchVehicle: async (vehicleId) => {
      if (get().isLoading) return;
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });
      try {
        const res = await vehicleDetailsService.getById(vehicleId);
        set((s) => {
          s.vehicle = res.vehicle;
        });
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to load vehicle")
            : e instanceof Error
              ? e.message
              : "Failed to load vehicle";
        set((s) => {
          s.error = msg;
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },

     fetchSellerVehicles: async () => {
      if (get().isSellerVehiclesLoading) return;
      set((s) => {
        s.isSellerVehiclesLoading = true;
      });
      try {
        const res = await vehicleDetailsService.getSellerVehicles();
        set((s) => {
          s.sellerVehicles = res.vehicles;
        });
      } catch (e) {
        set((s) => {
          s.sellerVehicles = [];
        });
      } finally {
        set((s) => {
          s.isSellerVehiclesLoading = false;
        });
      }
    },

    incrementViews: async (vehicleId) => {
      try {
        const res = await vehicleDetailsService.incrementViews({ vehicleId });
        set((s) => {
          if (s.vehicle && s.vehicle.id === vehicleId) {
            s.vehicle.views = res.newViewCount;
          }
        });
      } catch {
        // ignore
      }
    },

    fetchSeller: async (vehicleId) => {
      if (get().isSellerLoading) return;
      set((s) => {
        s.isSellerLoading = true;
      });
      try {
        const res = await vehicleDetailsService.getSellerProfile(vehicleId);
        set((s) => {
          s.seller = res.seller ?? null;
        });
      } catch {
        set((s) => {
          s.seller = null;
        });
      } finally {
        set((s) => {
          s.isSellerLoading = false;
        });
      }
    },

    fetchMsrByVehicle: async (vehicleId) => {
      if (get().isMsrLoading) return;
      set((s) => {
        s.isMsrLoading = true;
      });
      try {
        const res = await publicManagedSaleService.getByVehicleId(vehicleId);
        set((s) => {
          s.msr = res.msr ?? null;
        });
      } catch {
        set((s) => {
          s.msr = null;
        });
      } finally {
        set((s) => {
          s.isMsrLoading = false;
        });
      }
    },
  }))
);


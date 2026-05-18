import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { messageService, vehicleTransferService, managedSaleService, publicUserService, recentlyViewedService, vehicleService } from "@/services/dashboard";
import type { Conversation, VehicleTransfer, ManagedSaleRequest, PublicUser, RecentlyViewedVehicle } from "@/services/dashboard";
import api from "@/lib/axios";


export type GuestDashboardVehicle = {
    isDirectListing: boolean; 
  id: string;
  created_by?: string;
  created_by_id?: string;
  title?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  price?: number | null;
  status?: string | null;
  recurring_availability?: Record<string, any> | null;
  primary_image?: string | null;
  primary_image_thumbnail?: string | null;
  views?: number | null;
  likes_count?: number | null;
  saves_count?: number | null;
  condition?: string | null;
  mileage?: number | null;
  location?: string | null;
  verified?: boolean | null;
  featured?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  edit_requests?: Array<Record<string, any>>;
  website_managed?: boolean;
};

interface GuestDashboardState {
  conversations: Conversation[];
  transfers: VehicleTransfer[];
  managedSales: ManagedSaleRequest[];
  sellers: PublicUser[];
  recentlyViewed: RecentlyViewedVehicle[];
  isLoading: boolean;
  error: string | null;
  directListings: GuestDashboardVehicle[];
  loadGuestDashboard: (userId: string) => Promise<void>;

}

export const useGuestDashboardStore = create<GuestDashboardState>()(
  immer((set) => ({
    conversations: [],
    directListings:[],
    transfers: [],
    managedSales: [],
    sellers: [],
    recentlyViewed: [],
    isLoading: true,
    error: null,

      async loadGuestDashboard(_userId: string) {
      set({ isLoading: true, error: null });
      try {
        const [directListings, conversations, transfers, managedSales, sellers, recentlyViewed] = await Promise.all([
          vehicleService.getDirectListings(),   
          messageService.getConversations(),
          vehicleTransferService.listByBuyer(_userId),
          managedSaleService.listByUser(_userId),
          publicUserService.list(),
          recentlyViewedService.list(20),
        ]);
        set({ directListings, conversations, transfers, managedSales, sellers, recentlyViewed, isLoading: false });
      } catch (error: any) {
        set({ isLoading: false, error: error?.message ?? "Failed to load guest dashboard" });
      }
    },
  }))
);
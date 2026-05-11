import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { messageService, vehicleTransferService, managedSaleService, publicUserService, recentlyViewedService } from "@/services/dashboard";
import type { Conversation, VehicleTransfer, ManagedSaleRequest, PublicUser, RecentlyViewedVehicle } from "@/services/dashboard";

interface GuestDashboardState {
  conversations: Conversation[];
  transfers: VehicleTransfer[];
  managedSales: ManagedSaleRequest[];
  sellers: PublicUser[];
  recentlyViewed: RecentlyViewedVehicle[];
  isLoading: boolean;
  error: string | null;

  loadGuestDashboard: (userId: string) => Promise<void>;
}

export const useGuestDashboardStore = create<GuestDashboardState>()(
  immer((set) => ({
    conversations: [],
    transfers: [],
    managedSales: [],
    sellers: [],
    recentlyViewed: [],
    isLoading: true,
    error: null,

    async loadGuestDashboard(_userId: string) {
      set({ isLoading: true, error: null });
      try {
        const [conversations, transfers, managedSales, sellers, recentlyViewed] = await Promise.all([
          messageService.getConversations(),
          vehicleTransferService.listByBuyer(_userId),
          managedSaleService.listByUser(_userId),
          publicUserService.list(),
          recentlyViewedService.list(20),
        ]);
        set({ conversations, transfers, managedSales, sellers, recentlyViewed, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.message ?? "Failed to load guest dashboard",
        });
      }
    },
  }))
);

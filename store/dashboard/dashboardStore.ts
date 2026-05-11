import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { userService, vehicleService, managedSaleService, messageService, vehicleTransferService } from "@/services/dashboard";
import type { DashboardUser, DashboardVehicle, ManagedSaleRequest, DashboardMessage, VehicleTransfer, Conversation } from "@/services/dashboard";

interface DashboardState {
  user: DashboardUser | null;
  vehicles: DashboardVehicle[];
  managedSales: ManagedSaleRequest[];
  conversations: Conversation[];
  testDrives: DashboardMessage[];
  transfers: VehicleTransfer[];
  isLoading: boolean;
  error: string | null;

  loadDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  immer((set, get) => ({
    user: null,
    vehicles: [],
    managedSales: [],
    conversations: [],
    testDrives: [],
    transfers: [],
    isLoading: true,
    error: null,

    async loadDashboard() {
      set({ isLoading: true, error: null });
      try {
        const user = await userService.me();

        const [vehicles, managedSales, conversations, transfers] = await Promise.all([
          vehicleService.listMyVehicles(user.id),
          managedSaleService.listByUser(user.id),
          messageService.getConversations(),
          vehicleTransferService.listByBuyer(user.id),
        ]);

        const testDrives = conversations.filter(
          (c) => c.last_message_type === "test_drive_request" || c.messages?.[0]?.message_type === "test_drive_request"
        );

        set({
          user,
          vehicles,
          managedSales,
          conversations,
          testDrives,
          transfers,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? error?.message ?? "Failed to load dashboard",
        });
      }
    },
  }))
);

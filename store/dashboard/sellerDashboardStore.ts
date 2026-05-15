import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { managedSaleService, userService, vehicleService, messageService, publicUserService, vehicleTransferService } from "@/services/dashboard";
import { sellerPerformanceService, testDriveRequestService, sellerTransferService, sellerAnalyticsService } from "@/services/seller";
import type { ManagedSaleRequest, DashboardUser, DashboardVehicle, Conversation, PublicUser } from "@/services/dashboard";
import type { SellerPerformance, TestDriveRequestData, SellerTransfer } from "@/services/seller";

export type ManagedSaleVehicle = {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  status: string;
  primary_image: string | null;
  createdAt: string | Date | null;
  website_managed: boolean;
  views?: number;
};

interface SellerDashboardState {
  user: DashboardUser | null;
  performance: SellerPerformance | null;
  testDrives: TestDriveRequestData[];
  sellerTransfers: SellerTransfer[];
  buyerTransfers: any[];
  managedSaleRequests: ManagedSaleRequest[];
  managedSaleVehicles: ManagedSaleVehicle[];
  listings: DashboardVehicle[];
sentTestDrives: TestDriveRequestData[];
  messages: Conversation[];
  buyers: PublicUser[];
  stats: {
    totalListings: number;
    totalViews: number;
    activeListings: number;
    avgPrice: number;
    totalInquiries: number;
    thisWeekViews: number;
      viewsTrend: number;
  listingsTrend: number;
  inquiriesTrend: number;   
  };
  isLoading: boolean;
  error: string | null;

  loadSellerDashboard: () => Promise<void>;
}

export const useSellerDashboardStore = create<SellerDashboardState>()(
  immer((set, get) => ({
    user: null,
    performance: null,
    testDrives: [],
    sentTestDrives: [],
    sellerTransfers: [],
    buyerTransfers: [],
    managedSaleRequests: [],
    managedSaleVehicles: [],
    listings: [],
    messages: [],
    buyers: [],
    stats: {
      totalListings: 0,
      totalViews: 0,
      activeListings: 0,
      avgPrice: 0,
      totalInquiries: 0,
      thisWeekViews: 0,
            viewsTrend: 0,
  listingsTrend: 0,
  inquiriesTrend: 0,
    },
    isLoading: false,
    error: null,

    async loadSellerDashboard() {
      set({ isLoading: true, error: null });
      try {
        const [user, performance,  testDrives, sentTestDrives, sellerTransfers, managedSaleRequests, listings, messages, buyers, analytics] =
          await Promise.all([
            userService.me(),
            sellerPerformanceService.get("week"),
             testDriveRequestService.listByRole("seller"),
            testDriveRequestService.listByRole("buyer"),    
            sellerTransferService.list(),
            managedSaleService.listByUser("me"),
            vehicleService.listMyVehicles("me"),
            messageService.getConversations(),
            publicUserService.list(),
            sellerAnalyticsService.get().catch(() => null),
          ]);

        const buyerTransfers = await vehicleTransferService.listByBuyer(user.id);

        const managedSaleVehicles = managedSaleRequests.map((req: any) => {
          // Handle both flat API response and nested vehicle_details
          const vehicleInfo = req.vehicle_details || {
            title: req.vehicle_title || req.vehicle_make || "Managed Sale Vehicle",
            year: req.vehicle_year,
            make: req.vehicle_make,
            model: req.vehicle_model,
          };
          const priceInfo = req.vehicle_details
            ? {
                buyer_price: req.vehicle_details.final_sale_price_for_buyer || req.vehicle_details.seller_asking_price,
              }
            : {
                buyer_price: req.final_sale_price_for_buyer || req.seller_asking_price,
              };

          return {
            id: req.id,
            title: vehicleInfo.title,
            price: priceInfo.buyer_price ? parseFloat(priceInfo.buyer_price) : 0,
            location: req.vehicle_location || vehicleInfo.location || "",
            description: req.vehicle_description || vehicleInfo.description || "",
            status: req.status === "listed" ? "available" : req.status,
            primary_image: (req.vehicle_images || req.vehicle_images_medium)?.[0]
              ? `/managed-sales/${(req.vehicle_images || req.vehicle_images_medium)[0].split("/").pop()}`
              : null,
            createdAt: req.createdAt || req.created_date,
            website_managed: true,
          };
        });

        const allVehicles = listings;
        const totalViews = analytics?.total_views?.all_time ?? allVehicles.reduce((sum, v) => sum + (v.views || 0), 0);
        const activeListings = analytics?.active_listings?.count ?? allVehicles.filter((v) => v.status === "available").length;
        const avgPrice = analytics?.avg_list_price ?? (allVehicles.length > 0
            ? allVehicles.reduce((sum, v) => sum + (v.price || 0), 0) / allVehicles.length
            : 0);
        const totalInquiries = analytics?.test_drive_requests?.all_time ?? testDrives.length;
        const thisWeekViews = analytics?.total_views?.this_week ?? Math.floor(totalViews * 0.3);

                 const viewsTrend= analytics?.total_views.trend
  const listingsTrend= analytics?.active_listings.trend
  const inquiriesTrend= analytics?.test_drive_requests.trend

        set({
          user,
          performance,
          testDrives,
            sentTestDrives,   
          sellerTransfers,
          buyerTransfers,
          managedSaleRequests,
          managedSaleVehicles,
          listings,
          messages,
          buyers,
          stats: {
            totalListings: listings.length + managedSaleVehicles.length,
            totalViews,
            activeListings,
            avgPrice,
            totalInquiries,
            thisWeekViews,
                  viewsTrend,
  listingsTrend,
  inquiriesTrend,  
          },
          isLoading: false,
        });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? error?.message ?? "Failed to load seller dashboard",
        });
      }
    },
  }))
);

import axios from "@/lib/axios";

export type SellerAnalytics = {
  active_listings: { count: number; total: number };
  total_views: { all_time: number; this_week: number };
  test_drive_requests: { all_time: number };
  avg_list_price: number;
};

export const sellerAnalyticsService = {
  async get(): Promise<SellerAnalytics> {
    const res = await axios.get("/api/seller/analytics");
    return res.data.data;
  },
};
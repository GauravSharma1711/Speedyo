import axios from "@/lib/axios";

export type SellerPerformance = {
  period: string;
  totalViews: number;
  totalLeads: number;
  totalInquiries: number;
  totalTestDrives: number;
  totalVehicles: number;
  previousPeriodViews: number;
  previousPeriodLeads: number;
  vehicles_data: Array<{ id: string; title: string; views: number; leads: number }>;
};

export const sellerPerformanceService = {
  async get(period = "week"): Promise<SellerPerformance> {
    const res = await axios.get("/api/seller/performance", { params: { period } });
    const d = res.data.data;
    return {
      period: d.period,
      totalViews: d.total_views?.value ?? 0,
      totalLeads: 0,
      totalInquiries: d.inquiries?.value ?? 0,
      totalTestDrives: 0,
      totalVehicles: 0,
      previousPeriodViews: 0,
      previousPeriodLeads: 0,
      vehicles_data: d.individual_listings?.map((v: any) => ({
        id: v.id,
        title: v.title,
        views: v.views_in_period,
        leads: v.inquiries_in_period,
      })) ?? [],
    };
  },
};

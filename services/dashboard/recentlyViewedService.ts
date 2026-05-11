import axios from "@/lib/axios";

export type RecentlyViewedVehicle = {
  id: string;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  price: number | null;
  primary_image: string | null;
  primary_image_thumbnail: string | null;
  location: string | null;
  status: string | null;
};

export const recentlyViewedService = {
  async list(limit = 20): Promise<RecentlyViewedVehicle[]> {
    const res = await axios.get<{ success: true; recentlyViewed: RecentlyViewedVehicle[] }>(
      "/api/user/recently-viewed",
      { params: { limit } }
    );
    return res.data.recentlyViewed ?? [];
  },
};

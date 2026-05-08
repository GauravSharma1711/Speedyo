import api from "@/lib/axios";

export type VehiclePostApi = {
  id: string;
  created_date: string;
  updated_date: string;
  post_type: string;
  content: string;
  images: string[];
  images_thumbnails: string[];
  images_small: string[];
  images_medium: string[];
  video_url: string | null;
  video_thumbnail: string | null;
  article_title: string | null;
  article_excerpt: string | null;
  views: number;
  shares: number;
  comments_count: number;
  reactions: Record<string, number>;
  user_reactions: Array<{ user_email: string; reaction: string }>;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  vehicle_id: string;
};

export type ListVehiclePostsResponse = {
  success: true;
  page: number;
  limit: number;
  total: number;
  posts: VehiclePostApi[];
};

export const vehiclePostsService = {
  listByVehicle: async (vehicleId: string, params?: { page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", String(params.page));
    if (params?.limit) sp.set("limit", String(params.limit));
    const qs = sp.toString();
    const res = await api.get<ListVehiclePostsResponse>(
      `/api/post/by-vehicle/${vehicleId}${qs ? `?${qs}` : ""}`
    );
    return res.data;
  },
};


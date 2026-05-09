import axios from "@/lib/axios";

export type ProfileUser = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  bio?: string | null;
  location?: string | null;
  profile_image?: string | null;
  user_type?: "guest" | "private_seller" | "dealership" | null;
  role?: "user" | "admin" | null;
  verified?: boolean | null;
  user_id?: string;
};

export type ProfileVehicle = {
  id: string;
  created_by_id?: string;
  primary_image?: string | null;
  title?: string | null;
  year?: number | null;
  mileage?: number | null;
  location?: string | null;
  price?: number | null;
  status?: string | null;
  featured?: boolean | null;
  verified?: boolean | null;
  views?: number | null;
  likes_count?: number;
  saves_count?: number;
};

export type ProfilePost = {
  id: string;
  created_date?: string | Date | null;
  updated_date?: string | Date | null;
  author_id?: string | null;
  author?: {
    id?: string | null;
    full_name?: string | null;
    profile_image?: string | null;
    user_type?: string | null;
    role?: string | null;
    isVerified?: boolean | null;
  } | null;
  vehicle_id?: string | null;
  post_type?: string | null;
  content?: string | null;
  views?: number | null;
  shares?: number | null;
  comments_count?: number | null;
  reactions?: Record<string, number> | null;
  user_reactions?: Array<{ user_email?: string; reaction?: string }> | null;
  images?: string[] | null;
  images_thumbnails?: string[] | null;
  images_small?: string[] | null;
  images_medium?: string[] | null;
  video_url?: string | null;
  video_thumbnail?: string | null;
  article_title?: string | null;
  article_excerpt?: string | null;
  likes?: number | null;
};

export type FollowStats = {
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  followRecordId: string | null;
};

export const profileService = {
  async me() {
    const res = await axios.get<{ success: true; user: ProfileUser }>("/api/user/me");
    return res.data.user;
  },

  async publicProfile(userId: string) {
    const res = await axios.get<{ success: true; user: ProfileUser }>("/api/user/public", {
      params: { userId },
    });
    return res.data.user;
  },

  async vehicles(params: { userId: string; type: "managed" | "direct"; page?: number; limit?: number }) {
    const res = await axios.get<{
      success: true;
      page: number;
      limit: number;
      total: number;
      vehicles: ProfileVehicle[];
    }>("/api/user/vehicles", { params });
    return res.data;
  },

  async posts(params: { userId: string; page?: number; limit?: number }) {
    const res = await axios.get<{
      success: true;
      page: number;
      limit: number;
      total: number;
      posts: ProfilePost[];
    }>("/api/user/posts", { params });
    return res.data;
  },

  async followStats(targetId: string) {
    const res = await axios.get<{ success: true; stats: FollowStats }>("/api/user/follows/stats", {
      params: { targetId },
    });
    return res.data.stats;
  },

  async follow(followedId: string) {
    const res = await axios.post<{
      success: true;
      follow: { id: string; follower_id: string; followed_id: string };
    }>("/api/user/follows", { followedId });
    return res.data.follow;
  },

  async unfollow(followId: string) {
    await axios.delete(`/api/user/follows/${followId}`);
  },
};
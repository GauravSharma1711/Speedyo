import axios from "@/lib/axios";

export type PublicUserProfile = {
  id: string;
  user_id: string;
  full_name: string;
  profile_image: string | null;
  verified: boolean;
  user_type: string;
  role?: string | null;
};

export const publicUserService = {
  async getByUserId(userId: string) {
    const res = await axios.get<{ success: true; user: any }>("/api/user/public", {
      params: { userId },
    });
    const u = res.data.user;
    return {
      id: u?.id ?? userId,
      user_id: u?.user_id ?? u?.id ?? userId,
      full_name: u?.full_name ?? "Unknown Seller",
      profile_image: u?.profile_image ?? null,
      verified: Boolean(u?.verified),
      user_type: u?.user_type ?? "guest",
      role: u?.role ?? null,
    } as PublicUserProfile;
  },
};
import axios from "@/lib/axios";

export type PublicUser = {
  id: string;
  user_id?: string;
  full_name?: string | null;
  email?: string | null;
  profile_image?: string | null;
  user_type?: string | null;
  role?: string | null;
  verified?: boolean | null;
  bio?: string | null;
  location?: string | null;
};

export const publicUserService = {
  async list(): Promise<PublicUser[]> {
    const res = await axios.get<{ success: true; users: PublicUser[] }>("/api/public-users");
    return res.data.users ?? [];
  },

  async get(userId: string): Promise<PublicUser> {
    const res = await axios.get<{ success: true; user: PublicUser }>("/api/user/public", {
      params: { userId },
    });
    return res.data.user;
  },
};

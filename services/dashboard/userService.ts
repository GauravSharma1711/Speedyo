import axios from "@/lib/axios";

export type DashboardUser = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  profile_image?: string | null;
  user_type?: "guest" | "private_seller" | "dealership" | null;
  role?: string | null;
  verified?: boolean | null;
  bio?: string | null;
  location?: string | null;
  setup_completed?: boolean | null;
  welcome_email_sent?: boolean | null;
  dealership_verification_status?: string | null;
  admin_verification_notes?: string | null;
  private_seller_slots?: { purchased: number; used: number } | null;
  vehicles_sold_this_year?: number | null;
  seller_subscription?: {
    plan?: string | null;
    status?: string | null;
    expires_at?: string | null;
    tier?: string | null;
    vehicles_sold_this_year?: number | null;
  } | null;
};

export const userService = {
  async me(): Promise<DashboardUser> {
    const res = await axios.get<{ success: true; user: DashboardUser }>("/api/user/me");
    return res.data.user;
  },

  async getAdmins(): Promise<DashboardUser[]> {
    const res = await axios.get<{ success: true; admins: DashboardUser[] }>("/api/users/admins");
    return res.data.admins ?? [];
  },
};

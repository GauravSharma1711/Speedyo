import api from "@/lib/axios";

export type UpdateUserPayload = {
  full_name?: string;
  bio?: string;
  location?: string;
  setup_completed?: boolean;
  dealership_selected_tier?: string;
  dealership_verification_status?: string;
  verification_fee_paid?: boolean;
};


export const userService = {
  me: async () => {
    const res = await api.get("/api/user/me");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/user/public/${id}`);
    return res.data;
  },

    updateMe: async (payload: UpdateUserPayload) => {
    const res = await api.patch("/api/user/update-me", payload);
    return res.data; 
  },

};

export default userService;
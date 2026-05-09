import api from "@/lib/axios";

export const userService = {
  me: async () => {
    const res = await api.get("/api/user/me");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/api/user/public/${id}`);
    return res.data;
  },
};

export default userService;
import api from "@/lib/axios";
import { UpdateUserData } from "@/store/admin/user";

const userService = {
  getAll: async () => {
    const res = await api.get("/api/admin/users");
    return res.data;
  },

  update: async (userId: string, data: UpdateUserData) => {
    const res = await api.patch(`/api/admin/users/${userId}`, data);
    return res.data;
  },
};

export default userService;
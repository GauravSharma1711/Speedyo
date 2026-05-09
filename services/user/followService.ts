import api from "@/lib/axios";

export const followService = {
  // Get all users the current user is following
  getFollowing: async () => {
    const res = await api.get("/api/user/follows");
    return res.data;
  },

  // Follow a user
  follow: async (followedId: string) => {
    const res = await api.post("/api/user/follows", { followedId });
    return res.data;
  },

  // Unfollow a user
  unfollow: async (followId: string) => {
    const res = await api.delete(`/api/user/follows/${followId}`);
    return res.data;
  },

  // Get follow stats for a user
  getStats: async (userId: string) => {
    const res = await api.get(`/api/user/follows/stats?userId=${userId}`);
    return res.data;
  },
};

export default followService;
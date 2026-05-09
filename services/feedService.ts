import api from "@/lib/axios";

export type CreatePostData = {
  post_type: "text" | "image" | "video" | "vehicle_promo" | "article";
  content: string;
  vehicle_id?: string;
  images?: string[];
};

export type CommentPostData = {
  content: string;
  parent_comment_id?: string;
};

const feedService = {
  // Auth / User
  getCurrentUser: async () => {
    const res = await api.get("/api/user/me");
    return res.data;
  },

  getPublicUser: async (userId: string) => {
    const res = await api.get(`/api/user/public?userId=${encodeURIComponent(userId)}`);
    return res.data;
  },

  getVehicle: async (vehicleId: string) => {
    const res = await api.get(`/api/vehicles/${encodeURIComponent(vehicleId)}`);
    return res.data;
  },

  getComments: async (postId: string, page = 1, limit = 50) => {
    const res = await api.get(`/api/post/${encodeURIComponent(postId)}/commentPost?page=${page}&limit=${limit}`);
    return res.data;
  },

  getMyVehicles: async (page = 1, limit = 50) => {
    const res = await api.get(`/api/user/vehicles?page=${page}&limit=${limit}`);
    return res.data;
  },

  addComment: async (postId: string, data: CommentPostData) => {
    const res = await api.post(`/api/post/${encodeURIComponent(postId)}/commentPost`, data);
    return res.data;
  },

  // Posts
  // Posts
  getAll: async () => {
    const res = await api.get("/api/post/getAll");
    return res.data;
  },

  createPost: async (data: CreatePostData) => {
    const res = await api.post("/api/post/createPost", data);
    return res.data;
  },

  // Reactions
  reactToPost: async (postId: string, reactionType: string | null) => {
    const res = await api.post(`/api/post/${postId}/reactToPost`, { reactionType });
    return res.data;
  },

  updatePostReactions: async (postId: string, reactions: Record<string, number>, user_reactions: Array<{ user_email: string; reaction: string }>) => {
    const res = await api.patch(`/api/post/updatePostReactions`, { postId, reactions, user_reactions });
    return res.data;
  },

  // Comments
  commentPost: async (postId: string, data: CommentPostData) => {
    const res = await api.post(`/api/post/${postId}/commentPost`, data);
    return res.data;
  },

  updatePostComments: async (postId: string, comments_count: number) => {
    const res = await api.patch(`/api/post/updatePostComments`, { postId, comments_count });
    return res.data;
  },

  // Shares
  updatePostShare: async (postId: string, shares: number) => {
    const res = await api.patch(`/api/post/updatePostShare`, { postId, shares });
    return res.data;
  },

  // Views
  incrementPostViews: async (postId: string) => {
    const res = await api.post(`/api/post/incrementPostViews`, { postId });
    return res.data;
  },

  // Vehicles
  getVehicleById: async (id: string) => {
    const res = await api.get(`/api/vehicles/${id}`);
    return res.data;
  },

  getFeaturedVehicles: async () => {
    const res = await api.get("/api/vehicles/featured");
    return res.data;
  },

  // Upload
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post("/api/upload/uploadImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Delete post
  deletePost: async (postId: string) => {
    const res = await api.delete(`/api/post/${postId}/deletePost`);
    return res.data;
  },
};

export default feedService;

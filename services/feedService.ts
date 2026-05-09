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
  getAll: async () => {
    const res = await api.get("/api/post/getAll");
    return res.data;
  },

  getVehicleById : async (id: string) => {
    const res = await api.get(`/api/vehicles/${id}`);
    return res.data;
  },

  createPost: async (data: CreatePostData) => {
    const res = await api.post("/api/post/createPost", data);
    return res.data;
  },

  likePost: async (postId: string) => {
    const res = await api.post(`/api/post/${postId}/likePost`);
    return res.data;
  },

  reactToPost: async (postId: string, reactionType: string | null) => {
  const res = await api.post(`/api/post/${postId}/reactToPost`, { reactionType });
  return res.data;
},

  commentPost: async (postId: string, data: CommentPostData) => {
    const res = await api.post(`/api/post/${postId}/commentPost`, data);
    return res.data;
  },

  getFeaturedVehicles: async () => {
    const res = await api.get("/api/vehicles/featured");
    return res.data;
  },
};

export default feedService;

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import feedService, { CreatePostData, CommentPostData } from "@/services/feedService";
import error from "next/error";

export type Post = {
  id: string;
  createdAt: string;
  updatedAt: string;

  content: string;
  authorId: string;
  vehicleId?: string | null;

  images: string[];
  images_thumbnails: string[];
  images_small: string[];
  images_medium: string[];

  post_type: string;

  likes: number;
  shares: number;
  views: number;
  comments_count: number;
  engagement_score: number;

  reactions: Record<string, number>;
  user_reactions: unknown[];

  article_excerpt?: string | null;
  article_title?: string | null;

  video_thumbnail?: string | null;
  video_url?: string | null;

  author: {
    id: string;
    createdAt: string;
    updatedAt: string;

    role: string;
    email: string;

    full_name: string | null;
    bio: string | null;
    profile_image: string | null;

    user_type: string;

    location: string | null;
    phone: string | null;

    dealership_verification_status: string;
    dealership_selected_tier: string | null;

    business_name: string | null;
    business_address: string | null;
    business_city: string | null;
    business_state: string | null;
    business_zip: string | null;

    business_license_urls: string[];

    tax_id_number: string | null;

    verification_fee_paid: boolean;

    admin_verification_notes: string | null;

    welcome_email_sent: boolean;
    setup_completed: boolean;

    verificationCode: string;
    verificationCodeExpiry: string;

    isVerified: boolean;



    verification_status: string;


  };

  vehicle?: {
    id: string;
    title: string;
    make: string;
    model: string;
    year: number;
    price: number;
    primary_image_thumbnail?: string | null;
  } | null;
};;

export type Comment = {
  id: string;
  createdAt: string;
  content: string;
  postId: string;
  authorId: string;
  parentCommentId?: string | null;
  likes: number;
  replies_count: number;
  author?: { id: string; full_name: string | null; profile_image: string | null };
};

export type FeaturedVehicle = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string;
  verified: boolean;
  primary_image: string | null;
  primary_image_small: string | null;
  location: string | null;
  mileage: number | null;
  condition: string | null;
};

interface FeedState {
  posts: Post[];
  featuredVehicles: FeaturedVehicle[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  getVehicleById: (id: string) => Promise<void>;
  getFeaturedVehicles: () => Promise<void>;
  createPost: (data: CreatePostData) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  reactToPost: (postId: string, reactionType: string | null) => Promise<void>;
  commentPost: (postId: string, data: CommentPostData) => Promise<Comment>;
}

export const useFeedStore = create<FeedState>()(
  immer((set) => ({
    posts: [],
    featuredVehicles: [],
    isLoading: false,
    isCreating: false,
    error: null,

    clearError() {
      set({ error: null });
    },

    async getAll() {
      set({ isLoading: true, error: null });
      try {
        const res = await feedService.getAll();
        set({ posts: res.posts ?? [], isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.message ?? "Failed to fetch posts",
        });
        throw error;
      }
    },

    async getFeaturedVehicles() {
      try {
        const res = await feedService.getFeaturedVehicles();
        set({ featuredVehicles: res.vehicles ?? [] });
      } catch (error: any) {
        // non-critical, don't block feed
        console.error("Failed to fetch featured vehicles", error);
      }
    },

    async getVehicleById(id: string) {
      try {
        const res = await feedService.getVehicleById(id);
        return res.vehicle;
      } catch (error: any) {
        console.error("Failed to fetch vehicle", error);
        throw error;
      }
    },


    
    

    async createPost(data) {
      set({ isCreating: true, error: null });
      try {
        const res = await feedService.createPost(data);
        set((state) => {
          state.posts.unshift(res.post);
        });
        set({ isCreating: false });
      } catch (error: any) {
        set({
          isCreating: false,
          error: error?.response?.data?.message ?? "Failed to create post",
        });
        throw error;
      }
    },

    async likePost(postId) {
      try {
        const res = await feedService.likePost(postId);
        set((state) => {
          const idx = state.posts.findIndex((p) => p.id === postId);
          if (idx !== -1) {
            state.posts[idx].likes = res.post?.likes ?? state.posts[idx].likes;
            state.posts[idx].reactions = res.post?.reactions ?? state.posts[idx].reactions;
          }
        });
      } catch (error: any) {
        set({ error: error?.response?.data?.message ?? "Failed to like post" });
        throw error;
      }
    },

    reactToPost: async (postId: string, reactionType: string | null) => {
  try {
    const res = await feedService.reactToPost(postId, reactionType);
    set((state) => {
      const idx = state.posts.findIndex((p) => p.id === postId);
      if (idx !== -1) {
        state.posts[idx].likes = res.post?.likes ?? state.posts[idx].likes;
        state.posts[idx].reactions = res.post?.reactions ?? state.posts[idx].reactions;
        state.posts[idx].user_reactions = res.post?.user_reactions ?? state.posts[idx].user_reactions;
      }
    });
  } catch (error: any) {
    set({ error: error?.response?.data?.message ?? "Failed to react to post" });
    throw error;
  }
},

    async commentPost(postId, data) {
      try {
        const res = await feedService.commentPost(postId, data);
        set((state) => {
          const idx = state.posts.findIndex((p) => p.id === postId);
          if (idx !== -1) state.posts[idx].comments_count += 1;
        });
        return res.comment;
      } catch (error: any) {
        set({ error: error?.response?.data?.message ?? "Failed to comment on post" });
        throw error;
      }
    },
  }))
);
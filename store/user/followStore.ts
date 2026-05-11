import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import followService from "@/services/user/followService";

interface FollowUser {
  id: string;
  full_name: string | null;
  profile_image: string | null;
  user_type: string;
}

interface Follow {
  id: string;
  followed_id: string;
  user: FollowUser;
}

interface FollowState {
  following: Follow[];
  isLoading: boolean;
  error: string | null;

  fetchFollowing: () => Promise<void>;
  follow: (followedId: string) => Promise<void>;
  unfollow: (followId: string) => Promise<void>;
}

export const useFollowStore = create<FollowState>()(
  immer((set) => ({
    following: [],
    isLoading: false,
    error: null,

    fetchFollowing: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await followService.getFollowing();
        set({ following: res.following ?? [], isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error: error?.response?.data?.error ?? "Failed to fetch following",
        });
      }
    },

    follow: async (followedId: string) => {
      try {
        const res = await followService.follow(followedId);
        if (res.success && res.follow) {
          set((state) => {
            state.following.push(res.follow);
          });
        }
      } catch (error: any) {
        set({ error: error?.response?.data?.error ?? "Failed to follow" });
      }
    },

    unfollow: async (followId: string) => {
      try {
        await followService.unfollow(followId);
        set((state) => {
          state.following = state.following.filter((f) => f.id !== followId);
        });
      } catch (error: any) {
        set({ error: error?.response?.data?.error ?? "Failed to unfollow" });
      }
    },
  }))
);
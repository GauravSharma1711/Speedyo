import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { profileService, type ProfilePost, type ProfileUser, type ProfileVehicle } from "@/services/profile/profileServices";

type ProfileState = {
  isLoading: boolean;
  error: string | null;

  me: ProfileUser | null;
  profile: ProfileUser | null;
  vehicles: ProfileVehicle[];
  posts: ProfilePost[];

  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  followRecordId: string | null;
  isFollowLoading: boolean;

  load: (profileId: string | null) => Promise<void>;
  toggleFollow: () => Promise<void>;
  updatePostLocal: (postId: string, patch: Partial<ProfilePost>) => void;
replacePostLocal: (postId: string, next: ProfilePost) => void;
};

export const useProfileStore = create<ProfileState>()(
  immer((set, get) => ({
    isLoading: true,
    error: null,

    me: null,
    profile: null,

    vehicles: [],
    posts: [],

    followerCount: 0,
    followingCount: 0,
    isFollowing: false,
    followRecordId: null,
    isFollowLoading: false,

    async load(profileId) {
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });

      try {
        const me = await profileService.me();
        const isOther = Boolean(profileId && profileId !== "undefined" && profileId !== me.id);

        const profile = isOther ? await profileService.publicProfile(profileId!) : me;
        const targetUserId = (profile.user_id ?? profile.id) as string;

        const [managed, direct, posts, stats] = await Promise.all([
          profileService.vehicles({ userId: targetUserId, type: "managed", page: 1, limit: 50 }),
          profileService.vehicles({ userId: targetUserId, type: "direct", page: 1, limit: 50 }),
          profileService.posts({ userId: targetUserId, page: 1, limit: 50 }),
          profileService.followStats(targetUserId).catch(() => null),
        ]);

        const mergedVehicles = [...managed.vehicles];
        for (const v of direct.vehicles) {
          if (!mergedVehicles.some((x) => x.id === v.id)) mergedVehicles.push(v);
        }

        set((s) => {
          s.me = me;
          s.profile = profile;
          s.vehicles = mergedVehicles;
          s.posts = posts.posts;

          s.followerCount = stats?.followerCount ?? 0;
          s.followingCount = stats?.followingCount ?? 0;
          s.isFollowing = stats?.isFollowing ?? false;
          s.followRecordId = stats?.followRecordId ?? null;
        });
      } catch (e: any) {
        set((s) => {
          s.error = e?.message ?? "Failed to load profile";
          s.me = null;
          s.profile = null;
          s.vehicles = [];
          s.posts = [];
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },

    async toggleFollow() {
      const { me, profile, isFollowing, followRecordId, isFollowLoading } = get();
      if (isFollowLoading) return;
      if (!me || !profile) return;

      const targetId = (profile.user_id ?? profile.id) as string;
      if (!targetId || targetId === me.id) return;

      set((s) => {
        s.isFollowLoading = true;
      });

      try {
        if (isFollowing && followRecordId) {
          await profileService.unfollow(followRecordId);
          set((s) => {
            s.isFollowing = false;
            s.followRecordId = null;
            s.followerCount = Math.max(0, s.followerCount - 1);
          });
        } else {
          const follow = await profileService.follow(targetId);
          set((s) => {
            s.isFollowing = true;
            s.followRecordId = follow.id;
            s.followerCount = s.followerCount + 1;
          });
        }
      } finally {
        set((s) => {
          s.isFollowLoading = false;
        });
      }
    },
    updatePostLocal(postId, patch) {
        set((s) => {
          const idx = s.posts.findIndex((p) => p.id === postId);
          if (idx === -1) return;
          s.posts[idx] = { ...s.posts[idx], ...patch };
        });
      },
      
      replacePostLocal(postId, next) {
        set((s) => {
          const idx = s.posts.findIndex((p) => p.id === postId);
          if (idx === -1) return;
          s.posts[idx] = next;
        });
      },
  }))
);
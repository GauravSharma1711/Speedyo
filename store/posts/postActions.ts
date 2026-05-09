import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  postActionsService,
  type ReactionTypeOrNull,
} from "@/services/posts/postActionsServices";

type UserReaction = { user_email: string; reaction: string };

type ReactResult = {
  reactions?: Record<string, number>;
  user_reactions?: UserReaction[];
  likes?: number;
};

type PostActionsState = {
  reactingByPostId: Record<string, boolean>;
  sharingByPostId: Record<string, boolean>;
  syncingCommentsByPostId: Record<string, boolean>;
  viewingByPostId: Record<string, boolean>;
  errorByPostId: Record<string, string | null>;

  react: (postId: string, reactionType: ReactionTypeOrNull) => Promise<ReactResult | null>;
  share: (postId: string) => Promise<{ shares: number } | null>;
  syncComments: (postId: string) => Promise<{ comments_count: number } | null>;
  incrementView: (postId: string) => Promise<{ newViewCount: number } | null>;

  clearError: (postId: string) => void;
};

export const usePostActionsStore = create<PostActionsState>()(
  immer((set, get) => ({
    reactingByPostId: {},
    sharingByPostId: {},
    syncingCommentsByPostId: {},
    viewingByPostId: {},
    errorByPostId: {},

    clearError(postId) {
      set((s) => {
        s.errorByPostId[postId] = null;
      });
    },

    async react(postId, reactionType) {
      if (get().reactingByPostId[postId]) return null;

      set((s) => {
        s.reactingByPostId[postId] = true;
        s.errorByPostId[postId] = null;
      });

      try {
        const updated = await postActionsService.react(postId, reactionType);
        return {
          reactions: updated.reactions,
          user_reactions: updated.user_reactions as UserReaction[] | undefined,
          likes: updated.likes,
        };
      } catch (e: any) {
        set((s) => {
          s.errorByPostId[postId] =
            e?.response?.data?.error ?? e?.message ?? "Failed to react";
        });
        throw e;
      } finally {
        set((s) => {
          s.reactingByPostId[postId] = false;
        });
      }
    },

    async share(postId) {
      if (get().sharingByPostId[postId]) return null;

      set((s) => {
        s.sharingByPostId[postId] = true;
        s.errorByPostId[postId] = null;
      });

      try {
        const res = await postActionsService.incrementShare(postId);
        return { shares: res.shares };
      } catch (e: any) {
        set((s) => {
          s.errorByPostId[postId] =
            e?.response?.data?.error ?? e?.message ?? "Failed to share";
        });
        throw e;
      } finally {
        set((s) => {
          s.sharingByPostId[postId] = false;
        });
      }
    },

    async syncComments(postId) {
      if (get().syncingCommentsByPostId[postId]) return null;

      set((s) => {
        s.syncingCommentsByPostId[postId] = true;
        s.errorByPostId[postId] = null;
      });

      try {
        const res = await postActionsService.syncCommentsCount(postId);
        return { comments_count: res.comments_count };
      } catch (e: any) {
        set((s) => {
          s.errorByPostId[postId] =
            e?.response?.data?.error ?? e?.message ?? "Failed to sync comments";
        });
        throw e;
      } finally {
        set((s) => {
          s.syncingCommentsByPostId[postId] = false;
        });
      }
    },

    async incrementView(postId) {
      if (get().viewingByPostId[postId]) return null;

      set((s) => {
        s.viewingByPostId[postId] = true;
        s.errorByPostId[postId] = null;
      });

      try {
        const res = await postActionsService.incrementView(postId);
        return { newViewCount: res.newViewCount };
      } catch (e: any) {
        set((s) => {
          s.errorByPostId[postId] =
            e?.response?.data?.error ?? e?.message ?? "Failed to count view";
        });
        throw e;
      } finally {
        set((s) => {
          s.viewingByPostId[postId] = false;
        });
      }
    },
  })),
);
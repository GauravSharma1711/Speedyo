import axios from "@/lib/axios";

export type ReactionType = "like" | "love" | "laugh" | "wow" | "fire" | "angry";
export type ReactionTypeOrNull = ReactionType | null;

export type UpdateReactionsResponse = {
  id: string;
  likes?: number;
  reactions?: Record<string, number>;
  user_reactions?: Array<{ user_email: string; reaction: string }>;
};

export const postActionsService = {
  async react(postId: string, reactionType: ReactionTypeOrNull) {
    const res = await axios.post<UpdateReactionsResponse>("/api/post/updatePostReactions", {
      postId,
      reactionType,
    });
    return res.data;
  },

  async incrementShare(postId: string) {
    const res = await axios.post<{ id: string; shares: number }>("/api/post/updatePostShare", {
      postId,
    });
    return res.data;
  },

  async incrementView(postId: string) {
    const res = await axios.post<{ success: true; newViewCount: number }>(
      "/api/post/incrementPostViews",
      { postId },
    );
    return res.data;
  },

  async syncCommentsCount(postId: string) {
    const res = await axios.post<{ id: string; comments_count: number }>(
      "/api/post/updatePostComments",
      { postId },
    );
    return res.data;
  },
};
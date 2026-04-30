"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";

import CreatePost from "./CreatePost";
import FeedFilters from "./FeedFilters";
import PostCard from "./PostCard";

type FeedPost = any;
type FeedVehicle = any;
type CurrentUser = any;

type CreatePostResult = { id: string } | null;

interface FeedProps {
  posts: FeedPost[];
  vehicles: FeedVehicle[];
  currentUser?: CurrentUser | null;

  onCreatePost: (data: any) => Promise<CreatePostResult>;
  onReact: (post: FeedPost, reactionType: string) => void | Promise<void>;
  onComment: (postId: string) => void | Promise<void>;
  onShare: (post: FeedPost) => void | Promise<void>;
  onEdit?: (post: FeedPost) => void;
}

export default function Feed({
  posts,
  vehicles,
  currentUser = null,
  onCreatePost,
  onReact,
  onComment,
  onShare,
  onEdit,
}: FeedProps) {
  const [sortBy, setSortBy] = useState("recent");
  const [showCreatePost, setShowCreatePost] = useState(false);

  const sortedPosts = useMemo(() => {
    const sorted = [...(posts ?? [])];

    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => {
          const r = (p: any) =>
            p.reactions ? Object.values(p.reactions).reduce((s: number, c: any) => s + c, 0) : 0;
          return r(b) - r(a);
        });
      case "viewed":
        return sorted.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
      case "interactive":
        return sorted.sort(
          (a, b) =>
            (b.comments_count ?? 0) + (b.shares ?? 0) - ((a.comments_count ?? 0) + (a.shares ?? 0))
        );
      case "trending": {
        const ago = new Date(Date.now() - 86_400_000);
        return sorted
          .filter((p) => (p.created_date ? new Date(p.created_date) > ago : false))
          .sort((a, b) => (b.engagement_score ?? 0) - (a.engagement_score ?? 0));
      }
      case "engagement":
        return sorted.sort((a, b) => (b.engagement_score ?? 0) - (a.engagement_score ?? 0));
      default:
        return sorted.sort((a, b) => +new Date(b.created_date) - +new Date(a.created_date));
    }
  }, [posts, sortBy]);

  return (
    <div className="space-y-6">
      <FeedFilters sortBy={sortBy} setSortBy={setSortBy} />

      <AnimatePresence>
        {showCreatePost && (
          <CreatePost
            currentUser={currentUser}
            vehicles={vehicles}
            onCreatePost={onCreatePost}
            onCancel={() => setShowCreatePost(false)}
            initialPostType="text"
          />
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {sortedPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReact={(reactionType: string) => onReact(post, reactionType)}
            onComment={() => onComment(post.id)}
            onShare={() => onShare(post)}
            onEdit={() => onEdit?.(post)}
          />
        ))}
      </div>
    </div>
  );
}
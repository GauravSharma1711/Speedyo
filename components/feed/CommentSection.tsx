"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";

type CurrentUser = {
  id: string;
  email: string;
  full_name?: string | null;
  profile_image?: string | null;
};

type CommentAuthor = {
  user_id: string;
  full_name: string;
  user_type: string;
  profile_image: string | null;
  verified: boolean;
  role?: string | null;
};

type CommentData = {
  id: string;
  postId?: string; 
  post_id?: string;
  content: string;
  authorId?: string;
  author_id?: string;
  parentCommentId?: string | null;
  parent_comment_id?: string | null;
  createdAt?: string;
  created_date?: string;
  reactions?: Record<string, number>;
  user_reactions?: { user_email: string; reaction: string }[];
  replies?: CommentData[];
};

type CommentItemProps = {
  comment: CommentData;
  onReplySubmit: (parentId: string, replyContent: string) => Promise<void>;
  currentUser: CurrentUser | null;
  commentAuthors: Record<string, CommentAuthor>;
};

function normalizeComment(c: any): CommentData {
  return {
    id: c.id,
    postId: c.postId ?? c.post_id ?? undefined,
    post_id: c.post_id ?? c.postId ?? undefined,
    content: c.content ?? "",
    authorId: c.authorId ?? c.author_id ?? undefined,
    author_id: c.author_id ?? c.authorId ?? undefined,
    parentCommentId: c.parentCommentId ?? c.parent_comment_id ?? null,
    parent_comment_id: c.parent_comment_id ?? c.parentCommentId ?? null,
    createdAt: c.createdAt ?? c.created_date ?? undefined,
    created_date: c.created_date ?? c.createdAt ?? undefined,
    reactions: c.reactions ?? undefined,
    user_reactions: c.user_reactions ?? undefined,
    replies: Array.isArray(c.replies) ? c.replies.map(normalizeComment) : [],
  };
}

const CommentItem = ({ comment, onReplySubmit, currentUser, commentAuthors }: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const authorId = comment.author_id ?? comment.authorId ?? "";
  const createdRaw = comment.created_date ?? comment.createdAt ?? "";
  const createdLabel = createdRaw ? format(new Date(createdRaw), "MMM d, h:mm a") : "—";

  const commentUser =
    commentAuthors[authorId] ?? {
      full_name: "Unknown User",
      user_type: "guest",
      profile_image: null,
      verified: false,
      user_id: authorId,
    };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    if (!currentUser) return;

    setIsSubmittingReply(true);
    try {
      await onReplySubmit(comment.id, replyContent.trim());
      setReplyContent("");
      setShowReplyInput(false);
    } catch {
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Avatar className="w-8 h-8">
        <AvatarImage src={commentUser.profile_image ?? undefined} />
        <AvatarFallback className="bg-slate-200 text-slate-600">
          {commentUser.full_name?.[0] ?? "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <div className="bg-slate-100 rounded-lg p-3">
          <Link href={`/profile?id=${authorId}`} className="font-semibold text-sm hover:underline">
            {commentUser.full_name}
          </Link>
          <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1">{comment.content}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 pl-1">
          <button
            onClick={() => setShowReplyInput(true)}
            className="font-semibold hover:underline"
            disabled={!currentUser}
            type="button"
          >
            Reply
          </button>
          <span>·</span>
          <span>{createdLabel}</span>
        </div>

        {showReplyInput && (
          <form onSubmit={handleReply} className="mt-2">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.profile_image ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm">
                  {currentUser?.full_name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Replying to ${commentUser.full_name}...`}
                  className="min-h-[60px] border-slate-200 resize-none"
                  autoFocus
                  disabled={isSubmittingReply}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyInput(false)}
                    disabled={isSubmittingReply}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm"
                    disabled={!replyContent.trim() || isSubmittingReply}>
                    {isSubmittingReply ? "Replying..." : "Reply"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}

        {comment.replies && comment.replies.length > 0 ? (
          <div className="mt-3 space-y-3 pl-4 border-l-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onReplySubmit={onReplySubmit}
                currentUser={currentUser}
                commentAuthors={commentAuthors}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

type CommentSectionProps = {
  postId: string;
  postCreatorId: string;
  currentUser: CurrentUser | null;
  onCommentAdded?: () => void;
};

export default function CommentSection({ postId, currentUser, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentAuthors, setCommentAuthors] = useState<Record<string, CommentAuthor>>({});
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buildTree = useCallback((flat: CommentData[]) => {
    const byId = new Map<string, CommentData>(flat.map((c) => [c.id, { ...c, replies: [] }]));
    const roots: CommentData[] = [];

    for (const c of flat) {
      const parentId = c.parent_comment_id ?? c.parentCommentId ?? null;
      if (parentId) {
        const parent = byId.get(parentId);
        if (parent) parent.replies!.push(byId.get(c.id)!);
      } else {
        roots.push(byId.get(c.id)!);
      }
    }
    roots.forEach((c) =>
      c.replies?.sort(
        (a, b) =>
          +new Date(a.created_date ?? a.createdAt ?? 0) - +new Date(b.created_date ?? b.createdAt ?? 0)
      )
    );
    roots.sort(
      (a, b) =>
        +new Date(a.created_date ?? a.createdAt ?? 0) - +new Date(b.created_date ?? b.createdAt ?? 0)
    );

    return roots;
  }, []);

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      const res = await fetch(`/api/post/${encodeURIComponent(postId)}/commentPost?page=1&limit=50`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load comments");
      const json = (await res.json()) as { success: boolean; comments: any[] };
      const normalized = (json.comments ?? []).map(normalizeComment);

      const authorIds = new Set<string>();
      for (const c of normalized) {
        const aid = c.author_id ?? c.authorId;
        if (aid) authorIds.add(aid);
      }
      if (currentUser?.id) authorIds.add(currentUser.id);

      const authorsMap: Record<string, CommentAuthor> = {};
      await Promise.all(
        Array.from(authorIds).map(async (authorId) => {
          try {
            const r = await fetch(`/api/user/public?userId=${encodeURIComponent(authorId)}`, {
              cache: "no-store",
            });
            if (!r.ok) throw new Error("author fetch failed");
            const j = (await r.json()) as { user?: any };

            const u = j.user ?? null;
            authorsMap[authorId] = {
              user_id: u?.user_id ?? u?.id ?? authorId,
              full_name: u?.full_name ?? "Unknown User",
              user_type: u?.user_type ?? "guest",
              profile_image: u?.profile_image ?? null,
              verified: Boolean(u?.verified),
              role: u?.role ?? null,
            };
          } catch {
            authorsMap[authorId] = {
              user_id: authorId,
              full_name: "Unknown User",
              user_type: "guest",
              profile_image: null,
              verified: false,
              role: null,
            };
          }
        })
      );

      setCommentAuthors(authorsMap);
      setComments(normalized);
    } catch (e) {
      console.error("Failed to load comments:", e);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId, currentUser?.id, buildTree]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const createComment = useCallback(
    async (content: string, parentCommentId?: string | null) => {
      const res = await fetch(`/api/post/${encodeURIComponent(postId)}/commentPost`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, ...(parentCommentId ? { parentCommentId } : {}) }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Failed to post comment");
      }
      return (await res.json()) as any;
    },
    [postId]
  );

  const handleNewCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment(newComment.trim(), null);
      setNewComment("");
      onCommentAdded?.();
      await loadComments();
    } catch (e) {
      console.error("Failed to post comment:", e);
      alert("Failed to post comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string, replyContent: string) => {
    if (!currentUser) return;
    await createComment(replyContent, parentId);
    onCommentAdded?.();
    await loadComments();
  };

  return (
    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
      <form onSubmit={handleNewCommentSubmit} className="mb-4">
        <div className="flex gap-3">
          {currentUser ? (
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.profile_image ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm">
                {currentUser.full_name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
          ) : null}

          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="min-h-[50px] border-slate-200 resize-none"
              disabled={isSubmitting || !currentUser}
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || !currentUser || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
              >
                <Send className="w-4 h-4 mr-1" />
                {isSubmitting ? "Commenting..." : "Comment"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comment list */}
      {isLoadingComments ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReplySubmit={handleReplySubmit}
              currentUser={currentUser}
              commentAuthors={commentAuthors}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p className="text-sm">No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
}
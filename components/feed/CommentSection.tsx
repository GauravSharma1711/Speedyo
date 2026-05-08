"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFeedStore } from "@/store/feed";
import { Notification, PublicUser } from "@/api/entities";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurrentUser {
  id: string;
  email: string;
  full_name?: string;
  profile_image?: string;
}

interface CommentAuthor {
  user_id: string;
  full_name: string;
  user_type: string;
  profile_image: string | null;
  verified: boolean;
}

interface CommentData {
  id: string;
  postId: string;           // fixed: was post_id
  content: string;
  authorId: string;         // fixed: was author_id
  parent_comment_id?: string | null;  // fixed: was parent_comment_id
  createdAt: string;        // fixed: was created_date
  reactions?: Record<string, number>;
  user_reactions?: { user_email: string; reaction: string }[];
  replies?: CommentData[];
}

// ─── CommentItem ──────────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: CommentData;
  onCommentAdded: (e: React.FormEvent, parentId?: string | null, replyContent?: string | null) => Promise<void>;
  onReact: (commentId: string, reactionType: string) => void;
  currentUser: CurrentUser | null;
  commentAuthors: Record<string, CommentAuthor>;
}

const CommentItem = ({ comment, onCommentAdded, onReact, currentUser, commentAuthors }: CommentItemProps) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent]     = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      await onCommentAdded(e, comment.id, replyContent);
      setReplyContent("");
      setShowReplyInput(false);
    } catch {
      alert("Failed to post reply. Please try again.");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const userHasLiked = comment.user_reactions?.some(
    r => r.user_email === currentUser?.email && r.reaction === "like"
  );
  const likesCount = comment.reactions?.like ?? 0;

  const commentUser = commentAuthors[comment.authorId] ?? {
    full_name: "Unknown User",
    user_type: "guest",
    profile_image: null,
    verified: false,
    user_id: comment.authorId,
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
          <Link href={`/profile?id=${comment.authorId}`} className="font-semibold text-sm hover:underline">
            {commentUser.full_name}
          </Link>
          <p className="text-sm text-slate-800 whitespace-pre-wrap mt-1">{comment.content}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 pl-1">
          <button
            onClick={() => onReact(comment.id, "like")}
            className={`font-semibold ${userHasLiked ? "text-blue-600" : "hover:underline"}`}
            disabled={!currentUser}
          >
            Like {likesCount > 0 && `(${likesCount})`}
          </button>
          <button
            onClick={() => setShowReplyInput(true)}
            className="font-semibold hover:underline"
            disabled={!currentUser}
          >
            Reply
          </button>
          <span>·</span>
          {/* fixed: was comment.created_date */}
          <span>{format(new Date(comment.createdAt), "MMM d, h:mm a")}</span>
        </div>

        {showReplyInput && (
          <form onSubmit={handleReplySubmit} className="mt-2">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser?.profile_image} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm">
                  {currentUser?.full_name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder={`Replying to ${commentUser.full_name}...`}
                  className="min-h-[60px] border-slate-200 resize-none"
                  autoFocus
                  disabled={isSubmittingReply}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button type="button" variant="ghost" size="sm"
                    onClick={() => setShowReplyInput(false)}
                    disabled={isSubmittingReply}>
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

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-slate-200">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onCommentAdded={onCommentAdded}
                onReact={onReact}
                currentUser={currentUser}
                commentAuthors={commentAuthors}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CommentSection ───────────────────────────────────────────────────────────

interface CommentSectionProps {
  postId: string;
  postCreatorId: string;
  currentUser: CurrentUser | null;
  onCommentAdded?: () => void;
}

export default function CommentSection({
  postId,
  postCreatorId,
  currentUser,
  onCommentAdded,
}: CommentSectionProps) {
  const { commentPost } = useFeedStore();

  const [comments, setComments]             = useState<CommentData[]>([]);
  const [newComment, setNewComment]         = useState("");
  const [commentAuthors, setCommentAuthors] = useState<Record<string, CommentAuthor>>({});
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const loadComments = useCallback(async () => {
    setIsLoadingComments(true);
    try {
      // Your API endpoint — adjust to match your actual route
      const res = await fetch(`/api/posts/${postId}/comments`);
      const data = await res.json();
      const fetched: CommentData[] = data.comments ?? [];

      // Collect unique author IDs
      const authorIds = new Set<string>(fetched.map(c => c.authorId));
      if (currentUser?.id) authorIds.add(currentUser.id);

      // Fetch all author profiles in parallel
      const authorsMap: Record<string, CommentAuthor> = {};
      await Promise.all(
        Array.from(authorIds).map(async authorId => {
          try {
            const profiles = await PublicUser.filter({ user_id: authorId });
            authorsMap[authorId] = profiles[0] ?? {
              user_id: authorId, full_name: "Unknown User",
              user_type: "guest", profile_image: null, verified: false,
            };
          } catch {
            authorsMap[authorId] = {
              user_id: authorId, full_name: "Unknown User",
              user_type: "guest", profile_image: null, verified: false,
            };
          }
        })
      );
      setCommentAuthors(authorsMap);

      // Build hierarchical tree using camelCase fields
      const byId = new Map(fetched.map(c => [c.id, { ...c, replies: [] as CommentData[] }]));
      const roots: CommentData[] = [];

      fetched.forEach(c => {
        if (c.parent_comment_id) {          // fixed: was parent_comment_id
          byId.get(c.parent_comment_id)?.replies?.push(byId.get(c.id)!);
        } else {
          roots.push(byId.get(c.id)!);
        }
      });

      // Sort replies oldest-first, roots oldest-first
      roots.forEach(c => c.replies?.sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)  // fixed: was created_date
      ));
      roots.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

      setComments(roots);
    } catch (e) {
      console.error("Failed to load comments:", e);
    } finally {
      setIsLoadingComments(false);
    }
  }, [postId, currentUser?.id]);

  useEffect(() => { loadComments(); }, [loadComments]);

  const handleCommentSubmit = async (
    e: React.FormEvent,
    parentId: string | null = null,
    submittedReplyContent: string | null = null
  ) => {
    e.preventDefault();
    const content = submittedReplyContent ?? newComment;
    if (!content.trim() || !currentUser) return;
    if (!parentId) setIsSubmitting(true);

    try {
      // Use the store action — it handles the API call and updates posts[].comments_count
      await commentPost(postId, {
        content,
        parent_comment_id: parentId ?? undefined,  // fixed: was parent_comment_id
      });

      // Send notification
      let recipientId  = postCreatorId;
      let notifContent = `${currentUser.full_name} commented on your post.`;
      let notifType    = "comment_reply" as const;

      if (parentId) {
        const flat: CommentData[] = [];
        const collect = (cmts: CommentData[]) =>
          cmts.forEach(c => { flat.push(c); if (c.replies) collect(c.replies); });
        collect(comments);
        const parent = flat.find(c => c.id === parentId);
        if (parent?.authorId) recipientId = parent.authorId;  // fixed: was author_id
        notifContent = `${currentUser.full_name} replied to your comment.`;
      }

      if (currentUser.id !== recipientId) {
        await Notification.create({
          recipient_id: recipientId,
          sender_id:    currentUser.id,
          type:         notifType,
          content:      notifContent,
          related_entity_type: "Post",
          related_entity_id:   postId,
          url:  `/feed`,
          icon: "MessageCircle",
        });
      }

      if (!parentId) setNewComment("");
      onCommentAdded?.();
      await loadComments();
    } catch (e) {
      console.error("Failed to post comment:", e);
      alert("Failed to post comment. Please try again.");
    } finally {
      if (!parentId) setIsSubmitting(false);
    }
  };

  const handleReactToComment = async (commentId: string, reactionType: string) => {
    if (!currentUser) return;

    const flat: CommentData[] = [];
    const collect = (cmts: CommentData[]) =>
      cmts.forEach(c => { flat.push(c); if (c.replies) collect(c.replies); });
    collect(comments);
    const target = flat.find(c => c.id === commentId);
    if (!target) return;

    const currentReactions     = { ...(target.reactions ?? {}) };
    const currentUserReactions = [...(target.user_reactions ?? [])];
    const existingIdx = currentUserReactions.findIndex(r => r.user_email === currentUser.email);
    const existing    = existingIdx > -1 ? currentUserReactions[existingIdx] : null;

    if (existing?.reaction === reactionType) {
      currentReactions[reactionType] = Math.max(0, (currentReactions[reactionType] ?? 0) - 1);
      currentUserReactions.splice(existingIdx, 1);
    } else {
      if (existing) {
        currentReactions[existing.reaction] = Math.max(0, (currentReactions[existing.reaction] ?? 0) - 1);
        currentUserReactions.splice(existingIdx, 1);
      }
      currentReactions[reactionType] = (currentReactions[reactionType] ?? 0) + 1;
      currentUserReactions.push({ user_email: currentUser.email, reaction: reactionType });
    }

    try {
      await fetch(`/api/comments/${commentId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactions: currentReactions, user_reactions: currentUserReactions }),
      });
      await loadComments();
    } catch {
      alert("Failed to react. Please try again.");
    }
  };

  return (
    <div className="px-6 py-4 bg-slate-50/50">
      {/* New comment form */}
      <form onSubmit={handleCommentSubmit} className="mb-4">
        <div className="flex gap-3">
          {currentUser && (
            <Avatar className="w-8 h-8">
              <AvatarImage src={currentUser.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-sm">
                {currentUser.full_name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder={currentUser ? "Write a comment..." : "Log in to comment"}
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
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onCommentAdded={handleCommentSubmit}
              onReact={handleReactToComment}
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
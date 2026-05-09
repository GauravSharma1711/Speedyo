"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  MessageCircle,
  Share2,
  Eye,
  Car,
  Shield,
  Image as ImageIcon,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { format, isValid } from "date-fns";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import ShareModal from "./ShareModal";
import EmojiReactions from "./EmojiReactions";
import CommentSection from "./CommentSection";
import feedService from "@/services/feedService";

type PostReactionMap = Record<string, number>;

type FeedPost = {
  id: string;
  created_date?: string | Date | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;

  author_id?: string | null;
  authorId?: string | null;
  vehicle_id?: string | null;
  vehicleId?: string | null;

  post_type?: string | null;
  content?: string | null;

  views?: number | null;
  comments_count?: number | null;
  shares?: number | null;
  likes?: number | null;

  reactions?: PostReactionMap | null;
  user_reactions?: Array<{ user_email?: string; reaction?: string }> | null;

  images?: string[] | null;
  images_thumbnails?: string[] | null;
  images_small?: string[] | null;
  images_medium?: string[] | null;

  video_url?: string | null;
  video_thumbnail?: string | null;

  article_title?: string | null;
  article_excerpt?: string | null;

  author?: {
    id?: string | null;
    full_name?: string | null;
    profile_image?: string | null;
    user_type?: string | null;
    role?: string | null;
    isVerified?: boolean | null;
  } | null;
};

type PostCardProps = {
  post: FeedPost;
  currentUser?: { id: string; email?: string | null; full_name?: string | null } | null;
  onReact: (reactionType: string | null) => void | Promise<void>;
  onComment: (postId: string) => void | Promise<void>;
  onShare: (post: FeedPost) => void | Promise<void>;
  onEdit: (post: FeedPost) => void;
  onDelete?: (post: FeedPost) => void | Promise<void>;
};

type ApiMe = {
  id: string;
  email?: string | null;
  full_name?: string | null;
};

type ApiPublicUser = {
  id: string;
  user_id?: string;
  full_name?: string | null;
  profile_image?: string | null;
  verified?: boolean | null;
  user_type?: string | null;
  role?: string | null;
};

type ApiVehicle = {
  id: string;
  title?: string | null;
  price?: any;
  status?: string | null;
  verified?: boolean | null;
  primary_image?: string | null;
};

function safeMoney(v: any): string {
  const n = typeof v === "number" ? v : v ? Number(v) : NaN;
  if (!Number.isFinite(n)) return "—";
  return `$${n.toLocaleString()}`;
}

export default function PostCard({
  post,
  currentUser: currentUserProp,
  onReact,
  onComment,
  onShare,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(currentUserProp ?? null);

  const [viewCount, setViewCount] = useState<number>(post.views || 0);

  const [vehicleData, setVehicleData] = useState<ApiVehicle | null>(null);

  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  const createdDateLabel = (() => {
    const raw = post?.created_date ?? post?.createdAt ?? post?.created_at ?? null;
    const d = raw ? new Date(raw) : null;
    return d && isValid(d) ? format(d, "MMM d, h:mm a") : "—";
  })();

  useEffect(() => {
    setCurrentUser(currentUserProp ?? null);
  }, [currentUserProp]);

  useEffect(() => {
    const run = async () => {
      if (!post.vehicle_id && !post.vehicleId) {
        setIsLoadingVehicle(false);
        setVehicleData(null);
        return;
      }

      setIsLoadingVehicle(true);
      try {
        const vid = post.vehicle_id ?? post.vehicleId ?? "";
        const res = await feedService.getVehicle(vid);
        setVehicleData(res.vehicle ?? null);
      } catch {
        setVehicleData(null);
      } finally {
        setIsLoadingVehicle(false);
      }
    };

    run();
  }, [post.vehicle_id, post.vehicleId]);


  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const node = cardRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          timer = setTimeout(async () => {
            if (!sessionStorage.getItem(`post_view_${post.id}`)) {
              setViewCount((prev) => prev + 1);
              sessionStorage.setItem(`post_view_${post.id}`, "true");
              try {
                await feedService.incrementPostViews(post.id);
              } catch (err) {
                console.error("[incrementPostViews] failed:", err);
              }
            }
            observer.disconnect();
          }, 1500);
        } else {
          if (timer) clearTimeout(timer);
        }
      },
      { threshold: 0.5 },
    );

    if (node && !sessionStorage.getItem(`post_view_${post.id}`)) {
      observer.observe(node);
    }

    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [post.id]);

  const isPostOwner = Boolean(currentUser?.id && currentUser.id === (post.author_id ?? post.authorId));

  const PostTypeBadge = ({ type }: { type: string | null | undefined }) => {
    const typeConfig = {
      text: { label: "Text", color: "bg-slate-100 text-slate-700" },
      image: { label: "Photo", color: "bg-blue-100 text-blue-700" },
      video: { label: "Video", color: "bg-purple-100 text-purple-700" },
      vehicle_promo: { label: "Vehicle", color: "bg-emerald-100 text-emerald-700" },
      article: { label: "Article", color: "bg-amber-100 text-amber-800" },
    };
    const key = (type ?? "text") as keyof typeof typeConfig;
    const config = typeConfig[key] ?? typeConfig.text;
    return <Badge className={`text-xs ${config.color}`}>{config.label}</Badge>;
  };

  const totalReactions = post.reactions
    ? Object.values(post.reactions as PostReactionMap).reduce((sum, count) => sum + count, 0)
    : 0;

  const handleDeletePost = async () => {
    if (!onDelete) return;
    if (!confirm("Are you sure you want to delete this post?")) return;
    await onDelete(post);
  };

  return (
    <Card
      ref={cardRef}
      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <CardContent className="p-0">
        {/* Post Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={post.author?.profile_image ?? undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                    {post.author?.full_name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/Profile?id=${post.author?.id ?? post.authorId ?? ""}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-slate-800">{post.author?.full_name ?? "Unknown User"}</h3>
                    </Link>

                    {post.author?.isVerified ? (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    ) : null}

                    {post.author?.role === "admin" ? (
                      <Badge
                        variant="outline"
                        className="text-xs capitalize bg-slate-100 text-slate-700 border-slate-300"
                      >
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs capitalize">
                        {post.author?.user_type === "private_seller"
                          ? "Private Seller"
                          : post.author?.user_type === "dealership"
                            ? "Dealership"
                            : "Member"}
                      </Badge>
                    )}

                    <PostTypeBadge type={post.post_type} />
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    <span>{createdDateLabel}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{post.comments_count || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            </div>

            {/* Actions menu (owner only) */}
            {isPostOwner ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(post)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Post
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDeletePost} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          {post.content ? (
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
          ) : null}

          {/* Media grid */}
          {post.images && post.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative group">
                  {post.post_type === "video" ? (
                    <video
                      src={image}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                    />
                  ) : (
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow cursor-pointer"
                      loading="lazy"
                      onClick={() => {
                        const vid = post.vehicle_id ?? post.vehicleId;
                        if (vid) {
                          window.location.href = `/vehicle?id=${vid}`;
                        }
                      }}
                    />
                  )}
                </div>
              ))}

              {post.images.length > 4 ? (
                <div className="relative bg-slate-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">+{post.images.length - 4} more</span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Vehicle Preview Card */}
          {post.vehicle_id || post.vehicleId ? (
            <Card className="mt-4 overflow-hidden border-slate-200/60 group-hover:border-blue-200/50 transition-colors duration-300">
              {isLoadingVehicle ? (
                <div className="flex gap-3 p-4">
                  <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              ) : vehicleData ? (
                <Link href={`/vehicle?id=${vehicleData.id}`} className="block">
                  <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-blue-200">
                    <div className="flex gap-3 p-3">
                      <div className="w-24 h-20 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                        {vehicleData.primary_image ? (
                          <img
                            src={vehicleData.primary_image}
                            alt={vehicleData.title ?? "Vehicle"}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{vehicleData.title ?? "Vehicle"}</h4>
                        <p className="text-sm text-slate-600">{safeMoney(vehicleData.price)}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${
                              vehicleData.status === "unavailable"
                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                : vehicleData.status === "sold"
                                  ? "bg-slate-100 text-slate-600"
                                  : ""
                            }`}
                          >
                            {vehicleData.status ?? "available"}
                          </Badge>

                          {vehicleData.verified ? (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ) : (
                <div className="flex gap-3 p-4 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  <Car className="w-16 h-16 sm:w-20 sm:h-20 text-slate-300" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Vehicle No Longer Available</p>
                    <p className="text-xs text-slate-400 mt-1">
                      This listing has been removed or is no longer accessible
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ) : null}
        </div>

        {/* Reactions Bar */}
        {totalReactions > 0 || (post.comments_count || 0) > 0 ? (
          <div className="text-slate-500 pr-6 pl-6 pb-3 text-sm">
            <div className="flex items-center justify-between">
              {totalReactions > 0 ? (
                <EmojiReactions
                  post={post as any}
                  onReact={() => {}}
                  currentUser={currentUser as any}
                  compact={true}
                  showCount={false}
                  totalReactions={totalReactions}
                />
              ) : (
                <div />
              )}

              {(post.comments_count || 0) > 0 ? (
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => setShowComments(!showComments)}
                >
                  {post.comments_count} {post.comments_count === 1 ? "comment" : "comments"}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Post Actions */}
        <div className="px-6 py-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <EmojiReactions
                post={post as any}
                currentUser={currentUser as any}
                onReact={onReact}
                interactive={true}
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-slate-500 hover:text-blue-600"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Comment
              </Button>

             <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="text-slate-500 hover:text-emerald-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            </div>
          </div>
        </div>

        {/* Comments section */}
        {showComments ? (
          <div className="border-t border-slate-100">
            <CommentSection
              postId={post.id}
              postCreatorId={post.author_id ?? ""}
              currentUser={currentUser as any}
              onCommentAdded={() => onComment(post.id)}
            />
          </div>
        ) : null}
      </CardContent>
      {showShareModal ? (
        <ShareModal
          post={post}
          onClose={() => setShowShareModal(false)}
          onShare={(postId, platform) => {
            console.log("Shared:", postId, platform);
            onShare(post);
          }}
        />
      ) : null}
    </Card>
  );
}
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

type PostReactionMap = Record<string, number>;

type FeedPost = {
  id: string;
  created_date?: string | Date | null;
  createdAt?: string | Date | null;
  created_at?: string | Date | null;

  author_id?: string | null;
  vehicle_id?: string | null;

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
};

type PostCardProps = {
  post: FeedPost;
  onReact: (reactionType: string | null) => void | Promise<void>;
  onComment: (postId: string) => void | Promise<void>;
  onShare: (post: FeedPost) => void | Promise<void>;
  onEdit: (post: FeedPost) => void;
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
  onReact,
  onComment,
  onShare,
  onEdit,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<ApiMe | null>(null);

  const [viewCount, setViewCount] = useState<number>(post.views || 0);

  const [postAuthor, setPostAuthor] = useState<ApiPublicUser | null>(null);
  const [vehicleData, setVehicleData] = useState<ApiVehicle | null>(null);

  const [isLoadingAuthor, setIsLoadingAuthor] = useState(true);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  

  const cardRef = useRef<HTMLDivElement | null>(null);

  const createdDateLabel = (() => {
    const raw = post?.created_date ?? post?.createdAt ?? post?.created_at ?? null;
    const d = raw ? new Date(raw) : null;
    return d && isValid(d) ? format(d, "MMM d, h:mm a") : "—";
  })();

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/user/me", { cache: "no-store" });
        if (!res.ok) return setCurrentUser(null);
        const json = (await res.json()) as { user?: ApiMe };
        setCurrentUser(json.user ?? null);
      } catch {
        setCurrentUser(null);
      }
    };
    run();
  }, []);

  // Fetch post author
  useEffect(() => {
    const run = async () => {
      if (!post.author_id) {
        setIsLoadingAuthor(false);
        setPostAuthor({
          id: "unknown",
          user_id: "unknown",
          full_name: "Unknown User",
          user_type: "guest",
          profile_image: null,
          verified: false,
          role: "user",
        });
        return;
      }

      setIsLoadingAuthor(true);
      try {
        const res = await fetch(
          `/api/user/public?userId=${encodeURIComponent(post.author_id)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("author fetch failed");
        const json = (await res.json()) as { user?: ApiPublicUser };
        setPostAuthor(
          json.user ?? {
            id: "unknown",
            user_id: post.author_id,
            full_name: "Unknown User",
            user_type: "guest",
            profile_image: null,
            verified: false,
            role: "user",
          },
        );
      } catch {
        setPostAuthor({
          id: "unknown",
          user_id: post.author_id ?? "unknown",
          full_name: "Unknown User",
          user_type: "guest",
          profile_image: null,
          verified: false,
          role: "user",
        });
      } finally {
        setIsLoadingAuthor(false);
      }
    };

    run();
  }, [post.author_id]);

  useEffect(() => {
    const run = async () => {
      if (!post.vehicle_id) {
        setIsLoadingVehicle(false);
        setVehicleData(null);
        return;
      }

      setIsLoadingVehicle(true);
      try {
        const res = await fetch(`/api/vehicles/${encodeURIComponent(post.vehicle_id)}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("vehicle fetch failed");
        const json = (await res.json()) as { vehicle?: ApiVehicle };
        setVehicleData(json.vehicle ?? null);
      } catch {
        setVehicleData(null);
      } finally {
        setIsLoadingVehicle(false);
      }
    };

    run();
  }, [post.vehicle_id]);

  // View counter (client-only increment for now; can be wired to /api/post/incrementPostViews later)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const node = cardRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            if (!sessionStorage.getItem(`post_view_${post.id}`)) {
              setViewCount((prev) => prev + 1);
              sessionStorage.setItem(`post_view_${post.id}`, "true");
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

  const isPostOwner = Boolean(currentUser?.id && currentUser.id === post.author_id);

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
    alert("Delete wiring pending (no API route connected).");
  };

  const authorName = postAuthor?.full_name || "Unknown User";
  const authorAvatar = postAuthor?.profile_image || "";
  const authorInitial = (authorName?.trim()?.[0] ?? "U").toUpperCase();

  return (
    <Card
      ref={cardRef}
      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              {isLoadingAuthor ? (
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ) : (
                <>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                      {authorInitial}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/profile?id=${postAuthor?.user_id ?? post.author_id ?? ""}`}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-slate-800">{authorName}</h3>
                      </Link>

                      {postAuthor?.verified ? (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : null}

                      {postAuthor?.role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="text-xs capitalize bg-slate-100 text-slate-700 border-slate-300"
                        >
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs capitalize">
                          {postAuthor?.user_type === "private_seller"
                            ? "Private Seller"
                            : postAuthor?.user_type === "dealership"
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
              )}
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

          {/* Vehicle preview card */}
          {post.vehicle_id ? (
            <Card className="mt-4 overflow-hidden border-slate-200/60">
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
                  <div className="flex gap-3 p-3 hover:bg-slate-50 transition-colors">
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

        {/* Reactions summary row */}
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

        {/* Action buttons */}
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

          // optional parent callback
          onShare(post);
        }}
      />
    ) : null}
    </Card>
  );
}
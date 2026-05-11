"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Car, MapPin, Image, Video, FileText, Loader2, Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

import CreatePost from "@/components/feed/CreatePost";
import PostCard from "@/components/feed/PostCard";
import FeedFilters from "@/components/feed/FeedFilters";
import TypewriterHint from "@/components/feed/TypewriterHint";
import EditPostModal from "@/components/feed/EditPostModal";
import ShareModal from "@/components/feed/ShareModal";

import { useFeedStore } from "@/store/feed";
import { useUserStore } from "@/store/user/userStore";
import { useFollowStore } from "@/store/user/followStore";

export default function FeedPage() {
  const {
    posts,
    featuredVehicles,
    isLoading,
    isCreating,
    getAll,
    getFeaturedVehicles,
    createPost,
    reactToPost,
    commentPost,
    sharePost,
    incrementViews,
    getVehicleById,
    deletePost,
  } = useFeedStore();

  const { user: currentUser, fetchMe } = useUserStore();
  const { following, fetchFollowing } = useFollowStore();

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [initialPostType, setInitialPostType] = useState("text");
  const [feedView, setFeedView] = useState<"all" | "following" | "global">("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [sharingPost, setSharingPost] = useState<any>(null);

  const postsRef = useRef<any[]>([]);

  useEffect(() => {
    fetchMe();
    fetchFollowing();
  }, [fetchMe, fetchFollowing]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  const followedUserIds = useMemo(
    () => following.map((f) => f.followed_id),
    [following]
  );

  const followedPosts = useMemo(
    () => posts.filter((p) => followedUserIds.includes(p.authorId)),
    [posts, followedUserIds]
  );
  const globalPosts = useMemo(
    () => posts.filter((p) => !followedUserIds.includes(p.authorId)),
    [posts, followedUserIds]
  );

  // Mobile create post event
  useEffect(() => {
    const handler = (e: any) => {
      setInitialPostType(e.detail?.type || "text");
      setShowCreatePost(true);
    };
    window.addEventListener("openCreatePost", handler);
    return () => window.removeEventListener("openCreatePost", handler);
  }, []);

  useEffect(() => {
    getAll();
    getFeaturedVehicles();
  }, []);

  const handleCreatePost = async (postData: any): Promise<{ id: string } | null> => {
    try {
      const result = await createPost(postData);
      setShowCreatePost(false);
      return result ? { id: result.id } : null;
    } catch (error) {
      console.error("Failed to create post:", error);
      return null;
    }
  };

  const handleReactToPost = async (post: any, reactionType: string | null) => {
    try {
      await reactToPost(post.id, reactionType, currentUser?.email ?? null);
    } catch {
      console.error("Reaction failed");
    }
  };

  const handleCommentOnPost = (postId: string) => {
    commentPost(postId, { content: "" });
  };

  const handleSharePost = async (postId: string) => {
    await sharePost(postId);
    setShowShareModal(false);
    setSharingPost(null);
  };

  const handleDeletePost = async (post: any) => {
    await deletePost(post.id);
  };

  const getSortedPosts = (list: any[]) => {
    const sorted = [...list];
    switch (sortBy) {
      case "popular":
        return sorted.sort((a, b) => {
          const r = (p: any) =>
            p.reactions ? Object.values(p.reactions).reduce((s: number, c: any) => s + c, 0) : 0;
          return (r(b) + (b.likes || 0)) - (r(a) + (a.likes || 0));
        });
      case "viewed":
        return sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "interactive":
        return sorted.sort(
          (a, b) =>
            (b.comments_count || 0) + (b.shares || 0) - ((a.comments_count || 0) + (a.shares || 0))
        );
      case "trending": {
        const ago = new Date(Date.now() - 86400000);
        return sorted
          .filter((p) => (p.createdAt ? new Date(p.createdAt) > ago : false))
          .sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
      }
      case "engagement":
        return sorted.sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0));
      default:
        return sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
  };

  const getDisplayPosts = () => {
    if (feedView === "following") return getSortedPosts(followedPosts);
    if (feedView === "global") return getSortedPosts(globalPosts);
    return [...getSortedPosts(followedPosts), ...getSortedPosts(globalPosts)];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border shadow-sm bg-white/80 backdrop-blur-sm">
        {/* Create Post Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 w-full">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <AvatarImage src={currentUser?.profile_image ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                  {currentUser?.full_name?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 relative">
                <div
                  className="flex-1 justify-between text-slate-500 border border-slate-200 h-12 rounded-lg px-3 sm:px-4 flex items-center cursor-pointer hover:bg-blue-50/50"
                  onClick={() => {
                    setInitialPostType("text");
                    setShowCreatePost(true);
                  }}
                >
                  <TypewriterHint
                    phrases={[
                      "Share your latest vehicle find...",
                      "Post a picture of your car for sale...",
                      "Upload a video of the new tires...",
                    ]}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInitialPostType("image");
                      setShowCreatePost(true);
                    }}
                  >
                    <Image className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="hidden md:flex justify-around items-center border-t border-slate-200/60 pt-3 mt-4">
              <Button
                variant="ghost"
                className="text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                onClick={() => {
                  setInitialPostType("image");
                  setShowCreatePost(true);
                }}
              >
                <Image className="w-5 h-5 mr-2 text-purple-500" />
                Image
              </Button>
              <Button
                variant="ghost"
                className="text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => {
                  setInitialPostType("video");
                  setShowCreatePost(true);
                }}
              >
                <Video className="w-5 h-5 mr-2 text-rose-500" />
                Video
              </Button>
              <Button
                variant="ghost"
                className="text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={() => {
                  setInitialPostType("text");
                  setShowCreatePost(true);
                }}
              >
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Article
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feed View Toggle */}
        {followedUserIds.length > 0 && (
          <Card className="bg-white/80 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex gap-2">
                {(["all", "following", "global"] as const).map((view) => (
                  <Button
                    key={view}
                    variant={feedView === view ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedView(view)}
                    className={
                      feedView === view
                        ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                        : ""
                    }
                  >
                    {view === "following" && <Users className="w-4 h-4 mr-2" />}
                    {view === "all"
                      ? "All Posts"
                      : view === "following"
                        ? `Following (${followedPosts.length})`
                        : `Global (${globalPosts.length})`}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <FeedFilters sortBy={sortBy} setSortBy={setSortBy} />

        <AnimatePresence>
          {showCreatePost && (
            <CreatePost
              currentUser={currentUser ? { id: currentUser.id, full_name: currentUser.full_name ?? undefined } : null}
              vehicles={[]}
              onCreatePost={handleCreatePost}
              onCancel={() => setShowCreatePost(false)}
              initialPostType={initialPostType as "text" | "image" | "video"}
            />
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Followed posts section */}
          {feedView === "all" && followedPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">From People You Follow</h3>
              </div>
              <AnimatePresence>
                {getSortedPosts(followedPosts).map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <PostCard
                      post={post}
                      currentUser={currentUser}
                      onReact={(rt) => handleReactToPost(post, rt)}
                      onComment={() => handleCommentOnPost(post.id)}
                      onShare={() => {
                        setSharingPost(post);
                        setShowShareModal(true);
                      }}
                      onEdit={() => {
                        setEditingPost(post);
                        setShowEditModal(true);
                      }}
                      onDelete={handleDeletePost}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {feedView === "all" && globalPosts.length > 0 && followedPosts.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg">
              <Star className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-800">Discover More</h3>
            </div>
          )}

          {/* Non-"all" feed views */}
          {feedView !== "all" && (
            <AnimatePresence>
              {getDisplayPosts().map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onReact={(rt) => handleReactToPost(post, rt)}
                    onComment={() => handleCommentOnPost(post.id)}
                    onShare={() => {
                      setSharingPost(post);
                      setShowShareModal(true);
                    }}
                    onEdit={() => {
                      setEditingPost(post);
                      setShowEditModal(true);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Global posts in "all" view */}
          {feedView === "all" && (
            <AnimatePresence>
              {getSortedPosts(globalPosts).map((post, i) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (followedPosts.length + i) * 0.1 }}
                >
                  <PostCard
                    post={post}
                    currentUser={currentUser}
                    onReact={(rt) => handleReactToPost(post, rt)}
                    onComment={() => handleCommentOnPost(post.id)}
                    onShare={() => {
                      setSharingPost(post);
                      setShowShareModal(true);
                    }}
                    onEdit={() => {
                      setEditingPost(post);
                      setShowEditModal(true);
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Empty states */}
        {getDisplayPosts().length === 0 && !isLoading && (
          <Card className="bg-white/80 border-0 shadow-lg">
            <CardContent className="text-center py-16 text-slate-500">
              <h3 className="text-lg font-semibold mb-2">
                {sortBy === "trending"
                  ? "No trending posts right now"
                  : "No posts available"}
              </h3>
              <p className="text-sm">
                {sortBy === "trending"
                  ? "Check back later or try a different filter!"
                  : feedView === "following"
                    ? "Follow some users to see their posts here!"
                    : "Try creating one or adjust your filters!"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Featured Vehicles */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-0 shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Featured Vehicles</h2>
            <div className="flex gap-6 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6">
              {featuredVehicles.slice(0, 6).map((vehicle) => (
                <Card
                  key={vehicle.id}
                  className="bg-white/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex-shrink-0 w-72 md:w-auto"
                >
                  <Link href={`/vehicle?id=${vehicle.id}`}>
                    <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg relative overflow-hidden">
                      {vehicle.primary_image ? (
                        <img
                          src={vehicle.primary_image}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Car className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-amber-500">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                      {vehicle.verified && (
                        <Badge className="absolute top-3 right-3 bg-emerald-500">Verified</Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-slate-800">{vehicle.title}</h3>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        ${Number(vehicle.price).toLocaleString()}
                      </p>
                      <div className="flex items-center text-sm text-slate-500 mt-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {vehicle.location ?? "Location not specified"}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
            {featuredVehicles.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium mb-1">No Featured Vehicles Yet</p>
                <p className="text-sm">Check back soon for our hand-picked selections!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {showEditModal && editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => {
            setShowEditModal(false);
            setEditingPost(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setEditingPost(null);
            getAll();
          }}
        />
      )}
      {showShareModal && sharingPost && (
        <ShareModal
          post={sharingPost}
          onClose={() => {
            setShowShareModal(false);
            setSharingPost(null);
          }}
          onShare={() => handleSharePost(sharingPost.id)}
        />
      )}
    </div>
  );
}
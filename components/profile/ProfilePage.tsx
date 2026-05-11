"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useProfileStore } from "@/store/profile/profile";
import { usePostActionsStore } from "@/store/posts/postActions";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Badge } from "@/components/ui/Badge";
import VehicleCard from "@/components/marketplace/VehicleCard";
import PostCard from "@/components/feed/PostCard";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  LogIn,
  MapPin,
  Edit,
  Shield,
  User as UserIcon,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id");

  const {
    isLoading,
    error,
    me,
    profile,
    vehicles,
    posts,
    followerCount,
    followingCount,
    isFollowing,
    isFollowLoading,
    load,
    toggleFollow,
    updatePostLocal,
  } = useProfileStore();

  const { react, share, syncComments } = usePostActionsStore();

  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    load(profileId);
  }, [load, profileId]);

  const isOwnProfile = useMemo(() => {
    if (!me || !profile) return false;
    const profileUserId = profile.user_id ?? profile.id;
    return profileUserId === me.id;
  }, [me, profile]);

  const displayName = profile?.full_name ?? "User";
  const displayInitial = (displayName?.trim()?.[0] ?? "U").toUpperCase();

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile && !profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          View Your Profile
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          Please sign in to manage your listings, view your posts, and edit your
          profile information.
        </p>

        <Button onClick={() => router.push("/signIn")} size="lg">
          <LogIn className="w-5 h-5 mr-2" />
          Sign in / Register
        </Button>

        {error ? (
          <p className="text-sm text-red-600 mt-4 max-w-md break-words">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  // Viewing another user's profile but not found
  if (!profile && profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <UserIcon className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Profile Not Available
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          This user&apos;s profile is not publicly available, or they
          haven&apos;t created any content yet.
        </p>
        {error ? (
          <p className="text-sm text-red-600 max-w-md break-words">{error}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <AnimatePresence>
        {showEditModal && profile ? (
          <EditProfileModal
            user={profile}
            onClose={() => setShowEditModal(false)}
            onSave={() => {
              setShowEditModal(false);
              load(profileId);
            }}
          />
        ) : null}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        ) : null}

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                <AvatarImage src={profile?.profile_image ?? ""} />
                <AvatarFallback className="text-5xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                  {displayInitial}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {profile?.full_name ?? "—"}
                    </h1>

                    <div className="flex items-center gap-4 justify-center sm:justify-start mt-2">
                      {profile?.role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="capitalize text-md px-3 py-1 bg-slate-100 text-slate-700 border-slate-300"
                        >
                          Admin
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="capitalize text-md px-3 py-1"
                        >
                          {profile?.user_type === "private_seller"
                            ? "Private Seller"
                            : profile?.user_type === "dealership"
                              ? "Dealership"
                              : "Guest"}
                        </Badge>
                      )}

                      {profile?.verified ? (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-6 mt-4 justify-center sm:justify-start">
                      <div className="text-center sm:text-left">
                        <div className="text-2xl font-bold text-slate-800">
                          {followerCount}
                        </div>
                        <div className="text-sm text-slate-500">Followers</div>
                      </div>
                      <div className="text-center sm:text-left">
                        <div className="text-2xl font-bold text-slate-800">
                          {followingCount}
                        </div>
                        <div className="text-sm text-slate-500">Following</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3 mt-4 sm:mt-0">
                    {isOwnProfile ? (
                      <Button
                        onClick={() => setShowEditModal(true)}
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      me && (
                        <Button
                          onClick={() => toggleFollow()}
                          disabled={isFollowLoading}
                          className={
                            isFollowing
                              ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
                              : "bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                          }
                        >
                          {isFollowLoading ? (
                            <>Loading...</>
                          ) : isFollowing ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {profile?.location ? (
                  <div className="flex items-center gap-2 text-slate-500 mt-3 justify-center sm:justify-start">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {profile?.bio ? (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-slate-600 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="listings">
              Listings ({vehicles.length})
            </TabsTrigger>
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle as any} />
              ))}
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                {isOwnProfile
                  ? "You haven't listed any vehicles yet."
                  : "This user hasn't listed any vehicles yet."}
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post as any}
                  currentUser={me}
                  onReact={async (reactionType) => {
                    const updated = await react(post.id, reactionType as any);
                    if (!updated) return;

                    updatePostLocal(post.id, {
                      reactions: updated.reactions,
                      user_reactions: updated.user_reactions,
                      likes: updated.likes ?? updated.reactions?.like ?? 0,
                    });
                  }}
                  onComment={async () => {
                    const res = await syncComments(post.id);
                    if (!res) return;
                    updatePostLocal(post.id, { comments_count: res.comments_count });
                  }}
                  onShare={async () => {
                    const res = await share(post.id);
                    if (!res) return;
                    updatePostLocal(post.id, { shares: res.shares });
                  }}
                  onEdit={() => {}}
                />
              ))}
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                {isOwnProfile
                  ? "You haven't made any posts yet."
                  : "This user hasn't made any posts yet."}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
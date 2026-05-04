"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { User, Vehicle, Post, Comment, Notification,PublicUser,Follow } from "@/api/entities";


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
  const [profileData, setProfileData] = useState<any>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userVehicles, setUserVehicles] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  // Follow feature states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRecordId, setFollowRecordId] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // Next.js: useSearchParams replaces useLocation + URLSearchParams
  const searchParams = useSearchParams();
  const profileId = searchParams.get("id");

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const me = await User.me().catch(() => null);
      setLoggedInUser(me);

      let userToLoad: any;

      if (profileId && profileId !== "undefined" && profileId !== me?.id) {
        // Viewing another user's profile
        try {
          const profiles = await PublicUser.filter({ user_id: profileId });
          userToLoad = profiles.length > 0 ? profiles[0] : null;
          if (!userToLoad) {
            console.warn(`No PublicUser found for user_id: ${profileId}`);
          }
        } catch (error) {
          console.error("Failed to fetch public profile:", error);
          userToLoad = null;
        }

        if (userToLoad) {
          const [managedVehicles, directVehicles, postsData] = await Promise.all([
            Vehicle.filter({ original_owner_id: userToLoad.user_id }, "-created_date").catch(() => []),
            Vehicle.filter({ author_id: userToLoad.user_id }, "-created_date").catch(() => []),
            Post.filter({ author_id: userToLoad.user_id }, "-created_date").catch(() => []),
          ]);

          const allVehicles = [...managedVehicles];
          directVehicles.forEach((vehicle: any) => {
            if (!allVehicles.find((v: any) => v.id === vehicle.id)) {
              allVehicles.push(vehicle);
            }
          });

          setUserVehicles(allVehicles);
          setUserPosts(postsData);
        }
      } else {
        // Viewing own profile
        userToLoad = me;
        if (userToLoad) {
          try {
            const publicProfiles = await PublicUser.filter({ user_id: userToLoad.id });
            if (publicProfiles.length > 0) {
              const pub = publicProfiles[0];
              userToLoad = {
                ...userToLoad,
                full_name: pub.full_name,
                bio: pub.bio,
                location: pub.location,
                profile_image: pub.profile_image,
                verified: pub.verified,
                user_type: pub.user_type,
                role: pub.role,
              };
            }
          } catch (syncError) {
            console.error("Failed to sync own PublicUser profile:", syncError);
          }

          const [managedVehicles, directVehicles, postsData] = await Promise.all([
            Vehicle.filter({ original_owner_id: userToLoad.id }, "-created_date"),
            Vehicle.filter({ author_id: userToLoad.id }, "-created_date"),
            Post.filter({ author_id: userToLoad.id }, "-created_date"),
          ]);

          const allVehicles = [...managedVehicles];
          directVehicles.forEach((vehicle: any) => {
            if (!allVehicles.find((v: any) => v.id === vehicle.id)) {
              allVehicles.push(vehicle);
            }
          });

          setUserVehicles(allVehicles);
          setUserPosts(postsData);
        }
      }

      setProfileData(userToLoad);
    } catch (e) {
      console.error("Failed to load profile data:", e);
      setProfileData(null);
    }
    setIsLoading(false);
  }, [profileId]);

  const loadFollowData = useCallback(async () => {
    if (!profileData) return;

    const profileUserId = profileData.user_id || profileData.id;
    if (!profileUserId) return;

    try {
      const followers = await Follow.filter({ followed_id: profileUserId });
      setFollowerCount(followers.length);

      const following = await Follow.filter({ follower_id: profileUserId });
      setFollowingCount(following.length);

      if (loggedInUser && loggedInUser.id !== profileUserId) {
        const existingFollow = followers.find(
          (f: any) => f.follower_id === loggedInUser.id
        );
        if (existingFollow) {
          setIsFollowing(true);
          setFollowRecordId(existingFollow.id);
        } else {
          setIsFollowing(false);
          setFollowRecordId(null);
        }
      }
    } catch (error) {
      console.error("Failed to load follow data:", error);
    }
  }, [profileData, loggedInUser]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  useEffect(() => {
    if (profileData) {
      loadFollowData();
    }
  }, [profileData, loadFollowData]);

  const handleFollowToggle = async () => {
    if (!loggedInUser) {
      alert("Please log in to follow users");
      return;
    }

    const profileUserId = profileData.user_id || profileData.id;

    setIsFollowLoading(true);
    try {
      if (isFollowing && followRecordId) {
        await Follow.delete(followRecordId);
        setIsFollowing(false);
        setFollowRecordId(null);
        setFollowerCount((prev) => Math.max(0, prev - 1));
      } else {
        const newFollow = await Follow.create({
          follower_id: loggedInUser.id,
          followed_id: profileUserId,
        });
        setIsFollowing(true);
        setFollowRecordId(newFollow.id);
        setFollowerCount((prev) => prev + 1);

        try {
          const currentUserProfiles = await PublicUser.filter({
            user_id: loggedInUser.id,
          });
          const currentUserName =
            currentUserProfiles.length > 0
              ? currentUserProfiles[0].full_name
              : loggedInUser.full_name || "Someone";

          await Notification.create({
            recipient_id: profileUserId,
            sender_id: loggedInUser.id,
            type: "new_follower",
            content: `${currentUserName} started following you`,
            url: `/profile?id=${loggedInUser.id}`,
            icon: "UserPlus",
            read: false,
          });
        } catch (notifError) {
          console.error("Failed to create follow notification:", notifError);
        }
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      alert("Failed to update follow status. Please try again.");
    }
    setIsFollowLoading(false);
  };

  const handleSaveProfile = () => {
    setShowEditModal(false);
    loadProfileData();
  };

  const handleReactToPost = async (post: any, reactionType: string) => {
    if (!loggedInUser) return;

    const updatedReactions = { ...(post.reactions || {}) };
    const updatedUserReactions = [...(post.user_reactions || [])];

    const existingReactionIndex = updatedUserReactions.findIndex(
      (ur: any) => ur.user_email === loggedInUser.email
    );

    if (existingReactionIndex > -1) {
      const oldReaction = updatedUserReactions[existingReactionIndex].reaction;
      updatedReactions[oldReaction] = Math.max(
        0,
        (updatedReactions[oldReaction] || 0) - 1
      );
      updatedUserReactions.splice(existingReactionIndex, 1);
    }

    const existingReaction = post.user_reactions?.find(
      (ur: any) => ur.user_email === loggedInUser.email
    )?.reaction;

    if (existingReaction !== reactionType) {
      updatedReactions[reactionType] =
        (updatedReactions[reactionType] || 0) + 1;
      updatedUserReactions.push({
        user_email: loggedInUser.email,
        reaction: reactionType,
      });
    }

    await Post.update(post.id, {
      reactions: updatedReactions,
      user_reactions: updatedUserReactions,
    });
    loadProfileData();
  };

  const handleCommentOnPost = async (postId: string) => {
    const post = userPosts.find((p: any) => p.id === postId);
    if (post) {
      const comments = await Comment.filter(
        { post_id: postId },
        "-created_date"
      );
      await Post.update(postId, { comments_count: comments.length });
      loadProfileData();
    }
  };

  const handleSharePost = async (postId: string) => {
    const post = userPosts.find((p: any) => p.id === postId);
    if (post) {
      await Post.update(postId, { shares: (post.shares || 0) + 1 });
      loadProfileData();
    }
  };

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

  if (!profileData && !profileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          View Your Profile
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          Please log in to manage your listings, view your posts, and edit your
          profile information.
        </p>
        <Button
          onClick={() => (window.location.href = "https://speedio.app/login")}
          size="lg"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login / Register
        </Button>
      </div>
    );
  }

  if (!profileData && profileId) {
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
      </div>
    );
  }

  const isOwnProfile =
    loggedInUser &&
    (profileData.id === loggedInUser.id ||
      profileData.user_id === loggedInUser.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            user={profileData}
            onClose={() => setShowEditModal(false)}
            onSave={handleSaveProfile}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-32 h-32 border-4 border-white shadow-md">
                <AvatarImage src={profileData.profile_image} />
                <AvatarFallback className="text-5xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                  {profileData.full_name?.[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {profileData.full_name}
                    </h1>
                    <div className="flex items-center gap-4 justify-center sm:justify-start mt-2">
                      {profileData.role === "admin" ? (
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
                          {profileData.user_type === "private_seller"
                            ? "Private Seller"
                            : profileData.user_type === "dealership"
                            ? "Dealership"
                            : "Guest"}
                        </Badge>
                      )}
                      {profileData.verified && (
                        <div className="flex items-center gap-1 text-blue-600">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Follow Stats */}
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
                      loggedInUser && (
                        <Button
                          onClick={handleFollowToggle}
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
                {profileData.location && (
                  <div className="flex items-center gap-2 text-slate-500 mt-3 justify-center sm:justify-start">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{profileData.location}</span>
                  </div>
                )}
              </div>
            </div>
            {profileData.bio && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-slate-600 whitespace-pre-wrap">
                  {profileData.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="listings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-96">
            <TabsTrigger value="listings">
              Listings ({userVehicles.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Posts ({userPosts.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="listings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userVehicles.map((vehicle: any) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
            {userVehicles.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                {isOwnProfile
                  ? "You haven't listed any vehicles yet."
                  : "This user hasn't listed any vehicles yet."}
              </div>
            )}
          </TabsContent>
          <TabsContent value="posts" className="mt-6">
            <div className="space-y-6">
              {userPosts.map((post: any) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onReact={(emoji: string) => handleReactToPost(post, emoji)}
                  onComment={() => handleCommentOnPost(post.id)}
                  onShare={() => handleSharePost(post.id)}
                  onEdit={() => {}}
                />
              ))}
            </div>
            {userPosts.length === 0 && (
              <div className="text-center py-16 text-slate-500">
                {isOwnProfile
                  ? "You haven't made any posts yet."
                  : "This user hasn't made any posts yet."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
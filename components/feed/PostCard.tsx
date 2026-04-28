"use client"

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { MessageCircle, Share2, Eye, Car, Shield, Image as ImageIcon, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/DropdownMenu";
import { UserEntity, Post, PublicUser, Vehicle } from "@/api/entities";


import EmojiReactions from "./EmojiReactions";
import CommentSection from "./CommentSection";
// ShareModal and EditPostModal are now managed by the parent component (e.g., Feed)

export default function PostCard({ post, onReact, onComment, onShare, onEdit }) {
  const [showComments, setShowComments] = useState(false);
  // Removed showShareModal and showEditModal local states as they are now handled by the parent
  const [currentUser, setCurrentUser] = useState(null);
  const [viewCount, setViewCount] = useState(post.views || 0);
  const [postAuthor, setPostAuthor] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [isLoadingAuthor, setIsLoadingAuthor] = useState(true);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    let timer;
    const node = cardRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          timer = setTimeout(async () => {
            try {
              if (!sessionStorage.getItem(`post_view_${post.id}`)) {
                await Post.update(post.id, { views: (post.views || 0) + 1 });
                setViewCount((prev) => prev + 1);
                sessionStorage.setItem(`post_view_${post.id}`, 'true');
              }
            } catch (error) {
              // Silently ignore view count errors
            }
            observer.disconnect();
          }, 2000);
        } else {
          clearTimeout(timer);
        }
      },
      { threshold: 0.5 }
    );

    if (node && !sessionStorage.getItem(`post_view_${post.id}`)) {
      observer.observe(node);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [post.id, post.views]);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
      const user = await UserEntity.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };

    getCurrentUser();
  }, []);

  // Fetch post author from PublicUser using author_id (user ID)
  useEffect(() => {
    const fetchPostAuthor = async () => {
      if (!post.author_id) {
        setIsLoadingAuthor(false);
        setPostAuthor({
          full_name: "Unknown User",
          user_type: "guest",
          profile_image: null,
          verified: false
        });
        return;
      }
      
      try {
        const authorProfiles = await PublicUser.filter({ user_id: post.author_id });
        if(authorProfiles.length > 0) {
          setPostAuthor(authorProfiles[0]);
        } else {
          setPostAuthor({
            full_name: "Unknown User", 
            user_type: "guest",
            profile_image: null,
            verified: false
          });
        }
      } catch (error) {
        console.error("Failed to fetch post author:", error);
        setPostAuthor({
          full_name: "Unknown User",
          user_type: "guest", 
          profile_image: null,
          verified: false
        });
      } finally {
        setIsLoadingAuthor(false);
      }
    };

    fetchPostAuthor();
  }, [post.author_id]);

  // Fetch vehicle data using vehicle_id (vehicle entity ID)
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!post.vehicle_id) {
        setIsLoadingVehicle(false); // No vehicle to load
        setVehicleData(null);
        return;
      }
      
      setIsLoadingVehicle(true);
      try {
        // Use Vehicle.get() with actual vehicle ID
        const vehicle = await Vehicle.get(post.vehicle_id);
        setVehicleData(vehicle);
      } catch (error) {
        // Silently handle missing/deleted vehicles without breaking the UI
        if (error.response?.status === 404) {
          console.warn(`Vehicle ${post.vehicle_id} not found (likely deleted)`);
        } else {
          console.error("Failed to fetch vehicle:", error);
        }
        setVehicleData(null);
      } finally {
        setIsLoadingVehicle(false);
      }
    };

    fetchVehicle();
  }, [post.vehicle_id]);

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await Post.delete(post.id);
        window.location.reload();
      } catch (error) {
        console.error("Failed to delete post:", error);
        alert("Failed to delete post. Please try again.");
      }
    }
  };

  // Removed handleEditPost as onEdit prop will be called directly

  // Determine if the currently logged-in user is the owner of the post
  // Assuming currentUser.id is the unique identifier for the logged-in user
  // and post.author_id is the unique identifier for the post's author.
  const isPostOwner = currentUser && (currentUser.id === post.author_id);

  const PostTypeBadge = ({ type }) => {
    const typeConfig = {
      text: { label: "Text", color: "bg-slate-100 text-slate-700" },
      image: { label: "Photo", color: "bg-blue-100 text-blue-700" },
      video: { label: "Video", color: "bg-purple-100 text-purple-700" },
      vehicle_promo: { label: "Vehicle", color: "bg-emerald-100 text-emerald-700" }
    };
    const config = typeConfig[type] || typeConfig.text;
    return <Badge className={`text-xs ${config.color}`}>{config.label}</Badge>;
  };

  const totalReactions = post.reactions ?
    Object.values(post.reactions).reduce((sum, count) => sum + count, 0) : 0;

  const engagementScore = (post.likes || 0) +
    (post.shares || 0) * 2 +
    (post.comments_count || 0) * 1.5 +
    totalReactions;

  return (
    <Card ref={cardRef} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        {/* Post Header */}
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
                    <AvatarImage src={postAuthor?.profile_image} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white font-semibold">
                      {postAuthor?.full_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Use postAuthor.user_id (the user ID) for profile navigation */}
                     <Link href={`/profile?id=${postAuthor?.user_id}`} className="hover:underline">

                        <h3 className="font-semibold text-slate-800">
                          {postAuthor?.full_name || "Unknown User"}
                        </h3>
                      </Link>
                      {postAuthor?.verified && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {postAuthor?.role === 'admin' ? (
                        <Badge variant="outline" className="text-xs capitalize bg-slate-100 text-slate-700 border-slate-300">
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs capitalize">
                          {postAuthor?.user_type === 'private_seller' ? 'Private Seller' :
                            postAuthor?.user_type === 'dealership' ? 'Dealership' : 'Member'}
                        </Badge>
                      )}
                      <PostTypeBadge type={post.post_type} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                      <span>{format(new Date(post.created_date), 'MMM d, h:mm a')}</span>
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

            {/* Post Actions Menu (Only show for post owner) */}
            {isPostOwner &&
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
            }
          </div>
        </div>

        {/* Post Content */}
        <div className="px-6 pb-4">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap mb-4">
            {post.content}
          </p>

          {/* Media Content */}
          {post.images && post.images.length > 0 &&
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {post.images.slice(0, 4).map((image, index) =>
                <div key={index} className="relative group">
                  {post.post_type === 'video' ?
                    <video
                      ref={(el) => {
                        if (el) {
                          const observer = new IntersectionObserver(
                            ([entry]) => {
                              if (entry.isIntersecting) {
                                el.play().catch(() => { }); // play when visible
                              } else {
                                el.pause(); // pause when offscreen
                              }
                            },
                            { threshold: 0.5 }
                          );
                          observer.observe(el);
                        }
                      }}
                      src={image}
                      controls
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow">

                      Your browser does not support the video tag.
                    </video> :

                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow cursor-pointer"
                      loading="lazy" />

                  }
                </div>
              )}
              {post.images.length > 4 &&
                <div className="relative bg-slate-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-slate-600">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm font-medium">+{post.images.length - 4} more</span>
                  </div>
                </div>
              }
            </div>
          }

          {/* Vehicle Preview Card */}
          {post.vehicle_id && (
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
                            alt={vehicleData.title}
                            className="w-full h-full object-cover"
                            loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Car className="w-8 h-8 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 truncate">{vehicleData.title}</h4>
                        <p className="text-sm text-slate-600">${vehicleData.price?.toLocaleString()}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs capitalize ${
                              vehicleData.status === 'unavailable' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                              vehicleData.status === 'sold' ? 'bg-slate-100 text-slate-600' : ''
                            }`}
                          >
                            {vehicleData.status}
                          </Badge>
                          {vehicleData.verified && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
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
                    <p className="text-xs text-slate-400 mt-1">This listing has been removed or is no longer accessible</p>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Reactions Bar */}
        {(totalReactions > 0 || (post.comments_count || 0) > 0) &&
          <div className="text-slate-500 pr-6 pl-6 pb-3 text-sm">
            <div className="flex items-center justify-between">
              {totalReactions > 0 &&
                <EmojiReactions
                  post={post}
                  reactions={post.reactions}
                  compact={true}
                  showCount={false} // Changed to false based on the prompt
                  totalReactions={totalReactions} />

              }
              {(post.comments_count || 0) > 0 &&
                <span className="cursor-pointer hover:underline" onClick={() => setShowComments(!showComments)}>
                  {post.comments_count} {post.comments_count === 1 ? 'comment' : 'comments'}
                </span>
              }
            </div>
          </div>
        }

        {/* Post Actions */}
        <div className="px-6 py-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <EmojiReactions
                post={post}
                reactions={post.reactions}
                userReactions={post.user_reactions}
                currentUser={currentUser}
                onReact={onReact}
                interactive={true} />

            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="text-slate-500 hover:text-blue-600">

                <MessageCircle className="w-4 h-4 mr-2" />
                Comment
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(post)}
                className="text-slate-500 hover:text-emerald-600">

                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments &&
          <div className="border-t border-slate-100">
            <CommentSection
              postId={post.id}
              postCreatorId={post.author_id}
              currentUser={currentUser}
              onCommentAdded={() => onComment(post.id)} />

          </div>
        }
        {/* ShareModal and EditPostModal components are now rendered by a parent component */}
      </CardContent>
    </Card>
  );
}
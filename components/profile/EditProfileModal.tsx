"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { X, Upload, Loader2, User as UserIcon } from "lucide-react";
import { PublicUser } from "@/api/entities";

// Client-side image to WebP converter with size tracking
const convertImageToWebP = (file: File): Promise<{
  file: File;
  originalSize: number;
  webpSize: number;
  compressionRatio: string;
}> => {
  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, ".webp"),
              { type: "image/webp" }
            );

            const compressionRatio = (
              (1 - blob.size / originalSize) *
              100
            ).toFixed(1);

            console.log(`📊 WebP Conversion Stats:
  Original: ${file.name} (${(originalSize / 1024).toFixed(2)} KB)
  WebP: ${webpFile.name} (${(blob.size / 1024).toFixed(2)} KB)
  Compression: ${compressionRatio}% smaller`);

            resolve({ file: webpFile, originalSize, webpSize: blob.size, compressionRatio });
          } else {
            reject(new Error("Failed to convert image to WebP"));
          }
        }, "image/webp", 0.85);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

interface EditProfileModalProps {
  user: any;
  onClose: () => void;
  onSave: () => void;
}

export default function EditProfileModal({
  user,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    bio: user.bio || "",
    location: user.location || "",
    profile_image: user.profile_image || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   setIsUploading(true);
  //   try {
  //     console.log(`🔄 Starting WebP conversion for: ${file.name}`);

  //     const { file: webpFile, originalSize, webpSize, compressionRatio } =
  //       await convertImageToWebP(file);

  //     console.log(`✅ Uploading WebP file: ${webpFile.name}`);

  //     const response = await base44.integrations.Core.UploadFile({ file: webpFile });
  //     const fileUrl = response.data?.file_url || response.file_url;

  //     if (!fileUrl) throw new Error("No file URL returned from upload");

  //     console.log(
  //       `✅ Upload complete! Saved ${((originalSize - webpSize) / 1024).toFixed(2)} KB (${compressionRatio}% reduction)`
  //     );

  //     handleInputChange("profile_image", fileUrl);
  //   } catch (error: any) {
  //     console.error("Profile image upload failed", error);
  //     alert(`Failed to upload image: ${error.message}. Please try again.`);
  //   } finally {
  //     setIsUploading(false);
  //     e.target.value = "";
  //   }
  // };

  // Next.js: form submission does NOT use e.preventDefault() with Server Actions,
  // but since this is a client component with custom async logic, we keep it.
  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     console.log("🔄 Updating profile with:", formData);

  //     try {
  //       await base44.auth.updateMe({
  //         bio: formData.bio,
  //         location: formData.location,
  //         profile_image: formData.profile_image,
  //       });
  //       console.log("✅ User entity updated with custom fields");
  //     } catch (userError: any) {
  //       console.error("❌ Failed to update User entity:", userError);
  //       throw new Error(`Failed to update user profile: ${userError.message}`);
  //     }

  //     try {
  //       const publicProfiles = await PublicUser.filter({ user_id: user.id });

  //       if (publicProfiles.length > 0) {
  //         await PublicUser.update(publicProfiles[0].id, {
  //           full_name: formData.full_name,
  //           bio: formData.bio,
  //           location: formData.location,
  //           profile_image: formData.profile_image,
  //         });
  //         console.log("✅ PublicUser entity updated");
  //       } else {
  //         await PublicUser.create({
  //           user_id: user.id,
  //           full_name: formData.full_name,
  //           bio: formData.bio,
  //           location: formData.location,
  //           profile_image: formData.profile_image,
  //           user_type: user.user_type || "guest",
  //           verified: user.verified || false,
  //           role: user.role || "user",
  //         });
  //         console.log("✅ PublicUser entity created");
  //       }
  //     } catch (publicUserError: any) {
  //       console.error("❌ Failed to update PublicUser entity:", publicUserError);
  //       throw new Error(`Failed to update public profile: ${publicUserError.message}`);
  //     }

  //     console.log("✅ Profile update completed successfully");
  //     onSave();
  //   } catch (error: any) {
  //     console.error("❌ Failed to update profile:", error);
  //     alert(`Failed to update profile: ${error.message}. Please try again.`);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <CardTitle>Edit Your Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={formData.profile_image} />
                    <AvatarFallback className="text-3xl bg-slate-200">
                      {isUploading ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <UserIcon />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="secondary"
                    asChild
                    className="absolute bottom-0 right-0 rounded-full cursor-pointer"
                    disabled={isUploading}
                  >
                    {/* Next.js: <label> inside asChild works fine; no changes needed */}
                    <label htmlFor="profile-image-upload">
                      <Upload className="w-4 h-4" />
                      <input
                        id="profile-image-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageSelect}
                        accept="image/*"
                        disabled={isUploading}
                      />
                    </label>
                  </Button>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-800">Profile Picture</p>
                  <p className="text-sm text-slate-500">
                    Upload a new photo. It will be converted to WebP.
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Full Name
                </label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, State"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Bio
                </label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a little about yourself"
                  className="h-24"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isUploading}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
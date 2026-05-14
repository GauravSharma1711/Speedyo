"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { X, Loader2, User as UserIcon, Crop } from "lucide-react";

import { useProfileUpdateStore } from "@/store/profile/profileUpdate";
import { useSession } from "next-auth/react";
import ImageCropper from "@/components/ui/ImageCropper";

type EditProfileModalProps = {
  user: {
    id?: string;
    full_name?: string | null;
    bio?: string | null;
    location?: string | null;
    profile_image?: string | null;
  };
  onClose: () => void;
  onSave: () => void;
};

export default function EditProfileModal({ user, onClose, onSave }: EditProfileModalProps) {
  const { isSaving, error, save } = useProfileUpdateStore();
  const { update } = useSession();

  const [formData, setFormData] = useState({
    full_name: user.full_name || "",
    bio: user.bio || "",
    location: user.location || "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user.profile_image || "");
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState<string>("");

  const initial = useMemo(() => {
    return {
      full_name: (user.full_name ?? "").trim(),
      bio: (user.bio ?? "").trim(),
      location: (user.location ?? "").trim(),
      profile_image: user.profile_image ?? "",
    };
  }, [user.full_name, user.bio, user.location, user.profile_image]);

  const nextNormalized = useMemo(() => {
    return {
      full_name: formData.full_name.trim(),
      bio: formData.bio.trim(),
      location: formData.location.trim(),
    };
  }, [formData.full_name, formData.bio, formData.location]);

  const nameChanged = nextNormalized.full_name !== initial.full_name;
  const bioChanged = nextNormalized.bio !== initial.bio;
  const locationChanged = nextNormalized.location !== initial.location;
  const imageChanged = selectedImageFile !== null;

  const isDirty = nameChanged || bioChanged || locationChanged || imageChanged;

  const canSubmit = useMemo(() => {
    return isDirty && nextNormalized.full_name.length > 0 && !isUploading && !isSaving;
  }, [isDirty, nextNormalized.full_name, isUploading, isSaving]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show cropper with raw image
    const url = URL.createObjectURL(file);
    setRawImageSrc(url);
    setShowCropper(true);
    e.target.value = "";
  };

  const handleCropComplete = (croppedFile: File) => {
    setIsUploading(true);
    setShowCropper(false);
    setSelectedImageFile(croppedFile);
    const url = URL.createObjectURL(croppedFile);
    setPreviewUrl(url);
    setIsUploading(false);
    URL.revokeObjectURL(rawImageSrc);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    URL.revokeObjectURL(rawImageSrc);
    setRawImageSrc("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      const input: {
        full_name?: string;
        bio?: string;
        location?: string;
        profile_image?: File | null;
      } = {};

      if (nameChanged) input.full_name = nextNormalized.full_name;
      if (bioChanged) input.bio = nextNormalized.bio;
      if (locationChanged) input.location = nextNormalized.location;
      if (imageChanged) input.profile_image = selectedImageFile;

      if (Object.keys(input).length === 0) return;

      await save(input);

      if (nameChanged || imageChanged) {
        const meRes = await fetch("/api/user/me");
        if (!meRes.ok) throw new Error("Failed to refresh session user");
        const meJson = await meRes.json();
        const updatedUser = meJson.user;

        await update({
          user: {
            full_name: updatedUser?.full_name ?? nextNormalized.full_name,
            image: updatedUser?.profile_image ?? undefined,
          },
        });
      }

      onSave();
    } catch (e) {
    }
  };

  if (showCropper && rawImageSrc) {
    return (
      <ImageCropper
        imageSrc={rawImageSrc}
        onCrop={handleCropComplete}
        onCancel={handleCropCancel}
        aspectRatio={1}
      />
    );
  }

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
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isSaving}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6">
            {error ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={previewUrl} />
                    <AvatarFallback className="text-3xl bg-slate-200">
                      {isUploading || isSaving ? <Loader2 className="animate-spin" /> : <UserIcon />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-800">Profile Picture</p>
                  <p className="text-sm text-slate-500">
                    Upload a new photo. It will be converted to WebP and saved.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                    disabled={isUploading || isSaving}
                  >
                    <label htmlFor="profile-image-upload" className="cursor-pointer">
                      <Crop className="w-4 h-4 mr-2" />
                      {previewUrl ? "Change Photo" : "Upload Photo"}
                      <input
                        id="profile-image-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageSelect}
                        accept="image/*"
                        disabled={isUploading || isSaving}
                      />
                    </label>
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  placeholder="Your full name"
                  required
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, State"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Bio</label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us a little about yourself"
                  className="h-24"
                  disabled={isSaving}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>

                <Button type="submit" disabled={!canSubmit}>
                  {isSaving ? (
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
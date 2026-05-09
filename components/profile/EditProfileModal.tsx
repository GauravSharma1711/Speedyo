"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { X, Upload, Loader2, User as UserIcon } from "lucide-react";

import { useProfileUpdateStore } from "@/store/profile/profileUpdate";
import { useSession } from "next-auth/react";

const convertImageToWebP = (
  file: File,
): Promise<{
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

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Failed to convert image to WebP"));

            const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
              type: "image/webp",
            });

            const compressionRatio = ((1 - blob.size / originalSize) * 100).toFixed(1);

            resolve({
              file: webpFile,
              originalSize,
              webpSize: blob.size,
              compressionRatio,
            });
          },
          "image/webp",
          0.85,
        );
      };

      img.onerror = reject;
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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

    setIsUploading(true);
    try {
      const { file: webpFile } = await convertImageToWebP(file);
      setSelectedImageFile(webpFile);

      const url = URL.createObjectURL(webpFile);
      setPreviewUrl(url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Profile image conversion failed", err);
      alert(`Failed to process image: ${message}`);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
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

                  <Button
                    size="icon"
                    variant="secondary"
                    asChild
                    className="absolute bottom-0 right-0 rounded-full cursor-pointer"
                    disabled={isUploading || isSaving}
                  >
                    <label htmlFor="profile-image-upload">
                      <Upload className="w-4 h-4" />
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

                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-slate-800">Profile Picture</p>
                  <p className="text-sm text-slate-500">
                    Upload a new photo. It will be converted to WebP and saved.
                  </p>
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
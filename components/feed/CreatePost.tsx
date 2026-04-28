"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { X, Image, FileText, Video, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vehicle {
  id: string;
  title: string;
  price?: number;
}

interface CurrentUser {
  id: string;
  full_name?: string;
}

interface PostData {
  content: string;
  vehicle_id: string;
  post_type: string;
  images: string[];
  author_id?: string;
  likes: number;
  shares: number;
  views: number;
}

interface CreatePostProps {
  vehicles: Vehicle[];
  onCreatePost: (data: PostData) => Promise<{ id: string } | null>;
  onCancel: () => void;
  initialPostType?: "text" | "image" | "video";
  currentUser: CurrentUser | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const convertImageToWebP = (file: File): Promise<{ file: File; originalSize: number; webpSize: number }> =>
  new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();
    reader.onload = e => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width  = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error("WebP conversion failed")); return; }
          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp" }
          );
          console.log(`WebP: ${file.name} ${(originalSize/1024).toFixed(1)}KB → ${(blob.size/1024).toFixed(1)}KB`);
          resolve({ file: webpFile, originalSize, webpSize: blob.size });
        }, "image/webp", 0.85);
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Replace with your actual upload util (e.g. Supabase Storage, S3 presigned URL, etc.)
async function uploadFile(file: File): Promise<string> {
  // TODO: implement real upload
  // Example with your own API route:
  // const form = new FormData(); form.append("file", file);
  // const res = await fetch("/api/upload", { method: "POST", body: form });
  // const { url } = await res.json(); return url;
  console.log("[uploadFile] stub called for:", file.name);
  return URL.createObjectURL(file); // local preview until real upload is wired
}

// Replace with your real API call to notify followers
async function notifyFollowersOfNewPost(postId: string): Promise<void> {
  // TODO: POST /api/notifications/followers or server action
  console.log("[notifyFollowersOfNewPost] stub called for postId:", postId);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatePost({
  vehicles,
  onCreatePost,
  onCancel,
  initialPostType = "text",
  currentUser,
}: CreatePostProps) {
  const [content, setContent]               = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [postType, setPostType]             = useState<"text" | "image" | "video">(initialPostType);
  const [files, setFiles]                   = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setIsUploadingMedia(true);

    try {
      const urls = await Promise.all(
        selected.map(async file => {
          if (file.type.startsWith("video/")) {
            return uploadFile(file);
          }
          const { file: webpFile } = await convertImageToWebP(file);
          return uploadFile(webpFile);
        })
      );
      setFiles(prev => [...prev, ...urls]);
    } catch (err: any) {
      alert(`Upload failed: ${err.message}. Please try again.`);
    } finally {
      setIsUploadingMedia(false);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) =>
    setFiles(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) { alert("Please select a vehicle to link to your post."); return; }
    if (!content.trim() && files.length === 0) { alert("Please add some content or media to your post."); return; }

    setIsSubmitting(true);
    try {
      const newPost = await onCreatePost({
        content,
        vehicle_id: selectedVehicle,
        post_type: postType,
        images: files,
        author_id: currentUser?.id,
        likes: 0, shares: 0, views: 0,
      });

      if (newPost?.id) {
        try { await notifyFollowersOfNewPost(newPost.id); }
        catch (e) { console.error("Failed to notify followers:", e); }
      }

      setContent(""); setFiles([]); setSelectedVehicle("");
      onCancel?.();
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-md border-0 shadow-2xl flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold text-slate-800">Create New Post</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Content */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">What&apos;s on your mind?</label>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share something about your vehicle listing..."
                className="min-h-[120px] resize-none border-slate-200"
              />
            </div>

            {/* Media upload */}
            {(postType === "image" || postType === "video") && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Upload Media</label>
                <div className="flex justify-center rounded-lg border border-dashed border-slate-900/25 px-6 py-10">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 hover:text-blue-500">
                        <span>Upload files</span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          multiple
                          onChange={handleMediaUpload}
                          accept={postType === "video" ? "video/*" : "image/*,video/*"}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      {postType === "video"
                        ? "MP4, MOV, AVI up to 50MB"
                        : "PNG, JPG, GIF, WEBP, MP4 up to 10MB (images converted to WebP)"}
                    </p>
                  </div>
                </div>

                {isUploadingMedia && (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                  </div>
                )}

                {files.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {files.map((url, i) => (
                      <div key={i} className="relative group">
                        {url.match(/\.(mp4|mov|avi|webm)$/i) ? (
                          <video src={url} className="w-full h-24 object-cover rounded-md" muted />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={url} alt="uploaded media" className="w-full h-24 object-cover rounded-md" />
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(i)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Post type + vehicle selectors */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Post Type</label>
                <Select value={postType} onValueChange={(v: any) => setPostType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text"><div className="flex items-center gap-2"><FileText className="w-4 h-4" />Text Post</div></SelectItem>
                    <SelectItem value="image"><div className="flex items-center gap-2"><Image className="w-4 h-4" />Image Post</div></SelectItem>
                    <SelectItem value="video"><div className="flex items-center gap-2"><Video className="w-4 h-4" />Video Post</div></SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Link to Your Vehicle <span className="text-red-500">*</span>
                </label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger><SelectValue placeholder="Select one of your vehicles..." /></SelectTrigger>
                  <SelectContent>
                    {vehicles.length > 0 ? vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{v.title}</span>
                          <Badge variant="outline" className="ml-2">${v.price?.toLocaleString()}</Badge>
                        </div>
                      </SelectItem>
                    )) : (
                      <SelectItem value="none" disabled>No vehicles found.</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {vehicles.length === 0 && (
                  <p className="text-sm text-slate-500">You need to create a vehicle listing before posting.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
              <Button
                type="submit"
                disabled={(!content.trim() && files.length === 0) || !selectedVehicle || isUploadingMedia || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Share Post
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
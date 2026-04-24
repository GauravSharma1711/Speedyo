
"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { X, Loader2, Trash2, Upload, Edit } from "lucide-react";
import { Post } from "@/api/entities";
import { UploadFile } from "@/api/entities";

export default function EditPostModal({ post, onClose, onSave }) {
  const [content, setContent] = useState(post.content);
  const [mediaFiles, setMediaFiles] = useState(post.images || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const uploadPromises = selectedFiles.map(file => UploadFile({ file }));
    
    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      const fileUrls = uploadedFiles.map(result => result.file_url);
      setMediaFiles(prev => [...prev, ...fileUrls]);
    } catch (error) {
      console.error("File upload failed", error);
      alert("Failed to upload new media. Please try again.");
    }
    setIsUploading(false);
  };

  const removeFile = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;

    setIsUpdating(true);
    try {
      await Post.update(post.id, { 
        content: content.trim(),
        images: mediaFiles 
      });
      onSave();
    } catch (error) {
      console.error("Failed to update post:", error);
      alert("Failed to update post. Please try again.");
    }
    setIsUpdating(false);
  };

  const isMediaPost = post.post_type === 'image' || post.post_type === 'video';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        className="w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Edit className="w-5 h-5" />
              Edit Post
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isUpdating || isUploading}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 sr-only">Update your post</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="min-h-[150px] text-base resize-none focus:ring-2 focus:ring-blue-500 border-slate-200"
                  disabled={isUpdating}
                  autoFocus
                />
              </div>
              
              {isMediaPost && (
                <div className="space-y-4">
                  <label className="text-sm font-medium text-slate-700">Manage Media</label>
                  
                  {/* Display existing media */}
                  {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {mediaFiles.map((fileUrl, index) => (
                        <div key={index} className="relative group">
                          {fileUrl.endsWith('.mp4') || fileUrl.endsWith('.webm') ? (
                              <video src={fileUrl} controls className="w-full h-24 object-cover rounded-md" />
                          ) : (
                              <img src={fileUrl} alt={`media ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(index)}
                            disabled={isUpdating || isUploading}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* File Uploader */}
                  <div className="flex items-center justify-center w-full">
                      <label htmlFor="file-upload-edit" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-4 text-slate-500" />
                              <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                              <p className="text-xs text-slate-500">PNG, JPG, GIF, MP4 (MAX. 10MB)</p>
                          </div>
                          <input id="file-upload-edit" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,video/*" disabled={isUploading} />
                      </label>
                  </div>
                  {isUploading && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading new media...
                      </div>
                  )}
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isUpdating || isUploading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleSave} // Attach to button as form is inside CardContent
              disabled={(!content.trim() && mediaFiles.length === 0) || isUpdating || isUploading}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}

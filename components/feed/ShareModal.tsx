
"use client"

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { X, MessageCircle, Mail, Copy, Check } from "lucide-react";

export default function ShareModal({ post, onClose, onShare }) {
  const [shareMessage, setShareMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const postUrl = `${window.location.origin}/post/${post.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShare = (platform) => {
    if (onShare) {
      onShare(post.id, platform);
    }
    // onClose(); // Removing this as the modal should not close immediately after clicking share options, only when clicking outside or the close button
  };

  const shareOptions = [
    {
      platform: "link",
      label: "Copy Link",
      icon: linkCopied ? Check : Copy,
      color: "text-slate-600",
      action: handleCopyLink
    },
    {
      platform: "message",
      label: "Send Message",
      icon: MessageCircle,
      color: "text-blue-600",
      action: () => handleShare("message")
    },
    {
      platform: "email", 
      label: "Share via Email",
      icon: Mail,
      color: "text-emerald-600",
      action: () => handleShare("email")
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Share Post</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Share Options */}
            <div className="grid grid-cols-1 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.platform}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={option.action}
                >
                  <option.icon className={`w-5 h-5 mr-3 ${option.color}`} />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>

            {/* Share URL */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Post URL
              </label>
              <div className="flex gap-2">
                <Input
                  value={postUrl}
                  readOnly
                  className="flex-1 bg-slate-50"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className={linkCopied ? 'text-green-600' : ''}
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Add Message */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Add a message (optional)
              </label>
              <Textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="What do you think about this post?"
                className="h-20"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

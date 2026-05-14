"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";

import { X, MessageCircle, Mail, Copy, Check } from "lucide-react";

type FeedPost = {
  id: string;
  author_id?: string | null;
};

type SharePlatform = "link" | "message" | "email";

type ShareModalProps = {
  post: FeedPost;
  onClose: () => void;
  onShare?: (postId: string, platform: SharePlatform) => void | Promise<void>;
  messageRecipientId?: string | null;
  messageContext?: Record<string, string | undefined>;
};

export default function ShareModal({
  post,
  onClose,
  onShare,
  messageRecipientId,
  messageContext,
}: ShareModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [postUrl, setPostUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setPostUrl(`${window.location.origin}/post/${post.id}`);
    }
    return () => setMounted(false);
  }, [post.id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setLinkCopied(true);
      await onShare?.(post.id, "link");

      setTimeout(() => setLinkCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleSendMessage = async () => {
    const recipient = (messageRecipientId ?? post.author_id ?? "").trim();
    if (!recipient) {
      console.warn("No recipient for share message");
      onClose();
      return;
    }
    await onShare?.(post.id, "message");

    const qs = new URLSearchParams({
      recipient,
      post: post.id,
    });

    if (messageContext) {
      for (const [k, v] of Object.entries(messageContext)) {
        if (v) qs.set(k, v);
      }
    }

    router.push(`/Messages?${qs.toString()}`);
    onClose();
  };

  const handleEmailShare = async () => {
    const subject = encodeURIComponent("Check out this post");
    const body = encodeURIComponent(shareMessage ? `${shareMessage}\n\n${postUrl}` : postUrl);
    await onShare?.(post.id, "email");

    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    onClose();
  };

  const shareOptions = [
    {
      platform: "link" as const,
      label: linkCopied ? "Copied!" : "Copy Link",
      icon: linkCopied ? Check : Copy,
      color: "text-slate-600",
      action: handleCopyLink,
    },
    {
      platform: "message" as const,
      label: "Send Message",
      icon: MessageCircle,
      color: "text-blue-600",
      action: handleSendMessage,
    },
    {
      platform: "email" as const,
      label: "Share via Email",
      icon: Mail,
      color: "text-emerald-600",
      action: handleEmailShare,
    },
  ];

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 bg-white/95 shadow-2xl backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle>Share Post</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {shareOptions.map((option) => (
                <Button
                  key={option.platform}
                  variant="outline"
                  className="h-auto justify-start p-4"
                  onClick={option.action}
                >
                  <option.icon className={`mr-3 h-5 w-5 ${option.color}`} />
                  <span>{option.label}</span>
                </Button>
              ))}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Post URL</label>
              <div className="flex gap-2">
                <Input value={postUrl} readOnly className="flex-1 bg-slate-50" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className={linkCopied ? "text-green-600" : ""}
                >
                  {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Add a message (optional)</label>
              <Textarea
                value={shareMessage}
                onChange={(e) => setShareMessage(e.target.value)}
                placeholder="What do you think about this post?"
                className="h-20"
              />
            </div> */}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>,
    document.body
  );
}
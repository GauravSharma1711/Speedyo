"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThumbsUp, Heart, Laugh, Sparkles, Angry, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ReactionType = "like" | "love" | "laugh" | "wow" | "fire" | "angry";

type UserReaction = { user_email: string; reaction: ReactionType };

type EmojiMap = Record<
  ReactionType,
  {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
    bgColor: string;
    iconColor: string;
  }
>;

const emojiMap: EmojiMap = {
  like: {
    icon: ThumbsUp,
    color: "text-blue-500",
    label: "Like",
    bgColor: "bg-blue-500",
    iconColor: "text-white",
  },
  love: {
    icon: Heart,
    color: "text-red-500",
    label: "Love",
    bgColor: "bg-red-500",
    iconColor: "text-white",
  },
  laugh: {
    icon: Laugh,
    color: "text-yellow-500",
    label: "Haha",
    bgColor: "bg-yellow-400",
    iconColor: "text-white",
  },
  wow: {
    icon: Sparkles,
    color: "text-sky-500",
    label: "Wow",
    bgColor: "bg-sky-400",
    iconColor: "text-white",
  },
  fire: {
    icon: Flame,
    color: "text-orange-500",
    label: "Fire",
    bgColor: "bg-orange-500",
    iconColor: "text-white",
  },
  angry: {
    icon: Angry,
    color: "text-red-700",
    label: "Angry",
    bgColor: "bg-red-600",
    iconColor: "text-white",
  },
};

type EmojiReactionsProps = {
  post: {
    reactions?: Partial<Record<ReactionType, number>> | Record<string, number> | null;
    user_reactions?: Array<{ user_email?: string; reaction?: string }> | null;
  };
  onReact: (reactionType: ReactionType | null) => void | Promise<void>;
  currentUser: { email?: string | null } | null;
  interactive?: boolean;
  compact?: boolean;
  totalReactions?: number;
  showCount?: boolean;
};

export default function EmojiReactions({
  post,
  onReact,
  currentUser,
  interactive = false,
  compact = false,
  totalReactions = 0,
  showCount = false,
}: EmojiReactionsProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 250);
  };

  const currentUserReaction = (post?.user_reactions ?? [])
    .find((ur) => ur?.user_email && ur.user_email === currentUser?.email)
    ?.reaction as ReactionType | undefined;

  const handleMouseEnter = () => {
    cancelClose();

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      if (currentUser) setShowReactionPicker(true);
    }, 350);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    scheduleClose();
  };

  const handleReactionSelect = (reactionType: ReactionType) => {
    if (!currentUser) return;
    onReact(reactionType);
    setShowReactionPicker(false);
  };

  if (compact) {
    const reactionsRaw = (post?.reactions ?? {}) as Record<string, unknown>;

    const activeReactions = Object.entries(reactionsRaw)
      .map(([type, count]) => {
        const n = typeof count === "number" ? count : Number(count);
        return { type, count: Number.isFinite(n) ? n : 0 };
      })
      .filter((x) => x.count > 0 && (x.type in emojiMap))
      .sort((a, b) => b.count - a.count);

    if (activeReactions.length === 0) return null;

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {activeReactions.map(({ type, count }) => {
          const reactionType = type as ReactionType;
          const emojiConfig = emojiMap[reactionType];
          const { icon: Icon, bgColor, iconColor } = emojiConfig;

          return (
            <div key={type} className="flex items-center gap-1">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${bgColor} border-2 border-white shadow-sm`}
              >
                <Icon className={`w-3 h-3 ${iconColor}`} />
              </div>
              <span className="text-sm text-slate-600 font-medium">{count}</span>
            </div>
          );
        })}

        {showCount && totalReactions > 0 ? (
          <span className="text-sm text-slate-600 font-medium">{totalReactions}</span>
        ) : null}
      </div>
    );
  }

  if (interactive) {
    const currentReactionConfig =
      currentUserReaction && emojiMap[currentUserReaction]
        ? emojiMap[currentUserReaction]
        : { icon: ThumbsUp, color: "text-slate-500", label: "Like", bgColor: "", iconColor: "" };

    const { icon: CurrentIcon, color: currentColor, label: currentLabel } = currentReactionConfig;

    return (
      <div
        className="relative inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!currentUser) {
              alert("Please log in to react to posts.");
              return;
            }
            setShowReactionPicker((v) => !v);
          }}
          className={`font-semibold hover:bg-slate-100 ${currentUserReaction ? currentColor : "text-slate-500 hover:text-slate-600"
            }`}
        >
          <CurrentIcon className="w-5 h-5 mr-2" />
          {currentLabel}
        </Button>

        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-slate-200 p-1 z-50"
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              <div className="flex gap-1">
                {(Object.keys(emojiMap) as ReactionType[]).map((type) => {
                  const { icon: Icon, bgColor, label, iconColor } = emojiMap[type];
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.25, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleReactionSelect(type)}
                      className="rounded-full transition-colors"
                      title={label}
                      type="button"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} shadow-sm`}
                      >
                        <Icon className={`w-5 h-5 ${iconColor}`} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
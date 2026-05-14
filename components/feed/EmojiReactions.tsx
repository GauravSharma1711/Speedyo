"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThumbsUp, Heart, Laugh, Sparkles, Angry, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ReactionType = "like" | "love" | "laugh" | "wow" | "fire" | "angry";

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

    const MAX_VISIBLE_REACTIONS = 5;
    const visibleReactions = activeReactions.slice(0, MAX_VISIBLE_REACTIONS);
    const hiddenCount = activeReactions.length - MAX_VISIBLE_REACTIONS;

    return (
      <div className="flex items-center">
        {/* Stacked reactions - Instagram style overlapping */}
        <div className="flex items-center">
          {visibleReactions.map((reaction, index) => {
            const reactionType = reaction.type as ReactionType;
            const emojiConfig = emojiMap[reactionType];
            const { icon: Icon, bgColor, iconColor } = emojiConfig;

            return (
              <div
                key={reaction.type}
                className="relative"
                style={{ marginLeft: index === 0 ? 0 : "-10px", zIndex: visibleReactions.length - index }}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${bgColor} border-2 border-white shadow-sm`}
                >
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                {index === visibleReactions.length - 1 && reaction.count > 1 && (
                  <span className="absolute -top-2 -right-2 bg-slate-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center shadow-sm">
                    {reaction.count > 999 ? `${(reaction.count / 1000).toFixed(1)}k` : reaction.count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Extra reactions indicator */}
        {hiddenCount > 0 && (
          <div
            className="relative flex items-center justify-center min-w-[28px] h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm ml-[-8px]"
            style={{ zIndex: 0 }}
          >
            <span className="text-xs font-bold text-slate-600">+{hiddenCount}</span>
          </div>
        )}

        {/* Total count */}
        {showCount && totalReactions > 0 && (
          <span className="ml-2 text-sm text-slate-600 font-medium">{totalReactions}</span>
        )}
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
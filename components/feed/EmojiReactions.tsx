"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ThumbsUp, Heart, Laugh, Sparkles, Angry, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Defines the emoji icon, color, and label for each reaction type
const emojiMap = {
  like: { icon: ThumbsUp, color: "text-blue-500", label: "Like", bgColor: "bg-blue-500", iconColor: "text-white" },
  love: { icon: Heart, color: "text-red-500", label: "Love", bgColor: "bg-red-500", iconColor: "text-white" },
  laugh: { icon: Laugh, color: "text-yellow-500", label: "Haha", bgColor: "bg-yellow-400", iconColor: "text-white" },
  wow: { icon: Sparkles, color: "text-sky-500", label: "Wow", bgColor: "bg-sky-400", iconColor: "text-white" },
  fire: { icon: Flame, color: "text-orange-500", label: "Fire", bgColor: "bg-orange-500", iconColor: "text-white" },
  angry: { icon: Angry, color: "text-red-700", label: "Angry", bgColor: "bg-red-600", iconColor: "text-white" },
};

export default function EmojiReactions({ post, onReact, currentUser, interactive = false, compact = false, totalReactions = 0, showCount = false }) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // Determine the user's current reaction for this post
  const currentUserReaction = post?.user_reactions?.find(
    (ur) => ur.user_email === currentUser?.email
  )?.reaction;

  // Handler for quick-clicking the main reaction button
  const handleQuickClick = () => {
    if (!currentUser) {
      alert("Please log in to react to posts.");
      return;
    }
    // If user has a reaction, clicking again removes it. Otherwise, it defaults to 'like'.
    const reactionToSend = currentUserReaction ? null : 'like';
    onReact(reactionToSend);
  };

  // Handle mouse enter with delay
  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    const timeout = setTimeout(() => {
      if(currentUser) { // Only show picker if logged in
        setShowReactionPicker(true);
      }
    }, 500); // 500ms delay before showing picker
    setHoverTimeout(timeout);
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowReactionPicker(false);
  };

  // Handle reaction selection
  const handleReactionSelect = (reactionType) => {
    if (!currentUser) return;
    onReact(reactionType);
    setShowReactionPicker(false);
  };

  // Renders the compact view showing all reaction types with counts
  if (compact) {
    // Get all reactions with counts > 0, sorted by count (descending)
    const activeReactions = Object.entries(post?.reactions || {})
      .filter(([type, count]) => count > 0 && emojiMap[type])
      .sort((a, b) => b[1] - a[1]); // Sort by count descending

    if (activeReactions.length === 0) {
      return null; // Don't show anything if no reactions
    }

    return (
      <div className="flex items-center gap-2 flex-wrap">
        {activeReactions.map(([type, count]) => {
          const emojiConfig = emojiMap[type];
          if (!emojiConfig) return null;
          const { icon: Icon, bgColor, iconColor } = emojiConfig;
          
          return (
            <div key={type} className="flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${bgColor} border-2 border-white shadow-sm`}>
                <Icon className={`w-3 h-3 ${iconColor}`} />
              </div>
              <span className="text-sm text-slate-600 font-medium">{count}</span>
            </div>
          );
        })}
      </div>
    );
  }

  // Renders the full interactive reaction button with hover-based picker
  if (interactive) {
    const currentReactionConfig = currentUserReaction && emojiMap[currentUserReaction] 
      ? emojiMap[currentUserReaction] 
      : { icon: ThumbsUp, color: "text-slate-500", label: "Like" };
    
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
          onClick={handleQuickClick}
          className={`font-semibold hover:bg-slate-100 ${currentUserReaction ? currentColor : "text-slate-500 hover:text-slate-600"}`}
        >
          <CurrentIcon className="w-5 h-5 mr-2" />
          {currentLabel}
        </Button>

        {/* Hover-based Reaction Picker */}
        <AnimatePresence>
          {showReactionPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-slate-200 p-1 z-50"
            >
              <div className="flex gap-1">
                {Object.entries(emojiMap).map(([type, { icon: Icon, bgColor, label, iconColor }]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.25, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleReactionSelect(type)}
                    className="rounded-full transition-colors"
                    title={label}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgColor} shadow-sm`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
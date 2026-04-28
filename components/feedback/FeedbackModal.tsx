"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Star, Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Dummy current user (replace with real auth later) ─────────────────────────
const DUMMY_USER = {
  id: "user_123",
  full_name: "John Doe",
  email: "john@example.com",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [category, setCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // TODO: Replace with real auth (NextAuth, Clerk, etc.)
  const currentUser = DUMMY_USER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a satisfaction rating.");
      return;
    }
    if (!feedbackText.trim()) {
      alert("Please provide some feedback.");
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        satisfaction_rating: rating,
        feedback_text: feedbackText,
        category,
        user_id: currentUser?.id ?? null,
        user_email: currentUser?.email ?? null,
        user_name: currentUser?.full_name ?? "Anonymous",
      };

      // TODO: Replace with your real API call, e.g.:
      // await fetch("/api/feedback", { method: "POST", body: JSON.stringify(feedbackData) });
      console.log("Submitting feedback (dummy):", feedbackData);
      await new Promise((res) => setTimeout(res, 1000)); // Simulate network delay

      // TODO: Replace with real email notification, e.g. via Resend/SendGrid Route Handler:
      // await fetch("/api/send-feedback-email", { method: "POST", body: JSON.stringify({ rating, feedbackText, category, currentUser }) });
      console.log("Email notification would be sent to admin (dummy)");

      setSubmitSuccess(true);
      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setFeedbackText("");
    setCategory("general");
    setSubmitSuccess(false);
    onClose();
  };

  // ── Success State ────────────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-emerald-600 fill-current" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Thank You!</h3>
            <p className="text-slate-600 mb-6">
              Your feedback helps us improve Speedio for everyone.
            </p>
            <p className="text-sm text-slate-500">This window will close automatically...</p>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main Modal ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Share Your Feedback
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Help us improve Speedio by sharing your experience and suggestions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Satisfaction Rating */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-3 block">
              How satisfied are you with Speedio?
            </label>
            <div className="flex items-center justify-center gap-3 py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-10 h-10 transition-all ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "😞 Very Dissatisfied"}
              {rating === 2 && "😕 Dissatisfied"}
              {rating === 3 && "😐 Neutral"}
              {rating === 4 && "😊 Satisfied"}
              {rating === 5 && "🤩 Very Satisfied"}
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              What area is your feedback about?
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Experience</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="feed">Social Feed</SelectItem>
                <SelectItem value="messaging">Messaging</SelectItem>
                <SelectItem value="managed_sales">Managed Sales</SelectItem>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">
              Tell us more about your experience
            </label>
            <Textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What did you like? What could we improve? Any suggestions?"
              className="min-h-[120px] resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              {currentUser
                ? "Your feedback will be associated with your account."
                : "You can submit feedback anonymously."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
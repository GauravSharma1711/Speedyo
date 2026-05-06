"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Search,
  Star,
  User as UserIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";

type FeedbackStatus = "new" | "reviewed" | "in_progress" | "resolved";
type FeedbackCategory =
  | "general"
  | "marketplace"
  | "feed"
  | "messaging"
  | "managed_sales"
  | "dashboard"
  | "other";

type FeedbackRow = {
  id: string;
  created_date: string; // ISO
  user_name?: string | null;
  user_email?: string | null;
  satisfaction_rating: number; // 1-5
  category: FeedbackCategory;
  feedback_text: string;

  status: FeedbackStatus;
  admin_notes?: string | null;
};

const MOCK_FEEDBACK: FeedbackRow[] = [
  {
    id: "fb_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    user_name: "Yuki Tanaka",
    user_email: "yuki@example.com",
    satisfaction_rating: 4,
    category: "marketplace",
    feedback_text: "Search filters are good, but need more sorting options.",
    status: "new",
    admin_notes: null,
  },
  {
    id: "fb_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    user_name: "Tanmay Ahuja",
    user_email: "tanmay@example.com",
    satisfaction_rating: 5,
    category: "managed_sales",
    feedback_text: "Managed sales flow is smooth. Great UI.",
    status: "reviewed",
    admin_notes: "Good signal—keep as testimonial candidate.",
  },
  {
    id: "fb_003",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    user_name: null,
    user_email: null,
    satisfaction_rating: 2,
    category: "messaging",
    feedback_text: "Messages page sometimes feels slow.",
    status: "in_progress",
    admin_notes: "Investigate performance (list virtualization).",
  },
];

export default function FeedbackManagementUI() {
  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>(MOCK_FEEDBACK);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | FeedbackStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | FeedbackCategory>("all");

  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRow | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<FeedbackStatus>("new");

  const filteredFeedback = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    return feedbackList.filter((f) => {
      const matchesSearch =
        !q ||
        (f.user_name ?? "").toLowerCase().includes(q) ||
        (f.user_email ?? "").toLowerCase().includes(q) ||
        (f.feedback_text ?? "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || f.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || f.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [feedbackList, searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = feedbackList.length;
    const newCount = feedbackList.filter((f) => f.status === "new").length;
    const avgRating =
      feedbackList.length > 0
        ? (
            feedbackList.reduce((sum, f) => sum + f.satisfaction_rating, 0) /
            feedbackList.length
          ).toFixed(1)
        : "0";

    return { total, newCount, avgRating };
  }, [feedbackList]);

  const getStatusBadge = (status: FeedbackStatus) => {
    const statusConfig: Record<
      FeedbackStatus,
      { icon: React.ReactNode; color: string; text: string }
    > = {
      new: {
        icon: <AlertCircle className="w-3 h-3" />,
        color: "bg-blue-100 text-blue-800",
        text: "New",
      },
      reviewed: {
        icon: <CheckCircle className="w-3 h-3" />,
        color: "bg-purple-100 text-purple-800",
        text: "Reviewed",
      },
      in_progress: {
        icon: <Clock className="w-3 h-3" />,
        color: "bg-amber-100 text-amber-800",
        text: "In Progress",
      },
      resolved: {
        icon: <CheckCircle className="w-3 h-3" />,
        color: "bg-green-100 text-green-800",
        text: "Resolved",
      },
    };

    const cfg = statusConfig[status];
    return (
      <Badge className={cfg.color}>
        {cfg.icon}
        <span className="ml-1">{cfg.text}</span>
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-slate-600">({rating}/5)</span>
      </div>
    );
  };

  const handleViewDetails = (feedback: FeedbackRow) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.admin_notes ?? "");
    setNewStatus(feedback.status);
    setShowDetailsModal(true);
  };

  const handleUpdateFeedback = () => {
    if (!selectedFeedback) return;

    setFeedbackList((prev) =>
      prev.map((f) =>
        f.id === selectedFeedback.id
          ? { ...f, status: newStatus, admin_notes: adminNotes || null }
          : f,
      ),
    );

    setShowDetailsModal(false);
    setSelectedFeedback(null);
    setAdminNotes("");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Feedback</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">New Submissions</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.newCount}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-bold text-amber-500">{stats.avgRating}</p>
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters + List */}
        <Card className="bg-white shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              User Feedback Management
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or feedback text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as any)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v as any)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="feed">Feed</SelectItem>
                  <SelectItem value="messaging">Messaging</SelectItem>
                  <SelectItem value="managed_sales">Managed Sales</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredFeedback.map((feedback) => (
                <div
                  key={feedback.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          <span className="font-semibold text-slate-800">
                            {feedback.user_name || "Anonymous"}
                          </span>
                        </div>

                        {renderStars(feedback.satisfaction_rating)}
                        {getStatusBadge(feedback.status)}

                        <Badge variant="outline" className="capitalize">
                          {feedback.category}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-600 mb-2">
                        {feedback.user_email || "—"}
                      </p>

                      <p className="text-slate-700 line-clamp-2">
                        {feedback.feedback_text}
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        Submitted{" "}
                        {format(new Date(feedback.created_date), "MMM d, yyyy h:mm a")}
                      </p>

                      {feedback.admin_notes ? (
                        <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                          <p className="text-xs font-medium text-blue-800">Admin Notes:</p>
                          <p className="text-sm text-blue-700">{feedback.admin_notes}</p>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(feedback)}
                      className="ml-4"
                    >
                      View & Update
                    </Button>
                  </div>
                </div>
              ))}

              {filteredFeedback.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No feedback found</p>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>

          {selectedFeedback ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">User Name</Label>
                    <p className="font-medium">{selectedFeedback.user_name || "Anonymous"}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600">Email</Label>
                    <p className="font-medium">{selectedFeedback.user_email || "—"}</p>
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600">Satisfaction Rating</Label>
                    {renderStars(selectedFeedback.satisfaction_rating)}
                  </div>

                  <div>
                    <Label className="text-sm text-slate-600">Category</Label>
                    <Badge variant="outline" className="capitalize mt-1">
                      {selectedFeedback.category}
                    </Badge>
                  </div>

                  <div className="col-span-2">
                    <Label className="text-sm text-slate-600">Submitted</Label>
                    <p className="font-medium">
                      {format(new Date(selectedFeedback.created_date), "MMMM d, yyyy h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-600 mb-2 block">Feedback</Label>
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-slate-800 whitespace-pre-wrap">
                    {selectedFeedback.feedback_text}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="mb-2 block">
                  Status
                </Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FeedbackStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admin-notes" className="mb-2 block">
                  Admin Notes (Internal - not visible to user)
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  rows={4}
                />
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFeedback}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
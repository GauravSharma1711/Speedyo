import React, { useState, useEffect } from "react";
import { Feedback } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MessageSquare, Search, CheckCircle, Clock, AlertCircle, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function FeedbackManagement() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const allFeedback = await Feedback.list("-created_date", 100);
      setFeedbackList(allFeedback);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    }
    setIsLoading(false);
  };

  const handleViewDetails = (feedback) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.admin_notes || "");
    setNewStatus(feedback.status);
    setShowDetailsModal(true);
  };

  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;

    try {
      await Feedback.update(selectedFeedback.id, {
        status: newStatus,
        admin_notes: adminNotes
      });

      setShowDetailsModal(false);
      setSelectedFeedback(null);
      setAdminNotes("");
      loadFeedback();
    } catch (error) {
      console.error("Failed to update feedback:", error);
      alert("Failed to update feedback. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { icon: <AlertCircle className="w-3 h-3" />, color: "bg-blue-100 text-blue-800", text: "New" },
      reviewed: { icon: <CheckCircle className="w-3 h-3" />, color: "bg-purple-100 text-purple-800", text: "Reviewed" },
      in_progress: { icon: <Clock className="w-3 h-3" />, color: "bg-amber-100 text-amber-800", text: "In Progress" },
      resolved: { icon: <CheckCircle className="w-3 h-3" />, color: "bg-green-100 text-green-800", text: "Resolved" }
    };

    const config = statusConfig[status] || statusConfig.new;
    return (
      <Badge className={config.color}>
        {config.icon}
        <span className="ml-1">{config.text}</span>
      </Badge>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          />
        ))}
        <span className="ml-2 text-sm text-slate-600">({rating}/5)</span>
      </div>
    );
  };

  const filteredFeedback = feedbackList.filter(feedback => {
    const matchesSearch = !searchTerm || 
      feedback.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.feedback_text?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || feedback.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStats = () => {
    const total = feedbackList.length;
    const newCount = feedbackList.filter(f => f.status === 'new').length;
    const avgRating = feedbackList.length > 0 
      ? (feedbackList.reduce((sum, f) => sum + f.satisfaction_rating, 0) / feedbackList.length).toFixed(1)
      : 0;

    return { total, newCount, avgRating };
  };

  const stats = getStats();

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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              User Feedback Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, email, or feedback text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
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

            {/* Feedback List */}
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedback.map(feedback => (
                  <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-slate-500" />
                            <span className="font-semibold text-slate-800">
                              {feedback.user_name || 'Anonymous'}
                            </span>
                          </div>
                          {renderStars(feedback.satisfaction_rating)}
                          {getStatusBadge(feedback.status)}
                          <Badge variant="outline" className="capitalize">
                            {feedback.category}
                          </Badge>
                        </div>

                        <p className="text-sm text-slate-600 mb-2">{feedback.user_email}</p>
                        <p className="text-slate-700 line-clamp-2">{feedback.feedback_text}</p>
                        
                        <p className="text-xs text-slate-500 mt-2">
                          Submitted {format(new Date(feedback.created_date), 'MMM d, yyyy h:mm a')}
                        </p>

                        {feedback.admin_notes && (
                          <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-400 rounded">
                            <p className="text-xs font-medium text-blue-800">Admin Notes:</p>
                            <p className="text-sm text-blue-700">{feedback.admin_notes}</p>
                          </div>
                        )}
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

                {filteredFeedback.length === 0 && !isLoading && (
                  <div className="text-center py-8 text-slate-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No feedback found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-slate-600">User Name</Label>
                    <p className="font-medium">{selectedFeedback.user_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-slate-600">Email</Label>
                    <p className="font-medium">{selectedFeedback.user_email}</p>
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
                      {format(new Date(selectedFeedback.created_date), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm text-slate-600 mb-2 block">Feedback</Label>
                <div className="p-4 bg-white border border-slate-200 rounded-lg">
                  <p className="text-slate-800 whitespace-pre-wrap">{selectedFeedback.feedback_text}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="status" className="mb-2 block">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateFeedback}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
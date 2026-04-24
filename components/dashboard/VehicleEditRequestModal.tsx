
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { VehicleEditRequest, Notification, User } from "@/entities/all"; // Added User
import { createPageUrl } from "@/utils";
import { 
  Edit, 
  X,
  AlertCircle,
  Send,
  Clock // Added Clock
} from "lucide-react";
import { motion } from "framer-motion";

export default function VehicleEditRequestModal({ 
  vehicle, 
  isOpen, 
  onClose, 
  onSuccess, 
  currentUser 
}) {
  const [editData, setEditData] = useState({
    title: vehicle?.title || '',
    price: vehicle?.price || '',
    description: vehicle?.description || '',
    mileage: vehicle?.mileage || '',
    condition: vehicle?.condition || '',
    location: vehicle?.location || '',
    primary_image: vehicle?.primary_image || ''
  });
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Compare original vs new values to determine what changed
      const changes = {};
      Object.keys(editData).forEach(key => {
        // Handle number types specifically to avoid comparing 0 vs '' or actual number vs string
        const originalValue = typeof vehicle[key] === 'number' ? String(vehicle[key]) : vehicle[key];
        const editedValue = typeof editData[key] === 'number' ? String(editData[key]) : editData[key];

        if (editedValue !== originalValue) {
          changes[key] = editData[key];
        }
      });

      if (Object.keys(changes).length === 0) {
        alert("No changes were made to submit.");
        setIsSubmitting(false);
        return;
      }

      // Create the edit request
      await VehicleEditRequest.create({
        vehicle_id: vehicle.id,
        requested_by_user_id: currentUser.id,
        requested_changes: changes,
        reason: reason,
        status: 'pending'
      });

      // Notify admins about the new edit request
      const adminUsers = await User.filter({ role: 'admin' });
      const notificationPromises = adminUsers.map(admin =>
        Notification.create({
          recipient_id: admin.id,
          sender_id: currentUser.id,
          type: "vehicle_edit_request",
          content: `${currentUser.full_name} requested edits for "${vehicle.title}". Changes: ${Object.keys(changes).join(', ')}.`,
          related_entity_id: vehicle.id,
          url: createPageUrl(`AdminPanel?tab=edit_requests`),
          icon: "Edit"
        })
      );
      await Promise.all(notificationPromises);

      onSuccess();
    } catch (error) {
      console.error("Failed to submit edit request:", error);
      alert("Failed to submit edit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Request Vehicle Edit</h2>
              <p className="text-sm text-slate-600">Submit changes for Speedio team review</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Managed Vehicle Edit Request</span>
            </div>
            <p className="text-sm text-amber-700">
              This vehicle is managed by Speedio. Your edit request will be reviewed by our team and applied if approved. 
              You'll receive a notification with the decision.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current vs Requested Changes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Values */}
              <Card className="bg-slate-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-slate-600">Current Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-slate-500">Title</Label>
                    <p className="text-sm font-medium">{vehicle.title}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Price</Label>
                    <p className="text-sm font-medium">${vehicle.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Mileage</Label>
                    <p className="text-sm font-medium">{vehicle.mileage?.toLocaleString()} miles</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Condition</Label>
                    <p className="text-sm font-medium capitalize">{vehicle.condition}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-500">Location</Label>
                    <p className="text-sm font-medium">{vehicle.location}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Requested Changes */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-600">Requested Changes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      placeholder="Vehicle title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={editData.price}
                      onChange={(e) => setEditData({...editData, price: Number(e.target.value)})}
                      placeholder="Price"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mileage">Mileage</Label>
                    <Input
                      id="mileage"
                      type="number"
                      value={editData.mileage}
                      onChange={(e) => setEditData({...editData, mileage: Number(e.target.value)})}
                      placeholder="Mileage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={editData.condition} onValueChange={(value) => setEditData({...editData, condition: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">Excellent Condition</SelectItem>
                        <SelectItem value="good">Good Condition</SelectItem>
                        <SelectItem value="fair">Fair Condition</SelectItem>
                        <SelectItem value="poor">Poor Condition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={editData.location}
                      onChange={(e) => setEditData({...editData, location: e.target.value})}
                      placeholder="Vehicle location"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                placeholder="Vehicle description"
                rows={4}
              />
            </div>

            {/* Reason for Edit */}
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">Reason for Edit Request *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please explain why you need to make these changes..."
                rows={3}
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!reason.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Edit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

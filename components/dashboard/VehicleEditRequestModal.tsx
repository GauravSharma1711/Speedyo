
"use client"

import React, { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import { vehicleEditRequestService } from "@/services/vehicleEditRequestService";
import { notificationService, userService } from "@/services/dashboard";
import { Edit, X, AlertCircle, Send, Clock, Image as ImageIcon, Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type VehicleEditRequestModalProps = {
  vehicle: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentUser: any;
};

export default function VehicleEditRequestModal({ vehicle, isOpen, onClose, onSuccess, currentUser }: VehicleEditRequestModalProps) {
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
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = URL.createObjectURL(file);
      setEditData(prev => ({ ...prev, primary_image: url }));
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setEditData(prev => ({ ...prev, primary_image: '' }));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const changes: Record<string, any> = {};
      const editDataAny = editData as any;
      Object.keys(editData).forEach((key: string) => {
        const originalValue = typeof vehicle[key] === 'number' ? String(vehicle[key]) : vehicle[key];
        const editedValue = typeof editDataAny[key] === 'number' ? String(editDataAny[key]) : editDataAny[key];

        if (editedValue !== originalValue) {
          changes[key] = editDataAny[key];
        }
      });

      if (Object.keys(changes).length === 0) {
        alert("No changes were made to submit.");
        setIsSubmitting(false);
        return;
      }

      await vehicleEditRequestService.create({
        vehicleId: vehicle.id,
        reason: reason,
        requested_changes: changes,
      });

      try {
        const adminUsers = await userService.getAdmins();
        if (adminUsers && adminUsers.length > 0) {
          const notificationPromises = adminUsers.map((admin: any) =>
            notificationService.create({
              recipientId: admin.id,
              senderId: currentUser.id,
              type: "vehicle_edit_request",
              content: `${currentUser.full_name} requested edits for "${vehicle.title}". Changes: ${Object.keys(changes).join(', ')}.`,
              related_entity_id: vehicle.id,
              url: "/Admin-Panel?tab=edit_requests",
              icon: "Edit"
            })
          );
          await Promise.all(notificationPromises);
        }
      } catch (notifError) {
        console.warn("Failed to notify admins:", notifError);
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

                  {/* Primary Image */}
                  <div>
                    <Label>Primary Image</Label>
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {editData.primary_image ? (
                      <div className="relative mt-2 border rounded-lg overflow-hidden">
                        <img
                          src={editData.primary_image}
                          alt="Vehicle"
                          className="w-full h-40 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        {isUploading ? (
                          <div className="flex items-center justify-center gap-2 text-slate-500">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <span className="text-sm text-slate-600">Click to upload new image</span>
                            <span className="text-xs text-slate-400">JPG, PNG up to 5MB</span>
                          </div>
                        )}
                      </div>
                    )}
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

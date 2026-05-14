import React, { useState, useEffect } from "react";
import { Message, Notification } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  User,
  Car,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/use-toast";

export default function TestDriveActivityModal({
  testDriveRequest,
  buyer,
  vehicle,
  isOpen,
  onClose,
  onUpdate,
  currentUser
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [editableDetails, setEditableDetails] = useState({
    preferred_date: "",
    preferred_time: "",
    location: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    if (testDriveRequest?.test_drive_details) {
      const details = testDriveRequest.test_drive_details;
      setNewStatus(details.status || 'pending');
      setAdminNotes(details.admin_notes || '');
      setEditableDetails({
        preferred_date: details.preferred_date || "",
        preferred_time: details.preferred_time || "",
        location: details.location || vehicle?.location || ""
      });
    }
  }, [testDriveRequest, vehicle, isOpen]);

  if (!testDriveRequest || !isOpen) return null;

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const updatedDetails = {
        ...testDriveRequest.test_drive_details,
        ...editableDetails,
        status: newStatus,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString()
      };

      await Message.update(testDriveRequest.id, {
        test_drive_details: updatedDetails
      });

      // If approved, send notification and system message
      if (newStatus === 'approved') {
        const approvalMessage = `Your car viewing for "${vehicle.title}" on ${format(new Date(editableDetails.preferred_date), 'MMM d, yyyy')} at ${editableDetails.preferred_time} has been approved! Location: ${editableDetails.location}.`;

        // Create notification for buyer
        await Notification.create({
          recipient_id: buyer.id,
          sender_id: currentUser.id,
          type: "test_drive_status_update",
          content: approvalMessage,
          related_entity_type: "Message",
          related_entity_id: testDriveRequest.id,
          url: createPageUrl("Messages"),
          icon: "CalendarCheck"
        });

        // Create system message in conversation
        await Message.create({
          recipient_id: buyer.id,
          sender_id: currentUser.id,
          content: `✅ Car Viewing Approved!\nDate: ${format(new Date(editableDetails.preferred_date), 'MMM d, yyyy')}\nTime: ${editableDetails.preferred_time}\nLocation: ${editableDetails.location}\n\nPlease confirm your attendance. Contact us if you have any questions.`,
          message_type: "confirmation_test_drive",
          vehicle_id: testDriveRequest.vehicle_id,
          managed_sale_request_id: testDriveRequest.managed_sale_request_id,
          conversation_id: testDriveRequest.conversation_id
        });
      }

      toast({
        title: "Car Viewing Updated",
        description: "The car viewing details have been successfully updated.",
        variant: "success",
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update car viewing status:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update car viewing status. Please try again.",
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'declined': return <XCircle className="w-4 h-4" />;
      case 'no_show': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Edit Car Viewing Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-1">
          {/* Request Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-blue-800">
                  <User className="w-4 h-4" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                 <p className="text-slate-700 font-medium">{buyer?.full_name || 'Unknown'}</p>
                 <p className="text-slate-600">{buyer?.email || 'Unknown'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
                  <Car className="w-4 h-4" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-slate-700 font-medium">{vehicle?.title || 'Unknown vehicle'}</p>
                <p className="text-slate-600">${vehicle?.price?.toLocaleString() || 'N/A'}</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Drive Details - Editable */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800 text-base">
                <Edit className="w-4 h-4" />
                Schedule & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={editableDetails.preferred_date} onChange={(e) => setEditableDetails({...editableDetails, preferred_date: e.target.value})} />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={editableDetails.preferred_time} onChange={(e) => setEditableDetails({...editableDetails, preferred_time: e.target.value})} />
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" type="text" placeholder="e.g., Camp Foster Starbucks" value={editableDetails.location} onChange={(e) => setEditableDetails({...editableDetails, location: e.target.value})} />
              </div>
              
              {testDriveRequest.test_drive_details?.notes && (
                <div>
                  <Label>Original Buyer's Notes</Label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border">
                    {testDriveRequest.test_drive_details.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Edit className="w-4 h-4" />
                Update Status & Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Update Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <Badge className={`${getStatusColor(newStatus)}`}>
                    {getStatusIcon(newStatus)}
                    <span className="ml-2 capitalize">{newStatus?.replace('_', ' ')}</span>
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Admin Notes (Internal)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this car viewing..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />}
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
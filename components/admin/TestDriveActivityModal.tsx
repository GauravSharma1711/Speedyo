"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Save,
  User,
  Car,
  XCircle,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/TextArea";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { TestDrive, UpdateTestDriveData } from "@/store/admin/testDrive";

type Status = "pending" | "approved" | "completed" | "declined" | "no_show";

export type TestDriveLite = {
  id: string;
  vehicle_id: string;
  sender_id: string; // buyer
  recipient_id: string; // seller
  test_drive_details: {
    status: Status;
    preferred_date?: string; // yyyy-mm-dd
    preferred_time?: string; // HH:mm
    location?: string;
    notes?: string;
  };
};

export type UserLite = { user_id: string; full_name: string; email?: string };
export type VehicleLite = { id: string; title: string; price?: number; location?: string };

function getStatusColor(status: Status) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "approved":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "declined":
      return "bg-red-100 text-red-800";
    case "no_show":
      return "bg-orange-100 text-orange-800";
  }
}

function getStatusIcon(status: Status) {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "approved":
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    case "declined":
      return <XCircle className="w-4 h-4" />;
    case "no_show":
      return <AlertTriangle className="w-4 h-4" />;
  }
}

function todayYmd() {
  return new Date().toISOString().split("T")[0];
}

export default function TestDriveActivityModalUI(props: {
  testDriveRequest: TestDrive | null;
  buyer: UserLite | null;
  vehicle: VehicleLite | null;
  isOpen: boolean;
  onClose: () => void;
onSave: (updated: UpdateTestDriveData) => Promise<void>;
}) {
  const { testDriveRequest, buyer, vehicle, isOpen, onClose, onSave } = props;


  const defaults = useMemo(() => {
  return {
    status: (testDriveRequest?.status ?? "pending") as Status,
  
    confirmed_date: testDriveRequest?.confirmed_date ?? testDriveRequest?.requested_date ?? todayYmd(),
    confirmed_time: testDriveRequest?.confirmed_time ?? testDriveRequest?.requested_time ?? "14:00",
    location: testDriveRequest?.location ?? vehicle?.location ?? "",
    additional_notes: testDriveRequest?.additional_notes ?? "",
    admin_note: testDriveRequest?.admin_note ?? "",
  };
}, [testDriveRequest?.id, vehicle?.location]);


  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<Status>("pending");
  const [adminNotes, setAdminNotes] = useState("");
const [editableDetails, setEditableDetails] = useState({
  confirmed_date: "",
  confirmed_time: "",
  location: "",
});


useEffect(() => {
  if (!isOpen) return;
  setNewStatus(defaults.status);
  setAdminNotes(defaults.admin_note??"");
  setEditableDetails({
    confirmed_date: defaults.confirmed_date,
    confirmed_time: defaults.confirmed_time,
    location: defaults.location,
  });
}, [isOpen, defaults]);

  if (!isOpen || !testDriveRequest) return null;

 const handleUpdate = async () => {
  setIsUpdating(true);
  try {
    const payload: UpdateTestDriveData = {
      id: testDriveRequest!.id,
      status: newStatus,
      confirmed_date: editableDetails.confirmed_date,
      confirmed_time: editableDetails.confirmed_time,
      location: editableDetails.location,
      admin_note: adminNotes.trim() || undefined,
    };
    await onSave(payload);  
    onClose();
  } catch (err) {
    // error toast can be shown here if needed
    console.error("Failed to save test drive:", err);
  } finally {
    setIsUpdating(false);
  }
};


 const buyerNotes = testDriveRequest?.additional_notes;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Edit Car Viewing Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-1">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-blue-800">
                  <User className="w-4 h-4" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p className="text-slate-700 font-medium">{buyer?.full_name || "Unknown"}</p>
                <p className="text-slate-600">{buyer?.email || "—"}</p>
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
                <p className="text-slate-700 font-medium">{vehicle?.title || "Unknown vehicle"}</p>
                <p className="text-slate-600">
                  {typeof vehicle?.price === "number" ? `$${vehicle.price.toLocaleString()}` : "—"}
                </p>
              </CardContent>
            </Card>
          </div>

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
                  <Label htmlFor="td-date">Date</Label>
              
                  <Input
  id="td-date"
  type="date"
  value={editableDetails.confirmed_date}
  onChange={(e) =>
    setEditableDetails((p) => ({ ...p, confirmed_date: e.target.value }))
  }
/>
                </div>
                <div>
                  <Label htmlFor="td-time">Time</Label>
            <Input
  id="td-time"
  type="time"
  value={editableDetails.confirmed_time}
  onChange={(e) =>
    setEditableDetails((p) => ({ ...p, confirmed_time: e.target.value }))
  }
/>
                </div>
              </div>

              <div>
                <Label htmlFor="td-location">Location</Label>
                <Input
                  id="td-location"
                  type="text"
                  placeholder="e.g., Camp Foster Starbucks"
                  value={editableDetails.location}
                  onChange={(e) =>
                    setEditableDetails((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>

              {buyerNotes ? (
                <div>
                  <Label>Original Buyer's Notes</Label>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded border">
                    {buyerNotes}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

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
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as Status)}>
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
                  <Badge className={getStatusColor(newStatus)}>
                    {getStatusIcon(newStatus)}
                    <span className="ml-2 capitalize">{newStatus.replace("_", " ")}</span>
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
            <Button onClick={handleUpdate} disabled={isUpdating} className="bg-blue-600 hover:bg-blue-700">
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isUpdating ? "Saving..." : "Save Changes"}
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
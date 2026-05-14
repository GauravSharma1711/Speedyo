import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function AvailabilitySetupModal({ isOpen, onClose, request, onApprove }) {
  const [recurringAvailability, setRecurringAvailability] = useState([]);
  const [newSlot, setNewSlot] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    meeting_address: ""
  });

  const daysOfWeek = [
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
    { value: "sunday", label: "Sunday" }
  ];

  const handleAddSlot = () => {
    if (!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time) {
      alert("Please fill in all required fields for the time slot.");
      return;
    }

    // Check for conflicts
    const hasConflict = recurringAvailability.some(slot => 
      slot.day_of_week === newSlot.day_of_week &&
      ((newSlot.start_time >= slot.start_time && newSlot.start_time < slot.end_time) ||
       (newSlot.end_time > slot.start_time && newSlot.end_time <= slot.end_time) ||
       (newSlot.start_time <= slot.start_time && newSlot.end_time >= slot.end_time))
    );

    if (hasConflict) {
      alert("This time slot conflicts with an existing one on the same day.");
      return;
    }

    setRecurringAvailability([...recurringAvailability, { ...newSlot }]);
    setNewSlot({
      day_of_week: "",
      start_time: "",
      end_time: "",
      meeting_address: request.access_arrangements?.vehicle_location_address || ""
    });
  };

  const handleRemoveSlot = (index) => {
    setRecurringAvailability(recurringAvailability.filter((_, i) => i !== index));
  };

  const handleApprove = () => {
    if (recurringAvailability.length === 0) {
      if (!window.confirm("No car viewing availability slots have been set. Are you sure you want to approve without setting availability? Car viewings will need to be manually coordinated.")) {
        return;
      }
    }
    onApprove(recurringAvailability);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Set Car Viewing Availability
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Reference Information */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Reference: Owner's Access Arrangements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Vehicle Access Availability</Label>
                  <p className="text-slate-700 bg-white p-2 rounded border">
                    {request.access_arrangements?.vehicle_access_availability || 'Not specified'}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Key Pickup Availability</Label>
                  <p className="text-slate-700 bg-white p-2 rounded border">
                    {request.access_arrangements?.key_pickup_availability || 'Not specified'}
                  </p>
                </div>
              </div>
              <div>
                <Label className="font-medium">Handover Availability</Label>
                <p className="text-slate-700 bg-white p-2 rounded border">
                  {request.access_arrangements?.availability_for_handover || 'Not specified'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Add New Time Slot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-green-600" />
                Add Car Viewing Time Slot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="day">Day of Week</Label>
                  <Select
                    value={newSlot.day_of_week}
                    onValueChange={(value) => setNewSlot({...newSlot, day_of_week: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map(day => (
                        <SelectItem key={day.value} value={day.value}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
                  />
                </div>
                <div className="md:flex md:items-end">
                  <Button onClick={handleAddSlot} className="w-full md:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slot
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="meeting-address">Meeting Address</Label>
                <Input
                  id="meeting-address"
                  placeholder="Where car viewings will take place (defaults to vehicle location)"
                  value={newSlot.meeting_address}
                  onChange={(e) => setNewSlot({...newSlot, meeting_address: e.target.value})}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Default: {request.access_arrangements?.vehicle_location_address || 'Vehicle location'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Availability Schedule */}
          {recurringAvailability.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  Scheduled Availability ({recurringAvailability.length} slots)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recurringAvailability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Badge className="capitalize">{slot.day_of_week}</Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-500" />
                          {slot.start_time} - {slot.end_time}
                        </div>
                        {slot.meeting_address && (
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-4 h-4" />
                            {slot.meeting_address}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSlot(index)}
                        className="text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Approval Warning */}
          {recurringAvailability.length === 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No car viewing availability has been set. If you approve without setting availability, 
                car viewing requests will need to be manually coordinated by contacting the vehicle owner.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve Request {recurringAvailability.length > 0 ? '& Set Availability' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
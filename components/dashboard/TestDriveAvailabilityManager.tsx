
"use client"

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Calendar, Clock, MapPin, Plus, Trash2, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function TestDriveAvailabilityManager({ vehicle, onClose, onSave }) {
  const [availability, setAvailability] = useState(vehicle.recurring_availability || []);
  const [newSlot, setNewSlot] = useState({
    day_of_week: "",
    start_time: "",
    end_time: "",
    meeting_address: ""
  });

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2);
    const minutes = i % 2 === 0 ? "00" : "30";
    const formattedHours = hours.toString().padStart(2, '0');
    return `${formattedHours}:${minutes}`;
  });

  const handleAddSlot = () => {
    if (
      newSlot.day_of_week &&
      newSlot.start_time &&
      newSlot.end_time &&
      newSlot.start_time < newSlot.end_time
    ) {
      setAvailability([...availability, { ...newSlot, id: Date.now().toString() }]);
      setNewSlot({ day_of_week: "", start_time: "", end_time: "", meeting_address: "" });
    } else {
      alert("Please fill out all fields correctly. Start time must be before end time.");
    }
  };

  const handleRemoveSlot = (id) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
  };

  const handleSave = () => {
    onSave(vehicle.id, { recurring_availability: availability });
  };
  
  const handleInputChange = (field, value) => {
    setNewSlot(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="border-0 shadow-none flex-1 flex flex-col">
          <CardHeader className="flex flex-row items-start justify-between border-b">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Manage Car Viewing Availability
              </CardTitle>
              <CardDescription className="mt-1">
                Set recurring weekly availability for: <span className="font-semibold">{vehicle.title}</span>
              </CardDescription>
            </div>
             <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
                <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Form to add new slot */}
              <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                <h4 className="font-semibold text-slate-800">Add New Availability Slot</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="day-of-week">Day</Label>
                    <Select
                      value={newSlot.day_of_week}
                      onValueChange={(value) => handleInputChange('day_of_week', value)}
                    >
                      <SelectTrigger id="day-of-week">
                        <SelectValue placeholder="Select a day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="start-time">Start Time</Label>
                    <Select
                      value={newSlot.start_time}
                      onValueChange={(value) => handleInputChange('start_time', value)}
                    >
                      <SelectTrigger id="start-time">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="end-time">End Time</Label>
                    <Select
                      value={newSlot.end_time}
                      onValueChange={(value) => handleInputChange('end_time', value)}
                    >
                      <SelectTrigger id="end-time">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddSlot} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add
                    </Button>
                  </div>
                </div>
                 <div>
                    <Label htmlFor="meeting-address">Meeting Address (Optional)</Label>
                    <Input
                      id="meeting-address"
                      placeholder="e.g., 123 Main St, Anytown, USA"
                      value={newSlot.meeting_address}
                      onChange={(e) => handleInputChange('meeting_address', e.target.value)}
                    />
                  </div>
              </div>

              {/* List of current slots */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">Current Availability</h4>
                {availability.length === 0 ? (
                  <div className="text-center text-slate-500 py-8 border-2 border-dashed rounded-lg">
                    No availability slots have been set for this vehicle.
                  </div>
                ) : (
                  availability.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary" className="capitalize w-24 justify-center py-1 text-sm">
                          {slot.day_of_week}
                        </Badge>
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>{slot.start_time} - {slot.end_time}</span>
                        </div>
                         {slot.meeting_address && (
                          <div className="flex items-center gap-2 text-slate-700 text-sm">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span className="truncate max-w-xs">{slot.meeting_address}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveSlot(slot.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
           <CardFooter className="bg-slate-50 border-t p-4 flex justify-end">
            <Button onClick={handleSave} size="lg">
              <Save className="w-4 h-4 mr-2" />
              Save Availability
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
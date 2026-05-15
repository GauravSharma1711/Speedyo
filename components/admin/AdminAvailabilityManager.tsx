"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Info, MapPin, Plus, Trash2, X } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/TextArea";
import { useToast } from "@/components/ui/UseToast";

export type AvailabilityDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type AvailabilitySlot = {
  day_of_week: AvailabilityDay;
  start_time: string; // "09:00"
  end_time: string; // "17:00"
  meeting_address: string;
};

export default function AdminAvailabilityManagerUI(props: {
  isOpen: boolean;
  onClose: () => void;

  title?: string;
  initialAvailability?: AvailabilitySlot[];
  defaultMeetingAddress?: string;

  onSave: (slots: AvailabilitySlot[]) => void;
}) {
  const { toast } = useToast();
  const {
    isOpen,
    onClose,
    title,
    initialAvailability,
    defaultMeetingAddress,
    onSave,
  } = props;

  const defaultSlot: AvailabilitySlot = useMemo(
    () => ({
      day_of_week: "monday",
      start_time: "09:00",
      end_time: "17:00",
      meeting_address: defaultMeetingAddress ?? "",
    }),
    [defaultMeetingAddress],
  );

  const [availability, setAvailability] = useState<AvailabilitySlot[]>([defaultSlot]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialAvailability && initialAvailability.length > 0) {
      setAvailability(
        initialAvailability.map((s) => ({
          day_of_week: s.day_of_week ?? "monday",
          start_time: s.start_time ?? "09:00",
          end_time: s.end_time ?? "17:00",
          meeting_address: s.meeting_address ?? defaultMeetingAddress ?? "",
        })),
      );
    } else {
      setAvailability([defaultSlot]);
    }
  }, [isOpen, initialAvailability, defaultSlot, defaultMeetingAddress]);

  const addTimeSlot = () => {
    setAvailability((prev) => [...prev, { ...defaultSlot }]);
  };

  const removeTimeSlot = (index: number) => {
    setAvailability((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTimeSlot = <K extends keyof AvailabilitySlot>(
    index: number,
    field: K,
    value: AvailabilitySlot[K],
  ) => {
    setAvailability((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onSave(availability);
  
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const entityTitle = title || "Vehicle";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Set Car Viewing Availability
            </h2>
            <p className="text-slate-600">{entityTitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure recurring weekly availability for car viewing.
            </AlertDescription>
          </Alert>

          {availability.map((slot, index) => (
            <Card key={index} className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    Time Slot #{index + 1}
                  </span>

                  {availability.length > 1 ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTimeSlot(index)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove time slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  ) : null}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor={`day-${index}`}>Day of Week</Label>
                    <Select
                      value={slot.day_of_week}
                      onValueChange={(value) =>
                        updateTimeSlot(index, "day_of_week", value as AvailabilityDay)
                      }
                    >
                      <SelectTrigger id={`day-${index}`}>
                        <SelectValue />
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
                    <Label htmlFor={`start-${index}`}>Start Time</Label>
                    <Input
                      id={`start-${index}`}
                      type="time"
                      value={slot.start_time}
                      onChange={(e) =>
                        updateTimeSlot(index, "start_time", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor={`end-${index}`}>End Time</Label>
                    <Input
                      id={`end-${index}`}
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => updateTimeSlot(index, "end_time", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor={`address-${index}`}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Meeting Address for Car Viewing
                  </Label>
                  <Textarea
                    id={`address-${index}`}
                    value={slot.meeting_address}
                    onChange={(e) =>
                      updateTimeSlot(index, "meeting_address", e.target.value)
                    }
                    placeholder="Enter the exact address where buyers should meet..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center">
            <Button variant="outline" onClick={addTimeSlot} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Another Time Slot
            </Button>
          </div>
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
            {isSaving ? "Saving..." : "Save Availability"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
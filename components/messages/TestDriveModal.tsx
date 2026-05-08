
"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Calendar as CalendarIcon, X, AlertTriangle, Info } from "lucide-react";
import { Calendar } from "@/components/ui/Calender";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { format, addMonths } from "date-fns";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "@/components/ui/Alert";

type RecurringAvailability = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  meeting_address: string;
};

type TestDriveVehicle = {
  id: string;
  title: string;
  location?: string | null;
  recurring_availability?: RecurringAvailability[];
};

type ConversationLike = { managedSaleRequestId?: string | null } | null;

export type TestDriveSubmitData = {
  vehicleId: string;
  vehicleTitle: string;
  preferred_date: string;
  preferred_time: string;
  location: string;
  notes: string;
  status: "pending";
  managedSaleRequestId: string | null;
};

type TestDriveModalProps = {
  conversation: ConversationLike;
  vehicles: TestDriveVehicle[];
  onClose: () => void;
  onSubmit: (data: TestDriveSubmitData) => void | Promise<void>;
  preselectedVehicleId?: string;
  currentUser: { email?: string | null } | null;
};

export default function TestDriveModal({
  conversation,
  vehicles,
  onClose,
  onSubmit,
  preselectedVehicleId,
  currentUser,
}: TestDriveModalProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState(preselectedVehicleId || "");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [meetingAddress, setMeetingAddress] = useState("");
  const [hasNoAvailability, setHasNoAvailability] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  useEffect(() => {
    if (preselectedVehicleId) {
      setSelectedVehicleId(preselectedVehicleId);
    }
  }, [preselectedVehicleId]);

  useEffect(() => {
    const isAvailabilitySet = selectedVehicle?.recurring_availability && selectedVehicle.recurring_availability.length > 0;
    setHasNoAvailability(!isAvailabilitySet);

    if (selectedDate && selectedVehicle) {
      if (isAvailabilitySet) {
        const dayOfWeek = format(selectedDate, 'eeee').toLowerCase();
        const availabilityForDay = (selectedVehicle.recurring_availability ?? []).find(
          (avail: RecurringAvailability) => avail.day_of_week === dayOfWeek
        );

        if (availabilityForDay) {
          setMeetingAddress(availabilityForDay.meeting_address);
          const slots: string[] = [];
          const [startHour, startMinute] = availabilityForDay.start_time.split(':').map(Number);
          const [endHour, endMinute] = availabilityForDay.end_time.split(':').map(Number);

          let currentTime = new Date(selectedDate);
          currentTime.setHours(startHour, startMinute, 0, 0);

          const endTime = new Date(selectedDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          while (currentTime < endTime) {
            const timeString = format(currentTime, 'HH:mm');
            slots.push(timeString);
            currentTime.setMinutes(currentTime.getMinutes() + 30);
          }
          setAvailableTimeSlots(slots);
        } else {
          setAvailableTimeSlots([]);
        }
      } else {
        const slots: string[] = [];
        for (let hour = 9; hour < 17; hour++) {
          slots.push(`${String(hour).padStart(2, '0')}:00`);
          slots.push(`${String(hour).padStart(2, '0')}:30`);
        }
        setAvailableTimeSlots(slots);
        setMeetingAddress(selectedVehicle.location || "To be confirmed by seller");
      }
    } else {
      setAvailableTimeSlots([]);
      setMeetingAddress("");
    }
    setSelectedTimeSlot("");
  }, [selectedDate, selectedVehicle]);

  const isDayAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    if (hasNoAvailability) {
      return true;
    }

    if (!selectedVehicle?.recurring_availability) {
      return false;
    }

    const dayOfWeek = format(date, 'eeee').toLowerCase();
    return selectedVehicle.recurring_availability.some(
      (avail: RecurringAvailability) => avail.day_of_week === dayOfWeek
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedVehicleId || !selectedDate || !selectedTimeSlot) {
      alert("Please select a vehicle, date, and time slot.");
      return;
    }
    
    const testDriveData: TestDriveSubmitData = {
      vehicleId: selectedVehicleId,
      vehicleTitle: selectedVehicle?.title || "Unknown Vehicle",
      preferred_date: format(selectedDate, "yyyy-MM-dd"),
      preferred_time: selectedTimeSlot,
      location: meetingAddress,
      notes,
      status: "pending",
      managedSaleRequestId: conversation?.managedSaleRequestId || null,
    };

    onSubmit(testDriveData);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="bg-white">
          <CardHeader className="flex justify-between items-start">
            <div>
              <CardTitle>Schedule a Test Drive</CardTitle>
              <CardDescription>Select a vehicle and choose a time that works for you.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Selection */}
              <div>
                <label className="text-sm font-medium">
                  Vehicle
                </label>
                <Select
                  value={selectedVehicleId}
                  onValueChange={setSelectedVehicleId}
                  required
                  disabled={!!preselectedVehicleId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle..." />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle: TestDriveVehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedVehicle && (
                <>
                  {hasNoAvailability && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This seller has not set their recurring test drive availability. Please select a date and we will coordinate with them.
                      </AlertDescription>
                    </Alert>
                  )}
                  {meetingAddress && (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        <strong className="block">Meeting Address:</strong>
                        <span>{meetingAddress}</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  {/* Date and Time Selection */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className=""
                            classNames={{}}
                            disabled={(date: Date) => !isDayAvailable(date)}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            fromDate={new Date()}
                            toDate={addMonths(new Date(), 3)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Time</label>
                      <Select
                        value={selectedTimeSlot}
                        onValueChange={setSelectedTimeSlot}
                        disabled={!selectedDate || availableTimeSlots.length === 0}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.length > 0 ? (
                            availableTimeSlots.map(slot => (
                              <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-slate-500">No slots available for this day.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any questions or specific things you'd like to check during the test drive?"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
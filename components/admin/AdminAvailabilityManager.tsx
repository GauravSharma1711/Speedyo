
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, MapPin, Plus, Trash2, X, Info, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Vehicle, ManagedSaleRequest } from "@/entities/all";
import { useToast } from "@/components/ui/use-toast";

export default function AdminAvailabilityManager({
  isOpen,
  onClose,
  vehicle,
  managedSaleRequest,
  onUpdate
}) {
  const [availability, setAvailability] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCurrentAvailability, setIsLoadingCurrentAvailability] = useState(true);
  const { toast } = useToast();

  const loadCurrentAvailability = useCallback(async () => {
    setIsLoadingCurrentAvailability(true);
    try {
      let existingAvailability = [];
      let sourceVehicle = vehicle; // Start with the vehicle prop if provided

      // If called from MSR context and vehicle prop is not passed,
      // try to load the vehicle linked to the MSR
      if (!sourceVehicle && managedSaleRequest?.created_vehicle_id) {
          const liveVehicles = await Vehicle.filter({ id: managedSaleRequest.created_vehicle_id });
          if (liveVehicles.length > 0) {
              sourceVehicle = liveVehicles[0];
          }
      }

      // Prioritize availability from the source vehicle (live or fetched)
      if (sourceVehicle && sourceVehicle.recurring_availability && sourceVehicle.recurring_availability.length > 0) {
        existingAvailability = sourceVehicle.recurring_availability;
      } else if (managedSaleRequest?.access_arrangements?.recurring_availability && managedSaleRequest.access_arrangements.recurring_availability.length > 0) {
        // Fallback for MSR before vehicle is created or if vehicle has no availability
        existingAvailability = managedSaleRequest.access_arrangements.recurring_availability;
      }

      // Set default if no existing availability
      if (existingAvailability.length === 0) {
        // Determine a sensible default address
        const defaultAddress = vehicle?.location || sourceVehicle?.location || managedSaleRequest?.access_arrangements?.vehicle_location_address || managedSaleRequest?.vehicle_details?.location || '';
        existingAvailability = [{
          day_of_week: 'monday',
          start_time: '09:00',
          end_time: '17:00',
          meeting_address: defaultAddress
        }];
      }

      setAvailability(existingAvailability);
    } catch (error) {
      console.error("Failed to load current availability:", error);
      // Set default on error
      const defaultAddress = vehicle?.location || managedSaleRequest?.access_arrangements?.vehicle_location_address || managedSaleRequest?.vehicle_details?.location || '';
      setAvailability([{
        day_of_week: 'monday',
        start_time: '09:00',
        end_time: '17:00',
        meeting_address: defaultAddress
      }]);
    }
    setIsLoadingCurrentAvailability(false);
  }, [managedSaleRequest, vehicle]); // Added vehicle as a dependency

  useEffect(() => {
    if (isOpen && (managedSaleRequest || vehicle)) { // Condition updated to include vehicle
      loadCurrentAvailability();
    }
  }, [isOpen, managedSaleRequest, vehicle, loadCurrentAvailability]); // Added vehicle as a dependency

  const addTimeSlot = () => {
    const defaultAddress = vehicle?.location || managedSaleRequest?.access_arrangements?.vehicle_location_address || managedSaleRequest?.vehicle_details?.location || '';
    setAvailability([...availability, {
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '17:00',
      meeting_address: defaultAddress
    }]);
  };

  const removeTimeSlot = (index) => {
    setAvailability(availability.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...availability];
    updated[index] = { ...updated[index], [field]: value };
    setAvailability(updated);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Update the vehicle if it exists (for listed managed sales or if vehicle prop is present)
      if (vehicle?.id) {
        await Vehicle.update(vehicle.id, {
          recurring_availability: availability
        });
      } else if (managedSaleRequest?.created_vehicle_id) {
        await Vehicle.update(managedSaleRequest.created_vehicle_id, {
          recurring_availability: availability
        });
      }

      // Update the managed sale request (always if it exists)
      if (managedSaleRequest?.id) {
        const updatedAccessArrangements = {
          ...managedSaleRequest.access_arrangements,
          recurring_availability: availability
        };

        await ManagedSaleRequest.update(managedSaleRequest.id, {
          access_arrangements: updatedAccessArrangements
        });
      }

      toast({
        title: "Availability Updated",
        description: "Test drive availability has been successfully configured.",
        variant: "info",
      });

      onUpdate();
    } catch (error) {
      console.error("Failed to update availability:", error);
      toast({
        title: "Update Failed",
        description: "Could not update test drive availability. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  // Prioritize vehicle title if vehicle prop is passed, otherwise fall back to MSR details
  const entityTitle = vehicle?.title || managedSaleRequest?.vehicle_details?.title || 'Vehicle';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
      >
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Set Test Drive Availability</h2>
            <p className="text-slate-600">{entityTitle}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Configure recurring weekly availability for test drives. Current availability is loaded automatically.
            </AlertDescription>
          </Alert>

          {isLoadingCurrentAvailability ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading current availability...
            </div>
          ) : (
            <>
              {availability.map((slot, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Time Slot #{index + 1}
                      </span>
                      {availability.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTimeSlot(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`day-${index}`}>Day of Week</Label>
                        <Select
                          value={slot.day_of_week}
                          onValueChange={(value) => updateTimeSlot(index, 'day_of_week', value)}
                        >
                          <SelectTrigger>
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
                        <Label htmlFor={`start-time-${index}`}>Start Time</Label>
                        <Input
                          id={`start-time-${index}`}
                          type="time"
                          value={slot.start_time}
                          onChange={(e) => updateTimeSlot(index, 'start_time', e.target.value)}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`end-time-${index}`}>End Time</Label>
                        <Input
                          id={`end-time-${index}`}
                          type="time"
                          value={slot.end_time}
                          onChange={(e) => updateTimeSlot(index, 'end_time', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`address-${index}`} className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Meeting Address for Test Drives
                      </Label>
                      <Textarea
                        id={`address-${index}`}
                        value={slot.meeting_address}
                        onChange={(e) => updateTimeSlot(index, 'meeting_address', e.target.value)}
                        placeholder="Enter the exact address where buyers should meet for test drives..."
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={addTimeSlot}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Time Slot
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isLoadingCurrentAvailability}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Save Availability
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

"use client"
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { X, Calendar, Car } from "lucide-react";
 
type Vehicle = {
  id: string;
  title: string;
  price: number;
  location: string;
  notes: string;
  preferred_date: string;
  preferred_time: string;
}
export default function TestDriveModal({ vehicle, onClose, onSubmit }: { vehicle: Vehicle, onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    preferred_date: "",
    preferred_time: "",
    location: "",
    notes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    onSubmit({
      ...formData,
      vehicleTitle: vehicle.title,
      vehicleId: vehicle.id,
      status: "pending"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Request Test Drive
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{vehicle.title}</p>
                  <p className="text-xs text-slate-500">${vehicle.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Preferred Date
                </label>
                <Input
                  type="date"
                  value={formData.preferred_date}
                  onChange={(e) => handleInputChange('preferred_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Preferred Time
                </label>
                <Select value={formData.preferred_time} onValueChange={(value) => handleInputChange('preferred_time', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                    <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Meeting Location
                </label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Where would you like to meet?"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Additional Notes (Optional)
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special requirements or questions?"
                  className="h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!formData.preferred_date || !formData.location}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                >
                  Send Request
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
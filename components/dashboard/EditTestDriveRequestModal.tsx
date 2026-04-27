
"use client"

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin } from "lucide-react";

export default function EditTestDriveRequestModal({ isOpen, request, onClose, onSave }) {
    const [details, setDetails] = useState({
        preferred_date: '',
        preferred_time: '',
        location: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (request?.test_drive_details) {
            setDetails({
                preferred_date: request.test_drive_details.preferred_date || '',
                preferred_time: request.test_drive_details.preferred_time || '',
                location: request.test_drive_details.location === "N/A" ? '' : (request.test_drive_details.location || ''),
            });
        }
    }, [request]);

    const handleChange = (e) => {
        setDetails({ ...details, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!details.location) {
            alert("Please specify a location for the test drive.");
            return;
        }
        setIsSaving(true);
        await onSave(request.id, details);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>

                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-600" />
                        Update Test Drive Details
                    </h2>
                    
                    <p className="text-sm text-slate-600 mb-6">
                        Confirm or update the details for the test drive request. A location is required to proceed.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label htmlFor="preferred_date" className="flex items-center gap-1"><Calendar className="w-4 h-4"/>Date</Label>
                            <Input
                                id="preferred_date"
                                name="preferred_date"
                                type="date"
                                value={details.preferred_date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="preferred_time" className="flex items-center gap-1"><Clock className="w-4 h-4"/>Time</Label>
                            <Input
                                id="preferred_time"
                                name="preferred_time"
                                type="time"
                                value={details.preferred_time}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="location" className="flex items-center gap-1"><MapPin className="w-4 h-4"/>Location (Required)</Label>
                            <Textarea
                                id="location"
                                name="location"
                                placeholder="e.g., Camp Foster Starbucks, Gate 1"
                                value={details.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || !details.location}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
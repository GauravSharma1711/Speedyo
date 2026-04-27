"use client"

import React, { useState } from "react";
import { Message, ManagedSaleRequest, Notification } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Car, FileText, Send } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function TestDriveReportModal({ 
  testDriveMessage, 
  buyer, 
  vehicle, 
  isOpen, 
  onClose, 
  onReportSubmitted,
  currentUser 
}) {
  const [reportData, setReportData] = useState({
    buyer_interest_level: testDriveMessage?.test_drive_details?.buyer_interest_level || "",
    buyer_feedback: testDriveMessage?.test_drive_details?.buyer_feedback || "",
    speedio_report: testDriveMessage?.test_drive_details?.speedio_report || "",
    next_steps: testDriveMessage?.test_drive_details?.next_steps || "",
    admin_notes: testDriveMessage?.test_drive_details?.admin_notes || ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!reportData.buyer_interest_level || !reportData.speedio_report) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Update the original test drive message with completed status and report data
      const updatedTestDriveDetails = {
        ...testDriveMessage.test_drive_details,
        status: "completed",
        buyer_feedback: reportData.buyer_feedback,
        speedio_report: reportData.speedio_report,
        buyer_interest_level: reportData.buyer_interest_level,
        next_steps: reportData.next_steps,
        admin_notes: reportData.admin_notes,
        completed_by_admin: currentUser.email
      };

      await Message.update(testDriveMessage.id, {
        test_drive_details: updatedTestDriveDetails
      });

      // Find the managed sale request and owner for this vehicle
      let managedSaleRequest = null;
      let originalOwnerId = null;

      if (vehicle?.website_managed && vehicle?.original_owner_id) {
        originalOwnerId = vehicle.original_owner_id;
        
        // Find the managed sale request for this vehicle
        const managedSales = await ManagedSaleRequest.filter({ created_vehicle_id: vehicle.id }, '-created_date', 1);
        if (managedSales.length > 0) {
          managedSaleRequest = managedSales[0];
        }
      }

      if (originalOwnerId && managedSaleRequest) {
        // CRITICAL FIX: Use "managed_sale_" prefix to match the original conversation
        const conversationId = `managed_sale_${managedSaleRequest.id}`;

        const reportMessage = `📋 **Test Drive Report - ${vehicle.title || 'Vehicle'}**

A potential buyer has completed their test drive of your vehicle. Here's our detailed assessment:

**🎯 Buyer Interest Level:** ${reportData.buyer_interest_level}

**📝 Speedio's Assessment:**
${reportData.speedio_report}

**💬 Buyer's Feedback:**
${reportData.buyer_feedback || 'No specific feedback provided'}

**🚀 Recommended Next Steps:**
${reportData.next_steps}

**📊 Test Drive Details:**
• Date: ${testDriveMessage.test_drive_details?.preferred_date || 'Not specified'}
• Duration: ${testDriveMessage.test_drive_details?.duration_minutes || 30} minutes

🎉 **Great news!** This buyer shows ${reportData.buyer_interest_level.replace('_', ' ')} interest. We'll continue working with them on next steps and keep you informed.`;

        await Message.create({
          recipient_id: originalOwnerId,
          sender_id: currentUser.id,
          content: reportMessage,
          message_type: "system",
          vehicle_id: vehicle.id,
          conversation_id: conversationId, // Use matching conversation_id
          test_drive_details: updatedTestDriveDetails
        });

        // Create notification for the owner
        await Notification.create({
          recipient_id: originalOwnerId,
          sender_id: currentUser.id,
          type: "test_drive_status_update",
          content: `Test drive report completed for your ${vehicle.title}. Buyer shows ${reportData.buyer_interest_level.replace('_', ' ')} interest.`,
          related_entity_type: "Vehicle",
          related_entity_id: vehicle.id,
          url: createPageUrl("Messages"),
          icon: "FileText"
        });
      }

      onReportSubmitted();
    } catch (error) {
      console.error("Failed to save test drive report:", error);
      alert("Failed to save report. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Test Drive Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Test Drive Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {vehicle?.primary_image ? (
                    <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{vehicle?.title || 'Unknown Vehicle'}</h3>
                  <p className="text-sm text-slate-600">Buyer: {buyer?.full_name || 'Unknown'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Date: {testDriveMessage?.test_drive_details?.preferred_date || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Time: {testDriveMessage?.test_drive_details?.preferred_time || 'Not set'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Buyer Interest Level *
              </label>
              <Select 
                value={reportData.buyer_interest_level} 
                onValueChange={(value) => setReportData(prev => ({...prev, buyer_interest_level: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interest level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_interested">Very Interested</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="somewhat_interested">Somewhat Interested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Buyer's Feedback
              </label>
              <Textarea
                value={reportData.buyer_feedback}
                onChange={(e) => setReportData(prev => ({...prev, buyer_feedback: e.target.value}))}
                placeholder="What did the buyer say about the vehicle?"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Speedio's Assessment *
              </label>
              <Textarea
                value={reportData.speedio_report}
                onChange={(e) => setReportData(prev => ({...prev, speedio_report: e.target.value}))}
                placeholder="Your professional assessment of the test drive and buyer's likelihood to purchase"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Recommended Next Steps
              </label>
              <Textarea
                value={reportData.next_steps}
                onChange={(e) => setReportData(prev => ({...prev, next_steps: e.target.value}))}
                placeholder="What should happen next? (e.g., follow up call, prepare documents, etc.)"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Internal Admin Notes
              </label>
              <Textarea
                value={reportData.admin_notes}
                onChange={(e) => setReportData(prev => ({...prev, admin_notes: e.target.value}))}
                placeholder="Internal notes (not shared with owner)"
                className="h-20"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isSubmitting || !reportData.buyer_interest_level || !reportData.speedio_report}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Send className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Save & Send Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
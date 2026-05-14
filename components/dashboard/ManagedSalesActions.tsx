
"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { Label } from "@/components/ui/Label";
import { managedSaleService, notificationService, userService } from "@/services/dashboard";


import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { 
  Edit, 
  X, 
  AlertTriangle, 
  CheckCircle
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/ui/UseToast";

import VehicleEditRequestModal from "./VehicleEditRequestModal";

type ManagedSalesActionsProps = {
  request: any;
  currentUser: any;
  onUpdate: () => void;
};

export default function ManagedSalesActions({ request, currentUser, onUpdate }: ManagedSalesActionsProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  if (!request) return null;

  const canRequestEdit = ['approved', 'listed'].includes(request.status);
  const canCancel = ['pending_review', 'approved', 'listed'].includes(request.status);
  const hasActiveListing = request.created_vehicle_id && request.status === 'listed';

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "Cancellation Reason Required",
        description: "Please provide a reason for cancelling this request.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Update the managed sale request
      await managedSaleService.update(request.id, {
        status: 'cancellation_requested',
        cancellation_reason: cancelReason
      });

      // Send notification to admins
      try {
        const adminUsers = await userService.getAdmins();

        const notificationPromises = adminUsers.map((admin: any) =>
          notificationService.create({
            recipientId: admin.id,
            type: "managed_sale_status_update",
            content: `User ${currentUser.full_name} has requested to cancel their managed sale for "${request.vehicle_details?.title}". Reason: ${cancelReason}`,
            related_entity_type: "ManagedSaleRequest",
            related_entity_id: request.id,
            url: "/Admin-Panel?tab=managed_sales",
            icon: "AlertTriangle"
          })
        );

        await Promise.all(notificationPromises);
      } catch (error) {
        console.warn("Failed to notify admins:", error);
      }

      await notificationService.create({
        recipientId: currentUser.id,
        type: "managed_sale_status_update",
        content: `Your cancellation request for "${request.vehicle_details?.title}" has been submitted and is being reviewed by our team. We'll update you on the status soon.`,
        related_entity_type: "ManagedSaleRequest",
        related_entity_id: request.id,
        url: "/Dashboard",
        icon: "AlertTriangle"
      });

      toast({
        title: "Cancellation Requested",
        description: "Your cancellation request has been submitted for admin review.",
        variant: "success",
      });

      setShowCancelConfirm(false);
      setCancelReason("");
      onUpdate();
    } catch (error) {
      console.error("Failed to cancel request:", error);
      toast({
        title: "Cancellation Failed",
        description: "Failed to submit cancellation request. Please try again.",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-4">
      {/* Status-based alerts */}
      {request.status === 'cancellation_requested' && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Cancellation Pending:</strong> Your cancellation request is being reviewed. 
            {request.cancellation_reason && (
              <span className="block mt-1 text-sm">Reason: {request.cancellation_reason}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {request.status === 'edit_requested' && (
        <Alert className="border-blue-200 bg-blue-50">
          <Edit className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Edit Request Pending:</strong> Your edit request is being reviewed by our team.
          </AlertDescription>
        </Alert>
      )}

      {hasActiveListing && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Live Listing:</strong> Your vehicle is actively listed and available for car viewing.
            <a 
              href={`/vehicle?id=${request.created_vehicle_id}`}
              className="ml-2 text-green-700 underline hover:text-green-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Public Listing →
            </a>
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canRequestEdit && (
          <Button
            onClick={() => setShowEditModal(true)}
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Request Edit
          </Button>
        )}

        {canCancel && (
          <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                <X className="w-4 h-4 mr-2" />
                Cancel Request
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Confirm Cancellation Request
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to request cancellation of your managed sale for "{request.vehicle_details?.title}"? 
                  This action will be reviewed by our team.
                  {hasActiveListing && (
                    <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                      <strong className="text-amber-800">Note:</strong> Your vehicle currently has an active listing with potential buyers. 
                      Cancelling may affect ongoing interest and scheduled Car Viewing.
                    </div>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <div className="space-y-3">
                <Label htmlFor="cancel-reason" className="text-sm font-medium">
                  Please provide a reason for cancellation (required):
                </Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g., Found another buyer, changed my mind, vehicle sold elsewhere..."
                  rows={3}
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCancelReason("")}>
                  Keep My Request
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancelRequest}
                  disabled={!cancelReason.trim() || isProcessing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? "Submitting..." : "Submit Cancellation Request"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Edit Request Modal */}
      {showEditModal && (
        <VehicleEditRequestModal
          vehicle={request}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onUpdate();
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
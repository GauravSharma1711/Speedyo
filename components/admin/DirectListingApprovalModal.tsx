"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { X, CheckCircle, Car, DollarSign, User, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

type DirectListingRequest = {
  id: string;
  created_date: string;
  status: string;
  listing_type: "direct";
  submitted_by_user_id: string;
  vehicle_details: {
    title: string;
    make: string;
    model: string;
    year: number;
    seller_asking_price: number | null;
    images_thumbnails?: string[];
  };
  contact_email?: string | null;
  contact_full_name?: string | null;
  seller_asking_price?: number | string | null;
  dealer_fee?: number | string | null;
  service_fee_amount?: number | string | null;
  owner_receives_amount?: number | string | null;
  final_sale_price_for_buyer?: number | string | null;
};

type Props = {
  isOpen: boolean;
  request: any | null;
  onClose: () => void;
  onApprove: (id: string, notes: string) => Promise<void>;
  onDecline: (id: string, reason: string) => Promise<void>;
  submitterInfo?: {
    full_name?: string | null;
    email?: string | null;
    profile_image?: string | null;
  };
};

export default function DirectListingApprovalModal({
  isOpen,
  request,
  onClose,
  onApprove,
  onDecline,
  submitterInfo,
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineForm, setShowDeclineForm] = useState(false);

  if (!isOpen || !request) return null;

  const vehicle = request.vehicle_details;
  const price = Number(request.vehicle_details?.seller_asking_price ?? 0);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(request.id, adminNotes);
      onClose();
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert("Please provide a reason for declining.");
      return;
    }
    setIsProcessing(true);
    try {
      await onDecline(request.id, declineReason);
      onClose();
    } catch (error) {
      console.error("Failed to decline:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center">
              <Car className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Direct Listing Approval</h2>
              <p className="text-xs text-slate-500">Review and approve this listing request</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="w-32 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              {vehicle?.images_thumbnails?.[0] ? (
                <img
                  src={vehicle.images_thumbnails[0]}
                  alt={vehicle.title || "Vehicle"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Car className="w-10 h-10 text-slate-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-slate-800 mb-2">
                {vehicle?.title || `${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                  Direct Listing
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending Approval
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                {vehicle?.year} {vehicle?.make} {vehicle?.model}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Listed By</span>
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  {submitterInfo?.full_name || request.contact_full_name || "Unknown User"}
                </p>
                <p className="text-xs text-blue-600">
                  {submitterInfo?.email || request.contact_email || "No email"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-emerald-50 border-emerald-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span className="font-medium text-emerald-800">Asking Price</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  ¥{price.toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600">Seller&apos;s asking price</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="font-medium text-slate-700 mb-3">Pricing Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Asking Price</p>
                <p className="font-semibold text-slate-800">¥{price.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Registration Fee</p>
                <p className="font-semibold text-slate-800">¥{(Number(request.dealer_fee) || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-500">Seller Receives</p>
                <p className="font-semibold text-slate-800">¥{(Number(request.owner_receives_amount) || price).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Buyer Price</span>
                <span className="text-xl font-bold text-blue-600">
                  ¥{(Number(request.final_sale_price_for_buyer) || price).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="font-medium text-slate-700">Admin Notes (Optional)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about this listing..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {showDeclineForm ? (
              <>
                <div className="flex-1 space-y-3">
                  <Label className="font-medium text-red-600">Reason for Declining *</Label>
                  <Textarea
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Explain why this listing is being declined..."
                    rows={2}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeclineForm(false)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDecline}
                    disabled={isProcessing || !declineReason.trim()}
                    className="flex-1"
                  >
                    Confirm Decline
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDeclineForm(true)}
                  disabled={isProcessing}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline Listing
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve & Publish
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
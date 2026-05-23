"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Car, CheckCircle, Clock, Edit, Loader2, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/TextArea";
import { useToast } from "@/components/ui/UseToast";
import { useVehicleEditRequestsStore } from "@/store/admin/vehicleEditRequests";
import { notificationService } from "@/services/dashboard";
import type { VehicleEditRequestApi, VehicleEditRequestStatus } from "@/services/admin/vehicleEditRequestServices";

type RequestStatus = VehicleEditRequestStatus;

type EditRequest = {
  id: string;
  vehicle_id: string;
  created_date: string; // ISO
  status: RequestStatus;
  reason: string;
  requested_changes: Record<string, unknown>;
  admin_notes?: string | null;
  processed_by_admin?: string | null;
  processed_at?: string | null;
  requestedByUser: {
    id: string;
    full_name: string;
    email: string;
  };
  vehicle: {
    id: string;
    title: string;
    price?: string | number | null;
    [key: string]: unknown;
  } | null;
};

function getStatusBadge(status: RequestStatus) {
  switch (status) {
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case "declined":
      return (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Declined
        </Badge>
      );
  }
}

function renderValue(v: unknown) {
  if (v == null) return "Not set";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    const s = JSON.stringify(v);
    return s.length > 160 ? `${s.slice(0, 160)}…` : s;
  } catch {
    return String(v);
  }
}

export default function VehicleEditRequestManagementUI() {
  const { toast } = useToast();
  const { items, isLoading, error, fetch, update } = useVehicleEditRequestsStore();
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const editRequests: EditRequest[] = useMemo(() => {
    return items.map((r: VehicleEditRequestApi) => ({
      id: r.id,
      vehicle_id: r.vehicleId,
      created_date: r.createdAt,
      status: r.status,
      reason: r.reason,
      requested_changes: r.requested_changes ?? {},
      admin_notes: r.admin_notes,
      processed_by_admin: r.processed_by_admin,
      processed_at: r.processed_at,
      requestedByUser: r.requestedByUser
        ? {
            id: r.requestedByUser.id,
            full_name: r.requestedByUser.full_name,
            email: r.requestedByUser.email,
          }
        : { id: "", full_name: "Unknown User", email: "" },
      vehicle: r.vehicle
        ? {
            ...r.vehicle,
            id: r.vehicle.id,
            title: r.vehicle.title,
            price: r.vehicle.price,
          }
        : null,
    }));
  }, [items]);

  // per-request notes (avoid single global adminNotes bug)
  const [adminNotesByRequest, setAdminNotesByRequest] = useState<Record<string, string>>(
    {},
  );
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => editRequests.filter((r) => r.status === "pending").length,
    [editRequests],
  );

  const handleApproveRequest = async (requestId: string) => {
    const notes = (adminNotesByRequest[requestId] ?? "").trim();
    setIsSaving(requestId);
    try {
      await update(requestId, { status: "approved", admin_notes: notes || undefined });


      const request = editRequests.find(r => r.id === requestId);
      if (request) {
        await notificationService.create({
          recipientId: request.requestedByUser.id,
          type: "vehicle_edit_approved",
          content: `Your edit request for "${request.vehicle?.title || 'vehicle'}" has been approved and applied to the listing.`,
          relatedEntityId: request.vehicle_id,
          url: `/vehicle/${request.vehicle_id}`,
          icon: "CheckCircle"
        });
      }

      toast({ title: "Request approved", description: `Edit request #${requestId} approved. Seller has been notified.` });
    } catch (_e) {
      toast({
        title: "Action failed",
        description: "Could not approve this request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    const notes = (adminNotesByRequest[requestId] ?? "").trim();
    if (!notes) {
      toast({
        title: "Admin notes required",
        description: "Please provide a reason for declining this request.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(requestId);
    try {
      await update(requestId, { status: "declined", admin_notes: notes });

      // Find the request for notification
      const request = editRequests.find(r => r.id === requestId);
      if (request) {
        await notificationService.create({
          recipientId: request.requestedByUser.id,
          type: "vehicle_edit_declined",
          content: `Your edit request for "${request.vehicle?.title || 'vehicle'}" has been declined. Reason: ${notes}`,
          relatedEntityId: request.vehicle_id,
          url: `/Dashboard`,
          icon: "XCircle"
        });
      }

      toast({ title: "Request declined", description: `Edit request #${requestId} declined. Seller has been notified.` });
    } catch (_e) {
      toast({
        title: "Action failed",
        description: "Could not decline this request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vehicle Edit Requests</h2>
          <p className="text-slate-600">
            Review and manage edit requests for Speedyo-managed vehicles
          </p>
        </div>

        <Badge variant="outline" className="text-lg px-3 py-1">
          {pendingCount} Pending
        </Badge>
      </div>

      {isLoading && editRequests.length === 0 ? (
        <div className="py-14 flex items-center justify-center text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      {!isLoading && editRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Edit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Edit Requests</h3>
            <p className="text-slate-500">
              Vehicle owners haven&apos;t submitted any edit requests yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {editRequests.map((request) => {
            const vehicle = request.vehicle;
            const requester = request.requestedByUser;

            return (
              <Card
                key={request.id}
                className={
                  request.status === "pending"
                    ? "border-amber-200 bg-amber-50/20"
                    : "bg-white"
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {request.requested_changes?.primary_image ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={String(request.requested_changes.primary_image)}
                            alt="Requested image"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : vehicle?.primary_image ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100">
                          <img
                            src={String(vehicle.primary_image)}
                            alt={vehicle.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-blue-600" />
                        </div>
                      )}

                      <div>
                        <CardTitle className="text-lg">
                          {vehicle?.title ?? "Unknown vehicle"}
                        </CardTitle>
                        <p className="text-sm text-slate-600">
                          Requested by {requester?.full_name ?? "Unknown user"} •{" "}
                          {format(new Date(request.created_date), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">Reason for Edit</h4>
                    <p className="text-sm text-slate-700">{request.reason}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-800 mb-3">Requested Changes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(request.requested_changes).map(([field, newValue]) => {
                        const currentValue = vehicle ? (vehicle as Record<string, unknown>)[field] : undefined;

                        const showMoney = field === "price" && typeof newValue === "number";
                        const formatMoney = (v: unknown) =>
                          typeof v === "number" ? `¥${v.toLocaleString()}` : renderValue(v);
                        
                        const showImage = field === "primary_image" && typeof newValue === "string";

                        if (showImage) {
                          return (
                            <div key={field} className="border border-slate-200 rounded-lg p-3">
                              <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                                {field.replaceAll("_", " ")}
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs text-red-600 font-medium">Current:</span>
                                  {currentValue ? (
                                    <div className="mt-1 w-24 h-16 rounded overflow-hidden bg-slate-100">
                                      <img src={String(currentValue)} alt="Current" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-400">No image</p>
                                  )}
                                </div>

                                <div>
                                  <span className="text-xs text-green-600 font-medium">Requested:</span>
                                  <div className="mt-1 w-24 h-16 rounded overflow-hidden bg-slate-100">
                                    <img src={String(newValue)} alt="Requested" className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={field} className="border border-slate-200 rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                              {field.replaceAll("_", " ")}
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-red-600 font-medium">Current:</span>
                                <p className="text-sm">
                                  {showMoney ? formatMoney(currentValue) : renderValue(currentValue)}
                                </p>
                              </div>

                              <div>
                                <span className="text-xs text-green-600 font-medium">
                                  Requested:
                                </span>
                                <p className="text-sm font-medium">
                                  {showMoney ? formatMoney(newValue) : renderValue(newValue)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {request.status !== "pending" && request.admin_notes ? (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Admin Notes</h4>
                      <p className="text-sm text-blue-700">{request.admin_notes}</p>
                      {request.processed_by_admin && request.processed_at ? (
                        <p className="text-xs text-blue-600 mt-2">
                          Processed by {request.processed_by_admin} on{" "}
                          {format(new Date(request.processed_at), "MMM d, yyyy")}
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {request.status === "pending" ? (
                    <div className="border-t border-slate-200 pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Admin Notes (will be shared with the vehicle owner)
                          </label>
                          <Textarea
                            value={adminNotesByRequest[request.id] ?? ""}
                            onChange={(e) =>
                              setAdminNotesByRequest((prev) => ({
                                ...prev,
                                [request.id]: e.target.value,
                              }))
                            }
                            placeholder="Add notes about your decision..."
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            disabled={isSaving === request.id}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {isSaving === request.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            {isSaving === request.id ? "Declining..." : "Decline Request"}
                          </Button>

                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isSaving === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isSaving === request.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            {isSaving === request.id ? "Approving..." : "Approve & Apply Changes"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
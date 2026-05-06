"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Car, CheckCircle, Clock, Edit, XCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/TextArea";

type RequestStatus = "pending" | "approved" | "declined";

type VehicleRow = {
  id: string;
  title: string;
  price?: number | null;
  status?: "available" | "sold";
  [key: string]: unknown;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string;
};

type EditRequest = {
  id: string;
  vehicle_id: string;
  requested_by_user_id: string;
  created_date: string; // ISO
  status: RequestStatus;
  reason: string;
  requested_changes: Record<string, any>;

  admin_notes?: string | null;
  processed_by_admin?: string | null;
  processed_at?: string | null;
};

const MOCK_VEHICLES: VehicleRow[] = [
  {
    id: "v_001",
    title: "2018 Toyota Aqua (Hybrid) — Clean",
    price: 9500,
    status: "available",
    year: 2018,
    make: "Toyota",
    model: "Aqua",
  },
  {
    id: "v_002",
    title: "2020 Honda Fit — Great City Car",
    price: 11200,
    status: "available",
    year: 2020,
    make: "Honda",
    model: "Fit",
  },
];

const MOCK_USERS: UserRow[] = [
  { id: "u_001", full_name: "Yuki Tanaka", email: "yuki@example.com" },
  { id: "u_002", full_name: "Tanmay Ahuja", email: "tanmay@example.com" },
];

const MOCK_REQUESTS: EditRequest[] = [
  {
    id: "req_001",
    vehicle_id: "v_001",
    requested_by_user_id: "u_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "pending",
    reason: "Price and title need correction after new inspection report.",
    requested_changes: {
      title: "2018 Toyota Aqua (Hybrid) — Fresh Inspection",
      price: 9200,
    },
  },
  {
    id: "req_002",
    vehicle_id: "v_002",
    requested_by_user_id: "u_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    status: "approved",
    reason: "Add missing model info and update description.",
    requested_changes: {
      model: "Fit (S Package)",
    },
    admin_notes: "Approved — change is consistent with listing docs.",
    processed_by_admin: "admin@local.dev",
    processed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
];

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

export default function VehicleEditRequestManagementUI() {
  const [vehicles, setVehicles] = useState<VehicleRow[]>(MOCK_VEHICLES);
  const [users] = useState<UserRow[]>(MOCK_USERS);
  const [editRequests, setEditRequests] = useState<EditRequest[]>(MOCK_REQUESTS);

  // per-request notes (avoid single global adminNotes bug)
  const [adminNotesByRequest, setAdminNotesByRequest] = useState<Record<string, string>>(
    {},
  );
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const pendingCount = useMemo(
    () => editRequests.filter((r) => r.status === "pending").length,
    [editRequests],
  );

  const getVehicleById = (vehicleId: string): VehicleRow | null =>
    vehicles.find((v) => v.id === vehicleId) ?? null;

  const getUserById = (userId: string): UserRow | null =>
    users.find((u) => u.id === userId) ?? null;

  const applyRequestedChangesToVehicle = (vehicleId: string, changes: Record<string, any>) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, ...changes } : v)),
    );
  };

  const handleApproveRequest = (requestId: string) => {
    setProcessingRequestId(requestId);
    try {
      const request = editRequests.find((r) => r.id === requestId);
      if (!request) return;

      const notes = (adminNotesByRequest[requestId] ?? "").trim();

      applyRequestedChangesToVehicle(request.vehicle_id, request.requested_changes);

      setEditRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "approved",
                admin_notes: notes || null,
                processed_by_admin: "admin@local.dev",
                processed_at: new Date().toISOString(),
              }
            : r,
        ),
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleDeclineRequest = (requestId: string) => {
    const notes = (adminNotesByRequest[requestId] ?? "").trim();
    if (!notes) {
      alert("Please provide a reason for declining this request.");
      return;
    }

    setProcessingRequestId(requestId);
    try {
      setEditRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "declined",
                admin_notes: notes,
                processed_by_admin: "admin@local.dev",
                processed_at: new Date().toISOString(),
              }
            : r,
        ),
      );
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vehicle Edit Requests</h2>
          <p className="text-slate-600">
            Review and manage edit requests for Speedio-managed vehicles
          </p>
        </div>

        <Badge variant="outline" className="text-lg px-3 py-1">
          {pendingCount} Pending
        </Badge>
      </div>

      {editRequests.length === 0 ? (
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
            const vehicle = getVehicleById(request.vehicle_id);
            const requester = getUserById(request.requested_by_user_id);

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
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>

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
                        const currentValue = vehicle ? (vehicle as any)[field] : undefined;

                        const showMoney = field === "price" && typeof newValue === "number";
                        const formatMoney = (v: any) =>
                          typeof v === "number" ? `$${v.toLocaleString()}` : v ?? "Not set";

                        return (
                          <div key={field} className="border border-slate-200 rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                              {field.replaceAll("_", " ")}
                            </div>

                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-red-600 font-medium">Current:</span>
                                <p className="text-sm">
                                  {showMoney ? formatMoney(currentValue) : currentValue ?? "Not set"}
                                </p>
                              </div>

                              <div>
                                <span className="text-xs text-green-600 font-medium">
                                  Requested:
                                </span>
                                <p className="text-sm font-medium">
                                  {showMoney ? formatMoney(newValue) : newValue ?? "Not set"}
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
                            disabled={processingRequestId === request.id}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline Request
                          </Button>

                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingRequestId === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Apply Changes
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
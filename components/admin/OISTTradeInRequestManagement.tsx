"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar, Car, ExternalLink, Mail, RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

type TradeInStatus = "pending" | "contacted" | "quoted" | "completed" | "cancelled";

type TradeInRequestRow = {
  id: string;
  created_date: string; // ISO
  status: TradeInStatus;

  full_name: string;
  email: string;
  facebook_profile?: string | null;

  vehicle_year: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_mileage: number; // km
  vehicle_condition: "excellent" | "good" | "fair" | "poor";

  additional_details?: string | null;
};

const MOCK: TradeInRequestRow[] = [
  {
    id: "ti_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "pending",
    full_name: "Yuki Tanaka",
    email: "yuki@example.com",
    facebook_profile: "https://facebook.com/",
    vehicle_year: 2015,
    vehicle_make: "Toyota",
    vehicle_model: "Aqua",
    vehicle_mileage: 74000,
    vehicle_condition: "good",
    additional_details: "No accidents. Regular service.",
  },
  {
    id: "ti_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: "contacted",
    full_name: "Tanmay Ahuja",
    email: "tanmay@example.com",
    facebook_profile: null,
    vehicle_year: 2012,
    vehicle_make: "Suzuki",
    vehicle_model: "Jimny",
    vehicle_mileage: 98000,
    vehicle_condition: "fair",
    additional_details: "Some scratches on rear bumper. Interior clean.",
  },
  {
    id: "ti_003",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    status: "completed",
    full_name: "Hiro Sato",
    email: "hiro@example.com",
    facebook_profile: "https://facebook.com/",
    vehicle_year: 2018,
    vehicle_make: "Honda",
    vehicle_model: "Fit",
    vehicle_mileage: 52000,
    vehicle_condition: "excellent",
    additional_details: null,
  },
];

function getStatusColor(status: TradeInStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "contacted":
      return "bg-blue-100 text-blue-800";
    case "quoted":
      return "bg-purple-100 text-purple-800";
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-slate-100 text-slate-800";
  }
}

export default function OISTTradeInRequestManagementUI() {
  const [requests, setRequests] = useState<TradeInRequestRow[]>(MOCK);
  const [isLoading] = useState(false);

  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime(),
    );
  }, [requests]);

  const refresh = () => {
    setRequests(MOCK);
  };

  const handleStatusChange = (requestId: string, newStatus: TradeInStatus) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)),
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">OIST Trade-In Requests</h2>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {sorted.length === 0 ? (
        <Card className="bg-white shadow-md">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No trade-in requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sorted.map((request) => (
            <Card key={request.id} className="bg-white shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Car className="w-5 h-5 text-purple-600" />
                      {request.vehicle_year} {request.vehicle_make} {request.vehicle_model}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(request.created_date), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                      <span className="text-xs text-slate-400">#{request.id}</span>
                    </div>
                  </div>

                  <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Name:</span>{" "}
                        <span className="font-medium">{request.full_name}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">Email:</span>
                        <a
                          href={`mailto:${request.email}`}
                          className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                        >
                          <Mail className="w-3 h-3" />
                          {request.email}
                        </a>
                      </div>

                      {request.facebook_profile ? (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Facebook:</span>
                          <a
                            href={request.facebook_profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Profile
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Vehicle Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Mileage:</span>{" "}
                        <span className="font-medium">
                          {request.vehicle_mileage.toLocaleString()} km
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Condition:</span>{" "}
                        <span className="font-medium capitalize">{request.vehicle_condition}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {request.additional_details ? (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Additional Details</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                      {request.additional_details}
                    </p>
                  </div>
                ) : null}

                <div className="flex items-center gap-3 pt-4 border-t">
                  <span className="text-sm font-medium text-slate                  -700">Update Status:</span>
                  <Select
                    value={request.status}
                    onValueChange={(value) =>
                      handleStatusChange(request.id, value as TradeInStatus)
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="quoted">Quoted</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
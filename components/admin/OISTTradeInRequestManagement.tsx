"use client"
import React, { useState, useEffect } from "react";
import { OISTTradeInRequest } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Mail, ExternalLink, Calendar, Car } from "lucide-react";
import { format } from "date-fns";

export default function OISTTradeInRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await OISTTradeInRequest.list("-created_date", 100);
      setRequests(data);
    } catch (error) {
      console.error("Failed to load trade-in requests:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await OISTTradeInRequest.update(requestId, { status: newStatus });
      loadRequests();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
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
      default:
        return "bg-slate-100 text-slate-800";
    }
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
        <Button onClick={loadRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No trade-in requests yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
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
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Contact Information */}
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
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Vehicle Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-600">Mileage:</span>{" "}
                        <span className="font-medium">{request.vehicle_mileage} km</span>
                      </div>
                      <div>
                        <span className="text-slate-600">Condition:</span>{" "}
                        <span className="font-medium capitalize">{request.vehicle_condition}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                {request.additional_details && (
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Additional Details</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                      {request.additional_details}
                    </p>
                  </div>
                )}

                {/* Status Management */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <span className="text-sm font-medium text-slate-700">Update Status:</span>
                  <Select
                    value={request.status}
                    onValueChange={(value) => handleStatusChange(request.id, value)}
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
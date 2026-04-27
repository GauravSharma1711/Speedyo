
"use client"

import React, { useState, useEffect } from "react";
import { VehicleEditRequest, Vehicle, User, Notification } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Car
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

export default function VehicleEditRequestManagement() {
  const [editRequests, setEditRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [requests, vehiclesData, usersData] = await Promise.all([
        VehicleEditRequest.list("-created_date", 50),
        Vehicle.list("-created_date", 100),
        User.list("-created_date", 100)
      ]);
      
      setEditRequests(requests);
      setVehicles(vehiclesData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load edit requests:", error);
    }
    setIsLoading(false);
  };

  const getVehicleById = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId) || {};
  };

  const getUserById = (userId) => {
    return users.find(u => u.id === userId) || {};
  };

  const handleApproveRequest = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      const request = editRequests.find(r => r.id === requestId);
      if (!request) return;

      const vehicle = getVehicleById(request.vehicle_id);
      const requester = getUserById(request.requested_by_user_id);

      // Apply the requested changes to the vehicle
      await Vehicle.update(request.vehicle_id, request.requested_changes);

      // Update the edit request status
      const currentUser = await User.me();
      await VehicleEditRequest.update(requestId, {
        status: 'approved',
        admin_notes: adminNotes,
        processed_by_admin: currentUser.email,
        processed_at: new Date().toISOString()
      });

      // Notify the vehicle owner
      await Notification.create({
        recipient_id: request.requested_by_user_id,
        sender_id: currentUser.id,
        type: "vehicle_edit_approved",
        content: `Your edit request for "${vehicle.title}" has been approved and applied to the listing.`,
        related_entity_id: request.vehicle_id,
        url: createPageUrl(`Vehicle?id=${request.vehicle_id}`),
        icon: "CheckCircle"
      });

      setAdminNotes('');
      loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to approve edit request:", error);
      alert("Failed to approve edit request. Please try again.");
    }
    setProcessingRequest(null);
  };

  const handleDeclineRequest = async (requestId) => {
    if (!adminNotes.trim()) {
      alert("Please provide a reason for declining this request.");
      return;
    }

    setProcessingRequest(requestId);
    try {
      const request = editRequests.find(r => r.id === requestId);
      if (!request) return;

      const vehicle = getVehicleById(request.vehicle_id);
      const requester = getUserById(request.requested_by_user_id);

      // Update the edit request status
      const currentUser = await User.me();
      await VehicleEditRequest.update(requestId, {
        status: 'declined',
        admin_notes: adminNotes,
        processed_by_admin: currentUser.email,
        processed_at: new Date().toISOString()
      });

      // Notify the vehicle owner
      await Notification.create({
        recipient_id: request.requested_by_user_id,
        sender_id: currentUser.id,
        type: "vehicle_edit_declined",
        content: `Your edit request for "${vehicle.title}" has been declined. Reason: ${adminNotes}`,
        related_entity_id: request.vehicle_id,
        url: createPageUrl(`Dashboard?tab=listings`),
        icon: "XCircle"
      });

      setAdminNotes('');
      loadData(); // Refresh data
    } catch (error) {
      console.error("Failed to decline edit request:", error);
      alert("Failed to decline edit request. Please try again.");
    }
    setProcessingRequest(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading edit requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vehicle Edit Requests</h2>
          <p className="text-slate-600">Review and manage edit requests for Speedio-managed vehicles</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {editRequests.filter(r => r.status === 'pending').length} Pending
        </Badge>
      </div>

      {editRequests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Edit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Edit Requests</h3>
            <p className="text-slate-500">Vehicle owners haven't submitted any edit requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {editRequests.map(request => {
            const vehicle = getVehicleById(request.vehicle_id);
            const requester = getUserById(request.requested_by_user_id);
            
            return (
              <Card key={request.id} className={`${
                request.status === 'pending' ? 'border-amber-200 bg-amber-50/20' : 'bg-white'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{vehicle.title}</CardTitle>
                        <p className="text-sm text-slate-600">
                          Requested by {requester.full_name} • {format(new Date(request.created_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Reason */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-2">Reason for Edit</h4>
                    <p className="text-sm text-slate-700">{request.reason}</p>
                  </div>

                  {/* Requested Changes */}
                  <div>
                    <h4 className="font-medium text-slate-800 mb-3">Requested Changes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(request.requested_changes).map(([field, newValue]) => {
                        const currentValue = vehicle[field];
                        return (
                          <div key={field} className="border border-slate-200 rounded-lg p-3">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                              {field.replace('_', ' ')}
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-xs text-red-600 font-medium">Current:</span>
                                <p className="text-sm">
                                  {field === 'price' ? `$${currentValue?.toLocaleString()}` : currentValue || 'Not set'}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-green-600 font-medium">Requested:</span>
                                <p className="text-sm font-medium">
                                  {field === 'price' ? `$${newValue?.toLocaleString()}` : newValue || 'Not set'}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {request.status !== 'pending' && request.admin_notes && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Admin Notes</h4>
                      <p className="text-sm text-blue-700">{request.admin_notes}</p>
                      <p className="text-xs text-blue-600 mt-2">
                        Processed by {request.processed_by_admin} on {format(new Date(request.processed_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  )}

                  {/* Actions for Pending Requests */}
                  {request.status === 'pending' && (
                    <div className="border-t border-slate-200 pt-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-slate-700 mb-2 block">
                            Admin Notes (will be shared with the vehicle owner)
                          </label>
                          <Textarea
                            value={processingRequest === request.id ? adminNotes : ''}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Add notes about your decision..."
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                            disabled={processingRequest === request.id}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline Request
                          </Button>
                          <Button
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={processingRequest === request.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Apply Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
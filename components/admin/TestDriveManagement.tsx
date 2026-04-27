"use client"
import React, { useState, useEffect } from "react";
import { Message, Vehicle, PublicUser as User } from "@/entities/all"; // Use PublicUser and alias it
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar,
  Clock,
  User as UserIcon,
  Car,
  Search,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

import TestDriveActivityModal from "../dashboard/TestDriveActivityModal";
import TestDriveReportModal from "./TestDriveReportModal";

export default function TestDriveManagement({ currentUser }) {
  const [testDrives, setTestDrives] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]); // This will now hold PublicUser data
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal state - keep these separate to avoid conflicts
  const [selectedTestDrive, setSelectedTestDrive] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    loadTestDriveData();
  }, []);

  const loadTestDriveData = async () => {
    setIsLoading(true);
    try {
      const [testDriveMessages, allVehicles, allUsers] = await Promise.all([
        Message.filter({ message_type: "test_drive_request" }, "-created_date", 100),
        Vehicle.list("-created_date", 200),
        User.list("-created_date", 200) // Now fetches from PublicUser
      ]);

      // No longer need to filter in JS, the DB query does the work
      setTestDrives(testDriveMessages);
      setVehicles(allVehicles);
      setUsers(allUsers);
    } catch (error) {
      console.error("Failed to load test drive data:", error);
    }
    setIsLoading(false);
  };

  const getVehicleById = (vehicleId) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId) || {};
  };

  const getUserById = (userId) => {
    // This function now correctly finds a user from the PublicUser list by their user_id
    return users.find(user => user.user_id === userId) || {};
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { icon: <Clock className="w-3 h-3" />, color: 'bg-amber-100 text-amber-800', text: 'Pending' };
      case 'approved':
        return { icon: <CheckCircle className="w-3 h-3" />, color: 'bg-blue-100 text-blue-800', text: 'Approved' };
      case 'completed':
        return { icon: <CheckCircle className="w-3 h-3" />, color: 'bg-green-100 text-green-800', text: 'Completed' };
      case 'declined':
        return { icon: <XCircle className="w-3 h-3" />, color: 'bg-red-100 text-red-800', text: 'Declined' };
      case 'no_show':
        return { icon: <AlertCircle className="w-3 h-3" />, color: 'bg-orange-100 text-orange-800', text: 'No Show' };
      default:
        return { icon: <Clock className="w-3 h-3" />, color: 'bg-slate-100 text-slate-800', text: status || 'Unknown' };
    }
  };

  const getActiveTestDrivesCount = () => {
    const activeStatuses = ['pending', 'approved']; 
    return testDrives.filter(request => 
      request.test_drive_details && activeStatuses.includes(request.test_drive_details.status)
    ).length;
  };

  const filteredTestDrives = testDrives.filter(testDrive => {
    const vehicle = getVehicleById(testDrive.vehicle_id);
    const buyer = getUserById(testDrive.sender_id);
    const seller = getUserById(testDrive.recipient_id);

    const matchesSearch = !searchTerm || 
      vehicle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      seller.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (testDrive.test_drive_details?.status || 'pending') === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Fixed handlers with proper state management
  const handleViewDetails = (testDrive) => {
    console.log("Opening view details for:", testDrive.id);
    setSelectedTestDrive(testDrive);
    setShowActivityModal(true);
    setShowReportModal(false); // Ensure other modal is closed
  };

  const handleEditReport = (testDrive) => {
    console.log("Opening edit report for:", testDrive.id);
    setSelectedTestDrive(testDrive);
    setShowReportModal(true);
    setShowActivityModal(false); // Ensure other modal is closed
  };

  const handleCloseActivityModal = () => {
    console.log("Closing activity modal");
    setShowActivityModal(false);
    setSelectedTestDrive(null);
  };

  const handleCloseReportModal = () => {
    console.log("Closing report modal");
    setShowReportModal(false);
    setSelectedTestDrive(null);
  };

  const handleReportSubmitted = async () => {
    console.log("Report submitted, reloading data");
    await loadTestDriveData();
    handleCloseReportModal();
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            Test Drive Management
            <Badge variant="outline" className="ml-2">
              {getActiveTestDrivesCount()} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by vehicle, buyer, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Test Drive List */}
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTestDrives.map(testDrive => {
                const vehicle = getVehicleById(testDrive.vehicle_id);
                const buyer = getUserById(testDrive.sender_id);
                const seller = getUserById(testDrive.recipient_id);
                const statusInfo = getStatusInfo(testDrive.test_drive_details?.status);

                return (
                  <div key={testDrive.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 items-center">
                        {/* Vehicle Thumbnail */}
                        <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {vehicle.primary_image ? (
                            <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                          ) : (
                            <Car className="w-6 h-6 text-slate-400" />
                          )}
                        </div>

                        {/* Test Drive Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-800">{vehicle.title}</h3>
                            <Badge className={statusInfo.color}>
                              {statusInfo.icon}
                              <span className="ml-1">{statusInfo.text}</span>
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              Buyer: {buyer.full_name || 'Unknown'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {testDrive.test_drive_details?.preferred_date 
                                ? format(new Date(testDrive.test_drive_details.preferred_date), 'MMM d, yyyy')
                                : 'Date not set'
                              }
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {testDrive.test_drive_details?.preferred_time || 'Time not set'}
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            Requested {format(new Date(testDrive.created_date), 'MMM d, yyyy')} • 
                            Seller: {seller.full_name || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(testDrive)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View / Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReport(testDrive)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {testDrive.test_drive_details?.status === 'completed' ? 'Edit Report' : 'Add Report'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredTestDrives.length === 0 && !isLoading && (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No test drives found</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      {showActivityModal && selectedTestDrive && (
        <TestDriveActivityModal
          testDriveRequest={selectedTestDrive}
          buyer={getUserById(selectedTestDrive.sender_id)}
          vehicle={getVehicleById(selectedTestDrive.vehicle_id)}
          isOpen={showActivityModal}
          onClose={handleCloseActivityModal}
          onUpdate={loadTestDriveData}
          currentUser={currentUser}
        />
      )}

      {/* Edit Report Modal */}
      {showReportModal && selectedTestDrive && (
        <TestDriveReportModal
          testDriveMessage={selectedTestDrive}
          buyer={getUserById(selectedTestDrive.sender_id)}
          vehicle={getVehicleById(selectedTestDrive.vehicle_id)}
          isOpen={showReportModal}
          onClose={handleCloseReportModal}
          onReportSubmitted={handleReportSubmitted}
          currentUser={currentUser}
        />
      )}
    </>
  );
}

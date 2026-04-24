
"use client"

import React, { useState, useEffect } from "react";
import { User, Vehicle, Message, ManagedSaleRequest, VehicleEditRequest } from "@/entities/all"; // Add new entities
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  LogIn,
  Loader2 // Add Loader2
} from "lucide-react";

import GuestDashboard from "../../components/dashboard/GuestDashboard";
import SellerDashboard from "../../components/dashboard/SellerDashboard";

// Helper function to create page URLs
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Contact":
      return "/contact"; // Or whatever your contact page URL is
    // Add other cases for different page names if needed
    default:
      return "/";
  }
};

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]); // New state
  const [managedSales, setManagedSales] = useState([]); // New state
  const [testDrives, setTestDrives] = useState([]); // New state
  const [editRequests, setEditRequests] = useState([]); // New state

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = await User.me();
        setCurrentUser(user);

        // Fetch user's data relevant to their role
        const userType = user.user_type || 'guest';
        
        if (userType === 'private_seller' || userType === 'dealership') {
          // Fetch user's vehicles
          const vehiclesData = await Vehicle.filter({ created_by: user.email }, '-created_date');
          setVehicles(vehiclesData);

          // Fetch managed sales requests
          const managedSalesData = await ManagedSaleRequest.filter(
            { submitted_by_user_id: user.id },
            '-created_date'
          );
          setManagedSales(managedSalesData);

          // Fetch test drive requests (both sent and received)
          const receivedTestDrives = await Message.filter({
            message_type: 'test_drive_request',
            recipient_id: user.id
          }, '-created_date');
          const sentTestDrives = await Message.filter({
            message_type: 'test_drive_request',
            sender_id: user.id
          }, '-created_date');
          const allTestDrives = [...receivedTestDrives, ...sentTestDrives];
          // Deduplicate if a message could appear in both lists
          const uniqueTestDrives = Array.from(new Map(allTestDrives.map(item => [item.id, item])).values());
          setTestDrives(uniqueTestDrives);

          // Fetch vehicle edit requests
          const editRequestsData = await VehicleEditRequest.filter({
            requested_by_user_id: user.id
          }, '-created_date');
          setEditRequests(editRequestsData);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setCurrentUser(null); // Ensure user is null if fetching fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array, runs once on mount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Welcome to Your Dashboard</h1>
            <p className="text-slate-600 mb-6">Please log in to access your personalized dashboard and manage your vehicle activities.</p>
            <Button
              onClick={() => window.location.href = "https://speedio.app/login"}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
              <LogIn className="w-5 h-5 mr-2" />
              Login / Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userType = currentUser.user_type || 'guest';

  // Render appropriate dashboard based on user type
  if (userType === 'guest') {
    return <GuestDashboard user={currentUser} />;
  }

  if (userType === 'private_seller' || userType === 'dealership') {
    return (
      <SellerDashboard
        user={currentUser}
      />
    );
  }

  // Fallback for unknown user types (e.g., 'admin' or other roles not specifically handled)
  // These users will see the Guest Dashboard.
  return <GuestDashboard user={currentUser} />;
}

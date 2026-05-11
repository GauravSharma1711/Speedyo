"use client"

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

import GuestDashboard from "../../components/dashboard/GuestDashboard";
import SellerDashboard from "../../components/dashboard/SellerDashboard";
import { useRouter } from "next/navigation";
import { profileService, ProfileUser } from "@/services/profile/profileServices";


 
type AnyRecord = Record<string, any>;


 
const Vehicle = {
  filter: async (_filters: AnyRecord, _sort?: string): Promise<AnyRecord[]> => [],
};
 
const ManagedSaleRequest = {
  filter: async (_filters: AnyRecord, _sort?: string): Promise<AnyRecord[]> => [],
};
 
const Message = {
  filter: async (_filters: AnyRecord, _sort?: string): Promise<AnyRecord[]> => [],
};
 
const VehicleEditRequest = {
  filter: async (_filters: AnyRecord, _sort?: string): Promise<AnyRecord[]> => [],
};

export default function Dashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<AnyRecord[]>([]);
  const [managedSales, setManagedSales] = useState<AnyRecord[]>([]);
  const [testDrives, setTestDrives] = useState<AnyRecord[]>([]);
  const [editRequests, setEditRequests] = useState<AnyRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
         const user = await profileService.me();
        setCurrentUser(user);
        const userType = user.user_type || 'guest';
        
        if (userType === 'private_seller' || userType === 'dealership') {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Welcome to Your Dashboard</h1>
            <p className="text-slate-600 mb-6">Please log in to access your personalized dashboard and manage your vehicle activities.</p>
            <Button
              onClick={() => router.push("/signIn")}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
              Login / Register
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userType = user.user_type || 'guest';
  const passUser = {
    ...user,
    email: user.email ?? "",
  };

  if (userType === 'guest') {
    return <GuestDashboard user={passUser as any} />;
  }

  if (userType === 'private_seller' || userType === 'dealership') {
    return <SellerDashboard />;
  }

  return <GuestDashboard user={passUser as any} />;
}

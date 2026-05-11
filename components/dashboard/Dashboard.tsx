"use client"

import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";

import GuestDashboard from "../../components/dashboard/GuestDashboard";
import SellerDashboard from "../../components/dashboard/SellerDashboard";
import { useRouter } from "next/navigation";
import { useDashboardStore } from "@/store/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, loadDashboard } = useDashboardStore();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

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

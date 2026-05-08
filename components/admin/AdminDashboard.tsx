"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowRightLeft,
  CalendarCheck,
  Car,
  ClipboardCheck,
  Edit,
  FileText,
  Handshake,
  LifeBuoy,
  Loader2,
  LogIn,
  Menu,
  MessageSquare,
  RefreshCw,
  Shield,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet";

import Footer from "@/components/layout/Footer";
import ManagedSalesAdminUI from "@/components/admin/ManagedSalesAdmin";
import TransferStatusManagerUI from "@/components/admin/TransferStatusManager";
import TestDriveManagementUI from "@/components/admin/TestDriveManagement";
import DealershipAgreementManagerUI from "./DealershipAgreementManager";
import LiaisonAgreementManagerUI from "./LiaisonAgreementManager";
import PhotographerAgreementManagerUI from "./PhotographerAgreementManager";
import UserManagementUI from "./UserManagement";
import ListingManagementUI from "./ListingManagement";
import VehicleEditRequestManagementUI from "./VehicleEditRequestManagement";
import SupportTicketManagementUI from "./SupportTicketManagement";
import FeedbackManagementUI from "./FeedbackManagement";
import VehicleInspectionChecklistModalUI from "./VehicleInspectionChecklistModal";
import InspectionChecklistManagementUI from "./InspectionChecklistManagement";
import OISTTradeInRequestManagementUI from "./OISTTradeInRequestManagement";

type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  role: "admin" | "user";
};

const NAV = [
  { key: "managed_sales", label: "Managed Sales", icon: Handshake },
  { key: "transfers", label: "Transfers", icon: ArrowRightLeft },
  { key: "test_drives", label: "Test Drives", icon: CalendarCheck },
  { key: "agreements", label: "Dealership", icon: FileText },
  { key: "liaison_agreements", label: "Liaison", icon: FileText },
  { key: "photographer_agreements", label: "Photographer", icon: FileText },
  { key: "users", label: "Users", icon: Users },
  { key: "listings", label: "Listings", icon: Car },
  { key: "edit_requests", label: "Edit Requests", icon: Edit },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "feedback", label: "Feedback", icon: MessageSquare },
  { key: "checklists", label: "Checklists", icon: ClipboardCheck },
  { key: "oist-trade-in", label: "OIST Trade-In", icon: RefreshCw },
] as const;

function SectionPlaceholder(props: { title: string; description?: string }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow">
      <CardContent className="p-6">
        <div className="text-lg font-semibold text-slate-800">{props.title}</div>
        <div className="mt-2 text-sm text-slate-600">
          {props.description ??
            ""}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  const currentUser: AdminUser | null = session?.user?.id
    ? {
        id: session.user.id,
        full_name: session.user.full_name ?? session.user.email ?? "Admin",
        email: session.user.email ?? "",
        role: (session.user.role as AdminUser["role"]) ?? "user",
      }
    : null;

  const isAdmin = currentUser?.role === "admin";

  const [activeTab, setActiveTab] =
    useState<(typeof NAV)[number]["key"]>("managed_sales");
  const [editVehicleId, setEditVehicleId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    const editVehicleParam = urlParams.get("editVehicleId");

    if (tabParam && NAV.some((n) => n.key === tabParam)) {
      setActiveTab(tabParam as (typeof NAV)[number]["key"]);
    }
    if (editVehicleParam) {
      setEditVehicleId(editVehicleParam);
      setActiveTab("listings");
    }
  }, []);

  const handleAdminLogin = () => {
    window.location.href = "/signIn";
  };

  const navList = useMemo(() => {
    return (
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(val as (typeof NAV)[number]["key"])
        }
        orientation="vertical"
        className="w-full"
      >
        <TabsList className="flex flex-col w-full h-auto space-y-1 bg-transparent">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger
                key={item.key}
                value={item.key}
                className="w-full justify-start py-3 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{item.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    );
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-600 mb-6">
              You do not have permission to view this page.
            </p>
            <Button onClick={handleAdminLogin} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              Login as Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-800">
                Admin Dashboard
              </h1>
              <p className="text-slate-600">
                Welcome, {currentUser?.full_name ?? "Admin"}. Manage all aspects of Speedyo
                from here.
              </p>
            </div>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto">
                <SheetHeader className="sr-only">
                  <SheetTitle>Admin Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <Tabs
                    value={activeTab}
                    onValueChange={(val) => {
                      setActiveTab(val as (typeof NAV)[number]["key"]);
                      setMobileMenuOpen(false);
                    }}
                    orientation="vertical"
                    className="w-full"
                  >
                    <TabsList className="flex flex-col w-full h-auto space-y-1 bg-transparent">
                      {NAV.map((item) => {
                        const Icon = item.icon;
                        return (
                          <TabsTrigger
                            key={item.key}
                            value={item.key}
                            className="w-full justify-start py-3 px-4 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-900"
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            <span>{item.label}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="hidden lg:block lg:w-64 flex-shrink-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4">{navList}</CardContent>
            </Card>

            <div className="flex-1">
              <Tabs
                value={activeTab}
                onValueChange={(val) =>
                  setActiveTab(val as (typeof NAV)[number]["key"])
                }
                className="w-full"
              >
                <TabsContent value="managed_sales">
                  <ManagedSalesAdminUI />
                </TabsContent>
                <TabsContent value="transfers">
                  <TransferStatusManagerUI />
                </TabsContent>
                <TabsContent value="test_drives">
                  <TestDriveManagementUI/>
                </TabsContent>
                <TabsContent value="agreements">
                 <DealershipAgreementManagerUI/>
                </TabsContent>
                <TabsContent value="liaison_agreements">
                 <LiaisonAgreementManagerUI/>
                </TabsContent>
                <TabsContent value="photographer_agreements">
                 <PhotographerAgreementManagerUI/>
                </TabsContent>
                <TabsContent value="users">
                  <UserManagementUI/>
                </TabsContent>
                <TabsContent value="listings">
                 <ListingManagementUI/>
                </TabsContent>
                <TabsContent value="edit_requests">
                 <VehicleEditRequestManagementUI/>
                </TabsContent>
                <TabsContent value="support">
                  <SupportTicketManagementUI/>
                </TabsContent>
                <TabsContent value="feedback">
                  <FeedbackManagementUI/>
                </TabsContent>
                <TabsContent value="checklists">
                <InspectionChecklistManagementUI/>
                </TabsContent>
                <TabsContent value="oist-trade-in">
                 <OISTTradeInRequestManagementUI/>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


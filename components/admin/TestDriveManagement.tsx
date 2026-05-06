"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Search,
  User as UserIcon,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/TextArea";
import { toast } from "@/components/ui/UseToast";
import TestDriveActivityModalUI from "./TestDriveActivityModal";
import TestDriveReportModalUI from "./TestDriveReportModal";
import { useTestDriveStore } from "@/store/admin/testDrive";
import type { TestDrive } from "@/store/admin/testDrive";
type Status = "pending" | "approved" | "completed" | "declined" | "no_show";



type Vehicle = {
  id: string;
  title: string;
  primary_image?: string | null;
};

type PublicUser = {
  user_id: string;
  full_name: string;
};

const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "veh_1",
    title: "Toyota Aqua 2018",
    primary_image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=70",
  },
  { id: "veh_2", title: "Honda Fit 2016", primary_image: null },
];

const MOCK_USERS: PublicUser[] = [
  { user_id: "u_buyer_1", full_name: "Test Buyer" },
  { user_id: "u_seller_1", full_name: "Test Seller" },
  { user_id: "u_buyer_2", full_name: "Rockstar Ahuja" },
];

const MOCK_TEST_DRIVES: TestDrive[] = [
  {
    id: "td_1",
    vehicle_id: "veh_1",
    sender_id: "u_buyer_1",
    recipient_id: "u_seller_1",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    test_drive_details: {
      status: "pending",
      preferred_date: "2026-05-10",
      preferred_time: "14:00",
      notes: "Weekend preferred.",
    },
  },
  {
    id: "td_2",
    vehicle_id: "veh_2",
    sender_id: "u_buyer_2",
    recipient_id: "u_seller_1",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    test_drive_details: {
      status: "approved",
      preferred_date: "2026-05-12",
      preferred_time: "11:30",
    },
  },
  {
    id: "td_3",
    vehicle_id: "veh_1",
    sender_id: "u_buyer_2",
    recipient_id: "u_seller_1",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    test_drive_details: {
      status: "completed",
      preferred_date: "2026-04-20",
      preferred_time: "10:00",
      report: "Buyer liked the car. Follow-up pending.",
    },
  },
];

function fmtDate(input?: string) {
  if (!input) return "Date not set";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input; // for yyyy-mm-dd
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getStatusInfo(status?: Status) {
  switch (status) {
    case "pending":
      return { icon: <Clock className="w-3 h-3" />, color: "bg-amber-100 text-amber-800", text: "Pending" };
    case "approved":
      return { icon: <CheckCircle className="w-3 h-3" />, color: "bg-blue-100 text-blue-800", text: "Approved" };
    case "completed":
      return { icon: <CheckCircle className="w-3 h-3" />, color: "bg-green-100 text-green-800", text: "Completed" };
    case "declined":
      return { icon: <XCircle className="w-3 h-3" />, color: "bg-red-100 text-red-800", text: "Declined" };
    case "no_show":
      return { icon: <AlertCircle className="w-3 h-3" />, color: "bg-orange-100 text-orange-800", text: "No Show" };
    default:
      return { icon: <Clock className="w-3 h-3" />, color: "bg-slate-100 text-slate-800", text: "Unknown" };
  }
}

function getActiveCount(list: TestDrive[]) {
  return list.filter((t) => ["pending", "approved"].includes(t.test_drive_details?.status ?? "pending")).length;
}

export default function TestDriveManagementUI() {
  // const [testDrives, setTestDrives] = useState<TestDrive[]>(MOCK_TEST_DRIVES);
  // const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  // const [users] = useState<PublicUser[]>(MOCK_USERS);

  const { testDrives, isLoading, error, getAll, update, createReport, updateReport } = useTestDriveStore();

    useEffect(() => { getAll(); }, []);



  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");

  const [selected, setSelected] = useState<TestDrive | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [reportDraft, setReportDraft] = useState("");

  const getVehicleById = (vehicleId: string) =>
    vehicles.find((v) => v.id === vehicleId) ?? { id: vehicleId, title: "Unknown Vehicle" };

  const getUserById = (userId: string) =>
    users.find((u) => u.user_id === userId) ?? { user_id: userId, full_name: "Unknown" };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return testDrives.filter((t) => {
      const v = getVehicleById(t.vehicle_id);
      const buyer = getUserById(t.sender_id);
      const seller = getUserById(t.recipient_id);

      const matchesSearch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        buyer.full_name.toLowerCase().includes(q) ||
        seller.full_name.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" || (t.test_drive_details?.status ?? "pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, testDrives]);

  const openDetails = (t: TestDrive) => {
    setSelected(t);
    setShowDetails(true);
    setShowReport(false);
  };

  const openReport = (t: TestDrive) => {
    setSelected(t);
    setReportDraft(t.test_drive_details.report ?? "");
    setShowReport(true);
    setShowDetails(false);
  };

  const closeAll = () => {
    setShowDetails(false);
    setShowReport(false);
    setSelected(null);
    setReportDraft("");
  };

  const saveReport = () => {
    if (!selected) return;
    setTestDrives((prev) =>
      prev.map((t) =>
        t.id === selected.id
          ? {
            ...t,
            test_drive_details: {
              ...t.test_drive_details,
              report: reportDraft.trim(),
              status: t.test_drive_details.status === "pending" ? "approved" : t.test_drive_details.status,
            },
          }
          : t
      )
    );
    toast({ title: "Saved", description: "Report saved." });
    closeAll();
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Calendar className="w-5 h-5 text-purple-500" />
            Test Drive Management
            <Badge variant="outline" className="ml-2">
              {getActiveCount(testDrives)} Active
            </Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search by vehicle, buyer, or seller..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
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

          <div className="space-y-3">
            {filtered.map((t) => {
              const v = getVehicleById(t.vehicle_id);
              const buyer = getUserById(t.sender_id);
              const seller = getUserById(t.recipient_id);
              const statusInfo = getStatusInfo(t.test_drive_details?.status);

              return (
                <div key={t.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {v.primary_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.primary_image} alt={v.title} className="w-full h-full object-cover" />
                        ) : (
                          <Car className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-slate-800 truncate">{v.title}</h3>
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.text}</span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            Buyer: {buyer.full_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {fmtDate(t.test_drive_details?.preferred_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t.test_drive_details?.preferred_time || "Time not set"}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Requested {fmtDate(t.created_date)} • Seller: {seller.full_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => openDetails(t)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View / Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openReport(t)}>
                        <Edit className="w-4 h-4 mr-2" />
                        {t.test_drive_details?.status === "completed" ? "Edit Report" : "Add Report"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No test drives found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <TestDriveActivityModalUI
        isOpen={showDetails}
        onClose={closeAll}
        testDriveRequest={selected}
        buyer={selected ? { user_id: selected.sender_id, full_name: getUserById(selected.sender_id).full_name } : null}
        vehicle={selected ? { id: selected.vehicle_id, title: getVehicleById(selected.vehicle_id).title } : null}
        // onSave={(updated) => {
        //   setTestDrives((prev) => prev.map((t) => (t.id === updated.id ? (updated as any) : t)));
        //   toast({ title: "Saved", description: "Test drive updated." });
        // }
      onSave={async (updated) => {
  await update(updated.id, {
    status: updated.test_drive_details?.status,
    confirmed_date: updated.test_drive_details?.preferred_date,
    confirmed_time: updated.test_drive_details?.preferred_time,
    additional_notes: updated.test_drive_details?.notes,
  });
  await getAll();
  toast({ title: "Saved", description: "Test drive updated." });
}}
      
      />
      <TestDriveReportModalUI
        isOpen={showReport}
        onClose={closeAll}
        vehicleTitle={selected ? getVehicleById(selected.vehicle_id).title : undefined}
        buyerName={selected ? getUserById(selected.sender_id).full_name : undefined}
        preferred_date={selected?.test_drive_details?.preferred_date}
        preferred_time={selected?.test_drive_details?.preferred_time}
        initialValue={selected?.test_drive_details as any}
        onSave={(data) => {
          if (!selected) return;
          setTestDrives((prev) =>
            prev.map((t) =>
              t.id === selected.id
                ? {
                  ...t,
                  test_drive_details: {
                    ...t.test_drive_details,
                    ...data,
                    status: "completed",
                  },
                }
                : t,
            ),
          );
          toast({ title: "Saved", description: "Report saved." });  
        }}
      />
    </>
  );
}
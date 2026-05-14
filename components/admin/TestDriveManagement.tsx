"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle, Calendar, Car, CheckCircle,
  Clock, Edit, Eye, Loader2, Search, User as UserIcon, XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/Select";
import { toast } from "@/components/ui/UseToast";
import TestDriveActivityModalUI from "./TestDriveActivityModal";
import TestDriveReportModalUI from "./TestDriveReportModal";
import { useTestDriveStore } from "@/store/admin/testDrive";
import type { TestDrive } from "@/store/admin/testDrive";

type Status = "pending" | "approved" | "completed" | "declined" | "no_show";

function fmtDate(input?: string) {
  if (!input) return "Date not set";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getStatusInfo(status?: string) {
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

  return list.filter((t) => ["pending", "approved"].includes(t.status ?? "")).length;
}

export default function TestDriveManagementUI() {
  const { testDrives, isLoading, error, getAll, update, createReport, updateReport } =
    useTestDriveStore();

  useEffect(() => { getAll(); }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [selected, setSelected] = useState<TestDrive | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return testDrives.filter((t) => {
 
      const vehicleTitle = t.vehicle?.title ?? "";
      const buyerName = t.user?.full_name ?? t.requester_name ?? "";

      const matchesSearch =
        !q ||
        vehicleTitle.toLowerCase().includes(q) ||
        buyerName.toLowerCase().includes(q) ||
        t.requester_email?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, testDrives]);

  const openDetails = (t: TestDrive) => {
    setSelected(t);
    setShowDetails(true);
    setShowReport(false);
  };

  const openReport = (t: TestDrive) => {
    setSelected(t);
    setShowReport(true);
    setShowDetails(false);
  };

  const closeAll = () => {
    setShowDetails(false);
    setShowReport(false);
    setSelected(null);
  };

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <Calendar className="w-5 h-5 text-purple-500" />
            Car Viewing Management
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
                placeholder="Search by vehicle, buyer, or email..."
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

          {isLoading && (
             <div className="flex items-center justify-center py-16">
                 <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
               </div>
          )}

       {!isLoading && error && (
  <div className="text-center py-4 text-red-500 text-sm">{error}</div>
)}

       {!isLoading &&  <div className="space-y-3">
            {filtered.map((t) => {
           
              const vehicleTitle = t.vehicle?.title ?? "Unknown Vehicle";
              const vehicleImage = null; 
              const buyerName = t.user?.full_name ?? t.requester_name;
              const statusInfo = getStatusInfo(t.status);

              return (
                <div
                  key={t.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-4 items-center min-w-0">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <Car className="w-6 h-6 text-slate-400" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {vehicleTitle}
                          </h3>
                          <Badge className={statusInfo.color}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.text}</span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3" />
                            Buyer: {buyerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                         
                            {fmtDate(t.confirmed_date ?? t.requested_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {t.confirmed_time ?? t.requested_time ?? "Time not set"}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-1">
                          Requested {fmtDate(t.createdAt)}
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
                        {t.report ? "Edit Report" : "Add Report"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No car viewings found</p>
              </div>
            )}
          </div>}
        </CardContent>
      </Card>

      <TestDriveActivityModalUI
        isOpen={showDetails}
        onClose={closeAll}
        testDriveRequest={selected}
        buyer={
          selected
            ? {
                user_id: selected.user?.id ?? "",
                full_name: selected.user?.full_name ?? selected.requester_name,
              }
            : null
        }
        vehicle={
          selected
            ? { id: selected.vehicleId, title: selected.vehicle?.title ?? "Unknown Vehicle" }
            : null
        }
        onSave={async (updated) => {
          await update(updated.id!, {
            status: updated.status,
            confirmed_date: updated.confirmed_date,
            confirmed_time: updated.confirmed_time,
            admin_note: updated.admin_note,
              location: updated.location,  
          });
          await getAll();
          toast({ title: "Saved", description: "Car Viewing updated." });
          closeAll();
        }}
      />

      <TestDriveReportModalUI
        isOpen={showReport}
        onClose={closeAll}
        vehicleTitle={selected?.vehicle?.title}
        buyerName={selected?.user?.full_name ?? selected?.requester_name}
        preferred_date={selected?.confirmed_date ?? selected?.requested_date}
        preferred_time={selected?.confirmed_time ?? selected?.requested_time}
        initialValue={selected?.report ?? undefined}
    onSave={async (data) => {
  if (!selected) return;
  if (selected.report) {
    await updateReport(selected.id, data);   
  } else {
    await createReport(selected.id, data);   
  }
  await getAll();
  toast({ title: "Saved", description: "Report saved." });
  closeAll();
}}
      />
    </>
  );
}
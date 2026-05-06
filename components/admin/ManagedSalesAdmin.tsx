"use client";

import React, { useCallback, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  Clock,
  DollarSign,
  Edit,
  Eye,
  Handshake,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import ManagedSaleDetailsModal from "@/components/dashboard/ManagedSaleDetailsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/Collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

import { useToast } from "@/components/ui/UseToast";

import VehicleInspectionChecklistModalUI, {
  VehicleInspectionChecklistData,
} from "@/components/admin/VehicleInspectionChecklistModal";
import AdminAvailabilityManagerUI from "./AdminAvailabilityManager";
import ManagedSalesRequestFormUI from "@/components/manageSales/RequestForm";

type ManagedSaleStatus =
  | "pending_initial_review"
  | "pending_review"
  | "approved"
  | "declined"
  | "listed"
  | "sold"
  | "edit_requested"
  | "cancellation_requested"
  | "cancelled";

type UserRow = { id: string; full_name?: string | null; email: string };

type VehicleDetails = {
  title: string;
  make: string;
  model: string;
  year: number;
  seller_asking_price?: number | string | null;
  images_thumbnails?: string[];
};
type AccessArrangements = {
  vehicle_location_address?: string;
  vehicle_access_availability?: string;

  key_access_method?: string;
  key_pickup_location?: string;
  key_pickup_availability?: string;
  key_location_details?: string;

  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  power_of_attorney?: boolean;
  power_of_attorney_details?: string;

  special_instructions?: string;
  recurring_availability?: any[];
};

type ManagedSaleRequestRow = {
  id: string;
  created_date: string; // ISO
  status: ManagedSaleStatus;

  submitted_by_user_id: string;

  created_vehicle_id?: string | null;
  vehicle_details: VehicleDetails;
  access_arrangements?: AccessArrangements;


  final_sale_price_for_buyer?: number | string | null;
  owner_receives_amount?: number | string | null;
  service_fee_amount?: number | string | null;

  calculated_buyer_price?: number | string | null;
};

type ChecklistRow = VehicleInspectionChecklistData & {
  id: string;
  created_date: string; // ISO
  updated_date?: string | null;
};

const MOCK_USERS: UserRow[] = [
  { id: "u_1", full_name: "Tushar Bisht", email: "tushar@example.com" },
  { id: "u_2", full_name: "Kevin Phillips", email: "kevin@example.com" },
];

const MOCK_REQUESTS: ManagedSaleRequestRow[] = [
  {
    id: "msr_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "pending_review",
    submitted_by_user_id: "u_1",
    created_vehicle_id: null,
    vehicle_details: {
      title: "2011 Daihatsu Move",
      make: "Daihatsu",
      model: "Move",
      year: 2011,
      seller_asking_price: 1200,
      images_thumbnails: [],
    },
    access_arrangements: {
      vehicle_location_address: "Camp Hansen Okinawa",
      vehicle_access_availability: "Weekdays and weekends flexible.",
      key_access_method: "direct_handover",
      key_pickup_location: "Anywhere willing to meet",
      key_pickup_availability: "All days at any time, I’m flexible.",
      key_location_details: "",
      emergency_contact_name: "Will",
      emergency_contact_phone: "+14135056429",
      power_of_attorney: true,
      power_of_attorney_details: "Ready for pick up with keys",
      special_instructions: "Title still has until March 4th, but will have 120 day waiver.",
    },
  },
  {
    id: "msr_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    status: "listed",
    submitted_by_user_id: "u_2",
    created_vehicle_id: "veh_123",
    vehicle_details: {
      title: "2012 Suzuki Solio",
      make: "Suzuki",
      model: "Solio",
      year: 2012,
      seller_asking_price: 1500,
      images_thumbnails: [],
    },
    final_sale_price_for_buyer: 1800,
    owner_receives_amount: 1500,
    service_fee_amount: 300,
  },
];


const MOCK_CHECKLISTS: ChecklistRow[] = [
  {
    id: "chk_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updated_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),

    date_of_inspection: "2025-11-05",
    inspector_name: "Kevin Phillips",
    dealership_name: "Taka Cars",
    warranty: "",
    repair_service_details: "",

    managed_sale_request_id: "msr_002",

    vehicle_info: {
      make: "Daihatsu",
      model: "Move",
      year: 2011,
      vin: "L465S-0018288",
      mileage: 74000,
      license_plate: "",
      transmission: "automatic",
      fuel_type: "gasoline",
      drivetrain: "fwd",
    },

    exterior_condition: [],
    interior_condition: [],
    engine_mechanical: [],
    documentation: [],
    photos_media: [],

    overall_condition: "",
    recommended_sale_price: "",
    verified_by_speedio: "",
    dealership_representative: "",
    inspection_notes: "",
  },
];

function calculateServiceFeeAmount(price: number) {
  if (!price || price <= 0) return 0;
  if (price < 500) return 300;
  if (price <= 3000) return Math.round(300 + (price - 500) * 0.08);
  if (price <= 8333) return 500;
  return Math.round(price * 0.06);
}

function parseNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const n = typeof v === "string" ? Number(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}

function calculatePrices(request: ManagedSaleRequestRow) {
  const buyerPrice1 = parseNum(request.final_sale_price_for_buyer);
  const fee1 = parseNum(request.service_fee_amount);
  const seller1 = parseNum(request.owner_receives_amount);
  if (buyerPrice1 !== null && fee1 !== null && seller1 !== null) {
    return { buyerPrice: buyerPrice1, serviceFee: fee1, sellerReceives: seller1 };
  }

  const buyerLegacy = parseNum(request.calculated_buyer_price);
  const feeLegacy = parseNum(request.service_fee_amount);
  if (buyerLegacy !== null && feeLegacy !== null) {
    return {
      buyerPrice: buyerLegacy,
      serviceFee: feeLegacy,
      sellerReceives: buyerLegacy - feeLegacy,
    };
  }

  if (buyerLegacy !== null) {
    const fee = calculateServiceFeeAmount(buyerLegacy);
    return { buyerPrice: buyerLegacy, serviceFee: fee, sellerReceives: buyerLegacy - fee };
  }

  const sellerAsk = parseNum(request.vehicle_details?.seller_asking_price);
  if (sellerAsk !== null) {
    const fee = calculateServiceFeeAmount(sellerAsk);
    return { buyerPrice: sellerAsk + fee, serviceFee: fee, sellerReceives: sellerAsk };
  }

  return { buyerPrice: null, serviceFee: null, sellerReceives: null };
}

function getStatusBadge(status: ManagedSaleStatus) {
  const statusConfig: Record<
    ManagedSaleStatus,
    { color: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    pending_initial_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    pending_review: { color: "bg-amber-100 text-amber-800", icon: Clock },
    approved: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
    declined: { color: "bg-red-100 text-red-800", icon: XCircle },
    listed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    sold: { color: "bg-slate-100 text-slate-800", icon: DollarSign },
    edit_requested: { color: "bg-orange-100 text-orange-800", icon: Edit },
    cancellation_requested: { color: "bg-purple-100 text-purple-800", icon: XCircle },
    cancelled: { color: "bg-red-200 text-red-900", icon: XCircle },
  };

  const cfg = statusConfig[status];
  const Icon = cfg.icon;

  return (
    <Badge className={`${cfg.color} text-xs px-2 py-1`}>
      <Icon className="w-3 h-3 mr-1" />
      {status.replace(/_/g, " ").toUpperCase()}
    </Badge>
  );
}

export default function ManagedSalesAdminUI() {
  const { toast } = useToast();

  const [users] = useState<UserRow[]>(MOCK_USERS);
  const [requests, setRequests] = useState<ManagedSaleRequestRow[]>(MOCK_REQUESTS);

  const [activeTab, setActiveTab] = useState<"requests" | "checklists">("requests");
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showStats, setShowStats] = useState(false);

  const [isLoading] = useState(false);
  const [isLoadingChecklists] = useState(false);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityTarget, setAvailabilityTarget] = useState<ManagedSaleRequestRow | null>(null);
  const [availabilityDraft, setAvailabilityDraft] = useState<any[]>([]);

  const [checklistsList, setChecklistsList] = useState<ChecklistRow[]>(MOCK_CHECKLISTS);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistRow | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ManagedSaleRequestRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const [adminEditOpen, setAdminEditOpen] = useState(false);
  const [adminEditTarget, setAdminEditTarget] = useState<ManagedSaleRequestRow | null>(null);

  const [checklistMsrContext, setChecklistMsrContext] = useState<{
    id: string;
    vehicle_details?: {
      title?: string;
      dealership_name?: string;
      make?: string;
      model?: string;
      year?: number;
      mileage?: number;
      fuel_type?: "gasoline" | "diesel" | "hybrid" | "electric";
      seller_asking_price?: number | string;
    };
  } | null>(null);

  const openCreateChecklist = () => {
    setEditingChecklist(null);
    setChecklistMsrContext(null);
    setChecklistModalOpen(true);
  };

  const openEditChecklist = (row: ChecklistRow) => {
    setEditingChecklist(row);
    setChecklistModalOpen(true);
  };

  const handleChecklistSave = (data: VehicleInspectionChecklistData) => {
    if (editingChecklist) {
      setChecklistsList((prev) =>
        prev.map((c) =>
          c.id === editingChecklist.id
            ? { ...c, ...data, updated_date: new Date().toISOString() }
            : c,
        ),
      );
      toast({ title: "Checklist updated", description: "Saved to local state." });
      return;
    }

    const created: ChecklistRow = {
      id: `chk_${Math.random().toString(16).slice(2, 10)}`,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      ...data,
    };

    setChecklistsList((prev) => [created, ...prev]);
    toast({ title: "Checklist created", description: "Saved to local state." });
  };

  const getUserName = useCallback(
    (userId: string) => {
      const u = users.find((x) => x.id === userId);
      return u ? (u.full_name || u.email) : "Unknown User";
    },
    [users],
  );

  const filteredRequests = useMemo(() => {
    let list = [...requests];

    if (filter !== "all") {
      if (filter === "approved_and_listed") {
        list = list.filter((r) => r.status === "approved" || r.status === "listed");
      } else {
        list = list.filter((r) => r.status === filter);
      }
    }

    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const v = r.vehicle_details;
        return (
          (v?.title || "").toLowerCase().includes(q) ||
          (v?.make || "").toLowerCase().includes(q) ||
          (v?.model || "").toLowerCase().includes(q) ||
          getUserName(r.submitted_by_user_id).toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [requests, filter, searchTerm, getUserName]);

  const stats = useMemo(() => {
    const counts = requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    return {
      pending_initial: counts.pending_initial_review || 0,
      pending: counts.pending_review || 0,
      approved_and_listed: (counts.approved || 0) + (counts.listed || 0),
      declined: counts.declined || 0,
      sold: counts.sold || 0,
      edit_requested: counts.edit_requested || 0,
      cancellation_requested: counts.cancellation_requested || 0,
      cancelled: counts.cancelled || 0,
      total: requests.length,
    };
  }, [requests]);

  const getActiveRequestsCount = useCallback(() => {
    const activeStatuses: ManagedSaleStatus[] = [
      "pending_initial_review",
      "pending_review",
      "approved",
      "listed",
      "edit_requested",
      "cancellation_requested",
    ];
    return requests.filter((r) => activeStatuses.includes(r.status)).length;
  }, [requests]);

  const approveAndList = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const prices = calculatePrices(r);
        const buyer = prices.buyerPrice ?? 0;
        const fee = prices.serviceFee ?? 0;
        const seller = prices.sellerReceives ?? 0;

        return {
          ...r,
          status: "listed",
          created_vehicle_id: r.created_vehicle_id || `veh_${Math.random().toString(16).slice(2, 8)}`,
          final_sale_price_for_buyer: buyer,
          owner_receives_amount: seller,
          service_fee_amount: fee,
        };
      }),
    );

    toast({
      title: "Listed",
      description: "Vehicle listing created in UI state — API wiring pending.",
    });
  };

  const deleteRequest = (id: string) => {
    if (!window.confirm("Delete this managed sale request?")) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
    toast({ title: "Deleted", description: "Removed from local state." });
  };

  const markSold = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "sold" } : r)));
    toast({ title: "Marked Sold", description: "Updated local state." });
  };

  const viewDetails = (id: string) => {
    const req = requests.find((r) => r.id === id) ?? null;
    if (!req) return;
    setSelectedRequest(req);
    setAdminNotes("");
    setDetailsOpen(true);
  };

  const setAvailability = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setAvailabilityTarget(req);
    setAvailabilityDraft((req as any).access_arrangements?.recurring_availability ?? []);
    setAvailabilityOpen(true);
  };

  const inspectionChecklist = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setEditingChecklist(null);
    setChecklistMsrContext({
      id: req.id,
      vehicle_details: {
        title: req.vehicle_details.title,
        dealership_name: (req as any).dealership_name,
        make: req.vehicle_details.make,
        model: req.vehicle_details.model,
        year: req.vehicle_details.year,
        mileage: undefined,
        fuel_type: "gasoline",
        seller_asking_price: req.vehicle_details.seller_asking_price ?? undefined,
      },
    });
    setChecklistModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-emerald-500" />
            Managed Sales Requests
            <Badge variant="outline" className="ml-2">
              {getActiveRequestsCount()} Active
            </Badge>
          </CardTitle>
          <CardContent className="p-0 pt-2 text-sm text-slate-600">
            Review and process managed sales submissions from users.
          </CardContent>
        </CardHeader>
      </Card>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Button
          variant={activeTab === "requests" ? "default" : "outline"}
          onClick={() => setActiveTab("requests")}
          className="w-full sm:w-auto"
        >
          <Handshake className="w-4 h-4 mr-2 sm:inline hidden" />
          <span className="sm:hidden">Requests</span>
          <span className="hidden sm:inline">Managed Sales Requests</span>
        </Button>

        <Button
          variant={activeTab === "checklists" ? "default" : "outline"}
          onClick={() => setActiveTab("checklists")}
          className="w-full sm:w-auto"
        >
          <ClipboardCheck className="w-4 h-4 mr-2 sm:inline hidden" />
          <span className="sm:hidden">Checklists</span>
          <span className="hidden sm:inline">Vehicle Inspection Checklists</span>
        </Button>
      </div>

      {activeTab === "requests" ? (
        <>
          <Collapsible open={showStats} onOpenChange={setShowStats}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>Statistics Overview</span>
                      <Badge variant="outline" className="ml-2">
                        {stats.total} Total
                      </Badge>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition-transform ${showStats ? "rotate-180" : ""
                        }`}
                    />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-3">
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending_initial}</div>
                      <div className="text-xs text-slate-600">Needs Details</div>
                    </div>

                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                      <div className="text-xs text-slate-600">Pending Review</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">{stats.edit_requested}</div>
                      <div className="text-xs text-slate-600">Edit Requested</div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">{stats.cancellation_requested}</div>
                      <div className="text-xs text-slate-600">Cancel Requested</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{stats.cancelled}</div>
                      <div className="text-xs text-slate-600">Cancelled</div>
                    </div>

                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-600">{stats.approved_and_listed}</div>
                      <div className="text-xs text-slate-600">Active Listings</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
                      <div className="text-xs text-slate-600">Sold</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 border border-red-300">
                      <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
                      <div className="text-xs text-slate-600">Declined</div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-2xl font-bold text-slate-600">{stats.total}</div>
                      <div className="text-xs text-slate-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                All Requests

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Input
                    placeholder="Search by title, make, model, owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs"
                  />

                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending_initial_review">Needs Details</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="edit_requested">Pending Edit Review</SelectItem>
                      <SelectItem value="cancellation_requested">Pending Cancellation</SelectItem>
                      <SelectItem value="approved_and_listed">Approved & Listed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Price (Seller/Buyer)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                          <p className="text-slate-500 mt-2">Loading requests...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          No requests found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => {
                        const prices = calculatePrices(request);
                        const thumb = request.vehicle_details?.images_thumbnails?.[0];

                        return (
                          <TableRow key={request.id} className="hover:bg-slate-50/50">
                            <TableCell>
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                                {thumb ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={thumb}
                                    alt={request.vehicle_details.title || "Vehicle"}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="font-medium text-slate-900">
                              {request.vehicle_details?.title || "N/A"}
                              <div className="text-xs text-slate-500">
                                {request.created_vehicle_id
                                  ? `ID: ${request.created_vehicle_id}`
                                  : "No vehicle created yet"}
                              </div>
                            </TableCell>

                            <TableCell className="text-sm">
                              {getUserName(request.submitted_by_user_id)}
                            </TableCell>

                            <TableCell className="text-sm">
                              {format(new Date(request.created_date), "MMM d, yyyy")}
                            </TableCell>

                            <TableCell className="text-sm">
                              <div className="text-slate-700">
                                Seller Receives:{" "}
                                {prices.sellerReceives !== null
                                  ? `$${prices.sellerReceives.toLocaleString()}`
                                  : "N/A"}
                              </div>
                              <div className="font-semibold text-blue-700">
                                Buyer Pays:{" "}
                                {prices.buyerPrice !== null
                                  ? `$${prices.buyerPrice.toLocaleString()}`
                                  : "N/A"}
                              </div>
                              <div className="text-xs text-slate-500">
                                Service Fee:{" "}
                                {prices.serviceFee !== null
                                  ? `$${prices.serviceFee.toLocaleString()}`
                                  : "N/A"}
                              </div>
                            </TableCell>

                            <TableCell>{getStatusBadge(request.status)}</TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                                  <DropdownMenuItem onClick={() => viewDetails(request.id)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>

                                  {request.status === "pending_review" ? (
                                    <DropdownMenuItem onClick={() => approveAndList(request.id)}>
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      Approve & List
                                    </DropdownMenuItem>
                                  ) : null}

                                  {request.status === "approved" || request.status === "listed" ? (
                                    <>
                                      <DropdownMenuItem onClick={() => markSold(request.id)}>
                                        <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                        Mark as Sold
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setAvailability(request.id)}>
                                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                        Set Availability
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => inspectionChecklist(request.id)}>
                                        <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                                        Inspection Checklist
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setAdminEditTarget(request);
                                          setAdminEditOpen(true);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                        Admin Edit
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}

                                  <DropdownMenuSeparator />

                                  <DropdownMenuItem
                                    className="text-red-500"
                                    onClick={() => deleteRequest(request.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Request
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="md:hidden p-4 space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                    <p className="text-slate-500 mt-2">Loading requests...</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No requests found matching your criteria.
                  </div>
                ) : (
                  filteredRequests.map((request) => {
                    const prices = calculatePrices(request);
                    const thumb = request.vehicle_details?.images_thumbnails?.[0];

                    return (
                      <Card key={request.id} className="bg-white shadow-md">
                        <CardContent className="p-4">
                          <div className="flex gap-3 mb-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {thumb ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={thumb}
                                  alt={request.vehicle_details.title || "Vehicle"}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-slate-400" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">
                                {request.vehicle_details?.title || "N/A"}
                              </h3>
                              <p className="text-xs text-slate-500 mb-1">
                                {getUserName(request.submitted_by_user_id)}
                              </p>
                              {getStatusBadge(request.status)}
                            </div>
                          </div>

                          <div className="space-y-2 text-sm border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Submitted:</span>
                              <span className="font-medium">
                                {format(new Date(request.created_date), "MMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Seller Receives:</span>
                              <span className="font-medium text-slate-700">
                                {prices.sellerReceives !== null
                                  ? `$${prices.sellerReceives.toLocaleString()}`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Buyer Pays:</span>
                              <span className="font-semibold text-blue-700">
                                {prices.buyerPrice !== null
                                  ? `$${prices.buyerPrice.toLocaleString()}`
                                  : "N/A"}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => viewDetails(request.id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>

                            {request.status === "pending_review" ? (
                              <Button
                                size="sm"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => approveAndList(request.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            ) : null}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>More Actions</DropdownMenuLabel>

                                {request.status === "approved" || request.status === "listed" ? (
                                  <>
                                    <DropdownMenuItem onClick={() => markSold(request.id)}>
                                      <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                      Mark as Sold
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAvailability(request.id)}>
                                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                      Set Availability
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => inspectionChecklist(request.id)}>
                                      <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                                      Inspection Checklist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setAdminEditTarget(request);
                                        setAdminEditOpen(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                      Admin Edit
                                    </DropdownMenuItem>
                                  </>
                                ) : null}

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => deleteRequest(request.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Request
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Vehicle Inspection Checklists</CardTitle>
            <Button onClick={openCreateChecklist}>Create New Checklist</Button>
          </CardHeader>

          <CardContent>
            {isLoadingChecklists ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                <p className="text-slate-500 mt-2">Loading checklists...</p>
              </div>
            ) : checklistsList.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                No vehicle inspection checklists found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Linked MSR</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {checklistsList.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell>
                        <div className="font-medium">
                          {checklist.vehicle_info?.year || "—"}{" "}
                          {checklist.vehicle_info?.make || "—"}{" "}
                          {checklist.vehicle_info?.model || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          VIN: {checklist.vehicle_info?.vin || "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        {checklist.managed_sale_request_id
                          ? requests.find((r) => r.id === checklist.managed_sale_request_id)
                            ?.vehicle_details?.title ||
                          `MSR ID: ${checklist.managed_sale_request_id.substring(0, 8)}`
                          : "N/A"}
                      </TableCell>

                      <TableCell>
                        {format(
                          new Date(checklist.updated_date || checklist.created_date),
                          "MMM d, yyyy",
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditChecklist(checklist)}>
                          <Eye className="w-4 h-4 mr-2" /> View/Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <VehicleInspectionChecklistModalUI
        isOpen={checklistModalOpen}
        onClose={() => {
          setChecklistModalOpen(false);
          setChecklistMsrContext(null);
        }}
        managedSaleRequest={checklistMsrContext}
        existingChecklist={editingChecklist}
        onSave={handleChecklistSave}
      />

      <AdminAvailabilityManagerUI
        isOpen={availabilityOpen}
        onClose={() => setAvailabilityOpen(false)}
        title={availabilityTarget?.vehicle_details?.title}
        initialAvailability={availabilityDraft}
        onSave={(newAvailability) => {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === availabilityTarget?.id
                ? {
                  ...r,
                  access_arrangements: {
                    ...(r as any).access_arrangements,
                    recurring_availability: newAvailability,
                  },
                }
                : r,
            ),
          );
          toast({ title: "Availability updated", description: "" });
          setAvailabilityOpen(false);
        }}
      />

      <ManagedSaleDetailsModal
        isOpen={detailsOpen}
        request={selectedRequest ?? null}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedRequest(null);
          setAdminNotes("");
        }}
        users={users}
        currentUser={{ role: "admin", email: "admin@local.dev" }}
        isLoading={isProcessing}
        adminNotes={adminNotes}
        setAdminNotes={setAdminNotes}
        loadRequests={() => { }}
        onEdit={(request: any) => {
          setAdminEditTarget(request);
          setAdminEditOpen(true);
        }}
        onCancel={() => toast({ title: "", description: "Cancel wiring pending." })}
        onStatusChange={(requestId: string, newStatus: any) => {
          setIsProcessing(true);
          try {
            setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)));
            toast({ title: "Status updated", description: "" });
          } finally {
            setIsProcessing(false);
          }
        }}
        onApproveEditRequest={() => toast({ title: "" })}
        onDeclineEditRequest={() => toast({ title: "" })}
        onApproveCancellation={() => toast({ title: "" })}
        onDeclineCancellation={() => toast({ title: "" })}
        onMarkAsSold={(req: any) => {
          if (!req?.id) return;
          setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "sold" } : r)));
          toast({ title: "Marked sold", description: "" });
        }}
      />

      {adminEditTarget ? (
        <ManagedSalesRequestFormUI
          isOpen={adminEditOpen}
          requestToEdit={{
            id: adminEditTarget.id,
            submitted_by_user_id: adminEditTarget.submitted_by_user_id,
            requester_contact_info: (adminEditTarget as any).requester_contact_info,
            vehicle_details: adminEditTarget.vehicle_details as any,
            access_arrangements: adminEditTarget.access_arrangements as any,
            terms_agreed: (adminEditTarget as any).terms_agreed,
          }}
          onClose={() => {
            setAdminEditOpen(false);
            setAdminEditTarget(null);
          }}
          onSave={(payload) => {
            setRequests((prev) =>
              prev.map((r) =>
                r.id === adminEditTarget.id
                  ? {
                    ...r,
                    vehicle_details: { ...r.vehicle_details, ...payload.vehicle_details },
                    access_arrangements: payload.access_arrangements,
                    service_fee_amount: payload.service_fee_amount,
                    final_sale_price_for_buyer: payload.final_sale_price_for_buyer,
                    owner_receives_amount: payload.owner_receives_amount,
                    status: (payload.status as any) ?? r.status,
                  }
                  : r,
              ),
            );
            toast({ title: "Saved", description: "Admin edit saved to local state." });
          }}
        />
      ) : null}
    </div>
  );
}
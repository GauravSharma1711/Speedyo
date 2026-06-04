"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  ChevronDown,
  ClipboardCheck,
  Clock,
  JapaneseYen ,
  Edit,
  Eye,
  Handshake,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Trash2,
  XCircle,
  JapaneseYenIcon
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
import type { ManagedSaleRequestUpdatePayload } from "@/components/manageSales/RequestForm";
import type { ManagedSaleRequestEditTarget } from "@/components/manageSales/RequestForm";
import { useManagedSaleRequestsStore } from "@/store/admin/managedSaleRequests";
import type { AvailabilitySlot } from "./AdminAvailabilityManager";
import { useInspectionChecklistStore } from "@/store/admin/inspectionChecklist";
import type { CreateChecklistBody } from "@/services/admin/inspectionChecklistService";
import DirectListingApprovalModal from "@/components/admin/DirectListingApprovalModal";
import { calculateServiceFeeAmount } from "@/lib/managed-sales/pricing";


type ManagedSaleStatus =
  | "pending_initial_review"
  | "pending_review"
  | "pending_approval"  // Direct listing - needs admin approval
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
  images?: string[];
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
  listing_type?: 'managed_sales' | 'direct';

  submitted_by_user_id: string;

  created_vehicle_id?: string | null;
  vehicle_details: VehicleDetails;
  access_arrangements?: AccessArrangements;


  contact_email?: string | null;
  dealer_fee?: number | string | null;

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
    pending_approval: { color: "bg-cyan-100 text-cyan-800", icon: Clock },
    approved: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
    declined: { color: "bg-red-100 text-red-800", icon: XCircle },
    listed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle },
    sold: { color: "bg-slate-100 text-slate-800", icon: JapaneseYenIcon },
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

  const {
    items,
    current,
    isLoading,
    error,
    page,
    limit,
    search,
    statusFilter,
    fetch,
    refresh,
    setSearch,
    getById,
    adminPatch,
    delete: deleteMsr,
    approveAndList: approveAndListMsr,
    patchStatus,
    updateAvailability,
    markSold: markSoldMsr,
    approveCancellation,
    declineCancellation,
    approveEditRequest,
    declineEditRequest,
  } = useManagedSaleRequestsStore();

  const {
    items: checklistItems,
    isLoading: isChecklistLoading,
    error: checklistError,
    fetch: fetchChecklists,
    create: createChecklist,
    update: updateChecklist,
  } = useInspectionChecklistStore();

  const [activeTab, setActiveTab] = useState<"requests" | "checklists">("requests");
  const [filter, setFilter] = useState<string>("all"); // UI-only (supports "approved_and_listed")
  const [listingTypeFilter, setListingTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState(search);
  const [showStats, setShowStats] = useState(false);

  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  const [availabilityTarget, setAvailabilityTarget] = useState<ManagedSaleRequestRow | null>(null);
  const [availabilityDraft, setAvailabilityDraft] = useState<any[]>([]);

  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<ChecklistRow | null>(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ManagedSaleRequestRow | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const [adminEditOpen, setAdminEditOpen] = useState(false);
  const [adminEditTarget, setAdminEditTarget] = useState<ManagedSaleRequestEditTarget | null>(null);

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

  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchTerm), 350);
    return () => window.clearTimeout(t);
  }, [searchTerm, setSearch]);

  useEffect(() => {
    fetch({ page, limit, search, status: statusFilter });
  }, [fetch, page, limit, search, statusFilter]);

  useEffect(() => {
    if (activeTab !== "checklists") return;
    fetchChecklists();
  }, [activeTab, fetchChecklists]);

  const users = useMemo<UserRow[]>(() => {
    const map = new Map<string, UserRow>();
    for (const r of items ?? []) {
      const u = (r as any).submittedByUser;
      if (u?.id && !map.has(u.id)) {
        map.set(u.id, {
          id: String(u.id),
          email: String(u.email ?? ""),
          full_name: u.full_name ?? null,
        });
      }
    }
    return Array.from(map.values());
  }, [items]);

  const requests = useMemo<ManagedSaleRequestRow[]>(() => {
    return (items ?? []).map((r) => {
      const anyR = r as any;
      const vehicleYear = anyR.vehicle_year;
      const yearNum =
        typeof vehicleYear === "number"
          ? vehicleYear
          : Number.isFinite(Number(vehicleYear))
            ? Number(vehicleYear)
            : new Date().getFullYear();

      const thumbArr =
        (Array.isArray(anyR.vehicle_images_thumbnails) ? anyR.vehicle_images_thumbnails : null) ??
        (Array.isArray(anyR.vehicle_images_small) ? anyR.vehicle_images_small : null) ??
        (Array.isArray(anyR.vehicle_images_medium) ? anyR.vehicle_images_medium : null) ??
        [];

      const titleFromParts = `${anyR.vehicle_year ?? ""} ${anyR.vehicle_make ?? ""} ${anyR.vehicle_model ?? ""}`
        .replace(/\s+/g, " ")
        .trim();
      const title = (anyR.vehicle_title ?? "").trim() || titleFromParts || `MSR ${String(anyR.id).slice(0, 8)}`;

      return {
        id: String(anyR.id),
        created_date: String(anyR.createdAt ?? new Date().toISOString()),
        status: (anyR.status ?? "pending_review") as ManagedSaleStatus,
        listing_type: anyR.listing_type ?? 'managed_sales',
        submitted_by_user_id: String(anyR.submitted_by_user_id ?? anyR.submittedByUser?.id ?? ""),
        created_vehicle_id: anyR.created_vehicle_id ?? anyR.createdVehicle?.id ?? null,
        vehicle_details: {
          title,
          make: String(anyR.vehicle_make ?? ""),
          model: String(anyR.vehicle_model ?? ""),
          year: yearNum,
          seller_asking_price: anyR.seller_asking_price ?? null,
          images_thumbnails: thumbArr,
        },
        access_arrangements: anyR.access_arrangements ?? undefined,
        final_sale_price_for_buyer: anyR.final_sale_price_for_buyer ?? null,
        owner_receives_amount: anyR.owner_receives_amount ?? null,
        service_fee_amount: anyR.service_fee_amount ?? null,
        calculated_buyer_price: anyR.calculated_buyer_price ?? null,
      };
    });
  }, [items]);

  const openCreateChecklist = () => {
    setEditingChecklist(null);
    setChecklistMsrContext(null);
    setChecklistModalOpen(true);
  };

  const openEditChecklist = (row: ChecklistRow) => {
    setEditingChecklist(row);
    setChecklistModalOpen(true);
  };

  const handleChecklistSave = async (data: VehicleInspectionChecklistData) => {
    const rawPrice = (data.recommended_sale_price ?? "").toString().trim();
    const priceNum = rawPrice ? Number(rawPrice) : null;

    const body: CreateChecklistBody = {
      date_of_inspection: data.date_of_inspection,
      inspector_name: data.inspector_name,
      dealership_name: data.dealership_name || undefined,
      warranty: data.warranty || undefined,
      repair_service_details: data.repair_service_details || undefined,
      verified_by_speedio: data.verified_by_speedio || undefined,
      dealership_representative: data.dealership_representative || undefined,
      inspection_notes: data.inspection_notes || undefined,
      overall_condition: data.overall_condition || undefined,
      recommended_sale_price: Number.isFinite(priceNum as number) ? (priceNum as number) : null,
      vehicle_info: (data.vehicle_info ?? {}) as Record<string, unknown>,
      exterior_condition: data.exterior_condition ?? [],
      interior_condition: data.interior_condition ?? [],
      engine_mechanical: data.engine_mechanical ?? [],
      documentation: data.documentation ?? [],
      photos_media: data.photos_media ?? [],
      managedSaleRequestId: (data.managed_sale_request_id || checklistMsrContext?.id || null) as
        | string
        | null,
    };

    try {
      if (editingChecklist) {
        await updateChecklist(editingChecklist.id, body);
        toast({ title: "Checklist updated", description: "" });
      } else {
        await createChecklist(body);
        toast({ title: "Checklist created", description: "" });
      }
    } catch (_e) {
      toast({ title: "Failed", description: "Checklist save failed.", variant: "destructive" });
      throw _e;
    }
  };

  const checklistRows = useMemo<ChecklistRow[]>(() => {
    return (checklistItems ?? []).map((it: any) => {
      const v = (it.vehicle_info ?? {}) as Record<string, unknown>;

      const transmissionRaw = String(v.transmission ?? "automatic").toLowerCase();
      const transmission = transmissionRaw === "manual" ? "manual" : "automatic";

      const fuelRaw = String(v.fuel_type ?? "gasoline").toLowerCase();
      const fuel_type =
        fuelRaw === "diesel" || fuelRaw === "hybrid" || fuelRaw === "electric" ? fuelRaw : "gasoline";

      const driveRaw = String(v.drivetrain ?? "fwd").toLowerCase();
      const drivetrain = driveRaw === "rwd" || driveRaw === "awd" || driveRaw === "4wd" ? driveRaw : "fwd";

      const normalizedVehicleInfo = {
        ...v,
        transmission,
        fuel_type,
        drivetrain,
        year:
          v.year === "" || v.year == null
            ? ""
            : Number.isFinite(Number(v.year))
              ? Number(v.year)
              : "",
        mileage:
          v.mileage === "" || v.mileage == null
            ? ""
            : Number.isFinite(Number(v.mileage))
              ? Number(v.mileage)
              : "",
      } as ChecklistRow["vehicle_info"];

      const docRaw = Array.isArray(it.documentation) ? it.documentation : [];
      const photoRaw = Array.isArray(it.photos_media) ? it.photos_media : [];

      const documentation = docRaw.map((d: any) =>
        d && typeof d === "object"
          ? { document: d.document ?? d.item ?? "", verified: Boolean(d.verified ?? d.present), notes: d.notes ?? "" }
          : d,
      );
      const photos_media = photoRaw.map((p: any) =>
        p && typeof p === "object"
          ? { type: p.type ?? p.item ?? "", completed: Boolean(p.completed ?? p.present), notes: p.notes ?? "" }
          : p,
      );

      const dateIso = String(it.date_of_inspection ?? "");
      const dateOnly = dateIso ? dateIso.slice(0, 10) : "";
      const rawSalePrice = it.recommended_sale_price;
      const salePriceStr = rawSalePrice == null ? "" : typeof rawSalePrice === "number" ? String(rawSalePrice) : String(rawSalePrice).trim();

      return {
        id: String(it.id),
        created_date: String(it.createdAt ?? new Date().toISOString()),
        updated_date: String(it.updatedAt ?? it.createdAt ?? new Date().toISOString()),

        date_of_inspection: dateOnly,
        inspector_name: String(it.inspector_name ?? ""),
        dealership_name: String(it.dealership_name ?? ""),
        warranty: String(it.warranty ?? ""),
        repair_service_details: String(it.repair_service_details ?? ""),

        managed_sale_request_id: String(it.managedSaleRequestId ?? ""),

        vehicle_info: normalizedVehicleInfo,
        exterior_condition: Array.isArray(it.exterior_condition) ? it.exterior_condition : [],
        interior_condition: Array.isArray(it.interior_condition) ? it.interior_condition : [],
        engine_mechanical: Array.isArray(it.engine_mechanical) ? it.engine_mechanical : [],
        documentation,
        photos_media,

        overall_condition: String(it.overall_condition ?? ""),
        recommended_sale_price: salePriceStr,
        verified_by_speedio: String(it.verified_by_speedio ?? ""),
        dealership_representative: String(it.dealership_representative ?? ""),
        inspection_notes: String(it.inspection_notes ?? ""),
      };
    });
  }, [checklistItems]);

  const getUserName = useCallback(
    (userId: string) => {
      const u = users.find((x) => x.id === userId);
      return u ? (u.full_name || u.email) : "Unknown User";
    },
    [users],
  );

  const filteredRequests = useMemo(() => {
    let list = [...requests];

    if (listingTypeFilter !== "all") {
      list = list.filter((r) => r.listing_type === listingTypeFilter);
    }

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
  }, [requests, filter, listingTypeFilter, searchTerm, getUserName]);

  const stats = useMemo(() => {
    const counts = requests.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {});
    return {
      pending_initial: counts.pending_initial_review || 0,
      pending: counts.pending_review || 0,
      pending_approval: counts.pending_approval || 0,
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
    setIsProcessing(true);
    setProcessingAction(`approve-${id}`);
    Promise.resolve()
      .then(() => approveAndListMsr(id, { adminNotes: adminNotes.trim() || null }))
      .then(() => toast({ title: "Listed", description: "Vehicle listing created." }))
      .catch(() => toast({ title: "Failed", description: "Could not approve & list.", variant: "destructive" }))
      .finally(() => {
        setIsProcessing(false);
        setProcessingAction(null);
      });
  };

  const deleteRequest = (id: string) => {
    if (!window.confirm("Delete this managed sale request?")) return;
    setIsProcessing(true);
    setProcessingAction(`delete-${id}`);
    Promise.resolve()
      .then(() => deleteMsr(id))
      .then(() => toast({ title: "Deleted", description: "" }))
      .catch(() => toast({ title: "Failed", description: "Delete failed.", variant: "destructive" }))
      .finally(() => {
        setIsProcessing(false);
        setProcessingAction(null);
      });
  };

  const markSold = (request: ManagedSaleRequestRow) => {
    const title = request.vehicle_details?.title || "this vehicle";
    const ok = window.confirm(
      `Are you sure you want to mark "${title}" as sold?\n\nThis will update the request and the vehicle listing.`
    );
    if (!ok) return;

    setIsProcessing(true);
    setProcessingAction(`sold-${request.id}`);
    Promise.resolve()
      .then(() => markSoldMsr(request.id))
      .then(() => toast({ title: "Marked Sold", description: "" }))
      .catch(() => toast({ title: "Failed", description: "Mark sold failed.", variant: "destructive" }))
      .finally(() => {
        setIsProcessing(false);
        setProcessingAction(null);
      });
  };

  const viewDetails = async (id: string) => {
    setIsProcessing(true);
    try {
      await getById(id);
      const cur: any = useManagedSaleRequestsStore.getState().current;
      if (!cur?.id) return;

      const mapped: ManagedSaleRequestRow = {
        id: String(cur.id),
        created_date: String(cur.createdAt ?? new Date().toISOString()),
        status: (cur.status ?? "pending_review") as ManagedSaleStatus,
        listing_type: cur.listing_type ?? 'managed_sales',
        submitted_by_user_id: String(cur.submitted_by_user_id ?? cur.submittedByUser?.id ?? ""),
        created_vehicle_id: cur.created_vehicle_id ?? cur.createdVehicle?.id ?? null,
        contact_email: cur.contact_email ?? null,
        dealer_fee: cur.dealer_fee ?? null,
        vehicle_details: {
          title: String(cur.vehicle_title ?? ""),
          make: String(cur.vehicle_make ?? ""),
          model: String(cur.vehicle_model ?? ""),
          year: Number(cur.vehicle_year ?? new Date().getFullYear()),
          seller_asking_price: cur.seller_asking_price ?? null,
          images: Array.isArray(cur.vehicle_images) ? cur.vehicle_images : [],
          images_thumbnails: Array.isArray(cur.vehicle_images_thumbnails) ? cur.vehicle_images_thumbnails : [],
        },
        access_arrangements: cur.access_arrangements ?? undefined,
        final_sale_price_for_buyer: cur.final_sale_price_for_buyer ?? null,
        owner_receives_amount: cur.owner_receives_amount ?? null,
        service_fee_amount: cur.service_fee_amount ?? null,
        calculated_buyer_price: cur.calculated_buyer_price ?? null,
      };

      setSelectedRequest(mapped);
      setAdminNotes("");
      setDetailsOpen(true);
    } catch (_e) {
      toast({ title: "Failed", description: "Could not load details.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // const openAdminEdit = async (id: string) => {
  //   setIsProcessing(true);
  //   try {
  //     await getById(id);
  //     const cur: any = useManagedSaleRequestsStore.getState().current;
  //     if (!cur?.id) throw new Error("NOT_FOUND");

  //     setAdminEditTarget({
  //       id: String(cur.id),
  //       submitted_by_user_id: String(cur.submitted_by_user_id ?? cur.submittedByUser?.id ?? ""),
  //       status: String(cur.status ?? ""),
  //       requester_contact_info: {
  //         full_name: String(cur.contact_full_name ?? ""),
  //         email: String(cur.contact_email ?? ""),
  //         phone: String(cur.contact_phone ?? ""),
  //       },
  //       vehicle_details: {
  //         title: String(cur.vehicle_title ?? ""),
  //         make: String(cur.vehicle_make ?? ""),
  //         model: String(cur.vehicle_model ?? ""),
  //         year: Number(cur.vehicle_year ?? new Date().getFullYear()),
  //         mileage: cur.vehicle_mileage ?? "",
  //         condition: String(cur.vehicle_condition ?? "good"),
  //         description: String(cur.vehicle_description ?? ""),
  //         fuel_type: String(cur.vehicle_fuel_type ?? "gasoline"),
  //         transmission: String(cur.vehicle_transmission ?? "automatic"),
  //         location: String(cur.vehicle_location ?? ""),
  //         seller_asking_price: cur.seller_asking_price ?? "",
  //         financing_available: String(cur.financing_available ?? ""),
  //         warranty_available: String(cur.warranty_available ?? ""),
  //         warranty_link: String(cur.warranty_link ?? ""),
  //         images: Array.isArray(cur.vehicle_images) ? cur.vehicle_images : [],
  //         images_thumbnails: Array.isArray(cur.vehicle_images_thumbnails) ? cur.vehicle_images_thumbnails : [],
  //         images_small: Array.isArray(cur.vehicle_images_small) ? cur.vehicle_images_small : [],
  //         images_medium: Array.isArray(cur.vehicle_images_medium) ? cur.vehicle_images_medium : [],
  //       } as any,
  //       access_arrangements: (cur.access_arrangements ?? {}) as any,
  //       terms_agreed: Boolean(cur.terms_agreed),
  //     });
  //     setAdminEditOpen(true);
  //   } catch (_e) {
  //     toast({ title: "Failed", description: "Could not load admin edit form.", variant: "destructive" });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };



const openAdminEdit = async (id: string) => {
  setIsProcessing(true);
  try {
    await getById(id);
    const cur: any = useManagedSaleRequestsStore.getState().current;
    if (!cur?.id) throw new Error("NOT_FOUND");

    setAdminEditTarget({
      id: String(cur.id),
      submitted_by_user_id: String(cur.submitted_by_user_id ?? cur.submittedByUser?.id ?? ""),
      status: String(cur.status ?? ""),

      requester_contact_info: {
        full_name: String(cur.contact_full_name ?? ""),
        email: String(cur.contact_email ?? ""),
        phone: String(cur.contact_phone ?? ""),
      },

      vehicle_details: {
        // ── Basic ──────────────────────────────────────────────
        title:              String(cur.vehicle_title ?? ""),
        make:               String(cur.vehicle_make ?? ""),
        model:              String(cur.vehicle_model ?? ""),
        year:               Number(cur.vehicle_year ?? new Date().getFullYear()),
        mileage:            cur.vehicle_mileage ?? "",
        condition:          String(cur.vehicle_condition ?? "good"),
        description:        String(cur.vehicle_description ?? ""),
        fuel_type:          String(cur.vehicle_fuel_type ?? "gasoline"),
        transmission:       String(cur.vehicle_transmission ?? "automatic"),
        location:           String(cur.vehicle_location ?? ""),
        seller_asking_price: cur.seller_asking_price ?? "",
        financing_available: String(cur.financing_available ?? ""),
        warranty_available:  String(cur.warranty_available ?? ""),
        warranty_link:       String(cur.warranty_link ?? ""),

        // ── Images ─────────────────────────────────────────────
        images:            Array.isArray(cur.vehicle_images)            ? cur.vehicle_images            : [],
        images_thumbnails: Array.isArray(cur.vehicle_images_thumbnails) ? cur.vehicle_images_thumbnails : [],
        images_small:      Array.isArray(cur.vehicle_images_small)      ? cur.vehicle_images_small      : [],
        images_medium:     Array.isArray(cur.vehicle_images_medium)     ? cur.vehicle_images_medium     : [],

        // ── Specs ──────────────────────────────────────────────
        drive_type:        String(cur.drive_type    ?? "2wd"),
        engine_size:       String(cur.engine_size   ?? ""),
        body_type:         String(cur.body_type     ?? "sedan"),
        exterior_color:    String(cur.exterior_color ?? ""),
        interior_color:    String(cur.interior_color ?? ""),
        doors:             Number(cur.doors          ?? 4),
        seating_capacity:  Number(cur.seating_capacity ?? 5),
        steering_wheel:    String(cur.steering_wheel ?? "right_hand_drive"),

        // ── Registration ───────────────────────────────────────
        current_plate_type:       String(cur.current_plate_type       ?? "kanji"),
        shaken_valid_until:       String(cur.shaken_valid_until       ?? ""),
        road_tax_paid:            String(cur.road_tax_paid            ?? "yes"),
        jci_insurance_valid_until: String(cur.jci_insurance_valid_until ?? ""),
        title_type:               String(cur.title_type               ?? "Active"),
        registration_location:    String(cur.registration_location    ?? "okinawa"),

        // ── Performance ────────────────────────────────────────
        engine_type:          String(cur.engine_type          ?? ""),
        power_output:         String(cur.power_output         ?? ""),
        fuel_efficiency:      String(cur.fuel_efficiency      ?? ""),
        drivetrain:           String(cur.drivetrain           ?? "fwd"),
        suspension_type:      String(cur.suspension_type      ?? ""),
        brakes:               String(cur.brakes               ?? ""),
        tire_condition:       String(cur.tire_condition       ?? "good"),
        battery_condition:    String(cur.battery_condition    ?? "original"),
        hybrid_system_status: String(cur.hybrid_system_status ?? "not_applicable"),
        maintenance_history:  String(cur.maintenance_history  ?? "unknown"),

        // ── Exterior features ──────────────────────────────────
        power_sliding_doors: String(cur.power_sliding_doors ?? "none"),
        headlights:          String(cur.headlights          ?? "halogen"),
        fog_lights:          String(cur.fog_lights          ?? "none"),
        alloy_wheels:        Boolean(cur.alloy_wheels),
        spoiler:             Boolean(cur.spoiler),
        tinted_windows:      Boolean(cur.tinted_windows),
        roof_type:           String(cur.roof_type    ?? "solid"),
        side_mirrors:        String(cur.side_mirrors ?? "manual"),
        keyless_entry:       Boolean(cur.keyless_entry),
        remote_door_locking: Boolean(cur.remote_door_locking),
        body_condition:      String(cur.body_condition ?? "no_damage"),

        // ── Interior ───────────────────────────────────────────
        air_conditioning:  String(cur.air_conditioning  ?? "manual"),
        upholstery:        String(cur.upholstery        ?? "fabric"),
        seat_type:         String(cur.seat_type         ?? "standard"),
        seat_adjustments:  String(cur.seat_adjustments  ?? "manual"),
        navigation_system: String(cur.navigation_system ?? "none"),
        rear_camera:       Boolean(cur.rear_camera),
        parking_sensors:   String(cur.parking_sensors   ?? "none"),
        power_windows:     String(cur.power_windows     ?? "none"),
        interior_lighting: String(cur.interior_lighting ?? "standard"),
        cup_holders_storage: Boolean(cur.cup_holders_storage),
        child_lock_isofix:   Boolean(cur.child_lock_isofix),

        // ── Arrays ─────────────────────────────────────────────
        infotainment_system:    Array.isArray(cur.infotainment_system)    ? cur.infotainment_system    : [],
        steering_wheel_controls: Array.isArray(cur.steering_wheel_controls) ? cur.steering_wheel_controls : [],
        airbags:                Array.isArray(cur.airbags)                ? cur.airbags                : [],

        // ── Safety ─────────────────────────────────────────────
        abs:                  Boolean(cur.abs),
        esc_stability_control: Boolean(cur.esc_stability_control),
        lane_departure_warning: Boolean(cur.lane_departure_warning),
        collision_mitigation:  Boolean(cur.collision_mitigation),
        cruise_control:        String(cur.cruise_control ?? "none"),
        traction_control:      Boolean(cur.traction_control),
        hill_start_assist:     Boolean(cur.hill_start_assist),
        immobilizer_alarm:     Boolean(cur.immobilizer_alarm),
        seat_belt_sensors:     Boolean(cur.seat_belt_sensors),

        // ── Tech ───────────────────────────────────────────────
        bluetooth:               Boolean(cur.bluetooth),
        usb_ports:               Boolean(cur.usb_ports),
        twelve_v_outlet:         Boolean(cur.twelve_v_outlet),
        smart_key_push_start:    Boolean(cur.smart_key_push_start),
        display_screen_size:     String(cur.display_screen_size ?? ""),
        rear_entertainment_system: Boolean(cur.rear_entertainment_system),
        voice_command_hands_free:  Boolean(cur.voice_command_hands_free),
        digital_dashboard_display: Boolean(cur.digital_dashboard_display),
      } as any,

      access_arrangements: (cur.access_arrangements ?? {}) as any,
      terms_agreed: Boolean(cur.terms_agreed),
    });

    setAdminEditOpen(true);
  } catch (_e) {
    toast({ title: "Failed", description: "Could not load admin edit form.", variant: "destructive" });
  } finally {
    setIsProcessing(false);
  }
};



  const setAvailability = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    setAvailabilityTarget(req);
    setAvailabilityDraft((req as any).access_arrangements?.recurring_availability ?? []);
    setAvailabilityOpen(true);
  };

  const inspectionChecklist = (request: ManagedSaleRequestRow) => {
    const list = checklistRows.filter((c) => c.managed_sale_request_id === request.id);
    if (list.length > 0) {
      const sorted = [...list].sort((a, b) => {
        const ad = new Date(a.updated_date || a.created_date).getTime();
        const bd = new Date(b.updated_date || b.created_date).getTime();
        return bd - ad;
      });
      openEditChecklist(sorted[0]);
      return;
    }

    const ok = window.confirm(
      "No checklist found for this managed sale request. Would you like to go to the Checklists tab to create or link one?"
    );
    if (!ok) return;

    setActiveTab("checklists");
    setEditingChecklist(null);
    setChecklistMsrContext({
      id: request.id,
      vehicle_details: {
        title: request.vehicle_details.title,
        dealership_name: (request as any).dealership_name,
        make: request.vehicle_details.make,
        model: request.vehicle_details.model,
        year: request.vehicle_details.year,
        mileage: undefined,
        fuel_type: "gasoline",
        seller_asking_price: request.vehicle_details.seller_asking_price ?? undefined,
      },
    });
    setChecklistModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {isProcessing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700 font-medium">Processing request...</span>
        </div>
      )}

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

                    <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
                      <div className="text-2xl font-bold text-cyan-600">{stats.pending_approval}</div>
                      <div className="text-xs text-slate-600">Pending Approval (Direct)</div>
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
                  <Select
                    value={listingTypeFilter}
                    onValueChange={setListingTypeFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="managed_sales">Managed Sales</SelectItem>
                      <SelectItem value="direct">Direct Listings</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Search by title, make, model, owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs"
                  />

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => refresh()}
                    disabled={isLoading}
                    title="Refresh"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </Button>

                  <Select
                    value={filter}
                    onValueChange={(v) => {
                      setFilter(v);
                      if (v === "all" || v === "approved_and_listed") {
                        // keep API unfiltered; apply local filter
                        useManagedSaleRequestsStore.getState().setStatusFilter("");
                        return;
                      }
                      useManagedSaleRequestsStore.getState().setStatusFilter(v as any);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending_initial_review">Needs Details</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="pending_approval">Pending Approval (Direct)</SelectItem>
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
                      <TableHead>Type</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Price (Seller/Buyer)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {isLoading && filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-slate-500">
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

                            <TableCell>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                request.listing_type === 'direct'
                                  ? 'bg-cyan-100 text-cyan-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {request.listing_type === 'direct' ? 'Direct' : 'Managed'}
                              </span>
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
                                  ? `¥${prices.sellerReceives.toLocaleString()}`
                                  : "N/A"}
                              </div>
                              <div className="font-semibold text-blue-700">
                                Buyer Pays:{" "}
                                {prices.buyerPrice !== null
                                  ? `¥${prices.buyerPrice.toLocaleString()}`
                                  : "N/A"}
                              </div>
                              {request.listing_type !== "direct" && (
                                <div className="text-xs text-slate-500">
                                  Service Fee:{" "}
                                  {prices.serviceFee !== null
                                    ? `¥${prices.serviceFee.toLocaleString()}`
                                    : "N/A"}
                                </div>
                              )}
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

                                  {request.status === "pending_initial_review" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          void openAdminEdit(request.id);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2 text-blue-500" />
                                        Complete Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          void openAdminEdit(request.id);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                        Admin Edit
                                      </DropdownMenuItem>
                                    </>
                                  )}

                                  {request.status === "pending_review" && !request.created_vehicle_id ? (
                                    <DropdownMenuItem 
                                      onClick={() => approveAndList(request.id)}
                                      disabled={processingAction === `approve-${request.id}`}
                                    >
                                      {processingAction === `approve-${request.id}` ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-500" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      )}
                                      Approve & List
                                    </DropdownMenuItem>
                                  ) : null}

                                  {/* Direct Listing - Pending Approval Actions */}
                                  {request.status === "pending_approval" && (
                                    <DropdownMenuItem 
                                      onClick={() => approveAndList(request.id)}
                                      disabled={processingAction === `approve-${request.id}`}
                                    >
                                      {processingAction === `approve-${request.id}` ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-green-500" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      )}
                                      Approve & Publish
                                    </DropdownMenuItem>
                                  )}

                                  {request.status === "approved" || request.status === "listed" ? (
                                    <>
                                      <DropdownMenuItem 
                                        onClick={() => markSold(request)}
                                        disabled={processingAction === `sold-${request.id}`}
                                      >
                                        {processingAction === `sold-${request.id}` ? (
                                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-emerald-500" />
                                        ) : (
                                          <JapaneseYenIcon className="w-4 h-4 mr-2 text-emerald-500" />
                                        )}
                                        Mark as Sold
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => setAvailability(request.id)}>
                                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                        Set Availability
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => inspectionChecklist(request)}>
                                        <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                                        Inspection Checklist
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          void openAdminEdit(request.id);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                        Admin Edit
                                      </DropdownMenuItem>
                                    </>
                                  ) : null}

                                  {request.status === "sold" ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          void openAdminEdit(request.id);
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
                                    disabled={processingAction === `delete-${request.id}`}
                                  >
                                    {processingAction === `delete-${request.id}` ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-4 h-4 mr-2" />
                                    )}
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
                {isLoading && filteredRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
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
                                  ? `¥${prices.sellerReceives.toLocaleString()}`
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Buyer Pays:</span>
                              <span className="font-semibold text-blue-700">
                                {prices.buyerPrice !== null
                                  ? `¥${prices.buyerPrice.toLocaleString()}`
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

                            {request.status === "pending_initial_review" ? (
                              <Button
                                size="sm"
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => openAdminEdit(request.id)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            ) : request.status === "pending_review" && !request.created_vehicle_id ? (
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
                                    <DropdownMenuItem onClick={() => markSold(request)}>
                                      <JapaneseYenIcon className="w-4 h-4 mr-2 text-emerald-500" />
                                      Mark as Sold
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setAvailability(request.id)}>
                                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                      Set Availability
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => inspectionChecklist(request)}>
                                      <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                                      Inspection Checklist
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        void openAdminEdit(request.id);
                                      }}
                                    >
                                      <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                      Admin Edit
                                    </DropdownMenuItem>
                                  </>
                                ) : null}

                                {request.status === "sold" ? (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        void openAdminEdit(request.id);
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
            {checklistError ? (
              <p className="text-center py-8 text-red-600">{checklistError}</p>
            ) : isChecklistLoading && checklistRows.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
              </div>
            ) : checklistRows.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                No vehicle inspection checklists found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Checklist Name</TableHead>
                    <TableHead>Linked MSR</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {checklistRows.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          Checklist {String(checklist.id).slice(0, 8)}
                        </div>
                      </TableCell>

                      <TableCell>
                        {checklist.managed_sale_request_id
                          ? requests.find((r) => r.id === checklist.managed_sale_request_id)?.vehicle_details
                              ?.title || `MSR ID: ${checklist.managed_sale_request_id.substring(0, 8)}`
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
          const msrId = availabilityTarget?.id;
          if (!msrId) return;
          setIsProcessing(true);
          const slots = (newAvailability as AvailabilitySlot[]).map((s) => ({
            dayOfWeek: String(s.day_of_week ?? "").replace(/^\w/, (c) => c.toUpperCase()),
            startTime: s.start_time,
            endTime: s.end_time,
            address: s.meeting_address,
          }));
          Promise.resolve()
            .then(() => updateAvailability(msrId, { recurringAvailability: slots }))
            .then(() => toast({ title: "Availability updated", description: "" }))
            .catch(() => toast({ title: "Failed", description: "Availability update failed.", variant: "destructive" }))
            .finally(() => {
              setIsProcessing(false);
              setAvailabilityOpen(false);
            });
        }}
      />

      <ManagedSaleDetailsModal
        isOpen={detailsOpen && !(selectedRequest?.listing_type === "direct" && selectedRequest?.status === "pending_approval")}
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
        loadRequests={() => refresh()}
        onEdit={(request: any) => {
          if (!request?.id) return;
          void openAdminEdit(String(request.id));
        }}
        onCancel={(req: any) => {
          if (!req?.id) return;
          const ok = window.confirm(
            "Are you sure you want to cancel this managed sale request? This will set the request status to 'cancelled'."
          );
          if (!ok) return;
          setIsProcessing(true);
          Promise.resolve()
            .then(() => patchStatus(String(req.id), { status: "cancelled", adminNotes: adminNotes?.trim() || null }))
            .then(() => {
              toast({ title: "Request cancelled", description: "" });
              setSelectedRequest(null);
              setDetailsOpen(false);
              refresh();
            })
            .catch(() => toast({ title: "Failed", description: "Action failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
        onStatusChange={(requestId: string, newStatus: any) => {
          setIsProcessing(true);
          Promise.resolve()
            .then(() => patchStatus(requestId, { status: String(newStatus), adminNotes: adminNotes || null }))
              .then(() => {
      toast({ title: "Status updated", description: "" });
      setDetailsOpen(false);      
      setSelectedRequest(null);   
      setAdminNotes("");
      refresh();
    })
            .catch(() => toast({ title: "Failed", description: "Status update failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
        onApproveEditRequest={(req: any, editRequestIndex: number) => {
          if (!req?.id) return;
          setIsProcessing(true);
          Promise.resolve()
            .then(() => approveEditRequest(String(req.id), editRequestIndex, adminNotes || null))
            .then(() => toast({ title: "Edit request approved", description: "" }))
            .catch(() => toast({ title: "Failed", description: "Action failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
        onDeclineEditRequest={(req: any, editRequestIndex: number) => {
          if (!req?.id) return;
          const reason = window.prompt("Decline reason (required)?") ?? "";
          if (!reason.trim()) return;
          setIsProcessing(true);
          Promise.resolve()
            .then(() => declineEditRequest(String(req.id), editRequestIndex, reason.trim()))
            .then(() => toast({ title: "Edit request declined", description: "" }))
            .catch(() => toast({ title: "Failed", description: "Action failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
        onApproveCancellation={(req: any) => {
          if (!req?.id) return;
          setIsProcessing(true);
          Promise.resolve()
            .then(() => approveCancellation(String(req.id)))
            .then(() => toast({ title: "Cancellation approved", description: "" }))
            .catch(() => toast({ title: "Failed", description: "Action failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
        onDeclineCancellation={(req: any) => {
          if (!req?.id) return;
          const reason = window.prompt("Decline reason (required)?") ?? "";
          if (!reason.trim()) return;
          setIsProcessing(true);
          Promise.resolve()
            .then(() => declineCancellation(String(req.id), reason.trim()))
            .then(() => toast({ title: "Cancellation declined", description: "" }))
            .catch(() => toast({ title: "Failed", description: "Action failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
        onMarkAsSold={(req: any) => {
          if (!req?.id) return;
          const title =
            (req?.vehicle_details?.title as string | undefined) ||
            (req?.vehicle_title as string | undefined) ||
            "this vehicle";
          const ok = window.confirm(
            `Are you sure you want to mark "${title}" as sold?\n\nThis will update the request and the vehicle listing.`
          );
          if (!ok) return;

          setIsProcessing(true);
          Promise.resolve()
            .then(() => markSoldMsr(String(req.id)))
            .then(() => toast({ title: "Marked sold", description: "" }))
            .catch(() => toast({ title: "Failed", description: "Action failed.", variant: "destructive" }))
            .finally(() => setIsProcessing(false));
        }}
      />

      {/* Direct listing approval modal - only for direct listing requests awaiting admin approval */}
      <DirectListingApprovalModal
        isOpen={
          selectedRequest !== null &&
          selectedRequest.listing_type === "direct" &&
          selectedRequest.status === "pending_approval"
        }
        request={selectedRequest ?? null}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedRequest(null);
        }}
        onApprove={async (id: string, notes: string) => {
          setIsProcessing(true);
          try {
            // approveAndListMsr publishes the listing and updates request status
            await approveAndListMsr(id, { adminNotes: notes?.trim() || null });
            await refresh();
          } catch (e) {
            console.error("Direct listing approve failed", e);
            throw e;
          } finally {
            setIsProcessing(false);
            setDetailsOpen(false);
            setSelectedRequest(null);
          }
        }}
        onDecline={async (id: string, reason: string) => {
          setIsProcessing(true);
          try {
            // patchStatus expects a single object payload in this store; call with minimal fields
            await patchStatus(id, { status: "declined" });
            await refresh();
          } catch (e) {
            console.error("Direct listing decline failed", e);
            throw e;
          } finally {
            setIsProcessing(false);
            setDetailsOpen(false);
            setSelectedRequest(null);
          }
        }}
        submitterInfo={
          selectedRequest
            ? {
                full_name: getUserName(selectedRequest.submitted_by_user_id),
                email: selectedRequest.contact_email || undefined,
                profile_image: undefined,
              }
            : undefined
        }
      />

      {adminEditTarget ? (
        <ManagedSalesRequestFormUI
          isOpen={adminEditOpen}
          requestToEdit={adminEditTarget}
          onClose={() => {
            setAdminEditOpen(false);
            setAdminEditTarget(null);
          }}
          onSave={async (payload: ManagedSaleRequestUpdatePayload) => {
            const fd = new window.FormData();

            fd.set("contact_full_name", payload.requester_contact_info.full_name);
            fd.set("contact_email", payload.requester_contact_info.email);
            fd.set("contact_phone", String(payload.requester_contact_info.phone || ""));

            fd.set("vehicle_title", payload.vehicle_details.title);
            fd.set("vehicle_make", payload.vehicle_details.make);
            fd.set("vehicle_model", payload.vehicle_details.model);
            fd.set("vehicle_vin", payload.vehicle_details.vin);
            fd.set("vehicle_year", String(payload.vehicle_details.year));
            fd.set("vehicle_mileage", payload.vehicle_details.mileage === "" ? "" : String(payload.vehicle_details.mileage));
            fd.set("vehicle_condition", payload.vehicle_details.condition);
            fd.set("vehicle_description", payload.vehicle_details.description);
            fd.set("vehicle_fuel_type", payload.vehicle_details.fuel_type);
            fd.set("vehicle_transmission", payload.vehicle_details.transmission);
            fd.set("vehicle_location", payload.vehicle_details.location);
            fd.set("seller_asking_price", payload.vehicle_details.seller_asking_price === "" ? "" : String(payload.vehicle_details.seller_asking_price));

            fd.set("financing_available", payload.vehicle_details.financing_available);
            fd.set("warranty_available", payload.vehicle_details.warranty_available);
            fd.set("warranty_link", payload.vehicle_details.warranty_link);

            // Backend merges existing URLs from `vehicle_images` string array.
            const urls =
              payload.vehicle_details.images_medium?.length
                ? payload.vehicle_details.images_medium
                : payload.vehicle_details.images?.length
                  ? payload.vehicle_details.images
                  : [];
            fd.set("vehicle_images", JSON.stringify(urls));

            fd.set("access_arrangements", JSON.stringify(payload.access_arrangements));
            fd.set("terms_agreed", String(payload.terms_agreed));

            const currentStatus = (useManagedSaleRequestsStore.getState().current as any)?.status;
            const newStatus = currentStatus === "pending_initial_review" ? "pending_review" : (payload.status || currentStatus);
            if (newStatus) fd.set("status", newStatus);

            fd.set("final_sale_price_for_buyer", String(payload.final_sale_price_for_buyer));
            fd.set("service_fee_amount", String(payload.service_fee_amount));
            fd.set("owner_receives_amount", String(payload.owner_receives_amount));

            setIsProcessing(true);
            try {
             
              await adminPatch(adminEditTarget.id, fd);
              toast({ title: "Saved", description: "" });
              setAdminEditOpen(false);
              setAdminEditTarget(null);
            } catch (_e) {
              toast({ title: "Failed", description: "Save failed.", variant: "destructive" });
            } finally {
              setIsProcessing(false);
            }
          }}
        />
      ) : null}
    </div>
  );
}
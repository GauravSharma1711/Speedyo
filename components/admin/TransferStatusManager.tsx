"use client";
import { useVehicleListingStore } from "@/store/admin/vehicleListing";
import { useUserStore } from "@/store/admin/user"; 

import React, { useMemo, useState } from "react";
import { AlertCircle, Edit, Plus, Search } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Textarea } from "@/components/ui/TextArea";
import { toast } from "@/components/ui/UseToast";

import { useTransferStore } from "@/store/admin/transfer";
import { useEffect } from "react";
import { notificationService } from "@/services/dashboard";


type TransferType = "speedio_managed" | "self_service";
type TransferStatus = "in_progress" | "on_hold" | "completed";
import type { Transfer } from "@/store/admin/transfer";
type Vehicle = { id: string; title: string };
type PublicUser = { id: string; full_name: string; email: string };

type VehicleTransfer = {
  id: string;
  vehicleId: string;
  transferType: TransferType;
  buyerId: string;
  sellerId?: string | null;
  currentStep: number;
  stepsCompleted: number[];
  status: TransferStatus;
  userFacingNotes: string;
  adminNotes: string;
  createdAt: string;
};

const SPEEDIO_MANAGED_STEPS = [
  { number: 1, title: "Documents Prepared" },
  { number: 2, title: "LTO Inspection Completed" },
  { number: 3, title: "PDI Insurance Purchased" },
  { number: 4, title: "JSVRO Paperwork Submitted" },
  { number: 5, title: "Y-Plates Purchased & Installed" },
  { number: 6, title: "JSVRO Finalization Complete" },
] as const;

const SELF_SERVICE_STEPS = [
  { number: 1, title: "JSVRO Paperwork Submitted" },
  { number: 2, title: "Y-Plates Purchased & Installed" },
  { number: 3, title: "LTO Inspection Completed" },
  { number: 4, title: "Returned to JSVRO" },
  { number: 5, title: "Road Tax Conversion Complete" },
  { number: 6, title: "Final SOFA Registration Complete" },
] as const;

const MOCK_VEHICLES: Vehicle[] = [
  { id: "veh_1", title: "Toyota Aqua 2018" },
  { id: "veh_2", title: "Honda Fit 2016" },
];

const MOCK_USERS: PublicUser[] = [
  { id: "u_1", full_name: "Test Buyer", email: "buyer@test.com" },
  { id: "u_2", full_name: "Test Seller", email: "seller@test.com" },
  { id: "u_3", full_name: "Rockstar Ahuja", email: "rockstarahuja99@gmail.com" },
];

const MOCK_TRANSFERS: VehicleTransfer[] = [
  {
    id: "tr_1",
    vehicleId: "veh_1",
    transferType: "speedio_managed",
    buyerId: "u_1",
    sellerId: "u_2",
    currentStep: 2,
    stepsCompleted: [1],
    status: "in_progress",
    userFacingNotes: "Docs started.",
    adminNotes: "",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    id: "tr_2",
    vehicleId: "veh_2",
    transferType: "self_service",
    buyerId: "u_3",
    sellerId: null,
    currentStep: 4,
    stepsCompleted: [1, 2, 3],
    status: "on_hold",
    userFacingNotes: "Waiting for plates.",
    adminNotes: "Follow up next week.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function statusBadgeVariant(status: TransferStatus): "default" | "secondary" | "outline" {
  if (status === "completed") return "default";
  if (status === "on_hold") return "outline";
  return "secondary";
}

export default function TransferStatusManagerUI() {


    const { transfers, isLoading, error, create, update, getAll } = useTransferStore();



  // const [transfers, setTransfers] = useState<VehicleTransfer[]>(MOCK_TRANSFERS);
  const [searchTerm, setSearchTerm] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpenForId, setEditOpenForId] = useState<string | null>(null);


    useEffect(() => {
    getAll();
  }, []);

 

  const filteredTransfers = useMemo(() => {
  const q = searchTerm.trim().toLowerCase();
  if (!q) return transfers;
  return transfers.filter((t) => {
    const hay = [
      t.vehicle?.title ?? "",
      t.buyer?.full_name ?? "",
      t.buyer?.email ?? "",
      t.status,
      t.transfer_type,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}, [searchTerm, transfers]);

  const handleCreate = async(payload: Omit<VehicleTransfer, "id" | "createdAt">) => {
    // const created: VehicleTransfer = {
    //   id: `tr_${Math.random().toString(16).slice(2, 8)}`,
    //   createdAt: new Date().toISOString(),
    //   ...payload,
    // };
    // setTransfers((prev) => [created, ...prev]);
    // setCreateOpen(false);
    // toast({ title: "Transfer created", description: "" });


    try {
    await create({
      vehicleId: payload.vehicleId,
      buyerId: payload.buyerId,
      sellerId: payload.sellerId && payload.sellerId !== "__none__"
        ? payload.sellerId
        : undefined,
      transfer_type: payload.transferType,
      admin_notes: payload.adminNotes,
      user_facing_notes: payload.userFacingNotes,
    });
    await getAll();
    setCreateOpen(false);
    toast({ title: "Transfer created" });
  } catch {
    toast({ title: "Failed to create transfer", variant: "destructive" });
  }
  


  };

  const handleUpdate = async(transferId: string, updates: Partial<VehicleTransfer>) => {
    try {
      await update(transferId, {
        steps_completed: updates.stepsCompleted,
        status: updates.status,
        admin_notes: updates.adminNotes,
        user_facing_notes: updates.userFacingNotes,
      });

      // Find the transfer to get buyer/seller info
      const transfer = transfers.find((t) => t.id === transferId);
      if (transfer) {
        const completedSteps = updates.stepsCompleted?.length || 0;

        if (transfer.buyerId) {
          await notificationService.create({
            recipientId: transfer.buyerId,
            type: "vehicle_edit_request",
            content: `Your vehicle transfer status has been updated: Step ${completedSteps} of 6 completed. ${updates.userFacingNotes || ""}`,
            relatedEntityId: transferId,
            relatedEntityType: "VehicleTransfer",
            url: "/Dashboard",
            icon: "CheckCircle"
          });
        }

        if (transfer.sellerId) {
          await notificationService.create({
            recipientId: transfer.sellerId,
            type: "vehicle_edit_request",
            content: `Transfer status updated for your managed vehicle. ${updates.userFacingNotes || ""}`,
            relatedEntityId: transferId,
            relatedEntityType: "VehicleTransfer",
            url: "/Dashboard",
            icon: "CheckCircle"
          });
        }
      }

      await getAll();
      setEditOpenForId(null);
      toast({ title: "Saved", description: "Transfer updated. Buyer and seller notified." });
    } catch {
      toast({ title: "Failed to update transfer", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">
          Transfer Status Management
        </h2>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Transfer
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search by vehicle, buyer, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">

  {isLoading ? (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  ) : error ? (
    <Card>
      <CardContent className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
      </CardContent>
    </Card>
  ) :

      filteredTransfers?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No transfers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransfers?.map((t) => {
            // const vehicle = MOCK_VEHICLES.find((v) => v.id === t.vehicleId);
            // const buyer = MOCK_USERS.find((u) => u.id === t.buyerId);
            // const seller = t.sellerId
            //   ? MOCK_USERS.find((u) => u.id === t.sellerId)
            //   : null;
            const totalSteps = 6;
            const pct = Math.round(((t?.steps_completed?.length || 0) / totalSteps) * 100);

            return (
              <Card key={t.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {t.vehicle?.title ?? "Unknown Vehicle"}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={statusBadgeVariant(t?.status as TransferStatus)}
                          className="capitalize"
                        >
                          {t.status === "in_progress" ? "In Progress" : t.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {t.transfer_type === "speedio_managed"
                            ? "Speedio-Managed"
                            : "Self-Service"}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          Step {t.current_step} of {totalSteps}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditOpenForId(t.id)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Buyer</p>
                      <p className="font-medium text-slate-800">
                        {t.buyer?.full_name ?? "Unknown"}
                      </p>
                    </div>
                    {t.seller && (
                      <div>
                        <p className="text-slate-500">Seller</p>
                        <p className="font-medium text-slate-800">{t.seller?.full_name ?? "Unknown"}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-slate-500">{pct}% complete</div>
                  </div>

                  {editOpenForId === t.id && (
                    <EditTransferModal
                      transfer={t}
                      onClose={() => setEditOpenForId(null)}
                      onSave={(updates) => handleUpdate(t.id, updates)}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}



      </div>

      {createOpen && (
        <CreateTransferModal
          onClose={() => setCreateOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

function CreateTransferModal(props: {
  // vehicles: Vehicle[];
  // users: PublicUser[];
  onClose: () => void;
  onCreate: (payload: Omit<VehicleTransfer, "id" | "createdAt">) => void;
}) {
  const {  onClose, onCreate } = props;

const { vehicles, getAll: getVehicles } = useVehicleListingStore();
const { users, getAll: getUsers } = useUserStore();

useEffect(() => {
  getVehicles();
  getUsers();
}, []);

  const [vehicleId, setVehicleId] = useState<string>(vehicles[0]?.id ?? "");
  const [transferType, setTransferType] = useState<TransferType>("speedio_managed");
  const [buyerId, setBuyerId] = useState<string>(users[0]?.id ?? "");
  const [sellerId, setSellerId] = useState<string>("");
  const [userFacingNotes, setUserFacingNotes] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !buyerId) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }

    onCreate({
      vehicleId,
      transferType,
      buyerId,
      sellerId: sellerId || null,
      currentStep: 1,
      stepsCompleted: [],
      status: "in_progress",
      userFacingNotes,
      adminNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-lg bg-white border shadow-xl">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="text-lg font-semibold">Create New Transfer</div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Vehicle</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Transfer Type</Label>
            <Select value={transferType} onValueChange={(v) => setTransferType(v as TransferType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="speedio_managed">Speedio-Managed</SelectItem>
                <SelectItem value="self_service">Self-Service</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Buyer</Label>
            <Select value={buyerId} onValueChange={setBuyerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select buyer" />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Seller (Optional)</Label>
            <Select value={sellerId} onValueChange={setSellerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select seller (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>User-Facing Notes</Label>
            <Textarea
              value={userFacingNotes}
              onChange={(e) => setUserFacingNotes(e.target.value)}
              placeholder="Notes visible to buyer and seller..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Notes</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Transfer</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditTransferModal(props: {
  transfer: Transfer;
  onClose: () => void;
  onSave: (updates: Partial<VehicleTransfer>) => void;
}) {
  const { transfer, onClose, onSave } = props;

  const steps =
    transfer.transfer_type  === "speedio_managed"
      ? SPEEDIO_MANAGED_STEPS
      : SELF_SERVICE_STEPS;

  const [stepsCompleted, setStepsCompleted] = useState<number[]>(
    transfer.steps_completed  ?? [],
  );
  const [status, setStatus] = useState<TransferStatus>(transfer.status);
  const [userFacingNotes, setUserFacingNotes] = useState(transfer.user_facing_notes  ?? "");
  const [adminNotes, setAdminNotes] = useState(transfer.admin_notes  ?? "");

  const toggleStep = (stepNumber: number, checked: boolean) => {
    const updated = checked
      ? Array.from(new Set([...stepsCompleted, stepNumber])).sort((a, b) => a - b)
      : stepsCompleted.filter((s) => s !== stepNumber);
    setStepsCompleted(updated);

    const next = steps.find((s) => !updated.includes(s.number));
    const nextCurrentStep = next ? next.number : steps.length;

    const isComplete = updated.length === steps.length;
    setStatus(isComplete ? "completed" : status);

    // onSave({
    //   stepsCompleted: updated,
    //   currentStep: nextCurrentStep,
    //   status: isComplete ? "completed" : status,
    // });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      status,
      userFacingNotes,
      adminNotes,
      stepsCompleted,
    });
    toast({ title: "Saved", description: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl rounded-lg bg-white border shadow-xl">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">Update Transfer Status</div>
            <div className="text-sm text-slate-600">Transfer #{transfer.id}</div>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="mb-2 block">Completed Steps</Label>
            <div className="space-y-2">
              {steps.map((s) => {
                const checked = stepsCompleted.includes(s.number);
                return (
                  <div key={s.number} className="flex items-center space-x-2">
                    <Checkbox
                      id={`step-${transfer.id}-${s.number}`}
                      checked={checked}
                      onCheckedChange={(v) => toggleStep(s.number, Boolean(v))}
                    />
                    <label
                      htmlFor={`step-${transfer.id}-${s.number}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      Step {s.number}: {s.title}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TransferStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>User-Facing Notes</Label>
            <Textarea
              value={userFacingNotes}
              onChange={(e) => setUserFacingNotes(e.target.value)}
              placeholder="Notes visible to buyer and seller..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Admin Notes (Internal)</Label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}


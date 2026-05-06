"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Eye, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/Dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

import VehicleInspectionChecklistModalUI, {
    VehicleInspectionChecklistData,
} from "@/components/admin/VehicleInspectionChecklistModal";

type ChecklistRow = VehicleInspectionChecklistData & {
    id: string;
    createdAt: string; // ISO
    linkedMSR: boolean;
};
type ManagedSaleRequestRow = { id: string; title: string };
const managedSaleRequests: ManagedSaleRequestRow[] = [
    { id: "msr_001", title: "2011 Daihatsu Move" },
    { id: "msr_002", title: "2012 Suzuki Solio" },
];
const MOCK: ChecklistRow[] = [
    {
        id: "chk_001",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        linkedMSR: true,
        managed_sale_request_id: "msr_001",

        date_of_inspection: "2025-11-05",
        inspector_name: "Kevin Phillips",
        dealership_name: "Taka Cars",
        warranty: "",
        repair_service_details: "",
        vehicle_info: {
            make: "Daihatsu",
            model: "Move",
            year: 2011,
            vin: "L465S-0018288",
            mileage: 0,
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

function newId() {
    return `chk_${Math.random().toString(16).slice(2, 10)}`;
}

export default function InspectionChecklistManagementUI() {
    const [query, setQuery] = useState("");
    const [rows, setRows] = useState<ChecklistRow[]>(MOCK);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ChecklistRow | null>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [checklistToLink, setChecklistToLink] = useState<ChecklistRow | null>(null);
    const [selectedMSRId, setSelectedMSRId] = useState<string>("");

    const openLink = (row: ChecklistRow) => {
        setChecklistToLink(row);
        setSelectedMSRId(row.managed_sale_request_id ?? "");
        setShowLinkModal(true);
    };


    const saveLink = () => {
        if (!checklistToLink) return;
        setRows((prev) =>
            prev.map((r) =>
                r.id === checklistToLink.id
                    ? {
                        ...r,
                        managed_sale_request_id: selectedMSRId || "",
                        linkedMSR: Boolean(selectedMSRId),
                    }
                    : r,
            ),
        );
        setShowLinkModal(false);
        setChecklistToLink(null);
        setSelectedMSRId("");
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return rows;

        return rows.filter((r) => {
            const vehicle = `${r.vehicle_info.year} ${r.vehicle_info.make} ${r.vehicle_info.model}`.toLowerCase();
            return (
                vehicle.includes(q) ||
                (r.dealership_name ?? "").toLowerCase().includes(q) ||
                (r.vehicle_info.vin ?? "").toLowerCase().includes(q) ||
                (r.inspector_name ?? "").toLowerCase().includes(q)
            );
        });
    }, [rows, query]);

    const openCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const openEdit = (row: ChecklistRow) => {
        setEditing(row);
        setModalOpen(true);
    };

    const removeRow = (id: string) => {
        if (!window.confirm("Delete this checklist?")) return;
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const handleSave = (data: VehicleInspectionChecklistData) => {
        if (editing) {
            setRows((prev) =>
                prev.map((r) => (r.id === editing.id ? { ...r, ...data } : r)),
            );
            return;
        }

        const created: ChecklistRow = {
            id: newId(),
            createdAt: new Date().toISOString(),
            linkedMSR: Boolean(data.managed_sale_request_id),
            ...data,
        };

        setRows((prev) => [created, ...prev]);
    };

    return (
        <>
            <Card className="bg-white shadow-md">
                <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Vehicle Inspection Checklists</CardTitle>
                        <div className="text-sm text-slate-600">
                            Review and manage inspection checklists
                        </div>
                    </div>

                    <Button onClick={openCreate} className="md:self-end">
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Checklist
                    </Button>
                </CardHeader>

                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Search by make, model, dealership, or VIN..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Dealership</TableHead>
                                    <TableHead>Inspection Date</TableHead>
                                    <TableHead>Inspector</TableHead>
                                    <TableHead>Linked MSR</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filtered.map((r) => {
                                    const linked = r.linkedMSR || Boolean(r.managed_sale_request_id);

                                    return (
                                        <TableRow key={r.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {r.vehicle_info.year || "—"} {r.vehicle_info.make || "—"} {r.vehicle_info.model || "—"}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    VIN: {r.vehicle_info.vin || "—"}
                                                </div>
                                            </TableCell>

                                            <TableCell>{r.dealership_name || "—"}</TableCell>

                                            <TableCell>
                                                {r.date_of_inspection
                                                    ? format(new Date(r.date_of_inspection), "MMM d, yyyy")
                                                    : "—"}
                                            </TableCell>

                                            <TableCell>{r.inspector_name || "—"}</TableCell>

                                            <TableCell>
                                                {linked ? (
                                                   <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                   Linked
                                                 </Badge>
                                                ) : (
                                                    <Badge variant="outline">Unlinked</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEdit(r)}
                                                        title="View Checklist"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openLink(r)}
                                                        title="Link to MSR"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeRow(r.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                            No checklists found.
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <VehicleInspectionChecklistModalUI
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                managedSaleRequest={null}
                existingChecklist={editing}
                onSave={handleSave}
            />

            <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Link Checklist to Managed Sale Request</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-600 mb-2">
                                Select a managed sale request to link this checklist to:
                            </p>

                            <Select
                                value={selectedMSRId || "__none__"}
                                onValueChange={(v) => setSelectedMSRId(v === "__none__" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select managed sale request" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="__none__">None (Unlink)</SelectItem>
                                    {managedSaleRequests.map((msr) => (
                                        <SelectItem key={msr.id} value={msr.id}>
                                            {msr.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowLinkModal(false);
                                    setChecklistToLink(null);
                                    setSelectedMSRId("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button onClick={saveLink} disabled={!checklistToLink}>
                                Save Link
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
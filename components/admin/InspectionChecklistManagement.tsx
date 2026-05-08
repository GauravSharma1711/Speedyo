"use client";

import React, { useMemo, useState, useEffect } from "react";
import { format } from "date-fns";
import { Eye, Plus, Trash2, Link as LinkIcon, Loader2 } from "lucide-react";
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
import { useInspectionChecklistStore } from "@/store/admin/inspectionChecklist";
import { useManagedSaleRequestsStore } from "@/store/admin/managedSaleRequests";
import type { CreateChecklistBody } from "@/services/admin/inspectionChecklistService";

type ChecklistRow = VehicleInspectionChecklistData & {
    id: string;
    createdAt: string; // ISO
    linkedMSR: boolean;
};
type ManagedSaleRequestOption = { id: string; title: string };

export default function InspectionChecklistManagementUI() {
    const [query, setQuery] = useState("");
    const {
        items,
        isLoading,
        fetch,
        create,
        update,
        remove,
        linkMSR,
    } = useInspectionChecklistStore();

    useEffect(() => {
        fetch();
    }, [fetch]);

    const {
        items: msrItems,
        isLoading: isMsrLoading,
        error: msrError,
        fetch: fetchMsrs,
    } = useManagedSaleRequestsStore();

    useEffect(() => {
        fetchMsrs({ page: 1, limit: 100 });
    }, [fetchMsrs]);

    const msrOptions = useMemo<ManagedSaleRequestOption[]>(() => {
        return (msrItems ?? []).map((r) => {
            const titleFromParts = `${r.vehicle_year ?? ""} ${r.vehicle_make ?? ""} ${r.vehicle_model ?? ""}`
                .replace(/\s+/g, " ")
                .trim();
            const title = (r.vehicle_title ?? "").trim() || titleFromParts || `MSR ${r.id.slice(0, 8)}`;
            return { id: r.id, title };
        });
    }, [msrItems]);

    const rows = useMemo<ChecklistRow[]>(() => {
        return items.map((it) => {
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

            return {
            id: it.id,
            createdAt: it.createdAt,
            linkedMSR: Boolean(it.managedSaleRequestId),
            managed_sale_request_id: it.managedSaleRequestId ?? "",

            date_of_inspection: it.date_of_inspection ? it.date_of_inspection.slice(0, 10) : "",
            inspector_name: it.inspector_name ?? "",
            dealership_name: it.dealership_name ?? "",
            warranty: it.warranty ?? "",
            repair_service_details: it.repair_service_details ?? "",

            vehicle_info: normalizedVehicleInfo,
            exterior_condition: (it.exterior_condition ?? []) as ChecklistRow["exterior_condition"],
            interior_condition: (it.interior_condition ?? []) as ChecklistRow["interior_condition"],
            engine_mechanical: (it.engine_mechanical ?? []) as ChecklistRow["engine_mechanical"],
            documentation: (Array.isArray(it.documentation) ? it.documentation : []).map((d: any) => ({
                document: typeof d?.document === "string" ? d.document : String(d?.item ?? ""),
                verified: typeof d?.verified === "boolean" ? d.verified : Boolean(d?.present),
                notes: typeof d?.notes === "string" ? d.notes : "",
              })) as ChecklistRow["documentation"],
              
              photos_media: (Array.isArray(it.photos_media) ? it.photos_media : []).map((p: any) => ({
                type: typeof p?.type === "string" ? p.type : String(p?.item ?? ""),
                completed: typeof p?.completed === "boolean" ? p.completed : Boolean(p?.present),
                notes: typeof p?.notes === "string" ? p.notes : "",
              })) as ChecklistRow["photos_media"],

            overall_condition: it.overall_condition ?? "",
            recommended_sale_price: it.recommended_sale_price != null ? String(it.recommended_sale_price) : "",
            verified_by_speedio: it.verified_by_speedio ?? "",
            dealership_representative: it.dealership_representative ?? "",
            inspection_notes: it.inspection_notes ?? "",
            };
        });
    }, [items]);

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<ChecklistRow | null>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [checklistToLink, setChecklistToLink] = useState<ChecklistRow | null>(null);
    const [selectedMSRId, setSelectedMSRId] = useState<string>("");
    const [isLinking, setIsLinking] = useState(false);

    const openLink = (row: ChecklistRow) => {
        setChecklistToLink(row);
        setSelectedMSRId(row.managed_sale_request_id ?? "");
        setShowLinkModal(true);
    };

    const saveLink = async () => {
        if (!checklistToLink) return;
        setIsLinking(true);
        try {
            await linkMSR(checklistToLink.id, selectedMSRId ? selectedMSRId : null);
            setShowLinkModal(false);
            setChecklistToLink(null);
            setSelectedMSRId("");
        } finally {
            setIsLinking(false);
        }
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

    const removeRow = async (id: string) => {
        if (!window.confirm("Delete this checklist?")) return;
        await remove(id);
    };

    const handleSave = async (data: VehicleInspectionChecklistData) => {
        const raw = data.recommended_sale_price;
        const priceStr = raw == null ? "" : typeof raw === "number" ? String(raw) : String(raw).trim();
        const recommended_sale_price =
            priceStr === "" ? null : Number.isFinite(Number(priceStr)) ? Number(priceStr) : null;

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
            recommended_sale_price,
            vehicle_info: data.vehicle_info ?? {},
            exterior_condition: data.exterior_condition ?? [],
            interior_condition: data.interior_condition ?? [],
            engine_mechanical: data.engine_mechanical ?? [],
            documentation: (data.documentation ?? []).map((d) => ({
                item: d.document,
                present: Boolean(d.verified),
                notes: d.notes ?? null,
            })) as unknown[],
            photos_media: (data.photos_media ?? []).map((p) => ({
                item: p.type,
                present: Boolean(p.completed),
                notes: p.notes ?? null,
            })) as unknown[],
            managedSaleRequestId: data.managed_sale_request_id ? data.managed_sale_request_id : null,
        };

        if (editing) {
            await update(editing.id, body);
        } else {
            await create(body);
        }

        setModalOpen(false);
        setEditing(null);
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
                    <div className="rounded-lg overflow-hidden">
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
                                {isLoading && items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-10 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                                        </TableCell>
                                    </TableRow>
                                ) : null}
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

                                {!isLoading && filtered.length === 0 ? (
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
                                    {selectedMSRId && !msrOptions.some((o) => o.id === selectedMSRId) ? (
                                        <SelectItem value={selectedMSRId}>Linked: {selectedMSRId}</SelectItem>
                                    ) : null}
                                    {msrOptions.map((msr) => (
                                        <SelectItem key={msr.id} value={msr.id}>
                                            {msr.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {isMsrLoading ? (
                                <div className="mt-2 text-xs text-slate-500 inline-flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Loading managed sale requests...
                                </div>
                            ) : msrError ? (
                                <div className="mt-2 text-xs text-red-600">{msrError}</div>
                            ) : null}
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowLinkModal(false);
                                    setChecklistToLink(null);
                                    setSelectedMSRId("");
                                }}
                                disabled={isLinking}
                            >
                                Cancel
                            </Button>
                            <Button onClick={saveLink} disabled={!checklistToLink || isLinking}>
                                {isLinking ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Link"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
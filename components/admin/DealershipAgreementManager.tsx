"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Copy, Eye, FileText, Loader2, Plus, Send, XCircle } from "lucide-react";

import { DealershipAgreement, useDealershipAgreementStore } from "@/store/admin/dealership";
import { useToast } from "@/components/ui/UseToast";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";

import { AgreementStatus } from "@/lib/generated/prisma/enums";

// ── Local form state ───────────────────────────────────────────────────────────
type FormState = {
  dealership_name: string;
  representative_name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  service_fee_amount: string;
  admin_notes: string;
};

function statusBadgeClass(status: AgreementStatus) {
  if (status === "signed") return "bg-emerald-100 text-emerald-700";
  if (status === "pending_signature") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

// ─────────────────────────────────────────────────────────────────────────────
export default function DealershipAgreementManagerUI() {
  const { toast } = useToast();

  // ── Store ──────────────────────────────────────────────────────────────────
  const {
    agreements,
    isLoading,
    error,
    getAll,
    create,
    update,
    delete: deleteAgreement,
  } = useDealershipAgreementStore();

  // Fetch on mount
  useEffect(() => {
    getAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [isCreating, setIsCreating] = useState(false);

  // Maps agreementId → which action is currently in flight ("send" | "email" | "delete")
  const [submittingIds, setSubmittingIds] = useState<Record<string, string>>({});

  function setSubmitting(id: string, action: string | null) {
    setSubmittingIds((prev) => {
      if (action === null) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: action };
    });
  }

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormState>({
    dealership_name: "",
    representative_name: "",
    address: "",
    phone: "",
    email: "",
    license_number: "",
    service_fee_amount: "",
    admin_notes: "",
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  const canCreate = useMemo(
    () =>
      formData.dealership_name.trim().length > 0 &&
      formData.representative_name.trim().length > 0 &&
      formData.email.trim().length > 0,
    [formData],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  function resetForm() {
    setFormData({
      dealership_name: "",
      representative_name: "",
      address: "",
      phone: "",
      email: "",
      license_number: "",
      service_fee_amount: "",
      admin_notes: "",
    });
  }

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleCreateAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setIsCreating(true);
    try {
      const serviceFee = formData.service_fee_amount
        ? parseFloat(formData.service_fee_amount)
        : null;

      await create({
        dealership_name: formData.dealership_name.trim(),
        representative_name: formData.representative_name.trim(),
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim(),
        license_number: formData.license_number.trim() || undefined,
        service_fee_amount: serviceFee ? String(serviceFee) : undefined,
        admin_notes: formData.admin_notes.trim() || undefined,
      });

      setShowCreateModal(false);
      resetForm();
      toast({
        title: "Agreement created",
        description: "Agreement saved successfully.",
        variant: "success",
      });
    } catch (err: any) {
      console.error("Create failed:", err);
      toast({
        title: "Error",
        description: err?.message || error || "Failed to create agreement.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  }

  // ── Send signing email ─────────────────────────────────────────────────────
  async function handleSendSigningEmail(
    id: string,
    email: string,
    currentStatus: string,
  ) {
    if (currentStatus !== "draft" && currentStatus !== "pending_signature") return;
    setSubmitting(id, "send");
    try {
      const res = await fetch(
        `/api/admin/dealership-agreements/${id}/sendSigningMail`,
        { method: "POST" },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send agreement.");
      }
      await getAll();
      toast({
        title: "Sent to dealership",
        description: `Signing link sent to ${email}.`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Failed to send agreement.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(id, null);
    }
  }

  // ── Send signed agreement email ────────────────────────────────────────────
  async function handleSendAgreementEmail(id: string, email: string) {
    setSubmitting(id, "email");
    try {
      console.log("id", id);
      const res = await fetch(
        `/api/admin/dealership-agreements/${id}/sendSignedMail`,
        { method: "POST" },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send email.");
      }
      toast({
        title: "Email sent",
        description: `Signed agreement emailed to ${email}.`,
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Failed to send email.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(id, null);
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const ok = window.confirm(
      "Are you sure you want to delete this agreement? This action cannot be undone.",
    );
    if (!ok) return;
    setSubmitting(id, "delete");
    try {
      await deleteAgreement(id);
      toast({ title: "Deleted", description: "Agreement removed." });
    } catch {
      toast({
        title: "Error",
        description: error ?? "Failed to delete agreement.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(id, null);
    }
  }

  // ── Copy link ──────────────────────────────────────────────────────────────
  async function copyAgreementLink(agreementId: string) {
    const fullUrl = `${window.location.origin}/SignAgreement/${agreementId}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert("Agreement link copied to clipboard!");
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
  async function downloadAgreement(id: string, dealershipName: string) {
    setDownloadingId(id);
    try {
      const res = await fetch(`/api/admin/dealership-agreements/${id}/pdf`);
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Agreement_${dealershipName.replace(/\s+/g, "_")}_Managed_Sales.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloadingId(null);
    }
  }

  // ── Loading (initial fetch only) ───────────────────────────────────────────
  if (isLoading && agreements.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Dealership Managed Sales Agreements
          </h2>
          <p className="text-slate-600">
            Manage dealership agreements for managed sales service
          </p>
        </div>

        {/* Create modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Dealership Managed Sales Agreement</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateAgreement} className="space-y-6">
              {/* Dealership info */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800">
                  Dealership Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dealership_name">Dealership Name *</Label>
                    <Input
                      id="dealership_name"
                      name="dealership_name"
                      value={formData.dealership_name}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="representative_name">Representative Name *</Label>
                    <Input
                      id="representative_name"
                      name="representative_name"
                      value={formData.representative_name}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="license_number">Business License Number</Label>
                    <Input
                      id="license_number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>

              {/* Service terms */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800">
                  Service Terms
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_fee_amount">Service Fee (JPY) per Vehicle</Label>
                    <Input
                      id="service_fee_amount"
                      name="service_fee_amount"
                      type="number"
                      step="1"
                      placeholder="Varies"
                      value={formData.service_fee_amount}
                      onChange={onChange}
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Leave empty if fee varies per vehicle
                    </p>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="admin_notes">Admin Notes (Internal Only)</Label>
                    <Textarea
                      id="admin_notes"
                      name="admin_notes"
                      value={formData.admin_notes}
                      onChange={onChange}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={!canCreate || isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Agreement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* List / empty state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : agreements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">
              Create your first dealership managed sales agreement
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agreements.map((a) => {
            const viewHref =
              a.status === "signed"
                ? `/ViewDealershipAgreement/${a.id}`
                : `/SignAgreement/${a.id}`;

            const isSending  = submittingIds[a.id] === "send";
            const isEmailing = submittingIds[a.id] === "email";
            const isDeleting = submittingIds[a.id] === "delete";

            return (
              <Card key={a.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800">
                        {a.dealership_name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Representative: {a.representative_name}
                      </p>
                      <p className="text-sm text-slate-500">{a.email}</p>
                    </div>

                    <Badge className={statusBadgeClass(a.status)}>
                      {a.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {/* Meta */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-500">Service Fee:</span>
                      <p className="font-semibold text-slate-800">
                        {a.service_fee_amount
                          ? `¥${Number(a.service_fee_amount).toLocaleString()}`
                          : "Varies per vehicle"}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500">Created:</span>
                      <p className="text-slate-700">
                        {format(new Date(a.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>

                    {a.signed_at ? (
                      <div>
                        <span className="text-slate-500">Signed:</span>
                        <p className="text-slate-700">
                          {format(new Date(a.signed_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Send to Dealership — draft / pending_signature only */}
                    {(a.status === "draft" || a.status === "pending_signature") ? (
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600"
                        onClick={() => handleSendSigningEmail(a.id, a.email, a.status)}
                        disabled={isSending}
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send to Dealership
                      </Button>
                    ) : null}

                    {/* Copy link */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyAgreementLink(a.id)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>

                    {/* View agreement */}
                    <Link href={viewHref}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Agreement
                      </Button>
                    </Link>

                    {/* Send Email (Signed) — signed only */}
                    {a.status === "signed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendAgreementEmail(a.id, a.email)}
                        disabled={isEmailing}
                      >
                        {isEmailing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Email (Signed)
                      </Button>
                    ) : null}

                    {/* Download PDF */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAgreement(a.id, a.dealership_name)}
                      disabled={downloadingId === a.id}
                    >
                      {downloadingId === a.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>

                    {/* Delete */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(a.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
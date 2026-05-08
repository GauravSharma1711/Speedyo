"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Copy, Eye, FileText, Loader2, Plus, Send, XCircle } from "lucide-react";

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
import { useToast } from "@/components/ui/UseToast";

type AgreementStatus = "draft" | "pending_signature" | "signed" | "cancelled";

type DealershipAgreement = {
  id: string;
  dealership_name: string;
  representative_name: string;
  address?: string | null;
  phone?: string | null;
  email: string;
  license_number?: string | null;
  service_fee_amount?: number | null;
  admin_notes?: string | null;

  status: AgreementStatus;
  agreement_url?: string | null;

  created_date: string; // ISO
  signed_at?: string | null; // ISO
};

type FormState = {
  dealership_name: string;
  representative_name: string;
  address: string;
  phone: string;
  email: string;
  license_number: string;
  service_fee_amount: string; // keep as string for the input
  admin_notes: string;
};

const MOCK: DealershipAgreement[] = [
  {
    id: "agr_001",
    dealership_name: "Taka Cars",
    representative_name: "Taka",
    address: "Shibuya, Tokyo",
    phone: "+81-90-1111-2222",
    email: "dealership@takacars.jp",
    license_number: "TK-2025-118",
    service_fee_amount: null,
    admin_notes: "High volume partner.",
    status: "signed",
    agreement_url: "/SignAgreement/agr_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    signed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  {
    id: "agr_002",
    dealership_name: "Ok Motors",
    representative_name: "Ok",
    address: "",
    phone: "",
    email: "ops@okmotors.jp",
    license_number: "",
    service_fee_amount: 200,
    admin_notes: "",
    status: "pending_signature",
    agreement_url: "/SignAgreement/agr_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    signed_at: null,
  },
];

function statusBadgeClass(status: AgreementStatus) {
  if (status === "signed") return "bg-emerald-100 text-emerald-700";
  if (status === "pending_signature") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function makeId() {
  return `agr_${Math.random().toString(16).slice(2, 10)}`;
}

export default function DealershipAgreementManagerUI() {
  const { toast } = useToast();

  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [agreements, setAgreements] = useState<DealershipAgreement[]>(MOCK);

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

  const canCreate = useMemo(() => {
    return (
      formData.dealership_name.trim().length > 0 &&
      formData.representative_name.trim().length > 0 &&
      formData.email.trim().length > 0
    );
  }, [formData]);

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

  async function handleCreateAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setIsSubmitting(true);
    try {
      const id = makeId();
      const fee =
        formData.service_fee_amount.trim() === ""
          ? null
          : Number(formData.service_fee_amount);

      const created: DealershipAgreement = {
        id,
        dealership_name: formData.dealership_name.trim(),
        representative_name: formData.representative_name.trim(),
        address: formData.address.trim() || null,
        phone: formData.phone.trim() || null,
        email: formData.email.trim(),
        license_number: formData.license_number.trim() || null,
        service_fee_amount: Number.isFinite(fee as number) ? fee : null,
        admin_notes: formData.admin_notes.trim() || null,
        status: "draft",
        agreement_url: `/SignAgreement/${id}`,
        created_date: new Date().toISOString(),
        signed_at: null,
      };

      setAgreements((prev) => [created, ...prev]);
      setShowCreateModal(false);
      resetForm();

      toast({
        title: "Agreement created",
        description: "Saved locally — API wiring pending.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendSigningEmail(a: DealershipAgreement) {
    setIsSubmitting(true);
    try {
      setAgreements((prev) =>
        prev.map((x) =>
          x.id === a.id && x.status === "draft"
            ? { ...x, status: "pending_signature" }
            : x,
        ),
      );

      toast({
        title: "Send to dealership",
        description: `Would email ${a.email} a signing link.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendAgreementEmail(a: DealershipAgreement) {
    setIsSubmitting(true);
    try {
      toast({
        title: "Send email",
        description: `Would email ${a.email} the signed/view link.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyAgreementLink(a: DealershipAgreement) {
    const url = a.agreement_url ?? "";
    if (!url) return;

    const fullUrl =
      url.startsWith("http") ? url : `${window.location.origin}${url}`;

    await navigator.clipboard.writeText(fullUrl);
    toast({ title: "Copied", description: "Agreement link copied." });
  }

  async function downloadAgreement(a: DealershipAgreement) {
    setIsSubmitting(true);
    try {
      toast({
        title: "Download PDF ",
        description: "PDF generation wiring pending.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = window.confirm(
      "Are you sure you want to delete this agreement? This action cannot be undone.",
    );
    if (!ok) return;

    setIsSubmitting(true);
    try {
      setAgreements((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "Deleted", description: "Removed locally." });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Dealership Managed Sales Agreements
          </h2>
          <p className="text-slate-600">
            Manage dealership agreements for managed sales service
          </p>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Create New Dealership Managed Sales Agreement
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateAgreement} className="space-y-6">
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
                    <Label htmlFor="representative_name">
                      Representative Name *
                    </Label>
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
                    <Label htmlFor="license_number">
                      Business License Number
                    </Label>
                    <Input
                      id="license_number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={onChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800">
                  Service Terms
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_fee_amount">
                      Service Fee (USD) per Vehicle
                    </Label>
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={!canCreate || isSubmitting}>
                  {isSubmitting ? (
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

      {agreements.length === 0 ? (
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
                : a.agreement_url ?? `/SignAgreement?id=${a.id}`;

            return (
              <Card key={a.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800">
                        {a.dealership_name}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Representative: {a.representative_name}
                      </p>
                    </div>

                    <Badge className={statusBadgeClass(a.status)}>
                      {a.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-500">Service Fee:</span>
                      <p className="font-semibold text-slate-800">
                        {a.service_fee_amount
                          ? `$${a.service_fee_amount.toLocaleString()}`
                          : "Varies per vehicle"}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-500">Created:</span>
                      <p className="text-slate-700">
                        {format(new Date(a.created_date), "MMM d, yyyy")}
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

                  <div className="flex flex-wrap gap-2">
                    {(a.status === "draft" || a.status === "pending_signature") ? (
                      <Button
                        size="sm"
                        onClick={() => handleSendSigningEmail(a)}
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send to Dealership
                      </Button>
                    ) : null}

                    {a.agreement_url ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyAgreementLink(a)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>

                        <Link href={viewHref}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Agreement
                          </Button>
                        </Link>
                      </>
                    ) : null}

                    {a.status === "signed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendAgreementEmail(a)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Email (Signed)
                      </Button>
                    ) : null}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadAgreement(a)}
                      disabled={isSubmitting}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(a.id)}
                      disabled={isSubmitting}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
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
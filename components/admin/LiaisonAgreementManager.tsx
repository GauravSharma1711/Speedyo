"use client";

import { useLiaisonAgreementStore } from "@/store/admin/liaison";
import lisisonAgreementService from "@/services/admin/liaison";
import type { liaisonAgreement, liaisonApplication } from "@/store/admin/liaison";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Copy, Download, Eye, Loader2, Plus, UserCheck, XCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/UseToast";

type FormState = {
  agreement_title: string;
  position_title: string;
  fixed_fee_percentage: string;
  residual_pay_percentage: string;
  agreement_start_date: string;
  agreement_end_date: string;
  termination_notice_days: string;
  admin_notes: string;
};

function badgeClass(status: string) {
  if (status === "signed") return "bg-green-100 text-green-800";
  if (status === "pending_signature") return "bg-amber-100 text-amber-800";
  if (status === "terminated") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

export default function LiaisonAgreementManagerUI() {
  const { toast } = useToast();

  // ── Store ──────────────────────────────────────────────────────────────────
  const {
    agreements,
    isLoading,
    error,
    getAll,
    create,
    delete: deleteAgreement,
  } = useLiaisonAgreementStore();

  useEffect(() => {
    getAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Local UI state ─────────────────────────────────────────────────────────
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingIds, setSubmittingIds] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);


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
  const [selected, setSelected] = useState<{
    agreement: liaisonAgreement;
    application: liaisonApplication;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<FormState>({
    agreement_title: "Speedyo Dealership Partnership Liaison Agreement",
    position_title: "Liaison Agent",
    fixed_fee_percentage: "10",
    residual_pay_percentage: "3",
    agreement_start_date: today,
    agreement_end_date: "",
    termination_notice_days: "30",
    admin_notes: "",
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  const canCreate = useMemo(
    () =>
      formData.agreement_title.trim().length > 0 &&
      formData.position_title.trim().length > 0 &&
      Number(formData.fixed_fee_percentage) >= 0 &&
      Number(formData.residual_pay_percentage) >= 0 &&
      Number(formData.termination_notice_days) > 0,
    [formData],
  );

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      agreement_title: "Speedyo Dealership Partnership Liaison Agreement",
      position_title: "Liaison Agent",
      fixed_fee_percentage: "10",
      residual_pay_percentage: "3",
      agreement_start_date: today,
      agreement_end_date: "",
      termination_notice_days: "30",
      admin_notes: "",
    });
  }


  // ── Create ─────────────────────────────────────────────────────────────────
  async function handleCreateAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setIsSubmitting(true);
    try {
      await create({
        agreement_title: formData.agreement_title.trim(),
        position_title: formData.position_title.trim(),
        fixed_fee_percentage: formData.fixed_fee_percentage,
        residual_pay_percentage: formData.residual_pay_percentage,
        agreement_start_date: formData.agreement_start_date || null,
        agreement_end_date: formData.agreement_end_date || null,
        termination_notice_days: formData.termination_notice_days,
        admin_notes: formData.admin_notes.trim() || null,
        status: "",
        agreement_url: "",
      });

      setShowCreateModal(false);
      resetForm();
      toast({ title: "Agreement created", description: "Agreement saved successfully." });
    } catch {
      toast({
        title: "Error",
        description: error ?? "Failed to create agreement.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
 
  // ── Copy link ──────────────────────────────────────────────────────────────
  async function copyAgreementLink(a: liaisonAgreement) {
    const fullUrl = `${window.location.origin}/ViewLiaisonAgreement/${a.id}`;
    await navigator.clipboard.writeText(fullUrl);
    toast({ title: "Copied", description: "Agreement link copied." });
    alert("Agreement link copied to clipboard!");
  }

  // ── Send email ─────────────────────────────────────────────────────────────
  async function handleSendApplicationEmail(a: liaisonAgreement) {
    setSubmitting(a.id, "email");
    try {
      // TODO: wire real send API
      const res = await lisisonAgreementService.sendMail(a.id);
      toast({ title: "Send email", description: "Would email the liaison the agreement + application summary." });
      alert("Application email sent successfully!");
    } catch {
      alert("Failed to send mail!");
    } finally {
       setSubmitting(a.id, null);
    }
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
  async function handleDownloadPDF(a: liaisonAgreement) {
  setSubmitting(a.id, "download");
  try {
    const blob = await lisisonAgreementService.downloadPdf(a.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Liaison_Agreement_${a.id}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: `Liaison_Agreement_${a.id}.pdf saved.` });
  } catch {
    toast({ title: "Error", description: "Failed to download PDF.", variant: "destructive" });
  } finally {
    setSubmitting(a.id, null);
  }
}

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const ok = window.confirm("Are you sure you want to delete this agreement? This action cannot be undone.");
    if (!ok) return;

    setSubmitting(id, "delete");
    try {
      await deleteAgreement(id);
      await getAll();
      toast({ title: "Deleted", description: "Agreement removed." });
    } catch {
      toast({
        title: "Error",
        description: error ?? "Failed to delete.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(id, null);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Liaison Agreements</h2>
          <p className="text-slate-600">Manage partnership agreements with dealership liaisons</p>
        </div>

        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Liaison Agreement</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agreement_title">Agreement Title</Label>
                  <Input id="agreement_title" name="agreement_title" value={formData.agreement_title} onChange={onChange} required />
                </div>

                <div>
                  <Label htmlFor="position_title">Position Title</Label>
                  <Input id="position_title" name="position_title" value={formData.position_title} onChange={onChange} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fixed_fee_percentage">Fixed Fee Percentage (%)</Label>
                    <Input id="fixed_fee_percentage" name="fixed_fee_percentage" type="number" value={formData.fixed_fee_percentage} onChange={onChange} required />
                  </div>
                  <div>
                    <Label htmlFor="residual_pay_percentage">Residual Pay Percentage (%)</Label>
                    <Input id="residual_pay_percentage" name="residual_pay_percentage" type="number" value={formData.residual_pay_percentage} onChange={onChange} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agreement_start_date">Agreement Start Date</Label>
                    <Input id="agreement_start_date" name="agreement_start_date" type="date" value={formData.agreement_start_date} onChange={onChange} required />
                  </div>
                  <div>
                    <Label htmlFor="agreement_end_date">Agreement End Date</Label>
                    <Input id="agreement_end_date" name="agreement_end_date" type="date" value={formData.agreement_end_date} onChange={onChange} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="termination_notice_days">Termination Notice (Days)</Label>
                  <Input id="termination_notice_days" name="termination_notice_days" type="number" value={formData.termination_notice_days} onChange={onChange} required />
                </div>

                <div>
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea id="admin_notes" name="admin_notes" value={formData.admin_notes} onChange={onChange} rows={3} />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={!canCreate || isSubmitting}>
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : "Create Agreement"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : agreements?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">Create your first liaison agreement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agreements?.map((a) => {


  const isSending     = submittingIds[a.id] === "email";
  const isDownloading = submittingIds[a.id] === "download";
  const isDeleting    = submittingIds[a.id] === "delete";

          const viewHref =
              // a.status === "signed"
                // ? 
                `/ViewLiaisonAgreement/${a.id}`
                // : `/SignAgreement/${a.id}`;

                


return (

            <Card key={a.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800">{a.position_title}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Fixed Fee: {a.fixed_fee_percentage}% | Residual: {a.residual_pay_percentage}%
                    </p>
                  </div>
                  <Badge className={badgeClass(a.status)}>
                    {a.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-slate-500">Start Date:</span>
                    <p className="text-slate-700">
                      {a.agreement_start_date
                        ? format(new Date(a.agreement_start_date), "MMM d, yyyy")
                        : "Not set"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Created:</span>
                    <p className="text-slate-700">{format(new Date(a.createdAt), "MMM d, yyyy")}</p>
                  </div>

                  {/* ✅ Use a.application directly — no separate lookup needed */}
                  {a.application ? (
                    <div className="col-span-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelected({ agreement: a, application: a.application! })}
                        className="w-full"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        View Submitted Application
                      </Button>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.agreement_url ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => copyAgreementLink(a)}>
                        <Copy className="w-4 h-4 mr-2" />Copy Link
                      </Button>

                      <Link
                       href={viewHref}
                       
                        target="_blank"
                        rel="noopener noreferrer"
                      >

                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />View Agreement
                        </Button>
                      </Link>
                    </>
                  ) : null}


                  {a.status === "signed" ? (
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(a)} disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
  {isDownloading ? "Downloading..." : "Download PDF"}
                    </Button>
                  ) : null}

                  <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)} disabled={isDeleting}>
                     {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
  {isDeleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
         );
      })}
        </div>
      )}

      {/* Application detail modal */}
      {selected ? (
        <Dialog open={true} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Liaison Application Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Full Name</Label>
                  <p className="font-medium">{selected.application.full_name}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Email</Label>
                  <p className="font-medium">{selected.application.email}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Phone</Label>
                  <p className="font-medium">{selected.application.phone}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Language Proficiency</Label>
                  <p className="font-medium">
                    {(selected.application.language_proficiency ?? "").replaceAll("_", " ")}
                  </p>
                </div>
              </div>

              {selected.application.address ? (
                <div>
                  <Label className="text-slate-600">Address</Label>
                  <p className="font-medium">{selected.application.address}</p>
                </div>
              ) : null}

              {selected.application.previous_experience ? (
                <div>
                  <Label className="text-slate-600">Previous Experience</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.application.previous_experience}</p>
                </div>
              ) : null}

              {selected.application.automotive_knowledge ? (
                <div>
                  <Label className="text-slate-600">Automotive Knowledge</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.application.automotive_knowledge}</p>
                </div>
              ) : null}

              {selected.application.availability ? (
                <div>
                  <Label className="text-slate-600">Availability</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.application.availability}</p>
                </div>
              ) : null}

              {selected.application.motivation ? (
                <div>
                  <Label className="text-slate-600">Motivation</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selected.application.motivation}</p>
                </div>
              ) : null}

              {selected.application.resume_url ? (
                <div>
                  <Label className="text-slate-600">Resume/CV</Label>
                  <a href={selected.application.resume_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />View Resume
                  </a>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
"use client";
import photographerAgreementService from "@/services/admin/photographer";
    
import { usePhotographerAgreementStore } from "@/store/admin/photographer";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Camera,
  Copy,
  Download,
  Eye,
  Loader2,
  Plus,
  Send,
  UserCheck,
  XCircle,
} from "lucide-react";

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

// ── Re-use the store's types directly ─────────────────────────────────────────
import type {
  PhotographerAgreement,
  PhotographerApplication,
} from "@/store/admin/photographer";

// ── Local form state type ──────────────────────────────────────────────────────
type FormState = {
  agreement_title: string;
  position_title: string;
  fixed_percentage: string;
  agreement_start_date: string;
  agreement_end_date: string;
  termination_notice_days: string;
  admin_notes: string;
  photographer_email: string; // matches store field name
};

// ── Badge colour helper ────────────────────────────────────────────────────────
function badgeClass(status: string) {
  if (status === "signed") return "bg-green-100 text-green-800";
  if (status === "pending_signature") return "bg-amber-100 text-amber-800";
  if (status === "terminated") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

// ── Mock applications (kept local – replace with a real store when ready) ─────
const MOCK_APPLICATIONS: PhotographerApplication[] = [
  {
    id: "papp_001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    full_name: "Hiro Sato",
    email: "hiro.photo@example.com",
    phone: "+81-90-2222-3333",
    photography_experience_years: 5,
    address: "Setagaya, Tokyo",
    automotive_photography_experience: "Shot listings for 3 local dealerships.",
    equipment: "Sony A7IV, 24-70mm, gimbal, lights.",
    availability: "Weekdays (10-4) + weekends",
    location_preferences: "Tokyo / Kanagawa",
    motivation: "Want steady work with dealerships.",
    portfolio_url: "https://example.com/portfolio",
    sample_work_urls: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=70",
      "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=800&q=70",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=70",
    ],
    status: "submitted",
    admin_notes: null,
    reviewed_by_admin_id: null,
    reviewed_at: null,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function PhotographerAgreementManagerUI() {
  const { toast } = useToast();

  // ── Store ──────────────────────────────────────────────────────────────────
  const {
    agreements,
    isLoading,
    error,
    getAll,
    create,
    sendSigningMail,
    delete: deleteAgreement,
    addApplication,
  } = usePhotographerAgreementStore();

  useEffect(() => {
    getAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [applications] = useState<PhotographerApplication[]>(MOCK_APPLICATIONS);
  const [selected, setSelected] = useState<{
    agreement: PhotographerAgreement;
    application: PhotographerApplication;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<FormState>({
    agreement_title: "Speedyo Photographer Partnership Agreement",
    position_title: "Automotive Photographer - Speedyo Platform",
    fixed_percentage: "10",
    agreement_start_date: today,
    agreement_end_date: "",
    termination_notice_days: "30",
    admin_notes: "",
    photographer_email: "",
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  const canCreate = useMemo(
    () =>
      formData.agreement_title.trim().length > 0 &&
      formData.position_title.trim().length > 0 &&
      formData.photographer_email.trim().length > 0 &&
      Number(formData.fixed_percentage) > 0 &&
      Number(formData.termination_notice_days) > 0,
    [formData],
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      agreement_title: "Speedyo Photographer Partnership Agreement",
      position_title: "Automotive Photographer - Speedyo Platform",
      fixed_percentage: "10",
      agreement_start_date: today,
      agreement_end_date: "",
      termination_notice_days: "30",
      admin_notes: "",
      photographer_email: "",
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
        fixed_percentage: formData.fixed_percentage,           // store expects string
        agreement_start_date: formData.agreement_start_date || null,
        agreement_end_date: formData.agreement_end_date || null,
        termination_notice_days: Number(formData.termination_notice_days),
        admin_notes: formData.admin_notes.trim() || null,
        photographer_email: formData.photographer_email.trim(), // correct field name
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
  async function copyAgreementLink(a: PhotographerAgreement) {
    const href = `/PhotographerAgreement?id=${a.id}`;
    const fullUrl = `${window.location.origin}${href}`;
    await navigator.clipboard.writeText(fullUrl);
    // toast({ title: "Copied", description: "Agreement link copied." });
    alert("Agreement link copied to clipboard!:\n");
  }

  // ── View application ───────────────────────────────────────────────────────
  function viewApplication(agreement:PhotographerAgreement, application: PhotographerApplication) {
    // const app = applications.find((x) => x.id === applicationId);
    // const ag = agreements.find((x) => x.application_id === applicationId);

   if (!application) {
  toast({ title: "Not found", description: "Application details missing." });
  return;
}

    if (!agreement) {
      toast({ title: "Not found", description: "Associated agreement not found." });
      return;
    }
    setSelected({ agreement: agreement, application: application });
  }

  // ── Send signing email ─────────────────────────────────────────────────────
  async function handleSendSigningEmail(a: PhotographerAgreement) {
    if (!a.photographer_email) {
      // toast({
      //   title: "Missing email",
      //   description: "Set photographer email when creating the agreement.",
      // });
      alert("Photographer email not found for this agreement. Please ensure an email is set when creating the agreement.")
      return;
    }

    setIsSubmitting(true);
    try {
      toast({
        title: "Send agreement",
        description: `Would email ${a.photographer_email} a signing link.`,
      });
      const res = await sendSigningMail(a.id);
      if(res.success){
        alert("Signing mail send successfully");
      }
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Send application email ─────────────────────────────────────────────────
  async function handleSendApplicationEmail(a: PhotographerAgreement) {
    setIsSubmitting(true);
    try {
        const res  =  await photographerAgreementService.sendMail(a.id);
      toast({
        title: "Send email",
        description: "Would email the photographer the agreement + application summary.",
      });
      alert("Application email sent successfully!");
    } catch{
        alert("Failed to send mail!");
    }finally {
      setIsSubmitting(false);
    }
  }

  // ── Download PDF ───────────────────────────────────────────────────────────
 async function handleDownloadPDF(a: PhotographerAgreement) {
  console.log("Downloading agreement as PDF:", a);
  setIsSubmitting(true);
  try {
    const application = a.application
      

    const termStart = a.agreement_start_date
      ? new Date(a.agreement_start_date).toLocaleDateString()
      : "N/A";
    const termEnd = a.agreement_end_date
      ? new Date(a.agreement_end_date).toLocaleDateString()
      : "indefinite";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Photographer_Agreement_${a.id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Arial, sans-serif;
            color: #1a1a1a;
            padding: 60px 57px;
            max-width: 850px;
            margin: 0 auto;
          }
          h1 { font-size: 22px; font-weight: bold; margin-bottom: 32px; }
          h2 { font-size: 15px; font-weight: bold; margin-top: 28px; margin-bottom: 10px; }
          p { font-size: 13px; line-height: 1.8; padding-left: 14px; color: #1a1a1a; }
        </style>
      </head>
      <body>
        <h1>${a.agreement_title || "Speedyo Photographer Partnership Agreement"}</h1>

        <h2>Position Title</h2>
        <p>${a.position_title || "Automotive Photographer - Speedyo Platform"}</p>

        <h2>Compensation</h2>
        <p>Fixed Percentage: ${a.fixed_percentage ?? "10"}% of service fee</p>
        <p>Payment upon vehicle sale</p>

        <h2>Term</h2>
        <p>Effective from ${termStart} to ${termEnd}</p>
        <p>${a.termination_notice_days ?? 30} days notice required for termination</p>

        ${application ? `
        <h2>Application Information</h2>
        <p>Name: ${application.full_name}</p>
        <p>Email: ${application.email}</p>
        <p>Phone: ${application.phone}</p>
        <p>Experience: ${application.photography_experience_years ?? 0} years</p>
        ` : a.photographer_email ? `
        <h2>Application Information</h2>
        <p>Email: ${a.photographer_email}</p>
        ` : ""}
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Photographer_Agreement_${a.id}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast({ title: "Downloaded", description: `Photographer_Agreement_${a.id}.pdf saved.` });
  } finally {
    setIsSubmitting(false);
  }
}

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    const ok = window.confirm(
      "Are you sure you want to delete this agreement? This action cannot be undone.",
    );
    if (!ok) return;

    setIsSubmitting(true);
    try {
      await deleteAgreement(id); // store removes it from state on success
      await getAll()
      toast({ title: "Deleted", description: "Agreement removed." });
    } catch {
      toast({
        title: "Error",
        description: error ?? "Failed to delete.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Photographer Agreements</h2>
          <p className="text-slate-600">
            Manage partnership agreements with automotive photographers
          </p>
        </div>

        {/* Create modal trigger */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Photographer Agreement</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div className="space-y-4">
                {/* Agreement Title */}
                <div>
                  <Label htmlFor="agreement_title">Agreement Title</Label>
                  <Input
                    id="agreement_title"
                    name="agreement_title"
                    value={formData.agreement_title}
                    onChange={onChange}
                    required
                  />
                </div>

                {/* Position Title */}
                <div>
                  <Label htmlFor="position_title">Position Title</Label>
                  <Input
                    id="position_title"
                    name="position_title"
                    value={formData.position_title}
                    onChange={onChange}
                    required
                  />
                </div>

                {/* Photographer Email — uses correct field name */}
                <div>
                  <Label htmlFor="photographer_email">Photographer Email</Label>
                  <Input
                    id="photographer_email"
                    name="photographer_email"
                    type="email"
                    value={formData.photographer_email}
                    onChange={onChange}
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Email address of the photographer to send the agreement to
                  </p>
                </div>

                {/* Compensation */}
                <div>
                  <Label htmlFor="fixed_percentage">Compensation Percentage (%)</Label>
                  <Input
                    id="fixed_percentage"
                    name="fixed_percentage"
                    type="number"
                    value={formData.fixed_percentage}
                    onChange={onChange}
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Percentage of service fee per vehicle photographed and sold
                  </p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agreement_start_date">Agreement Start Date</Label>
                    <Input
                      id="agreement_start_date"
                      name="agreement_start_date"
                      type="date"
                      value={formData.agreement_start_date}
                      onChange={onChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="agreement_end_date">Agreement End Date</Label>
                    <Input
                      id="agreement_end_date"
                      name="agreement_end_date"
                      type="date"
                      value={formData.agreement_end_date}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Termination notice */}
                <div>
                  <Label htmlFor="termination_notice_days">Termination Notice (Days)</Label>
                  <Input
                    id="termination_notice_days"
                    name="termination_notice_days"
                    type="number"
                    value={formData.termination_notice_days}
                    onChange={onChange}
                    required
                  />
                </div>

                {/* Admin notes */}
                <div>
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    name="admin_notes"
                    value={formData.admin_notes}
                    onChange={onChange}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
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
                    "Create Agreement"
                  )}
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
) :agreements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Camera className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">Create your first photographer agreement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agreements.map((a) => {
            const associatedApplication = a.application_id
              ? applications.find((x) => x.id === a.application_id)
              : undefined;

            return (
              <Card key={a.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800">
                        {a.position_title}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Compensation: {a.fixed_percentage}% of service fee per vehicle
                        photographed and sold
                      </p>
                      {a.photographer_email && (
                        <p className="text-sm text-slate-500 mt-0.5">
                          {a.photographer_email}
                        </p>
                      )}
                    </div>

                    <Badge className={badgeClass(a.status)}>
                      {a.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>

                  {/* Meta grid */}
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
                    
                      <p className="text-slate-700">
                        {format(new Date(a.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>

                    {a.application ? (
                      <div className="col-span-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewApplication(a ,a.application)}
                          className="w-full"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          View Submitted Application
                        </Button>
                      </div>
                    ) : null}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2">
                    {a.agreement_url ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => copyAgreementLink(a)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>

<Link href={`/PhotographerAgreement?id=${a.id}`} target="_blank" rel="noopener noreferrer">

                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Agreement
                          </Button>
                        </Link>
                      </>
                    ) : null}

                    {a.status === "draft" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendSigningEmail(a)}
                        disabled={isSubmitting}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Send Agreement
                      </Button>
                    ) : null}

                    {a.status === "signed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendApplicationEmail(a)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Email
                      </Button>
                    ) : null}

                    {a.status === "signed" ? (
                      <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(a)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    ) : null}

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

      {/* Application detail modal */}
      {selected ? (
        <Dialog open={true} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Photographer Application Details</DialogTitle>
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
                  <Label className="text-slate-600">Experience (Years)</Label>
                  <p className="font-medium">
                    {selected.application.photography_experience_years ?? "—"}
                  </p>
                </div>
              </div>

              {selected.application.address ? (
                <div>
                  <Label className="text-slate-600">Address</Label>
                  <p className="font-medium">{selected.application.address}</p>
                </div>
              ) : null}

              {selected.application.automotive_photography_experience ? (
                <div>
                  <Label className="text-slate-600">Automotive Photography Experience</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.automotive_photography_experience}
                  </p>
                </div>
              ) : null}

              {selected.application.equipment ? (
                <div>
                  <Label className="text-slate-600">Equipment</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.equipment}
                  </p>
                </div>
              ) : null}

              {selected.application.availability ? (
                <div>
                  <Label className="text-slate-600">Availability</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.availability}
                  </p>
                </div>
              ) : null}

              {selected.application.location_preferences ? (
                <div>
                  <Label className="text-slate-600">Location Preferences</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.location_preferences}
                  </p>
                </div>
              ) : null}

              {selected.application.motivation ? (
                <div>
                  <Label className="text-slate-600">Motivation</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.motivation}
                  </p>
                </div>
              ) : null}

              {selected.application.portfolio_url ? (
                <div>
                  <Label className="text-slate-600">Portfolio</Label>
                  <a
                    href={selected.application.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    View Portfolio
                  </a>
                </div>
              ) : null}

              {selected.application.sample_work_urls?.length ? (
                <div>
                  <Label className="text-slate-600">Sample Work</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selected.application.sample_work_urls.map((url, idx) => (
                      <img
                        key={`${url}-${idx}`}
                        src={url}
                        alt={`Sample ${idx + 1}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
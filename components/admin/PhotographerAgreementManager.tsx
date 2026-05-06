"use client";

import React, { useMemo, useState } from "react";
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

type PhotographerAgreementStatus = "draft" | "pending_signature" | "signed" | "terminated";

type PhotographerApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

type PhotographerApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  photography_experience_years?: number | null;
  address?: string | null;
  automotive_photography_experience?: string | null;
  equipment?: string | null;
  availability?: string | null;
  location_preferences?: string | null;
  motivation?: string | null;
  portfolio_url?: string | null;
  sample_work_urls?: string[] | null;
  status: PhotographerApplicationStatus;
};

type PhotographerAgreement = {
  id: string;
  agreement_title: string;
  position_title: string;
  fixed_percentage: number;
  agreement_start_date?: string | null; // YYYY-MM-DD
  agreement_end_date?: string | null; // YYYY-MM-DD
  termination_notice_days: number;
  admin_notes?: string | null;
  email?: string | null; // photographer email to send agreement to

  status: PhotographerAgreementStatus;
  agreement_url?: string | null;

  created_date: string; // ISO
  application_id?: string | null;
};

type FormState = {
  agreement_title: string;
  position_title: string;
  fixed_percentage: string;
  agreement_start_date: string;
  agreement_end_date: string;
  termination_notice_days: string;
  admin_notes: string;
  email: string;
};

const MOCK_APPLICATIONS: PhotographerApplication[] = [
  {
    id: "papp_001",
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
  },
];

const MOCK_AGREEMENTS: PhotographerAgreement[] = [
  {
    id: "ph_001",
    agreement_title: "Speedio Photographer Partnership Agreement",
    position_title: "Automotive Photographer - Speedio Platform",
    fixed_percentage: 10,
    agreement_start_date: new Date().toISOString().slice(0, 10),
    agreement_end_date: "",
    termination_notice_days: 30,
    admin_notes: "Strong portfolio.",
    email: "hiro.photo@example.com",
    status: "draft",
    agreement_url: "/PhotographerAgreement?id=ph_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    application_id: "papp_001",
  },
  {
    id: "ph_002",
    agreement_title: "Speedio Photographer Partnership Agreement",
    position_title: "Automotive Photographer - Osaka",
    fixed_percentage: 12,
    agreement_start_date: new Date().toISOString().slice(0, 10),
    agreement_end_date: "",
    termination_notice_days: 30,
    admin_notes: "",
    email: "osaka.photog@example.com",
    status: "signed",
    agreement_url: "/PhotographerAgreement?id=ph_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    application_id: null,
  },
];

function badgeClass(status: PhotographerAgreementStatus) {
  if (status === "signed") return "bg-green-100 text-green-800";
  if (status === "pending_signature") return "bg-amber-100 text-amber-800";
  if (status === "terminated") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export default function PhotographerAgreementManagerUI() {
  const { toast } = useToast();

  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [agreements, setAgreements] = useState<PhotographerAgreement[]>(MOCK_AGREEMENTS);
  const [applications] = useState<PhotographerApplication[]>(MOCK_APPLICATIONS);

  const [selected, setSelected] = useState<{
    agreement: PhotographerAgreement;
    application: PhotographerApplication;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<FormState>({
    agreement_title: "Speedio Photographer Partnership Agreement",
    position_title: "Automotive Photographer - Speedio Platform",
    fixed_percentage: "10",
    agreement_start_date: today,
    agreement_end_date: "",
    termination_notice_days: "30",
    admin_notes: "",
    email: "",
  });

  const canCreate = useMemo(() => {
    return (
      formData.agreement_title.trim().length > 0 &&
      formData.position_title.trim().length > 0 &&
      formData.email.trim().length > 0 &&
      Number(formData.fixed_percentage) > 0 &&
      Number(formData.termination_notice_days) > 0
    );
  }, [formData]);

  function onChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setFormData({
      agreement_title: "Speedio Photographer Partnership Agreement",
      position_title: "Automotive Photographer - Speedio Platform",
      fixed_percentage: "10",
      agreement_start_date: today,
      agreement_end_date: "",
      termination_notice_days: "30",
      admin_notes: "",
      email: "",
    });
  }

  async function handleCreateAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setIsSubmitting(true);
    try {
      const id = makeId("ph");
      const created: PhotographerAgreement = {
        id,
        agreement_title: formData.agreement_title.trim(),
        position_title: formData.position_title.trim(),
        fixed_percentage: Number(formData.fixed_percentage) || 10,
        agreement_start_date: formData.agreement_start_date || null,
        agreement_end_date: formData.agreement_end_date || null,
        termination_notice_days: Number(formData.termination_notice_days) || 30,
        admin_notes: formData.admin_notes.trim() || null,
        email: formData.email.trim(),
        status: "draft",
        agreement_url: `/PhotographerAgreement?id=${id}`,
        created_date: new Date().toISOString(),
        application_id: null,
      };

      setAgreements((prev) => [created, ...prev]);
      setShowCreateModal(false);
      resetForm();

      toast({
        title: "Agreement created",
        description: "Draft saved locally — API wiring pending.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyAgreementLink(a: PhotographerAgreement) {
    const href = `/PhotographerAgreement?id=${a.id}`;
    const fullUrl = `${window.location.origin}${href}`;
    await navigator.clipboard.writeText(fullUrl);
    toast({ title: "Copied", description: "Agreement link copied." });
  }

  function viewApplication(applicationId: string) {
    const app = applications.find((x) => x.id === applicationId);
    const ag = agreements.find((x) => x.application_id === applicationId);

    if (!app) {
      toast({ title: "Not found", description: "Application details missing." });
      return;
    }
    if (!ag) {
      toast({
        title: "Not found",
        description: "Associated agreement not found for this application.",
      });
      return;
    }

    setSelected({ agreement: ag, application: app });
  }

  async function handleSendSigningEmail(a: PhotographerAgreement) {
    if (!a.email) {
      toast({
        title: "Missing email",
        description: "Set photographer email when creating the agreement.",
      });
      return;
    }

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
        title: "Send agreement",
        description: `Would email ${a.email} a signing link.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendApplicationEmail(a: PhotographerAgreement) {
    setIsSubmitting(true);
    try {
      toast({
        title: "Send email",
        description: "Would email the photographer the agreement + application summary.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDownloadPDF(a: PhotographerAgreement) {
    setIsSubmitting(true);
    try {
      toast({
        title: "Download PDF",
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
          <h2 className="text-2xl font-bold text-slate-800">Photographer Agreements</h2>
          <p className="text-slate-600">
            Manage partnership agreements with automotive photographers
          </p>
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
              <DialogTitle>Create New Photographer Agreement</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div className="space-y-4">
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

                <div>
                  <Label htmlFor="email">Photographer Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onChange}
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">
                    Email address of the photographer to send the agreement to
                  </p>
                </div>

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
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
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

      {agreements.length === 0 ? (
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
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800">{a.position_title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Compensation: {a.fixed_percentage}% of service fee per vehicle photographed and sold
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
                      <p className="text-slate-700">
                        {format(new Date(a.created_date), "MMM d, yyyy")}
                      </p>
                    </div>

                    {a.application_id ? (
                      <div className="col-span-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewApplication(a.application_id as string)}
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
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>

                        <Link href={`/ViewPhotographerAgreement/${a.id}`}>
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
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Agreement
                      </Button>
                    ) : null}

                    {a.status === "signed" && a.application_id && associatedApplication ? (
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

                    <Button size="sm" variant="destructive" onClick={() => handleDelete(a.id)}>
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
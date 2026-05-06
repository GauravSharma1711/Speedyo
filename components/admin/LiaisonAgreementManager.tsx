"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
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

type LiaisonAgreementStatus = "pending_signature" | "signed" | "terminated" | "draft";

type LiaisonApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

type LiaisonApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address?: string | null;
  language_proficiency?: string | null;
  previous_experience?: string | null;
  automotive_knowledge?: string | null;
  availability?: string | null;
  motivation?: string | null;
  resume_url?: string | null;
  status: LiaisonApplicationStatus;
};

type LiaisonAgreement = {
  id: string;
  agreement_title: string;
  position_title: string;

  fixed_fee_percentage: number;
  residual_pay_percentage: number;

  agreement_start_date?: string | null; // YYYY-MM-DD
  agreement_end_date?: string | null; // YYYY-MM-DD
  termination_notice_days: number;

  admin_notes?: string | null;

  status: LiaisonAgreementStatus;
  agreement_url?: string | null;

  created_date: string; // ISO
  application_id?: string | null;
};

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

const MOCK_APPLICATIONS: LiaisonApplication[] = [
  {
    id: "app_001",
    full_name: "Yuki Tanaka",
    email: "yuki@example.com",
    phone: "+81-90-0000-1111",
    address: "Meguro, Tokyo",
    language_proficiency: "native_japanese_fluent_english",
    previous_experience: "Worked at a dealership for 2 years.",
    automotive_knowledge: "Comfortable with inspections and basic diagnostics.",
    availability: "Weekends + weekday evenings",
    motivation: "Want to help expats buy cars in Japan.",
    resume_url: "https://example.com/resume.pdf",
    status: "submitted",
  },
];

const MOCK_AGREEMENTS: LiaisonAgreement[] = [
  {
    id: "lia_001",
    agreement_title: "Speedio Dealership Partnership Liaison Agreement",
    position_title: "Liaison Agent",
    fixed_fee_percentage: 10,
    residual_pay_percentage: 3,
    agreement_start_date: new Date().toISOString().slice(0, 10),
    agreement_end_date: "",
    termination_notice_days: 30,
    admin_notes: "Good candidate pool expected.",
    status: "signed",
    agreement_url: "/LiaisonAgreement?id=lia_001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    application_id: "app_001",
  },
  {
    id: "lia_002",
    agreement_title: "Speedio Dealership Partnership Liaison Agreement",
    position_title: "Liaison Agent (Osaka)",
    fixed_fee_percentage: 12,
    residual_pay_percentage: 2,
    agreement_start_date: new Date().toISOString().slice(0, 10),
    agreement_end_date: "",
    termination_notice_days: 30,
    admin_notes: "",
    status: "pending_signature",
    agreement_url: "/LiaisonAgreement?id=lia_002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    application_id: null,
  },
];

function badgeClass(status: LiaisonAgreementStatus) {
  if (status === "signed") return "bg-green-100 text-green-800";
  if (status === "pending_signature") return "bg-amber-100 text-amber-800";
  if (status === "terminated") return "bg-red-100 text-red-800";
  return "bg-slate-100 text-slate-800";
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`;
}

export default function LiaisonAgreementManagerUI() {
  const { toast } = useToast();

  const [isLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [agreements, setAgreements] = useState<LiaisonAgreement[]>(MOCK_AGREEMENTS);
  const [applications] = useState<LiaisonApplication[]>(MOCK_APPLICATIONS);

  const [selected, setSelected] = useState<{
    agreement: LiaisonAgreement;
    application: LiaisonApplication;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<FormState>({
    agreement_title: "Speedio Dealership Partnership Liaison Agreement",
    position_title: "Liaison Agent",
    fixed_fee_percentage: "10",
    residual_pay_percentage: "3",
    agreement_start_date: today,
    agreement_end_date: "",
    termination_notice_days: "30",
    admin_notes: "",
  });

  const canCreate = useMemo(() => {
    return (
      formData.agreement_title.trim().length > 0 &&
      formData.position_title.trim().length > 0 &&
      Number(formData.fixed_fee_percentage) >= 0 &&
      Number(formData.residual_pay_percentage) >= 0 &&
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
      agreement_title: "Speedio Dealership Partnership Liaison Agreement",
      position_title: "Liaison Agent",
      fixed_fee_percentage: "10",
      residual_pay_percentage: "3",
      agreement_start_date: today,
      agreement_end_date: "",
      termination_notice_days: "30",
      admin_notes: "",
    });
  }

  async function handleCreateAgreement(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;

    setIsSubmitting(true);
    try {
      const id = makeId("lia");
      const created: LiaisonAgreement = {
        id,
        agreement_title: formData.agreement_title.trim(),
        position_title: formData.position_title.trim(),
        fixed_fee_percentage: Number(formData.fixed_fee_percentage) || 0,
        residual_pay_percentage: Number(formData.residual_pay_percentage) || 0,
        agreement_start_date: formData.agreement_start_date || null,
        agreement_end_date: formData.agreement_end_date || null,
        termination_notice_days: Number(formData.termination_notice_days) || 30,
        admin_notes: formData.admin_notes.trim() || null,
        status: "pending_signature",
        agreement_url: `/LiaisonAgreement?id=${id}`,
        created_date: new Date().toISOString(),
        application_id: null,
      };

      setAgreements((prev) => [created, ...prev]);
      setShowCreateModal(false);
      resetForm();

      toast({
        title: "Agreement created ",
        description: "Share the link ",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyAgreementLink(a: LiaisonAgreement) {
    const href = `/LiaisonAgreement?id=${a.id}`;
    const fullUrl = `${window.location.origin}${href}`;
    await navigator.clipboard.writeText(fullUrl);
    toast({ title: "Copied", description: "Agreement link copied." });
  }

  async function handleDownloadPDF(a: LiaisonAgreement) {
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

  async function handleSendApplicationEmail(a: LiaisonAgreement) {
    setIsSubmitting(true);
    try {
      toast({
        title: "Send email",
        description: "Would email the liaison the agreement + application summary.",
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
          <h2 className="text-2xl font-bold text-slate-800">Liaison Agreements</h2>
          <p className="text-slate-600">
            Manage partnership agreements with dealership liaisons
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
              <DialogTitle>Create New Liaison Agreement</DialogTitle>
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
                  />
                </div>

                <div>
                  <Label htmlFor="position_title">Position Title</Label>
                  <Input
                    id="position_title"
                    name="position_title"
                    value={formData.position_title}
                    onChange={onChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fixed_fee_percentage">Fixed Fee Percentage (%)</Label>
                    <Input
                      id="fixed_fee_percentage"
                      name="fixed_fee_percentage"
                      type="number"
                      value={formData.fixed_fee_percentage}
                      onChange={onChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="residual_pay_percentage">
                      Residual Pay Percentage (%)
                    </Label>
                    <Input
                      id="residual_pay_percentage"
                      name="residual_pay_percentage"
                      type="number"
                      value={formData.residual_pay_percentage}
                      onChange={onChange}
                    />
                  </div>
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
            <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">Create your first liaison agreement</p>
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

                        <Link href={`/ViewLiaisonAgreement/${a.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Agreement
                          </Button>
                        </Link>
                      </>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(a)}
                        disabled={isSubmitting}
                      >
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
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.previous_experience}
                  </p>
                </div>
              ) : null}

              {selected.application.automotive_knowledge ? (
                <div>
                  <Label className="text-slate-600">Automotive Knowledge</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.automotive_knowledge}
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

              {selected.application.motivation ? (
                <div>
                  <Label className="text-slate-600">Motivation</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {selected.application.motivation}
                  </p>
                </div>
              ) : null}

              {selected.application.resume_url ? (
                <div>
                  <Label className="text-slate-600">Resume/CV</Label>
                  <a
                    href={selected.application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    View Resume
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
"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/UseToast";

type AgreementStatus = "draft" | "sent" | "signed";

type LiaisonAgreementRow = {
  id: string;
  status: AgreementStatus;

  agreement_title?: string;
  position_title?: string;

  fixed_fee_percentage?: number;
  residual_pay_percentage?: number;

  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
  termination_notice_days?: number;

  application_id?: string | null;
};

type LiaisonApplicationDraft = {
  full_name: string;
  email: string;
  phone: string;
  address: string;

  language_proficiency: string;
  previous_experience: string;
  automotive_knowledge: string;
  availability: string;
  motivation: string;

  resume_url: string;
};

const MOCK_AGREEMENTS: LiaisonAgreementRow[] = [
  {
    id: "lia_001",
    status: "draft",
    agreement_title: "Speedio Dealership Partnership Liaison Agreement",
    position_title: "Liaison Agent ",
    fixed_fee_percentage: 10,
    residual_pay_percentage: 3,
    agreement_start_date: "2026-01-01",
    agreement_end_date: "2026-12-31",
    termination_notice_days: 30,
    application_id: null,
  },
  {
    id: "lia_002",
    status: "signed",
    agreement_title: "Speedio Dealership Partnership Liaison Agreement",
    position_title: "Dealership Liaison Agent (Contract)",
    fixed_fee_percentage: 10,
    residual_pay_percentage: 2,
    agreement_start_date: "2026-01-01",
    agreement_end_date: "2026-12-31",
    termination_notice_days: 30,
    application_id: "app_lia_002",
  },
];

export default function ViewLiaisonAgreementUI() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();

  const agreement = useMemo(() => {
    const id = params?.id;
    if (!id) return null;
    return MOCK_AGREEMENTS.find((a) => a.id === id) ?? null;
  }, [params?.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [applicationData, setApplicationData] = useState<LiaisonApplicationDraft>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    language_proficiency: "",
    previous_experience: "",
    automotive_knowledge: "",
    availability: "",
    motivation: "",
    resume_url: "",
  });

  // UI-only "loading" while params resolve
  if (!params?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Agreement Not Found</h2>
              <p className="text-slate-600 mb-6">
                No agreement found for id: <strong>{params.id}</strong>
              </p>
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof LiaisonApplicationDraft, value: string) => {
    setApplicationData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const url = URL.createObjectURL(file);
      setApplicationData((prev) => ({ ...prev, resume_url: url }));
      toast({ title: "Resume added (UI-only)", description: "Local preview only. API later." });
    } finally {
      setUploadingResume(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast({
        title: "Please accept the terms",
        description: "Accept the agreement terms to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({
        title: "Submitted (UI-only)",
        description: "Application saved locally. API wiring pending.",
      });
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success view (matches your original behavior)
  if (isSuccess || agreement.status === "signed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full"
          >
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-emerald-800 mb-2">
                  Application Submitted Successfully!
                </h2>
                <p className="text-slate-700 mb-6">
                  Thank you for your application. Our team will review it and contact you within 3-5 business days.
                </p>
                <Button
                  onClick={() => router.push("/")}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                >
                  Return to Home
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Agreement Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <CardTitle className="text-2xl">
                    {agreement.agreement_title || "Speedio Dealership Partnership Liaison Agreement"}
                  </CardTitle>
                  <p className="text-blue-100 mt-1">Review the agreement terms below</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <div className="prose prose-slate max-w-none">
                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Purpose</h3>
                  <p className="text-slate-700">
                    This agreement defines the role, responsibilities, compensation, and expectations of the Liaison
                    assisting Speedio with dealership communications, translation, and partnership development.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Position Title</h3>
                  <p className="text-slate-700 font-medium">{agreement.position_title}</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Responsibilities</h3>
                  <p className="text-slate-700 mb-2">The Liaison agrees to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>
                      Serve as an interpreter during meetings and communications between Speedio and Japanese dealerships.
                    </li>
                    <li>
                      Accurately translate between Japanese and English without omission, misrepresentation, or alteration of meaning.
                    </li>
                    <li>Maintain full confidentiality of all Speedio and dealership communications.</li>
                    <li>Assist with the documentation and submission of dealership vehicle information for listing on the Speedio platform.</li>
                    <li>Support communication and coordination between Speedio and participating dealerships, ensuring smooth onboarding and continued engagement.</li>
                    <li>Represent Speedio in a professional manner that upholds the company&apos;s values of integrity, trust, and transparency.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Compensation</h3>
                  <div className="space-y-3 text-slate-700">
                    <p>
                      <strong>Fixed Fee:</strong> {agreement.fixed_fee_percentage}% of the service fee for each assisted sale.
                    </p>
                    <p>
                      <strong>Residual Pay:</strong> {agreement.residual_pay_percentage}% of the service fee for all subsequent sales generated from dealerships
                      for which the Liaison is credited with the assisted sale.
                    </p>
                    <p>
                      <strong>Payment Frequency:</strong> Compensation will be paid upon successful sale of the associated vehicles.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">Definition of Assisted Sale:</p>
                      <p>
                        An assisted sale is defined as a dealership partnership secured through the Liaison&apos;s participation in meetings, communications,
                        or negotiations that result in a dealership listing vehicles through Speedio&apos;s Managed Sales Service or related offerings.
                      </p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <p className="font-semibold mb-2">Eligibility Conditions:</p>
                      <p>To remain eligible for compensation and residual payments:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>The Liaison must be actively assisting Speedio within 30 calendar days prior to the sale.</li>
                        <li>
                          If the Liaison becomes inactive or no longer participates in dealership outreach during this period, residual payment eligibility
                          will transfer to the newly assigned Liaison responsible for the dealership.
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Confidentiality</h3>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      The Liaison shall not disclose or use any proprietary information regarding Speedio, its partners, dealerships, or customers for personal
                      benefit or outside purposes.
                    </p>
                    <p>All materials, data, and communications remain the exclusive property of Speedio.</p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Term and Termination</h3>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      This agreement shall remain in effect from{" "}
                      <strong>
                        {agreement.agreement_start_date
                          ? new Date(agreement.agreement_start_date).toLocaleDateString()
                          : "___________"}
                      </strong>{" "}
                      to{" "}
                      <strong>
                        {agreement.agreement_end_date
                          ? new Date(agreement.agreement_end_date).toLocaleDateString()
                          : "___________"}
                      </strong>
                      , unless terminated earlier by either party with{" "}
                      <strong>{agreement.termination_notice_days || 30}</strong> days&apos; written notice.
                    </p>
                    <p>
                      Speedio reserves the right to terminate this agreement immediately in cases of misconduct, breach of confidentiality, or misrepresentation.
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Application</CardTitle>
              <p className="text-slate-600 text-sm">Please provide your information to apply for this position.</p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input id="full_name" name="full_name" value={applicationData.full_name} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" name="email" type="email" value={applicationData.email} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input id="phone" name="phone" value={applicationData.phone} onChange={handleInputChange} required />
                  </div>

                  <div>
                    <Label htmlFor="language_proficiency">Language Proficiency *</Label>
                    <Select
                      value={applicationData.language_proficiency}
                      onValueChange={(value) => handleSelectChange("language_proficiency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select proficiency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="native_both">Native in Both Languages</SelectItem>
                        <SelectItem value="fluent_both">Fluent in Both Languages</SelectItem>
                        <SelectItem value="business_level">Business Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={applicationData.address} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="previous_experience">Previous Translation/Interpretation Experience</Label>
                  <Textarea id="previous_experience" name="previous_experience" value={applicationData.previous_experience} onChange={handleInputChange} rows={3} />
                </div>

                <div>
                  <Label htmlFor="automotive_knowledge">Automotive Industry Knowledge</Label>
                  <Textarea id="automotive_knowledge" name="automotive_knowledge" value={applicationData.automotive_knowledge} onChange={handleInputChange} rows={3} />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Textarea id="availability" name="availability" value={applicationData.availability} onChange={handleInputChange} rows={2} />
                </div>

                <div>
                  <Label htmlFor="motivation">Why do you want to join as a liaison? *</Label>
                  <Textarea id="motivation" name="motivation" value={applicationData.motivation} onChange={handleInputChange} rows={4} required />
                </div>

                <div>
                  <Label htmlFor="resume">Upload Resume/CV (Optional)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
                    {uploadingResume ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  </div>
                  {applicationData.resume_url ? (
                    <p className="text-sm text-emerald-600 mt-2">✓ Resume uploaded successfully</p>
                  ) : null}
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(Boolean(v))} />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the terms and conditions outlined in the Speedio Dealership Partnership Liaison Agreement above.
                  </Label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  disabled={isSubmitting || !termsAccepted}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Accept & Submit Application"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
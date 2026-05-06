"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Checkbox } from "@/components/ui/checkbox";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/components/ui/UseToast";

type AgreementStatus = "draft" | "sent" | "signed";

type PhotographerAgreementRow = {
  id: string;
  status: AgreementStatus;
  agreement_title?: string;
  position_title?: string;
  fixed_percentage?: number;
  agreement_start_date?: string | null;
  agreement_end_date?: string | null;
  termination_notice_days?: number;
  application_id?: string | null;
};

type PhotographerApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  photography_experience_years: number;
  automotive_photography_experience: string;
  portfolio_url: string;
  equipment: string;
  availability: string;
  location_preferences: string;
  motivation: string;
  sample_work_urls: string[];
};

const MOCK_AGREEMENTS: PhotographerAgreementRow[] = [
  {
    id: "ph_001",
    status: "draft",
    agreement_title: "Speedio Photographer Partnership Agreement",
    position_title: "Automotive Photographer (Contract)",
    fixed_percentage: 10,
    agreement_start_date: "2026-01-01",
    agreement_end_date: "2026-12-31",
    termination_notice_days: 30,
    application_id: null,
  },
  {
    id: "ph_002",
    status: "draft",
    agreement_title: "Speedio Photographer Partnership Agreement",
    position_title: "Automotive Photographer (Contract)",
    fixed_percentage: 10,
    agreement_start_date: "2026-01-01",
    agreement_end_date: "2026-12-31",
    termination_notice_days: 30,
    application_id: null,
  }
];

const MOCK_APPLICATIONS: PhotographerApplicationRow[] = [
  {
    id: "app_002",
    full_name: "Kevin Phillips",
    email: "kevin@example.com",
    phone: "+81 90-0000-0000",
    address: "Okinawa, Japan",
    photography_experience_years: 5,
    automotive_photography_experience: "Shoots for dealerships and private sellers.",
    portfolio_url: "https://example.com/portfolio",
    equipment: "Sony A7 series, 24-70mm, gimbal, LED panels",
    availability: "Weekends + weekday evenings",
    location_preferences: "Naha / Chatan / Ginowan",
    motivation: "Love cars and building a portfolio with Speedio.",
    sample_work_urls: [],
  },
];

export default function ViewPhotographerAgreementUI() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();

  const agreement = useMemo(() => {
    const id = params?.id;
    if (!id) return null;
    return MOCK_AGREEMENTS.find((a) => a.id === id) ?? null;
  }, [params?.id]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [uploadingSamples, setUploadingSamples] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const submittedApplication = useMemo(() => {
    if (!agreement?.application_id) return null;
    return MOCK_APPLICATIONS.find((x) => x.id === agreement.application_id) ?? null;
  }, [agreement?.application_id]);

  const [applicationData, setApplicationData] = useState<PhotographerApplicationRow>({
    id: "app_new",
    full_name: "",
    email: "",
    phone: "",
    address: "",
    photography_experience_years: 0,
    automotive_photography_experience: "",
    portfolio_url: "",
    equipment: "",
    availability: "",
    location_preferences: "",
    motivation: "",
    sample_work_urls: [],
  });

  // UI-only: pretend loading while params resolve
  if (!params?.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading agreement...</p>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Agreement Not Found</h2>
            <p className="text-slate-600 mb-4">No agreement found for id: {params.id}</p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Signed success view (UI-only)
  if (agreement.status === "signed" && agreement.application_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                  Application Submitted Successfully!
                </h1>
                <p className="text-slate-600 mb-6">
                  Thank you for your interest in becoming a Speedio photographer.
                  Your application has been received and is under review.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700">
                    We&apos;ll contact you at{" "}
                    <strong>{submittedApplication?.email || "your provided email address"}</strong>{" "}
                    with next steps.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // Form helpers (UI-only)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData((prev) => ({ ...prev, [name]: value } as any));
  };

  const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPortfolio(true);
    try {
      const url = URL.createObjectURL(file);
      setApplicationData((prev) => ({ ...prev, portfolio_url: url }));
      toast({ title: "Portfolio added (UI-only)", description: "Local preview only. API later." });
    } finally {
      setUploadingPortfolio(false);
      e.target.value = "";
    }
  };

  const handleSampleWorkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingSamples(true);
    try {
      const urls = files.map((f) => URL.createObjectURL(f));
      setApplicationData((prev) => ({ ...prev, sample_work_urls: [...prev.sample_work_urls, ...urls] }));
      toast({ title: "Samples added (UI-only)", description: "Local preview only. API later." });
    } finally {
      setUploadingSamples(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast({ title: "Accept terms", description: "Please accept agreement terms to continue.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      toast({
        title: "Submitted (UI-only)",
        description: "Application stored locally. API wiring pending.",
      });
      // In UI-only mode we don’t mutate agreement status; you can do local setAgreement if you want.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Agreement Card */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <CardTitle className="text-2xl">
                    {agreement.agreement_title || "Speedio Photographer Partnership Agreement"}
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
                    This agreement defines the role, responsibilities, compensation, and expectations of the Photographer
                    providing automotive photography services for Speedio&apos;s managed sales vehicles.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Position Title</h3>
                  <p className="text-slate-700 font-medium">{agreement.position_title || "Photographer"}</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Responsibilities</h3>
                  <p className="text-slate-700 mb-2">The Photographer agrees to:</p>
                  <ul className="list-disc pl-6 space-y-2 text-slate-700">
                    <li>Provide professional automotive photography services for vehicles listed through Speedio.</li>
                    <li>Deliver high-quality images that accurately represent vehicle condition and features.</li>
                    <li>Complete photo shoots within agreed timeframes and at specified locations.</li>
                    <li>Provide a comprehensive photo package including exterior, interior, engine bay, and detail shots.</li>
                    <li>Maintain professional equipment and ensure technical quality of all deliverables.</li>
                    <li>Communicate schedule availability and coordinate with Speedio team for bookings.</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Compensation</h3>
                  <div className="space-y-3 text-slate-700">
                    <p>
                      <strong>Fixed Percentage:</strong> {agreement.fixed_percentage ?? 10}% of the Speedio service fee.
                    </p>
                    <p><strong>Payment Timing:</strong> Paid upon successful sale of the vehicle.</p>
                    <p>
                      <strong>Example:</strong> If Speedio charges a $500 service fee, you receive{" "}
                      {(((agreement.fixed_percentage ?? 10) * 5) as number).toFixed(0)}.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Term and Termination</h3>
                  <div className="space-y-2 text-slate-700">
                    <p>
                      Term:{" "}
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
                    </p>
                    <p>
                      Termination notice: <strong>{agreement.termination_notice_days ?? 30}</strong> days.
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
              <p className="text-slate-600 text-sm">
                Please provide your information and portfolio to apply for this position.
              </p>
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
                    <Label htmlFor="photography_experience_years">Photography Experience (Years) *</Label>
                    <Input
                      id="photography_experience_years"
                      name="photography_experience_years"
                      type="number"
                      value={applicationData.photography_experience_years}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={applicationData.address} onChange={handleInputChange} />
                </div>

                <div>
                  <Label htmlFor="automotive_photography_experience">Automotive Photography Experience</Label>
                  <Textarea
                    id="automotive_photography_experience"
                    name="automotive_photography_experience"
                    value={applicationData.automotive_photography_experience}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="equipment">Photography Equipment</Label>
                  <Textarea id="equipment" name="equipment" value={applicationData.equipment} onChange={handleInputChange} rows={3} />
                </div>

                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Textarea id="availability" name="availability" value={applicationData.availability} onChange={handleInputChange} rows={2} />
                </div>

                <div>
                  <Label htmlFor="location_preferences">Location Preferences</Label>
                  <Textarea
                    id="location_preferences"
                    name="location_preferences"
                    value={applicationData.location_preferences}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Why do you want to join as a photographer? *</Label>
                  <Textarea id="motivation" name="motivation" value={applicationData.motivation} onChange={handleInputChange} rows={4} required />
                </div>

                <div>
                  <Label htmlFor="portfolio">Upload Portfolio (Optional)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="portfolio" type="file" accept=".pdf,.doc,.docx,image/*" onChange={handlePortfolioUpload} disabled={uploadingPortfolio} />
                    {uploadingPortfolio ? <Loader2 className="w-5 h-5 mr-2 animate-spin text-slate-500" /> : null}
                  </div>
                  {applicationData.portfolio_url ? (
                    <p className="text-sm text-emerald-600 mt-2">✓ Portfolio added</p>
                  ) : null}
                </div>

                <div>
                  <Label htmlFor="sample_work">Upload Sample Work (Optional, multiple files)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input id="sample_work" type="file" accept="image/*" multiple onChange={handleSampleWorkUpload} disabled={uploadingSamples} />
                    {uploadingSamples ? <Loader2 className="w-5 h-5 mr-2 animate-spin text-slate-500" /> : null}
                  </div>

                  {applicationData.sample_work_urls.length > 0 ? (
                    <div className="mt-3">
                      <p className="text-sm text-emerald-600 mb-2">
                        ✓ {applicationData.sample_work_urls.length} sample(s) added
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {applicationData.sample_work_urls.map((url, index) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={index} src={url} alt={`Sample ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                  <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(Boolean(v))} />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I have read and agree to the terms and conditions outlined in the Speedio Photographer Partnership Agreement above.
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
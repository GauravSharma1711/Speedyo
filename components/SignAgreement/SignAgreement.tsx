"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/Badge";

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

  status: AgreementStatus;
  signed_by_name?: string | null;
  signed_at?: string | null;
};

const MOCK_DB: Record<string, DealershipAgreement> = {
  agr_001: {
    id: "agr_001",
    dealership_name: "Taka Cars",
    representative_name: "Taka",
    address: "Shibuya, Tokyo",
    phone: "+81-90-1111-2222",
    email: "dealership@takacars.jp",
    license_number: "TK-2025-118",
    service_fee_amount: null,
    status: "signed",
    signed_by_name: "Taka",
    signed_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
  },
  agr_002: {
    id: "agr_002",
    dealership_name: "Ok Motors",
    representative_name: "Ok",
    address: "",
    phone: "",
    email: "ops@okmotors.jp",
    license_number: "",
    service_fee_amount: 200,
    status: "pending_signature",
    signed_by_name: null,
    signed_at: null,
  },
};

export default function SignAgreementPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const agreementId = (params?.id ?? "").trim();

  const [agreement, setAgreement] = useState<DealershipAgreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [signerName, setSignerName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchAgreement() {
      setIsLoading(true);
      setError(null);

      if (!agreementId) {
        setError("No agreement ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/dealership-agreements/${agreementId}`);
        if (!res.ok) {
          setError("Agreement not found");
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (!data.success || !data.agreement) {
          setError("Agreement not found");
          setIsLoading(false);
          return;
        }

        console.log("data",data);

        const dbAgreement = data.agreement;
        setAgreement({
          id: dbAgreement.id,
          dealership_name: dbAgreement.dealership_name,
          representative_name: dbAgreement.representative_name,
          address: dbAgreement.address,
          phone: dbAgreement.phone,
          email: dbAgreement.email,
          license_number: dbAgreement.license_number,
          service_fee_amount: dbAgreement.service_fee_amount,
          status: dbAgreement.status,
          signed_by_name: dbAgreement.signed_by_name,
          signed_at: dbAgreement.signed_at,
        });
        setSuccess(dbAgreement.status === "signed");
      } catch {
        setError("Failed to load agreement");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgreement();
  }, [agreementId]);

  const canSign = useMemo(() => {
    return signerName.trim().length > 0 && agreedToTerms && !isSubmitting;
  }, [signerName, agreedToTerms, isSubmitting]);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreement) return;

    if (!signerName.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!agreedToTerms) {
      alert("Please accept the terms to continue");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/dealership-agreements/${agreement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "signed",
          signed_at: new Date().toISOString(),
          signed_by_name: signerName.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to sign agreement");

      setAgreement({
        ...agreement,
        status: "signed",
        signed_by_name: signerName.trim(),
        signed_at: new Date().toISOString(),
      });
      setSuccess(true);
    } catch {
      setError("Failed to sign agreement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Agreement Not Found</h2>
            <p className="text-slate-600">The agreement you're looking for could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success || agreement.status === "signed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-20 h-20 mx-auto text-emerald-500 mb-4" />
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Agreement Signed Successfully!</h2>
              <p className="text-slate-600 mb-6">
                Thank you for signing the managed sales service agreement. Our team will be in touch shortly.
              </p>

              <div className="bg-slate-50 rounded-lg p-6 text-left mb-6">
                <h3 className="font-semibold text-slate-800 mb-3">Agreement Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600">Dealership:</span>
                    <span className="ml-2 font-medium">{agreement.dealership_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Signed By:</span>
                    <span className="ml-2 font-medium">{agreement.dealership_name ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Signed On:</span>
                    <span className="ml-2 font-medium">
                      {agreement.signed_at ? new Date(agreement.signed_at).toLocaleString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push(`/ViewDealershipAgreement/${agreement.id}`)}
                >
                  View Agreement
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  onClick={() => router.push("/")}
                >
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Speedyo Managed Sales Service</h1>
          <h2 className="text-2xl text-slate-600">Dealership Agreement</h2>
          <Badge className="mt-4 bg-amber-100 text-amber-800">Pending Signature</Badge>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>1. Dealership Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-600">Dealership Name</Label>
                <p className="font-medium text-slate-800">{agreement.dealership_name}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Representative</Label>
                <p className="font-medium text-slate-800">{agreement.representative_name}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Email</Label>
                <p className="font-medium text-slate-800">{agreement.email}</p>
              </div>
              <div>
                <Label className="text-sm text-slate-600">Phone</Label>
                <p className="font-medium text-slate-800">{agreement.phone || "N/A"}</p>
              </div>
            </div>

            {agreement.address ? (
              <div>
                <Label className="text-sm text-slate-600">Address</Label>
                <p className="font-medium text-slate-800">{agreement.address}</p>
              </div>
            ) : null}

            {agreement.license_number ? (
              <div>
                <Label className="text-sm text-slate-600">Business License Number</Label>
                <p className="font-medium text-slate-800">{agreement.license_number}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>2. Listing Authorization</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">The dealership authorizes Speedyo to:</p>
            <ul className="space-y-2 text-slate-700">
              {[
                "List this vehicle on the Speedyo platform and associated marketing channels",
                "Represent the vehicle accurately using provided information, photos, and inspection data",
                "Communicate with potential buyers on behalf of the dealership",
                "Schedule car viewing and handle buyer inquiries",
                "Handle title transfer processes",
                "Collect payment from buyer and disburse payment to dealership",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>3. Sales Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Service Terms</h3>
              <div className="space-y-2 text-slate-700">
                <div>
                  <strong>Service Fee:</strong>{" "}
                  {agreement.service_fee_amount
                    ? `¥${agreement.service_fee_amount.toLocaleString()} per vehicle listing`
                    : "Varies per vehicle listing"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Agreement Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSign} className="space-y-6">
              <div>
                <Label htmlFor="signer_name" className="text-slate-700 font-medium">
                  Full Name (Type to Sign) *
                </Label>
                <Input
                  id="signer_name"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2 text-lg"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200">
                <Checkbox
                  id="agree_terms"
                  checked={agreedToTerms}
                  onCheckedChange={(v) => setAgreedToTerms(Boolean(v))}
                  disabled={isSubmitting}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="agree_terms"
                    className="text-sm text-slate-700 cursor-pointer leading-relaxed"
                  >
                    I acknowledge that I have read and agree to the terms of this Speedyo Managed Sales Service
                    Vehicle Listing Agreement. I confirm that I am authorized to sign on behalf of{" "}
                    {agreement.dealership_name} and that all information provided is accurate.
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-lg py-6"
                disabled={!canSign}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing Agreement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Sign Agreement
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
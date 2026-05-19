"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, CheckCircle, FileText, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Footer from "@/components/layout/Footer";

type AgreementStatus = "draft" | "pending_signature" | "signed" | "cancelled";

type DealershipAgreement = {
  id: string;
  status: AgreementStatus;

  dealership_name: string;
  representative_name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  license_number?: string | null;

  service_fee_amount?: number | null;

  signed_by_name?: string | null;
  signed_at?: string | null;
  createdAt?: string;
  admin_notes?: string | null;
};

export default function ViewDealershipAgreementUI() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const agreementId = params?.id ?? "";

  const [agreement, setAgreement] = useState<DealershipAgreement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchAgreement() {
      if (!agreementId) {
        setError(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/dealership-agreements/${agreementId}`);
        if (!res.ok) {
          setError(true);
          setIsLoading(false);
          return;
        }

        const data = await res.json();
        if (!data.success || !data.agreement) {
          setError(true);
          setIsLoading(false);
          return;
        }

        setAgreement(data.agreement);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgreement();
  }, [agreementId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Agreement Not Found</h2>
              <p className="text-slate-600 mb-6">
                {error ?? "The agreement you are looking for does not exist."}
              </p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex flex-col">
      <div className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8" />
                <div>
                  <CardTitle className="text-2xl">
                    Speedyo Managed Sales Service Agreement
                  </CardTitle>
                  <p className="text-blue-100 mt-1">Dealership Partnership Agreement</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {agreement.status === "signed" ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800">Agreement Signed</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      Signed by {agreement.signed_by_name || "—"}{" "}
                      {agreement.signed_at
                        ? `on ${new Date(agreement.signed_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">
                    Dealership Information
                  </h3>
                  <div className="space-y-2 text-slate-800">
                    <div>
                      <span className="text-slate-600">Business Name:</span>
                      <p className="font-medium">{agreement.dealership_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Representative:</span>
                      <p className="font-medium">{agreement.representative_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Email:</span>
                      <p className="font-medium">{agreement.email}</p>
                    </div>
                    {agreement.phone ? (
                      <div>
                        <span className="text-slate-600">Phone:</span>
                        <p className="font-medium">{agreement.phone}</p>
                      </div>
                    ) : null}
                    {agreement.address ? (
                      <div>
                        <span className="text-slate-600">Address:</span>
                        <p className="font-medium">{agreement.address}</p>
                      </div>
                    ) : null}
                    {agreement.license_number ? (
                      <div>
                        <span className="text-slate-600">Business License:</span>
                        <p className="font-medium">{agreement.license_number}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-600 mb-2">Service Terms</h3>
                  <div className="space-y-2 text-slate-800">
                    <div>
                      <span className="text-slate-600">Service Fee:</span>
                      <p className="font-medium">
                        {agreement.service_fee_amount
                          ? `¥${Number(agreement.service_fee_amount).toLocaleString()} per vehicle`
                          : "Varies per vehicle listing"}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600">Service Scope:</span>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-slate-700">
                        <li>Professional vehicle listing and photography</li>
                        <li>Car Viewing coordination and scheduling</li>
                        <li>Buyer qualification and communication</li>
                        <li>Sales process management</li>
                        <li>Platform visibility and marketing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="text-slate-700">
                    By signing this agreement, the dealership authorizes Speedyo to list and manage
                    vehicle sales on their behalf. The dealership maintains ownership of all
                    vehicles until sold, and Speedyo acts as a sales agent facilitating the
                    transaction.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
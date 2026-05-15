"use client";
import { useDealershipRegistrationStore } from "@/store/dealership/dealershipRegistrationStore";


import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  CheckCircle,
  Clock,
  FileText,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

// import { UserEntity as User, UploadFile } from "@/api/entities";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Progress } from "@/components/ui/Progress";
import { profileService } from "@/services/profile/profileServices";
// import { useProfileStore } from "@/store/profile/profile";

type TierId = "tier1" | "tier2" | "tier3";

const tierOptions = [
  {
    id: "tier1" as const,
    name: "Standard",
    price: "¥40,000",
    features: [
      "Up to 20 active listings",
      "Standard marketplace visibility",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    id: "tier2" as const,
    name: "Professional",
    price: "¥75,000",
    features: [
      "Up to 100 active listings",
      "Promoted marketplace visibility",
      "Advanced analytics & reporting",
      "Priority email & chat support",
      "Featured on homepage",
    ],
    popular: true,
  },
  // {
  //   id: "tier3" as const,
  //   name: "Enterprise",
  //   price: "¥150,000",
  //   features: [
  //     "Unlimited active listings",
  //     "Top-tier marketplace visibility",
  //     "Full analytics suite",
  //     "Dedicated account manager",
  //     "API access (coming soon)",
  //   ],
  // },
];

type FormDataState = {
  dealership_selected_tier: "" | TierId;
  business_name: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_zip: string;
  dealer_License_Number: string;
  business_license_urls: string[];

     dealership_verification_status?: string | null;
  verification_fee_paid?: boolean | null;
  admin_verification_notes?: string | null;

};

type StatusInfo =
  | {
      icon: React.ReactNode;
      title: string;
      description: string;
      color: "amber" | "emerald" | "red";
    }
  | null;

export default function DealershipRegistration() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const [licenseFiles, setLicenseFiles] = useState<File[]>([]);

  const { register, isSaving } = useDealershipRegistrationStore();



  const [formData, setFormData] = useState<FormDataState>({
    dealership_selected_tier: "",
    business_name: "",
    business_address: "",
    business_city: "",
    business_state: "",
    business_zip: "",
    dealer_License_Number: "",
    business_license_urls: [],

      dealership_verification_status:"",
  verification_fee_paid: false,
  admin_verification_notes: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
         const user = await profileService.me();
        setCurrentUser(user);


if (user?.business_name || user?.dealership_selected_tier) {
  setFormData((prev) => ({
    ...prev,
    dealership_selected_tier: (user.dealership_selected_tier as TierId) || "" as "" | TierId,
    business_name: user.business_name ?? "",
    business_address: user.business_address ?? "",
    business_city: user.business_city ?? "",
    business_state: user.business_state ?? "",
    business_zip: user.business_zip ?? "",
    dealer_License_Number: user.dealer_License_Number ?? "",
    business_license_urls: user.business_license_urls ?? [],
  } satisfies FormDataState));
}

        if (user?.dealership_verification_status === "pending_payment" && !user?.verification_fee_paid) {
          setCurrentStep(4);
        } else if (
          user?.dealership_verification_status === "pending_review" ||
          user?.dealership_verification_status === "approved" ||
          user?.dealership_verification_status === "declined"
        ) {
          setCurrentStep(5);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleInputChange = <K extends keyof FormDataState>(
    field: K,
    value: FormDataState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLicenseFiles((prev) => [...prev, file]);

    const previewUrl = URL.createObjectURL(file);
    handleInputChange("business_license_urls", [
      ...formData.business_license_urls,
      previewUrl,
    ]);
  };

    const handleRemoveFile = (urlToRemove: string) => {
    const idx = formData.business_license_urls.indexOf(urlToRemove);
    if (idx !== -1) {
      setLicenseFiles((prev) => prev.filter((_, i) => i !== idx));
    }
    handleInputChange(
      "business_license_urls",
      formData.business_license_urls.filter((url) => url !== urlToRemove)
    );
  };

  const getVerificationFeeCheckoutUrl = () => {
    const params = new URLSearchParams({
      purpose: "dealership_verification",
      amount: "25000.00",
      description: "Dealership Verification Fee",
      tier: formData.dealership_selected_tier || "",
    });
    return `/Checkout?${params.toString()}`;
  };

  const handleSaveAndContinue = async () => {
    if (currentStep === 1) {
      if (!formData.dealership_selected_tier) {
        alert("Please select a dealership plan.");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const required: (keyof FormDataState)[] = [
        "business_name",
        "business_address",
        "business_city",
        "business_state",
        "business_zip",
        "dealer_License_Number",
      ];
      const missing = required.filter((f) => !String(formData[f] ?? "").trim());
      if (missing.length > 0) {
        alert(
          `Please fill in all required fields: ${missing
            .map((f) => String(f).replace(/_/g, " "))
            .join(", ")}`
        );
        return;
      }
      setCurrentStep(3);
      return;
    }

      if (currentStep === 3) {
    if (formData.business_license_urls.length === 0) {
      alert("Please upload at least one business document.");
      return;
    }
    if (!termsAgreed) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    try {
      await register({
        dealership_selected_tier: formData.dealership_selected_tier,
        business_name: formData.business_name,
        business_address: formData.business_address,
        business_city: formData.business_city,
        business_state: formData.business_state,
        business_zip: formData.business_zip,
        dealer_License_Number: formData.dealer_License_Number,
        business_license_files: licenseFiles,  
        existing_urls: [],
      });

      window.location.href = getVerificationFeeCheckoutUrl();
    } catch (error: any) {
      alert(error.message ?? "Failed to submit application. Please try again.");
    }
  }

   
  };

  const statusInfo: StatusInfo = useMemo(() => {
    const status = currentUser?.dealership_verification_status;
    if (!status) return null;

    const selectedName =
      tierOptions.find((t) => t.id === formData.dealership_selected_tier)?.name || "selected";

    switch (status) {
      case "pending_review":
        return {
          icon: <Clock className="w-6 h-6 text-amber-500" />,
          title: "Under Review",
          description: `Our team is reviewing your dealership application for the ${selectedName} plan. We'll notify you within 2-3 business days.`,
          color: "amber",
        };
      case "approved":
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
          title: "Approved!",
          description: `Congratulations! Your dealership has been approved. You can now start listing vehicles.`,
          color: "emerald",
        };
      case "declined":
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          title: "Application Declined",
          description:
            currentUser?.admin_verification_notes ||
            "Your application was declined. Please contact support for more information.",
          color: "red",
        };
      default:
        return null;
    }
  }, [currentUser, formData.dealership_selected_tier]);

  const progress =
    currentUser?.dealership_verification_status === "approved" ||
    currentUser?.dealership_verification_status === "declined"
      ? 100
      : (currentStep / 4) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-slate-600 mb-6">Please log in to register your dealership.</p>
            <Button asChild>
              <Link href="/signIn">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusBg =
    statusInfo?.color === "amber"
      ? "bg-amber-100"
      : statusInfo?.color === "emerald"
      ? "bg-emerald-100"
      : statusInfo?.color === "red"
      ? "bg-red-100"
      : "bg-slate-100";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Building className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-slate-800">Dealership Registration</h1>
          <p className="text-slate-600 mt-2">
            Register your business to unlock dealership features
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-700">Registration Progress</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-4 text-xs text-slate-500">
              <span className={currentStep >= 1 ? "text-blue-600" : ""}>Select Plan</span>
              <span className={currentStep >= 2 ? "text-blue-600" : ""}>Business Info</span>
              <span className={currentStep >= 3 ? "text-blue-600" : ""}>Documents</span>
              <span className={currentStep >= 4 ? "text-blue-600" : ""}>Payment</span>
              <span className={currentStep >= 5 ? "text-blue-600" : ""}>Review</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1 */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Choose Your Dealership Plan</CardTitle>
              <p className="text-slate-600">
                Select the plan that best fits your business needs. Remember, your first month is
                FREE!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {tierOptions.map((tier) => (
                  <Card
                    key={tier.id}
                    className={`cursor-pointer transition-all duration-300 ${
                      formData.dealership_selected_tier === tier.id
                        ? "ring-2 ring-blue-500 shadow-lg"
                        : "hover:shadow-md"
                    } ${tier.popular ? "border-2 border-blue-500" : ""}`}
                    onClick={() => handleInputChange("dealership_selected_tier", tier.id)}
                  >
                    <CardHeader className="text-center relative">
                      {tier.popular && (
                        <Badge className="absolute top-2 right-2 bg-blue-500">Most Popular</Badge>
                      )}
                      <CardTitle className="text-xl">{tier.name}</CardTitle>
                      <p className="text-3xl font-bold text-blue-600">{tier.price}</p>
                      <p className="text-slate-500 text-sm">per month</p>
                      <div className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded-full mt-2 inline-block">
                        First Month FREE
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <ul className="space-y-2 text-sm">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span className="text-slate-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveAndContinue}
                  disabled={!formData.dealership_selected_tier}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    placeholder="Your dealership name"
                  />
                </div>
                <div>
                  <Label htmlFor="dealer_License_Number">Dealer License Number *</Label>
                  <Input
                    id="dealer_License_Number"
                    value={formData.dealer_License_Number}
                    onChange={(e) => handleInputChange("dealer_License_Number", e.target.value)}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business_address">Business Address *</Label>
                <Input
                  id="business_address"
                  value={formData.business_address}
                  onChange={(e) => handleInputChange("business_address", e.target.value)}
                  placeholder="Street address"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="business_city">City *</Label>
                  <Input
                    id="business_city"
                    value={formData.business_city}
                    onChange={(e) => handleInputChange("business_city", e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="business_state">State *</Label>
                  <Input
                    id="business_state"
                    value={formData.business_state}
                    onChange={(e) => handleInputChange("business_state", e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="business_zip">ZIP Code *</Label>
                  <Input
                    id="business_zip"
                    value={formData.business_zip}
                    onChange={(e) => handleInputChange("business_zip", e.target.value)}
                    placeholder="ZIP"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSaveAndContinue} disabled={isSaving}>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Business Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <FileText className="w-4 h-4" />
                <AlertDescription>
                  Please upload clear, readable copies of your business licenses or other relevant
                  documents. Accepted formats: PDF, JPG, PNG (Max 10MB)
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <label
                  htmlFor="license-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingFile ? "Uploading..." : "Choose File"}
                  <input
                    id="license-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                </label>
              </div>

              {formData.business_license_urls.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Uploaded Documents:</h4>
                  <div className="space-y-2">
                    {formData.business_license_urls.map((url) => {
                      const isImage = /\.(jpg|jpeg|png)$/i.test(url);
                      const fileName = url.split("/").pop()?.split("?")[0] ?? "document";
                      return (
                        <div
                          key={url}
                          className="flex items-center justify-between p-2 border rounded-lg bg-slate-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {isImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={url}
                                alt="preview"
                                className="w-10 h-10 object-cover rounded-md"
                              />
                            ) : (
                              <FileText className="w-6 h-6 text-slate-500" />
                            )}
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline truncate"
                            >
                              {fileName}
                            </a>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => handleRemoveFile(url)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={termsAgreed}
                  onCheckedChange={(v) => setTermsAgreed(Boolean(v))}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                    terms and conditions
                  </Link>
                </label>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSaveAndContinue}
                  disabled={isSaving  || !termsAgreed}
                >
                  {isSaving ? "Submitting..." : "Submit Application"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Verification Fee</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  A one-time verification fee of  ¥25,000 is required to process your dealership
                  registration.
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-4">Registration Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Selected Plan:</span>
                    <span className="font-bold text-blue-600">
                      {tierOptions.find((t) => t.id === formData.dealership_selected_tier)?.name} (
                      {tierOptions.find((t) => t.id === formData.dealership_selected_tier)?.price}
                      /month)
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>First Month:</span>
                    <span className="font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span>Verification Fee (One-time):</span>
                    <span className="font-bold text-2xl text-blue-600">¥25,000</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href={getVerificationFeeCheckoutUrl()}>
                    Proceed to Payment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5 */}
        {currentStep === 5 && statusInfo && (
          <Card>
            <CardContent className="text-center p-8">
              <div className={`w-16 h-16 rounded-full ${statusBg} flex items-center justify-center mx-auto mb-4`}>
                {statusInfo.icon}
              </div>
              <h3 className="text-2xl font-bold mb-2">{statusInfo.title}</h3>
              <p className="text-slate-600 mb-6">{statusInfo.description}</p>

              {currentUser.dealership_verification_status === "approved" && (
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/Dashboard">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}

              {currentUser.dealership_verification_status === "declined" && (
                <div className="space-y-4 flex flex-col items-center">
                  <Button onClick={() => setCurrentStep(1)} variant="outline">
                    Submit New Application
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/contact">Contact Support</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


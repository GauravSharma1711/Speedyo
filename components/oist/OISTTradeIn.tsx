"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { ArrowLeft, RefreshCw, CheckCircle, Loader2 } from "lucide-react";
import { notificationService, userService } from "@/services/dashboard";
import { oistTradeInService } from "@/services/oistTradeInService";
import AuthButton from "./AuthButton";

type OISTTradeInProps = {
  onBack: () => void;
};

type OISTTradeInFormData = {
  fullName: string;
  email: string;
  facebookProfile: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleMileage: string;
  vehicleCondition: string;
  additionalDetails: string;
};

export default function OISTTradeIn({ onBack }: OISTTradeInProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await userService.me();
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || me.full_name || "",
          email: prev.email || me.email || "",
        }));
      } catch {
        // ignore
      }
    })();
  }, []);

  const [formData, setFormData] = useState<OISTTradeInFormData>({
    fullName: "",
    email: "",
    facebookProfile: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    vehicleMileage: "",
    vehicleCondition: "",
    additionalDetails: ""
  });
  const [facebookError, setFacebookError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = <K extends keyof OISTTradeInFormData>(
    field: K,
    value: OISTTradeInFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "facebookProfile") {
      if (value && !value.includes("facebook.com")) {
        setFacebookError("Please enter a valid Facebook profile URL");
      } else {
        setFacebookError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Facebook URL
    if (formData.facebookProfile && !formData.facebookProfile.includes("facebook.com")) {
      setFacebookError("Please enter a valid Facebook profile URL");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create trade-in request in database
      await oistTradeInService.create({
        full_name: formData.fullName,
        email: formData.email,
        facebook_profile: formData.facebookProfile,
        vehicle_make: formData.vehicleMake,
        vehicle_model: formData.vehicleModel,
        vehicle_year: formData.vehicleYear,
        vehicle_mileage: formData.vehicleMileage,
        vehicle_condition: formData.vehicleCondition,
        additional_details: formData.additionalDetails || "",
        status: "pending"
      });

      // Get all admin users from PublicUser entity
      const adminUsers = await userService.getAdmins();

      // Send notification to all admins
      await Promise.all(
        adminUsers.map((admin: any) =>
          notificationService.create({
            recipientId: admin.id,
            type: "new_managed_sale_request",
            content: `New OIST Trade-In request from ${formData.fullName} for ${formData.vehicleMake} ${formData.vehicleModel} (${formData.vehicleYear})`,
            url: `/AdminPanel?tab=oist-trade-in`,
            icon: "RefreshCw"
          })
        )
      );

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit trade-in request:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(
        `Failed to submit request: ${message}. Please try again or contact support.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Request Submitted Successfully!
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Thank you for your trade-in request. A Speedyo representative will contact you within 24-48 hours to discuss your vehicle and provide a quote.
            </p>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <AuthButton className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  Create Account
                </AuthButton>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/Marketplace">Browse Vehicles</Link>
                </Button>
              </div>
              <Button onClick={onBack} variant="ghost">
                Return to Services
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </Button>

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Trade-In Your Vehicle
        </h1>
        <p className="text-lg text-slate-600">
          Get a competitive quote for your current vehicle
        </p>
      </div>

      {/* How Trade-In Works */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Submit Vehicle Details</h4>
                <p className="text-slate-600">Provide information about your current vehicle</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Receive Quote</h4>
                <p className="text-slate-600">Our team will evaluate and provide a competitive trade-in offer</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Complete Trade-In</h4>
                <p className="text-slate-600">Use your trade-in value toward your next vehicle purchase</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade-In Request Form */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Vehicle Trade-In Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Full Name *</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john.doe@oist.jp"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Facebook Profile *</label>
                <Input
                  type="url"
                  value={formData.facebookProfile}
                  onChange={(e) => handleInputChange("facebookProfile", e.target.value)}
                  placeholder="https://www.facebook.com/yourprofile"
                  required
                />
                {facebookError && (
                  <p className="text-sm text-red-500 mt-1">{facebookError}</p>
                )}
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">Vehicle Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Make *</label>
                  <Input
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange("vehicleMake", e.target.value)}
                    placeholder="Toyota"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Model *</label>
                  <Input
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange("vehicleModel", e.target.value)}
                    placeholder="Prius"
                    required
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Year *</label>
                  <Input
                    type="number"
                    value={formData.vehicleYear}
                    onChange={(e) => handleInputChange("vehicleYear", e.target.value)}
                    placeholder="2020"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Mileage (km) *</label>
                  <Input
                    type="number"
                    value={formData.vehicleMileage}
                    onChange={(e) => handleInputChange("vehicleMileage", e.target.value)}
                    placeholder="50000"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">Condition *</label>
                <Select value={formData.vehicleCondition} onValueChange={(value) => handleInputChange("vehicleCondition", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent - No visible wear, well maintained</SelectItem>
                    <SelectItem value="good">Good - Minor wear, regular maintenance</SelectItem>
                    <SelectItem value="fair">Fair - Some wear and tear, functional</SelectItem>
                    <SelectItem value="poor">Poor - Significant wear, needs repairs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Additional Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 text-lg">Additional Details</h3>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Additional Information (optional)
                </label>
                <Textarea
                  value={formData.additionalDetails}
                  onChange={(e) => handleInputChange("additionalDetails", e.target.value)}
                  placeholder="Any modifications, damage, or special features? When are you looking to trade in?"
                  className="h-32"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Trade-In Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
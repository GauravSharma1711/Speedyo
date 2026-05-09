"use client"

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Label } from "@/components/ui/Label";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/UseToast";
import { managedSaleRequestService } from "@/services/managedSales/managedSaleRequestServices";
import { profileService } from "@/services/profile/profileServices";
import { useRouter } from "next/navigation";

type ImagePreview = {
  file: File;
  url: string;
};

type SimpleManagedSaleFormProps = {
  onSuccess?: () => void;
  onClose?: () => void;
};

export default function SimpleManagedSaleForm({ onSuccess, onClose }: SimpleManagedSaleFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    mileage: "",
    description: "",
  });
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const previews: ImagePreview[] = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
      setImages((prev) => [...prev, ...previews]);

      toast({
        title: "Images Added",
        description: `${files.length} image(s) ready to submit.`,
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const target = prev[index];
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => {
      for (const img of images) {
        if (img.url) URL.revokeObjectURL(img.url);
      }
    };
  }, [images]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.mileage || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (images.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload at least one image of your vehicle.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const me = await profileService.me();

      const fd = new FormData();

      fd.set("contact_full_name", String((me as any)?.full_name ?? ""));
      fd.set("contact_email", String((me as any)?.email ?? ""));
      fd.set("contact_phone", String((me as any)?.phone ?? ""));
      fd.set("terms_agreed", "true");

      fd.set("vehicle_title", formData.title);
      fd.set("seller_asking_price", String(formData.price));
      fd.set("vehicle_mileage", String(formData.mileage));
      fd.set("vehicle_description", formData.description);
      fd.set("vehicle_location", String((me as any)?.location ?? ""));

      for (const img of images) {
        fd.append("vehicle_images", img.file);
      }

      await managedSaleRequestService.submit(fd);

      setSubmitted(true);
      if (onSuccess) onSuccess();

      toast({
        title: "Request Submitted",
        description: "Our team will contact you shortly to complete the listing.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not submit your request. Please try again.";
      console.error("Failed to submit managed sale request:", error);
      toast({
        title: "Submission Failed",
        description: message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (submitted) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
        <CardContent className="p-12 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Thank you for choosing Speedio&apos;s managed sales service. Our team will review your submission
            and contact you within 24 hours to gather additional details and finalize your listing.
          </p>
          <Button onClick={() => router.push("/Dashboard")} className="bg-gradient-to-r from-blue-500 to-emerald-500">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl max-w-2xl mx-auto">
      <CardHeader className="relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}
        <CardTitle className="text-2xl font-bold text-slate-800 pr-10">
          Quick Managed Sale Request
        </CardTitle>
        <p className="text-slate-600 text-sm mt-2">
          Submit your vehicle for managed sales in minutes. Our team will handle the rest!
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Upload */}
          <div className="space-y-2">
            <Label htmlFor="images" className="text-slate-700 font-semibold">
              Vehicle Photos <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-slate-500">Upload high-quality images of your vehicle</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={img.url}
                    alt={`Vehicle ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                ) : (
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                )}
                <p className="text-sm text-slate-600">
                  {isUploading ? "Adding..." : "Click to upload images"}
                </p>
              </div>
              <input
                id="images"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-700 font-semibold">
                Vehicle Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., 2015 Toyota Prius"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-semibold">
                Asking Price ($) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., 15000"
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-slate-700 font-semibold">
                Mileage (km) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData((prev) => ({ ...prev, mileage: e.target.value }))}
                placeholder="e.g., 75000"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label className="text-slate-700 font-semibold">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Tell us about your vehicle's condition, features, and any issues..."
              className="mt-2 min-h-[120px]"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Managed Sale Request"
            )}
          </Button>

          <p className="text-xs text-slate-500 text-center">
            By submitting, you agree to our terms. Our team will contact you within 24 hours to gather
            additional details and finalize your vehicle listing.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
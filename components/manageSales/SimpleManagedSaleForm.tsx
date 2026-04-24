import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SimpleManagedSaleForm({ onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    mileage: "",
    description: "",
  });
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages([...images, ...uploadedUrls]);

      toast({
        title: "Images Uploaded",
        description: `${uploadedUrls.length} image(s) uploaded successfully.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to upload images:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload images. Please try again.",
        variant: "destructive",
      });
    }
    setIsUploading(false);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
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
      const user = await base44.auth.me();

      // Create a simplified managed sale request
      const requestData = {
        vehicle_details: {
          title: formData.title,
          seller_asking_price: parseFloat(formData.price),
          mileage: parseFloat(formData.mileage),
          description: formData.description,
          images: images,
        },
        requester_contact_info: {
          full_name: user.full_name,
          email: user.email,
        },
        access_arrangements: {},
        terms_agreed: true,
        submitted_by_user_id: user.id,
        status: "pending_initial_review",
      };

      const createdRequest = await base44.entities.ManagedSaleRequest.create(requestData);

      // Notify admins
      const admins = await base44.entities.User.filter({ role: "admin" });
      for (const admin of admins) {
        await base44.entities.Notification.create({
          recipient_id: admin.id,
          sender_id: user.id,
          type: "new_managed_sale_request",
          content: `🚗 New managed sale submission from ${user.full_name} for "${formData.title}". ACTION REQUIRED: Complete vehicle details and specifications before listing.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: createdRequest.id,
          url: `/admin-panel?tab=managed-sales`,
          icon: "AlertCircle",
        });
      }

      setSubmitted(true);
      if (onSuccess) onSuccess();

      toast({
        title: "Request Submitted",
        description: "Our team will contact you shortly to complete the listing.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to submit managed sale request:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit your request. Please try again.",
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
            Thank you for choosing Speedio's managed sales service. Our team will review your submission
            and contact you within 24 hours to gather additional details and finalize your listing.
          </p>
          <Button onClick={() => window.location.href = "/dashboard"} className="bg-gradient-to-r from-blue-500 to-emerald-500">
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
              {images.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <img src={image} alt={`Vehicle ${index + 1}`} className="w-full h-full object-cover" />
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
                  {isUploading ? "Uploading..." : "Click to upload images"}
                </p>
              </div>
              <input
                id="images"
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-700 font-semibold">
              Vehicle Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., 2018 Toyota Corolla Hybrid"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-slate-700 font-semibold">
              Desired Selling Price (USD) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g., 5000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>

          {/* Mileage */}
          <div className="space-y-2">
            <Label htmlFor="mileage" className="text-slate-700 font-semibold">
              Mileage (km) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mileage"
              type="number"
              placeholder="e.g., 85000"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-700 font-semibold">
              Vehicle Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please describe your vehicle in detail. Include information such as: make, model, year, mileage, condition, fuel type, transmission, exact location, specific features, maintenance history, any modifications or upgrades, reasons for selling, etc. The more details you provide, the faster we can create your listing!"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[150px]"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
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
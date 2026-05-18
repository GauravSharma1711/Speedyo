"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";
import { Loader2, Trash2, ChevronLeft, ChevronRight, CheckCircle, Upload } from "lucide-react";
import { useToast } from "@/components/ui/UseToast";
import { Vehicle } from "@/store/admin/vehicleListing";

type VehicleStatus = "available" | "sold";

type ImageSet = {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
  original: string;
};

type VehicleLike = {
  id?: string;
  title?: string;
  make?: string;
  model?: string;
  year?: string | number;
  price?: string | number;
  mileage?: string | number;
  condition?: string;
  description?: string;
  location?: string;
  fuel_type?: string;
  transmission?: string;
  status?: VehicleStatus | string;
  images?: string[] | ImageSet[];
  primary_image?: string | ImageSet | null;
};

export type CreateVehiclePatch = {
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  description: string;
  location: string;
  fuel_type: string;
  transmission: string;
  status: VehicleStatus;
  images: string[]; // originals
  primary_image: string | null; // original
   imageFiles: File[];
};

type Props = {
  isOpen: boolean;
     isDirectListing?: boolean; 
  onClose: () => void;
  vehicleToEdit?: Vehicle | null;
  onSave: (patch: CreateVehiclePatch) => void | Promise<void>;
  isSubmitting?: boolean;
};

function toImageSet(url: string): ImageSet {
  return { thumbnail: url, small: url, medium: url, large: url, original: url };
}

export default function CreateVehicleModalUI({
  isOpen,
  onClose,
  vehicleToEdit,
  onSave,
  isSubmitting: parentSubmitting,
  isDirectListing = false,
}: Props) {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

    const [localSubmitting, setLocalSubmitting] = useState(false);
  const [uploadLabel, setUploadLabel] = useState<string>("");
 
  
  const isBusy = localSubmitting || Boolean(parentSubmitting);
 

  const [formData, setFormData] = useState<{
    make: string;
    model: string;
    year: string;
    price: string;
    mileage: string;
    condition: string;
    description: string;
    location: string;
    fuel_type: string;
    transmission: string;
    status: VehicleStatus;
    images: ImageSet[];
    primary_image: ImageSet | null;
     imageFiles: File[];
  }>({
    make: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    condition: "good",
    description: "",
    location: "",
    fuel_type: "gasoline",
    transmission: "automatic",
    status: "available",
    images: [],
    primary_image: null,
    imageFiles: [],
  });

  // const localLoading = Boolean(isSubmitting);

  const steps = useMemo(
    () => [
      { number: 1, title: "Basic Information", description: "Tell us about your vehicle" },
      { number: 2, title: "Details & Condition", description: "Describe your vehicle's condition" },
      { number: 3, title: "Photos & Final Review", description: "Add photos to make your listing stand out" },
    ],
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    if (vehicleToEdit) {
      const raw = vehicleToEdit.images ?? [];
      const images: ImageSet[] =
        raw.length === 0
          ? []
          : typeof (raw as any)[0] === "string"
            ? (raw as string[]).map((u) => toImageSet(u))
            : (raw as ImageSet[]).map((img) => ({
                thumbnail: img.thumbnail || img.original,
                small: img.small || img.original,
                medium: img.medium || img.original,
                large: img.large || img.original,
                original: img.original || img.large || img.medium || img.small || img.thumbnail,
              }));

      const primary: ImageSet | null = vehicleToEdit.primary_image
        ? typeof vehicleToEdit.primary_image === "string"
          ? toImageSet(vehicleToEdit.primary_image)
          : (vehicleToEdit.primary_image as ImageSet)
        : null;

      setFormData({
        make: vehicleToEdit.make || "",
        model: vehicleToEdit.model || "",
        year: String(vehicleToEdit.year ?? ""),
        price: String(vehicleToEdit.price ?? ""),
        mileage: String(vehicleToEdit.mileage ?? ""),
        condition: vehicleToEdit.condition || "good",
        description: vehicleToEdit.description || "",
        location: vehicleToEdit.location || "",
        fuel_type: vehicleToEdit.fuel_type || "gasoline",
        transmission: vehicleToEdit.transmission || "automatic",
        status: (vehicleToEdit.status === "sold" ? "sold" : "available") as VehicleStatus,
        images,
        primary_image: primary || (images[0] ?? null),
          imageFiles: [],
      });
      setCurrentStep(1);
      return;
    }

    setFormData({
      make: "",
      model: "",
      year: "",
      price: "",
      mileage: "",
      condition: "good",
      description: "",
      location: "",
      fuel_type: "gasoline",
      transmission: "automatic",
      status: "available",
      images: [],
      primary_image: null,
      imageFiles: [],
    });
    setCurrentStep(1);
  }, [isOpen, vehicleToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as any));
  };

  const handleSelectChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value } as any));
  };

  const removeImage = (indexToRemove: number) => {
  setFormData((prev) => {
    const updatedImages = prev.images.filter((_, i) => i !== indexToRemove);
    const updatedFiles = prev.imageFiles.filter((_, i) => i !== indexToRemove);

    let newPrimaryImage = prev.primary_image;
    if (
      prev.primary_image &&
      prev.images[indexToRemove] &&
      prev.images[indexToRemove].original === prev.primary_image.original
    ) {
      newPrimaryImage = updatedImages.length > 0 ? updatedImages[0] : null;
    }

    return {
      ...prev,
      images: updatedImages,
      imageFiles: updatedFiles,
      primary_image: newPrimaryImage,
    };
  });
};

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return Boolean(formData.make && formData.model && formData.year && formData.price && formData.mileage);
      case 2:
        return Boolean(
          formData.condition &&
            formData.fuel_type &&
            formData.transmission &&
            formData.location &&
            formData.description,
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all required information before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading] = useState(false);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxSize = 30 * 1024 * 1024;
    const oversized = files.filter((f) => f.size > maxSize);
    if (oversized.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed the 30MB limit: ${oversized.map((f) => f.name).join(", ")}.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }

    const imageSets: ImageSet[] = files.map((f) => {
      const url = URL.createObjectURL(f);
      return toImageSet(url);
    });

    setFormData((prev) => {
      const newImages = [...prev.images, ...imageSets];
      const newPrimary = prev.primary_image || newImages[0] || null;
      return { 
        ...prev, 
        images: newImages,
         primary_image: newPrimary,
           imageFiles: [...prev.imageFiles, ...files],

       };
    });

 

    e.target.value = "";
  };

  const handleSubmit = async () => {
       setLocalSubmitting(true);
    setUploadLabel("");

   try {
     
     const year = Number(formData.year || 0);
     const price = Number(formData.price || 0);
     const mileage = Number(formData.mileage || 0);
 
     const title = `${year || ""} ${formData.make} ${formData.model}`.trim();
 
     // Upload new images (blob URLs) to server
     let finalImages: string[] = [];
     let finalPrimary: string | null = null;
 
     if (formData.imageFiles.length > 0) {
       toast({ title: "Uploading images...", description: "Please wait" });
 
       const uploadPromises = formData.imageFiles.map(async (file) => {
         const formDataUpload = new FormData();
         formDataUpload.append("file", file);
 
         const res = await fetch("/api/upload/uploadImage", {
           method: "POST",
           body: formDataUpload,
         });
 
         if (!res.ok) throw new Error("Image upload failed");
         const data = await res.json();
         return data.url; // large image URL
  
      });

      try {
        finalImages = await Promise.all(uploadPromises);
      } catch {
        toast({ title: "Error", description: "Failed to upload images", variant: "destructive" });
        return;
      }

      // Find primary image
      const primaryBlob = formData.primary_image?.original;
      if (primaryBlob && finalImages.length > 0) {
        const idx = formData.images.findIndex(img => img.original === primaryBlob);
        finalPrimary = idx !== -1 ? finalImages[idx] : finalImages[0];
      } else {
        finalPrimary = finalImages[0];
      }
    }

    const patch: CreateVehiclePatch = {
      title,
      make: formData.make,
      model: formData.model,
      year,
      price,
      mileage,
      condition: formData.condition,
      description: formData.description,
      location: formData.location,
      fuel_type: formData.fuel_type,
      transmission: formData.transmission,
      status: formData.status,
      images: finalImages.length > 0 ? finalImages : formData.images.map((img) => img.original).filter(Boolean),
      primary_image: finalPrimary || formData.primary_image?.original || null,
      imageFiles: formData.imageFiles,
    };

    await onSave(patch);

    toast({
      title: vehicleToEdit ? "Vehicle listing updated" : "Vehicle listing created",
      description: "Saved successfully.",
    });
    onClose();
  }catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLocalSubmitting(false);
      setUploadLabel("");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 text-center">Basic Vehicle Information</h3>
            <p className="text-sm text-slate-500 text-center mt-1">
              Let&apos;s start with the essential details about your vehicle
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Input id="make" name="make" value={formData.make} onChange={handleChange} placeholder="e.g. Toyota" />
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Aqua" />
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="e.g. 2018" />
              </div>

              <div>
                <Label htmlFor="price">Price (JPY) *</Label>
                <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 9500" />
              </div>

              <div>
                <Label htmlFor="mileage">Mileage *</Label>
                <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="e.g. 45000" />
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select name="condition" value={formData.condition} onValueChange={(v) => handleSelectChange("condition", v)}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">excellent</SelectItem>
                    <SelectItem value="good">good</SelectItem>
                    <SelectItem value="fair">fair</SelectItem>
                    <SelectItem value="needs_repair">needs_repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        case 2:
  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 text-center">
        Vehicle Details &amp; Condition
      </h3>
      <p className="text-sm text-slate-500 text-center mt-1">
        Help buyers understand your vehicle better
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Condition */}
        <div>
          <Label htmlFor="condition">Condition *</Label>
          <Select
            name="condition"
            value={formData.condition}
            onValueChange={(v) => handleSelectChange("condition", v)}
          >
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Excellent Condition</SelectItem>
              <SelectItem value="good">Good Condition</SelectItem>
              <SelectItem value="fair">Fair Condition</SelectItem>
              <SelectItem value="needs_repair">Needs Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fuel Type */}
        <div>
          <Label htmlFor="fuel_type">Fuel Type *</Label>
          <Select
            name="fuel_type"
            value={formData.fuel_type}
            onValueChange={(v) => handleSelectChange("fuel_type", v)}
          >
            <SelectTrigger id="fuel_type">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gasoline">Gasoline</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transmission */}
        <div>
          <Label htmlFor="transmission">Transmission *</Label>
          <Select
            name="transmission"
            value={formData.transmission}
            onValueChange={(v) => handleSelectChange("transmission", v)}
          >
            <SelectTrigger id="transmission">
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Listing Status (full width) */}
        <div className="md:col-span-3">
          <Label htmlFor="status">Listing Status *</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(v) => handleSelectChange("status", v as any)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-xs text-slate-500 mt-2">
            Set to &quot;Unavailable&quot; to temporarily hide from marketplace, or
            &quot;Hidden&quot; if seller downgraded to guest.
          </p>
        </div>

        {/* Location (full width) */}
        <div className="md:col-span-3">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Naha, Okinawa"
          />
        </div>
    <div className="md:col-span-3">
    <Label htmlFor="description">Description *</Label>
    <Textarea
      id="description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      placeholder="Describe your vehicle's condition, features, and any important details..."
      rows={5}
    />
    </div>
  </div>
  </div>
  );

      case 3:
        case 3:
            return (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 text-center">
                  Photos &amp; Final Review
                </h3>
                <p className="text-sm text-slate-500 text-center mt-1">
                  Add photos to make your listing stand out
                </p>
          
                <div className="mt-6">
                  <Label className="text-sm font-medium text-slate-900">Vehicle Photos</Label>
          
                  {/* Dropzone */}
                  <div
                    className="mt-3 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    const list = Array.from(files);
    const oversized = list.filter((f) => f.size > 30 * 1024 * 1024);
    if (oversized.length > 0) {
      toast({
        title: "File too large",
        description: `Some files exceed the 30MB limit: ${oversized.map((f) => f.name).join(", ")}.`,
        variant: "destructive",
      });
      return;
    }

    const imageSets = list.map((f) => {
      const url = URL.createObjectURL(f);
      return toImageSet(url);
    });

    setFormData((prev) => {
      const newImages = [...prev.images, ...imageSets];
      const newPrimary = prev.primary_image || newImages[0] || null;
      return {
        ...prev,
        images: newImages,
        primary_image: newPrimary,
        imageFiles: [...prev.imageFiles, ...list], 
      };
    });

    
  }
}}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/gif"
                      multiple
                      className="hidden"
                      onChange={handleImageSelect}
                    />
          
                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG, GIF up to 30MB each (optimized to WebP)
                    </p>
                  </div>
          
                  {/* Thumbnails grid */}
                  {formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      {formData.images.map((image, index) => {
                        const isPrimary =
                          formData.primary_image &&
                          image.original === formData.primary_image.original;
          
                        return (
                          <div
                            key={index}
                            className="relative group rounded-lg overflow-hidden border bg-white"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={image.thumbnail || image.original}
                              alt={`Vehicle ${index + 1}`}
                              className="w-full h-24 object-cover"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, primary_image: image }))
                              }
                            />
          
                            {/* Primary badge */}
                            {isPrimary ? (
                              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Primary
                              </div>
                            ) : null}
          
                            {/* Delete */}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                              disabled={isBusy}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
          
                  {/* Review Summary (same as reference feel) */}
                  <div className="mt-8 rounded-lg border bg-slate-50 p-5">
                    <h4 className="font-semibold text-slate-900 mb-3">Review Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                      <div>
                        <span className="font-medium text-slate-600">Vehicle:</span>{" "}
                        {formData.year} {formData.make} {formData.model}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Price:</span> ¥
                        {Number(formData.price || 0).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Mileage:</span>{" "}
                        {Number(formData.mileage || 0).toLocaleString()} miles
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Condition:</span>{" "}
                        {formData.condition}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Location:</span>{" "}
                        {formData.location}
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Photos:</span>{" "}
                        {formData.images.length} uploaded
                      </div>
                      {vehicleToEdit ? (
                        <div>
                          <span className="font-medium text-slate-600">Status:</span>{" "}
                          {formData.status}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
        <DialogTitle className="sr-only">
          {vehicleToEdit ? "Edit Vehicle Listing" : "Create New Vehicle Listing"}
        </DialogTitle>
 
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-2xl font-bold">
                {vehicleToEdit ? "Edit Vehicle Listing" : "Create New Vehicle Listing"}
              </h2>
              <p className="text-blue-100 text-sm mt-1">
                {vehicleToEdit ? "Update your vehicle details" : "List your vehicle for sale on Speedio"}
              </p>
            </div>
          </div>
        </div>
 
        {/* Step indicators */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                      currentStep >= step.number ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {validateStep(step.number) && currentStep > step.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-3 hidden sm:block">
                    <p
                      className={`text-sm font-medium ${
                        currentStep >= step.number ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 ? (
                  <div
                    className={`w-8 sm:w-16 h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-blue-600" : "bg-slate-200"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
 
        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6">{renderStepContent()}</div>
 
        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
          <div>
            {currentStep > 1 ? (
              <Button type="button" variant="outline" onClick={handlePrevious} disabled={isBusy}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            ) : null}
          </div>
 
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isBusy}>
              Cancel
            </Button>
 
            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                disabled={!validateStep(currentStep) || isBusy}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isBusy}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 min-w-[140px]"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {uploadLabel || "Saving…"}
                  </>
                ) : vehicleToEdit ? (
                  "Update Listing"
                ) : (
                  "Create Listing"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
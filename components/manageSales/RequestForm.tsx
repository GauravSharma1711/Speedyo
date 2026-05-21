"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  Camera,
  Car,
  ImageIcon,
  KeyRound,
  FileCheck2,
  Info,
  MapPin,
  DollarSign,
  Phone,
  CheckCircle,
  User,
  Wrench,
  ArrowLeft,
  ArrowRight,
  Send,
  FileText,
  Gauge,
  Sparkles,
  Shield,
  Wifi,
  JapaneseYenIcon,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Label } from "@/components/ui/Label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Separator } from "@/components/ui/Separator";
import { useToast } from "@/components/ui/UseToast";

import SuccessModal from "@/components/manageSales/SuccessModal";
import LocationVerification from "@/components/manageSales/LocationVerification";

type ContactInfo = { full_name: string; email: string; phone: string };

type VehicleDetails = {
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number | "";
  condition: string;
  description: string;
  fuel_type: string;
  transmission: string;
  location: string;
  seller_asking_price: number | "";
  financing_available: string;
  warranty_available: string;
  warranty_link: string;

  images: string[];
  images_thumbnails: string[];
  images_small: string[];
  images_medium: string[];

  drive_type: string;
  engine_size: string;
  body_type: string;
  exterior_color: string;
  interior_color: string;
  doors: number;
  seating_capacity: number;
  steering_wheel: string;

  current_plate_type: string;
  shaken_valid_until: string;
  road_tax_paid: string;
  jci_insurance_valid_until: string;
  title_type: string;
  registration_location: string;

  engine_type: string;
  power_output: string;
  fuel_efficiency: string;
  drivetrain: string;
  suspension_type: string;
  brakes: string;
  tire_condition: string;
  battery_condition: string;
  hybrid_system_status: string;
  maintenance_history: string;

  power_sliding_doors: string;
  headlights: string;
  fog_lights: string;
  alloy_wheels: boolean;
  spoiler: boolean;
  tinted_windows: boolean;
  roof_type: string;
  side_mirrors: string;
  keyless_entry: boolean;
  remote_door_locking: boolean;
  body_condition: string;
  air_conditioning: string;
  upholstery: string;
  seat_type: string;
  seat_adjustments: string;

  infotainment_system: string[];
  navigation_system: string;
  steering_wheel_controls: string[];
  rear_camera: boolean;
  parking_sensors: string;
  power_windows: string;
  interior_lighting: string;
  cup_holders_storage: boolean;
  child_lock_isofix: boolean;

  abs: boolean;
  esc_stability_control: boolean;
  lane_departure_warning: boolean;
  collision_mitigation: boolean;
  traction_control: boolean;
  hill_start_assist: boolean;
  immobilizer_alarm: boolean;
  seat_belt_sensors: boolean;
  airbags: string[];
  cruise_control: string;

  bluetooth: boolean;
  usb_ports: boolean;
  twelve_v_outlet: boolean;
  smart_key_push_start: boolean;
  display_screen_size: string;
  rear_entertainment_system: boolean;
  voice_command_hands_free: boolean;
  digital_dashboard_display: boolean;
};

type AccessArrangements = {
  vehicle_location_address: string;
  vehicle_access_availability: string;

  key_access_method: string;
  key_pickup_availability: string;
  key_pickup_location: string;
  key_location_details: string;

  emergency_contact_name: string;
  emergency_contact_phone: string;

  availability_for_handover: string;
  power_of_attorney: boolean;
  power_of_attorney_details: string;
  special_instructions: string;

  agreed_to_access_terms: boolean;
  recurring_availability: any[];
};

type FormData = {
  requester_contact_info: ContactInfo;
  vehicle_details: VehicleDetails;
  access_arrangements: AccessArrangements;
  terms_agreed: boolean;
};

export type ManagedSaleRequestEditTarget = {
  id: string;
  submitted_by_user_id?: string;
  status?: string;
  requester_contact_info?: Partial<ContactInfo>;
  vehicle_details?: Partial<VehicleDetails>;
  access_arrangements?: Partial<AccessArrangements>;
  terms_agreed?: boolean;
};

export type ManagedSaleRequestUpdatePayload = {
  requester_contact_info: ContactInfo;
  vehicle_details: VehicleDetails;
  access_arrangements: AccessArrangements;
  terms_agreed: boolean;

  submitted_by_user_id?: string;
  status?: string;

  final_sale_price_for_buyer: number;
  service_fee_amount: number;
  owner_receives_amount: number;
};

type Props = {
  requestToEdit: ManagedSaleRequestEditTarget;
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: ManagedSaleRequestUpdatePayload) => void | Promise<void>;
};

function defaultForm(): FormData {
  return {
    requester_contact_info: { full_name: "", email: "", phone: "" },
    vehicle_details: {
      title: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      mileage: "",
      condition: "good",
      description: "",
      fuel_type: "gasoline",
      transmission: "automatic",
      location: "",
      seller_asking_price: "",
      financing_available: "",
      warranty_available: "",
      warranty_link: "",

      images: [],
      images_thumbnails: [],
      images_small: [],
      images_medium: [],

      drive_type: "2wd",
      engine_size: "",
      body_type: "sedan",
      exterior_color: "",
      interior_color: "",
      doors: 4,
      seating_capacity: 5,
      steering_wheel: "right_hand_drive",

      current_plate_type: "kanji",
      shaken_valid_until: "",
      road_tax_paid: "yes",
      jci_insurance_valid_until: "",
      title_type: "Active",
      registration_location: "okinawa",

      engine_type: "",
      power_output: "",
      fuel_efficiency: "",
      drivetrain: "fwd",
      suspension_type: "",
      brakes: "",
      tire_condition: "good",
      battery_condition: "original",
      hybrid_system_status: "not_applicable",
      maintenance_history: "unknown",

      power_sliding_doors: "none",
      headlights: "halogen",
      fog_lights: "none",
      alloy_wheels: false,
      spoiler: false,
      tinted_windows: false,
      roof_type: "solid",
      side_mirrors: "manual",
      keyless_entry: false,
      remote_door_locking: false,
      body_condition: "no_damage",
      air_conditioning: "manual",
      upholstery: "fabric",
      seat_type: "standard",
      seat_adjustments: "manual",

      infotainment_system: [],
      navigation_system: "none",
      steering_wheel_controls: [],
      rear_camera: false,
      parking_sensors: "none",
      power_windows: "none",
      interior_lighting: "standard",
      cup_holders_storage: false,
      child_lock_isofix: false,

      abs: false,
      esc_stability_control: false,
      lane_departure_warning: false,
      collision_mitigation: false,
      traction_control: false,
      hill_start_assist: false,
      immobilizer_alarm: false,
      seat_belt_sensors: false,
      airbags: [],
      cruise_control: "none",

      bluetooth: false,
      usb_ports: false,
      twelve_v_outlet: false,
      smart_key_push_start: false,
      display_screen_size: "",
      rear_entertainment_system: false,
      voice_command_hands_free: false,
      digital_dashboard_display: false,
    },
    access_arrangements: {
      vehicle_location_address: "",
      vehicle_access_availability: "",

      key_access_method: "direct_handover",
      key_pickup_availability: "",
      key_pickup_location: "",
      key_location_details: "",

      emergency_contact_name: "",
      emergency_contact_phone: "",

      availability_for_handover: "",
      power_of_attorney: false,
      power_of_attorney_details: "",
      special_instructions: "",

      agreed_to_access_terms: false,
      recurring_availability: [],
    },
    terms_agreed: false,
  };
}

function calculateServiceFeeAmount(price: number) {
  if (!price || price <= 0) return 0;
  if (price < 500) return 300;
  if (price <= 3000) return Math.round(300 + (price - 500) * 0.08);
  if (price <= 8333) return 500;
  return Math.round(price * 0.06);
}

export default function RequestFormUI(props: Props) {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLocationVerification, setShowLocationVerification] = useState(false);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>(() => defaultForm());

  useEffect(() => {
    if (!props.isOpen) return;

    const base = defaultForm();
    const r = props.requestToEdit;

    setFormData({
      requester_contact_info: {
        ...base.requester_contact_info,
        ...((r?.requester_contact_info) || {}),
      },
      vehicle_details: {
        ...base.vehicle_details,
        ...((r?.vehicle_details) || {}),
      },
      access_arrangements: {
        ...base.access_arrangements,
        ...((r?.access_arrangements) || {}),
      },
      terms_agreed: r?.terms_agreed ?? base.terms_agreed,
    });

    setCurrentStep(1);
    setValidationErrors({});
    setShowLocationVerification(false);
    setShowSuccessModal(false);
  }, [props.isOpen, props.requestToEdit]);

  const handleInputChange = useCallback(
    <S extends keyof FormData, K extends keyof FormData[S]>(
      section: S,
      field: K,
      value: FormData[S][K],
    ) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      }));
      setValidationErrors((prev) => {
        const next = { ...prev };
        if (next[String(field)]) delete next[String(field)];
        return next;
      });
    },
    [],
  );

  const handleMultiSelectChange = useCallback(
    (section: "vehicle_details", field: "infotainment_system" | "steering_wheel_controls", value: string) => {
      setFormData((prev) => {
        const current = prev[section][field] || [];
        const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
        return {
          ...prev,
          [section]: { ...prev[section], [field]: next },
        };
      });
    },
    [],
  );

 const uploadFiles = useCallback(
  async (files: FileList | File[]) => {
    const list = Array.from(files || []);
    if (list.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadCount(list.length);

    try {
      const formData = new FormData();
      list.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/uploadMsrPhotos", {
        method: "POST",
        body: formData,
        // no Content-Type header — browser sets it with boundary automatically
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const uploadedUrls: string[] = data.urls;

      setFormData((prev) => ({
        ...prev,
        vehicle_details: {
          ...prev.vehicle_details,
          images: [...prev.vehicle_details.images, ...uploadedUrls],
          images_thumbnails: [...prev.vehicle_details.images_thumbnails, ...uploadedUrls],
          images_small: [...prev.vehicle_details.images_small, ...uploadedUrls],
          images_medium: [...prev.vehicle_details.images_medium, ...uploadedUrls],
        },
      }));

      toast({
        title: "Photos uploaded",
        description: `${uploadedUrls.length} photo(s) saved successfully.`,
      });
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload Failed",
        description: "Could not upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadCount(0);
    }
  },
  [isUploading, toast],
);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      await uploadFiles(e.target.files);
      if (imageInputRef.current) imageInputRef.current.value = "";
    },
    [uploadFiles],
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await uploadFiles(e.dataTransfer.files);
      }
    },
    [uploadFiles],
  );

  const removeImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      vehicle_details: {
        ...prev.vehicle_details,
        images: prev.vehicle_details.images.filter((_, i) => i !== index),
        images_thumbnails: prev.vehicle_details.images_thumbnails.filter((_, i) => i !== index),
        images_small: prev.vehicle_details.images_small.filter((_, i) => i !== index),
        images_medium: prev.vehicle_details.images_medium.filter((_, i) => i !== index),
      },
    }));
  }, []);

  const validateCurrentStep = useCallback(() => {
    const errors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.requester_contact_info.full_name?.trim()) errors.full_name = "Full name is required";
      if (!formData.requester_contact_info.email?.trim()) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.requester_contact_info.email)) errors.email = "Email is invalid";
      if (!formData.requester_contact_info.phone?.trim()) errors.phone = "Phone number is required";
    }

    if (currentStep === 2) {
      const v = formData.vehicle_details;
      if (!v.title?.trim()) errors.title = "Vehicle title is required";
      if (!v.make?.trim()) errors.make = "Make is required";
      if (!v.model?.trim()) errors.model = "Model is required";
      if (!v.year || v.year < 1900 || v.year > new Date().getFullYear() + 1) errors.year = "Valid year is required";
      if (v.mileage === "" || Number(v.mileage) < 0) errors.mileage = "Valid mileage is required";
      if (!v.location?.trim()) errors.location = "Location is required";
      if (v.seller_asking_price === "" || Number(v.seller_asking_price) <= 0) errors.seller_asking_price = "Valid asking price is required";
      if (!v.description?.trim()) errors.description = "Description is required";

      if (!v.financing_available?.trim()) errors.financing_available = "Financing availability is required";
      if (!v.warranty_available?.trim()) errors.warranty_available = "Warranty availability is required";

      if (!v.current_plate_type?.trim()) errors.current_plate_type = "Plate type is required";
      if (!v.road_tax_paid?.trim()) errors.road_tax_paid = "Road tax status is required";
      if (!v.title_type?.trim()) errors.title_type = "Title type is required";
      if (!v.registration_location?.trim()) errors.registration_location = "Registration location is required";
    }

    if (currentStep === 3) {
      const v = formData.vehicle_details;
      if (!v.engine_size?.trim() && ["gasoline", "diesel", "hybrid"].includes(v.fuel_type))
        errors.engine_size = "Engine size is required for non-electric vehicles";
      if (!v.exterior_color?.trim()) errors.exterior_color = "Exterior color is required";
      if (!v.interior_color?.trim()) errors.interior_color = "Interior color is required";
    }

    if (currentStep === 7) {
      if (formData.vehicle_details.images.length === 0) errors.images = "At least one photo is required.";
    }

    if (currentStep === 8) {
      const a = formData.access_arrangements;
      if (!a.vehicle_location_address?.trim()) errors.vehicle_location_address = "Vehicle location is required";
      if (!a.vehicle_access_availability?.trim()) errors.vehicle_access_availability = "Access availability is required";
      if (!a.key_pickup_location?.trim()) errors.key_pickup_location = "Key pickup location is required";
      if (!a.key_pickup_availability?.trim()) errors.key_pickup_availability = "Key pickup availability is required";
      if (!a.emergency_contact_name?.trim()) errors.emergency_contact_name = "Emergency contact name is required";
      if (!a.emergency_contact_phone?.trim()) errors.emergency_contact_phone = "Emergency contact phone is required";
      if (!a.agreed_to_access_terms) errors.agreed_to_access_terms = "You must agree to the access terms";
    }

    if (currentStep === 9) {
      if (!formData.terms_agreed) errors.terms_agreed = "You must agree to the terms and service fee";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [currentStep, formData]);

  const steps = useMemo(
    () => [
      { number: 1, title: "Contact Info", icon: User },
      { number: 2, title: "Vehicle Details", icon: Car },
      { number: 3, title: "Specifications", icon: Wrench },
      { number: 4, title: "Performance", icon: Gauge },
      { number: 5, title: "Features", icon: Sparkles },
      { number: 6, title: "Technology", icon: Wifi },
      { number: 7, title: "Photos", icon: Camera },
      { number: 8, title: "Access & Keys", icon: KeyRound },
      { number: 9, title: "Review & Submit", icon: CheckCircle },
    ],
    [],
  );

  const checkOkinawaLocation = useCallback((locationString: string) => {
    if (!locationString) return false;
    const lowerLocation = locationString.toLowerCase();
    return (
      lowerLocation.includes("okinawa") ||
      (lowerLocation.includes("japan") && lowerLocation.includes("okinawa")) ||
      lowerLocation.includes("沖縄")
    );
  }, []);

  const handleNext = useCallback(() => {
    if (!validateCurrentStep()) {
      toast({
        title: "Missing Information",
        description: "Please fill required fields to proceed.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && !showLocationVerification) {
      const location = formData.vehicle_details.location;
      if (location && checkOkinawaLocation(location)) {
        setCurrentStep((p) => Math.min(p + 1, steps.length));
        return;
      }
      setShowLocationVerification(true);
      return;
    }
    setCurrentStep((p) => Math.min(p + 1, steps.length));
  }, [currentStep, showLocationVerification, steps.length, toast, validateCurrentStep, formData.vehicle_details.location, checkOkinawaLocation]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((p) => Math.max(p - 1, 1));
    setValidationErrors({});
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (currentStep !== steps.length) return;
      if (!validateCurrentStep()) {
        toast({ title: "Missing Information", description: "Please complete required fields.", variant: "destructive" });
        return;
      }

      const asking = Number(formData.vehicle_details.seller_asking_price || 0);
      const fee = calculateServiceFeeAmount(asking);
      const buyerPrice = asking + fee;

      const payload: ManagedSaleRequestUpdatePayload = {
        requester_contact_info: formData.requester_contact_info,
        vehicle_details: {
          ...formData.vehicle_details,
          year: Number(formData.vehicle_details.year),
          mileage: formData.vehicle_details.mileage === "" ? 0 : Number(formData.vehicle_details.mileage),
          seller_asking_price: asking,
        },
        access_arrangements: formData.access_arrangements,
        terms_agreed: Boolean(formData.terms_agreed),
  submitted_by_user_id: props.requestToEdit?.submitted_by_user_id,  
  status: props.requestToEdit?.status === "pending_initial_review"
    ? "pending_review"
    : (props.requestToEdit?.status || "pending_review"),  
        final_sale_price_for_buyer: buyerPrice,
        service_fee_amount: fee,
        owner_receives_amount: asking,
      };
      
     console.log("payload",payload);
      setIsSubmitting(true);
      try {
        await props.onSave(payload);
        const isAdminEdit = Boolean(props.requestToEdit?.id);
        if (isAdminEdit) {
          toast({ title: "Details Saved", description: "Status updated to pending_review" });
          props.onClose();
        } else {
          setShowSuccessModal(true);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, props, toast, validateCurrentStep],
  );

  const handleLocationVerified = useCallback(() => {
    setShowLocationVerification(false);
    setCurrentStep((p) => Math.min(p + 1, steps.length));
  }, [steps.length]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccessModal(false);
    props.onClose();
  }, [props]);

  if (!props.isOpen) return null;

  const renderImagePreview = (largeUrl: string, index: number) => {
    const thumbnailUrl = formData.vehicle_details.images_thumbnails[index] || largeUrl;

    return (
      <div key={index} className="relative group">
        <img src={thumbnailUrl} alt={`Vehicle ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeImage(index)}
          disabled={isUploading}
          type="button"
        >
          <X className="w-4 h-4" />
        </Button>
        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Optimized ✓
        </div>
      </div>
    );
  };

  const renderContactInfo = () => (
    <motion.div
      key="contact_info"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          Your Contact Information
        </h2>
        <p className="text-slate-600">This information will be used to contact you regarding your managed sale request.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.requester_contact_info.full_name}
              onChange={(e) => handleInputChange("requester_contact_info", "full_name", e.target.value)}
              placeholder="Your full name"
            />
            {validationErrors.full_name ? <p className="text-sm text-red-500">{validationErrors.full_name}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.requester_contact_info.email}
              onChange={(e) => handleInputChange("requester_contact_info", "email", e.target.value)}
              placeholder="your.email@example.com"
            />
            {validationErrors.email ? <p className="text-sm text-red-500">{validationErrors.email}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.requester_contact_info.phone}
              onChange={(e) => handleInputChange("requester_contact_info", "phone", e.target.value)}
              placeholder="+81 90-1234-5678"
            />
            {validationErrors.phone ? <p className="text-sm text-red-500">{validationErrors.phone}</p> : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderVehicleDetails = () => (
    <motion.div
      key="vehicle_details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Car className="w-7 h-7 text-blue-600" />
          Vehicle Information
        </h2>
        <p className="text-slate-600">Tell us about your car so we can create an accurate listing.</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Vehicle Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="e.g., 2019 Toyota Camry LE"
                value={formData.vehicle_details.title}
                onChange={(e) => handleInputChange("vehicle_details", "title", e.target.value)}
              />
              {validationErrors.title ? <p className="text-sm text-red-500">{validationErrors.title}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller_asking_price">
                Your Asking Price (¥) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="seller_asking_price"
                type="number"
                placeholder="25000"
                value={String(formData.vehicle_details.seller_asking_price)}
                onChange={(e) =>
                  handleInputChange(
                    "vehicle_details",
                    "seller_asking_price",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
              />
              {validationErrors.seller_asking_price ? (
                <p className="text-sm text-red-500">{validationErrors.seller_asking_price}</p>
              ) : null}

              {Number(formData.vehicle_details.seller_asking_price) > 0 ? (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-slate-600 flex justify-between mb-2">
                    <span className="font-medium">Your Asking Price:</span>
                    <span className="font-semibold">
                      ¥{Number(formData.vehicle_details.seller_asking_price).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-blue-600 flex justify-between mt-1">
                    <span className="font-medium">Service Fee:</span>
                    <span className="font-semibold">
                      +¥
                      {calculateServiceFeeAmount(Number(formData.vehicle_details.seller_asking_price)).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm text-blue-800 flex justify-between font-bold border-t border-blue-300 pt-2 mt-2">
                    <span>Vehicle Listing Price:</span>
                    <span>
                      ¥
                      {(
                        Number(formData.vehicle_details.seller_asking_price) +
                        calculateServiceFeeAmount(Number(formData.vehicle_details.seller_asking_price))
                      ).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <Info className="w-3 h-3 inline mr-1" />
                    Buyer sees listing price. Owner receives asking price on sale.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="financing_available">
                Financing Available <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.financing_available || ""}
                onValueChange={(value) => handleInputChange("vehicle_details", "financing_available", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.financing_available ? (
                <p className="text-sm text-red-500">{validationErrors.financing_available}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty_available">
                Warranty Available <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.warranty_available || ""}
                onValueChange={(value) => handleInputChange("vehicle_details", "warranty_available", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="No">No</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.warranty_available ? (
                <p className="text-sm text-red-500">{validationErrors.warranty_available}</p>
              ) : null}

              {formData.vehicle_details.warranty_available === "Yes" ? (
                <div className="mt-2">
                  <Label htmlFor="warranty_link">Warranty Details</Label>
                  <Input
                    id="warranty_link"
                    placeholder="e.g., warranty URL / details"
                    value={formData.vehicle_details.warranty_link || ""}
                    onChange={(e) => handleInputChange("vehicle_details", "warranty_link", e.target.value)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">
                Make <span className="text-red-500">*</span>
              </Label>
              <Input
                id="make"
                placeholder="Toyota"
                value={formData.vehicle_details.make}
                onChange={(e) => handleInputChange("vehicle_details", "make", e.target.value)}
              />
              {validationErrors.make ? <p className="text-sm text-red-500">{validationErrors.make}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">
                Model <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                placeholder="Camry"
                value={formData.vehicle_details.model}
                onChange={(e) => handleInputChange("vehicle_details", "model", e.target.value)}
              />
              {validationErrors.model ? <p className="text-sm text-red-500">{validationErrors.model}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">
                Year <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                type="number"
                placeholder="2019"
                value={String(formData.vehicle_details.year)}
                onChange={(e) => handleInputChange("vehicle_details", "year", e.target.value === "" ? ("" as any) : Number(e.target.value))}
              />
              {validationErrors.year ? <p className="text-sm text-red-500">{validationErrors.year}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileage">
                Mileage (km) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mileage"
                type="number"
                placeholder="50,000"
                value={String(formData.vehicle_details.mileage)}
                onChange={(e) =>
                  handleInputChange("vehicle_details", "mileage", e.target.value === "" ? "" : Number(e.target.value))
                }
              />
              {validationErrors.mileage ? <p className="text-sm text-red-500">{validationErrors.mileage}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="Naha, Okinawa"
                value={formData.vehicle_details.location}
                onChange={(e) => handleInputChange("vehicle_details", "location", e.target.value)}
              />
              {validationErrors.location ? <p className="text-sm text-red-500">{validationErrors.location}</p> : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your vehicle..."
              rows={4}
              value={formData.vehicle_details.description}
              onChange={(e) => handleInputChange("vehicle_details", "description", e.target.value)}
            />
            {validationErrors.description ? <p className="text-sm text-red-500">{validationErrors.description}</p> : null}
          </div>
        </CardContent>

        <div className="mt-8 pt-8 border-t border-slate-200 px-6 pb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            Registration & Inspection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="current_plate_type">
                Current Plate Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.current_plate_type}
                onValueChange={(value) => handleInputChange("vehicle_details", "current_plate_type", value)}
              >
                <SelectTrigger id="current_plate_type">
                  <SelectValue placeholder="Select plate type" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="kanji">Kanji (Japanese Plates)</SelectItem>
                  <SelectItem value="y_plate">Y-Plate (SOFA)</SelectItem>
                  <SelectItem value="a_plate">A-Plate (Civilian)</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.current_plate_type ? (
                <p className="text-sm text-red-500">{validationErrors.current_plate_type}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shaken_valid_until">Shaken (Inspection) Valid Until</Label>
              <Input
                id="shaken_valid_until"
                placeholder="e.g., April 2026"
                value={formData.vehicle_details.shaken_valid_until}
                onChange={(e) => handleInputChange("vehicle_details", "shaken_valid_until", e.target.value)}
              />
              <p className="text-xs text-slate-500">Leave blank if expired</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="road_tax_paid">
                Road Tax Paid <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.vehicle_details.road_tax_paid} onValueChange={(value) => handleInputChange("vehicle_details", "road_tax_paid", value)}>
                <SelectTrigger id="road_tax_paid">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.road_tax_paid ? <p className="text-sm text-red-500">{validationErrors.road_tax_paid}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="jci_insurance_valid_until">JCI Insurance Valid Until</Label>
              <Input
                id="jci_insurance_valid_until"
                placeholder="e.g., April 2026"
                value={formData.vehicle_details.jci_insurance_valid_until}
                onChange={(e) => handleInputChange("vehicle_details", "jci_insurance_valid_until", e.target.value)}
              />
              <p className="text-xs text-slate-500">Leave blank if expired</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_type">
                Title Type <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.vehicle_details.title_type} onValueChange={(value) => handleInputChange("vehicle_details", "title_type", value)}>
                <SelectTrigger id="title_type">
                  <SelectValue placeholder="Select title type" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deregistered">Deregistered</SelectItem>
                  <SelectItem value="Pending Initial Registration">Pending Initial Registration</SelectItem>
                  <SelectItem value="For Shipment Only">For Shipment Only</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.title_type ? <p className="text-sm text-red-500">{validationErrors.title_type}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_location">
                Registration Location <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.registration_location}
                onValueChange={(value) => handleInputChange("vehicle_details", "registration_location", value)}
              >
                <SelectTrigger id="registration_location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="okinawa">Okinawa</SelectItem>
                  <SelectItem value="mainland_japan">Mainland Japan</SelectItem>
                  <SelectItem value="us_import">US Import</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.registration_location ? <p className="text-sm text-red-500">{validationErrors.registration_location}</p> : null}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const renderSpecifications = () => (
    <motion.div
      key="specifications"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Wrench className="w-7 h-7 text-blue-600" />
          Vehicle Specifications
        </h2>
        <p className="text-slate-600">Provide detailed specifications about your vehicle</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="transmission">Transmission</Label>
            <Select value={formData.vehicle_details.transmission} onValueChange={(value) => handleInputChange("vehicle_details", "transmission", value)}>
              <SelectTrigger id="transmission">
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="cvt">CVT</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="drive_type">Drive Type</Label>
            <Select value={formData.vehicle_details.drive_type} onValueChange={(value) => handleInputChange("vehicle_details", "drive_type", value)}>
              <SelectTrigger id="drive_type">
                <SelectValue placeholder="Select drive type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="2wd">2WD (Front or Rear Wheel Drive)</SelectItem>
                <SelectItem value="4wd">4WD (Four Wheel Drive)</SelectItem>
                <SelectItem value="awd">AWD (All Wheel Drive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel_type">Fuel Type</Label>
            <Select value={formData.vehicle_details.fuel_type} onValueChange={(value) => handleInputChange("vehicle_details", "fuel_type", value)}>
              <SelectTrigger id="fuel_type">
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engine_size">
              Engine Size{" "}
              {["gasoline", "diesel", "hybrid"].includes(formData.vehicle_details.fuel_type) ? (
                <span className="text-red-500">*</span>
              ) : null}
            </Label>
            <Input
              id="engine_size"
              placeholder="e.g., 1.2L (1242cc)"
              value={formData.vehicle_details.engine_size}
              onChange={(e) => handleInputChange("vehicle_details", "engine_size", e.target.value)}
              disabled={formData.vehicle_details.fuel_type === "electric"}
              className={formData.vehicle_details.fuel_type === "electric" ? "bg-slate-100" : ""}
            />
            {validationErrors.engine_size ? <p className="text-sm text-red-500">{validationErrors.engine_size}</p> : null}
            {formData.vehicle_details.fuel_type === "electric" ? (
              <p className="text-xs text-slate-500 mt-1">N/A for electric vehicles</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_type">Body Type</Label>
            <Select value={formData.vehicle_details.body_type} onValueChange={(value) => handleInputChange("vehicle_details", "body_type", value)}>
              <SelectTrigger id="body_type">
                <SelectValue placeholder="Select body type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="compact_van">Compact Van</SelectItem>
                <SelectItem value="hatchback">Hatchback</SelectItem>
                <SelectItem value="wagon">Wagon</SelectItem>
                <SelectItem value="sedan">Sedan</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="truck">Truck</SelectItem>
                <SelectItem value="coupe">Coupe</SelectItem>
                <SelectItem value="convertible">Convertible</SelectItem>
                <SelectItem value="minivan">Minivan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exterior_color">
              Exterior Color <span className="text-red-500">*</span>
            </Label>
            <Input
              id="exterior_color"
              placeholder="e.g., Pearl White, Red, Black"
              value={formData.vehicle_details.exterior_color}
              onChange={(e) => handleInputChange("vehicle_details", "exterior_color", e.target.value)}
            />
            {validationErrors.exterior_color ? <p className="text-sm text-red-500">{validationErrors.exterior_color}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="interior_color">
              Interior Color <span className="text-red-500">*</span>
            </Label>
            <Input
              id="interior_color"
              placeholder="e.g., Black, Gray, Beige"
              value={formData.vehicle_details.interior_color}
              onChange={(e) => handleInputChange("vehicle_details", "interior_color", e.target.value)}
            />
            {validationErrors.interior_color ? <p className="text-sm text-red-500">{validationErrors.interior_color}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doors">Number of Doors</Label>
            <Select value={String(formData.vehicle_details.doors)} onValueChange={(value) => handleInputChange("vehicle_details", "doors", Number(value))}>
              <SelectTrigger id="doors">
                <SelectValue placeholder="Select doors" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="2">2 Doors</SelectItem>
                <SelectItem value="3">3 Doors</SelectItem>
                <SelectItem value="4">4 Doors</SelectItem>
                <SelectItem value="5">5 Doors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seating_capacity">Seating Capacity</Label>
            <Select value={String(formData.vehicle_details.seating_capacity)} onValueChange={(value) => handleInputChange("vehicle_details", "seating_capacity", Number(value))}>
              <SelectTrigger id="seating_capacity">
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="2">2 Passengers</SelectItem>
                <SelectItem value="4">4 Passengers</SelectItem>
                <SelectItem value="5">5 Passengers</SelectItem>
                <SelectItem value="6">6 Passengers</SelectItem>
                <SelectItem value="7">7 Passengers</SelectItem>
                <SelectItem value="8">8 Passengers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="steering_wheel">Steering Wheel</Label>
            <Select value={formData.vehicle_details.steering_wheel} onValueChange={(value) => handleInputChange("vehicle_details", "steering_wheel", value)}>
              <SelectTrigger id="steering_wheel">
                <SelectValue placeholder="Select steering position" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="right_hand_drive">Right-Hand Drive</SelectItem>
                <SelectItem value="left_hand_drive">Left-Hand Drive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Overall Condition</Label>
            <Select value={formData.vehicle_details.condition} onValueChange={(value) => handleInputChange("vehicle_details", "condition", value)}>
              <SelectTrigger id="condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="needs_repair">Needs Repair</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These details help buyers and improve listing quality.
        </p>
      </div>
    </motion.div>
  );

  const renderPerformance = () => (
    <motion.div
      key="performance"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Gauge className="w-7 h-7 text-blue-600" />
          Performance & Mechanical
        </h2>
        <p className="text-slate-600">Technical details about your vehicle's performance and condition</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="engine_type">Engine Type</Label>
            <Input
              id="engine_type"
              placeholder="e.g., Inline 4, Turbocharged"
              value={formData.vehicle_details.engine_type}
              onChange={(e) => handleInputChange("vehicle_details", "engine_type", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="power_output">Power Output</Label>
            <Input
              id="power_output"
              placeholder="e.g., 90 HP (67 kW)"
              value={formData.vehicle_details.power_output}
              onChange={(e) => handleInputChange("vehicle_details", "power_output", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel_efficiency">Fuel Efficiency</Label>
            <Input
              id="fuel_efficiency"
              placeholder="e.g., 20-25 km/L"
              value={formData.vehicle_details.fuel_efficiency}
              onChange={(e) => handleInputChange("vehicle_details", "fuel_efficiency", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="drivetrain">Drivetrain</Label>
            <Select value={formData.vehicle_details.drivetrain} onValueChange={(value) => handleInputChange("vehicle_details", "drivetrain", value)}>
              <SelectTrigger id="drivetrain">
                <SelectValue placeholder="Select drivetrain" />
              </SelectTrigger>
              <SelectContent className="z-[200]" >
                <SelectItem value="fwd">FWD (Front-Wheel Drive)</SelectItem>
                <SelectItem value="rwd">RWD (Rear-Wheel Drive)</SelectItem>
                <SelectItem value="awd">AWD (All-Wheel Drive)</SelectItem>
                <SelectItem value="4wd">4WD (Four-Wheel Drive)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="suspension_type">Suspension Type</Label>
            <Input
              id="suspension_type"
              placeholder="e.g., MacPherson Strut"
              value={formData.vehicle_details.suspension_type}
              onChange={(e) => handleInputChange("vehicle_details", "suspension_type", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brakes">Brake System</Label>
            <Input
              id="brakes"
              placeholder="e.g., Disc (Front), Drum (Rear)"
              value={formData.vehicle_details.brakes}
              onChange={(e) => handleInputChange("vehicle_details", "brakes", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tire_condition">Tire Condition</Label>
            <Select value={formData.vehicle_details.tire_condition} onValueChange={(value) => handleInputChange("vehicle_details", "tire_condition", value)}>
              <SelectTrigger id="tire_condition">
                <SelectValue placeholder="Select tire condition" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="worn">Worn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="battery_condition">Battery Condition</Label>
            <Select value={formData.vehicle_details.battery_condition} onValueChange={(value) => handleInputChange("vehicle_details", "battery_condition", value)}>
              <SelectTrigger id="battery_condition">
                <SelectValue placeholder="Select battery condition" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="recently_replaced">Recently Replaced</SelectItem>
                <SelectItem value="original">Original</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hybrid_system_status">Hybrid System Status</Label>
            <Select
              value={formData.vehicle_details.hybrid_system_status}
              onValueChange={(value) => handleInputChange("vehicle_details", "hybrid_system_status", value)}
            >
              <SelectTrigger id="hybrid_system_status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="ok">OK</SelectItem>
                <SelectItem value="service_needed">Service Needed</SelectItem>
                <SelectItem value="not_applicable">Not Applicable</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Select "Not Applicable" for non-hybrid vehicles</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance_history">Maintenance History</Label>
            <Select
              value={formData.vehicle_details.maintenance_history}
              onValueChange={(value) => handleInputChange("vehicle_details", "maintenance_history", value)}
            >
              <SelectTrigger id="maintenance_history">
                <SelectValue placeholder="Select history" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="full">Full (Complete Records Available)</SelectItem>
                <SelectItem value="partial">Partial (Some Records Available)</SelectItem>
                <SelectItem value="unknown">Unknown (No Records Available)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All fields on this page are optional. Providing accurate details can increase buyer trust.
        </p>
      </div>
    </motion.div>
  );

  const renderFeatures = () => (
    <motion.div
      key="features"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-blue-600" />
            Exterior Features
          </h2>
          <p className="text-slate-600">Select exterior features and options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="power_sliding_doors">Power Sliding Doors</Label>
            <Select value={formData.vehicle_details.power_sliding_doors} onValueChange={(value) => handleInputChange("vehicle_details", "power_sliding_doors", value)}>
              <SelectTrigger id="power_sliding_doors">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headlights">Headlights</Label>
            <Select value={formData.vehicle_details.headlights} onValueChange={(value) => handleInputChange("vehicle_details", "headlights", value)}>
              <SelectTrigger id="headlights">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="led">LED</SelectItem>
                <SelectItem value="halogen">Halogen</SelectItem>
                <SelectItem value="projector">Projector</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fog_lights">Fog Lights</Label>
            <Select value={formData.vehicle_details.fog_lights} onValueChange={(value) => handleInputChange("vehicle_details", "fog_lights", value)}>
              <SelectTrigger id="fog_lights">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="rear">Rear</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="roof_type">Roof Type</Label>
            <Select value={formData.vehicle_details.roof_type} onValueChange={(value) => handleInputChange("vehicle_details", "roof_type", value)}>
              <SelectTrigger id="roof_type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="sunroof">Sunroof</SelectItem>
                <SelectItem value="panoramic">Panoramic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="side_mirrors">Side Mirrors</Label>
            <Select value={formData.vehicle_details.side_mirrors} onValueChange={(value) => handleInputChange("vehicle_details", "side_mirrors", value)}>
              <SelectTrigger id="side_mirrors">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="power_fold">Power Fold</SelectItem>
                <SelectItem value="heated">Heated</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body_condition">Body Condition</Label>
            <Select value={formData.vehicle_details.body_condition} onValueChange={(value) => handleInputChange("vehicle_details", "body_condition", value)}>
              <SelectTrigger id="body_condition">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="no_damage">No Damage</SelectItem>
                <SelectItem value="minor_scratches">Minor Scratches</SelectItem>
                <SelectItem value="repaired_damage">Repaired Damage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="alloy_wheels"
                checked={formData.vehicle_details.alloy_wheels}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "alloy_wheels", Boolean(checked))}
              />
              <Label htmlFor="alloy_wheels" className="cursor-pointer">Alloy Wheels</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="spoiler"
                checked={formData.vehicle_details.spoiler}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "spoiler", Boolean(checked))}
              />
              <Label htmlFor="spoiler" className="cursor-pointer">Spoiler</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="tinted_windows"
                checked={formData.vehicle_details.tinted_windows}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "tinted_windows", Boolean(checked))}
              />
              <Label htmlFor="tinted_windows" className="cursor-pointer">Tinted Windows</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="keyless_entry"
                checked={formData.vehicle_details.keyless_entry}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "keyless_entry", Boolean(checked))}
              />
              <Label htmlFor="keyless_entry" className="cursor-pointer">Keyless Entry</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remote_door_locking"
                checked={formData.vehicle_details.remote_door_locking}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "remote_door_locking", Boolean(checked))}
              />
              <Label htmlFor="remote_door_locking" className="cursor-pointer">Remote Door Locking</Label>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            Interior Features
          </h2>
          <p className="text-slate-600">Select interior features and comfort options</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="air_conditioning">Air Conditioning / Climate Control</Label>
            <Select value={formData.vehicle_details.air_conditioning} onValueChange={(value) => handleInputChange("vehicle_details", "air_conditioning", value)}>
              <SelectTrigger id="air_conditioning">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="auto_dual_zone">Auto Dual-Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="upholstery">Upholstery</Label>
            <Select value={formData.vehicle_details.upholstery} onValueChange={(value) => handleInputChange("vehicle_details", "upholstery", value)}>
              <SelectTrigger id="upholstery">
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="fabric">Fabric</SelectItem>
                <SelectItem value="leather">Leather</SelectItem>
                <SelectItem value="synthetic">Synthetic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seat_type">Seat Type</Label>
            <Select value={formData.vehicle_details.seat_type} onValueChange={(value) => handleInputChange("vehicle_details", "seat_type", value)}>
              <SelectTrigger id="seat_type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="captain">Captain</SelectItem>
                <SelectItem value="fold_flat">Fold-Flat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seat_adjustments">Seat Adjustments</Label>
            <Select value={formData.vehicle_details.seat_adjustments} onValueChange={(value) => handleInputChange("vehicle_details", "seat_adjustments", value)}>
              <SelectTrigger id="seat_adjustments">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parking_sensors">Parking Sensors</Label>
            <Select value={formData.vehicle_details.parking_sensors} onValueChange={(value) => handleInputChange("vehicle_details", "parking_sensors", value)}>
              <SelectTrigger id="parking_sensors">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="rear">Rear</SelectItem>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="power_windows">Power Windows</Label>
            <Select value={formData.vehicle_details.power_windows} onValueChange={(value) => handleInputChange("vehicle_details", "power_windows", value)}>
              <SelectTrigger id="power_windows">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="front">Front</SelectItem>
                <SelectItem value="rear">Rear</SelectItem>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interior_lighting">Interior Lighting</Label>
            <Select value={formData.vehicle_details.interior_lighting} onValueChange={(value) => handleInputChange("vehicle_details", "interior_lighting", value)}>
              <SelectTrigger id="interior_lighting">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="led">LED</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rear_camera"
                checked={formData.vehicle_details.rear_camera}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "rear_camera", Boolean(checked))}
              />
              <Label htmlFor="rear_camera" className="cursor-pointer">Rear Camera</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="cup_holders_storage"
                checked={formData.vehicle_details.cup_holders_storage}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "cup_holders_storage", Boolean(checked))}
              />
              <Label htmlFor="cup_holders_storage" className="cursor-pointer">Cup Holders / Storage Compartments</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="child_lock_isofix"
                checked={formData.vehicle_details.child_lock_isofix}
                onCheckedChange={(checked) => handleInputChange("vehicle_details", "child_lock_isofix", Boolean(checked))}
              />
              <Label htmlFor="child_lock_isofix" className="cursor-pointer">Child Lock / ISOFIX</Label>
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600" />
            Safety & Security
          </h2>
          <p className="text-slate-600">Select safety and security features</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="cruise_control">Cruise Control</Label>
            <Select value={formData.vehicle_details.cruise_control} onValueChange={(value) => handleInputChange("vehicle_details", "cruise_control", value)}>
              <SelectTrigger id="cruise_control">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="adaptive">Adaptive</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div />

          <div className="space-y-3 md:col-span-2">
            {[
              ["abs", "ABS (Anti-lock Braking System)"],
              ["esc_stability_control", "ESC / Stability Control"],
              ["lane_departure_warning", "Lane Departure Warning"],
              ["collision_mitigation", "Collision Mitigation / Braking Assist"],
              ["traction_control", "Traction Control"],
              ["hill_start_assist", "Hill Start Assist"],
              ["immobilizer_alarm", "Immobilizer / Alarm System"],
              ["seat_belt_sensors", "Seat Belt Sensors"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={(formData.vehicle_details as any)[key]}
                  onCheckedChange={(checked) => handleInputChange("vehicle_details", key as any, Boolean(checked) as any)}
                />
                <Label htmlFor={key} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-3 md:col-span-2 border-t pt-6">
            <Label className="text-base font-semibold">Airbags</Label>
            <p className="text-sm text-slate-600 mb-3">Select all airbag locations that apply</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                ["front", "Front"],
                ["side", "Side"],
                ["curtain", "Curtain"],
              ].map(([val, lab]) => (
                <div key={val} className="flex items-center space-x-2">
                  <Checkbox
                    id={`airbag_${val}`}
                    checked={formData.vehicle_details.airbags?.includes(val)}
                    onCheckedChange={(checked) => {
                      const current = formData.vehicle_details.airbags || [];
                      const next = Boolean(checked)
                        ? [...current.filter((x) => x !== "none"), val]
                        : current.filter((x) => x !== val);
                      handleInputChange("vehicle_details", "airbags", next);
                    }}
                  />
                  <Label htmlFor={`airbag_${val}`} className="cursor-pointer">{lab}</Label>
                </div>
              ))}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="airbag_none"
                  checked={formData.vehicle_details.airbags?.includes("none")}
                  onCheckedChange={(checked) => handleInputChange("vehicle_details", "airbags", Boolean(checked) ? ["none"] : [])}
                />
                <Label htmlFor="airbag_none" className="cursor-pointer">None</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All features on this page are optional.
        </p>
      </div>
    </motion.div>
  );

  const renderTechnology = () => (
    <motion.div
      key="tech"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Wifi className="w-7 h-7 text-blue-600" />
          Technology
        </h2>
        <p className="text-slate-600">Advanced features and connectivity options</p>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="space-y-3 md:col-span-2">
            {[
              ["bluetooth", "Bluetooth Connectivity"],
              ["usb_ports", "USB Ports"],
              ["twelve_v_outlet", "12V Power Outlet"],
              ["smart_key_push_start", "Smart Key / Push Button Start"],
              ["rear_entertainment_system", "Rear Entertainment System"],
              ["voice_command_hands_free", "Voice Command / Hands-Free System"],
              ["digital_dashboard_display", "Digital Dashboard Display"],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={(formData.vehicle_details as any)[key]}
                  onCheckedChange={(checked) => handleInputChange("vehicle_details", key as any, Boolean(checked) as any)}
                />
                <Label htmlFor={key} className="cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_screen_size">Display Screen Size</Label>
            <Input
              id="display_screen_size"
              placeholder="e.g., 7-inch, 10.25-inch"
              value={formData.vehicle_details.display_screen_size}
              onChange={(e) => handleInputChange("vehicle_details", "display_screen_size", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-slate-700 mb-2">Infotainment System</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                ["apple_carplay", "Apple CarPlay"],
                ["android_auto", "Android Auto"],
                ["touchscreen", "Touchscreen"],
                ["premium_sound", "Premium Sound System"],
              ].map(([val, lab]) => (
                <div key={val} className="flex items-center space-x-2">
                  <Checkbox
                    id={`infotainment_${val}`}
                    checked={formData.vehicle_details.infotainment_system?.includes(val)}
                    onCheckedChange={() => handleMultiSelectChange("vehicle_details", "infotainment_system", val)}
                  />
                  <Label htmlFor={`infotainment_${val}`} className="cursor-pointer">{lab}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="navigation_system">Navigation System</Label>
            <Select value={formData.vehicle_details.navigation_system} onValueChange={(value) => handleInputChange("vehicle_details", "navigation_system", value)}>
              <SelectTrigger id="navigation_system">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="built_in">Built-in</SelectItem>
                <SelectItem value="optional">Optional</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="block text-sm font-medium text-slate-700 mb-2">Steering Wheel Controls</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                ["audio", "Audio"],
                ["cruise_control", "Cruise Control"],
                ["phone_call", "Phone Call"],
                ["voice_command", "Voice Command"],
              ].map(([val, lab]) => (
                <div key={val} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sw_${val}`}
                    checked={formData.vehicle_details.steering_wheel_controls?.includes(val)}
                    onCheckedChange={() => handleMultiSelectChange("vehicle_details", "steering_wheel_controls", val)}
                  />
                  <Label htmlFor={`sw_${val}`} className="cursor-pointer">{lab}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All fields on this page are optional.
        </p>
      </div>
    </motion.div>
  );

  const renderPhotos = () => (
    <motion.div
      key="photos"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-blue-600" />
          Vehicle Photos <span className="text-red-500">*</span>
        </h2>
        <p className="text-slate-600">Upload clear photos to help create the best listing.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => imageInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <p className="text-sm text-slate-500">
                  Adding {uploadCount > 0 ? `${uploadCount} file(s)...` : "..."}
                </p>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 text-slate-400 mb-3" />
                <p className="font-semibold text-slate-700">Upload files or drag and drop</p>
                <p className="text-sm text-slate-500">PNG, JPG, GIF up to 30MB each (will be processed on client and server)</p>
              </>
            )}

            <Input
              ref={imageInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/gif, image/webp"
              disabled={isUploading}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {formData.vehicle_details.images.map((largeUrl, index) => renderImagePreview(largeUrl, index))}

            {isUploading && uploadCount > 0
              ? Array.from({ length: uploadCount }).map((_, index) => (
                  <div key={`upload-${index}`} className="relative">
                    <div className="w-full h-32 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="text-white text-xs">Processing...</div>
                    </div>
                  </div>
                ))
              : null}
          </div>

          {validationErrors.images ? <p className="text-sm text-red-500 mt-4">{validationErrors.images}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderAccessArrangements = () => (
    <motion.div
      key="access_arrangements"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-blue-600" />
          Access Arrangements
        </h2>
        <p className="text-slate-600">How can we access the vehicle for photos, inspections, and car viewing?</p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <Label htmlFor="vehicle_location_address" className="text-sm font-semibold text-slate-700">
              Vehicle Current Location Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="vehicle_location_address"
              value={formData.access_arrangements.vehicle_location_address}
              onChange={(e) => handleInputChange("access_arrangements", "vehicle_location_address", e.target.value)}
              placeholder="e.g., 123 Main Street, Naha, Okinawa"
              className="mt-1"
            />
            {validationErrors.vehicle_location_address ? (
              <p className="text-sm text-red-500">{validationErrors.vehicle_location_address}</p>
            ) : null}
          </div>

          <div>
            <Label htmlFor="vehicle_access_availability" className="text-sm font-semibold text-slate-700">
              When can we access the vehicle? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="vehicle_access_availability"
              value={formData.access_arrangements.vehicle_access_availability}
              onChange={(e) => handleInputChange("access_arrangements", "vehicle_access_availability", e.target.value)}
              placeholder="e.g., Weekdays 9 AM - 5 PM, Weekends by appointment"
              className="mt-1"
              rows={3}
            />
            {validationErrors.vehicle_access_availability ? (
              <p className="text-sm text-red-500">{validationErrors.vehicle_access_availability}</p>
            ) : null}
          </div>

          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-800">Key Access Information</h3>
            </div>

            <div>
              <Label htmlFor="key_access_method" className="text-sm font-semibold text-slate-700">
                How can we access the vehicle keys? <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.access_arrangements.key_access_method}
                onValueChange={(value) => handleInputChange("access_arrangements", "key_access_method", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select key access method" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="direct_handover">Direct handover to Speedyo Staff</SelectItem>
                  <SelectItem value="lockbox">Lockbox at vehicle location</SelectItem>
                  <SelectItem value="key_dropoff">Key drop-off at specified location</SelectItem>
                  <SelectItem value="emergency_contact">Through emergency contact</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="key_pickup_location" className="text-sm font-semibold text-slate-700">
                Key Pickup Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="key_pickup_location"
                value={formData.access_arrangements.key_pickup_location}
                onChange={(e) => handleInputChange("access_arrangements", "key_pickup_location", e.target.value)}
                placeholder="Where can we pick up the keys?"
                className="mt-1"
              />
              {validationErrors.key_pickup_location ? (
                <p className="text-sm text-red-500">{validationErrors.key_pickup_location}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="key_pickup_availability" className="text-sm font-semibold text-slate-700">
                Key Pickup Availability <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="key_pickup_availability"
                value={formData.access_arrangements.key_pickup_availability}
                onChange={(e) => handleInputChange("access_arrangements", "key_pickup_availability", e.target.value)}
                placeholder="When are you available for key handover? (days/times)"
                className="mt-1"
                rows={2}
              />
              {validationErrors.key_pickup_availability ? (
                <p className="text-sm text-red-500">{validationErrors.key_pickup_availability}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="key_location_details" className="text-sm font-semibold text-slate-700">
                Additional Key Access Details
              </Label>
              <Textarea
                id="key_location_details"
                value={formData.access_arrangements.key_location_details}
                onChange={(e) => handleInputChange("access_arrangements", "key_location_details", e.target.value)}
                placeholder="Any special instructions..."
                className="mt-1"
                rows={2}
              />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">Emergency Contact Information</h3>
            </div>

            <div>
              <Label htmlFor="emergency_contact_name" className="text-sm font-semibold text-slate-700">
                Emergency Contact Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emergency_contact_name"
                value={formData.access_arrangements.emergency_contact_name}
                onChange={(e) => handleInputChange("access_arrangements", "emergency_contact_name", e.target.value)}
                placeholder="Full name"
                className="mt-1"
              />
              {validationErrors.emergency_contact_name ? (
                <p className="text-sm text-red-500">{validationErrors.emergency_contact_name}</p>
              ) : null}
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone" className="text-sm font-semibold text-slate-700">
                Emergency Contact Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="\+?[0-9 ()-]{7,20}"
                value={formData.access_arrangements.emergency_contact_phone}
                onChange={(e) => handleInputChange("access_arrangements", "emergency_contact_phone", e.target.value)}
                onBlur={(e) => {
                  // best-effort sanitization: remove extra whitespace and any characters except +, digits, space, parentheses and hyphen
                  const raw = e.target.value || "";
                  const sanitized = raw.replace(/\s+/g, ' ').trim().replace(/[^+0-9 ()-]/g, '');
                  if (sanitized !== raw) handleInputChange("access_arrangements", "emergency_contact_phone", sanitized as any);
                }}
                placeholder={"Mobile number (e.g., +81 90 1234 5678)"}
                className="mt-1"
              />
              {validationErrors.emergency_contact_phone ? (
                <p className="text-sm text-red-500">{validationErrors.emergency_contact_phone}</p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability_for_handover">Availability for Handover</Label>
            <Textarea
              id="availability_for_handover"
              rows={3}
              value={formData.access_arrangements.availability_for_handover}
              onChange={(e) => handleInputChange("access_arrangements", "availability_for_handover", e.target.value)}
              placeholder="e.g., Weekdays 9 AM - 5 PM..."
            />
          </div>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileCheck2 className="w-5 h-5 text-blue-500" />
                Power of Attorney (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
                <p className="text-sm text-blue-800">
                  Providing a Power of Attorney allows Speedyo to handle paperwork on your behalf.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="power_of_attorney"
                  checked={formData.access_arrangements.power_of_attorney}
                  onCheckedChange={(checked) => handleInputChange("access_arrangements", "power_of_attorney", Boolean(checked))}
                />
                <Label htmlFor="power_of_attorney" className="text-sm">
                  I will provide a Power of Attorney.
                </Label>
              </div>

              <AnimatePresence>
                {formData.access_arrangements.power_of_attorney ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <Label htmlFor="power_of_attorney_details">Notes on Power of Attorney</Label>
                    <Textarea
                      id="power_of_attorney_details"
                      value={formData.access_arrangements.power_of_attorney_details}
                      onChange={(e) => handleInputChange("access_arrangements", "power_of_attorney_details", e.target.value)}
                      placeholder="Notes..."
                    />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Other Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div>
                <Label htmlFor="special_instructions">Special Instructions or Notes for Speedyo</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.access_arrangements.special_instructions}
                  onChange={(e) => handleInputChange("access_arrangements", "special_instructions", e.target.value)}
                  placeholder="Anything else we should know?"
                />
              </div>

              <div className="flex items-start space-x-2 mt-4">
                <Checkbox
                  id="agreed_to_access_terms"
                  checked={formData.access_arrangements.agreed_to_access_terms}
                  onCheckedChange={(checked) => handleInputChange("access_arrangements", "agreed_to_access_terms", Boolean(checked))}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor="agreed_to_access_terms" className="text-sm">
                    I agree to provide safe and reasonable access. <span className="text-red-500">*</span>
                  </Label>
                  {validationErrors.agreed_to_access_terms ? (
                    <p className="text-sm text-red-500">{validationErrors.agreed_to_access_terms}</p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderReviewAndSubmit = () => {
    const asking = Number(formData.vehicle_details.seller_asking_price || 0);
    const fee = calculateServiceFeeAmount(asking);
    const buyer = asking + fee;

    const formatValue = (value: any) => {
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
      if (typeof value === "string" && value.includes("_")) return value.split("_").join(" ");
      return value || "-";
    };

    return (
      <motion.div
        key="review_submit"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            Review & Submit
          </h2>
          <p className="text-slate-600">Please review all details before submitting.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <JapaneseYenIcon className="w-5 h-5 text-emerald-500" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Your Asking Price:</span>
              <span className="font-semibold">¥{asking.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>Service Fee (added to listing):</span>
              <span className="font-semibold">+¥{fee.toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-300 pt-2 flex justify-between text-lg font-bold text-blue-800">
              <span>Vehicle Listing Price:</span>
              <span>¥{buyer.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5 text-blue-500" />
              Vehicle Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Title:</span><span className="font-medium text-slate-800">{formData.vehicle_details.title || "-"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Make & Model:</span><span className="font-medium text-slate-800">{`${formData.vehicle_details.make || "-"} ${formData.vehicle_details.model || "-"}`}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Year:</span><span className="font-medium text-slate-800">{formData.vehicle_details.year || "-"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Mileage:</span><span className="font-medium text-slate-800">{formatValue(formData.vehicle_details.mileage)} km</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Location:</span><span className="font-medium text-slate-800">{formData.vehicle_details.location || "-"}</span></div>
          </CardContent>
        </Card>

        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms_agreed"
              checked={formData.terms_agreed}
              onCheckedChange={(checked) => setFormData((p) => ({ ...p, terms_agreed: Boolean(checked) }))}
              className="mt-1"
            />
            <div>
              <Label htmlFor="terms_agreed" className="text-sm text-blue-800 cursor-pointer">
                I agree to Speedyo's managed sale terms and service fee. <span className="text-red-500">*</span>
              </Label>
              {validationErrors.terms_agreed ? (
                <p className="text-sm text-red-500 mt-1">{validationErrors.terms_agreed}</p>
              ) : null}
            </div>
          </div>
        </div>

        <Alert>
          <MapPin className="w-4 h-4" />
          <AlertDescription>
            <strong>Service Area Notice:</strong> This service is currently available in Okinawa, Japan only.
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderContactInfo();
      case 2:
        return renderVehicleDetails();
      case 3:
        return renderSpecifications();
      case 4:
        return renderPerformance();
      case 5:
        return renderFeatures();
      case 6:
        return renderTechnology();
      case 7:
        return renderPhotos();
      case 8:
        return renderAccessArrangements();
      case 9:
        return renderReviewAndSubmit();
      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        {showLocationVerification && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
            onClick={() => setShowLocationVerification(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <LocationVerification
                user={{ location: formData.vehicle_details.location }}
                onVerificationComplete={handleLocationVerified}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] overflow-y-auto p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-500 to-emerald-500">
              <div>
                <h2 className="text-2xl font-bold text-white">Request Managed Sale Service</h2>
                <p className="text-white/90 mt-1">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={props.onClose} disabled={isSubmitting} className="text-white hover:bg-white/20" type="button">
                <X className="w-5 h-5" />
              </Button>
            </div>

            
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </div>
              <div className="flex justify-between mt-3">
                {steps.map((s) => (
                  <span
                    key={s.number}
                    className={`text-xs font-medium ${
                      currentStep === s.number ? "text-blue-600" : currentStep > s.number ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {s.title}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); }}>
              <input type="submit" style={{ display: 'none' }} disabled />
              <div className="p-6 flex-grow max-h-[60vh] overflow-y-auto">
                <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
              </div>

              <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1 || isSubmitting} type="button">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button onClick={handleNext} disabled={isSubmitting} type="button">
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal ? <SuccessModal isOpen={showSuccessModal} onClose={handleSuccessClose} /> : null}
      </AnimatePresence>
    </>
  );
}
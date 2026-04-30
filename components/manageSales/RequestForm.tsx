import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/TextArea';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
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
  Shield, // New Icon
  Wifi // Add Wifi icon for Technology
} from 'lucide-react';
import SuccessModal from './SuccessModal';
import LocationVerification from './LocationVerification';
import { useToast } from "@/components/ui/UseToast";

// Helper function to construct absolute URLs, primarily for client-side navigation
// This function is still useful for general client-side routing logic if needed,
// but for specific API/email/notification links, we will use direct paths.
const getBaseUrlForClient = () => {
  // Use window.location.origin for client-side generated URLs if available
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
};

// Client-side image processor with precise dimension and size control
const processImageToMultipleSizes = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const img = new Image();

      img.onload = async () => {
        try {
          // Define target sizes
          const sizes = [
          { name: 'thumbnail', width: 150, quality: 0.75, maxSizeKB: 100 },
          { name: 'small', width: 640, quality: 0.80, maxSizeKB: 150 },
          { name: 'medium', width: 1024, quality: 0.80, maxSizeKB: 200 },
          { name: 'large', width: 1920, quality: 0.85, maxSizeKB: 250 }];


          const results = {};
          const stats = [];

          for (const sizeConfig of sizes) {
            let targetWidth = img.width;
            let targetHeight = img.height;

            // Only resize if the image is larger than the target width/dimension
            if (img.width > sizeConfig.width || img.height > sizeConfig.width) {
              const ratio = Math.min(sizeConfig.width / img.width, sizeConfig.width / img.height);
              targetWidth = Math.round(img.width * ratio);
              targetHeight = Math.round(img.height * ratio);
            }

            // Create canvas and resize
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

            // Convert to WebP with iterative quality adjustment
            let quality = sizeConfig.quality;
            let blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
            let attempts = 0;
            const maxAttempts = 5;

            // Reduce quality until we meet the size target
            if (sizeConfig.maxSizeKB) {
              const maxSizeBytes = sizeConfig.maxSizeKB * 1024;

              while (blob.size > maxSizeBytes && attempts < maxAttempts && quality > 0.5) {
                attempts++;
                quality = Math.max(0.5, quality - 0.05); // Don't go below 0.5 quality
                blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality));
              }
            }

            const finalSizeKB = blob.size / 1024;
            const meetsTarget = !sizeConfig.maxSizeKB || finalSizeKB <= sizeConfig.maxSizeKB;

            // Create File object
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^.]+$/, `_${sizeConfig.name}.webp`),
              { type: 'image/webp', lastModified: file.lastModified }
            );

            results[sizeConfig.name] = webpFile;
            stats.push({
              size: sizeConfig.name,
              dimensions: `${targetWidth}x${targetHeight}`,
              fileSize: finalSizeKB.toFixed(2),
              quality: (quality * 100).toFixed(0),
              meetsTarget
            });
          }

          resolve({ files: results, stats });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = e.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function ManagedSalesRequestForm({
  requestToEdit,
  onClose,
  onSuccess,
  onUpdateRequest,
  isSubmittingEdit = false
}) {
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLocationVerification, setShowLocationVerification] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState(null);
  const [currentUserState, setCurrentUserState] = useState(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [newRequestData, setNewRequestData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    requester_contact_info: {
      full_name: '',
      email: '',
      phone: ''
    },
    vehicle_details: {
      title: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: '',
      condition: 'good',
      description: '',
      fuel_type: 'gasoline',
      transmission: 'automatic',
      location: '',
      seller_asking_price: '',
      financing_available: '',
      warranty_available: '',
      warranty_link: '',
      images: [],
      images_thumbnails: [],
      images_small: [],
      images_medium: [],
      drive_type: '2wd',
      engine_size: '',
      body_type: 'sedan',
      exterior_color: '',
      interior_color: '',
      doors: 4,
      seating_capacity: 5,
      steering_wheel: 'right_hand_drive',
      current_plate_type: 'kanji',
      shaken_valid_until: '',
      road_tax_paid: 'yes',
      jci_insurance_valid_until: '',
      title_type: 'Active', // Updated default to match new enum
      registration_location: 'okinawa',
      engine_type: '',
      power_output: '',
      fuel_efficiency: '',
      drivetrain: 'fwd',
      suspension_type: '',
      brakes: '',
      tire_condition: 'good',
      battery_condition: 'original',
      hybrid_system_status: 'not_applicable',
      maintenance_history: 'unknown',
      power_sliding_doors: 'none',
      headlights: 'halogen',
      fog_lights: 'none',
      alloy_wheels: false,
      spoiler: false,
      tinted_windows: false,
      roof_type: 'solid',
      side_mirrors: 'manual',
      keyless_entry: false,
      remote_door_locking: false,
      body_condition: 'no_damage',
      air_conditioning: 'manual',
      upholstery: 'fabric',
      seat_type: 'standard',
      seat_adjustments: 'manual',
      infotainment_system: [],
      navigation_system: 'none',
      steering_wheel_controls: [],
      rear_camera: false,
      parking_sensors: 'none',
      power_windows: 'none',
      interior_lighting: 'standard',
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
      cruise_control: 'none',
      bluetooth: false,
      usb_ports: false,
      twelve_v_outlet: false,
      smart_key_push_start: false,
      display_screen_size: '',
      rear_entertainment_system: false,
      voice_command_hands_free: false,
      digital_dashboard_display: false
    },
    access_arrangements: {
      vehicle_location_address: '',
      vehicle_access_availability: '',
      key_access_method: 'direct_handover',
      key_pickup_availability: '',
      key_pickup_location: '',
      key_location_details: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      availability_for_handover: '',
      power_of_attorney: false,
      power_of_attorney_details: '',
      special_instructions: '',
      agreed_to_access_terms: false,
      recurring_availability: []
    },
    terms_agreed: false
  });

  const imageInputRef = useRef(null);

  // Helper function to calculate service fee based on new tiered structure
  const _calculateServiceFeeAmount = useCallback((price) => {
    if (!price || price <= 0) return 0;
    // Ensure price is a number for calculations
    const numericPrice = parseFloat(price); // Use parseFloat as asking price can be decimal
    if (isNaN(numericPrice)) return 0; // Handle invalid numeric conversions

    if (numericPrice < 500) {
      return 300; // Minimum fee for display purposes, even for very low prices
    } else if (numericPrice <= 3000) {
      // $500 - $3,000: Fee increases in $8 increments from $300 to $500
      // Formula: $300 + (price - $500) × 0.08
      return Math.round(300 + (numericPrice - 500) * 0.08);
    } else if (numericPrice <= 8333) {
      // $3,001 - $8,333: Flat $500 fee
      return 500;
    } else {
      // $8,334+: 6% of price
      return Math.round(numericPrice * 0.06);
    }
  }, []);

  // Helper function to calculate what buyer pays (asking price + service fee)
  const calculateBuyerPrice = useCallback((askingPrice) => {
    if (!askingPrice || askingPrice <= 0) return 0;
    const numericPrice = parseFloat(askingPrice);
    const serviceFee = _calculateServiceFeeAmount(numericPrice);
    return numericPrice + serviceFee;
  }, [_calculateServiceFeeAmount]);

  // Helper function to calculate what owner receives (same as asking price)
  const calculateOwnerReceivesAmount = useCallback((askingPrice) => {
    if (!askingPrice || askingPrice <= 0) return 0;
    return parseFloat(askingPrice); // Ensure it's treated as a float
  }, []);

  // const uploadFiles = useCallback(async (files) => {
  //   if (isUploading) return;

  //   const filesToProcess = Array.from(files);
  //   if (filesToProcess.length === 0) return;

  //   setIsUploading(true);
  //   setUploadCount(filesToProcess.length);

  //   try {
  //     for (const file of filesToProcess) {
  //       try {
  //         console.log(`\n🔄 Processing: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);

  //         // Process image to multiple sizes on client-side
  //         const { files: processedFiles, stats } = await processImageToMultipleSizes(file);

  //         console.log('📊 Processing complete:', stats);

  //         // Upload each size individually using base44.integrations.Core.UploadFile
  //         console.log('📤 Uploading to storage...');

  //         const [thumbnailResult, smallResult, mediumResult, largeResult] = await Promise.all([
  //         base44.integrations.Core.UploadFile({ file: processedFiles.thumbnail }),
  //         base44.integrations.Core.UploadFile({ file: processedFiles.small }),
  //         base44.integrations.Core.UploadFile({ file: processedFiles.medium }),
  //         base44.integrations.Core.UploadFile({ file: processedFiles.large })]
  //         );

  //         // Extract URLs from responses, handling variations in how base44 returns the URL
  //         const thumbnailUrl = thumbnailResult.data?.file_url || thumbnailResult.file_url;
  //         const smallUrl = smallResult.data?.file_url || smallResult.file_url;
  //         const mediumUrl = mediumResult.data?.file_url || mediumResult.file_url;
  //         const largeUrl = largeResult.data?.file_url || largeResult.file_url;

  //         // Verify all uploads succeeded
  //         if (!thumbnailUrl || !smallUrl || !mediumUrl || !largeUrl) {
  //           throw new Error('Failed to upload one or more image sizes');
  //         }

  //         console.log('✅ Upload successful!');
  //         console.log('📊 Final URLs:', { thumbnailUrl, smallUrl, mediumUrl, largeUrl });

  //         // Add the structured image object to form data (now separate arrays)
  //         setFormData((prev) => ({
  //           ...prev,
  //           vehicle_details: {
  //             ...prev.vehicle_details,
  //             images: [...prev.vehicle_details.images, largeUrl], // large URL
  //             images_thumbnails: [...prev.vehicle_details.images_thumbnails, thumbnailUrl],
  //             images_small: [...prev.vehicle_details.images_small, smallUrl],
  //             images_medium: [...prev.vehicle_details.images_medium, mediumUrl]
  //           }
  //         }));

  //         toast({
  //           title: "Image Uploaded",
  //           description: `${file.name} processed and uploaded successfully`
  //         });

  //       } catch (error) {
  //         console.error(`Failed to process ${file.name}:`, error);
  //         toast({
  //           title: "Upload Failed",
  //           description: `Could not process "${file.name}": ${error.message}`,
  //           variant: "destructive"
  //         });
  //       }
  //     }
  //   } finally {
  //     setIsUploading(false);
  //     setUploadCount(0);
  //   }
  // }, [isUploading, toast]);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    // Clear validation error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[field]) {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  const handleMultiSelectChange = (section, field, value) => {// Removed `options` as it's unused
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].includes(value) ?
        prev[section][field].filter((item) => item !== value) :
        [...prev[section][field], value]
      }
    }));
  };

  // useEffect(() => {
  //   const loadData = async () => {
  //     let user = null;
  //     let publicUser = null;
  //     try {
  //       user = await base44.auth.me(); // Always try to get the logged-in user
  //       if (user) {
  //         setCurrentUserState(user);
          
  //         // Fetch PublicUser for display name
  //         try {
  //           const publicProfiles = await base44.entities.PublicUser.filter({ user_id: user.id });
  //           if (publicProfiles.length > 0) {
  //             publicUser = publicProfiles[0];
  //           }
  //         } catch (e) {
  //           console.warn("Failed to fetch PublicUser data for ManagedSalesRequestForm.", e);
  //         }
  //       }
  //     } catch (e) {
  //       console.warn("User not logged in or failed to fetch user data for ManagedSalesRequestForm.", e);
  //       // This is expected if the user is not logged in.
  //     }

  //     if (requestToEdit) {// If editing an existing request
  //       // Transform incoming requestToEdit.vehicle_details.images
  //       const existingImages = requestToEdit.vehicle_details.images || [];
  //       let images = [];
  //       let images_thumbnails = [];
  //       let images_small = [];
  //       let images_medium = [];

  //       if (existingImages.length > 0 && typeof existingImages[0] === 'object' && existingImages[0] !== null) {
  //         // If it's an array of objects like { thumbnail: 'url', large: 'url', ... }
  //         images = existingImages.map((img) => img.large || img.original || '');
  //         images_thumbnails = existingImages.map((img) => img.thumbnail || img.original || img.large || '');
  //         images_small = existingImages.map((img) => img.small || img.original || img.large || '');
  //         images_medium = existingImages.map((img) => img.medium || img.original || img.large || '');
  //       } else if (existingImages.length > 0 && typeof existingImages[0] === 'string') {
  //         // If it's an array of strings (legacy, assume these are large/original URLs)
  //         images = existingImages;
  //         images_thumbnails = existingImages; // Fallback to large for other sizes
  //         images_small = existingImages; // Fallback
  //         images_medium = existingImages; // Fallback
  //       }

  //       setFormData((prev) => ({
  //         requester_contact_info: { ...prev.requester_contact_info, ...(requestToEdit.requester_contact_info || {}) },
  //         vehicle_details: {
  //           ...prev.vehicle_details,
  //           ...(requestToEdit.vehicle_details || {}),
  //           // Ensure numbers are parsed for year, mileage, doors, seating_capacity, seller_asking_price
  //           year: requestToEdit.vehicle_details?.year ? parseInt(requestToEdit.vehicle_details.year) : prev.vehicle_details.year,
  //           mileage: requestToEdit.vehicle_details?.mileage ? parseInt(requestToEdit.vehicle_details.mileage) : prev.vehicle_details.mileage,
  //           doors: requestToEdit.vehicle_details?.doors ? parseInt(requestToEdit.vehicle_details.doors) : prev.vehicle_details.doors,
  //           seating_capacity: requestToEdit.vehicle_details?.seating_capacity ? parseInt(requestToEdit.vehicle_details.seating_capacity) : prev.vehicle_details.seating_capacity,
  //           seller_asking_price: requestToEdit.vehicle_details?.seller_asking_price ? parseFloat(requestToEdit.vehicle_details.seller_asking_price) : prev.vehicle_details.seller_asking_price,
  //           images,
  //           images_thumbnails,
  //           images_small,
  //           images_medium,
  //           // Ensure boolean fields are handled
  //           alloy_wheels: requestToEdit.vehicle_details?.alloy_wheels ?? false,
  //           spoiler: requestToEdit.vehicle_details?.spoiler ?? false,
  //           tinted_windows: requestToEdit.vehicle_details?.tinted_windows ?? false,
  //           keyless_entry: requestToEdit.vehicle_details?.keyless_entry ?? false,
  //           remote_door_locking: requestToEdit.vehicle_details?.remote_door_locking ?? false,
  //           rear_camera: requestToEdit.vehicle_details?.rear_camera ?? false,
  //           cup_holders_storage: requestToEdit.vehicle_details?.cup_holders_storage ?? false,
  //           child_lock_isofix: requestToEdit.vehicle_details?.child_lock_isofix ?? false,
  //           // NEW SAFETY & SECURITY BOOLS
  //           abs: requestToEdit.vehicle_details?.abs ?? false,
  //           esc_stability_control: requestToEdit.vehicle_details?.esc_stability_control ?? false,
  //           lane_departure_warning: requestToEdit.vehicle_details?.lane_departure_warning ?? false,
  //           collision_mitigation: requestToEdit.vehicle_details?.collision_mitigation ?? false,
  //           traction_control: requestToEdit.vehicle_details?.traction_control ?? false,
  //           hill_start_assist: requestToEdit.vehicle_details?.hill_start_assist ?? false,
  //           immobilizer_alarm: requestToEdit.vehicle_details?.immobilizer_alarm ?? false,
  //           seat_belt_sensors: requestToEdit.vehicle_details?.seat_belt_sensors ?? false,
  //           // Ensure array fields are handled
  //           infotainment_system: requestToEdit.vehicle_details?.infotainment_system ?? [],
  //           steering_wheel_controls: requestToEdit.vehicle_details?.steering_wheel_controls ?? [],
  //           // NEW AIRBAGS ARRAY
  //           airbags: requestToEdit.vehicle_details?.airbags ?? [],
  //           cruise_control: requestToEdit.vehicle_details?.cruise_control || 'none',
  //           // NEW TECHNOLOGY FIELDS
  //           bluetooth: requestToEdit.vehicle_details?.bluetooth ?? false,
  //           usb_ports: requestToEdit.vehicle_details?.usb_ports ?? false,
  //           twelve_v_outlet: requestToEdit.vehicle_details?.twelve_v_outlet ?? false,
  //           smart_key_push_start: requestToEdit.vehicle_details?.smart_key_push_start ?? false,
  //           display_screen_size: requestToEdit.vehicle_details?.display_screen_size ?? '',
  //           rear_entertainment_system: requestToEdit.vehicle_details?.rear_entertainment_system ?? false,
  //           voice_command_hands_free: requestToEdit.vehicle_details?.voice_command_hands_free ?? false,
  //           digital_dashboard_display: requestToEdit.vehicle_details?.digital_dashboard_display ?? false,
  //           // NEW FINANCE FIELDS
  //           financing_available: requestToEdit.vehicle_details?.financing_available ?? '',
  //           warranty_available: requestToEdit.vehicle_details?.warranty_available ?? '',
  //           warranty_link: requestToEdit.vehicle_details?.warranty_link ?? ''
  //         },
  //         access_arrangements: { ...prev.access_arrangements, ...(requestToEdit.access_arrangements || {}) },
  //         terms_agreed: requestToEdit.terms_agreed ?? false
  //       }));
  //     } else {// If it's a new request
  //       setFormData((prev) => {// Use functional update to ensure latest default is used
  //         const newFormData = { ...prev };
  //         if (user) {// If a user is logged in, pre-fill contact info
  //           // Use PublicUser full_name if available, otherwise fall back to User entity
  //           let full_name = publicUser?.full_name || user.full_name || "";
  //           let email = user.email || "";
  //           let phone = user.phone || "";

  //           newFormData.requester_contact_info = {
  //             ...newFormData.requester_contact_info,
  //             full_name: newFormData.requester_contact_info.full_name || full_name,
  //             email: newFormData.requester_contact_info.email || email,
  //             phone: newFormData.requester_contact_info.phone || phone
  //           };
  //         }
  //         return newFormData;
  //       });
  //     }
  //     setIsAuthCheckComplete(true);
  //   };

  //   loadData();
  // }, [requestToEdit]);

  // Render nothing or a loading spinner until auth check is complete
  if (!isAuthCheckComplete) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>);

  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    await uploadFiles(files);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      vehicle_details: {
        ...prev.vehicle_details,
        images: prev.vehicle_details.images.filter((_, i) => i !== index),
        images_thumbnails: prev.vehicle_details.images_thumbnails.filter((_, i) => i !== index),
        images_small: prev.vehicle_details.images_small.filter((_, i) => i !== index),
        images_medium: prev.vehicle_details.images_medium.filter((_, i) => i !== index)
      }
    }));
  };

  const validateCurrentStep = () => {
    const errors = {};

    if (currentStep === 1) {
      if (!formData.requester_contact_info.full_name?.trim()) {
        errors.full_name = 'Full name is required';
      }
      if (!formData.requester_contact_info.email?.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.requester_contact_info.email)) {
        errors.email = 'Email is invalid';
      }
      if (!formData.requester_contact_info.phone?.trim()) {
        errors.phone = 'Phone number is required';
      }
    }

    if (currentStep === 2) {
      if (!formData.vehicle_details.title?.trim()) {
        errors.title = 'Vehicle title is required';
      }
      if (!formData.vehicle_details.make?.trim()) {
        errors.make = 'Make is required';
      }
      if (!formData.vehicle_details.model?.trim()) {
        errors.model = 'Model is required';
      }
      if (!formData.vehicle_details.year || formData.vehicle_details.year < 1900 || formData.vehicle_details.year > new Date().getFullYear() + 1) {
        errors.year = 'Valid year is required';
      }
      if (formData.vehicle_details.mileage === '' || formData.vehicle_details.mileage < 0) {
        errors.mileage = 'Valid mileage is required';
      }
      if (!formData.vehicle_details.location?.trim()) {
        errors.location = 'Location is required';
      }
      if (formData.vehicle_details.seller_asking_price === '' || formData.vehicle_details.seller_asking_price <= 0) {
        errors.seller_asking_price = 'Valid asking price is required';
      }
      if (!formData.vehicle_details.description?.trim()) {
        errors.description = 'Description is required';
      }
      // New finance fields validation
      if (!formData.vehicle_details.financing_available?.trim()) {
        errors.financing_available = 'Financing availability is required';
      }
      if (!formData.vehicle_details.warranty_available?.trim()) {
        errors.warranty_available = 'Warranty availability is required';
      }
      // New fields validation for Registration & Inspection
      if (!formData.vehicle_details.current_plate_type?.trim()) {
        errors.current_plate_type = 'Plate type is required';
      }
      if (!formData.vehicle_details.road_tax_paid?.trim()) {
        errors.road_tax_paid = 'Road tax status is required';
      }
      if (!formData.vehicle_details.title_type?.trim()) {
        errors.title_type = 'Title type is required';
      }
      if (!formData.vehicle_details.registration_location?.trim()) {
        errors.registration_location = 'Registration location is required';
      }
    }

    // Step 3 validation (Specifications)
    if (currentStep === 3) {
      if (!formData.vehicle_details.engine_size?.trim() && ['gasoline', 'diesel', 'hybrid'].includes(formData.vehicle_details.fuel_type)) {
        errors.engine_size = 'Engine size is required for non-electric vehicles';
      }
      if (!formData.vehicle_details.exterior_color?.trim()) {
        errors.exterior_color = 'Exterior color is required';
      }
      if (!formData.vehicle_details.interior_color?.trim()) {
        errors.interior_color = 'Interior color is required';
      }
    }

    // Step 4 is Performance - fields are optional, no specific validation needed

    // Step 5 is Features - fields are optional, no specific validation needed

    // Step 6 is Technology - fields are optional, no specific validation needed

    // Step 7 is Photos
    if (currentStep === 7) {
      if (formData.vehicle_details.images.length === 0) {
        errors.images = 'At least one photo is required.';
        toast({
          title: "Missing Information",
          description: "Please upload at least one photo of your vehicle.",
          variant: "destructive"
        });
      }
    }

    // Step 8 is Access & Keys
    if (currentStep === 8) {
      if (!formData.access_arrangements.vehicle_location_address?.trim()) {
        errors.vehicle_location_address = 'Vehicle location is required';
      }
      if (!formData.access_arrangements.vehicle_access_availability?.trim()) {
        errors.vehicle_access_availability = 'Access availability is required';
      }
      if (!formData.access_arrangements.key_pickup_location?.trim()) {
        errors.key_pickup_location = 'Key pickup location is required';
      }
      if (!formData.access_arrangements.key_pickup_availability?.trim()) {
        errors.key_pickup_availability = 'Key pickup availability is required';
      }
      if (!formData.access_arrangements.emergency_contact_name?.trim()) {
        errors.emergency_contact_name = 'Emergency contact name is required';
      }
      if (!formData.access_arrangements.emergency_contact_phone?.trim()) {
        errors.emergency_contact_phone = 'Emergency contact phone is required';
      }
      if (!formData.access_arrangements.agreed_to_access_terms) {
        errors.agreed_to_access_terms = 'You must agree to the access terms';
      }
    }

    // Step 9 is Review & Submit
    if (currentStep === 9) {
      if (!formData.terms_agreed) {
        errors.terms_agreed = 'You must agree to the terms and service fee';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep === 2 && !showLocationVerification) {
        setShowLocationVerification(true);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields to proceed.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
    setValidationErrors({}); // Clear errors when moving back
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserState) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a managed sale request.",
        variant: "destructive"
      });
      return;
    }

    if (!validateCurrentStep()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and agree to the terms and conditions to submit your request.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // New calculation logic: buyer pays asking price + service fee, owner receives asking price
      const askingPrice = parseFloat(formData.vehicle_details.seller_asking_price || 0);
      const serviceFeeAmount = _calculateServiceFeeAmount(askingPrice);
      const buyerPrice = calculateBuyerPrice(askingPrice);
      const ownerReceives = askingPrice; // Owner receives exactly what they asked for

      const requestData = {
        requester_contact_info: formData.requester_contact_info,
        vehicle_details: {
          ...formData.vehicle_details,
          seller_asking_price: askingPrice, // This is now the owner's asking price
          year: parseInt(formData.vehicle_details.year),
          mileage: parseInt(formData.vehicle_details.mileage),
          // Ensure these are explicitly parsed as integers, they might be string from form fields
          doors: parseInt(formData.vehicle_details.doors),
          seating_capacity: parseInt(formData.vehicle_details.seating_capacity)
        },
        access_arrangements: formData.access_arrangements,
        terms_agreed: Boolean(formData.terms_agreed), // Ensure it's a proper boolean
        submitted_by_user_id: requestToEdit?.submitted_by_user_id ?
        requestToEdit.submitted_by_user_id :
        currentUserState?.id,
        final_sale_price_for_buyer: buyerPrice, // Buyer pays asking price + service fee
        service_fee_amount: serviceFeeAmount,
        owner_receives_amount: ownerReceives, // Owner receives asking price
        status: 'pending_review'
      };

      if (isSubmittingEdit && requestToEdit && onUpdateRequest) {
        console.log('📤 Updating MSR with data:', requestData);
        await onUpdateRequest(requestData, requestToEdit);
        toast({
          title: "Request Updated",
          description: "Your managed sale request has been successfully updated.",
          variant: "success"
        });
        onClose();
        return;
      }

      console.log('📤 Creating MSR with data:', requestData);

      // const newRequest = await base44.entities.ManagedSaleRequest.create(requestData);

      console.log('✅ MSR created successfully:', newRequest.id);
      setCreatedRequestId(newRequest.id);
      setNewRequestData(newRequest);

      // if (currentUserState?.id) {
      //   await base44.entities.Notification.create({
      //     recipient_id: currentUserState.id,
      //     sender_id: currentUserState.id,
      //     type: "managed_sale_status",
      //     content: `Your managed sale request for "${formData.vehicle_details.title}" has been submitted successfully. You'll receive $${ownerReceives.toLocaleString()} when the vehicle sells at $${buyerPrice.toLocaleString()}. Our team will review it within 24-48 hours.`,
      //     related_entity_type: "ManagedSaleRequest",
      //     related_entity_id: newRequest.id,
      //     url: "/dashboard",
      //     icon: "CheckCircle"
      //   });
      // }

      // if (requestData.requester_contact_info.email) {
      //   await base44.functions.invoke('sendEmail', {
      //     to: requestData.requester_contact_info.email,
      //     subject: `Your Managed Sale Request for "${requestData.vehicle_details.title}" has been received!`,
      //     html: `<h2>We've received your request!</h2>
      //                <p>Hi ${requestData.requester_contact_info.full_name},</p>
      //                <p>Thank you for submitting your ${requestData.vehicle_details.title} for our Managed Sale program. Our team will review your submission and contact you within 2 business days to discuss the next steps.</p>
      //                <h3>Your Managed Sale Details:</h3>
      //                <ul>
      //                  <li><strong>Your Asking Price:</strong> $${requestData.vehicle_details.seller_asking_price.toLocaleString()}</li>
      //                  <li><strong>Speedio Service Fee:</strong> $${requestData.service_fee_amount.toLocaleString()} (added to listing price)</li>
      //                  <li><strong>Vehicle Listing Price:</strong> $${requestData.final_sale_price_for_buyer.toLocaleString()} (what buyers will see)</li>
      //                  <li><strong>You'll Receive:</strong> $${requestData.owner_receives_amount.toLocaleString()} (your full asking price upon sale)</li>
      //                </ul>
      //                <p><strong>How it works:</strong> Your vehicle will be listed at $${requestData.final_sale_price_for_buyer.toLocaleString()}. When it sells, you receive your full asking price of $${requestData.owner_receives_amount.toLocaleString()}. The service fee is included in the listing price, so there's no cost to you.</p>
      //                <p>You can view the status of your request on your dashboard: <a href="${getBaseUrlForClient()}/dashboard">Go to Dashboard</a></p>`
      //   });
      // }

      console.log('✅ All notifications and emails sent successfully');
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Submission failed:', error);
      let errorMessage = "Failed to submit request. Please try again.";
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Submission Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationVerified = () => {
    setShowLocationVerification(false);
    setCurrentStep((prev) => prev + 1);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    if (onSuccess) {
      onSuccess(newRequestData);
    }
    onClose();
  };

  const renderImagePreview = (largeUrl, index) => {
    // Use thumbnail for preview, fall back to large if thumbnail doesn't exist yet
    const thumbnailUrl = formData.vehicle_details.images_thumbnails[index] || largeUrl;

    return (
      <div key={index} className="relative group">
        <img
          src={thumbnailUrl}
          alt={`Vehicle ${index + 1}`}
          className="w-full h-32 object-cover rounded-lg" />

        <Button
          variant="destructive"
          size="icon"
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => removeImage(index)}
          disabled={isUploading}>

          <X className="w-4 h-4" />
        </Button>
        {/* Badge for optimized status */}
        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          Optimized ✓
        </div>
      </div>);

  };

  const steps = [
  { number: 1, title: 'Contact Info', icon: User },
  { number: 2, title: 'Vehicle Details', icon: Car },
  { number: 3, title: 'Specifications', icon: Wrench },
  { number: 4, title: 'Performance', icon: Gauge },
  { number: 5, title: 'Features', icon: Sparkles },
  { number: 6, title: 'Technology', icon: Wifi }, // NEW STEP
  { number: 7, title: 'Photos', icon: Camera },
  { number: 8, title: 'Access & Keys', icon: KeyRound },
  { number: 9, title: 'Review & Submit', icon: CheckCircle }];


  const renderContactInfo = () =>
  <motion.div
    key="contact_info"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6">

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <User className="w-7 h-7 text-blue-600" />
          Your Contact Information
        </h2>
        <p className="text-slate-600">
          This information will be used to contact you regarding your managed sale request.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name <span className="text-red-500">*</span></Label>
            <Input
            id="full_name"
            name="full_name"
            value={formData.requester_contact_info.full_name}
            onChange={(e) => handleInputChange('requester_contact_info', 'full_name', e.target.value)}
            placeholder={"Your full name"}
            required
            readOnly
            className="bg-slate-100 cursor-not-allowed" />

            {validationErrors.full_name &&
          <p className="text-sm text-red-500">{validationErrors.full_name}</p>
          }
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              This is linked to your profile. To change your name, please update
              it in your profile settings.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input
            id="email"
            name="email"
            type="email"
            value={formData.requester_contact_info.email}
            onChange={(e) => handleInputChange('requester_contact_info', 'email', e.target.value)}
            placeholder={"your.email@example.com"}
            required
            readOnly
            className="bg-slate-100 cursor-not-allowed" />

            {validationErrors.email &&
          <p className="text-sm text-red-500">{validationErrors.email}</p>
          }
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Info className="w-3 h-3" />
              Your email is used for important updates. To change your email, please update
              it in your profile settings.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
            <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.requester_contact_info.phone}
            onChange={(e) => handleInputChange('requester_contact_info', 'phone', e.target.value)}
            placeholder="+81 90-1234-5678" />

            {validationErrors.phone &&
          <p className="text-sm text-red-500">{validationErrors.phone}</p>
          }
          </div>
        </CardContent>
      </Card>
    </motion.div>;


  const renderVehicleDetails = () =>
  <motion.div
    key="vehicle_details"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6">

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Car className="w-7 h-7 text-blue-600" />
          Vehicle Information
        </h2>
        <p className="text-slate-600">
          Tell us about your car so we can create an accurate listing.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Vehicle Title <span className="text-red-500">*</span></Label>
              <Input
              id="title"
              placeholder="e.g., 2019 Toyota Camry LE"
              value={formData.vehicle_details.title}
              onChange={(e) => handleInputChange('vehicle_details', 'title', e.target.value)} />

              {validationErrors.title &&
            <p className="text-sm text-red-500">{validationErrors.title}</p>
            }
            </div>
            <div className="space-y-2">
              <Label htmlFor="seller_asking_price">Your Asking Price ($) <span className="text-red-500">*</span></Label>
              <Input
              id="seller_asking_price"
              type="number"
              placeholder="25000"
              value={formData.vehicle_details.seller_asking_price}
              onChange={(e) => handleInputChange('vehicle_details', 'seller_asking_price', e.target.value === '' ? '' : parseFloat(e.target.value))} />

              {validationErrors.seller_asking_price &&
            <p className="text-sm text-red-500">{validationErrors.seller_asking_price}</p>
            }
              {formData.vehicle_details.seller_asking_price > 0 &&
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-slate-600 flex justify-between mb-2">
                    <span className="font-medium">Your Asking Price:</span>
                    <span className="font-semibold">${parseFloat(formData.vehicle_details.seller_asking_price).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-blue-600 flex justify-between mt-1">
                    <span className="font-medium">
                      Service Fee
                      {(() => {
                    const price = parseFloat(formData.vehicle_details.seller_asking_price);
                    if (price < 500) return ' ($300 minimum)';
                    if (price <= 3000) return ' (scales $300-$500)';
                    if (price <= 8333) return ' ($500 flat)';
                    return ' (6%)';
                  })()}:
                    </span>
                    <span className="font-semibold">+${_calculateServiceFeeAmount(parseFloat(formData.vehicle_details.seller_asking_price)).toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-blue-800 flex justify-between font-bold border-t border-blue-300 pt-2 mt-2">
                    <span>Vehicle Listing Price:</span>
                    <span>${calculateBuyerPrice(parseFloat(formData.vehicle_details.seller_asking_price)).toLocaleString()}</span>
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <Info className="w-3 h-3 inline mr-1" />
                    Your vehicle will be listed at this price. You'll receive your full asking price of ${parseFloat(formData.vehicle_details.seller_asking_price).toLocaleString()} when it sells.
                  </p>
                </div>
            }
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Financing Available */}
          <div className="space-y-2">
            <Label htmlFor="financing_available">
              Financing Available <span className="text-red-500">*</span>
            </Label>
            <Select
              id="financing_available"
              value={formData.vehicle_details.financing_available || ''}
              onValueChange={(value) => handleInputChange('vehicle_details', 'financing_available', value)}>

              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.financing_available &&
            <p className="text-sm text-red-500">{validationErrors.financing_available}</p>
            }
          </div>

          {/* Warranty Available */}
          <div className="space-y-2">
            <Label htmlFor="warranty_available">
              Warranty Available <span className="text-red-500">*</span>
            </Label>
            <Select
              id="warranty_available"
              value={formData.vehicle_details.warranty_available || ''}
              onValueChange={(value) => handleInputChange('vehicle_details', 'warranty_available', value)}>

              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Yes">Yes</SelectItem>
                <SelectItem value="No">No</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.warranty_available &&
            <p className="text-sm text-red-500">{validationErrors.warranty_available}</p>
            }

            {/* Optional Link Field if Warranty = Yes */}
            {formData.vehicle_details.warranty_available === 'Yes' &&
            <div className="mt-2">
                <Label htmlFor="warranty_link" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Warranty Details</Label>
                <Input
                id="warranty_link"
                placeholder="e.g., https://speedio.jp/warranty or 3rd-party warranty info"
                value={formData.vehicle_details.warranty_link || ''}
                onChange={(e) => handleInputChange('vehicle_details', 'warranty_link', e.target.value)} />

              </div>
            }
          </div>
        </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make <span className="text-red-500">*</span></Label>
              <Input
              id="make"
              placeholder="Toyota"
              value={formData.vehicle_details.make}
              onChange={(e) => handleInputChange('vehicle_details', 'make', e.target.value)} />

              {validationErrors.make &&
            <p className="text-sm text-red-500">{validationErrors.make}</p>
            }
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model <span className="text-red-500">*</span></Label>
              <Input
              id="model"
              placeholder="Camry"
              value={formData.vehicle_details.model}
              onChange={(e) => handleInputChange('vehicle_details', 'model', e.target.value)} />

              {validationErrors.model &&
            <p className="text-sm text-red-500">{validationErrors.model}</p>
            }
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year <span className="text-red-500">*</span></Label>
              <Input
              id="year"
              type="number"
              placeholder="2019"
              value={formData.vehicle_details.year}
              onChange={(e) => handleInputChange('vehicle_details', 'year', e.target.value === '' ? '' : parseInt(e.target.value))} />

              {validationErrors.year &&
            <p className="text-sm text-red-500">{validationErrors.year}</p>
            }
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage (km) <span className="text-red-500">*</span></Label>
              <Input
              id="mileage"
              type="number"
              placeholder="50,000"
              value={formData.vehicle_details.mileage}
              onChange={(e) => handleInputChange('vehicle_details', 'mileage', e.target.value === '' ? '' : parseInt(e.target.value))} />

              {validationErrors.mileage &&
            <p className="text-sm text-red-500">{validationErrors.mileage}</p>
            }
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
              <Input
              id="location"
              placeholder="Naha, Okinawa"
              value={formData.vehicle_details.location}
              onChange={(e) => handleInputChange('vehicle_details', 'location', e.target.value)} />

              {validationErrors.location &&
            <p className="text-sm text-red-500">{validationErrors.location}</p>
            }
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
            id="description"
            placeholder="Describe your vehicle's features, history, and any special notes..."
            rows={4}
            value={formData.vehicle_details.description}
            onChange={(e) => handleInputChange('vehicle_details', 'description', e.target.value)} />

            {validationErrors.description &&
          <p className="text-sm text-red-500">{validationErrors.description}</p>
          }
          </div>
        </CardContent>

        {/* NEW: Registration & Inspection Section */}
        <div className="mt-8 pt-8 border-t border-slate-200 px-6 pb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
            <FileText className="w-6 h-6 text-blue-600" />
            Registration & Inspection
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Plate Type */}
            <div className="space-y-2">
              <Label htmlFor="current_plate_type">
                Current Plate Type <span className="text-red-500">*</span>
              </Label>
              <Select
              value={formData.vehicle_details.current_plate_type}
              onValueChange={(value) => handleInputChange('vehicle_details', 'current_plate_type', value)}>

                <SelectTrigger id="current_plate_type">
                  <SelectValue placeholder="Select plate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanji">Kanji (Japanese Plates)</SelectItem>
                  <SelectItem value="y_plate">Y-Plate (SOFA)</SelectItem>
                  <SelectItem value="a_plate">A-Plate (Civilian)</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.current_plate_type &&
            <p className="text-sm text-red-500">{validationErrors.current_plate_type}</p>
            }
            </div>

            {/* Shaken Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="shaken_valid_until">
                Shaken (Inspection) Valid Until
              </Label>
              <Input
              id="shaken_valid_until"
              placeholder="e.g., April 2026"
              value={formData.vehicle_details.shaken_valid_until}
              onChange={(e) => handleInputChange('vehicle_details', 'shaken_valid_until', e.target.value)} />

              <p className="text-xs text-slate-500">Leave blank if expired</p>
            </div>

            {/* Road Tax Paid */}
            <div className="space-y-2">
              <Label htmlFor="road_tax_paid">
                Road Tax Paid <span className="text-red-500">*</span>
              </Label>
              <Select
              value={formData.vehicle_details.road_tax_paid}
              onValueChange={(value) => handleInputChange('vehicle_details', 'road_tax_paid', value)}>

                <SelectTrigger id="road_tax_paid">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.road_tax_paid &&
            <p className="text-sm text-red-500">{validationErrors.road_tax_paid}</p>
            }
            </div>

            {/* JCI Insurance Valid Until */}
            <div className="space-y-2">
              <Label htmlFor="jci_insurance_valid_until">
                JCI Insurance Valid Until
              </Label>
              <Input
              id="jci_insurance_valid_until"
              placeholder="e.g., April 2026"
              value={formData.vehicle_details.jci_insurance_valid_until}
              onChange={(e) => handleInputChange('vehicle_details', 'jci_insurance_valid_until', e.target.value)} />

              <p className="text-xs text-slate-500">Leave blank if expired</p>
            </div>

            {/* Title Type */}
            <div className="space-y-2">
              <Label htmlFor="title_type">
                Title Type <span className="text-red-500">*</span>
              </Label>
              <Select
              value={formData.vehicle_details.title_type}
              onValueChange={(value) => handleInputChange('vehicle_details', 'title_type', value)}>

                <SelectTrigger id="title_type">
                  <SelectValue placeholder="Select title type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Deregistered">Deregistered</SelectItem>
                  <SelectItem value="Pending Initial Registration">Pending Initial Registration</SelectItem>
                  <SelectItem value="For Shipment Only">For Shipment Only</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.title_type &&
            <p className="text-sm text-red-500">{validationErrors.title_type}</p>
            }
            </div>

            {/* Registration Location */}
            <div className="space-y-2">
              <Label htmlFor="registration_location">
                Registration Location <span className="text-red-500">*</span>
              </Label>
              <Select
              value={formData.vehicle_details.registration_location}
              onValueChange={(value) => handleInputChange('vehicle_details', 'registration_location', value)}>

                <SelectTrigger id="registration_location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="okinawa">Okinawa</SelectItem>
                  <SelectItem value="mainland_japan">Mainland Japan</SelectItem>
                  <SelectItem value="us_import">US Import</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.registration_location &&
            <p className="text-sm text-red-500">{validationErrors.registration_location}</p>
            }
            </div>
          </div>
        </div>
      </Card>
    </motion.div>;


  // NEW: Render Specifications Step
  const renderSpecifications = () => {
    return (
      <motion.div
        key="specifications"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6">

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-7 h-7 text-blue-600" />
            Vehicle Specifications
          </h2>
          <p className="text-slate-600">
            Provide detailed specifications about your vehicle
          </p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Transmission */}
            <div className="space-y-2">
              <Label htmlFor="transmission">
                Transmission <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.transmission}
                onValueChange={(value) => handleInputChange('vehicle_details', 'transmission', value)}>

                <SelectTrigger id="transmission">
                  <SelectValue placeholder="Select transmission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="automatic">Automatic</SelectItem>
                  <SelectItem value="cvt">CVT</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Drive Type */}
            <div className="space-y-2">
              <Label htmlFor="drive_type">
                Drive Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.drive_type}
                onValueChange={(value) => handleInputChange('vehicle_details', 'drive_type', value)}>

                <SelectTrigger id="drive_type">
                  <SelectValue placeholder="Select drive type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2wd">2WD (Front or Rear Wheel Drive)</SelectItem>
                  <SelectItem value="4wd">4WD (Four Wheel Drive)</SelectItem>
                  <SelectItem value="awd">AWD (All Wheel Drive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label htmlFor="fuel_type">
                Fuel Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.fuel_type}
                onValueChange={(value) => handleInputChange('vehicle_details', 'fuel_type', value)}>

                <SelectTrigger id="fuel_type">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Engine Size */}
            <div className="space-y-2">
              <Label htmlFor="engine_size">
                Engine Size {['gasoline', 'diesel', 'hybrid'].includes(formData.vehicle_details.fuel_type) && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="engine_size"
                placeholder="e.g., 1.2L (1242cc)"
                value={formData.vehicle_details.engine_size}
                onChange={(e) => handleInputChange('vehicle_details', 'engine_size', e.target.value)}
                disabled={formData.vehicle_details.fuel_type === 'electric'}
                className={formData.vehicle_details.fuel_type === 'electric' ? 'bg-slate-100' : ''} />

              {validationErrors.engine_size &&
              <p className="text-sm text-red-500">{validationErrors.engine_size}</p>
              }
              {formData.vehicle_details.fuel_type === 'electric' &&
              <p className="text-xs text-slate-500 mt-1">N/A for electric vehicles</p>
              }
            </div>

            {/* Body Type */}
            <div className="space-y-2">
              <Label htmlFor="body_type">
                Body Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.body_type}
                onValueChange={(value) => handleInputChange('vehicle_details', 'body_type', value)}>

                <SelectTrigger id="body_type">
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
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

            {/* Exterior Color */}
            <div className="space-y-2">
              <Label htmlFor="exterior_color">
                Exterior Color <span className="text-red-500">*</span>
              </Label>
              <Input
                id="exterior_color"
                placeholder="e.g., Pearl White, Red, Black"
                value={formData.vehicle_details.exterior_color}
                onChange={(e) => handleInputChange('vehicle_details', 'exterior_color', e.target.value)} />

              {validationErrors.exterior_color &&
              <p className="text-sm text-red-500">{validationErrors.exterior_color}</p>
              }
            </div>

            {/* Interior Color */}
            <div className="space-y-2">
              <Label htmlFor="interior_color">
                Interior Color <span className="text-red-500">*</span>
              </Label>
              <Input
                id="interior_color"
                placeholder="e.g., Black, Gray, Beige"
                value={formData.vehicle_details.interior_color}
                onChange={(e) => handleInputChange('vehicle_details', 'interior_color', e.target.value)} />

              {validationErrors.interior_color &&
              <p className="text-sm text-red-500">{validationErrors.interior_color}</p>
              }
            </div>

            {/* Doors */}
            <div className="space-y-2">
              <Label htmlFor="doors">
                Number of Doors <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.doors?.toString()}
                onValueChange={(value) => handleInputChange('vehicle_details', 'doors', parseInt(value))}>

                <SelectTrigger id="doors">
                  <SelectValue placeholder="Select doors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Doors</SelectItem>
                  <SelectItem value="3">3 Doors</SelectItem>
                  <SelectItem value="4">4 Doors</SelectItem>
                  <SelectItem value="5">5 Doors</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Seating Capacity */}
            <div className="space-y-2">
              <Label htmlFor="seating_capacity">
                Seating Capacity <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.seating_capacity?.toString()}
                onValueChange={(value) => handleInputChange('vehicle_details', 'seating_capacity', parseInt(value))}>

                <SelectTrigger id="seating_capacity">
                  <SelectValue placeholder="Select capacity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Passengers</SelectItem>
                  <SelectItem value="4">4 Passengers</SelectItem>
                  <SelectItem value="5">5 Passengers</SelectItem>
                  <SelectItem value="6">6 Passengers</SelectItem>
                  <SelectItem value="7">7 Passengers</SelectItem>
                  <SelectItem value="8">8 Passengers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Steering Wheel */}
            <div className="space-y-2">
              <Label htmlFor="steering_wheel">
                Steering Wheel <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.steering_wheel}
                onValueChange={(value) => handleInputChange('vehicle_details', 'steering_wheel', value)}>

                <SelectTrigger id="steering_wheel">
                  <SelectValue placeholder="Select steering position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right_hand_drive">Right-Hand Drive</SelectItem>
                  <SelectItem value="left_hand_drive">Left-Hand Drive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condition (moved from step 2) */}
            <div className="space-y-2">
              <Label htmlFor="condition">
                Overall Condition <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.vehicle_details.condition}
                onValueChange={(value) => handleInputChange('vehicle_details', 'condition', value)}>

                <SelectTrigger id="condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
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
            <strong>Note:</strong> All fields on this page are optional. Providing accurate performance and mechanical details helps potential buyers make informed decisions and can increase the value of your listing.
          </p>
        </div>
      </motion.div>);

  };

  // NEW: Render Performance & Mechanical Step
  const renderPerformance = () => {
    return (
      <motion.div
        key="performance"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6">

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gauge className="w-7 h-7 text-blue-600" />
            Performance & Mechanical
          </h2>
          <p className="text-slate-600">
            Technical details about your vehicle's performance and condition
          </p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Engine Type */}
            <div className="space-y-2">
              <Label htmlFor="engine_type">Engine Type</Label>
              <Input
                id="engine_type"
                placeholder="e.g., Inline 4, Hybrid Assist, Turbocharged"
                value={formData.vehicle_details.engine_type}
                onChange={(e) => handleInputChange('vehicle_details', 'engine_type', e.target.value)} />

            </div>

            {/* Power Output */}
            <div className="space-y-2">
              <Label htmlFor="power_output">Power Output</Label>
              <Input
                id="power_output"
                placeholder="e.g., 90 HP (67 kW)"
                value={formData.vehicle_details.power_output}
                onChange={(e) => handleInputChange('vehicle_details', 'power_output', e.target.value)} />

            </div>

            {/* Fuel Efficiency */}
            <div className="space-y-2">
              <Label htmlFor="fuel_efficiency">Fuel Efficiency</Label>
              <Input
                id="fuel_efficiency"
                placeholder="e.g., 20-25 km/L (average)"
                value={formData.vehicle_details.fuel_efficiency}
                onChange={(e) => handleInputChange('vehicle_details', 'fuel_efficiency', e.target.value)} />

            </div>

            {/* Drivetrain */}
            <div className="space-y-2">
              <Label htmlFor="drivetrain">Drivetrain</Label>
              <Select
                value={formData.vehicle_details.drivetrain}
                onValueChange={(value) => handleInputChange('vehicle_details', 'drivetrain', value)}>

                <SelectTrigger id="drivetrain">
                  <SelectValue placeholder="Select drivetrain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fwd">FWD (Front-Wheel Drive)</SelectItem>
                  <SelectItem value="rwd">RWD (Rear-Wheel Drive)</SelectItem>
                  <SelectItem value="awd">AWD (All-Wheel Drive)</SelectItem>
                  <SelectItem value="4wd">4WD (Four-Wheel Drive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Suspension Type */}
            <div className="space-y-2">
              <Label htmlFor="suspension_type">Suspension Type</Label>
              <Input
                id="suspension_type"
                placeholder="e.g., MacPherson Strut, Torsion Beam"
                value={formData.vehicle_details.suspension_type}
                onChange={(e) => handleInputChange('vehicle_details', 'suspension_type', e.target.value)} />

            </div>

            {/* Brakes */}
            <div className="space-y-2">
              <Label htmlFor="brakes">Brake System</Label>
              <Input
                id="brakes"
                placeholder="e.g., Disc (Front), Drum (Rear)"
                value={formData.vehicle_details.brakes}
                onChange={(e) => handleInputChange('vehicle_details', 'brakes', e.target.value)} />

            </div>

            {/* Tire Condition */}
            <div className="space-y-2">
              <Label htmlFor="tire_condition">Tire Condition</Label>
              <Select
                value={formData.vehicle_details.tire_condition}
                onValueChange={(value) => handleInputChange('vehicle_details', 'tire_condition', value)}>

                <SelectTrigger id="tire_condition">
                  <SelectValue placeholder="Select tire condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="worn">Worn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Battery Condition */}
            <div className="space-y-2">
              <Label htmlFor="battery_condition">Battery Condition</Label>
              <Select
                value={formData.vehicle_details.battery_condition}
                onValueChange={(value) => handleInputChange('vehicle_details', 'battery_condition', value)}>

                <SelectTrigger id="battery_condition">
                  <SelectValue placeholder="Select battery condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="recently_replaced">Recently Replaced</SelectItem>
                  <SelectItem value="original">Original</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hybrid System Status */}
            <div className="space-y-2">
              <Label htmlFor="hybrid_system_status">Hybrid System Status</Label>
              <Select
                value={formData.vehicle_details.hybrid_system_status}
                onValueChange={(value) => handleInputChange('vehicle_details', 'hybrid_system_status', value)}>

                <SelectTrigger id="hybrid_system_status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ok">OK</SelectItem>
                  <SelectItem value="service_needed">Service Needed</SelectItem>
                  <SelectItem value="not_applicable">Not Applicable</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">Select "Not Applicable" for non-hybrid vehicles</p>
            </div>

            {/* Maintenance History */}
            <div className="space-y-2">
              <Label htmlFor="maintenance_history">Maintenance History</Label>
              <Select
                value={formData.vehicle_details.maintenance_history}
                onValueChange={(value) => handleInputChange('vehicle_details', 'maintenance_history', value)}>

                <SelectTrigger id="maintenance_history">
                  <SelectValue placeholder="Select history" />
                </SelectTrigger>
                <SelectContent>
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
            <strong>Note:</strong> All fields on this page are optional. Providing accurate performance and mechanical details helps potential buyers make informed decisions and can increase the value of your listing.
          </p>
        </div>
      </motion.div>);

  };

  // NEW: Render Features Step
  const renderFeatures = () => {
    return (
      <motion.div
        key="features"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-8">

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
              <Select
                value={formData.vehicle_details.power_sliding_doors}
                onValueChange={(value) => handleInputChange('vehicle_details', 'power_sliding_doors', value)}>

                <SelectTrigger id="power_sliding_doors">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headlights">Headlights</Label>
              <Select
                value={formData.vehicle_details.headlights}
                onValueChange={(value) => handleInputChange('vehicle_details', 'headlights', value)}>

                <SelectTrigger id="headlights">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="led">LED</SelectItem>
                  <SelectItem value="halogen">Halogen</SelectItem>
                  <SelectItem value="projector">Projector</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fog_lights">Fog Lights</Label>
              <Select
                value={formData.vehicle_details.fog_lights}
                onValueChange={(value) => handleInputChange('vehicle_details', 'fog_lights', value)}>

                <SelectTrigger id="fog_lights">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="rear">Rear</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roof_type">Roof Type</Label>
              <Select
                value={formData.vehicle_details.roof_type}
                onValueChange={(value) => handleInputChange('vehicle_details', 'roof_type', value)}>

                <SelectTrigger id="roof_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="sunroof">Sunroof</SelectItem>
                  <SelectItem value="panoramic">Panoramic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="side_mirrors">Side Mirrors</Label>
              <Select
                value={formData.vehicle_details.side_mirrors}
                onValueChange={(value) => handleInputChange('vehicle_details', 'side_mirrors', value)}>

                <SelectTrigger id="side_mirrors">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power_fold">Power Fold</SelectItem>
                  <SelectItem value="heated">Heated</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body_condition">Body Condition</Label>
              <Select
                value={formData.vehicle_details.body_condition}
                onValueChange={(value) => handleInputChange('vehicle_details', 'body_condition', value)}>

                <SelectTrigger id="body_condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
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
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'alloy_wheels', checked)} />

                <Label htmlFor="alloy_wheels" className="cursor-pointer">Alloy Wheels</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spoiler"
                  checked={formData.vehicle_details.spoiler}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'spoiler', checked)} />

                <Label htmlFor="spoiler" className="cursor-pointer">Spoiler</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tinted_windows"
                  checked={formData.vehicle_details.tinted_windows}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'tinted_windows', checked)} />

                <Label htmlFor="tinted_windows" className="cursor-pointer">Tinted Windows</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="keyless_entry"
                  checked={formData.vehicle_details.keyless_entry}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'keyless_entry', checked)} />

                <Label htmlFor="keyless_entry" className="cursor-pointer">Keyless Entry</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remote_door_locking"
                  checked={formData.vehicle_details.remote_door_locking}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'remote_door_locking', checked)} />

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
              <Select
                value={formData.vehicle_details.air_conditioning}
                onValueChange={(value) => handleInputChange('vehicle_details', 'air_conditioning', value)}>

                <SelectTrigger id="air_conditioning">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="auto_dual_zone">Auto Dual-Zone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upholstery">Upholstery</Label>
              <Select
                value={formData.vehicle_details.upholstery}
                onValueChange={(value) => handleInputChange('vehicle_details', 'upholstery', value)}>

                <SelectTrigger id="upholstery">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabric">Fabric</SelectItem>
                  <SelectItem value="leather">Leather</SelectItem>
                  <SelectItem value="synthetic">Synthetic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seat_type">Seat Type</Label>
              <Select
                value={formData.vehicle_details.seat_type}
                onValueChange={(value) => handleInputChange('vehicle_details', 'seat_type', value)}>

                <SelectTrigger id="seat_type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="captain">Captain</SelectItem>
                  <SelectItem value="fold_flat">Fold-Flat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seat_adjustments">Seat Adjustments</Label>
              <Select
                value={formData.vehicle_details.seat_adjustments}
                onValueChange={(value) => handleInputChange('vehicle_details', 'seat_adjustments', value)}>

                <SelectTrigger id="seat_adjustments">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Parking Sensors */}
            <div className="space-y-2">
              <Label htmlFor="parking_sensors">Parking Sensors</Label>
              <Select
                value={formData.vehicle_details.parking_sensors}
                onValueChange={(value) => handleInputChange('vehicle_details', 'parking_sensors', value)}>

                <SelectTrigger id="parking_sensors">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="rear">Rear</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="power_windows">Power Windows</Label>
              <Select
                value={formData.vehicle_details.power_windows}
                onValueChange={(value) => handleInputChange('vehicle_details', 'power_windows', value)}>

                <SelectTrigger id="power_windows">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">Front</SelectItem>
                  <SelectItem value="rear">Rear</SelectItem>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interior_lighting">Interior Lighting</Label>
              <Select
                value={formData.vehicle_details.interior_lighting}
                onValueChange={(value) => handleInputChange('vehicle_details', 'interior_lighting', value)}>

                <SelectTrigger id="interior_lighting">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
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
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'rear_camera', checked)} />

                <Label htmlFor="rear_camera" className="cursor-pointer">Rear Camera</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cup_holders_storage"
                  checked={formData.vehicle_details.cup_holders_storage}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'cup_holders_storage', checked)} />

                <Label htmlFor="cup_holders_storage" className="cursor-pointer">Cup Holders / Storage Compartments</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="child_lock_isofix"
                  checked={formData.vehicle_details.child_lock_isofix}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'child_lock_isofix', checked)} />

                <Label htmlFor="child_lock_isofix" className="cursor-pointer">Child Lock / ISOFIX</Label>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Safety & Security Section - NEW */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-7 h-7 text-red-600" />
              Safety & Security
            </h2>
            <p className="text-slate-600">Select safety and security features</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cruise Control */}
            <div className="space-y-2">
              <Label htmlFor="cruise_control">Cruise Control</Label>
              <Select
                value={formData.vehicle_details.cruise_control}
                onValueChange={(value) => handleInputChange('vehicle_details', 'cruise_control', value)}>

                <SelectTrigger id="cruise_control">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Spacer for grid alignment */}
            <div></div>

            {/* Checkboxes for Safety Features */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="abs"
                  checked={formData.vehicle_details.abs}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'abs', checked)} />

                <Label htmlFor="abs" className="cursor-pointer">ABS (Anti-lock Braking System)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="esc_stability_control"
                  checked={formData.vehicle_details.esc_stability_control}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'esc_stability_control', checked)} />

                <Label htmlFor="esc_stability_control" className="cursor-pointer">ESC / Stability Control</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lane_departure_warning"
                  checked={formData.vehicle_details.lane_departure_warning}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'lane_departure_warning', checked)} />

                <Label htmlFor="lane_departure_warning" className="cursor-pointer">Lane Departure Warning</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="collision_mitigation"
                  checked={formData.vehicle_details.collision_mitigation}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'collision_mitigation', checked)} />

                <Label htmlFor="collision_mitigation" className="cursor-pointer">Collision Mitigation / Braking Assist</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="traction_control"
                  checked={formData.vehicle_details.traction_control}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'traction_control', checked)} />

                <Label htmlFor="traction_control" className="cursor-pointer">Traction Control</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hill_start_assist"
                  checked={formData.vehicle_details.hill_start_assist}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'hill_start_assist', checked)} />

                <Label htmlFor="hill_start_assist" className="cursor-pointer">Hill Start Assist</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="immobilizer_alarm"
                  checked={formData.vehicle_details.immobilizer_alarm}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'immobilizer_alarm', checked)} />

                <Label htmlFor="immobilizer_alarm" className="cursor-pointer">Immobilizer / Alarm System</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seat_belt_sensors"
                  checked={formData.vehicle_details.seat_belt_sensors}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'seat_belt_sensors', checked)} />

                <Label htmlFor="seat_belt_sensors" className="cursor-pointer">Seat Belt Sensors</Label>
              </div>
            </div>

            {/* Airbags - Multi-select section */}
            <div className="space-y-3 md:col-span-2 border-t pt-6">
              <Label className="text-base font-semibold">Airbags</Label>
              <p className="text-sm text-slate-600 mb-3">Select all airbag locations that apply</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="airbag_front"
                    checked={formData.vehicle_details.airbags?.includes('front')}
                    onCheckedChange={(checked) => {
                      const current = formData.vehicle_details.airbags || [];
                      let updated = [];
                      if (checked) {
                        updated = [...current.filter((item) => item !== 'none'), 'front'];
                      } else {
                        updated = current.filter((item) => item !== 'front');
                      }
                      handleInputChange('vehicle_details', 'airbags', updated);
                    }} />

                  <Label htmlFor="airbag_front" className="cursor-pointer">Front</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="airbag_side"
                    checked={formData.vehicle_details.airbags?.includes('side')}
                    onCheckedChange={(checked) => {
                      const current = formData.vehicle_details.airbags || [];
                      let updated = [];
                      if (checked) {
                        updated = [...current.filter((item) => item !== 'none'), 'side'];
                      } else {
                        updated = current.filter((item) => item !== 'side');
                      }
                      handleInputChange('vehicle_details', 'airbags', updated);
                    }} />

                  <Label htmlFor="airbag_side" className="cursor-pointer">Side</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="airbag_curtain"
                    checked={formData.vehicle_details.airbags?.includes('curtain')}
                    onCheckedChange={(checked) => {
                      const current = formData.vehicle_details.airbags || [];
                      let updated = [];
                      if (checked) {
                        updated = [...current.filter((item) => item !== 'none'), 'curtain'];
                      } else {
                        updated = current.filter((item) => item !== 'curtain');
                      }
                      handleInputChange('vehicle_details', 'airbags', updated);
                    }} />

                  <Label htmlFor="airbag_curtain" className="cursor-pointer">Curtain</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="airbag_none"
                    checked={formData.vehicle_details.airbags?.includes('none')}
                    onCheckedChange={(checked) => {
                      const updated = checked ? ['none'] : [];
                      handleInputChange('vehicle_details', 'airbags', updated);
                    }} />

                  <Label htmlFor="airbag_none" className="cursor-pointer">None</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All features on this page are optional. Providing detailed feature information helps buyers understand what your vehicle offers and can increase interest in your listing.
          </p>
        </div>
      </motion.div>);

  };

  // NEW: Render Technology Step
  const renderTechnology = () => {
    return (
      <motion.div
        key="tech"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6">

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wifi className="w-7 h-7 text-blue-600" />
            Technology
          </h2>
          <p className="text-slate-600">
            Tell us about the advanced features and connectivity options in your vehicle.
          </p>
        </div>

        <Card>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bluetooth"
                  checked={formData.vehicle_details.bluetooth}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'bluetooth', checked)} />

                <Label htmlFor="bluetooth" className="cursor-pointer">Bluetooth Connectivity</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="usb_ports"
                  checked={formData.vehicle_details.usb_ports}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'usb_ports', checked)} />

                <Label htmlFor="usb_ports" className="cursor-pointer">USB Ports</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="twelve_v_outlet"
                  checked={formData.vehicle_details.twelve_v_outlet}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'twelve_v_outlet', checked)} />

                <Label htmlFor="twelve_v_outlet" className="cursor-pointer">12V Power Outlet</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smart_key_push_start"
                  checked={formData.vehicle_details.smart_key_push_start}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'smart_key_push_start', checked)} />

                <Label htmlFor="smart_key_push_start" className="cursor-pointer">Smart Key / Push Button Start</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rear_entertainment_system"
                  checked={formData.vehicle_details.rear_entertainment_system}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'rear_entertainment_system', checked)} />

                <Label htmlFor="rear_entertainment_system" className="cursor-pointer">Rear Entertainment System</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="voice_command_hands_free"
                  checked={formData.vehicle_details.voice_command_hands_free}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'voice_command_hands_free', checked)} />

                <Label htmlFor="voice_command_hands_free" className="cursor-pointer">Voice Command / Hands-Free System</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="digital_dashboard_display"
                  checked={formData.vehicle_details.digital_dashboard_display}
                  onCheckedChange={(checked) => handleInputChange('vehicle_details', 'digital_dashboard_display', checked)} />

                <Label htmlFor="digital_dashboard_display" className="cursor-pointer">Digital Dashboard Display</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_screen_size">Display Screen Size</Label>
              <Input
                id="display_screen_size"
                placeholder="e.g., 7-inch, 10.25-inch"
                value={formData.vehicle_details.display_screen_size}
                onChange={(e) => handleInputChange('vehicle_details', 'display_screen_size', e.target.value)} />

            </div>

            {/* Infotainment System (Multi-select) - MOVED */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-slate-700 mb-2">Infotainment System</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infotainment_apple_carplay"
                    checked={formData.vehicle_details.infotainment_system?.includes('apple_carplay')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'infotainment_system', 'apple_carplay', null)} />

                  <Label htmlFor="infotainment_apple_carplay" className="cursor-pointer">Apple CarPlay</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infotainment_android_auto"
                    checked={formData.vehicle_details.infotainment_system?.includes('android_auto')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'infotainment_system', 'android_auto', null)} />

                  <Label htmlFor="infotainment_android_auto" className="cursor-pointer">Android Auto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infotainment_touchscreen"
                    checked={formData.vehicle_details.infotainment_system?.includes('touchscreen')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'infotainment_system', 'touchscreen', null)} />

                  <Label htmlFor="infotainment_touchscreen" className="cursor-pointer">Touchscreen</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="infotainment_premium_sound"
                    checked={formData.vehicle_details.infotainment_system?.includes('premium_sound')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'infotainment_system', 'premium_sound', null)} />

                  <Label htmlFor="infotainment_premium_sound" className="cursor-pointer">Premium Sound System</Label>
                </div>
              </div>
            </div>

            {/* Navigation System (Select) - MOVED */}
            <div className="space-y-2">
              <Label htmlFor="navigation_system">Navigation System</Label>
              <Select
                value={formData.vehicle_details.navigation_system}
                onValueChange={(value) => handleInputChange('vehicle_details', 'navigation_system', value)}>

                <SelectTrigger id="navigation_system">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="built_in">Built-in</SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Steering Wheel Controls (Multi-select) - MOVED */}
            <div className="space-y-2 md:col-span-2">
              <Label className="block text-sm font-medium text-slate-700 mb-2">Steering Wheel Controls</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sw_audio"
                    checked={formData.vehicle_details.steering_wheel_controls?.includes('audio')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'steering_wheel_controls', 'audio', null)} />

                  <Label htmlFor="sw_audio" className="cursor-pointer">Audio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sw_cruise_control"
                    checked={formData.vehicle_details.steering_wheel_controls?.includes('cruise_control')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'steering_wheel_controls', 'cruise_control', null)} />

                  <Label htmlFor="sw_cruise_control" className="cursor-pointer">Cruise Control</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sw_phone_call"
                    checked={formData.vehicle_details.steering_wheel_controls?.includes('phone_call')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'steering_wheel_controls', 'phone_call', null)} />

                  <Label htmlFor="sw_phone_call" className="cursor-pointer">Phone Call</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sw_voice_command"
                    checked={formData.vehicle_details.steering_wheel_controls?.includes('voice_command')}
                    onCheckedChange={(checked) => handleMultiSelectChange('vehicle_details', 'steering_wheel_controls', 'voice_command', null)} />

                  <Label htmlFor="sw_voice_command" className="cursor-pointer">Voice Command</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> All fields on this page are optional. Providing detailed technology and connectivity information can highlight modern conveniences and increase buyer interest.
          </p>
        </div>
      </motion.div>);

  };

  const renderPhotos = () =>
  <motion.div
    key="photos"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6">

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-7 h-7 text-blue-600" />
          Vehicle Photos <span className="text-red-500">*</span>
        </h2>
        <p className="text-slate-600">
          Upload clear photos of your vehicle to help us create the best listing possible.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center"
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => imageInputRef.current?.click()}>

            {isUploading ?
          <>
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <p className="text-sm text-slate-500">Processing and uploading {uploadCount > 0 ? `${uploadCount} file(s)...` : '...'}</p>
                <p className="text-xs text-slate-500">Optimizing for fast loading</p>
              </> :

          <>
                <Camera className="w-10 h-10 text-slate-400 mb-3" />
                <p className="font-semibold text-slate-700">Upload files or drag and drop</p>
                <p className="text-sm text-slate-500">PNG, JPG, GIF up to 30MB each (will be processed on client and server)</p>
              </>
          }
            <Input
            ref={imageInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/gif"
            disabled={isUploading} />

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {formData.vehicle_details.images.map((largeUrl, index) =>
          renderImagePreview(largeUrl, index)
          )}

            {isUploading && uploadCount > 0 &&
          Array.from({ length: uploadCount }).map((_, index) =>
          <div key={`upload-${index}`} className="relative">
                  <div className="w-full h-32 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <div className="text-white text-xs">Processing...</div>
                  </div>
                </div>
          )}
          </div>

          {validationErrors.images &&
        <p className="text-sm text-red-500 mt-4">{validationErrors.images}</p>
        }

          {formData.vehicle_details.images.length === 0 && !isUploading &&
        <p className="text-sm text-slate-500 mt-4">
              Add photos of your vehicle to help us create the best listing possible. (Required for next step)
            </p>
        }
        </CardContent>
      </Card>
    </motion.div>;


  const renderAccessArrangements = () =>
  <motion.div
    key="access_arrangements"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6">

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <KeyRound className="w-7 h-7 text-blue-600" />
          Access Arrangements
        </h2>
        <p className="text-slate-600">
          Help us understand how we can access your vehicle for photos, inspections, and test drives.
        </p>
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
            onChange={(e) => handleInputChange('access_arrangements', 'vehicle_location_address', e.target.value)}
            placeholder="e.g., 123 Main Street, Naha, Okinawa"
            className="mt-1" />

            {validationErrors.vehicle_location_address &&
          <p className="text-sm text-red-500">{validationErrors.vehicle_location_address}</p>
          }
          </div>

          <div>
            <Label htmlFor="vehicle_access_availability" className="text-sm font-semibold text-slate-700">
              When can we access the vehicle? <span className="text-red-500">*</span>
            </Label>
            <Textarea
            id="vehicle_access_availability"
            value={formData.access_arrangements.vehicle_access_availability}
            onChange={(e) => handleInputChange('access_arrangements', 'vehicle_access_availability', e.target.value)}
            placeholder="e.g., Weekdays 9 AM - 5 PM, Weekends by appointment"
            className="mt-1"
            rows={3} />

            {validationErrors.vehicle_access_availability &&
          <p className="text-sm text-red-500">{validationErrors.vehicle_access_availability}</p>
          }
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
              onValueChange={(value) => handleInputChange('access_arrangements', 'key_access_method', value)}>

                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select key access method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct_handover">Direct handover to Speedio Staff</SelectItem>
                  <SelectItem value="lockbox">Lockbox at vehicle location</SelectItem>
                  <SelectItem value="key_dropoff">Key drop-off at specified location</SelectItem>
                  <SelectItem value="emergency_contact">Through emergency contact</SelectItem>
                  <SelectItem value="other">Other (specify in details)</SelectItem>
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
              onChange={(e) => handleInputChange('access_arrangements', 'key_pickup_location', e.target.value)}
              placeholder="Where can we pick up the keys?"
              className="mt-1" />

              {validationErrors.key_pickup_location &&
            <p className="text-sm text-red-500">{validationErrors.key_pickup_location}</p>
            }
            </div>

            <div>
              <Label htmlFor="key_pickup_availability" className="text-sm font-semibold text-slate-700">
                Key Pickup Availability <span className="text-red-500">*</span>
              </Label>
              <Textarea
              id="key_pickup_availability"
              value={formData.access_arrangements.key_pickup_availability}
              onChange={(e) => handleInputChange('access_arrangements', 'key_pickup_availability', e.target.value)}
              placeholder="When are you available for key handover? (days/times)"
              className="mt-1"
              rows={2} />

              {validationErrors.key_pickup_availability &&
            <p className="text-sm text-red-500">{validationErrors.key_pickup_availability}</p>
            }
            </div>

            <div>
              <Label htmlFor="key_location_details" className="text-sm font-semibold text-slate-700">
                Additional Key Access Details
              </Label>
              <Textarea
              id="key_location_details"
              value={formData.access_arrangements.key_location_details}
              onChange={(e) => handleInputChange('access_arrangements', 'key_location_details', e.target.value)}
              placeholder="Any special instructions for key access, lockbox codes, etc."
              className="mt-1"
              rows={2} />

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
              onChange={(e) => handleInputChange('access_arrangements', 'emergency_contact_name', e.target.value)}
              placeholder="Full name of emergency contact"
              className="mt-1" />

              {validationErrors.emergency_contact_name &&
            <p className="text-sm text-red-500">{validationErrors.emergency_contact_name}</p>
            }
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone" className="text-sm font-semibold text-slate-700">
                Emergency Contact Phone <span className="text-red-500">*</span>
              </Label>
              <Input
              id="emergency_contact_phone"
              value={formData.access_arrangements.emergency_contact_phone}
              onChange={(e) => handleInputChange('access_arrangements', 'emergency_contact_phone', e.target.value)}
              placeholder="Phone number for emergencies"
              className="mt-1" />

              {validationErrors.emergency_contact_phone &&
            <p className="text-sm text-red-500">{validationErrors.emergency_contact_phone}</p>
            }
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability_for_handover">Availability for Handover</Label>
            <Textarea
            id="availability_for_handover"
            placeholder="e.g., Weekdays 9 AM - 5 PM. Or, I can coordinate directly."
            rows={3}
            value={formData.access_arrangements.availability_for_handover}
            onChange={(e) => handleInputChange('access_arrangements', 'availability_for_handover', e.target.value)} />

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
                  Providing a Power of Attorney (委任状 - Ininjo) allows us to handle the vehicle's title transfer and other paperwork on your behalf, making the final sale completely seamless for you.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                 <Checkbox
                id="power_of_attorney"
                checked={formData.access_arrangements.power_of_attorney}
                onCheckedChange={(checked) => handleInputChange('access_arrangements', 'power_of_attorney', checked)} />

                <div>
                  <Label htmlFor="power_of_attorney" className="text-sm">
                    I will provide a Power of Attorney.
                  </Label>
                </div>
              </div>
               <AnimatePresence>
                {formData.access_arrangements.power_of_attorney &&
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4">

                    <Label htmlFor="power_of_attorney_details">Notes on Power of Attorney</Label>
                     <Textarea
                  id="power_of_attorney_details"
                  value={formData.access_arrangements.power_of_attorney_details}
                  onChange={(e) => handleInputChange('access_arrangements', 'power_of_attorney_details', e.target.value)}
                  placeholder="e.g., 'I will mail it to your office next week.' or 'Ready for pickup with the vehicle keys.'" />

                  </motion.div>
              }
              </AnimatePresence>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">Other Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 pt-0">
              <div>
                <Label htmlFor="special_instructions">Special Instructions or Notes for Speedio</Label>
                <Textarea
                id="special_instructions"
                value={formData.access_arrangements.special_instructions}
                onChange={(e) => handleInputChange('access_arrangements', 'special_instructions', e.target.value)}
                placeholder="Anything else we should know? e.g., 'The car has a custom sound system.' or 'Please avoid driving on weekends.'" />

              </div>
              <div className="flex items-start space-x-2 mt-4">
                <Checkbox
                id="agreed_to_access_terms"
                checked={formData.access_arrangements.agreed_to_access_terms}
                onCheckedChange={(checked) => handleInputChange('access_arrangements', 'agreed_to_access_terms', checked)}
                className="mt-1" />

                <div>
                  <Label htmlFor="agreed_to_access_terms" className="text-sm">
                    I agree to provide Speedio safe and reasonable access to my vehicle for inspections, photography, and test drives. <span className="text-red-500">*</span>
                  </Label>
                  {validationErrors.agreed_to_access_terms &&
                <p className="text-sm text-red-500">{validationErrors.agreed_to_access_terms}</p>
                }
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>;



  const renderReviewAndSubmit = () => {
    const { vehicle_details, access_arrangements, requester_contact_info } = formData;
    const askingPrice = parseFloat(vehicle_details.seller_asking_price || 0); // Use parseFloat
    const serviceFeeReview = _calculateServiceFeeAmount(askingPrice);
    const buyerPriceReview = calculateBuyerPrice(askingPrice);
    const ownerReceivesReview = askingPrice;

    // Helper to format enum/string values
    const formatValue = (value) => {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      if (Array.isArray(value)) {
        return value.length > 0 ? value.map((v) => v.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')).join(', ') : '-';
      }
      if (typeof value === 'string' && value.includes('_')) {// for enum-like strings
        return value.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }
      return value || '-';
    };

    return (
      <motion.div
        key="review_submit"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6">

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-blue-600" />
            Review & Submit
          </h2>
          <p className="text-slate-600">
            Please review all the details before submitting your managed sale request.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              Your Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Full Name:</span> <span className="font-medium text-slate-800">{requester_contact_info.full_name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800">{requester_contact_info.email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-800">{requester_contact_info.phone || '-'}</span></div>
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
            <div className="flex justify-between"><span className="text-slate-500">Title:</span> <span className="font-medium text-slate-800">{vehicle_details.title || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Make & Model:</span> <span className="font-medium text-slate-800">{`${vehicle_details.make || '-'} ${vehicle_details.model || '-'}`}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Year:</span> <span className="font-medium text-slate-800">{vehicle_details.year || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Mileage:</span> <span className="font-medium text-slate-800">{vehicle_details.mileage?.toLocaleString() || '-'} km</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Location:</span> <span className="font-medium text-slate-800">{vehicle_details.location || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Description:</span> <span className="font-medium text-slate-800 truncate max-w-[60%]">{vehicle_details.description || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Financing Available:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.financing_available)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Warranty Available:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.warranty_available)}</span></div>
            {vehicle_details.warranty_available === 'Yes' && vehicle_details.warranty_link &&
            <div className="flex justify-between"><span className="text-slate-500">Warranty Link:</span> <span className="font-medium text-slate-800 truncate max-w-[60%]">{vehicle_details.warranty_link}</span></div>
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-500" />
              Vehicle Specifications Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Transmission:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.transmission)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Drive Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.drive_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Fuel Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.fuel_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Engine Size:</span> <span className="font-medium text-slate-800">{vehicle_details.engine_size || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Body Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.body_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Exterior Color:</span> <span className="font-medium text-slate-800">{vehicle_details.exterior_color || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Interior Color:</span> <span className="font-medium text-slate-800">{vehicle_details.interior_color || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Doors:</span> <span className="font-medium text-slate-800">{vehicle_details.doors || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Seating Capacity:</span> <span className="font-medium text-slate-800">{vehicle_details.seating_capacity || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Steering Wheel:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.steering_wheel)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Condition:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.condition)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-blue-500" />
              Performance & Mechanical Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Engine Type:</span> <span className="font-medium text-slate-800">{vehicle_details.engine_type || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Power Output:</span> <span className="font-medium text-slate-800">{vehicle_details.power_output || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Fuel Efficiency:</span> <span className="font-medium text-slate-800">{vehicle_details.fuel_efficiency || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Drivetrain:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.drivetrain)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Suspension Type:</span> <span className="font-medium text-slate-800">{vehicle_details.suspension_type || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Brake System:</span> <span className="font-medium text-slate-800">{vehicle_details.brakes || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tire Condition:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.tire_condition)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Battery Condition:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.battery_condition)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Hybrid System:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.hybrid_system_status)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Maintenance History:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.maintenance_history)}</span></div>
          </CardContent>
        </Card>

        {/* NEW: Features Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" />
              Vehicle Features Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Power Sliding Doors:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.power_sliding_doors)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Headlights:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.headlights)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Fog Lights:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.fog_lights)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Alloy Wheels:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.alloy_wheels)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Spoiler:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.spoiler)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tinted Windows:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.tinted_windows)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Roof Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.roof_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Side Mirrors:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.side_mirrors)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Body Condition:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.body_condition)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Keyless Entry:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.keyless_entry)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Remote Door Locking:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.remote_door_locking)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Air Conditioning:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.air_conditioning)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Upholstery:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.upholstery)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Seat Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.seat_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Seat Adjustments:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.seat_adjustments)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Rear Camera:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.rear_camera)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Parking Sensors:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.parking_sensors)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Power Windows:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.power_windows)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Interior Lighting:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.interior_lighting)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Cup Holders/Storage:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.cup_holders_storage)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Child Locks/ISOFIX:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.child_lock_isofix)}</span></div>
          </CardContent>
        </Card>

        {/* NEW: Technology Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-500" />
              Technology Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Bluetooth:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.bluetooth)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">USB Ports:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.usb_ports)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">12V Outlet:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.twelve_v_outlet)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Smart Key/Push Start:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.smart_key_push_start)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Display Screen Size:</span> <span className="font-medium text-slate-800">{vehicle_details.display_screen_size || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Rear Entertainment System:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.rear_entertainment_system)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Voice Command/Hands-Free:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.voice_command_hands_free)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Digital Dashboard Display:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.digital_dashboard_display)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Infotainment System:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.infotainment_system)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Navigation System:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.navigation_system)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Steering Wheel Controls:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.steering_wheel_controls)}</span></div>
          </CardContent>
        </Card>

        {/* NEW: Safety & Security Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Safety & Security Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Cruise Control:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.cruise_control)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ABS:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.abs)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">ESC / Stability Control:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.esc_stability_control)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Lane Departure Warning:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.lane_departure_warning)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Collision Mitigation:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.collision_mitigation)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Traction Control:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.traction_control)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Hill Start Assist:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.hill_start_assist)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Immobilizer / Alarm:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.immobilizer_alarm)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Seat Belt Sensors:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.seat_belt_sensors)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Airbags:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.airbags)}</span></div>
          </CardContent>
        </Card>

        {/* NEW: Registration & Inspection Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Registration & Inspection Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Plate Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.current_plate_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Shaken Valid Until:</span> <span className="font-medium text-slate-800">{vehicle_details.shaken_valid_until || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Road Tax Paid:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.road_tax_paid)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">JCI Valid Until:</span> <span className="font-medium text-slate-800">{vehicle_details.jci_insurance_valid_until || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Title Type:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.title_type)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Registration Location:</span> <span className="font-medium text-slate-800">{formatValue(vehicle_details.registration_location)}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Pricing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Your Asking Price:</span>
              <span className="font-semibold">${askingPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-blue-600">
              <span>
                Service Fee
                {(() => {
                  const price = askingPrice;
                  if (price < 500) return ' ($300 minimum)';
                  if (price <= 3000) return ' (scales $300-$500)';
                  if (price <= 8333) return ' ($500 flat)';
                  return ' (6%)';
                })()}
                (added to listing):
              </span>
              <span className="font-semibold">+${serviceFeeReview.toLocaleString()}</span>
            </div>
            <div className="border-t border-blue-300 pt-2 flex justify-between text-lg font-bold text-blue-800">
              <span>Vehicle Listing Price:</span>
              <span>${buyerPriceReview.toLocaleString()}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-emerald-300 flex justify-between text-lg font-bold text-emerald-800">
              <span>You'll Receive (after sale):</span>
              <span>${ownerReceivesReview.toLocaleString()}</span>
            </div>
            <div className="mt-4 p-3 bg-white/60 rounded-md">
              <p className="text-xs text-emerald-800">
                <Info className="w-4 h-4 inline mr-1" />
                Your vehicle will be listed at ${buyerPriceReview.toLocaleString()}. When it sells, you receive your full asking price of ${ownerReceivesReview.toLocaleString()}. The service fee is included in the buyer's price.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              Photos Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vehicle_details.images_thumbnails.length > 0 ?
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle_details.images_thumbnails.map((thumbnailUrl, index) =>
              <img key={index} src={thumbnailUrl} alt={`Vehicle Image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
              )}
              </div> :

            <p className="text-slate-500">No images uploaded.</p>
            }
          </CardContent>
        </Card>

        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms_agreed"
              checked={formData.terms_agreed}
              onCheckedChange={(checked) => handleInputChange('terms_agreed', 'terms_agreed', checked)}
              className="mt-1" />

            <div>
              <Label htmlFor="terms_agreed" className="text-sm text-blue-800 cursor-pointer">
                I agree to Speedio's managed sale terms, including the service fee being added to my asking price, forming the final vehicle listing price upon successful completion. <span className="text-red-500">*</span>
              </Label>
              <p className="text-xs text-blue-600 mt-1">
                By checking this box, you authorize Speedio to handle the complete sale process, including photography, listing, buyer communication, test drives, and final sale completion. You receive your full asking price; the service fee is paid by the buyer.
              </p>
              {validationErrors.terms_agreed &&
              <p className="text-sm text-red-500 mt-1">{validationErrors.terms_agreed}</p>
              }
            </div>
          </div>
        </div>

        <Alert>
          <MapPin className="w-4 h-4" />
          <AlertDescription>
            <strong>Service Area Notice:</strong> This service is currently available in Okinawa, Japan only.
            We're expanding to other locations soon.
          </AlertDescription>
        </Alert>
      </motion.div>);

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
        return renderTechnology(); // NEW STEP CONTENT
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
        {/* Modal Overlay and Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto p-4">

          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-500 to-emerald-500">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {isSubmittingEdit ? 'Request Changes to Managed Sale' : 'Request Managed Sale Service'}
                </h2>
                <p className="text-white/90 mt-1">
                  Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} disabled={isSubmitting} className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentStep / steps.length * 100}%` }}
                  transition={{ duration: 0.3, ease: "easeInOut" }} />

              </div>
              <div className="flex justify-between mt-3">
                {steps.map((step, index) =>
                <span
                  key={step.number}
                  className={`text-xs font-medium transition-colors ${
                  currentStep === step.number ?
                  'text-blue-600' :
                  currentStep > step.number ?
                  'text-emerald-600' :
                  'text-slate-400'}`
                  }>

                    {step.title}
                  </span>
                )}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 flex-grow max-h-[60vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isSubmitting}>

                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < steps.length ?
              <Button onClick={handleNext} disabled={isSubmitting}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button> :

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || Object.keys(validationErrors).length > 0}
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">

                  {isSubmitting ?
                <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </> :
                isSubmittingEdit ?
                <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Changes
                    </> :

                <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </>
                }
                </Button>
              }
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showLocationVerification &&
        <LocationVerification
          location={formData.vehicle_details.location}
          onConfirm={handleLocationVerified}
          onCancel={() => setShowLocationVerification(false)} />

        }
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal &&
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessClose} />

        }
      </AnimatePresence>
    </>);

}

"use client"
import React, { useState, useEffect, useCallback } from "react";
import { ManagedSaleRequest, Message, Notification, UserEntity, Vehicle, VehicleInspectionChecklist } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  Clock,
  Car,
  Loader2,
  Handshake,
  Image,
  Edit,
  MoreHorizontal,
  Eye,
  DollarSign,
  Trash2,
  X,
  Calendar,
  ClipboardCheck,
  ChevronDown,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ManagedSaleDetailsModal from '../dashboard/ManagedSaleDetailsModal';
import { useToast } from "@/components/ui/use-toast";
import RequestForm from '../managedsales/RequestForm';
import AdminAvailabilityManager from './AdminAvailabilityManager';
import VehicleInspectionChecklistModal from './VehicleInspectionChecklistModal';



// Helper function to normalize old image format to new format
const normalizeImagesToNewFormat = (images) => {
  if (!images || images.length === 0) {
    return {
      images: [],
      images_thumbnails: [],
      images_small: [],
      images_medium: []
    };
  }

  const result = {
    images: [],
    images_thumbnails: [],
    images_small: [],
    images_medium: []
  };

  images.forEach(img => {
    if (typeof img === 'string') {
      // If it's a string (likely a direct URL), use for all sizes
      result.images.push(img);
      result.images_thumbnails.push(img);
      result.images_small.push(img);
      result.images_medium.push(img);
    } else if (typeof img === 'object' && img !== null) {
      // If it's an object (old format), extract each size
      result.images.push(img.large || img.original || img.medium || '');
      result.images_thumbnails.push(img.thumbnail || img.small || img.large || '');
      result.images_small.push(img.small || img.medium || img.large || '');
      result.images_medium.push(img.medium || img.large || '');
    }
  });

  return result;
};

// Helper function to get the best quality image URL from an image (for display purposes)
// This function can handle both the new array-based storage (by picking first from 'images' array)
// and older single-object/string formats gracefully for display.
const getImageUrl = (image, preferredSize = 'large') => {
  // If the image itself is an array of images (new format's 'images' field)
  if (Array.isArray(image)) {
    // Pick the first image in the array, assuming it's the main large URL
    return image.length > 0 ? image[0] : '';
  }
  // If it's a string (legacy single URL)
  if (typeof image === 'string') return image;
  // If it's an object (legacy detailed object per image)
  if (typeof image === 'object' && image !== null) {
    return image[preferredSize] || image.large || image.medium || image.small || image.thumbnail || image.original || '';
  }
  return '';
};

export default function ManagedSalesAdmin() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [managingAvailabilityRequest, setManagingAvailabilityRequest] = useState(null);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [checklistRequest, setChecklistRequest] = useState(null);
  const [existingChecklist, setExistingChecklist] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [checklistsList, setChecklistsList] = useState([]);
  const [isLoadingChecklists, setIsLoadingChecklists] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();

  // Helper function to calculate service fee (same logic as in RequestForm)
  const calculateServiceFeeAmount = (price) => {
    if (!price || price <= 0) return 0;
    const numericPrice = parseInt(price);
    if (isNaN(numericPrice)) return 0;

    if (numericPrice < 500) {
      return 300;
    } else if (numericPrice <= 3000) {
      return Math.round(300 + (numericPrice - 500) * 0.08);
    } else if (numericPrice <= 8333) { // This implies 500 for a range, up to where 6% kicks in
      return 500;
    } else {
      return Math.round(numericPrice * 0.06);
    }
  };

  // Helper function to calculate prices correctly from stored MSR data
  const calculatePrices = (request) => {
    // Priority 1: Use new directly stored values from RequestForm submission
    // final_sale_price_for_buyer is what buyer pays (listing price)
    // owner_receives_amount is what the owner gets
    // service_fee_amount is the fee
    if (request.final_sale_price_for_buyer !== undefined && request.owner_receives_amount !== undefined && request.service_fee_amount !== undefined) {
      const buyerPrice = parseFloat(request.final_sale_price_for_buyer);
      const serviceFee = parseFloat(request.service_fee_amount);
      const sellerReceives = parseFloat(request.owner_receives_amount);
      
      return {
        buyerPrice,
        serviceFee,
        sellerReceives
      };
    }

    // Priority 2: Use legacy calculated_buyer_price and service_fee_amount if new fields are missing
    if (request.calculated_buyer_price !== undefined && request.service_fee_amount !== undefined) {
      const buyerPrice = parseFloat(request.calculated_buyer_price);
      const serviceFee = parseFloat(request.service_fee_amount);
      const sellerReceives = buyerPrice - serviceFee;
      
      return {
        buyerPrice,
        serviceFee,
        sellerReceives
      };
    }

    // Priority 3: If only calculated_buyer_price exists (and service_fee_amount might be missing or incorrect)
    // This implies a partial old data or a bug. Recalculate service fee based on known buyerPrice.
    if (request.calculated_buyer_price) {
      const buyerPrice = parseFloat(request.calculated_buyer_price);
      const serviceFee = calculateServiceFeeAmount(buyerPrice); 
      const sellerReceives = buyerPrice - serviceFee;
      
      return {
        buyerPrice,
        serviceFee,
        sellerReceives
      };
    }

    // Priority 4: Fallback to seller_asking_price (for backwards compatibility or initial state)
    // Here, seller_asking_price is interpreted as the *owner_receives_amount*, and service fee is added to get buyer price.
    if (request.vehicle_details?.seller_asking_price) {
      const sellerReceives = parseFloat(request.vehicle_details.seller_asking_price);
      const serviceFee = calculateServiceFeeAmount(sellerReceives); // Service fee based on what *owner receives*
      const buyerPrice = sellerReceives + serviceFee;
      
      return {
        buyerPrice,
        serviceFee,
        sellerReceives
      };
    }

    // No price data available
    return {
      buyerPrice: null,
      serviceFee: null,
      sellerReceives: null
    };
  };

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const [requestsData, usersData, userData] = await Promise.all([
        ManagedSaleRequest.list("-created_date", 50),
        UserEntity.list(),
        UserEntity.me(),
      ]);

      setRequests(requestsData);
      setUsers(usersData);
      setCurrentUser(userData);

    } catch (error) {
      console.error("Failed to load data for admin panel:", error);
      toast({
        title: "Loading Failed",
        description: "Could not load managed sales requests. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }, [toast]);

  const loadChecklists = useCallback(async () => {
    setIsLoadingChecklists(true);
    try {
      const allChecklists = await VehicleInspectionChecklist.filter({});
      setChecklistsList(allChecklists);
    } catch (error) {
      console.error("Failed to load all checklists:", error);
      toast({
        title: "Loading Failed",
        description: "Could not load vehicle inspection checklists. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoadingChecklists(false);
  }, [toast]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (activeTab === 'checklists') {
      loadChecklists();
    }
  }, [activeTab, loadChecklists]);

  const getUserName = useCallback((userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.full_name || user.email : "Unknown User";
  }, [users]);

  // Effect for filtering and searching requests
  useEffect(() => {
    let tempFilteredRequests = requests;

    if (filter !== "all") {
      if (filter === "approved_and_listed") {
        tempFilteredRequests = tempFilteredRequests.filter(request => request.status === "approved" || request.status === "listed");
      } else if (filter === "edit_requested") {
        tempFilteredRequests = tempFilteredRequests.filter(request => request.status === "edit_requested");
      } else if (filter === "cancellation_requested") {
        tempFilteredRequests = tempFilteredRequests.filter(request => request.status === "cancellation_requested");
      } else {
        tempFilteredRequests = tempFilteredRequests.filter(request => request.status === filter);
      }
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempFilteredRequests = tempFilteredRequests.filter(request =>
        (request.vehicle_details?.title && request.vehicle_details.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.vehicle_details?.make && request.vehicle_details.make.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (request.vehicle_details?.model && request.vehicle_details.model.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (getUserName(request.submitted_by_user_id).toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    setFilteredRequests(tempFilteredRequests);
  }, [requests, filter, searchTerm, users, getUserName]);

  const handleStatusChange = async (requestId, newStatus, userFacingNotes, recurringAvailability = []) => {
    setIsProcessing(true);
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) {
        console.error("Request not found:", requestId);
        setIsProcessing(false);
        return;
      }

      if (!currentUser || !currentUser.id) {
        throw new Error("Current admin user not found. Cannot send notification.");
      }

      const updatePayload = { status: newStatus, user_facing_notes: userFacingNotes };
      let notificationContent = "";

      if (newStatus === 'approved') {
        const vehicleCreatedBy = currentUser.email || "admin@speedio.com";

        // Calculate prices based on the new model (seller_asking_price as owner_receives, buyer price = owner_receives + service fee)
        let ownerReceives = request.owner_receives_amount;
        let serviceFee = request.service_fee_amount;
        let buyerPrice = request.final_sale_price_for_buyer;

        if (ownerReceives === undefined && request.vehicle_details?.seller_asking_price !== undefined) {
            ownerReceives = parseFloat(request.vehicle_details.seller_asking_price);
            serviceFee = calculateServiceFeeAmount(ownerReceives);
            buyerPrice = ownerReceives + serviceFee;
        } else if (buyerPrice === undefined && ownerReceives !== undefined && serviceFee !== undefined) {
            buyerPrice = ownerReceives + serviceFee;
        } else if (buyerPrice === undefined && request.calculated_buyer_price !== undefined) { // Fallback to legacy calculated_buyer_price
            buyerPrice = parseFloat(request.calculated_buyer_price);
            serviceFee = serviceFee !== undefined ? parseFloat(serviceFee) : calculateServiceFeeAmount(buyerPrice);
            ownerReceives = buyerPrice - serviceFee;
        } else if (request.vehicle_details?.seller_asking_price !== undefined && buyerPrice === undefined) { // Fallback to seller_asking_price as last resort
          ownerReceives = parseFloat(request.vehicle_details.seller_asking_price);
          serviceFee = calculateServiceFeeAmount(ownerReceives);
          buyerPrice = ownerReceives + serviceFee;
        }


        if (isNaN(buyerPrice) || buyerPrice <= 0) {
            throw new Error("Cannot determine vehicle price. Please ensure price information is available.");
        }

        // Normalize images before creating/updating vehicle
        const { images, images_thumbnails, images_small, images_medium } = normalizeImagesToNewFormat(request.vehicle_details.images);
        
        const vehicleData = {
          title: request.vehicle_details.title,
          make: request.vehicle_details.make,
          model: request.vehicle_details.model,
          year: request.vehicle_details.year,
          mileage: request.vehicle_details.mileage || 0,
          condition: request.vehicle_details.condition,
          description: request.vehicle_details.description,
          fuel_type: request.vehicle_details.fuel_type,
          transmission: request.vehicle_details.transmission,
          location: request.vehicle_details.location,
          price: buyerPrice, // Use calculated buyerPrice here
          website_managed: true,
          status: 'available',
          verified: true,
          views: 0,
          created_by: vehicleCreatedBy,
          original_owner_id: request.submitted_by_user_id,
          recurring_availability: recurringAvailability, // recurringAvailability from handleStatusChange signature
          booked_slots: [],
          // New image fields
          images: images,
          images_thumbnails: images_thumbnails,
          images_small: images_small,
          images_medium: images_medium,
          primary_image: images[0] || null,
          primary_image_thumbnail: images_thumbnails[0] || null,
          primary_image_small: images_small[0] || null,
          primary_image_medium: images_medium[0] || null,
        };

        let newVehicle = null;
        if (request.created_vehicle_id) {
          // If vehicle already exists, update it
          await Vehicle.update(request.created_vehicle_id, vehicleData);
          newVehicle = { id: request.created_vehicle_id, title: request.vehicle_details.title }; // Mock object for notification
        } else {
          // If vehicle doesn't exist, create it
          newVehicle = await Vehicle.create(vehicleData);
          updatePayload.created_vehicle_id = newVehicle.id;
        }

        updatePayload.status = 'listed';
        // Ensure calculated prices are stored on the request if they weren't already or if they've changed
        updatePayload.final_sale_price_for_buyer = buyerPrice;
        updatePayload.owner_receives_amount = ownerReceives;
        updatePayload.service_fee_amount = serviceFee;

        // Ensure images are normalized on the MSR as well
        updatePayload.vehicle_details = {
          ...request.vehicle_details,
          images: images,
          images_thumbnails: images_thumbnails,
          images_small: images_small,
          images_medium: images_medium,
        };

        notificationContent = `Your managed sale for '${request.vehicle_details.title}' has been approved and listed with test drive availability!`;

        await Message.create({
          recipient_id: request.submitted_by_user_id,
          sender_id: currentUser.id,
          content: `🎉 Great news! Your managed sale request for "${request.vehicle_details.title}" has been approved by our team.

Your vehicle is now live on Speedio with the following details:
• Listed Price: $${buyerPrice?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
• Status: Available for test drives
• Managed by: Speedyo Team

We've set up test drive availability based on your access arrangements. Potential buyers can now schedule test drives, and we'll coordinate everything for you.

You can view your live listing anytime from your dashboard. We'll keep you updated on any test drive requests and buyer interest.

Thank you for choosing Speedyo's managed sales service! 🚗`,
          message_type: "system",
          managed_sale_request_id: request.id,
          vehicle_id: newVehicle.id,
          conversation_id: `managed_sale_${request.id}`
        });

      } else if (newStatus === 'declined') {
        notificationContent = `Your managed sale for '${request.vehicle_details.title}' was declined. Reason: ${userFacingNotes}`;
        await Message.create({
          recipient_id: request.submitted_by_user_id,
          sender_id: currentUser.id,
          content: `Regarding your managed sale request for "${request.vehicle_details.title}", it has been declined. Reason: ${userFacingNotes || 'No reason provided.'} Please check your dashboard for more details.`,
          message_type: "system",
          managed_sale_request_id: request.id,
          conversation_id: `managed_sale_${request.id}`
        });
      } else if (newStatus === 'sold') {
        notificationContent = `Your managed sale for '${request.vehicle_details.title}' has been marked as sold! Congratulations!`;
      } else {
        notificationContent = `Your managed sale for '${request.vehicle_details.title}' status changed to '${newStatus.replace('_', ' ')}'.`;
      }

      updatePayload.admin_notes = userFacingNotes;

      await ManagedSaleRequest.update(requestId, updatePayload);

      await Notification.create({
        recipient_id: request.submitted_by_user_id,
        sender_id: currentUser.id,
        type: "managed_sale_status_update",
        content: notificationContent,
        related_entity_type: "ManagedSaleRequest",
        related_entity_id: request.id,
        url: createPageUrl("Dashboard"),
        icon: newStatus === 'approved' || newStatus === 'sold' ? "CheckCircle" : newStatus === 'declined' ? "XCircle" : "Bell"
      });

      await loadRequests();
      setSelectedRequest(null);
      setIsModalOpen(false);
      setAdminNotes("");
      toast({
        title: "Status Updated",
        description: `Request ${requestId} status changed to ${newStatus}.`,
        variant: "success",
      });

    } catch (error) {
      console.error("Failed to update request status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update request status. Please try again.",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleApproveEditRequest = async (request, editRequestIndex) => {
    const notes = prompt("Optional: Add a note to the user about this approval.");
    setIsProcessing(true);

    try {
      const editRequest = request.edit_requests[editRequestIndex];
      if (!editRequest) throw new Error("Edit request not found");

      const updatedRequest = JSON.parse(JSON.stringify(request));

      const vehicleChanges = editRequest.requested_changes.vehicle_details || {};
      const accessChanges = editRequest.requested_changes.access_arrangements || {};

      Object.assign(updatedRequest.vehicle_details, vehicleChanges);
      Object.assign(updatedRequest.access_arrangements, accessChanges);

      updatedRequest.edit_requests[editRequestIndex] = {
        ...editRequest,
        status: 'approved',
        admin_notes: notes || 'Edit request approved',
        processed_at: new Date().toISOString()
      };

      if (vehicleChanges.seller_asking_price !== undefined) {
        const newSellerAskingPrice = parseFloat(vehicleChanges.seller_asking_price);
        if (!isNaN(newSellerAskingPrice)) {
          const serviceFee = calculateServiceFeeAmount(newSellerAskingPrice);
          updatedRequest.owner_receives_amount = newSellerAskingPrice; // Owner receives this
          updatedRequest.service_fee_amount = serviceFee;
          updatedRequest.final_sale_price_for_buyer = newSellerAskingPrice + serviceFee; // Buyer pays this
        }
      }

      // Normalize images for the updated request before saving
      let currentImagesForMSR = updatedRequest.vehicle_details.images;
      const { images: msrImages, images_thumbnails: msrImagesThumbnails, images_small: msrImagesSmall, images_medium: msrImagesMedium } = normalizeImagesToNewFormat(currentImagesForMSR);

      updatedRequest.vehicle_details.images = msrImages;
      updatedRequest.vehicle_details.images_thumbnails = msrImagesThumbnails;
      updatedRequest.vehicle_details.images_small = msrImagesSmall;
      updatedRequest.vehicle_details.images_medium = msrImagesMedium;

      updatedRequest.status = updatedRequest.created_vehicle_id ? 'listed' : 'approved';
      updatedRequest.user_facing_notes = `Your edit request has been approved and applied. ${notes || ''}`;

      const msrUpdateData = {
        vehicle_details: {
          ...updatedRequest.vehicle_details, // includes new normalized image arrays
          images: msrImages,
          images_thumbnails: msrImagesThumbnails,
          images_small: msrImagesSmall,
          images_medium: msrImagesMedium,
        },
        access_arrangements: updatedRequest.access_arrangements,
        edit_requests: updatedRequest.edit_requests,
        owner_receives_amount: updatedRequest.owner_receives_amount,
        service_fee_amount: updatedRequest.service_fee_amount,
        final_sale_price_for_buyer: updatedRequest.final_sale_price_for_buyer,
        status: updatedRequest.status,
        user_facing_notes: updatedRequest.user_facing_notes
      };

      await ManagedSaleRequest.update(request.id, msrUpdateData);

      if (updatedRequest.created_vehicle_id) {
        const vehicleUpdates = {};

        Object.entries(vehicleChanges).forEach(([key, value]) => {
          if ([
            'title', 'make', 'model', 'year', 'mileage', 'condition', 'description',
            'fuel_type', 'transmission', 'location'
          ].includes(key)) {
            vehicleUpdates[key] = value;
          } else if (key === 'images' && Array.isArray(value)) {
            const { images: vhImages, images_thumbnails: vhImagesThumbnails, images_small: vhImagesSmall, images_medium: vhImagesMedium } = normalizeImagesToNewFormat(value);
            vehicleUpdates.images = vhImages;
            vehicleUpdates.images_thumbnails = vhImagesThumbnails;
            vehicleUpdates.images_small = vhImagesSmall;
            vehicleUpdates.images_medium = vhImagesMedium;
            vehicleUpdates.primary_image = vhImages[0] || null;
            vehicleUpdates.primary_image_thumbnail = vhImagesThumbnails[0] || null;
            vehicleUpdates.primary_image_small = vhImagesSmall[0] || null;
            vehicleUpdates.primary_image_medium = vhImagesMedium[0] || null;
          }
        });

        if (accessChanges.recurring_availability !== undefined) {
          vehicleUpdates.recurring_availability = accessChanges.recurring_availability;
        }

        if (updatedRequest.final_sale_price_for_buyer !== undefined) {
          vehicleUpdates.price = updatedRequest.final_sale_price_for_buyer;
        }

        if (Object.keys(vehicleUpdates).length > 0) {
          await Vehicle.update(updatedRequest.created_vehicle_id, vehicleUpdates);
        }
      }

      if (currentUser?.id) {
        await Notification.create({
          recipient_id: request.submitted_by_user_id,
          sender_id: currentUser.id,
          type: "managed_sale_status_update",
          content: `Your edit request for '${updatedRequest.vehicle_details.title}' has been approved and applied. ${notes ? `Note: ${notes}` : ''}`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: request.id,
          url: createPageUrl("Dashboard"),
          icon: "CheckCircle"
        });
      }

      toast({
        title: "Edit Request Approved",
        description: `Changes have been applied to ${updatedRequest.vehicle_details.title}`,
        variant: "success",
      });

      await loadRequests();
      setSelectedRequest(null);
      setIsModalOpen(false);

    } catch (error) {
      console.error("Failed to approve edit request:", error);
      toast({
        title: "Approval Failed",
        description: "Could not approve the edit request: " + error.message,
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const handleDeclineEditRequest = async (request, editRequestIndex) => {
    const reason = prompt("Why are you declining this edit request? This will be shared with the user:");
    if (reason === null) return;

    setIsProcessing(true);
    try {
      const updatedEditRequests = [...request.edit_requests];
      updatedEditRequests[editRequestIndex] = {
        ...request.edit_requests[editRequestIndex],
        status: 'declined',
        admin_notes: reason || 'Edit request declined',
        processed_at: new Date().toISOString()
      };

      await ManagedSaleRequest.update(request.id, {
        edit_requests: updatedEditRequests,
        status: request.created_vehicle_id ? 'listed' : 'approved',
        user_facing_notes: `Your cancellation request has been declined. Reason: ${reason || 'No reason provided'}`
      });

      if (currentUser?.id) {
        await Notification.create({
          recipient_id: request.submitted_by_user_id,
          sender_id: currentUser.id,
          type: "managed_sale_status_update",
          content: `Your edit request for '${request.vehicle_details.title}' was declined. Reason: ${reason || 'No reason provided'}`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: request.id,
          url: createPageUrl("Dashboard"),
          icon: "XCircle"
        });
      }

      toast({
        title: "Edit Request Declined",
        description: `Edit request has been declined.`,
        variant: "info",
      });

      await loadRequests();
      setSelectedRequest(null);
      setIsModalOpen(false);

    } catch (error) {
      console.error("Failed to decline edit request:", error);
      toast({
        title: "Decline Failed",
        description: "Could not decline the edit request.",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleApproveCancellation = async (request) => {
    if (window.confirm(`Are you sure you want to approve the cancellation request for "${request.vehicle_details.title}"?`)) {
      setIsProcessing(true);
      try {
        await ManagedSaleRequest.update(request.id, {
          status: 'cancelled',
          user_facing_notes: 'Your cancellation request has been approved. The listing has been removed.'
        });

        if (request.created_vehicle_id) {
          await Vehicle.update(request.created_vehicle_id, {
            status: 'cancelled'
          });
        }

        await Notification.create({
          recipient_id: request.submitted_by_user_id,
          sender_id: currentUser.id,
          type: "managed_sale_status_update",
          content: `Your cancellation request for '${request.vehicle_details.title}' has been approved. The listing has been removed from the marketplace.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: request.id,
          url: createPageUrl("Dashboard"),
          icon: "CheckCircle"
        });

        toast({
          title: "Cancellation Approved",
          description: `Cancellation request for "${request.vehicle_details.title}" has been approved.`,
          variant: "success",
        });

        await loadRequests();
        setSelectedRequest(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to approve cancellation:", error);
        toast({
          title: "Approval Failed",
          description: "Could not approve the cancellation request. Please try again.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  };

  const handleDeclineCancellation = async (request) => {
    const reason = prompt("Why are you declining this cancellation request? This will be shared with the user:");
    if (reason === null) return;

    setIsProcessing(true);
    try {
      const previousStatus = request.created_vehicle_id ? 'listed' : 'approved';

      await ManagedSaleRequest.update(request.id, {
        status: previousStatus,
        user_facing_notes: `Your cancellation request has been declined. Reason: ${reason || 'No reason provided.'}`
      });

      await Notification.create({
        recipient_id: request.submitted_by_user_id,
        sender_id: currentUser.id,
        type: "managed_sale_status_update",
        content: `Your cancellation request for '${request.vehicle_details.title}' has been declined. Reason: ${reason || 'No reason provided.'}`,
        related_entity_type: "ManagedSaleRequest",
        related_entity_id: request.id,
        url: createPageUrl("Dashboard"),
        icon: "XCircle"
      });

      toast({
        title: "Cancellation Declined",
        description: `Cancellation request for "${request.vehicle_details.title}" has been declined.`,
        variant: "info",
      });

      await loadRequests();
      setSelectedRequest(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to decline cancellation:", error);
      toast({
        title: "Decline Failed",
        description: "Could not decline the cancellation request. Please try again.",
        variant: "destructive",
      });
    }
    setIsProcessing(false);
  };

  const handleApproveRequest = useCallback(async (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (!request.vehicle_details) {
      toast({
        title: "Error",
        description: "Cannot approve request: missing vehicle details.",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Error",
        description: "You must be logged in as an admin to approve requests.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to approve and list "${request.vehicle_details.title}"?`)) {
      setIsProcessing(true);
      try {
        const requesterUser = await UserEntity.get(request.submitted_by_user_id);
        if (!requesterUser) {
          throw new Error("Could not find the user who submitted this request. Aborting.");
        }

        const notes = prompt("Optional: Add a note for the user");

        // Calculate prices based on the new model (seller_asking_price as owner_receives, buyer price = owner_receives + service fee)
        let ownerReceives = request.owner_receives_amount;
        let serviceFee = request.service_fee_amount;
        let buyerPrice = request.final_sale_price_for_buyer;

        if (ownerReceives === undefined && request.vehicle_details?.seller_asking_price !== undefined) {
            ownerReceives = parseFloat(request.vehicle_details.seller_asking_price);
            serviceFee = calculateServiceFeeAmount(ownerReceives);
            buyerPrice = ownerReceives + serviceFee;
        } else if (buyerPrice === undefined && ownerReceives !== undefined && serviceFee !== undefined) {
            buyerPrice = ownerReceives + serviceFee;
        } else if (buyerPrice === undefined && request.calculated_buyer_price !== undefined) { // Fallback to legacy calculated_buyer_price
            buyerPrice = parseFloat(request.calculated_buyer_price);
            serviceFee = serviceFee !== undefined ? parseFloat(serviceFee) : calculateServiceFeeAmount(buyerPrice);
            ownerReceives = buyerPrice - serviceFee;
        } else if (request.vehicle_details?.seller_asking_price !== undefined && buyerPrice === undefined) { // Fallback to seller_asking_price as last resort
          ownerReceives = parseFloat(request.vehicle_details.seller_asking_price);
          serviceFee = calculateServiceFeeAmount(ownerReceives);
          buyerPrice = ownerReceives + serviceFee;
        }

        if (isNaN(buyerPrice) || buyerPrice <= 0) {
          throw new Error("Cannot determine vehicle price. Please ensure price information is available.");
        }

        // Normalize images before creating vehicle
        const { images, images_thumbnails, images_small, images_medium } = normalizeImagesToNewFormat(request.vehicle_details.images);
        
        // Use final_sale_price_for_buyer (buyer's price) as the vehicle listing price
        const vehicleListingPrice = buyerPrice; 

        const vehicleData = {
          title: request.vehicle_details.title || `${request.vehicle_details.year} ${request.vehicle_details.make} ${request.vehicle_details.model}`,
          make: request.vehicle_details.make,
          model: request.vehicle_details.model,
          year: request.vehicle_details.year,
          mileage: request.vehicle_details.mileage || 0,
          condition: request.vehicle_details.condition,
          description: request.vehicle_details.description,
          fuel_type: request.vehicle_details.fuel_type,
          transmission: request.vehicle_details.transmission,
          location: request.vehicle_details.location,
          price: vehicleListingPrice, // Use calculated buyerPrice here for listing price
          website_managed: true,
          status: 'available',
          verified: true,
          featured: true,
          views: 0,
          original_owner_id: request.submitted_by_user_id,
          recurring_availability: request.access_arrangements?.recurring_availability || [],
          booked_slots: [],
          // New image fields
          images: images,
          images_thumbnails: images_thumbnails,
          images_small: images_small,
          images_medium: images_medium,
          primary_image: images[0] || null,
          primary_image_thumbnail: images_thumbnails[0] || null,
          primary_image_small: images_small[0] || null,
          primary_image_medium: images_medium[0] || null,
        };

        const createdVehicle = await Vehicle.create(vehicleData);

        // Update MSR - ensure calculated prices are stored
        const msrUpdateData = {
          status: 'listed',
          admin_notes: notes || `Approved by admin (${currentUser.full_name || currentUser.email}). Vehicle listed with ID: ${createdVehicle.id}`,
          user_facing_notes: notes || 'Your managed sale request has been approved and your vehicle is now listed!',
          created_vehicle_id: createdVehicle.id,
          final_sale_price_for_buyer: buyerPrice,
          owner_receives_amount: ownerReceives,
          service_fee_amount: serviceFee,
          // Ensure images are normalized on the MSR as well
          vehicle_details: {
            ...request.vehicle_details,
            images: images,
            images_thumbnails: images_thumbnails,
            images_small: images_small,
            images_medium: images_medium,
          },
        };

        await ManagedSaleRequest.update(request.id, msrUpdateData);

        if (request.submitted_by_user_id) {
          await Notification.create({
            recipient_id: request.submitted_by_user_id,
            sender_id: currentUser.id,
            type: "managed_sale_status",
            content: `Great news! Your managed sale request for "${request.vehicle_details.title}" has been approved and is now live on the marketplace at $${vehicleListingPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}. You'll receive $${ownerReceives.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} when it sells.`,
            related_entity_type: "Vehicle",
            related_entity_id: createdVehicle.id,
            url: createPageUrl(`Vehicle?id=${createdVehicle.id}`),
            icon: "CheckCircle"
          });

          const sortedUserIds = [currentUser.id, request.submitted_by_user_id].sort().join('_');
          const conversationId = `msr_${request.id}_${sortedUserIds}`;

          await Message.create({
            sender_id: currentUser.id,
            recipient_id: request.submitted_by_user_id,
            content: `🎉 Great news! Your managed sale request for "${request.vehicle_details.title}" has been approved by our team.\n\nYour vehicle is now live on Speedio with the following details:\n• Listed Price (Buyer Pays): $${vehicleListingPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• You Will Receive: $${ownerReceives.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• Service Fee: $${serviceFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• Status: Available for test drives\n• Managed by: Speedyo Team\n\nWe've set up test drive availability based on your access arrangements. Potential buyers can now schedule test drives, and we'll coordinate everything for you.\n\nYou can view your live listing anytime from your dashboard. We'll keep you updated on any test drive requests and buyer interest.\n\nThank you for choosing Speedyo's managed sales service! 🚗`,
            message_type: "system",
            managed_sale_request_id: request.id,
            vehicle_id: createdVehicle.id,
            conversation_id: conversationId,
            read: false
          });
        }



        toast({
          title: "Request Approved",
          description: `${createdVehicle.title} has been approved and listed. Email sent to owner.`,
          variant: "success",
        });

        await loadRequests();
        setSelectedRequest(null);
        setIsModalOpen(false);

      } catch (error) {
        console.error("Failed to approve request:", error);
        toast({
          title: "Approval Failed",
          description: "Could not approve the managed sale request: " + error.message,
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  }, [loadRequests, requests, currentUser, toast]);

  const handleMarkAsSold = async (request) => {
    if (!request.created_vehicle_id) {
      toast({
        title: "Action Failed",
        description: "This request is not linked to a live vehicle listing.",
        variant: "destructive",
      });
      return;
    }
    if (window.confirm(`Are you sure you want to mark "${request.vehicle_details.title}" as sold? This will update the request and the vehicle listing.`)) {
      setIsProcessing(true);
      try {
        await Promise.all([
          ManagedSaleRequest.update(request.id, { status: 'sold' }),
          Vehicle.update(request.created_vehicle_id, { status: 'sold' })
        ]);

        if (currentUser && currentUser.id) {
          await Notification.create({
            recipient_id: request.submitted_by_user_id,
            sender_id: currentUser.id,
            type: "managed_sale_status_update",
            content: `Congratulations! Your vehicle, "${request.vehicle_details.title}", has been sold.`,
            related_entity_type: "ManagedSaleRequest",
            related_entity_id: request.id,
            url: createPageUrl("Dashboard"),
            icon: "DollarSign"
          });
        }

        toast({
          title: "Vehicle Marked as Sold",
          description: "The request and vehicle listing have been updated.",
          variant: "success",
        });
        await loadRequests();
      } catch (error) {
        console.error("Failed to mark as sold:", error);
        toast({
          title: "Update Failed",
          description: "Could not mark the vehicle as sold. Please try again.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  };

  const handleRowClick = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowEditModal(true);
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleUpdateRequest = async (updatedFormData) => {
    if (!editingRequest) {
      toast({
        title: "Error",
        description: "No request selected for update.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Calculate prices using the same logic as the form
      const sellerPrice = parseFloat(updatedFormData.vehicle_details.seller_asking_price);
      const serviceFee = calculateServiceFeeAmount(sellerPrice);
      const calculatedBuyerPrice = sellerPrice + serviceFee; // FIXED: buyer price = asking + service fee

      // Normalize images to new format (separate arrays for each size)
      const normalizedImages = normalizeImagesToNewFormat(updatedFormData.vehicle_details.images);

      const updateData = {
        vehicle_details: {
          ...updatedFormData.vehicle_details,
          images: normalizedImages.images,
          images_thumbnails: normalizedImages.images_thumbnails,
          images_small: normalizedImages.images_small,
          images_medium: normalizedImages.images_medium
        },
        access_arrangements: updatedFormData.access_arrangements,
        final_sale_price_for_buyer: calculatedBuyerPrice, // FIXED: store buyer price
        service_fee_amount: serviceFee,
        owner_receives_amount: sellerPrice, // Owner receives their asking price
        status: editingRequest.status,
        edit_requests: editingRequest.edit_requests?.map(er => ({
          ...er,
          status: er.status === 'pending' ? 'processed_by_admin_direct_edit' : er.status,
          admin_notes: er.status === 'pending' ? 'Changes applied via direct admin edit.' : er.admin_notes,
          processed_at: er.status === 'pending' ? new Date().toISOString() : er.processed_at
        })) || []
      };

      // Only update the vehicle if it already exists
      if (editingRequest.created_vehicle_id) {
        // For vehicle, we need primary_image and its variations too
        const primaryImageIndex = 0; // Use first image as primary
        
        const vehicleUpdateData = {
          title: updatedFormData.vehicle_details.title,
          make: updatedFormData.vehicle_details.make,
          model: updatedFormData.vehicle_details.model,
          year: updatedFormData.vehicle_details.year,
          mileage: updatedFormData.vehicle_details.mileage,
          condition: updatedFormData.vehicle_details.condition,
          description: updatedFormData.vehicle_details.description,
          fuel_type: updatedFormData.vehicle_details.fuel_type,
          transmission: updatedFormData.vehicle_details.transmission,
          location: updatedFormData.vehicle_details.location,
          price: calculatedBuyerPrice, // FIXED: use buyer price (asking + service fee)
          images: normalizedImages.images,
          images_thumbnails: normalizedImages.images_thumbnails,
          images_small: normalizedImages.images_small,
          images_medium: normalizedImages.images_medium,
          primary_image: normalizedImages.images[primaryImageIndex] || null,
          primary_image_thumbnail: normalizedImages.images_thumbnails[primaryImageIndex] || null,
          primary_image_small: normalizedImages.images_small[primaryImageIndex] || null,
          primary_image_medium: normalizedImages.images_medium[primaryImageIndex] || null,
          recurring_availability: updatedFormData.access_arrangements.recurring_availability || []
        };

        await Vehicle.update(editingRequest.created_vehicle_id, vehicleUpdateData);
      }

      await ManagedSaleRequest.update(editingRequest.id, updateData);

      // If completing initial details (moving from pending_initial_review to pending_review)
      if (editingRequest.status === 'pending_initial_review' && updateData.status === 'pending_review') {
        if (currentUser?.id) {
          // Notify the user
          await Notification.create({
            recipient_id: editingRequest.submitted_by_user_id,
            sender_id: currentUser.id,
            type: "managed_sale_status_update",
            content: `✅ Great news! We've completed the details for your "${updatedFormData.vehicle_details.title}" listing. Our team is now reviewing it for final approval.`,
            related_entity_type: "ManagedSaleRequest",
            related_entity_id: editingRequest.id,
            url: createPageUrl("Dashboard"),
            icon: "CheckCircle"
          });
        }
      } else if (currentUser?.id) {
        // Regular update notification
        await Notification.create({
          recipient_id: editingRequest.submitted_by_user_id,
          sender_id: currentUser.id,
          type: "managed_sale_status_update",
          content: `Your managed sale request for "${updatedFormData.vehicle_details.title}" has been updated by our team.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: editingRequest.id,
          url: createPageUrl("Dashboard"),
          icon: "Edit"
        });
      }

      setShowEditModal(false);
      setEditingRequest(null);
      await loadRequests();

      toast({
        title: "Request Updated",
        description: "The managed sale request has been successfully updated.",
        variant: "success",
      });

    } catch (error) {
      console.error("Failed to update request:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Could not update the request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetAvailability = (request) => {
    setManagingAvailabilityRequest(request);
    setShowAvailabilityModal(true);
  };

  const handleAvailabilityUpdate = async () => {
    await loadRequests();
    setShowAvailabilityModal(false);
    setManagingAvailabilityRequest(null);
    toast({
      title: "Availability Updated",
      description: "Test drive availability has been successfully configured.",
      variant: "info",
    });
  };

  const handleOpenChecklist = async (request) => {
    try {
      const checklists = await VehicleInspectionChecklist.filter({
        managed_sale_request_id: request.id
      });

      if (checklists.length > 0) {
        setChecklistRequest(request);
        setExistingChecklist(checklists[0]);
        setShowChecklistModal(true);
      } else {
        if (window.confirm('No checklist found for this managed sale request. Would you like to go to the Checklists tab to create or link one?')) {
          setActiveTab('checklists');
          setChecklistRequest(request);
        }
      }
    } catch (error) {
      console.error('Failed to load checklist:', error);
      toast({
        title: "Error loading checklist",
        description: "Could not load existing inspection checklist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChecklistModalClose = () => {
    setShowChecklistModal(false);
    setChecklistRequest(null);
    setExistingChecklist(null);
  };

  const handleChecklistSave = async () => {
    toast({
      title: "Checklist Saved",
      description: "Vehicle inspection checklist has been saved successfully.",
      variant: "success",
    });
    setShowChecklistModal(false);
    setChecklistRequest(null);
    setExistingChecklist(null);
    await loadRequests();
    await loadChecklists();
  };

  const handleCreateNewChecklist = () => {
    setChecklistRequest(null);
    setExistingChecklist(null);
    setShowChecklistModal(true);
  };

  const handleViewChecklistFromTab = (checklist) => {
    setChecklistRequest(
      checklist.managed_sale_request_id
        ? requests.find(r => r.id === checklist.managed_sale_request_id)
        : null
    );
    setExistingChecklist(checklist);
    setShowChecklistModal(true);
  };

  const handleDeleteRequest = async (request) => {
    if (window.confirm(`Are you sure you want to permanently delete the managed sale request for "${request.vehicle_details.title}"? This action cannot be undone.`)) {
      setIsProcessing(true);
      try {
        if (request.created_vehicle_id) {
          const shouldDeleteVehicle = window.confirm(
            `This request has an associated vehicle listing. Do you also want to delete the vehicle listing from the marketplace?`
          );

          if (shouldDeleteVehicle) {
            await Vehicle.delete(request.created_vehicle_id);
          }
        }

        await ManagedSaleRequest.delete(request.id);

        if (currentUser?.id && request.submitted_by_user_id) {
          await Notification.create({
            recipient_id: request.submitted_by_user_id,
            sender_id: currentUser.id,
            type: "managed_sale_status_update",
            content: `Your managed sale request for "${request.vehicle_details.title}" has been removed by an administrator.`,
            related_entity_type: "ManagedSaleRequest",
            related_entity_id: request.id,
            url: createPageUrl("Dashboard"),
            icon: "XCircle"
          });
        }

        toast({
          title: "Request Deleted",
          description: `Managed sale request for "${request.vehicle_details.title}" has been permanently deleted.`,
          variant: "success",
        });

        await loadRequests();
        setSelectedRequest(null);
        setIsModalOpen(false);
      } catch (error) {
        console.error("Failed to delete request:", error);
        toast({
          title: "Delete Failed",
          description: "Could not delete the managed sale request. Please try again.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_initial_review: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      pending_review: { color: "bg-amber-100 text-amber-800", icon: Clock },
      approved: { color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
      declined: { color: "bg-red-100 text-red-800", icon: XCircle },
      listed: { color: "bg-blue-100 text-blue-800", icon: Car },
      sold: { color: "bg-slate-100 text-slate-800", icon: CheckCircle },
      edit_requested: { color: "bg-orange-100 text-orange-800", icon: Edit },
      cancellation_requested: { color: "bg-purple-100 text-purple-800", icon: XCircle },
      cancelled: { color: "bg-red-200 text-red-900", icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending_review;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-xs px-2 py-1`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getRequestStats = () => {
    const stats = requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    return {
      pending_initial: stats.pending_initial_review || 0,
      pending: stats.pending_review || 0,
      approved_and_listed: (stats.approved || 0) + (stats.listed || 0),
      declined: stats.declined || 0,
      sold: stats.sold || 0,
      edit_requested: stats.edit_requested || 0,
      cancellation_requested: stats.cancellation_requested || 0,
      cancelled: stats.cancelled || 0,
      total: requests.length
    };
  };

  const getActiveRequestsCount = () => {
    const activeStatuses = ['pending_initial_review', 'pending_review', 'approved', 'listed', 'edit_requested', 'cancellation_requested'];
    return requests.filter(req => activeStatuses.includes(req.status)).length;
  };

  const stats = getRequestStats();

  // Update how images are displayed in the modal - add this helper at component level
  const renderImage = (image, alt, className) => {
    const imageUrl = getImageUrl(image, 'medium');
    return imageUrl ? <img src={imageUrl} alt={alt} className={className} /> : null;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Handshake className="w-5 h-5 text-emerald-500" />
            Managed Sales Requests
            <Badge variant="outline" className="ml-2">
              {getActiveRequestsCount()} Active
            </Badge>
          </CardTitle>
          <CardContent className="p-0 pt-2 text-sm text-slate-600">
            Review and process managed sales submissions from users.
          </CardContent>
        </CardHeader>
      </Card>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Button
          variant={activeTab === 'requests' ? 'default' : 'outline'}
          onClick={() => setActiveTab('requests')}
          className="w-full sm:w-auto"
        >
          <Handshake className="w-4 h-4 mr-2 sm:inline hidden" />
          <span className="sm:hidden">Requests</span>
          <span className="hidden sm:inline">Managed Sales Requests</span>
        </Button>
        <Button
          variant={activeTab === 'checklists' ? 'default' : 'outline'}
          onClick={() => setActiveTab('checklists')}
          className="w-full sm:w-auto"
        >
          <ClipboardCheck className="w-4 h-4 mr-2 sm:inline hidden" />
          <span className="sm:hidden">Checklists</span>
          <span className="hidden sm:inline">Vehicle Inspection Checklists</span>
        </Button>
      </div>

      {activeTab === 'requests' && (
        <>
          <Collapsible open={showStats} onOpenChange={setShowStats}>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <span>Statistics Overview</span>
                      <Badge variant="outline" className="ml-2">
                        {stats.total} Total
                      </Badge>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${showStats ? 'rotate-180' : ''}`} />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3">
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending_initial}</div>
                      <div className="text-xs text-slate-600">Needs Details</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
                      <div className="text-xs text-slate-600">Pending Review</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">{stats.edit_requested}</div>
                      <div className="text-xs text-slate-600">Edit Requested</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">{stats.cancellation_requested}</div>
                      <div className="text-xs text-slate-600">Cancel Requested</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="text-2xl font-bold text-red-700">{stats.cancelled}</div>
                      <div className="text-xs text-slate-600">Cancelled</div>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                      <div className="text-2xl font-bold text-emerald-600">{stats.approved_and_listed}</div>
                      <div className="text-xs text-slate-600">Active Listings</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
                      <div className="text-xs text-slate-600">Sold</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 border border-red-300">
                      <div className="text-2xl font-bold text-red-600">{stats.declined}</div>
                      <div className="text-xs text-slate-600">Declined</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="text-2xl font-bold text-slate-600">{stats.total}</div>
                      <div className="text-xs text-slate-600">Total</div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                All Requests
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Input
                    placeholder="Search by title, make, model, owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:max-w-xs"
                  />
                  <Select
                    value={filter}
                    onValueChange={(value) => setFilter(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending_initial_review">Needs Details</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="edit_requested">Pending Edit Review</SelectItem>
                      <SelectItem value="cancellation_requested">Pending Cancellation</SelectItem>
                      <SelectItem value="approved_and_listed">Approved & Listed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Image</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Price (Seller/Buyer)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                          <p className="text-slate-500 mt-2">Loading requests...</p>
                        </TableCell>
                      </TableRow>
                    ) : filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                          No requests found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                              {request.vehicle_details?.images_thumbnails?.[0] ? (
                                <img 
                                  src={request.vehicle_details.images_thumbnails[0]} 
                                  alt={request.vehicle_details.title || 'Vehicle'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900">
                            {request.vehicle_details?.title || 'N/A'}
                            <div className="text-xs text-slate-500">
                              {request.created_vehicle_id ? `ID: ${request.created_vehicle_id}` : 'No vehicle created yet'}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {getUserName(request.submitted_by_user_id)}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(request.created_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(() => {
                              const prices = calculatePrices(request);
                              return (
                                <>
                                  <div className="text-slate-700">
                                    Seller Receives: ${prices.sellerReceives?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A'}
                                  </div>
                                  <div className="font-semibold text-blue-700">
                                    Buyer Pays: ${prices.buyerPrice?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A'}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Service Fee: ${prices.serviceFee?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A'}
                                  </div>
                                </>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleRowClick(request)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {request.status === 'pending_initial_review' && (
                                  <DropdownMenuItem onClick={() => handleEditRequest(request)}>
                                    <Edit className="w-4 h-4 mr-2 text-blue-500" />
                                    Complete Details
                                  </DropdownMenuItem>
                                )}
                                {request.status === 'pending_review' && (
                                  <DropdownMenuItem onClick={() => handleApproveRequest(request.id)}>
                                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                    Approve Request
                                  </DropdownMenuItem>
                                )}
                                {(request.status === 'approved' || request.status === 'listed') && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsSold(request)}>
                                      <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                      Mark as Sold
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSetAvailability(request)}>
                                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                      Set Availability
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenChecklist(request)}>
                                      <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                                      Inspection Checklist
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleEditRequest(request)}>
                                  <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                  Admin Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => handleDeleteRequest(request)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Request
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden p-4 space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                    <p className="text-slate-500 mt-2">Loading requests...</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    No requests found matching your criteria.
                  </div>
                ) : (
                  filteredRequests.map((request) => {
                    const prices = calculatePrices(request);
                    return (
                      <Card key={request.id} className="bg-white shadow-md">
                        <CardContent className="p-4">
                          <div className="flex gap-3 mb-3">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                              {request.vehicle_details?.images_thumbnails?.[0] ? (
                                <img 
                                  src={request.vehicle_details.images_thumbnails[0]} 
                                  alt={request.vehicle_details.title || 'Vehicle'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">{request.vehicle_details?.title || 'N/A'}</h3>
                              <p className="text-xs text-slate-500 mb-1">
                                {getUserName(request.submitted_by_user_id)}
                              </p>
                              {getStatusBadge(request.status)}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm border-t pt-3">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Submitted:</span>
                              <span className="font-medium">{format(new Date(request.created_date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Seller Receives:</span>
                              <span className="font-medium text-slate-700">${prices.sellerReceives?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-600">Buyer Pays:</span>
                              <span className="font-semibold text-blue-700">${prices.buyerPrice?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleRowClick(request)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {request.status === 'pending_initial_review' && (
                              <Button 
                                size="sm" 
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                                onClick={() => handleEditRequest(request)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                            )}
                            {request.status === 'pending_review' && (
                              <Button 
                                size="sm" 
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApproveRequest(request.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                                {(request.status === 'approved' || request.status === 'listed') && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleMarkAsSold(request)}>
                                      <DollarSign className="w-4 h-4 mr-2 text-emerald-500" />
                                      Mark as Sold
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSetAvailability(request)}>
                                      <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                      Set Availability
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleOpenChecklist(request)}>
                                      <ClipboardCheck className="w-4 h-4 mr-2 text-blue-500" />
                                      Inspection Checklist
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleEditRequest(request)}>
                                  <Edit className="w-4 h-4 mr-2 text-slate-500" />
                                  Admin Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-500"
                                  onClick={() => handleDeleteRequest(request)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Request
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'checklists' && (
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">
              Vehicle Inspection Checklists
            </CardTitle>
            <Button onClick={handleCreateNewChecklist}>
              Create New Checklist
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingChecklists ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-500" />
                <p className="text-slate-500 mt-2">Loading checklists...</p>
              </div>
            ) : checklistsList.length === 0 ? (
              <p className="text-center py-8 text-slate-500">
                No vehicle inspection checklists found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Checklist Name</TableHead>
                    <TableHead>Linked MSR</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklistsList.map((checklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell className="font-medium">
                        {checklist.title || `Checklist ${checklist.id.substring(0, 8)}`}
                      </TableCell>
                      <TableCell>
                        {checklist.managed_sale_request_id ?
                          requests.find(r => r.id === checklist.managed_sale_request_id)?.vehicle_details?.title || `MSR ID: ${checklist.managed_sale_request_id.substring(0, 8)}`
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(checklist.updated_date || checklist.created_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewChecklistFromTab(checklist)}>
                          <Eye className="w-4 h-4 mr-2" /> View/Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}


      {selectedRequest && (
        <ManagedSaleDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
            setAdminNotes("");
          }}
          request={selectedRequest}
          users={users}
          currentUser={currentUser}
          onStatusChange={handleStatusChange}
          onApproveEditRequest={handleApproveEditRequest}
          onDeclineEditRequest={handleDeclineEditRequest}
          onApproveCancellation={handleApproveCancellation}
          onDeclineCancellation={handleDeclineCancellation}
          onMarkAsSold={handleMarkAsSold}
          onEdit={handleEditRequest}
          isLoading={isProcessing}
          adminNotes={adminNotes}
          setAdminNotes={setAdminNotes}
          loadRequests={loadRequests}
        />
      )}

      {showEditModal && editingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-slate-800">Edit Managed Sale Request</h2>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowEditModal(false);
                setEditingRequest(null);
              }}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
              <div className="p-6">
                <RequestForm
                  requestToEdit={editingRequest}
                  onClose={() => {
                    setShowEditModal(false);
                    setEditingRequest(null);
                  }}
                  onSuccess={handleUpdateRequest}
                  onUpdateRequest={handleUpdateRequest}
                  isSubmittingEdit={true}
                  isAdminEdit={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showAvailabilityModal && managingAvailabilityRequest && (
        <AdminAvailabilityManager
          isOpen={showAvailabilityModal}
          onClose={() => {
            setShowAvailabilityModal(false);
            setManagingAvailabilityRequest(null);
          }}
          vehicle={managingAvailabilityRequest.created_vehicle_id ? {
            id: managingAvailabilityRequest.created_vehicle_id,
            title: managingAvailabilityRequest.vehicle_details.title,
            recurring_availability: managingAvailabilityRequest.access_arrangements?.recurring_availability || []
          } : null}
          managedSaleRequest={managingAvailabilityRequest}
          onUpdate={handleAvailabilityUpdate}
        />
      )}

      {showChecklistModal && (
        <VehicleInspectionChecklistModal
          isOpen={showChecklistModal}
          onClose={handleChecklistModalClose}
          managedSaleRequest={checklistRequest}
          existingChecklist={existingChecklist}
          onSave={handleChecklistSave}
        />
      )}
    </div>
  );
}

"use client"
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Heart, MessageCircle, Calendar, Eye, Car, TrendingUp, Handshake,
  Check, Clock, CheckCircle, XCircle, ExternalLink, Edit, Trash2,
  Info, Plus, FileText, X,
  AlertTriangle,
  Shield,
  MoreHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";
import ManagedSalesRequestForm from "../manageSales/RequestForm";
import ManagedSaleDetailsModal from "./ManagedSaleDetailsModal";
import GuestTestDriveDetailsModal from "./GuestTestDriveDetailsModal";
import ManagedSalesActions from "./ManagedSalesActions";
import TransferProgressTracker from "./TransferProgressTracker";
import { useToast } from "@/components/ui/UseToast";
import { useGuestDashboardStore } from "@/store/dashboard";
import { useSellerDashboardStore } from "@/store/dashboard";
import { managedSaleService, messageService, publicUserService, vehicleService } from "@/services/dashboard";
import axios from "@/lib/axios";
import CreateVehicleModalUI from "./CreateVehicleModalUI";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/DropdownMenu";
import TestDriveAvailabilityManager from "./TestDriveAvailabilityManager";

export default function GuestDashboard({ user }: { user: any }) {
  const router = useRouter();
  const {
    conversations, transfers, managedSales, sellers, recentlyViewed, isLoading,
    loadGuestDashboard, directListings,
  } = useGuestDashboardStore() as any;
  const {
  listings,  loadSellerDashboard
} = useSellerDashboardStore();

  const messagesWithContext = conversations?.flatMap((c: any) =>
    (c.messages || []).map((m: any) => {
      let testDriveDetails = m.test_drive_details;
      if (!testDriveDetails && m.content && m.message_type === 'test_drive_request') {
        try {
          const parsed = JSON.parse(m.content);
          if (parsed.vehicle_title || parsed.requested_date) {
            testDriveDetails = {
              status: parsed.status || 'pending_review',
              preferred_date: parsed.requested_date,
              preferred_time: parsed.requested_time,
              location: parsed.location,
              vehicle_title: parsed.vehicle_title,
              additional_notes: parsed.additional_notes,
            };
          }
        } catch {
          // Not JSON, ignore
        }
      }
      return {
        ...m,
        _conversation: c,
        _sender: c.other_user,
        _parsedTestDriveDetails: testDriveDetails,
      };
    })
  ) || [];
  const sentTestDrives = messagesWithContext.filter((m: any) =>
    m?.message_type === 'test_drive_request' ||
    m?._parsedTestDriveDetails ||
    m?.test_drive_details ||
    m?.message_type?.includes('test_drive')
  );

  const messages = messagesWithContext;

  const [viewingTestDrive, setViewingTestDrive] = useState<any>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [showRequestDetailsModal, setShowRequestDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [vehiclePerformance, setVehiclePerformance] = useState<Record<string, any>>({});

const [isSubmitting, setIsSubmitting] = useState(false);
 const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [availabilityVehicle, setAvailabilityVehicle] = useState<any | null>(
    null,
  );

  useEffect(() => {
  loadGuestDashboard();
    loadSellerDashboard();
  }, [])
  

  // Combine transfers
  const vehicleTransfers = transfers || [];

  const { toast } = useToast();

  // Helper to create notifications via API
  const createNotification = async (data: {
    recipient_id: string;
    sender_id?: string;
    type: string;
    content: string;
    related_entity_type?: string;
    related_entity_id?: string;
    url?: string;
    icon?: string;
  }) => {
    try {
      await axios.post("/api/notifications", data);
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  };

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    await loadGuestDashboard(user.id);
  }, [user, loadGuestDashboard]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getVehicleById = (vehicleId: string) => {
    return conversations.find((c: any) => c.vehicle?.id === vehicleId)?.vehicle ?? null;
  };

  const getSellerByEmail = (email: string) => {
    return sellers.find((s: any) => s.email === email);
  };

  const handleEditRequest = (request: any) => {
    setEditingRequest(request);
    setShowNewRequestModal(true);
    setShowRequestDetailsModal(false);
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setShowRequestDetailsModal(true);
  };

  const getChanges = (original: any, updated: any) => {
      const changes: Record<string, any> = {};
      const allKeys = new Set([...Object.keys(original || {}), ...Object.keys(updated || {})]);
      for (const key of allKeys) {
        if (JSON.stringify(original?.[key]) !== JSON.stringify(updated?.[key])) {
          changes[key] = updated?.[key];
        }
      }
      return changes;
  };

  const handleUserUpdateRequest = async (updatedFormData: any, originalRequest: any) => {
    if (!originalRequest || !originalRequest.id) return;

    const vehicleChanges = getChanges(originalRequest.vehicle_details || {}, updatedFormData.vehicle_details || {});
    const accessChanges = getChanges(originalRequest.access_arrangements || {}, updatedFormData.access_arrangements || {});

    const requested_changes: Record<string, any> = { vehicle_details: vehicleChanges, access_arrangements: accessChanges };

    // Clean up empty change objects
    if (Object.keys(requested_changes.vehicle_details || {}).length === 0) delete requested_changes.vehicle_details;
    if (Object.keys(requested_changes.access_arrangements || {}).length === 0) delete requested_changes.access_arrangements;

    if (Object.keys(requested_changes).length === 0) {
      toast({
        title: "No Changes Detected",
        description: "You haven't made any changes to the request.",
        variant: "info",
      });
      setShowNewRequestModal(false);
      setEditingRequest(null);
      return;
    }
    
    // Recalculate buyer price if seller asking price changed, to show in the request
    if (requested_changes.vehicle_details && requested_changes.vehicle_details.seller_asking_price !== undefined) {
        const newSellerPrice = requested_changes.vehicle_details.seller_asking_price;
        const serviceFee = Math.round(newSellerPrice * 0.06);
        // Add these calculated values to the requested_changes if they differ from original
        if (originalRequest.calculated_buyer_price !== (newSellerPrice + serviceFee)) {
          requested_changes.calculated_buyer_price = newSellerPrice + serviceFee;
        }
        if (originalRequest.service_fee_amount !== serviceFee) {
          requested_changes.service_fee_amount = serviceFee;
        }
    }

    try {
      const existingEdits = originalRequest.edit_requests || [];
      const newEditRequestPayload = {
        requested_at: new Date().toISOString(),
        requested_changes: requested_changes, // Use the cleaned up requested_changes
        status: 'pending' // Status of this specific edit request (within the array)
      };

      await managedSaleService.update(originalRequest.id, {
        status: 'edit_requested', // Overall status of the request
        edit_requests: [...existingEdits, newEditRequestPayload]
      });

      const admins = await publicUserService.list();
      
      if (admins && admins.length > 0) {
        const notificationPromises = admins.map((admin: any) =>
          createNotification({
            recipient_id: admin.user_id as string,
            sender_id: user.id,
            type: "managed_sale_edit_request",
            content: `${user.full_name} submitted an edit request for managed sale: "${originalRequest.vehicle_details.title}" (${originalRequest.vehicle_details.year} ${originalRequest.vehicle_details.make} ${originalRequest.vehicle_details.model}).`,
            related_entity_type: "ManagedSaleRequest",
            related_entity_id: originalRequest.id,
            url: "/Admin-Panel",
            icon: "Edit"
          })
        );
      }

      toast({
        title: "Edit Request Submitted",
        description: "Your changes have been sent to our team for review. You'll be notified upon approval.",
        variant: "success",
      });

      setShowNewRequestModal(false);
      setEditingRequest(null);
      await loadDashboardData(); // Refresh data to reflect changes
    } catch (error) {
      console.error("Failed to submit edit request:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your edit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async (requestToCancel: any) => {
    if (!requestToCancel || !requestToCancel.id) {
      toast({
        title: "Invalid Request",
        description: "Invalid request data. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to request cancellation? This action cannot be undone.")) {
      try {
        // Update the ManagedSaleRequest status to cancellation_requested (admin will approve)
        await managedSaleService.update(requestToCancel.id, {
          status: 'cancellation_requested',
          cancellation_reason: 'Cancellation requested by user'
        });

        // If the request was listed, also cancel the corresponding vehicle listing
        if (requestToCancel.status === 'listed' && requestToCancel.created_vehicle_id) {
          await axios.patch(`/api/vehicles/${requestToCancel.created_vehicle_id}`, { status: 'cancelled' });
        }

        // Notify admins about the cancellation
        const admins = await publicUserService.list();

        if (admins && admins.length > 0) {
          const notificationPromises = admins.map((admin: any) =>
            createNotification({
              recipient_id: admin.user_id,
              sender_id: user.id,
              type: "managed_sale_cancellation",
              content: `${user.full_name} cancelled their managed sale request for "${requestToCancel.vehicle_details?.title || requestToCancel.vehicle_title}" (${requestToCancel.vehicle_details?.year || requestToCancel.vehicle_year} ${requestToCancel.vehicle_details?.make || requestToCancel.vehicle_make} ${requestToCancel.vehicle_details?.model || requestToCancel.vehicle_model})`,
              related_entity_type: "ManagedSaleRequest",
              related_entity_id: requestToCancel.id,
              url: "/Admin-Panel",
              icon: "AlertCircle"
            })
          );
          await Promise.all(notificationPromises);
        }

        // Refresh UI
        await loadDashboardData();
        if (selectedRequest && selectedRequest.id === requestToCancel.id) {
          setShowRequestDetailsModal(false);
          setSelectedRequest(null);
        }

        toast({
          title: "Request Cancelled",
          description: "Your managed sale request has been successfully cancelled.",
          variant: "success",
        });

      } catch (error) {
        console.error("Failed to cancel request:", error);
        toast({
          title: "Cancellation Failed",
          description: "There was an error cancelling the request. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancelTestDriveRequest = async (messageId: string) => {
    if (window.confirm("Are you sure you want to cancel this car viewing request?")) {
        try {
            const messageToUpdate = sentTestDrives.find((msg: any) => msg.id === messageId);
            if (messageToUpdate && messageToUpdate.test_drive_details) {
                const updatedDetails = { ...messageToUpdate.test_drive_details, status: 'cancelled' };
                await axios.patch(`/api/user/messages/${messageId}`, { test_drive_details: updatedDetails });

                await axios.post("/api/user/messages", {
                    recipientId: messageToUpdate.recipient_id || messageToUpdate.recipientId,
                    content: `The car viewing request for ${format(new Date(updatedDetails.preferred_date || Date.now()), 'MMM d, yyyy')} has been cancelled by the buyer.`,
                    message_type: 'confirmation_car_viewing',
                    vehicleId: messageToUpdate.vehicle_id || messageToUpdate.vehicleId,
                });

                // ADMIN NOTIFICATION: Notify all admins about test drive cancellation
                const admins = await publicUserService.list();

                if (admins && admins.length > 0) {
                  const vehicle = getVehicleById(messageToUpdate.vehicle_id || messageToUpdate.vehicleId);
                  const notificationPromises = admins.map((admin: any) =>
                    createNotification({
                      recipient_id: admin.user_id as string, // Use user_id from PublicUser
                      sender_id: user.id,
                      type: "test_drive_cancellation",
                      content: `${user.full_name} cancelled their car viewing request for "${vehicle?.title}" scheduled for ${format(new Date(updatedDetails.preferred_date || Date.now()), 'MMM d, yyyy')}`,
                      related_entity_type: "Message",
                      related_entity_id: messageId,
                      url: "/Admin-Panel",
                      icon: "CalendarX"
                    })
                  );
                  await Promise.all(notificationPromises);
                }
                
                await loadDashboardData(); // Refresh data
                setViewingTestDrive(null); // Close modal
            }
        } catch (error) {
            console.error("Failed to cancel test drive", error);
            alert("Could not cancel the request. Please try again.");
        }
    }
  };

  const handleFormSuccess = () => {
    setShowNewRequestModal(false);
    setEditingRequest(null);
    loadDashboardData();
  };

  const handleSaveRequest = async (payload: any) => {
    if (editingRequest) {
      await handleUserUpdateRequest(payload, editingRequest);
    } else {
      await managedSaleService.create(payload);
      handleFormSuccess();
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }: {
    icon: React.FC<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm font-semibold text-slate-600">{title}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending_review':
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          badgeClass: "bg-amber-100 text-amber-800",
          text: "Pending Review",
          description: "Our team is reviewing your submission. We'll get back to you within 2 business days.",
          tooltip: "Your request is waiting for review by the Speedio team. No action is needed from you right now."
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-blue-100 text-blue-800",
          text: "Approved",
          description: "Your request is approved! We're preparing your listing to go live.",
          tooltip: "Your request was approved! We are now creating the vehicle listing. It should be live shortly."
        };
      case 'listed':
        return {
          icon: <ExternalLink className="w-3 h-3 mr-1" />,
          badgeClass: "bg-green-100 text-green-800",
          text: "Listed",
          description: "Your vehicle is now live on the marketplace and visible to thousands of buyers.",
          tooltip: "Your vehicle is live on the marketplace! You can view the listing using the button below."
        };
      case 'declined':
        return {
          icon: <XCircle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-red-100 text-red-800",
          text: "Declined",
          description: "Unfortunately, we couldn't approve this request. See notes for details.",
          tooltip: "This request was declined. Please check the 'Update from Speedio' note for more information from our team."
        };
      case 'sold':
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-emerald-100 text-emerald-800",
          text: "Sold",
          description: "Congratulations! Your vehicle has been sold through our managed service.",
          tooltip: "Congratulations, your vehicle has been sold!"
        };
      case 'cancelled':
        return {
          icon: <Trash2 className="w-3 h-3 mr-1" />,
          badgeClass: "bg-slate-100 text-slate-800",
          text: "Cancelled",
          description: "You have cancelled this managed sale request.",
          tooltip: "This request was cancelled and is no longer active."
        };
      case 'edit_requested': // New status for edit requests
        return {
          icon: <Edit className="w-3 h-3 mr-1" />,
          badgeClass: "bg-purple-100 text-purple-800",
          text: "Edit Requested",
          description: "Your requested changes are under review by our team. We'll update you soon.",
          tooltip: "We've received your edit request and our team is reviewing the changes."
        };
      case 'cancellation_requested':
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          badgeClass: "bg-orange-100 text-orange-800",
          text: "Cancellation Pending",
          description: "Your cancellation request is under review by our team.",
          tooltip: "Your cancellation request is being processed."
        };
      case 'pending_approval':
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          badgeClass: "bg-yellow-100 text-yellow-800",
          text: "Pending Approval",
          description: "Your request is waiting for admin review.",
          tooltip: "Your request is pending approval from our team."
        };
      case 'pending_initial_review':
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          badgeClass: "bg-yellow-100 text-yellow-800",
          text: "Needs More Details",
          description: "Please complete your request details to proceed.",
          tooltip: "Please fill in the required vehicle information to complete your submission."
        };
      default:
        return {
          icon: null,
          badgeClass: "bg-slate-100",
          text: status,
          description: "",
          tooltip: `Status: ${status}`
        };
    }
  };

  const getTestDriveStatusInfo = (testDriveDetails: any) => {
    // Make sure we're reading the status from the most current data
    const status = testDriveDetails?.status || 'pending_review';
    
    switch (status) {
      case 'pending_review': 
        return { 
          icon: <Clock className="w-4 h-4 mr-2 text-amber-600" />, 
          text: "Pending Approval" 
        };
      case 'approved': 
        return { 
          icon: <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />, 
          text: "Approved" 
        };
      case 'declined': 
        return { 
          icon: <XCircle className="w-4 h-4 mr-2 text-red-600" />, 
          text: "Declined" 
        };
      case 'cancelled': 
        return { 
          icon: <Info className="w-4 h-4 mr-2 text-slate-600" />, 
          text: "Cancelled" 
        };
      case 'completed': 
        return { 
          icon: <CheckCircle className="w-4 h-4 mr-2 text-blue-600" />, 
          text: "Completed" 
        };
      default: 
        return { 
          icon: <Clock className="w-4 h-4 mr-2 text-amber-600" />, 
          text: "Pending" 
        };
    }
  };

  const getVerificationStatusAlert = () => {
    if (!user || !user.dealership_verification_status || user.dealership_verification_status === 'not_submitted') {
      return null;
    }

    if (user.dealership_verification_status === 'pending_review') {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="flex items-center gap-3 text-amber-800">
            <Clock className="w-5 h-5" />
            <span>
              <strong>Application Under Review:</strong> Your dealership registration is being reviewed by our team. We'll notify you of the status within 2-3 business days.
            </span>
          </AlertDescription>
        </Alert>
      );
    }

    if (user.dealership_verification_status === 'declined') {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5" />
              <span>
                <strong>Application Declined:</strong> {user.admin_verification_notes || "Please review your information and try again."}
              </span>
            </div>
           <Link href="/DealershipRegistration">
              <Button variant="destructive" size="sm">Resubmit Application</Button>
            </Link>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

const handleCreateVehicle = async (vehicleData: any) => {
  setIsSubmitting(true);
  try {
    const payload = {
      contact_full_name: user?.full_name || "",
      contact_email: user?.email || "",
      contact_phone: user?.phone || "",
      vehicle_title: vehicleData.title || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`,
      vehicle_make: vehicleData.make,
      vehicle_model: vehicleData.model,
      vehicle_year: vehicleData.year,
      vehicle_mileage: vehicleData.mileage || 0,
      vehicle_condition: vehicleData.condition || "good",
      vehicle_description: vehicleData.description || "",
      vehicle_fuel_type: vehicleData.fuel_type || "gasoline",
      vehicle_transmission: vehicleData.transmission || "automatic",
      vehicle_location: vehicleData.location,
      seller_asking_price: vehicleData.price,
      listing_type: "direct",
      status: "pending_approval",
      service_fee_amount: 0,
      owner_receives_amount: vehicleData.price,
      final_sale_price_for_buyer: vehicleData.price,
      terms_agreed: true,
    };

    await managedSaleService.create(payload);

    setShowCreateModal(false);
    setEditingVehicle(null);
    loadSellerDashboard(); 
    toast({
      title: "Direct Listing Submitted",
      description: "Your vehicle will be listed after admin approval.",
      variant: "success",
    });
  } catch (error) {
    console.error("Failed to create listing:", error);
    toast({
      title: "Creation Failed",
      description: "Could not submit your listing. Please try again.",
      variant: "destructive",
    });
    throw error;
  } finally {
    setIsSubmitting(false);
  }
};


const handleUpdateVehicle = async (vehicleData: any) => {
  if (!editingVehicle) return;
  try {
    await Vehicle.update(editingVehicle.id, vehicleData);
    setEditingVehicle(null);
    setShowCreateModal(false);
    loadSellerDashboard();
    toast({
      title: "Vehicle Updated",
      description: "Your vehicle listing has been successfully updated.",
      variant: "success",
    });
  } catch (error) {
    console.error("Failed to update vehicle:", error);
    toast({
      title: "Update Failed",
      description: "Could not update the vehicle listing. Please try again.",
      variant: "destructive",
    });
  }
};

  
  const handleSaveVehicleAvailability = async (vehicleId: string, availabilityData: any) => {
  try {
    await Vehicle.update(vehicleId, availabilityData);
    await loadSellerDashboard();
    setAvailabilityVehicle(null);
    toast({ title: "Availability Saved", description: "Your vehicle's car viewing availability has been updated.", variant: "success" });
  } catch (error) {
    console.error("Failed to save car viewing availability:", error);
    toast({ title: "Save Failed", description: "Failed to save availability. Please try again.", variant: "destructive" });
  }
};


  

  const currentPublicUser = sellers.find((s: any) => s.id === user?.id);


  console.log("direct listing",listings );

  // Real API implementations
const Vehicle = {
  create: async (data: any) => {
    const res = await axios.post("/api/vehicles/create", data);
    return res.data.vehicle;
  },
  update: async (id: string, data: any) => {
    const res = await axios.patch(`/api/vehicles/${id}`, data);
    return res.data.vehicle;
  },
  delete: async (id: string) => {
    await axios.delete(`/api/vehicles/${id}`);
  },
};


  const [isUpdating, setIsUpdating] = useState<string | null>(null);

const handleEditVehicle = useCallback((vehicle: any) => {
    setEditingVehicle(vehicle);
    setShowCreateModal(true);
  }, []);

  
  const handleDeleteVehicle = useCallback(async (vehicleId: string) => {
  if (confirm("Are you sure you want to delete this listing?")) {
    try {
      await Vehicle.delete(vehicleId);
      toast({ title: "Listing Deleted", description: "The vehicle listing has been permanently removed.", variant: "success" });
      loadSellerDashboard();
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
      toast({ title: "Deletion Failed", description: "Could not delete the listing. Please try again.", variant: "destructive" });
    }
  }
}, [loadSellerDashboard, toast]);

const handleMarkAsSold = useCallback(async (vehicleId: string) => {
  if (window.confirm("Are you sure you want to mark this vehicle as sold? This will remove it from active listings.")) {
    setIsUpdating(vehicleId);
    try {
      await Vehicle.update(vehicleId, { status: "sold" });
      toast({ title: "Vehicle Marked as Sold", description: "The listing has been updated and removed from the marketplace.", variant: "success" });
      await loadSellerDashboard();
    } catch (error) {
      console.error("Failed to mark vehicle as sold:", error);
      toast({ title: "Update Failed", description: "Could not mark the vehicle as sold. Please try again.", variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  }
}, [loadSellerDashboard, toast]);

const handleMarkAsUnavailable = useCallback(async (vehicleId: string) => {
  if (window.confirm("Mark this vehicle as temporarily unavailable? You can make it available again anytime.")) {
    setIsUpdating(vehicleId);
    try {
      await Vehicle.update(vehicleId, { status: "unavailable" });
      toast({ title: "Vehicle Marked as Unavailable", variant: "success" });
      await loadSellerDashboard();
    } catch (error) {
      console.error("Failed to mark vehicle as unavailable:", error);
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsUpdating(null);
    }
  }
}, [loadSellerDashboard, toast]);

const handleMarkAsAvailable = useCallback(async (vehicleId: string) => {
  setIsUpdating(vehicleId);
  try {
    await Vehicle.update(vehicleId, { status: "available" });
    toast({ title: "Vehicle Marked as Available", variant: "success" });
    await loadSellerDashboard();
  } catch (error) {
    console.error("Failed to mark vehicle as available:", error);
    toast({ title: "Update Failed", variant: "destructive" });
  } finally {
    setIsUpdating(null);
  }
}, [loadSellerDashboard, toast]);


  return (
    <div className="space-y-6 py-4">
      {getVerificationStatusAlert()}

      {/* Content Width Wrapper - Now includes header */}
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Guest Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Welcome back, {user?.full_name || currentPublicUser?.full_name || 'Guest'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="capitalize text-lg px-4 py-2">
              {currentPublicUser?.user_type || 'guest'}
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Heart}
            title="Saved Vehicles"
            value="0"
            subtitle="Coming soon"
            color="red"
          />
          <StatCard
            icon={MessageCircle}
            title="Active Conversations"
            value={conversations.length}
            subtitle="With sellers"
            color="emerald"
          />
          <StatCard
            icon={Calendar}
            title="Car Viewing"
            value={sentTestDrives.length}
            subtitle="Requested"
            color="purple"
          />
          <StatCard
            icon={Eye}
            title="Recently Viewed"
            value={recentlyViewed.length}
            subtitle="This week"
            color="blue"
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="flex w-full flex-grow flex-1 overflow-x-auto scrollbar-hide md:grid md:grid-cols-5 h-auto !justify-between p-0">
                <TabsTrigger
                          value="listings"
                          className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
                        >
                          Your Listings ({listings.length})
                        </TabsTrigger>
            <TabsTrigger 
              value="dashboard"
              className="flex-1 px-4 py-2 text-sm md:w-full md:justify-center rounded-none first:rounded-l-md last:rounded-r-md"
            >Dashboard</TabsTrigger>
            <TabsTrigger 
              value="transfers"
              className="flex-1 px-4 py-2 text-sm md:w-full md:justify-center rounded-none"
            >Transfers ({vehicleTransfers.length})</TabsTrigger>
            <TabsTrigger 
              value="managed_sales"
              className="flex-1 px-4 py-2 text-sm md:w-full md:justify-center rounded-none"
            >Managed Sales</TabsTrigger>
            <TabsTrigger 
              value="browse"
              className="flex-1 px-4 py-2 text-sm md:w-full md:justify-center rounded-none first:rounded-l-md last:rounded-r-md"
            >Browse</TabsTrigger>
          </TabsList>


           <TabsContent value="listings" className="mt-6">
                      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Car className="w-5 h-5 text-blue-500" />
                            Your Vehicle Listings
                          </CardTitle>
                          <Button
                            onClick={() => {
                              setEditingVehicle(null);
                              setShowCreateModal(true);
                            }}
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                            disabled={isSubmitting}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            {isSubmitting ? "Adding..." : "Add Vehicle"}
                          </Button>
                        </CardHeader>
                        <CardContent>
                         

          
                          {listings.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                              <Car className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                              <p>No vehicles listed yet</p>
                              <p className="text-sm">
                                Create your first listing to get started
                              </p>
                            
                                <Button
                                  onClick={() =>{ 
                                 setEditingVehicle(null)
                              setShowCreateModal(true)}}
                                  className="mt-3"
                                  disabled={isSubmitting}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  {isSubmitting
                                    ? "Creating..."
                                    : "Create Your First Listing"}
                                </Button>
                          
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {listings.map((vehicle) => (
                                <div
                                  key={vehicle.id}
                                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                    <div className="w-full md:w-32 h-32 md:h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                      {vehicle.primary_image ? (
                                        <img
                                          src={vehicle.primary_image}
                                          alt={vehicle.title || "Vehicle"}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center h-full">
                                          <Car className="w-10 h-10 text-slate-400" />
                                        </div>
                                      )}
                                    </div>
          
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-800 leading-tight">
                                          {vehicle.title}
                                        </h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {vehicle.verified && (
                                            <TooltipProvider>
                                              <Tooltip>
                                                <TooltipTrigger>
                                                  <Shield className="w-4 h-4 text-blue-500" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Verified Listing</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </TooltipProvider>
                                          )}
                                          {vehicle.website_managed && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs bg-slate-100 text-slate-700 border-slate-300 whitespace-nowrap"
                                            >
                                              {" "}
                                              {/* FIX: Changed badge color */}
                                              Managed by Speedio
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                        <span className="font-bold text-blue-600">
                                          ¥{vehicle.price?.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Eye className="w-4 h-4" />
                                          {vehicle.views || 0} views
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className={`capitalize text-xs ${
                                            vehicle.status === "sold"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                              : vehicle.status === "unavailable"
                                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                                : ""
                                          }`}
                                        >
                                          {vehicle.status}
                                        </Badge>
                                      </div>
                                    </div>
          
                                    <div className="flex flex-shrink-0 flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                                      <Link
                                        href={`/vehicle?id=${vehicle.id}`}
                                        className="w-full sm:w-auto"
                                      >
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full justify-center"
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View
                                        </Button>
                                      </Link>
          
                                      {vehicle.website_managed ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full sm:w-auto justify-center"
                                          onClick={() =>
                                            setShowVehicleEditRequestModal(vehicle)
                                          }
                                        >
                                          <Edit className="w-4 h-4 mr-2" />
                                          Request Edit
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full sm:w-auto justify-center"
                                          onClick={() => setAvailabilityVehicle(vehicle)}
                                        >
                                          <Calendar className="w-4 h-4 mr-2" />
                                          Availability
                                        </Button>
                                      )}
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button size="icon" variant="ghost">
                                            <MoreHorizontal className="w-4 h-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          {!vehicle.website_managed && (
                                            <DropdownMenuItem
                                              onClick={() => handleEditVehicle(vehicle)}
                                            >
                                              <Edit className="mr-2 h-4 w-4" />
                                              Edit Listing
                                            </DropdownMenuItem>
                                          )}
                                          {vehicle.status === "unavailable" ? (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleMarkAsAvailable(vehicle.id)
                                              }
                                              disabled={isUpdating === vehicle.id}
                                            >
                                              <CheckCircle className="mr-2 h-4 w-4" />
                                              {isUpdating === vehicle.id
                                                ? "Updating..."
                                                : "Mark as Available"}
                                            </DropdownMenuItem>
                                          ) : (
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleMarkAsUnavailable(vehicle.id)
                                              }
                                              disabled={
                                                isUpdating === vehicle.id ||
                                                vehicle.status === "sold" ||
                                                vehicle.status === "edit_requested"
                                              }
                                            >
                                              <XCircle className="mr-2 h-4 w-4" />
                                              {isUpdating === vehicle.id
                                                ? "Updating..."
                                                : "Mark as Unavailable"}
                                            </DropdownMenuItem>
                                          )}
                                          <DropdownMenuItem
                                            onClick={() => handleMarkAsSold(vehicle.id)}
                                            disabled={
                                              isUpdating === vehicle.id ||
                                              vehicle.status === "sold"
                                            }
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {isUpdating === vehicle.id
                                              ? "Updating..."
                                              : "Mark as Sold"}
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-red-600"
                                            onClick={() =>
                                              handleDeleteVehicle(vehicle.id)
                                            }
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Listing
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

          <TabsContent value="dashboard" className="mt-6 space-y-6">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Test Drive Requests */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    My Car Viewing Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sentTestDrives.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>You haven't requested any car viewing yet.</p>
                      <p className="text-sm">Browse the marketplace to find your next car.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sentTestDrives.slice(0, 4).map((request: any) => {
                        const vehicle = getVehicleById(request.vehicle_id);
                        // FIX: Make sure we're reading the current test drive status
                        const statusInfo = getTestDriveStatusInfo(request.test_drive_details);
                        if (!vehicle) return null;
                        return (
                          <div 
                            key={request.id} 
                            className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" 
                            onClick={() => setViewingTestDrive(request)}
                          >
                            <div className="w-16 h-12 bg-slate-200 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                              {vehicle.primary_image ? (
                                <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                              ) : (
                                <Car className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">{vehicle.title}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                {statusInfo.icon}
                                <span>{statusInfo.text}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">View</Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Messages */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                    Recent Messages
                  </CardTitle>
            <Link href="/Messages">
                    <Button
                
                    variant="outline" size="sm">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {messages.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start browsing vehicles to connect with sellers</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.slice(0, 3).map((message: any) => {
                        const sender = message._sender;
                        // Parse message content - it might be JSON stringified
                        let displayContent = message.content;
                        try {
                          const parsed = JSON.parse(message.content);
                          if (parsed.vehicle_title) {
                            displayContent = `Car Viewing request for ${parsed.vehicle_title}`;
                          }
                        } catch {
                          // Not JSON, use as-is
                        }
                        return (
                          <div key={message.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                            <Avatar className="w-8 h-8">
                              {sender?.profile_image && (
                                <img src={sender.profile_image} alt={sender.full_name} className="w-full h-full object-cover rounded-full" />
                              )}
                              <AvatarFallback className="bg-blue-500 text-white text-sm">
                                {sender?.full_name?.[0]?.toUpperCase() || sender?.email?.[0]?.toUpperCase() || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {displayContent}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(message.createdAt), 'MMM d')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="mt-6 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Vehicle Transfer Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vehicleTransfers.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No active transfers</p>
                    <p className="text-sm">Vehicle transfer progress will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vehicleTransfers.map((transfer: any) => {
                      const vehicle = conversations.find((c: any) => c.vehicle?.id === transfer.vehicle_id)?.vehicle;
                      return (
                        <Card key={transfer.id} className="border border-slate-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                {vehicle?.primary_image ? (
                                  <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <Car className="w-8 h-8 text-slate-400" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-slate-800 mb-1">{vehicle?.title || 'Unknown Vehicle'}</h4>
                                <p className="text-sm text-slate-500 mb-3">
                                  {vehicle?.year} {vehicle?.make} {vehicle?.model}
                                </p>
                                
                                <TransferProgressTracker transfer={transfer} vehicle={vehicle} compact={true} />
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedTransfer(transfer)}
                                className="flex-shrink-0"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="managed_sales" className="mt-6 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-emerald-500" />
                  Request a Managed Sale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Let us handle the entire selling process for you. From photos to paperwork, we've got you covered.
                </p>
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowNewRequestModal(true)}
                    className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                <Link href="/Managed-Sales">
                    <Button variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

              {managedSales.length === 0 && (
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Handshake className="w-5 h-5 text-slate-500" />
                      My Managed Sales
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-slate-500">
                      <Handshake className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">No Managed Sales Yet</p>
                      <p className="text-sm">Your submitted requests will appear here.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {managedSales.length > 0 && (
                <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      My Existing Requests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <TooltipProvider>
                      {managedSales.map((request: any) => {
                        const statusInfo = getStatusInfo(request.status);
                        const performance = vehiclePerformance[request.id];
                        return (
                          <div key={request.id} className="space-y-4">
                            <Card className={`border hover:shadow-md transition-shadow ${!request.vehicle_title && !request.vehicle_details?.title ? 'border-yellow-300 bg-yellow-50' : 'border-slate-200'}`}>
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                  <div className="w-full md:w-32 h-32 md:h-24 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    {(request.vehicle_details?.images || request.vehicle_images)?.[0] ? (
                                      <img src={(request.vehicle_details?.images || request.vehicle_images)?.[0]} alt={request.vehicle_details?.title || request.vehicle_title} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="flex items-center justify-center h-full">
                                        <Car className="w-10 h-10 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    {/* Title and Status */}
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="font-semibold text-slate-800">
                                        {(request.vehicle_details?.title || request.vehicle_title) || (request.status === 'pending_approval' || request.status === 'pending_initial_review' ? 'Incomplete Request - Please Complete Details' : 'Unknown Vehicle')}
                                      </h4>
                                      <div className="flex items-center">
                                        <Badge className={statusInfo.badgeClass}>
                                          {statusInfo.icon}
                                          {statusInfo.text}
                                        </Badge>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button className="ml-2 text-slate-400 hover:text-slate-600">
                                              <Info className="w-4 h-4" />
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{statusInfo.tooltip}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </div>
                                    </div>

                                    {/* Details and Price */}
                                    <div className="text-sm text-slate-600 space-y-2">
                                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <span>{request.vehicle_details?.year || request.vehicle_year} {request.vehicle_details?.make || request.vehicle_make} {request.vehicle_details?.model || request.vehicle_model}</span>
                                        {(request.vehicle_details?.seller_asking_price || request.seller_asking_price) ? (
                                          <span className="font-semibold text-emerald-600">
                                            Your Price: ${Number(request.vehicle_details?.seller_asking_price || request.seller_asking_price).toLocaleString()}
                                          </span>
                                        ) : null}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        Submitted {format(new Date(request.createdAt || request.created_date), 'MMM d, yyyy')}
                                      </div>
                                    </div>

                                    {/* Status Description and Performance */}
                                    <div className="mt-3 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
                                      <p className="font-medium mb-2">{statusInfo.description}</p>
                                      {performance && (
                                        <div className="flex items-center gap-2 text-xs">
                                          <Eye className="w-4 h-4 text-blue-500" />
                                          <span className="font-bold">{performance.views}</span> views on listing
                                        </div>
                                      )}
                                    </div>

                                    {/* User Facing Notes from Admin */}
                                    {request.user_facing_notes && (
                                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                          <strong>Update from Speedio:</strong> {request.user_facing_notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex flex-col gap-2 w-full md:w-auto">
                                    <Button size="sm" variant="default" className="w-full" onClick={() => handleViewDetails(request)}>
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Details
                                    </Button>
                                    {(request.status === 'pending_approval' || request.status === 'pending_initial_review') && !request.vehicle_title && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="w-full bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                                        onClick={() => {
                                          setEditingRequest(request);
                                          setShowNewRequestModal(true);
                                          setShowRequestDetailsModal(false);
                                        }}
                                      >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Complete Details
                                      </Button>
                                    )}
                                    {request.status === 'listed' && request.created_vehicle_id && (
                                      <Link href={`/vehicle?id=${request.created_vehicle_id}`}>
                                        <Button size="sm" variant="outline" className="w-full">
                                          <ExternalLink className="w-4 h-4 mr-2" />
                                          View Listing
                                        </Button>
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Add Management Actions for Listed Vehicles */}
                            {(request.status === 'listed' || request.status === 'approved') && (
                              <ManagedSalesActions
                                request={request}
                                currentUser={user}
                                onUpdate={loadDashboardData}
                              />
                            )}
                          </div>
                        );
                      })}
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          <TabsContent value="browse" className="mt-6 space-y-6">
              {/* Recently Viewed */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Recently Viewed
                  </CardTitle>
                  <Link href="/Marketplace">
                    <Button variant="outline" size="sm">Browse More</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                    {recentlyViewed.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <Car className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No vehicles viewed yet</p>
                        <p className="text-sm">Start exploring the marketplace</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentlyViewed.slice(0, 3).map((vehicle: any) => (
                          <Link key={vehicle.id} href={`/vehicle?id=${vehicle.id}`}>
                            <div className="flex gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer border">
                              <div className="w-20 h-16 bg-slate-200 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                                {vehicle.primary_image ? (
                                  <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Car className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{vehicle.title}</p>
                                <p className="text-lg font-bold text-blue-600">${vehicle.price?.toLocaleString()}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Marketplace Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-500" />
                    Explore Vehicles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                    <Link href="/Marketplace?condition=excellent">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4 text-center h-full flex flex-col justify-between">
                          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800">Excellent Condition</h4>
                            <p className="text-xs text-slate-500">Premium vehicles</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/Marketplace?fuel_type=electric">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4 text-center h-full flex flex-col justify-between">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Handshake className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800">Electric</h4>
                            <p className="text-xs text-slate-500">Eco-friendly</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/Marketplace?verified=true">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4 text-center h-full flex flex-col justify-between">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <CheckCircle className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800">Verified</h4>
                            <p className="text-xs text-slate-500">Trusted listings</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/Marketplace">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4 text-center h-full flex flex-col justify-between">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Eye className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-800">Browse All</h4>
                            <p className="text-xs text-slate-500">See everything</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade to Seller CTA Card */}
              <Card className="bg-gradient-to-br from-slate-50/80 to-blue-50/40 border border-slate-200/50 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <Car className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">
                        Ready to Sell Your Own Cars?
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Upgrade to a Seller account and take control of your listings. Create professional listings,
                        manage inquiries directly, and reach thousands of potential buyers on your own terms.
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-blue-700 mb-4">
                        <div className="flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>One-time ¥8,000 fee</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>Up to 3 vehicles per year</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>Keep full control</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                    
                        <Button
                        onClick={() => router.push("/Subscription")}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-6 py-3">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Become a Seller
                        </Button>
                  
                    </div>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div> {/* End Content Width Wrapper */}

      {/* Edit/Create Request Form Modal */}
      <AnimatePresence>
        {showNewRequestModal && (
          <ManagedSalesRequestForm
            requestToEdit={editingRequest}
            isOpen={showNewRequestModal}
            onClose={() => {
              setShowNewRequestModal(false);
              setEditingRequest(null);
            }}
            onSave={handleSaveRequest}
          />
        )}
      </AnimatePresence>

      {availabilityVehicle && (
              <TestDriveAvailabilityManager
                vehicle={availabilityVehicle}
                onSave={handleSaveVehicleAvailability}
                onClose={() => setAvailabilityVehicle(null)}
              />
            )}
      
      {/* Details Modal */}
      {showRequestDetailsModal && selectedRequest && (
        <ManagedSaleDetailsModal
          isOpen={showRequestDetailsModal}
          request={selectedRequest}
          onClose={() => {
            setShowRequestDetailsModal(false);
            setSelectedRequest(null); // Clear selected request
          }}
          onEdit={handleEditRequest}
          onCancel={handleCancelRequest}
        />
      )}

      {/* Test Drive Details Modal for Guests - Added loading check */}
      {!isLoading && (() => {
        const vehicleForModal = viewingTestDrive ? getVehicleById(viewingTestDrive.vehicle_id) : null;
        const sellerForModal = vehicleForModal ? getSellerByEmail(vehicleForModal.created_by) : null;
        return (
          <GuestTestDriveDetailsModal
            isOpen={!!viewingTestDrive}
            onClose={() => setViewingTestDrive(null)}
            testDriveMessage={viewingTestDrive}
            vehicle={vehicleForModal}
            seller={sellerForModal}
            onCancelRequest={handleCancelTestDriveRequest}
          />
        );
      })()}

         {showCreateModal && (
              <CreateVehicleModalUI
                isOpen={showCreateModal}
                vehicleToEdit={editingVehicle}
                onSave={editingVehicle ? handleUpdateVehicle : handleCreateVehicle}
                onClose={() => {
                  setShowCreateModal(false);
                  setEditingVehicle(null);
                }}
                isSubmitting={isSubmitting}
                 isDirectListing={true} 
              />
            )}

      {/* Transfer Details Modal */}
      <AnimatePresence>
        {selectedTransfer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setSelectedTransfer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-3xl w-full relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={() => setSelectedTransfer(null)}>
                <X className="w-5 h-5" />
              </Button>
              
              <TransferProgressTracker 
                transfer={selectedTransfer} 
                vehicle={conversations.find((c: any) => c.vehicle?.id === selectedTransfer.vehicle_id)?.vehicle} 
                compact={false} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>



  );
}
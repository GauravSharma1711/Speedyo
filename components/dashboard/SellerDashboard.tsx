"use client"
import { useRouter } from "next/navigation";

import React, { useState, useEffect, useCallback } from "react";
import { Vehicle, Post, Message, ManagedSaleRequest, PublicUser, Notification, User, VehicleTransfer } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Car,
  Plus,
  Eye,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Settings,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Users,
  CalendarCheck,
  User as UserIcon,
  Phone,
  X,
  Shield,
  ClipboardCheck,
  MessageSquare,
  AlertCircle,
  AlertTriangle,
  MoreHorizontal,
  FileText,
  MapPin,
} from "lucide-react";



import CreateVehicleModal from "./CreateVehicleModal";
import VehicleAnalytics from "./VehicleAnalytics";
import ManagedSalesRequestForm from "../manageSales/RequestForm";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { AnimatePresence, motion } from "framer-motion";
import VehicleEditRequestModal from "./VehicleEditRequestModal";
import TestDriveAvailabilityManager from "./TestDriveAvailabilityManager";
import EditTestDriveRequestModal from './EditTestDriveRequestModal';
import SellerTestDriveReportViewModal from "./SellerTestDriveReportViewModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { useToast } from "@/components/ui/UseToast";
import { Toaster } from "@/components/ui/Toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
// import { sendEmail } from "@/functions/sendEmail";
import BuyMoreSlotsModal from "./BuyMoreSlotsModal";
import NotificationSettings from "./NotificationSettings";
import TransferProgressTracker from "./TransferProgressTracker";
// import { base44 } from "@/api/base44Client";

const ManagedSaleDetailsModal = ({ isOpen, request, onClose, onEdit, onCancel }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Managed Sale Request Details</h2>
        <p className="mb-2"><strong>Vehicle:</strong> {request.vehicle_details?.title}</p>
        <p className="mb-2"><strong>Status:</strong> {request.status}</p>
        <p className="mb-2"><strong>Price:</strong> ${request.vehicle_details?.seller_asking_price?.toLocaleString()}</p>
        <p className="mb-4"><strong>Submitted:</strong> {format(new Date(request.created_date), 'MMM d, yyyy')}</p>
        {request.user_facing_notes && (
          <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400 mb-4">
            <p className="text-xs text-blue-800">
              <strong>Notes from Speedio:</strong> {request.user_facing_notes}
            </p>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {request.status !== 'cancelled' && request.status !== 'sold' && (
            <>
              <Button variant="outline" onClick={onEdit}>Edit</Button>
              <Button variant="destructive" onClick={onCancel}>Cancel Request</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const TestDriveDetailsModal = ({ isOpen, request, onClose, onApprove, onDecline, onComplete, onEdit, getBuyerById, getVehicleById, user }) => {
  const router = useRouter();
  if (!isOpen || !request) return null;

  const vehicle = getVehicleById(request.vehicle_id);
  const requester = getBuyerById(request.sender_id);
  const testDriveDetails = request.test_drive_details;

  const isLocationMissing = !testDriveDetails?.location || testDriveDetails.location === "N/A" || !testDriveDetails.location.trim();

  const handleMessageBuyer = () => {
    router.push(`/Messages?recipientId=${requester.user_id}&vehicleId=${vehicle.id}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-blue-700">
          <CalendarCheck className="w-6 h-6" /> Test Drive Request
        </h2>

        <div className="space-y-4">
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Car className="w-5 h-5 text-slate-600" /> Vehicle Details
            </h3>
            {vehicle.primary_image && (
              <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-32 object-cover rounded-md mb-2" />
            )}
            <p className="text-md font-medium text-slate-800">{vehicle?.title || 'N/A'}</p>
            <p className="text-sm text-slate-600">
              <strong>Price:</strong> ${vehicle?.price?.toLocaleString() || 'N/A'}
            </p>
            <button
  onClick={() =>window.open(`/vehicle?id=${vehicle?.id}`, "_blank")}
  className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2">
  View Listing
  <ExternalLink className="w-4 h-4" />
</button>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-slate-600" /> Requester
            </h3>
            <p className="text-md font-medium text-slate-800">{requester.full_name || 'Unknown User'}</p>
            <p className="text-sm text-slate-600 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {requester.email || 'N/A'}
            </p>
            {requester.phone && (
              <p className="text-sm text-slate-600 flex items-center gap-1">
                <Phone className="w-4 h-4" /> {requester.phone}
              </p>
            )}
          <button
  onClick={() =>
    window.open(  `/profile?userId=${requester.user_id}`,  "_blank" )}
  className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-2"
>
  View Profile
</button>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600" /> Request Details
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                <strong>Requested Date:</strong> {testDriveDetails?.preferred_date ? format(new Date(testDriveDetails.preferred_date), 'EEE, MMM d, yyyy') : 'N/A'}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Requested Time:</strong> {testDriveDetails?.preferred_time || 'N/A'}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Location:</strong> {testDriveDetails?.location || 'N/A'}
              </p>
              <div className="pt-2">
                <p className="text-sm font-medium text-slate-700 mb-1">Buyer's Additional Notes:</p>
                <div className="bg-white border border-slate-200 rounded-md p-3 min-h-[60px]">
                  {testDriveDetails?.notes ? (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{testDriveDetails.notes}</p>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No additional notes provided</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <strong>Status:</strong>
              <Badge className={`text-sm capitalize ${
                request.test_drive_details?.status === 'approved' ? 'bg-green-100 text-green-800' :
                  request.test_drive_details?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    request.test_drive_details?.status === 'declined' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
              }`}>
                {request.test_drive_details?.status || 'pending'}
              </Badge>
            </div>
          </div>

          {isLocationMissing && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Missing Location:</strong> This test drive request cannot be approved until a meeting location is confirmed. Please message the buyer to confirm details and then edit this request to add the location.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap gap-3 justify-end">
            <Button variant="outline" onClick={handleMessageBuyer} className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> Message Buyer
            </Button>
            {testDriveDetails?.status === 'pending' && (
              <>
                <Button onClick={onEdit} className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1">
                  <Edit className="w-4 h-4" /> Edit Request
                </Button>
                <Button
                  onClick={() => { onApprove(request.id); onClose(); }}
                  className="bg-green-500 hover:bg-green-600 flex items-center gap-1"
                  disabled={isLocationMissing}
                  title={isLocationMissing ? "A location must be confirmed first" : "Approve this request"}
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => { onDecline(request.id); onClose(); }}
                  className="flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" /> Decline
                </Button>
              </>
            )}
            {testDriveDetails?.status === 'approved' && (
              <Button onClick={() => { onComplete(request.id); onClose(); }} className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
                <ClipboardCheck className="w-4 h-4" /> Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


export default function SellerDashboard({ user }) {
  const router = useRouter();
  const [publicUser, setPublicUser] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // Added for tabs control

  useEffect(() => {
    const loadPublicUser = async () => {
      if (user?.id) {
        const profiles = await PublicUser.filter({ user_id: user.id });
        if (profiles.length > 0) {
          setPublicUser(profiles[0]); // Set the first object from the array
        }
      }
    };
    loadPublicUser();
  }, [user]);

  const [listings, setListings] = useState([]); // Vehicles created by the user for direct listing
  const [managedSaleVehicles, setManagedSaleVehicles] = useState([]); // Vehicles where user is original owner (includes managed sales)
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]); // All messages where user is recipient
  const [testDriveRequests, setTestDriveRequests] = useState([]); // All test drive requests (received & sent)
  const [managedSaleRequests, setManagedSaleRequests] = useState([]); // The actual ManagedSaleRequest objects
  const [vehiclePerformance, setVehiclePerformance] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    activeListings: 0,
    avgPrice: 0,
    totalInquiries: 0,
    thisWeekViews: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for handleCreateVehicle

  const [availabilityVehicle, setAvailabilityVehicle] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);
  const [showTestDriveDetails, setShowTestDriveDetails] = useState(null);
  const [viewingActivity, setViewingActivity] = useState(null);
  const [editingTestDriveRequest, setEditingTestDriveRequest] = useState(null);
  const [showVehicleEditRequestModal, setShowVehicleEditRequestModal] = useState(null);
  const [viewingSentTestDrive, setViewingSentTestDrive] = useState(null);
  const [isUpdating, setIsUpdating] = useState(null);
  const [showBuyMoreSlotsModal, setShowBuyMoreSlotsModal] = useState(false);
  // const [showSlotDetails, setShowSlotDetails] = useState(false); // New state for collapsible details - REMOVED

  const [allUserVehiclesCombined, setAllUserVehiclesCombined] = useState([]); // Combined list for getVehicleById
  const [vehicleTransfers, setVehicleTransfers] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);

  const { toast } = useToast();

  const loadSellerData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch user-created vehicles (direct listings) - now includes all statuses
      const userCreatedVehicles = await Vehicle.filter({ created_by: user.email }, "-created_date");
      setListings(userCreatedVehicles);

      // 2. Fetch vehicles where the user is the original owner (includes managed sales that are now vehicle entities)
      const userOriginalOwnerVehicles = await Vehicle.filter({ original_owner_id: user.id }, "-created_date");
      setManagedSaleVehicles(userOriginalOwnerVehicles);

      // 3. Combine all vehicles related to the user for general lookup (e.g., in modals like TestDriveDetailsModal)
      const allVehiclesUserOwnsOrCreated = Array.from(new Map(
        [...userCreatedVehicles, ...userOriginalOwnerVehicles].map(v => [v.id, v])
      ).values());
      setAllUserVehiclesCombined(allVehiclesUserOwnsOrCreated);

      // 4. Fetch user posts (if still used - original code had this)
      const userPosts = await Post.filter({ created_by: user.email }, "-created_date");
      setPosts(userPosts);

      // 5. Fetch all messages received by the user
      const allReceivedMessages = await Message.filter({ recipient_id: user.id }, "-created_date", 20);
      setMessages(allReceivedMessages);

      // 6. Fetch all test drive requests (received by user and sent by user)
      const receivedTestDriveMsgs = allReceivedMessages.filter(msg => msg.message_type === 'test_drive_request');
      const sentTestDriveMsgs = await Message.filter({ sender_id: user.id, message_type: "test_drive_request" }, "-created_date", 20);
      const combinedTestDriveMsgs = Array.from(new Set([...receivedTestDriveMsgs, ...sentTestDriveMsgs].map(m => m.id)))
        .map(id => ([...receivedTestDriveMsgs, ...sentTestDriveMsgs].find(m => m.id === id))); // Ensure no duplicates
      setTestDriveRequests(combinedTestDriveMsgs);

      // 7. Populate buyers based on all relevant test drive messages - USE PublicUser instead of User
      const buyerIds = [...new Set([
        ...receivedTestDriveMsgs.map(req => req.sender_id),
        ...sentTestDriveMsgs.map(req => req.recipient_id)
      ])];
      if (buyerIds.length > 0) {
        // ✅ FIX: Use PublicUser.list() instead of User.list()
        const allPublicUsers = await PublicUser.list("-created_date", 200);
        setBuyers(allPublicUsers.filter(buyer => buyerIds.includes(buyer.user_id)));
      } else {
        setBuyers([]);
      }

      // 8. Fetch managed sale *request* objects (for modal details, etc.)
      const userManagedSaleRequests = user.id ? await ManagedSaleRequest.filter({ submitted_by_user_id: user.id }, "-created_date") : [];
      setManagedSaleRequests(userManagedSaleRequests || []);

      // 9. Fetch vehicle transfers (both as buyer and seller)
      const transfersAsBuyer = user.id ? await VehicleTransfer.filter({ buyer_id: user.id }, "-created_date") : [];
      const transfersAsSeller = user.id ? await VehicleTransfer.filter({ seller_id: user.id }, "-created_date") : [];
      const allTransfers = Array.from(new Map(
        [...transfersAsBuyer, ...transfersAsSeller].map(t => [t.id, t])
      ).values());
      setVehicleTransfers(allTransfers);

      // 10. Calculate `vehiclePerformance` for managed sale requests
      const performanceData = {};
      if (Array.isArray(userManagedSaleRequests)) {
        userManagedSaleRequests
          .filter(req => req.status === 'listed' && req.created_vehicle_id)
          .forEach(req => {
            const vehicle = userOriginalOwnerVehicles.find(v => v.id === req.created_vehicle_id);
            if (vehicle) {
              performanceData[req.id] = { views: vehicle.views || 0 };
            } else {
              console.warn(`Vehicle ${req.created_vehicle_id} for request ${req.id} no longer exists or is not accessible.`);
            }
          });
      }
      setVehiclePerformance(performanceData);

      // 11. Calculate `stats`
      const allVehiclesForStats = Array.from(new Map(
        [...userCreatedVehicles, ...userOriginalOwnerVehicles].map(v => [v.id, v])
      ).values());

      const totalViews = allVehiclesForStats.reduce((sum, vehicle) => sum + (vehicle.views || 0), 0);
      const activeUserListingsCount = userCreatedVehicles.filter(v => v.status === 'available').length;
      const activeManagedSaleListingsCount = userOriginalOwnerVehicles.filter(v => v.status === 'available').length;

      // FIX: Corrected syntax for reduce callback
      const avgPrice = allVehiclesForStats.length > 0
        ? allVehiclesForStats.reduce((sum, v) => sum + (v.price || 0), 0) / allVehiclesForStats.length
        : 0;
      const totalInquiries = combinedTestDriveMsgs.length;

      const thisWeekViews = Math.floor(totalViews * 0.3); // Placeholder

      setStats({
        totalListings: userCreatedVehicles.length + userOriginalOwnerVehicles.length,
        activeListings: activeUserListingsCount + activeManagedSaleListingsCount,
        avgPrice,
        totalInquiries,
        thisWeekViews,
        totalViews,
      });

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSellerData();
  }, [loadSellerData]);

  const getPrivateSellerSlotInfo = () => {
    if (!user || user.user_type !== 'private_seller') return null;
    const purchased = user.private_seller_slots?.purchased || 0;
    const used = user.private_seller_slots?.used || 0;
    return { purchased, used, remaining: purchased - used };
  };

  // Memoize helper functions to prevent useCallback dependency changes
  const getBuyerById = useCallback((buyerId) => {
    // ✅ FIX: Match against user_id since we're using PublicUser now
    return buyers.find(buyer => buyer.user_id === buyerId) || { full_name: "Unknown Buyer", email: "unknown", phone: null, user_id: buyerId };
  }, [buyers]);

  const getVehicleById = useCallback((vehicleId) => {
    return allUserVehiclesCombined.find(vehicle => vehicle.id === vehicleId) || {};
  }, [allUserVehiclesCombined]);

  // const handleCreateVehicle = async (vehicleData) => {
  //   setIsSubmitting(true);
  //   try {
  //     const newVehicleData = {
  //       ...vehicleData,
  //       author_id: user.id, // Only keep the author_id
  //     };
  //     const newVehicle = await Vehicle.create(newVehicleData);

  //     // Trigger notification for followers
  //     try {
  //       await base44.functions.invoke('notifyFollowersOfNewVehicle', { vehicleId: newVehicle.id });
  //     } catch (notifError) {
  //       console.error("Failed to notify followers:", notifError);
  //       // Don't block vehicle creation if notification fails
  //     }

  //     setShowCreateModal(false);
  //     loadSellerData(); // Refresh data
  //     toast({
  //       title: "Vehicle Created",
  //       description: "Your vehicle listing has been successfully created.",
  //       variant: "success",
  //     });

  //     return newVehicle; // Return the created vehicle
  //   } catch (error) {
  //     console.error("Failed to create vehicle:", error);
  //     toast({
  //       title: "Creation Failed",
  //       description: "Could not create the vehicle listing. Please try again.",
  //       variant: "destructive",
  //     });
  //     throw error;
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleUpdateVehicle = async (vehicleData) => {
    if (!editingVehicle) return;
    try {
      await Vehicle.update(editingVehicle.id, vehicleData);
      setEditingVehicle(null);
      setShowCreateModal(false);
      loadSellerData();
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

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowCreateModal(true);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        await Vehicle.delete(vehicleId);
        toast({
          title: "Listing Deleted",
          description: "The vehicle listing has been permanently removed.",
          variant: "success",
        });
        loadSellerData();
      } catch (error) {
        console.error("Failed to delete vehicle:", error);
        toast({
          title: "Deletion Failed",
          description: "Could not delete the listing. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleMarkAsSold = useCallback(async (vehicleId) => {
    if (window.confirm("Are you sure you want to mark this vehicle as sold? This will remove it from active listings.")) {
      setIsUpdating(vehicleId);
      try {
        await Vehicle.update(vehicleId, { status: 'sold' });
        toast({
          title: "Vehicle Marked as Sold",
          description: "The listing has been updated and removed from the marketplace.",
          variant: "success",
        });
        await loadSellerData(); // Refreshes all data, including listings
      } catch (error) {
        console.error("Failed to mark vehicle as sold:", error);
        toast({
          title: "Update Failed",
          description: "Could not mark the vehicle as sold. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(null);
      }
    }
  }, [loadSellerData, toast]);

  const handleMarkAsUnavailable = useCallback(async (vehicleId) => {
    if (window.confirm("Mark this vehicle as temporarily unavailable? You can make it available again anytime.")) {
      setIsUpdating(vehicleId);
      try {
        await Vehicle.update(vehicleId, { status: 'unavailable' });
        toast({
          title: "Vehicle Marked as Unavailable",
          description: "The listing has been marked as temporarily unavailable.",
          variant: "success",
        });
        await loadSellerData();
      } catch (error) {
        console.error("Failed to mark vehicle as unavailable:", error);
        toast({
          title: "Update Failed",
          description: "Could not update the vehicle status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUpdating(null);
      }
    }
  }, [loadSellerData, toast]);

  const handleMarkAsAvailable = useCallback(async (vehicleId) => {
    setIsUpdating(vehicleId);
    try {
      await Vehicle.update(vehicleId, { status: 'available' });
      toast({
        title: "Vehicle Marked as Available",
        description: "The listing is now available on the marketplace.",
        variant: "success",
      });
      await loadSellerData();
    } catch (error) {
      console.error("Failed to mark vehicle as available:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the vehicle status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  }, [loadSellerData, toast]);

  const handleVehicleEditRequestSubmit = async (vehicleId, changes, notes) => {
    try {
      const currentVehicle = listings.find(v => v.id === vehicleId); // Check from user's direct listings
      if (!currentVehicle) {
        throw new Error("Vehicle not found for edit request.");
      }

      const newEditRequest = {
        requested_at: new Date().toISOString(),
        requested_changes: changes,
        notes_from_user: notes,
        status: 'pending'
      };

      const existingEditRequests = currentVehicle.edit_requests || [];

      await Vehicle.update(vehicleId, {
        status: 'edit_requested',
        edit_requests: [...existingEditRequests, newEditRequest]
      });

      const admins = await User.filter({ role: 'admin' });
      const notificationPromises = admins.map(admin =>
        Notification.create({
          recipient_id: admin.id,
          sender_id: user.id,
          type: "vehicle_edit_request",
          content: `User ${user.full_name} requested an edit for their vehicle "${currentVehicle.title}`,
          related_entity_id: vehicleId,
         url: "/Admin-Panel?tab=vehicles",
          icon: "Edit"
        })
      );
      await Promise.all(notificationPromises);

      setShowVehicleEditRequestModal(null);
      loadSellerData();
      toast({
        title: "Edit Request Submitted",
        description: "Your edit request has been submitted for review.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to submit vehicle edit request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your edit request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRequest = (request) => {
    setEditingRequest(request);
    setShowRequestForm(true);
    setShowDetailsModal(false); // Close details modal when opening edit form
  };

  const handleCancelRequest = async (requestToCancel) => {
    if (!requestToCancel || !requestToCancel.id) {
      toast({
        title: "Error",
        description: "Invalid managed sale request data. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm("Are you sure you want to cancel this managed sale request?")) {
      try {
        await ManagedSaleRequest.update(requestToCancel.id, { status: 'cancelled' });
        if (requestToCancel.status === 'listed' && requestToCancel.created_vehicle_id) {
          // If a vehicle was created, mark it as cancelled too
          await Vehicle.update(requestToCancel.created_vehicle_id, { status: 'cancelled' });
        }

        // Send notification to user about cancellation
        await Notification.create({
          recipient_id: user.id,
          sender_id: user.id, // Self-notification for record
          type: "managed_sale_status_update",
          content: `Your managed sale request for "${requestToCancel.vehicle_details.title}" has been cancelled.`,
          related_entity_id: requestToCancel.id,
          url: "/Dashboard",
          icon: "XCircle"
        });

        loadSellerData();
        setShowDetailsModal(false); // close modal
        toast({
          title: "Request Cancelled",
          description: "The managed sale request has been successfully cancelled.",
          variant: "success",
        });
      } catch (error) {
        console.error("Failed to cancel managed sale request:", error);
        toast({
          title: "Error",
          description: "Failed to cancel the managed sale request.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFormSuccess = () => {
    setShowRequestForm(false);
    setEditingRequest(null);
    loadSellerData();
  };

  const handleUpdateRequest = async (requestData, originalRequest) => {
    setIsSubmittingEdit(true);
    try {
      const changes = {};

      if (requestData.vehicle_details && originalRequest.vehicle_details) {
        const vehicleDetailKeys = Object.keys(requestData.vehicle_details);
        for (const key of vehicleDetailKeys) {
          const originalValue = originalRequest.vehicle_details[key] === null || originalRequest.vehicle_details[key] === undefined ? "" : String(originalRequest.vehicle_details[key]);
          const newValue = requestData.vehicle_details[key] === null || requestData.vehicle_details[key] === undefined ? "" : String(requestData.vehicle_details[key]);

          if (newValue !== originalValue) {
            changes[key] = requestData.vehicle_details[key];
          }
        }
      }

      if (requestData.access_arrangements && originalRequest.access_arrangements) {
        const accessArrangementKeys = Object.keys(requestData.access_arrangements);
        for (const key of accessArrangementKeys) {
          const originalValue = originalRequest.access_arrangements[key] === null || originalRequest.access_arrangements[key] === undefined ? "" : String(originalRequest.access_arrangements[key]);
          const newValue = requestData.access_arrangements[key] === null || requestData.access_arrangements[key] === undefined ? "" : String(requestData.access_arrangements[key]);

          if (newValue !== originalValue) {
            changes[key] = requestData.access_arrangements[key];
          }
        }
      }

      if (Object.keys(changes).length > 0) {
        const newEditRequest = {
          requested_at: new Date().toISOString(),
          requested_changes: changes,
          status: 'pending'
        };

        const existingEditRequests = originalRequest.edit_requests || [];

        await ManagedSaleRequest.update(originalRequest.id, {
          status: 'edit_requested',
          edit_requests: [...existingEditRequests, newEditRequest]
        });

        const admins = await User.filter({ role: 'admin' });
        const notificationPromises = admins.map(admin =>
          Notification.create({
            recipient_id: admin.id,
            sender_id: user.id,
            type: "managed_sale_status_update",
            content: `User ${user.full_name} requested an edit for "${originalRequest.vehicle_details.title}".`,
            related_entity_id: originalRequest.id,
            url: `/Admin-Panel?tab=managed_sales`,
            icon: "Edit"
          })
        );
        await Promise.all(notificationPromises);

        handleFormSuccess();
        toast({
          title: "Update Request Submitted",
          description: "Your update request has been submitted for review.",
          variant: "success",
        });
      } else {
        toast({
          title: "No Changes Detected",
          description: "No changes were detected to submit.",
          variant: "info",
        });
      }

    } catch (error) {
      console.error("Failed to submit update request:", error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your update. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleViewDetails = (request) => {
    setViewingRequest(request);
    setShowDetailsModal(true);
  };

  const handleApproveTestDrive = async (messageId) => {
    try {
      const message = testDriveRequests.find(msg => msg.id === messageId && msg.recipient_id === user.id);
      if (message && message.test_drive_details) {
        const updatedTestDriveDetails = {
          ...message.test_drive_details,
          status: "approved"
        };

        await Message.update(messageId, {
          test_drive_details: updatedTestDriveDetails
        });

        await Message.create({
          recipient_id: message.sender_id,
          sender_id: user.id,
          content: `Your test drive request for ${format(new Date(message.test_drive_details.preferred_date), 'MMM d, yyyy')} at ${message.test_drive_details.preferred_time} has been approved.`,
          message_type: "confirmation_test_drive",
          vehicle_id: message.vehicle_id,
          conversation_id: message.conversation_id
        });

        const buyer = buyers.find(b => b.user_id === message.sender_id);
        if (buyer) {
          await sendEmail({
            to: buyer.email,
            subject: `Your Test Drive for ${getVehicleById(message.vehicle_id)?.title} is Approved!`,
            html: `<h2>Test Drive Approved!</h2>
                         <p>Hi ${buyer.full_name},</p>
                         <p>Your test drive request for the ${getVehicleById(message.vehicle_id)?.title} on ${format(new Date(message.test_drive_details.preferred_date), 'MMM d, yyyy')} has been approved. Please check your messages for details.</p>`
          });
        }

        await Notification.create({
          recipient_id: message.sender_id,
          sender_id: user.id,
          type: "test_drive_update",
          content: `Your test drive for "${getVehicleById(message.vehicle_id)?.title}" has been approved!`,
          related_entity_id: message.id,
          url: `/Chat?messageId=${message.id}`,
          icon: "CheckCircle"
        });

        loadSellerData();

        toast({
          title: "Test Drive Approved",
          description: "The test drive request has been approved and the buyer has been notified.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to approve test drive:", error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve test drive request. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleDeclineTestDrive = async (messageId) => {
    try {
      const message = testDriveRequests.find(msg => msg.id === messageId && msg.recipient_id === user.id);
      if (message && message.test_drive_details) {
        const updatedTestDriveDetails = {
          ...message.test_drive_details,
          status: "declined"
        };

        await Message.update(messageId, {
          test_drive_details: updatedTestDriveDetails
        });

        await Message.create({
          recipient_id: message.sender_id,
          sender_id: user.id,
          content: `Your test drive request for ${format(new Date(message.test_drive_details.preferred_date), 'MMM d, yyyy')} has been declined.`,
          message_type: "confirmation_test_drive",
          vehicle_id: message.vehicle_id,
          conversation_id: message.conversation_id
        });

        const buyer = buyers.find(b => b.user_id === message.sender_id);
        if (buyer) {
          await sendEmail({
            to: buyer.email,
            subject: `Update on your Test Drive Request for ${getVehicleById(message.vehicle_id)?.title}`,
            html: `<h2>Test Drive Request Update</h2>
                         <p>Hi ${buyer.full_name},</p>
                         <p>Unfortunately, your test drive request for the ${getVehicleById(message.vehicle_id)?.title} has been declined. Please check your messages for more information.</p>`
          });
        }

        await Notification.create({
          recipient_id: message.sender_id,
          sender_id: user.id,
          type: "test_drive_update",
          content: `Your test drive for "${getVehicleById(message.vehicle_id)?.title}" has been declined.`,
          related_entity_id: message.id,
          url: `/Chat?messageId=${message.id}`,
          icon: "XCircle"
        });

        loadSellerData();

        toast({
          title: "Test Drive Declined",
          description: "The test drive request has been declined and the buyer has been notified.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to decline test drive:", error);
      toast({
        title: "Decline Failed",
        description: "Failed to decline test drive request. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleMarkAsCompleted = async (messageId) => {
    try {
      const message = testDriveRequests.find(msg => msg.id === messageId && msg.recipient_id === user.id);
      if (message && message.test_drive_details) {
        const updatedTestDriveDetails = {
          ...message.test_drive_details,
          status: "completed"
        };

        await Message.update(messageId, {
          test_drive_details: updatedTestDriveDetails
        });

        await Message.create({
          recipient_id: message.sender_id,
          sender_id: user.id,
          content: `Your test drive for ${getVehicleById(message.vehicle_id)?.title} has been marked as completed.`,
          message_type: "confirmation_test_drive",
          vehicle_id: message.vehicle_id,
          conversation_id: message.conversation_id
        });

        await Notification.create({
          recipient_id: message.sender_id,
          sender_id: user.id,
          type: "test_drive_update",
          content: `Your test drive for "${getVehicleById(message.vehicle_id)?.title}" has been marked as completed.`,
          related_entity_id: message.id,
          url: `/Chat?messageId=${message.id}`,
          icon: "ClipboardCheck"
        });

        loadSellerData();

        toast({
          title: "Test Drive Completed",
          description: "The test drive has been marked as completed and the buyer has been notified.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to mark test drive as completed:", error);
      toast({
        title: "Update Failed",
        description: "Failed to mark test drive as completed. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleUpdateTestDriveRequest = async (messageId, updatedDetails) => {
    try {
      const message = testDriveRequests.find(msg => msg.id === messageId && msg.recipient_id === user.id);
      if (message && message.test_drive_details) {
        const updatedTestDriveDetails = {
          ...message.test_drive_details,
          ...updatedDetails,
        };

        await Message.update(messageId, { test_drive_details: updatedTestDriveDetails });

        // If the details modal is still open for this request, update its local state
        if (showTestDriveDetails && showTestDriveDetails.id === messageId) {
          const updatedMessage = { ...message, test_drive_details: updatedTestDriveDetails };
          setShowTestDriveDetails(updatedMessage);
        }

        await loadSellerData();

        toast({
          title: "Test Drive Updated",
          description: "Test drive request has been successfully updated.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Failed to update test drive request:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update test drive details. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleCancelSentTestDriveRequest = async (messageId) => {
    if (window.confirm("Are you sure you want to cancel this test drive request? This action cannot be undone.")) {
      try {
        const messageToUpdate = testDriveRequests.find(msg => msg.id === messageId && msg.sender_id === user.id);
        if (messageToUpdate && messageToUpdate.test_drive_details) {
          const updatedDetails = { ...messageToUpdate.test_drive_details, status: 'cancelled' };
          await Message.update(messageId, { test_drive_details: updatedDetails });

          await Message.create({
            recipient_id: messageToUpdate.recipient_id,
            sender_id: user.id,
            content: `The test drive request for ${format(new Date(updatedDetails.preferred_date), 'MMM d, yyyy')} has been cancelled by the requester.`,
            message_type: 'confirmation_test_drive',
            vehicle_id: messageToUpdate.vehicle_id,
            conversation_id: messageToUpdate.conversation_id
          });

          await loadSellerData();
          setViewingSentTestDrive(null);

          toast({
            title: "Test Drive Cancelled",
            description: "Your test drive request has been cancelled and the seller has been notified.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error("Failed to cancel test drive", error);
        toast({
          title: "Cancellation Failed",
          description: "Could not cancel the request. Please try again.",
          variant: "destructive",
          duration: 4000,
        });
      }
    }
  };

  const handleCancelTestDrive = async (messageId) => {
    if (window.confirm("Are you sure you want to cancel this test drive request? The buyer will be notified.")) {
      try {
        const messageToUpdate = testDriveRequests.find(msg => msg.id === messageId && msg.recipient_id === user.id);
        if (messageToUpdate && messageToUpdate.test_drive_details) {
          const updatedDetails = { ...messageToUpdate.test_drive_details, status: 'cancelled' };
          await Message.update(messageToUpdate.id, { test_drive_details: updatedDetails });

          await Message.create({
            recipient_id: messageToUpdate.sender_id,
            sender_id: user.id,
            content: `Your test drive request for ${getVehicleById(messageToUpdate.vehicle_id)?.title} was cancelled by the seller.`,
            message_type: 'confirmation_test_drive',
            vehicle_id: messageToUpdate.vehicle_id,
            conversation_id: messageToUpdate.conversation_id
          });

          toast({
            title: "Test Drive Cancelled",
            description: "The request has been marked as cancelled and the buyer notified.",
            variant: "success",
          });
          await loadSellerData();
        }
      } catch (error) {
        console.error("Failed to cancel test drive", error);
        toast({
          title: "Update Failed",
          description: "Could not cancel the test drive request. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveVehicleAvailability = async (vehicleId, availabilityData) => {
    try {
      await Vehicle.update(vehicleId, availabilityData);
      await loadSellerData();
      setAvailabilityVehicle(null);
      toast({
        title: "Availability Saved",
        description: "Your vehicle's test drive availability has been updated.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to save test drive availability:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTestDriveStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3 mr-1 text-amber-500" />,
          text: "Pending"
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1 text-green-500" />,
          text: "Approved"
        };
      case 'declined':
        return {
          icon: <XCircle className="w-3 h-3 mr-1 text-red-500" />,
          text: "Declined"
        };
      case 'completed':
        return {
          icon: <ClipboardCheck className="w-3 h-3 mr-1 text-blue-500" />,
          text: "Completed"
        };
      case 'cancelled':
        return {
          icon: <Trash2 className="w-3 h-3 mr-1 text-slate-500" />,
          text: "Cancelled"
        };
      default:
        return {
          icon: null,
          text: "Unknown"
        };
    }
  };

  const handleViewActivity = useCallback((request) => {
    const vehicle = getVehicleById(request.vehicle_id);
    const buyer = getBuyerById(request.sender_id);
    setViewingActivity({ request, vehicle, buyer });
  }, [getVehicleById, getBuyerById]);


  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending_review':
        return {
          icon: <Clock className="w-3 h-3 mr-1" />,
          badgeClass: "bg-amber-100 text-amber-800",
          text: "Pending Review",
          description: "Our team is reviewing your submission. We'll get back to you within 2 business days."
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-blue-100 text-blue-800",
          text: "Approved",
          description: "Your request is approved! We're preparing your listing to go live."
        };
      case 'listed':
        return {
          icon: <ExternalLink className="w-3 h-3 mr-1" />,
          badgeClass: "bg-green-100 text-green-800",
          text: "Listed",
          description: "Your vehicle is now live on the marketplace and visible to thousands of buyers."
        };
      case 'declined':
        return {
          icon: <XCircle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-red-100 text-red-800",
          text: "Declined",
          description: "Unfortunately, we couldn't approve this request. Please check the notes from Speedio for details."
        };
      case 'sold':
        return {
          icon: <CheckCircle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-emerald-100 text-emerald-800",
          text: "Sold",
          description: "Congratulations! Your vehicle has been sold through our managed service."
        };
      case 'cancelled':
        return {
          icon: <Trash2 className="w-3 h-3 mr-1" />,
          badgeClass: "bg-slate-100 text-slate-800",
          text: "Cancelled",
          description: "You have cancelled this managed sale request."
        };
      case 'edit_requested':
        return {
          icon: <Edit className="w-3 h-3 mr-1" />,
          badgeClass: "bg-yellow-100 text-yellow-800",
          text: "Edit Requested",
          description: "Your requested changes are under review by our team. We will update you shortly."
        };
      default:
        return {
          icon: null,
          badgeClass: "bg-slate-100",
          text: status,
          description: ""
        };
    }
  };

  const canPostVehicle = () => {
    if (!user) return false;

    if (user.user_type === 'private_seller') {
      // Private Seller: Ability to post is based purely on available slots
      const slotInfo = getPrivateSellerSlotInfo();
      return slotInfo && slotInfo.remaining > 0;
    }

    if (user.user_type === 'dealership') {
      const subscription = user.seller_subscription;
      if (!subscription || !subscription.expires_at) return false;

      const expiresAt = new Date(subscription.expires_at);
      const now = new Date();

      if (expiresAt <= now) return false; // Subscription expired

      const vehiclesSoldThisYear = subscription.vehicles_sold_this_year || 0;
      const salesLimits = {
        'tier1': 10,    // Standard: 10 sales per year
        'tier2': 25,   // Professional: 25 sales per year
        'tier3': -1    // Enterprise: unlimited sales
      };

      const limit = salesLimits[subscription.tier];
      if (limit === -1) return true; // Unlimited

      return vehiclesSoldThisYear < limit;
    }

    return false;
  };

  const getSalesLimitInfo = () => {
    if (!user || !user.seller_subscription) return null;

    if (user.user_type === 'private_seller') {
      const slotInfo = getPrivateSellerSlotInfo();
      return {
        current: slotInfo?.used || 0,
        limit: slotInfo?.purchased || 0,
        type: 'Private Seller'
      };
    }

    if (user.user_type === 'dealership') {
      const vehiclesSoldThisYear = user.seller_subscription.vehicles_sold_this_year || 0;
      const limits = {
        'tier1': { limit: 10, name: 'Standard' },
        'tier2': { limit: 25, name: 'Professional' },
        'tier3': { limit: -1, name: 'Enterprise' }
      };

      const tierInfo = limits[user.seller_subscription.tier] || limits.tier1;
      return {
        current: vehiclesSoldThisYear,
        limit: tierInfo.limit,
        type: tierInfo.name
      };
    }

    return null;
  };

  const getSubscriptionPill = () => {
    if (user.user_type === 'dealership' && user.seller_subscription?.tier) {
      const tierNames = {
        'tier1': 'Standard',
        'tier2': 'Professional',
        'tier3': 'Enterprise'
      };
      const tierColors = {
        'tier1': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        'tier2': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        'tier3': 'bg-amber-100 text-amber-800 hover:bg-amber-200'
      };
      const tierName = tierNames[user.seller_subscription.tier] || user.seller_subscription.tier;
      const tierColor = tierColors[user.seller_subscription.tier] || 'bg-blue-100 text-blue-800 hover:bg-blue-200';

      return (
        <Badge className={`${tierColor} transition-colors duration-200`}>
          {tierName} Dealership
        </Badge>
      );
    }
    if (user.user_type === 'private_seller' && user.seller_subscription) {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors duration-200">
          Private Seller
        </Badge>
      );
    }
    return null;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue", trend = null, trendValue = '' }) => (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-sm font-semibold text-slate-600">{title}</p>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {trend && (
            <div className="text-right">
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 text-emerald-500 ml-auto" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500 ml-auto" />
              )}
              <span className={`text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {trendValue || '+12%'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getUpgradeRecommendation = () => {
    if (user.user_type === 'private_seller') {
      return {
        show: true,
        title: "Ready to Scale Your Business?",
        description: "Upgrade to a Dealership account and unlock unlimited listings, advanced analytics, and priority support to grow your automotive business.",
        benefits: [
          "Unlimited vehicle listings",
          "Advanced analytics & reporting",
          "Priority customer support",
          "Featured marketplace placement"
        ],
        cta: "Explore Dealership Plans",
        gradient: "from-purple-500 to-blue-500",
        icon: Users
      };
    }

    if (user.user_type === 'dealership' && user.seller_subscription?.tier === 'tier1') {
      return {
        show: true,
        title: "Supercharge Your Dealership",
        description: "Upgrade to Professional or Enterprise for more listings, better visibility, and advanced features to maximize your sales potential.",
        benefits: [
          "Up to 100+ listings (Professional)",
          "Promoted marketplace visibility",
          "Advanced reporting dashboard",
          "Dedicated account support"
        ],
        cta: "Upgrade Your Plan",
        gradient: "from-emerald-500 to-blue-500",
        icon: TrendingUp
      };
    }

    return { show: false };
  };

  const upgradeRec = getUpgradeRecommendation();

  const getDealershipVerificationAlert = () => {
    if (!user || !user.dealership_verification_status || user.dealership_verification_status === 'not_submitted') {
      return null;
    }

    if (user.dealership_verification_status === 'pending_review') {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertDescription className="flex items-center gap-3 text-amber-800">
            <Clock className="w-5 h-5" />
            <span>
              <strong>Dealership Application Under Review:</strong> Your dealership registration is being reviewed by our team. We'll notify you of the status within 2-3 business days.
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
                <strong>Dealership Application Declined:</strong> {user.admin_verification_notes || "Please review your information and try again."}
              </span>
            </div>
            <Link to={"/DealershipRegistration"}>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">Resubmit Application</Button>
            </Link>
          </AlertDescription>
        </Alert>
      );
    }

    if (user.dealership_verification_status === 'approved' && !user.seller_subscription?.tier) {
      return (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-800">
              <CheckCircle className="w-5 h-5" />
              <span>
                <strong>Dealership Approved!</strong> Your dealership has been verified and approved. You can now select a subscription plan to start listing vehicles.
              </span>
            </div>
            <Link to={("/Subscription")}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">Select Plan</Button>
            </Link>
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  const isGuest = !user || publicUser?.user_type === 'guest';

  return (
    <div className="space-y-6">
      {getDealershipVerificationAlert()}

      {/* Content Width Wrapper - Now includes header */}
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              {isGuest ? 'Guest Dashboard' : 'Seller Dashboard'}
            </h1>
            <p className="text-slate-600 mt-1">
              Welcome back, {publicUser?.full_name || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {publicUser?.role === 'admin' ? (
              <Badge variant="outline" className="capitalize text-lg px-4 py-2 bg-slate-100 text-slate-700 border-slate-300">
                Admin
              </Badge>
            ) : (
              <Badge variant="outline" className="capitalize text-lg px-4 py-2">
                {publicUser?.user_type || 'guest'}
              </Badge>
            )}
          </div>
        </div>

        {/* Private Seller Slot Info Card */}
        {user?.user_type === 'private_seller' && (() => {
          const slotInfo = getPrivateSellerSlotInfo();
          if (!slotInfo) return null;
          return (
            <Card className="bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Vehicle Slots</h3>
                    <div className="space-y-1 text-sm text-slate-700 mb-4">
                      <p><strong>Purchased:</strong> {slotInfo.purchased} slots</p>
                      <p><strong>Used:</strong> {slotInfo.used} vehicles sold</p> {/* FIX: Changed from 'vehicles listed' to 'vehicles' */}
                      <p><strong>Remaining:</strong> {slotInfo.remaining} slots available</p>
                    </div>

                    {slotInfo.remaining === 0 && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <span className="text-sm">No slots remaining. Purchase more to list additional vehicles.</span>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowBuyMoreSlotsModal(true)}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Buy More Slots
                      </Button>
                      {slotInfo.remaining > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingVehicle(null);
                            setShowCreateModal(true);
                          }}
                        >
                          <Car className="w-4 h-4 mr-2" />
                          List a Vehicle
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-blue-600">{slotInfo.remaining}</span>
                      <span className="text-lg text-slate-500">/ {slotInfo.purchased}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Available</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Car}
            title="Active Listings"
            value={stats.activeListings}
            subtitle={`${stats.totalListings} total`}
            color="blue"
            trend="up"
            trendValue="+8%"
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats.totalViews.toLocaleString()}
            subtitle={`${stats.thisWeekViews} this week`}
            color="emerald"
            trend="up"
            trendValue="+15%"
          />
          <StatCard
            icon={CalendarCheck}
            title="Test Drive Requests"
            value={stats.totalInquiries}
            subtitle="All time"
            color="purple"
            trend="up"
            trendValue="+5%"
          />
          <StatCard
            icon={DollarSign}
            title="Avg. List Price"
            value={`$${Math.round(stats.avgPrice).toLocaleString()}`}
            subtitle="Your listings"
            color="amber"
          />
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex overflow-x-auto scrollbar-hide gap-1 p-1 md:grid md:grid-cols-6 snap-x">
            <TabsTrigger
              value="listings"
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
            >
              Your Listings ({listings.length})
            </TabsTrigger>
            <TabsTrigger
              value="transfers"
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
            >
              Transfers ({vehicleTransfers.length})
            </TabsTrigger>
            <TabsTrigger
              value="test_drives"
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
            >
              Test Drives ({testDriveRequests.filter(req => req.recipient_id === user.id).length + testDriveRequests.filter(req => req.sender_id === user.id).length})
            </TabsTrigger>
            <TabsTrigger
              value="managed_sales"
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
            >
              Managed Sales ({managedSaleRequests.length})
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="whitespace-nowrap flex-shrink-0 px-3 py-2 text-sm md:px-4"
            >
              Settings
            </TabsTrigger>
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
                  disabled={!canPostVehicle() || isSubmitting}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Adding..." : "Add Vehicle"}
                </Button>
              </CardHeader>
              <CardContent>
                {!canPostVehicle() && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <span>
                        {user.user_type === 'private_seller'
                          ? (() => {
                            const slotInfo = getPrivateSellerSlotInfo();
                            if (!slotInfo || slotInfo.purchased === 0) {
                              return 'You need to purchase vehicle slots to list vehicles.';
                            }
                            // Only remaining slots check is relevant if purchased > 0
                            return `You have no vehicle slots remaining. Purchase more to list new vehicles.`;
                          })()
                          : user.user_type === 'dealership'
                            ? (() => {
                              const subscription = user.seller_subscription;
                              const salesInfo = getSalesLimitInfo();
                              const now = new Date();
                              if (!subscription || !subscription.expires_at) {
                                return 'Your dealership needs an active subscription to list vehicles.';
                              }
                              const expiresAt = new Date(subscription.expires_at);
                              if (expiresAt <= now) {
                                return 'Your dealership subscription has expired. Please renew to continue selling.';
                              }
                              if (salesInfo?.limit === -1) return 'Unlimited sales available.';
                              return `You've reached your sales limit. Current sales: ${salesInfo?.current || 0}/${salesInfo?.limit} for this year.`;
                            })()
                            : "You need a seller account to list vehicles."}
                      </span>
                      <Link to={('/Subscription')} className="ml-2 font-semibold underline">
                        {user.user_type === 'private_seller' ? 'Buy Slots' : user.user_type === 'dealership' ? 'Manage Subscription' : 'Upgrade Plan'}
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {getSalesLimitInfo() && (
                  <Card className="mb-4 bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900">
                            {user.user_type === 'private_seller' ? 'Vehicle Slot Status' : 'Sales Limit Status'}
                          </h4>
                          <p className="text-sm text-blue-700">
                            {(() => {
                              const info = getSalesLimitInfo();
                              if (user.user_type === 'private_seller') {
                                return `${info.current}/${info.limit} vehicles listed (${info.type})`;
                              }
                              if (info.limit === -1) {
                                return `Unlimited sales available (${info.type} Plan)`;
                              }
                              return `${info.current}/${info.limit} vehicles sold this year (${info.type} Plan)`;
                            })()}
                          </p>
                        </div>
                        {(() => {
                          const info = getSalesLimitInfo();
                          if (info.limit !== -1) {
                            const percentage = (info.current / info.limit) * 100;
                            return (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{Math.round(percentage)}%</div>
                                <div className="text-xs text-blue-500">Used</div>
                              </div>
                            );
                          }
                          return (
                            <div className="text-right">
                              <div className="text-2xl font-bold text-blue-600">∞</div>
                              <div className="text-xs text-blue-500">Unlimited</div>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {listings.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Car className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No vehicles listed yet</p>
                    <p className="text-sm">Create your first listing to get started</p>
                    {canPostVehicle() && (
                      <Button onClick={() => setShowCreateModal(true)} className="mt-3" disabled={isSubmitting}>
                        <Plus className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Creating..." : "Create Your First Listing"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {listings.map((vehicle) => (
                      <div key={vehicle.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="w-full md:w-32 h-32 md:h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                            {vehicle.primary_image ? (
                              <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Car className="w-10 h-10 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800 leading-tight">{vehicle.title}</h3>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {vehicle.verified && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Shield className="w-4 h-4 text-blue-500" />
                                      </TooltipTrigger>
                                      <TooltipContent><p>Verified Listing</p></TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                                {vehicle.website_managed && (
                                  <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300 whitespace-nowrap"> {/* FIX: Changed badge color */}
                                    Managed by Speedio
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                              <span className="font-bold text-blue-600">${vehicle.price?.toLocaleString()}</span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {vehicle.views || 0} views
                              </span>
                              <Badge variant="outline" className={`capitalize text-xs ${
                                vehicle.status === 'sold' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                vehicle.status === 'unavailable' ? 'bg-amber-50 text-amber-700 border-amber-300' : ''
                              }`}>
                                {vehicle.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-shrink-0 flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
                            <Link to={`${("/Vehicle")}?id=${vehicle.id}`} className="w-full sm:w-auto">
                              <Button variant="outline" size="sm" className="w-full justify-center">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>

                            {vehicle.website_managed ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto justify-center"
                                onClick={() => setShowVehicleEditRequestModal(vehicle)}
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
                                  <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Listing
                                  </DropdownMenuItem>
                                )}
                                {vehicle.status === 'unavailable' ? (
                                  <DropdownMenuItem
                                    onClick={() => handleMarkAsAvailable(vehicle.id)}
                                    disabled={isUpdating === vehicle.id}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {isUpdating === vehicle.id ? 'Updating...' : 'Mark as Available'}
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleMarkAsUnavailable(vehicle.id)}
                                    disabled={isUpdating === vehicle.id || vehicle.status === 'sold' || vehicle.status === 'edit_requested'}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {isUpdating === vehicle.id ? 'Updating...' : 'Mark as Unavailable'}
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleMarkAsSold(vehicle.id)}
                                  disabled={isUpdating === vehicle.id || vehicle.status === 'sold'}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  {isUpdating === vehicle.id ? 'Updating...' : 'Mark as Sold'}
                                  </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteVehicle(vehicle.id)}>
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

          <TabsContent value="transfers" className="mt-6">
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
                    {vehicleTransfers.map((transfer) => {
                      const vehicle = allUserVehiclesCombined.find(v => v.id === transfer.vehicle_id);
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

          <TabsContent value="test_drives" className="mt-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Test Drive Management
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="received" className="w-full">
                  <div className="px-4 pt-4">
                    <TabsList className="grid w-full grid-cols-2 h-auto">
                      <TabsTrigger value="received" className="text-xs sm:text-sm px-2 py-2">
                        Received ({testDriveRequests.filter(req => req.recipient_id === user.id).length})
                      </TabsTrigger>
                      <TabsTrigger value="sent" className="text-xs sm:text-sm px-2 py-2">
                        Sent ({testDriveRequests.filter(req => req.sender_id === user.id).length})
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="received" className="mt-0 p-4">
                    {listings.length === 0 && managedSaleVehicles.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">No Vehicles Listed</h3>
                        <p className="text-slate-500 text-sm">
                          Create your first vehicle listing to manage test drives.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {listings.filter(v => !v.website_managed && v.status === 'available').length > 0 && (
                          <div className="space-y-4">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <Settings className="w-5 h-5" />
                                Self-Managed Vehicles
                              </h4>
                              <p className="text-sm text-blue-700">
                                Set test drive availability for vehicles you manage directly. You'll handle all test drive requests and scheduling.
                              </p>
                            </div>

                            {listings.filter(v => !v.website_managed && v.status === 'available').map(vehicle => (
                              <div key={vehicle.id} className="border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                      {vehicle.primary_image ? (
                                        <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Car className="w-6 h-6 text-slate-400" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-slate-800">{vehicle.title}</h4>
                                      <p className="text-sm text-slate-500">${vehicle.price?.toLocaleString()}</p>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        <UserIcon className="w-3 h-3 mr-1" />
                                        Self-Managed
                                      </Badge>
                                    </div>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAvailabilityVehicle(vehicle)}
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Set Availability
                                  </Button>
                                </div>
                              </div>
                            ))}

                            <div className="mt-6">
                              <h5 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <MessageCircle className="w-4 h-4 text-purple-500" />
                                Recent Test Drive Activity
                              </h5>
                              {testDriveRequests.filter(req => req.recipient_id === user.id && !getVehicleById(req.vehicle_id)?.website_managed).length > 0 ? (
                                <div className="space-y-3">
                                  {testDriveRequests.filter(req => req.recipient_id === user.id && !getVehicleById(req.vehicle_id)?.website_managed).slice(0, 5).map(request => {
                                    const vehicle = getVehicleById(request.vehicle_id);
                                    const requester = getBuyerById(request.sender_id);

                                    return (
                                      <div
                                        key={request.id}
                                        className="border rounded-lg p-3 bg-slate-50 border-slate-200"
                                      >
                                        <div className="flex items-center gap-4">
                                          <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            {vehicle.primary_image ? (
                                              <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                            ) : (
                                              <Car className="w-6 h-6 text-slate-400 m-auto" />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                                                <UserIcon className="w-4 h-4" />
                                              </div>
                                              <div>
                                                <p className="font-semibold text-slate-800 truncate">{requester.full_name}</p>
                                                {request.test_drive_details?.preferred_date && request.test_drive_details?.preferred_time && (
                                                  <p className="text-xs text-slate-500">
                                                    {format(new Date(request.test_drive_details.preferred_date), 'MMM d, yyyy')} @ {request.test_drive_details.preferred_time}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); setShowTestDriveDetails(request); }}>View Details</Button>
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                                  <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                              </DropdownMenuTrigger>
                                              <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleApproveTestDrive(request.id); }} className="text-emerald-600">
                                                  <CheckCircle className="mr-2 h-4 w-4" />
                                                  Approve Request
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleCancelTestDrive(request.id); }} className="text-red-600">
                                                  <XCircle className="mr-2 h-4 w-4" />
                                                  Mark as Cancelled
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {testDriveRequests.filter(req => req.recipient_id === user.id && !getVehicleById(req.vehicle_id)?.website_managed).length > 5 && (
                                    <div className="text-center py-2">
                                      <Link to={("/Messages")}>
                                        <Button variant="link" size="sm">
                                          View All Test Drive Requests
                                        </Button>
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <p className="text-slate-500 text-sm text-center py-4">
                                  No test drive requests yet.
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {managedSaleVehicles.filter(v => v.website_managed).length > 0 && (
                          <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <h4 className="font-semibold text-emerald-800 mb-2 flex items-center gap-2">
                                <Handshake className="w-5 h-5" />
                                Speedio-Managed Vehicles
                              </h4>
                              <p className="text-sm text-emerald-700">
                                These vehicles are managed by Speedio. We handle all test drive requests, scheduling, and coordination based on the access arrangements you provided.
                              </p>
                            </div>

                            {managedSaleVehicles.filter(v => v.website_managed).map(vehicle => (
                              <div key={vehicle.id} className="border border-emerald-200 bg-emerald-50/30 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-3">
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                      {vehicle.primary_image ? (
                                        <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Car className="w-6 h-6 text-slate-400" />
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-slate-800">{vehicle.title}</h4>
                                      <p className="text-sm text-slate-500">${vehicle.price?.toLocaleString()}</p>
                                      <Badge className="bg-emerald-500 text-white text-xs mt-1">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Managed by Speedio
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        const request = testDriveRequests.find(r => r.vehicle_id === vehicle.id);
                                        if (request) {
                                          handleViewActivity(request);
                                        } else {
                                          alert("No activity to show for this vehicle yet.");
                                        }
                                      }}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      View Activity
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                    
           onClick={() => window.open(`/contact?subject=Test Drive Inquiry for ${vehicle.title} (Vehicle ID: ${vehicle.id})`, '_blank')}
                                    >
                                      <MessageCircle className="w-4 h-4 mr-2" />
                                      Message Speedio
                                    </Button>
                                  </div>
                                </div>

                                <div className="mt-3 p-3 bg-white/60 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs text-emerald-700 font-medium">
                                      <Calendar className="w-3 h-3 mr-1 inline" />
                                      Test Drive Status
                                    </p>
                                    <Badge variant="outline" className="text-xs">
                                      {Math.floor(Math.random() * 5) + 1} activities
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 mb-2">
                                    Our team manages all test drive requests for this vehicle based on the access arrangements you provided.
                                  </p>
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Recent activity:</span>
                                    <span className="text-emerald-600 font-medium">
                                      Last test drive: {format(new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), 'MMM d')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="sent" className="mt-0 p-4">
                    <div className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                          <Car className="w-5 h-5" />
                          Your Test Drive Requests
                        </h4>
                        <p className="text-sm text-purple-700">
                          Track the status of test drive requests you've submitted for other vehicles.
                        </p>
                      </div>

                      {testDriveRequests.filter(req => req.sender_id === user.id).length > 0 ? (
                        <div className="space-y-3">
                          {testDriveRequests.filter(req => req.sender_id === user.id).map(request => {
                            const vehicle = getVehicleById(request.vehicle_id);
                            const seller = getBuyerById(request.recipient_id);
                            return (
                              <div
                                key={request.id}
                                className="border rounded-lg p-4 bg-slate-50 border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                                onClick={() => setViewingSentTestDrive(request)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-4 items-center">
                                    <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                                      {vehicle.primary_image ? (
                                        <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                      ) : (
                                        <Car className="w-6 h-6 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-slate-800">{vehicle.title}</p>
                                      <p className="text-xs text-slate-500">
                                        To: {seller?.full_name || 'Unknown Seller'} • {format(new Date(request.created_date), 'MMM d')}
                                      </p>
                                      {request.test_drive_details?.preferred_date && (
                                        <p className="text-xs text-slate-600 mt-1">
                                          Requested for {format(new Date(request.test_drive_details.preferred_date), 'MMM d, yyyy')}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <Badge className={`text-sm capitalize ${
                                      request.test_drive_details?.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        request.test_drive_details?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                          request.test_drive_details?.status === 'declined' ? 'bg-red-100 text-red-800' :
                                            'bg-amber-100 text-amber-800'
                                      }`}>
                                      {request.test_drive_details?.status || 'pending'}
                                    </Badge>
                                    <div className="mt-1">
                                      <Button variant="ghost" size="sm" onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingSentTestDrive(request);
                                      }}>
                                        View Details
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Car className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-slate-600 mb-2">No Test Drive Requests Sent</h3>
                          <p className="text-slate-500 text-sm">
                            You haven't requested any test drives yet.
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managed_sales" className="mt-6 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-emerald-500" />
                  Managed Sale Vehicles
                </CardTitle>
                <Button
                  onClick={() => {
                    setEditingRequest(null);
                    setShowRequestForm(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  disabled={!canPostVehicle()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Managed Sale
                </Button>
              </CardHeader>
              <CardContent>
                {managedSaleVehicles.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Handshake className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium mb-1">No Managed Sale Vehicles</p>
                    <p className="text-sm">Vehicles sold through our managed service will appear here.</p>
                    <Link to={("/Managed-Sales")} className="mt-4 inline-block">
                      <Button variant="outline">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Request Managed Sale
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {managedSaleVehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="border border-slate-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-16 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                {vehicle.primary_image ? (
                                  <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-full object-cover" />
                                ) : (
                                  <Car className="w-8 h-8 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-800">{vehicle.title}</h3>
                                <p className="text-lg font-bold text-blue-600">${vehicle.price?.toLocaleString()}</p>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <MapPin className="w-4 h-4" />
                                  {vehicle.location}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Badge className={
                                vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                                  vehicle.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    vehicle.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                                      'bg-slate-100 text-slate-800'
                              }>
                                {vehicle.status}
                              </Badge>
                              <div className="text-xs text-slate-500">
                                <Eye className="w-3 h-3 inline mr-1" />
                                {vehicle.views || 0} views
                              </div>
                            </div>
                          </div>

                          <div className="text-sm text-slate-600">
                            <p className="mb-2">{vehicle.description}</p>
                            <p className="text-xs text-slate-500">
                              Listed {format(new Date(vehicle.created_date), 'MMM d, yyyy')}
                            </p>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Link to={(`/Vehicle?id=${vehicle.id}`)}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-2" />
                                View Listing
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <VehicleAnalytics vehicles={listings} messages={messages} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    Seller Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-1">Profile Settings</h4>
                      <p className="text-sm text-slate-600 mb-2">Manage your seller profile and verification status</p>
                      <Link to={("/Profile")}>
                        <Button variant="outline" size="sm">Edit Profile</Button>
                      </Link>
                    </div>
                    <div className="p-3 border border-slate-200 rounded-lg">
                      <h4 className="font-semibold text-slate-800 mb-1">Subscription & Billing</h4>
                      <p className="text-sm text-slate-600 mb-2">View and manage your subscription plan and payment details</p>
                      <Link to={("/ManageSubscription")}>
                        <Button variant="outline" size="sm">Manage Subscription</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <NotificationSettings user={user} onUpdate={loadSellerData} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Upgrade Recommendation for Private Sellers */}
        {upgradeRec.show && (
          <Card className="bg-gradient-to-br from-slate-50/80 to-blue-50/40 border border-slate-200/50 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">
                    {upgradeRec.title}
                  </h3>
                  <p className="text-slate-600 mb-4">
                    {upgradeRec.description}
                  </p>

                </div>
                <div className="flex-shrink-0">
                  <Link to={("/Subscription")}>
                    <Button className={`bg-gradient-to-r ${upgradeRec.gradient} hover:from-purple-600 hover:to-blue-600 text-lg px-6 py-3`}>
                      <TrendingUp className="w-5 h-5 mr-2" />
                      {upgradeRec.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals - Keep outside wrapper */}
      {showCreateModal && (
        <CreateVehicleModal
          isOpen={showCreateModal}
          vehicleToEdit={editingVehicle}
          onVehicleCreated={editingVehicle ? handleUpdateVehicle : handleCreateVehicle}
          onClose={() => {
            setShowCreateModal(false);
            setEditingVehicle(null);
          }}
          user={user}
          isSubmitting={isSubmitting}
        />
      )}

      <AnimatePresence>
        {showRequestForm && (
          <ManagedSalesRequestForm
            requestToEdit={editingRequest}
            onClose={() => {
              setShowRequestForm(false);
              setEditingRequest(null);
            }}
            onSuccess={handleFormSuccess}
            onUpdateRequest={handleUpdateRequest}
            isSubmittingEdit={isSubmittingEdit}
            user={user}
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

      {!isLoading && (
        <>
          {showDetailsModal && viewingRequest && (
            <ManagedSaleDetailsModal
              isOpen={showDetailsModal}
              request={viewingRequest}
              onClose={() => setShowDetailsModal(false)}
              onEdit={() => handleEditRequest(viewingRequest)}
              onCancel={() => handleCancelRequest(viewingRequest)}
            />
          )}

          <AnimatePresence>
            {showTestDriveDetails && (
              <TestDriveDetailsModal
                isOpen={!!showTestDriveDetails}
                request={showTestDriveDetails}
                onClose={() => setShowTestDriveDetails(null)}
                onApprove={handleApproveTestDrive}
                onDecline={handleDeclineTestDrive}
                onComplete={handleMarkAsCompleted}
                onEdit={() => {
                  setEditingTestDriveRequest(showTestDriveDetails);
                  setShowTestDriveDetails(null);
                }}
                getBuyerById={getBuyerById}
                getVehicleById={getVehicleById}
                user={user}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {viewingActivity && (
              <SellerTestDriveReportViewModal
                isOpen={!!viewingActivity}
                activityData={viewingActivity}
                onClose={() => setViewingActivity(null)}
              />
            )}
          </AnimatePresence>
        </>
      )}

      <EditTestDriveRequestModal
        isOpen={!!editingTestDriveRequest}
        request={editingTestDriveRequest}
        onClose={() => setEditingTestDriveRequest(null)}
        onSave={handleUpdateTestDriveRequest}
      />

      <AnimatePresence>
        {showVehicleEditRequestModal && (
          <VehicleEditRequestModal
            isOpen={!!showVehicleEditRequestModal}
            vehicle={showVehicleEditRequestModal}
            onClose={() => setShowVehicleEditRequestModal(null)}
            onSubmit={handleVehicleEditRequestSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingSentTestDrive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={() => setViewingSentTestDrive(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Button variant="ghost" size="icon" className="absolute top-3 right-3" onClick={() => setViewingSentTestDrive(null)}>
                <X className="w-5 h-5" />
              </Button>

              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-purple-700">
                <Calendar className="w-6 h-6" /> Your Test Drive Request
              </h2>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Car className="w-5 h-5 text-slate-600" /> Vehicle
                  </h3>
                  {(() => {
                    const vehicle = getVehicleById(viewingSentTestDrive.vehicle_id);
                    return (
                      <>
                        {vehicle.primary_image && (
                          <img src={vehicle.primary_image} alt={vehicle.title} className="w-full h-32 object-cover rounded-md mb-2" />
                        )}
                        <p className="text-md font-medium text-slate-800">{vehicle?.title || 'N/A'}</p>
                        <p className="text-sm text-slate-600">
                          <strong>Price:</strong> ${vehicle?.price?.toLocaleString() || 'N/A'}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-slate-600" /> Seller
                  </h3>
                  {(() => {
                    const seller = getBuyerById(viewingSentTestDrive.recipient_id);
                    return (
                      <>
                        <p className="text-md font-medium text-slate-800">{seller.full_name || 'Unknown Seller'}</p>
                        <p className="text-sm text-slate-600 flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" /> {seller.email || 'N/A'}
                        </p>
                      </>
                    );
                  })()}
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-600" /> Request Details
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700">
                      <strong>Requested Date:</strong> {viewingSentTestDrive.test_drive_details?.preferred_date ? format(new Date(viewingSentTestDrive.test_drive_details.preferred_date), 'EEE, MMM d, yyyy') : 'N/A'}
                    </p>
                    <p className="text-sm text-slate-700">
                      <strong>Requested Time:</strong> {viewingSentTestDrive.test_drive_details?.preferred_time || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-700">
                      <strong>Location:</strong> {viewingSentTestDrive.test_drive_details?.location || 'N/A'}
                    </p>
                    <div className="pt-2">
                      <p className="text-sm font-medium text-slate-700 mb-1">Your Notes:</p>
                      <div className="bg-white border border-slate-200 rounded-md p-3 min-h-[60px]">
                        {viewingSentTestDrive.test_drive_details?.notes ? (
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{viewingSentTestDrive.test_drive_details.notes}</p>
                        ) : (
                          <p className="text-sm text-slate-500 italic">No notes provided</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <strong>Status:</strong>
                    <Badge className={`text-sm capitalize ${
                      viewingSentTestDrive.test_drive_details?.status === 'approved' ? 'bg-green-100 text-green-800' :
                        viewingSentTestDrive.test_drive_details?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          viewingSentTestDrive.test_drive_details?.status === 'declined' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                      }`}>
                      {viewingSentTestDrive.test_drive_details?.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex flex-wrap gap-3 justify-end">
                  {(() => {
                    const seller = getBuyerById(viewingSentTestDrive.recipient_id);
                    const vehicle = getVehicleById(viewingSentTestDrive.vehicle_id);
                    if (seller && vehicle) {
                      return (
                        <Link to={(`/Messages?recipientId=${seller.user_id}&vehicleId=${vehicle.id}`)}>
                          <Button variant="outline" className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" /> Message Seller
                          </Button>
                        </Link>
                      );
                    }
                    return null;
                  })()}

                  {viewingSentTestDrive.test_drive_details?.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => handleCancelSentTestDriveRequest(viewingSentTestDrive.id)}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Cancel Request
                    </Button>
                  )}

                  <Button variant="outline" onClick={() => setViewingSentTestDrive(null)}>Close</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BuyMoreSlotsModal
        isOpen={showBuyMoreSlotsModal}
        onClose={() => setShowBuyMoreSlotsModal(false)}
        currentSlots={getPrivateSellerSlotInfo() || { purchased: 0, used: 0, remaining: 0 }}
      />

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
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full relative max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 px-6 pt-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">Transfer Details</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTransfer(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <TransferProgressTracker 
                  transfer={selectedTransfer} 
                  vehicle={allUserVehiclesCombined.find(v => v.id === selectedTransfer.vehicle_id)} 
                  compact={false} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
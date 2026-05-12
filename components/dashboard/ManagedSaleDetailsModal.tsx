type ManagedSaleStatus =
  | "pending_initial_review"
  | "pending_review"
  | "approved"
  | "declined"
  | "listed"
  | "sold"
  | "edit_requested"
  | "cancellation_requested"
  | "cancelled";

type UserRow = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
};

type ManagedSaleRequestDetails = {
  id: string;
  created_date: string;
  createdAt: string | Date | null;
  status: ManagedSaleStatus;

  submitted_by_user_id: string;
  cancellation_reason?: string | null;

  user_facing_notes?: string | null;

  // Nested vehicle_details (from some records) OR flat fields (from API)
  vehicle_details?: any;
  // Flat vehicle fields from API response
  vehicle_title?: string | null;
  vehicle_make?: string | null;
  vehicle_model?: string | null;
  vehicle_year?: number | null;
  vehicle_condition?: string | null;
  vehicle_location?: string | null;
  vehicle_images?: string[];
  seller_asking_price?: string | number | null;

  access_arrangements?: any;

  service_fee_amount?: number | string | null;
  calculated_buyer_price?: number | string | null;

  edit_requests?: any[];
};
type Props = {
  isOpen: boolean;
  request: ManagedSaleRequestDetails | null;
  onClose: () => void;

  onEdit?: (request: ManagedSaleRequestDetails) => void;
  onCancel?: (request: ManagedSaleRequestDetails) => void;

  users?: UserRow[];
  currentUser?: { role?: string; email?: string } | null;

  onStatusChange?: (requestId: string, newStatus: ManagedSaleStatus, notes?: string) => void;
  onApproveEditRequest?: (request: ManagedSaleRequestDetails, editRequestIndex: number) => void;
  onDeclineEditRequest?: (request: ManagedSaleRequestDetails, editRequestIndex: number) => void;

  onMarkAsSold?: (request: ManagedSaleRequestDetails) => void;

  isLoading?: boolean;
  adminNotes?: string;
  setAdminNotes?: (v: string) => void;
  loadRequests?: () => void;

  onApproveCancellation?: (request: ManagedSaleRequestDetails) => void;
  onDeclineCancellation?: (request: ManagedSaleRequestDetails) => void;
}; 

import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label } from "@/components/ui/Label";
import {
  X,
  DollarSign,
  Car,
  Edit,
  Trash2,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
  KeyRound,
  AlertTriangle,
  User as UserIcon, // Added for Admin Info section
  JapaneseYenIcon
} from "lucide-react";
import { format } from "date-fns";

export default function ManagedSaleDetailsModal({
  isOpen,
  request,
  onClose,
  onEdit,
  onCancel,
  users = [],
  currentUser,
  onStatusChange,
  onApproveEditRequest,
  onDeclineEditRequest,
  onMarkAsSold,
  isLoading,
  adminNotes,
  setAdminNotes,
  loadRequests,
  onApproveCancellation,
  onDeclineCancellation,
}: Props): React.ReactNode {
  if (!isOpen || !request) return null;

  // Safe user lookup with fallback
  const getUserById = (userId: string) => {
    if (!users || !Array.isArray(users)) return { full_name: "Unknown User", email: "unknown@email.com" };
    return users.find((user) => user.id === userId) || { full_name: "Unknown User", email: "unknown@email.com" };
  };

  // Build vehicle_details from flat API response for consistent access
  const vehicleDetails = request.vehicle_details || {
    title: request.vehicle_title || request.vehicle_make || "Managed Sale Vehicle",
    year: request.vehicle_year,
    make: request.vehicle_make,
    model: request.vehicle_model,
    condition: request.vehicle_condition,
    location: request.vehicle_location || "",
    seller_asking_price: request.seller_asking_price,
    images: request.vehicle_images || [],
  };

  // Build access_arrangements from API response
  const access = request.access_arrangements || {};

  // Flatten recurring_availability for display
  const firstSlot = access.recurring_availability?.[0] || {};

  const isAdminView = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@speedio.com');

  const getStatusInfo = (status:ManagedSaleStatus) => {
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
          description: "Unfortunately, we couldn't approve this request. See notes for details."
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
      case 'cancellation_requested': // New case for cancellation request
        return {
          icon: <AlertTriangle className="w-3 h-3 mr-1" />,
          badgeClass: "bg-purple-100 text-purple-800",
          text: "Cancellation Requested",
          description: "The user has requested to cancel this managed sale. Review and take action."
        };
      default:
        return {
          icon: null,
          badgeClass: "bg-slate-100",
          text: status || 'Unknown',
          description: ""
        };
    }
  };

  const renderChangeValue = (value: any, field: string) => {
    if (field === "seller_asking_price" || field === "price") {
      return `$${Number(value)?.toLocaleString()}`;
    }
    if (typeof value === "object" && value !== null) {
      return (
        <pre className="text-xs bg-slate-200 p-2 rounded whitespace-pre-wrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return value || "Not set";
  };

  const statusInfo = getStatusInfo(request.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20  p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">
            {isAdminView ? 'Admin Review: ' : ''}Managed Sale Request Details
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Admin Info Section */}
          {isAdminView && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Request Owner</span>
                </div>
                <p className="text-sm text-blue-700">
                  {getUserById(request.submitted_by_user_id).full_name} ({getUserById(request.submitted_by_user_id).email})
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Submitted: {format(new Date(request.created_date), 'PPP')}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Request Section */}
                    {request.status === 'cancellation_requested' && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Cancellation Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-slate-700 mb-3">
                      The user has requested to cancel this managed sale request.
                    </p>
                    {request.cancellation_reason && (
                      <div className="bg-slate-50 p-3 rounded border">
                        <label className="text-xs text-slate-500 uppercase tracking-wider">
                          Cancellation Reason:
                        </label>
                        <p className="text-sm text-slate-700 mt-1">{request.cancellation_reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => onDeclineCancellation && onDeclineCancellation(request)}
                      disabled={isLoading}
                      className="text-slate-600 border-slate-300 hover:bg-slate-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline Cancellation
                    </Button>
                    <Button
                      onClick={() => onApproveCancellation && onApproveCancellation(request)}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Cancellation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Edit Requests Section - Only show if there are edit requests */}
          {request.edit_requests && request.edit_requests.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                  <Edit className="w-5 h-5" />
                  Pending Edit Requests ({request.edit_requests.filter(er => er.status === 'pending').length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {request.edit_requests
                  .filter(editReq => editReq.status === 'pending')
                  .map((editReq, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-amber-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-slate-800">Edit Request #{index + 1}</h4>
                          <p className="text-xs text-slate-500">
                            Requested: {format(new Date(editReq.requested_at), 'PPP')}
                          </p>
                        </div>
                        <Badge className="bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Review
                        </Badge>
                      </div>

                      <div className="space-y-3 mb-4">
                        <h5 className="font-medium text-slate-700">Requested Changes:</h5>
                        <div className="grid gap-3">
                          {Object.entries(editReq.requested_changes || {}).map(([field, newValue]) => {
                            // Use nullish coalescing operator (??) to correctly handle 0 or false as valid current values
                            const currentValue = vehicleDetails?.[field] ?? access?.[field];

                            return (
                              <div key={field} className="bg-slate-50 p-3 rounded border">
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                                  {field.replace(/_/g, ' ')}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-red-600 font-medium">Current:</span>
                                    <div className="text-slate-700">{renderChangeValue(currentValue, field)}</div>
                                  </div>
                                  <div>
                                    <span className="text-green-600 font-medium">Requested:</span>
                                    <div className="text-slate-800 font-medium">{renderChangeValue(newValue, field)}</div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {isAdminView && onApproveEditRequest && onDeclineEditRequest && (
                        <div className="flex gap-3 justify-end pt-3 border-t border-amber-200">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeclineEditRequest(request, index)} // Pass index to identify which edit request
                            disabled={isLoading}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline Changes
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onApproveEditRequest(request, index)} // Pass index to identify which edit request
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve & Apply Changes
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}
                    {/* Vehicle Information */}
                    <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-24 h-20 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {vehicleDetails.images && vehicleDetails.images[0] ? (
                    <img
                      src={vehicleDetails.images[0]}
                      alt={vehicleDetails.title || "Vehicle"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="w-8 h-8 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">
                    {vehicleDetails.title || "Vehicle Details"}
                  </h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{vehicleDetails.year} {vehicleDetails.make} {vehicleDetails.model}</p>
                    <p>Condition: {vehicleDetails.condition || "N/A"}</p>
                    <p>Location: {vehicleDetails.location || "N/A"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access & Handover Arrangements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="w-5 h-5 text-blue-500" />
                Access & Handover Arrangements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <Label className="font-medium text-slate-800">Vehicle Location</Label>
                  <p className="text-slate-600">{access.vehicle_location_address || access.recurring_availability?.[0]?.address || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium text-slate-800">Vehicle Access Availability</Label>
                  <p className="text-slate-600">
                    {firstSlot.dayOfWeek ? `${firstSlot.dayOfWeek}, ${firstSlot.startTime}–${firstSlot.endTime}` : "N/A"}
                  </p>
                </div>

                <div>
                  <Label className="font-medium text-slate-800">Key Access Method</Label>
                  <p className="text-slate-600 capitalize">{(access.key_access_method || "not_specified").replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label className="font-medium text-slate-800">Key Pickup Location</Label>
                  <p className="text-slate-600">{access.key_pickup_location || "N/A"}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="font-medium text-slate-800">Key Pickup Availability / Details</Label>
                  <p className="text-slate-600">{access.key_pickup_availability || "N/A"}</p>
                  {access.key_location_details && <p className="text-slate-500 text-xs mt-1">{access.key_location_details}</p>}
                </div>

                <div>
                  <Label className="font-medium text-slate-800">Emergency Contact Name</Label>
                  <p className="text-slate-600">{access.emergency_contact_name || "N/A"}</p>
                </div>
                <div>
                  <Label className="font-medium text-slate-800">Emergency Contact Phone</Label>
                  <p className="text-slate-600">{access.emergency_contact_phone || "N/A"}</p>
                </div>

                <div className="md:col-span-2 border-t pt-4 mt-2">
                  <Label className="font-medium text-slate-800">Power of Attorney</Label>
                  <p className={`font-semibold ${access.power_of_attorney ? "text-green-600" : "text-slate-600"}`}>
                    {access.power_of_attorney ? "Yes, provided" : "Not provided"}
                  </p>
                  {access.power_of_attorney && (
                    <p className="text-slate-500 text-xs mt-1 whitespace-pre-wrap">{access.power_of_attorney_details}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="font-medium text-slate-800">Special Instructions</Label>
                  <p className="text-slate-600 whitespace-pre-wrap">{access.special_instructions || "None provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Pricing */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-800 mb-3">Status</h4>
                <Badge className={statusInfo.badgeClass}>
                  {statusInfo.icon}
                  {statusInfo.text}
                </Badge>
                <p className="text-sm text-slate-600 mt-2">{statusInfo.description}</p>
                {request.user_facing_notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{request.user_facing_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-800 mb-3">Pricing</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Your asking price:</span>
                    <span>${vehicleDetails.seller_asking_price ? Number(vehicleDetails.seller_asking_price).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service fee (6%):</span>
                    <span>${request.service_fee_amount ? Number(request.service_fee_amount).toLocaleString() : "0"}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Buyer pays:</span>
                    <span className="text-green-600">${request.calculated_buyer_price ? Number(request.calculated_buyer_price).toLocaleString() : "0"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {isAdminView ? (
              /* Admin Actions */
              <>
                {request.status === 'pending_review' && (
                  <Button
                    onClick={() => onStatusChange && onStatusChange(request.id, 'approved', 'Request approved by admin')}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                )}
                {(request.status === 'approved' || request.status === 'listed') && onMarkAsSold && (
                  <Button
                    onClick={() => onMarkAsSold(request)}
                    disabled={isLoading}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <JapaneseYenIcon className="w-4 h-4 mr-2" />
                    Mark as Sold
                  </Button>
                )}
                {onEdit && (
                  <Button
                    onClick={() => onEdit(request)}
                    variant="outline"
                    disabled={isLoading}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Admin Edit
                  </Button>
                )}
                {onCancel && ( // Admin should also be able to cancel
                  <Button
                    variant="outline"
                    onClick={() => onCancel(request)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                )}
              </>
            ) : (
              /* User Actions */
              <>
                {(request.status === 'pending_review' || request.status === 'approved' || request.status === 'listed') && onEdit && (
                  <Button
                    onClick={() => onEdit(request)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Request Edit
                  </Button>
                )}
                {(request.status === 'pending_review' || request.status === 'approved' || request.status === 'listed') && onCancel && (
                  <Button
                    variant="outline"
                    onClick={() => onCancel(request)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Request
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
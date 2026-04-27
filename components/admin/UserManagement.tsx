"use client"

import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, UserCheck, MoreHorizontal, FileText, X, Star, CheckCircle, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineModalData, setDeclineModalData] = useState(null);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserType, setNewUserType] = useState("");
  const [newVerificationStatus, setNewVerificationStatus] = useState("");
  const [NotificationEntity, setNotificationEntity] = useState(null);

  // Try to load Notification entity dynamically
  useEffect(() => {
    const loadNotificationEntity = async () => {
      try {
        const { Notification } = await import("@/entities/Notification");
        setNotificationEntity(Notification);
      } catch (e) {
        console.warn("Notification entity not yet available:", e.message);
      }
    };
    loadNotificationEntity();
  }, []);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const userList = await User.list("-created_date", 100);
    setUsers(userList);
    setIsLoading(false);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEditUserStatus = (user) => {
    setEditingUser(user);
    setNewUserType(user.user_type);
    setNewVerificationStatus(user.dealership_verification_status);
    setShowEditStatusModal(true);
  };

  const handleSaveUserStatus = async () => {
    if (!editingUser) return;

    try {
      const updateData = {
        user_type: newUserType,
        dealership_verification_status: newVerificationStatus
      };

      await User.update(editingUser.id, updateData);

      // Create notification for status change
      if (NotificationEntity) {
        try {
          await NotificationEntity.create({
            recipient_id: editingUser.id,
            type: "account_status_update",
            title: "Account Status Updated",
            content: `Your account status has been updated by an administrator. Your user type is now '${newUserType.replace('_', ' ')}' and verification status is '${newVerificationStatus.replace('_', ' ')}'.`,
            url: createPageUrl("Dashboard"), // Assuming Dashboard is a good place to direct them
            icon: "UserCheck"
          });
        } catch (notifError) {
          console.warn("Failed to create notification:", notifError);
        }
      }

      setShowEditStatusModal(false);
      setEditingUser(null);
      loadUsers();
      alert("User status updated successfully!");
    } catch (error) {
      console.error("Failed to update user status:", error);
      alert("Failed to update user status. Please try again.");
    }
  };
  
  const handleApproveUser = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Calculate expiration date (one month from now)
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const updateData = {
        dealership_verification_status: "approved",
        user_type: "dealership"
      };

      // If user has selected a tier during registration, automatically subscribe them
      if (user.dealership_selected_tier) {
        updateData.seller_subscription = {
          tier: user.dealership_selected_tier,
          expires_at: expiresAt.toISOString().split('T')[0], // First month FREE
          vehicles_sold_this_year: 0
        };
      }

      await User.update(userId, updateData);
      
      // Create notification for the user
      if (NotificationEntity) {
        try {
          await NotificationEntity.create({
            recipient_id: userId,
            type: "dealership_approved",
            title: "Dealership Application Approved! 🎉",
            content: user.dealership_selected_tier 
              ? `Congratulations! Your dealership has been approved and you've been automatically subscribed to your selected plan with the first month FREE. You can now start listing vehicles.`
              : `Congratulations! Your dealership application has been approved. You can now select a subscription plan.`,
            url: createPageUrl("Dashboard"),
            icon: "CheckCircle"
          });
        } catch (notifError) {
          console.warn("Failed to create notification:", notifError);
        }
      }
      
      loadUsers();
      setShowDetailsModal(false);
      alert(`User approved successfully! ${user.dealership_selected_tier ? 'They have been automatically subscribed with first month free.' : ''}`);
    } catch (error) {
      console.error("Failed to approve user:", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  const handleDeclineDealership = async () => {
    if (!declineModalData || !declineModalData.userId) return;
    try {
      await User.update(declineModalData.userId, {
        dealership_verification_status: "declined",
        admin_verification_notes: declineReason
      });

      // Create notification for decline
      if (NotificationEntity) {
        try {
          await NotificationEntity.create({
            recipient_id: declineModalData.userId,
            type: "dealership_declined",
            title: "Dealership Application Declined 😢",
            content: `Unfortunately, your dealership application has been declined. Reason: ${declineReason || 'No reason provided.'} Please review your information and re-apply if necessary.`,
            url: createPageUrl("Profile"),
            icon: "XCircle"
          });
        } catch (notifError) {
          console.warn("Failed to create notification for decline:", notifError);
        }
      }

      setShowDeclineModal(false);
      setDeclineReason("");
      setDeclineModalData(null);
      setShowDetailsModal(false);
      loadUsers();
      alert("Dealership application declined successfully.");
    } catch (error) {
      console.error("Failed to decline dealership:", error);
      alert("Failed to decline dealership. Please try again.");
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_review': return <Badge variant="destructive">Pending Review</Badge>;
      case 'pending_payment': return <Badge variant="secondary">Pending Payment</Badge>;
      case 'approved': return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>;
      case 'declined': return <Badge variant="outline" className="bg-red-100 text-red-800">Declined</Badge>;
      case 'not_submitted': return <Badge variant="outline">Not Submitted</Badge>;
      default: return null;
    }
  };

  const UserDetailsModal = ({ user, isOpen, onClose }) => {
    if (!user || !isOpen) return null;

    const tierInfo = user.dealership_selected_tier ? {
      tier1: { name: "Standard", price: "$99/month" },
      tier2: { name: "Professional", price: "$199/month" },
      tier3: { name: "Enterprise", price: "$349/month" }
    }[user.dealership_selected_tier] : null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold">Dealership Registration Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Selected Plan Section */}
            {tierInfo && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Star className="w-5 h-5 text-blue-600" />
                    Selected Dealership Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{tierInfo.name} Plan</h3>
                      <p className="text-slate-600">{tierInfo.price}</p>
                    </div>
                    <Badge className="bg-emerald-500 text-white">First Month FREE</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Name</Label>
                    <p className="text-slate-600">{user.full_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="text-slate-600">{user.email}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Registration Date</Label>
                    <p className="text-slate-600">{format(new Date(user.created_date), 'PPP')}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="font-medium">Business Name</Label>
                    <p className="text-slate-600">{user.business_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tax ID</Label>
                    <p className="text-slate-600">{user.tax_id_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Address</Label>
                    <p className="text-slate-600">
                      {user.business_address ? `${user.business_address}, ${user.business_city || ''}, ${user.business_state || ''} ${user.business_zip || ''}` : 'Not provided'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Uploaded Documents */}
            {user.business_license_urls && user.business_license_urls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.business_license_urls.map((url, index) => {
                      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url.split('?')[0]);
                      const fileName = url.split('/').pop().split('?')[0];
                      return (
                        <div key={index} className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex items-center gap-3">
                            {isImage ? (
                              <img src={url} alt={`Document ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                            ) : (
                              <FileText className="w-8 h-8 text-slate-500" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm truncate">{fileName}</p>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-600 hover:underline text-xs"
                              >
                                View Document
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t mt-6">
              <Button 
                onClick={() => handleApproveUser(user.id)}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={user.dealership_verification_status === 'approved'}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {user.dealership_verification_status === 'approved' ? 'Already Approved' : 'Approve Application'}
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  setDeclineModalData({ userId: user.id, userName: user.full_name });
                  setShowDeclineModal(true);
                }}
                disabled={user.dealership_verification_status === 'approved'}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Decline Application
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </TableCell>
                <TableCell><Badge>{user.user_type}</Badge></TableCell>
                <TableCell>{getStatusBadge(user.dealership_verification_status)}</TableCell>
                <TableCell>{new Date(user.created_date).toLocaleDateString()}</TableCell>
                <TableCell>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditUserStatus(user)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Edit Status
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      <UserDetailsModal 
        user={selectedUser} 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
      />

      {/* Edit User Status Modal */}
      <Dialog open={showEditStatusModal} onOpenChange={setShowEditStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Status</DialogTitle>
            <DialogDescription>
              Modify the account type and verification status for {editingUser?.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-type">User Type</Label>
              <Select id="user-type" value={newUserType} onValueChange={setNewUserType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="private_seller">Private Seller</SelectItem>
                  <SelectItem value="dealership">Dealership</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="verification-status">Verification Status</Label>
              <Select id="verification-status" value={newVerificationStatus} onValueChange={setNewVerificationStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_submitted">Not Submitted</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditStatusModal(false)}>Cancel</Button>
            <Button onClick={handleSaveUserStatus}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Decline Dealership Application</DialogTitle>
                  <DialogDescription>
                      Provide a reason for declining the application for {declineModalData?.userName}. This will be visible to the user.
                  </DialogDescription>
              </DialogHeader>
              <Textarea 
                  placeholder="e.g., Business license is expired or invalid..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
              />
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setShowDeclineModal(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={handleDeclineDealership}>Confirm Decline</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </Card>
  );
}

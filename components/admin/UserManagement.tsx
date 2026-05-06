"use client";

import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  Eye,
  FileText,
  MoreHorizontal,
  Star,
  UserCheck,
  X,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/TextArea";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

type DealershipTier = "tier1" | "tier2" | "tier3";
type VerificationStatus =
  | "pending_review"
  | "pending_payment"
  | "approved"
  | "declined"
  | "not_submitted";
type UserType = "guest" | "private_seller" | "dealership";

type SellerSubscription = {
  tier: DealershipTier;
  expires_at: string; // YYYY-MM-DD
  vehicles_sold_this_year: number;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  created_date: string; // ISO

  user_type: UserType;
  dealership_verification_status: VerificationStatus;

  dealership_selected_tier?: DealershipTier | null;
  seller_subscription?: SellerSubscription | null;

  business_name?: string | null;
  tax_id_number?: string | null;
  business_address?: string | null;
  business_city?: string | null;
  business_state?: string | null;
  business_zip?: string | null;

  business_license_urls?: string[] | null;
  admin_verification_notes?: string | null;
};

const MOCK_USERS: UserRow[] = [
  {
    id: "u_001",
    full_name: "Yuki Tanaka",
    email: "yuki@example.com",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    user_type: "guest",
    dealership_verification_status: "pending_review",
    dealership_selected_tier: "tier1",
    business_name: "Yuki Cars",
    business_license_urls: [
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=900&q=70",
    ],
  },
  {
    id: "u_002",
    full_name: "Tanmay Ahuja",
    email: "tanmay@example.com",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    user_type: "dealership",
    dealership_verification_status: "approved",
    dealership_selected_tier: "tier2",
    business_name: "Speedyo Motors",
    tax_id_number: "TX-112233",
    business_address: "1-2-3 Shibuya",
    business_city: "Tokyo",
    business_state: "Tokyo",
    business_zip: "150-0002",
    business_license_urls: [],
    seller_subscription: {
      tier: "tier2",
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10)
        .toISOString()
        .slice(0, 10),
      vehicles_sold_this_year: 2,
    },
  },
  {
    id: "u_003",
    full_name: "Hiro Sato",
    email: "hiro@example.com",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    user_type: "private_seller",
    dealership_verification_status: "not_submitted",
    dealership_selected_tier: null,
    business_license_urls: null,
  },
];

function getStatusBadge(status: VerificationStatus) {
  switch (status) {
    case "pending_review":
      return <Badge variant="destructive">Pending Review</Badge>;
    case "pending_payment":
      return <Badge variant="secondary">Pending Payment</Badge>;
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-800">Approved</Badge>;
    case "declined":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800">
          Declined
        </Badge>
      );
    case "not_submitted":
      return <Badge variant="outline">Not Submitted</Badge>;
  }
}

export default function UserManagementUI() {
  const [users, setUsers] = useState<UserRow[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [declineModalData, setDeclineModalData] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [newUserType, setNewUserType] = useState<UserType>("guest");
  const [newVerificationStatus, setNewVerificationStatus] =
    useState<VerificationStatus>("not_submitted");

  const isLoading = false;

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }, [users, searchTerm]);

  const handleViewDetails = (user: UserRow) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleEditUserStatus = (user: UserRow) => {
    setEditingUser(user);
    setNewUserType(user.user_type);
    setNewVerificationStatus(user.dealership_verification_status);
    setShowEditStatusModal(true);
  };

  const handleSaveUserStatus = () => {
    if (!editingUser) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              user_type: newUserType,
              dealership_verification_status: newVerificationStatus,
            }
          : u,
      ),
    );

    setShowEditStatusModal(false);
    setEditingUser(null);
  };

  const handleApproveUser = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        return {
          ...u,
          dealership_verification_status: "approved",
          user_type: "dealership",
          seller_subscription: u.dealership_selected_tier
            ? {
                tier: u.dealership_selected_tier,
                expires_at: expiresAt.toISOString().slice(0, 10),
                vehicles_sold_this_year: 0,
              }
            : u.seller_subscription ?? null,
        };
      }),
    );

    setShowDetailsModal(false);
  };

  const handleDeclineDealership = () => {
    if (!declineModalData) return;

    setUsers((prev) =>
      prev.map((u) =>
        u.id === declineModalData.userId
          ? {
              ...u,
              dealership_verification_status: "declined",
              admin_verification_notes: declineReason || null,
            }
          : u,
      ),
    );

    setShowDeclineModal(false);
    setDeclineReason("");
    setDeclineModalData(null);
    setShowDetailsModal(false);
  };

  const UserDetailsModal = ({
    user,
    isOpen,
    onClose,
  }: {
    user: UserRow | null;
    isOpen: boolean;
    onClose: () => void;
  }) => {
    if (!user || !isOpen) return null;

    const tiers: Record<DealershipTier, { name: string; price: string }> = {
      tier1: { name: "Standard", price: "$99/month" },
      tier2: { name: "Professional", price: "$199/month" },
      tier3: { name: "Enterprise", price: "$349/month" },
    };

    const tierInfo = user.dealership_selected_tier
      ? tiers[user.dealership_selected_tier]
      : null;

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
            {tierInfo ? (
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
            ) : null}

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
                    <p className="text-slate-600">
                      {format(new Date(user.created_date), "PPP")}
                    </p>
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
                    <p className="text-slate-600">{user.business_name || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Tax ID</Label>
                    <p className="text-slate-600">{user.tax_id_number || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Address</Label>
                    <p className="text-slate-600">
                      {user.business_address
                        ? `${user.business_address}, ${user.business_city || ""}, ${user.business_state || ""} ${user.business_zip || ""}`
                        : "Not provided"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {user.business_license_urls?.length ? (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.business_license_urls.map((url, index) => {
                      const isImage = /\.(jpg|jpeg|png|gif)$/i.test(url.split("?")[0]);
                      const fileName = url.split("/").pop()?.split("?")[0] ?? "document";

                      return (
                        <div key={index} className="border rounded-lg p-3 bg-slate-50">
                          <div className="flex items-center gap-3">
                            {isImage ? (
                              <img
                                src={url}
                                alt={`Document ${index + 1}`}
                                className="w-12 h-12 object-cover rounded"
                              />
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
            ) : null}

            <div className="flex gap-3 pt-4 border-t mt-6">
              <Button
                onClick={() => handleApproveUser(user.id)}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={user.dealership_verification_status === "approved"}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {user.dealership_verification_status === "approved"
                  ? "Already Approved"
                  : "Approve Application"}
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  setDeclineModalData({ userId: user.id, userName: user.full_name });
                  setShowDeclineModal(true);
                }}
                disabled={user.dealership_verification_status === "approved"}
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

  if (isLoading) return null;

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

                <TableCell>
                  <Badge>{user.user_type}</Badge>
                </TableCell>

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
                        <MessageSquare className="mr-2 h-4 w-4" />
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
              <Select value={newUserType} onValueChange={(v) => setNewUserType(v as UserType)}>
                <SelectTrigger id="user-type">
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
              <Select
                value={newVerificationStatus}
                onValueChange={(v) => setNewVerificationStatus(v as VerificationStatus)}
              >
                <SelectTrigger id="verification-status">
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_submitted">Not Submitted</SelectItem>
                  <SelectItem value="pending_review">Pending Review</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowEditStatusModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUserStatus}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Decline Modal */}
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
            <Button variant="ghost" onClick={() => setShowDeclineModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeclineDealership}>
              Confirm Decline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
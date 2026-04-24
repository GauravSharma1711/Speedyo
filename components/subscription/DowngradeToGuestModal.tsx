"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  AlertTriangle,
  Car,
  DollarSign,
  TrendingUp,
  Loader2,
  CheckCircle,
  Handshake,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SellerSubscription {
  stripe_subscription_id?: string;
}

interface CurrentUser {
  id: string;
  email: string;
  seller_subscription?: SellerSubscription | null;
}

interface DowngradeToGuestModalProps {
  currentUser: CurrentUser;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
// Replace these URLs with your actual Next.js API route paths.

/** GET /api/vehicles?created_by=<email> */
async function fetchUserVehicles(email: string) {
  const res = await fetch(
    `/api/vehicles?created_by=${encodeURIComponent(email)}`
  );
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json() as Promise<{ id: string; website_managed?: boolean }[]>;
}

/** PATCH /api/vehicles/<id> */
async function updateVehicle(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update vehicle ${id}`);
  return res.json();
}

/** PATCH /api/users/me  — updates the current user's own data */
async function updateCurrentUser(data: Record<string, unknown>) {
  const res = await fetch("/api/users/me", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

/** GET /api/public-users?user_id=<id> */
async function fetchPublicProfile(userId: string) {
  const res = await fetch(
    `/api/public-users?user_id=${encodeURIComponent(userId)}`
  );
  if (!res.ok) throw new Error("Failed to fetch public profile");
  return res.json() as Promise<{ id: string }[]>;
}

/** PATCH /api/public-users/<id> */
async function updatePublicUser(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/public-users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update public profile");
  return res.json();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DowngradeToGuestModal({
  currentUser,
  onClose,
  onSuccess,
}: DowngradeToGuestModalProps) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDowngrade = async () => {
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      // 1. Hide all direct listings (not managed sales)
      const userVehicles = await fetchUserVehicles(currentUser.email);
      const directListings = userVehicles.filter((v) => !v.website_managed);

      await Promise.all(
        directListings.map((vehicle) =>
          updateVehicle(vehicle.id, { status: "hidden" })
        )
      );

      // 2. Downgrade the authenticated user to guest
      await updateCurrentUser({
        user_type: "guest",
        seller_subscription: null,
      });

      // 3. Sync the public profile
      const publicProfiles = await fetchPublicProfile(currentUser.id);
      if (publicProfiles.length > 0) {
        await updatePublicUser(publicProfiles[0].id, { user_type: "guest" });
      }

      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to downgrade:", error);
      alert(
        "Failed to downgrade account. Please try again or contact support."
      );
      setIsProcessing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onSuccess();
  };

  // ── Success state ────────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-slate-800 mb-2">
                Downgrade Complete
              </h3>
              <p className="text-slate-600 mb-6">
                Your account has been successfully downgraded to Guest status.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  What Happened to Your Listings?
                </h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      <strong>Direct Listings:</strong> Hidden from marketplace
                      but saved in your account. They'll reappear when you
                      upgrade again.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>
                      <strong>Managed Sales:</strong> Still active and visible
                      on your Guest Dashboard.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleSuccessClose}
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/marketplace")}
                  className="w-full"
                >
                  Browse Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // ── Confirmation state ───────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-amber-50">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-6 h-6" />
              Downgrade to Guest Account
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Warning banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 font-semibold mb-2">
                ⚠️ Important: You're about to downgrade to a Guest account
              </p>
              <p className="text-amber-800 text-sm">
                This will immediately remove your seller privileges. Please
                review what you'll lose below.
              </p>
            </div>

            {/* Listings fate */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Car className="w-5 h-5" />
                What Happens to Your Listings?
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Car className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Direct Listings (Your Own Posts)
                    </p>
                    <p className="text-blue-800">
                      Will be <strong>hidden from the marketplace</strong> but{" "}
                      <strong>NOT deleted</strong>. All your listing data,
                      photos, and details are safely stored. When you upgrade
                      back to Private Seller or Dealership, your listings will
                      automatically reappear in the marketplace.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Handshake className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-900 mb-1">
                      Managed Sales Listings
                    </p>
                    <p className="text-blue-800">
                      Will <strong>remain active and visible</strong> on the
                      marketplace. You'll continue to see updates and manage
                      these through your Guest Dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What you lose */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg">
                You will lose access to:
              </h3>
              <div className="space-y-3">
                {[
                  {
                    icon: <Car className="w-5 h-5 text-red-600 mt-0.5" />,
                    title: "Create New Vehicle Listings",
                    desc: "You won't be able to post new direct listings to the marketplace",
                  },
                  {
                    icon: (
                      <DollarSign className="w-5 h-5 text-red-600 mt-0.5" />
                    ),
                    title: "Direct Selling Capabilities",
                    desc: "No ability to manage direct sales, pricing, or negotiations",
                  },
                  {
                    icon: (
                      <TrendingUp className="w-5 h-5 text-red-600 mt-0.5" />
                    ),
                    title: "Seller Dashboard & Analytics",
                    desc: "No access to sales insights, performance metrics, or test drive management for direct listings",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
                  >
                    {icon}
                    <div>
                      <p className="font-semibold text-red-900">{title}</p>
                      <p className="text-sm text-red-800">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What you keep */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-lg">
                You will keep access to:
              </h3>
              <div className="space-y-2">
                {[
                  "Browse all vehicle listings",
                  "Message sellers directly",
                  "Request test drives",
                  "Save favorite vehicles",
                  "Participate in the community feed",
                  "Manage your Managed Sales listings",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-emerald-700">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription notice */}
            {currentUser.seller_subscription?.stripe_subscription_id && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-900 font-semibold mb-1">
                  💳 About Your Subscription
                </p>
                <p className="text-purple-800 text-sm">
                  Your current subscription will be cancelled immediately. You
                  can upgrade again anytime in the future, and your hidden
                  listings will be restored.
                </p>
              </div>
            )}

            {/* Confirmation checkbox */}
            <div className="flex items-start gap-3 pt-4 border-t">
              <Checkbox
                id="confirm-downgrade"
                checked={confirmed}
                onCheckedChange={(val) => setConfirmed(Boolean(val))}
              />
              <label
                htmlFor="confirm-downgrade"
                className="text-sm text-slate-700 cursor-pointer leading-relaxed"
              >
                I understand that downgrading to Guest will hide my direct
                listings (but not delete them), remove my selling privileges,
                and that I can re-upgrade anytime to restore full access.
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t bg-slate-50">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleDowngrade}
              disabled={!confirmed || isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Downgrade"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}
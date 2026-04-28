"use client";

import React, { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Check,
  Shield,
  LogIn,
  ArrowRight,
  Building,
  Clock,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import OrderSummaryModal from "../components/checkout/OrderSummaryModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Footer from "../components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import DowngradeToGuestModal from "../components/subscription/DowngradeToGuestModal";

// ─── Route helper (replace these with your actual Next.js routes) ─────────────
const routes: Record<string, string> = {
  Dashboard: "/dashboard",
  Checkout: "/checkout",
  DealershipRegistration: "/dealership-registration",
};

function getRoute(page: string, params?: Record<string, string>): string {
  const base = routes[page] ?? `/${page.toLowerCase()}`;
  if (!params) return base;
  const qs = new URLSearchParams(params).toString();
  return `${base}?${qs}`;
}
// ─────────────────────────────────────────────────────────────────────────────

interface DealershipTier {
  name: string;
  price: string;
  features: string[];
  cta: string;
  tierId: string;
  popular?: boolean;
  type: "dealership";
}

interface Plan {
  name: string;
  price: string;
  priceUnit?: string;
  features: string[];
  cta: string;
  info?: string;
  type: "private_seller" | "guest";
}

const dealershipTiers: DealershipTier[] = [
  {
    name: "Standard",
    price: "$99",
    features: [
      "Up to 10 vehicle sales per year",
      "Unlimited active listings",
      "Standard marketplace visibility",
      "Basic analytics",
      "Email support",
    ],
    cta: "Choose Standard",
    tierId: "tier1",
    type: "dealership",
  },
  {
    name: "Professional",
    price: "$199",
    features: [
      "Up to 25 vehicle sales per year",
      "Unlimited active listings",
      "Promoted marketplace visibility",
      "Advanced analytics & reporting",
      "Priority email & chat support",
      "Featured on homepage",
    ],
    cta: "Choose Professional",
    tierId: "tier2",
    popular: true,
    type: "dealership",
  },
  {
    name: "Enterprise",
    price: "$349",
    features: [
      "Unlimited vehicle sales per year",
      "Unlimited active listings",
      "Top-tier marketplace visibility",
      "Full analytics suite",
      "Dedicated account manager",
      "API access (coming soon)",
    ],
    cta: "Choose Enterprise",
    tierId: "tier3",
    type: "dealership",
  },
];

const privateSellerPlan: Plan = {
  name: "Private Seller",
  price: "$50",
  priceUnit: "per vehicle",
  features: [
    "Pay only for vehicles you want to sell",
    "Purchase 1, 2, or 3 vehicle slots",
    "Unlimited active listings",
    "Standard marketplace visibility",
    "Secure messaging with buyers",
    "Access to seller dashboard",
  ],
  cta: "Become a Private Seller",
  info: "Perfect for individuals selling their personal vehicles. $50 per vehicle (purchase 1-3 slots at checkout).",
  type: "private_seller",
};

const guestPlan: Plan = {
  name: "Guest",
  price: "Free",
  features: [
    "Browse all vehicle listings",
    "Message sellers directly",
    "Request test drives",
    "Save favorite vehicles",
    "Access to managed sales service",
  ],
  cta: "Current Plan",
  info: "Perfect for buyers looking for their next vehicle.",
  type: "guest",
};

// ─── DealershipCard ───────────────────────────────────────────────────────────
interface DealershipCardProps {
  tier: DealershipTier;
  onSelect: (tier: DealershipTier) => void;
  currentTier: string | null;
  isCurrentPlan: boolean;
}

const DealershipCard: React.FC<DealershipCardProps> = ({
  tier,
  onSelect,
  isCurrentPlan,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
  >
    <Card
      className={`flex flex-col h-full ${
        tier.popular ? "border-2 border-blue-500 shadow-xl" : "shadow-lg"
      } ${isCurrentPlan ? "ring-2 ring-emerald-500" : ""}`}
    >
      <CardHeader className="text-center relative">
        {tier.popular && (
          <Badge className="absolute top-2 right-2 bg-blue-500">
            Most Popular
          </Badge>
        )}
        {isCurrentPlan && (
          <Badge className="absolute top-2 left-2 bg-emerald-500">
            Current Plan
          </Badge>
        )}
        <CardTitle className="text-3xl">{tier.name}</CardTitle>
        <p className="text-5xl font-bold text-blue-600 mt-4">{tier.price}</p>
        <p className="text-slate-500">per month</p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col flex-grow">
        <ul className="space-y-4 mb-8">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <Button
            className="w-full text-lg py-6"
            variant={tier.popular ? "default" : "outline"}
            onClick={() => onSelect(tier)}
            disabled={isCurrentPlan}
          >
            {isCurrentPlan ? "Current Plan" : tier.cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ─── PlanCard ─────────────────────────────────────────────────────────────────
interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isCurrentPlan: boolean;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isCurrentPlan }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
  >
    <Card
      className={`flex flex-col h-full shadow-lg ${
        isCurrentPlan ? "ring-2 ring-emerald-500" : ""
      } ${plan.type === "private_seller" ? "border-2 border-blue-200" : ""}`}
    >
      <CardHeader className="text-center relative">
        {isCurrentPlan && (
          <Badge className="absolute top-2 right-2 bg-emerald-500">
            Current Plan
          </Badge>
        )}
        {plan.type === "private_seller" && (
          <Badge className="absolute top-2 left-2 bg-blue-500">Flexible</Badge>
        )}
        <CardTitle className="text-3xl">{plan.name}</CardTitle>
        <p className="text-5xl font-bold text-blue-600 mt-4">{plan.price}</p>
        <p className="text-slate-500">
          {plan.type === "guest"
            ? "always"
            : plan.type === "private_seller"
            ? plan.priceUnit
            : "per month"}
        </p>
      </CardHeader>
      <CardContent className="p-8 flex flex-col flex-grow">
        <ul className="space-y-4 mb-8">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-emerald-500" />
              <span className="text-slate-700">{feature}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          {plan.type === "private_seller" && isCurrentPlan ? (
            <Button
              className="w-full text-lg py-6"
              variant="default"
              onClick={() => onSelect(plan)}
            >
              Purchase More Slots <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <Button
              className="w-full text-lg py-6"
              variant={isCurrentPlan ? "outline" : "default"}
              onClick={() => onSelect(plan)}
              disabled={isCurrentPlan}
            >
              {isCurrentPlan ? "Current Plan" : plan.cta}
              {!isCurrentPlan && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SubscriptionPage() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planForSummary, setPlanForSummary] = useState<any>(null);
  const [showDowngradeModal, setShowDowngradeModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

// TODO: Replace with your actual API call e.g. GET /api/users/me
const fetchUser = async () => {
  setIsLoading(true);
  try {
    const res = await fetch("/api/users/me");
    if (!res.ok) throw new Error("Not authenticated");
    const user = await res.json();
    setCurrentUser(user);
  } catch {
    setCurrentUser(null);
  }
  setIsLoading(false);
};

  const getCurrentUserType = (): string => {
    if (!currentUser) return "guest";
    return currentUser.user_type || "guest";
  };

  const getCurrentTier = (): string | null => {
    if (!currentUser || currentUser.user_type !== "dealership") return null;
    return currentUser.seller_subscription?.tier ?? null;
  };

  const getPrivateSellerStatus = () => {
    if (!currentUser || currentUser.user_type !== "private_seller") return null;
    const purchased = currentUser.private_seller_slots?.purchased ?? 0;
    const used = currentUser.private_seller_slots?.used ?? 0;
    return { purchased, used, remaining: purchased - used };
  };

  const handlePlanSelect = async (plan: DealershipTier | Plan) => {
    // ── Guest downgrade ──────────────────────────────────────────────────────
    if (plan.type === "guest") {
      if (getCurrentUserType() === "guest") return;
      setShowDowngradeModal(true);
      return;
    }

    // ── Dealership selection ─────────────────────────────────────────────────
    if (plan.type === "dealership") {
      const currentUserType = getCurrentUserType();

      if (currentUserType !== "dealership") {
        if (!currentUser) {
          alert("Please log in to upgrade your account");
          return;
        }

        if (currentUser.verification_fee_paid === true) {
          try {
            await User.updateMyUserData({
              dealership_selected_tier: (plan as DealershipTier).tierId,
              dealership_verification_status: "approved",
            });
            router.push(
              getRoute("Checkout", {
                type: "dealership",
                tierId: (plan as DealershipTier).tierId,
                name: plan.name,
                price: plan.price,
              })
            );
          } catch (error) {
            console.error("Failed to update tier selection:", error);
          }
          return;
        }

        try {
          await User.updateMyUserData({
            dealership_verification_status: "not_submitted",
            verification_fee_paid: false,
            dealership_selected_tier: (plan as DealershipTier).tierId,
          });
        } catch (error) {
          console.error("Failed to reset verification status:", error);
        }

        router.push(getRoute("DealershipRegistration"));
        return;
      }
    }

    // ── Private Seller / dealership tier change ──────────────────────────────
    setPlanForSummary(plan);
  };

  const handleDowngradeSuccess = () => {
    setShowDowngradeModal(false);
    fetchUser();
    alert(
      "Successfully downgraded to Guest account. You can browse and buy vehicles, and re-upgrade anytime!"
    );
  };

  const shouldShowSpecialStatuses = () => {
    if (!currentUser) return false;
    const status = currentUser.dealership_verification_status;
    return (
      status &&
      status !== "not_submitted" &&
      (status === "pending_review" || status === "declined")
    );
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-slate-600 mb-6 max-w-md">
          Please log in to view subscription options and manage your account.
        </p>
        <Button
          onClick={() => router.push("https://speedio.app/login")}
          size="lg"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Login / Register
        </Button>
      </div>
    );
  }

  const currentUserType = getCurrentUserType();
  const currentTier = getCurrentTier();

  const updatedGuestPlan: Plan = {
    ...guestPlan,
    cta: currentUserType === "guest" ? "Current Plan" : "Become a Guest",
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20">
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

              {/* Header */}
              <div className="mb-8 md:mb-12">
                <div className="flex items-center relative">
                  <div className="absolute left-0">
                    <Link href={getRoute("Dashboard")}>
                      <Button variant="outline">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-1 text-center px-16 md:px-0">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-800">
                      Speedio Pricing Plans
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mt-2">
                      Choose the plan that fits your needs
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              <Card className="max-w-3xl mx-auto bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Current Status:{" "}
                        {currentUserType === "guest"
                          ? "Guest"
                          : currentUserType === "private_seller"
                          ? "Private Seller"
                          : `Dealership ${
                              currentTier
                                ? `(${currentTier.replace("tier", "Tier ")})`
                                : "(N/A)"
                            }`}
                      </h3>
                      <p className="text-sm text-blue-800">
                        {currentUserType === "guest" &&
                          "You can browse and buy vehicles. Upgrade to sell your own vehicles."}
                        {currentUserType === "private_seller" &&
                          (() => {
                            const status = getPrivateSellerStatus();
                            return `Vehicle slots: ${status!.used}/${
                              status!.purchased
                            } used (${status!.remaining} remaining). Purchase more slots anytime.`;
                          })()}
                        {currentUserType === "dealership" &&
                          "You have access to professional selling tools with annual sales limits based on your tier."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plans Tabs */}
              <Tabs defaultValue="individual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
                  <TabsTrigger value="individual">Individual Plans</TabsTrigger>
                  <TabsTrigger value="dealership">Dealership Plans</TabsTrigger>
                </TabsList>

                {/* Individual Plans */}
                <TabsContent value="individual" className="mt-8">
                  <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                    <PlanCard
                      plan={updatedGuestPlan}
                      onSelect={handlePlanSelect}
                      isCurrentPlan={currentUserType === "guest"}
                    />
                    <PlanCard
                      plan={privateSellerPlan}
                      onSelect={handlePlanSelect}
                      isCurrentPlan={currentUserType === "private_seller"}
                    />
                  </div>
                </TabsContent>

                {/* Dealership Plans */}
                <TabsContent value="dealership" className="mt-8">
                  <div className="space-y-12">
                    <div className="mb-8 text-center">
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
                        <Building className="w-4 h-4" />
                        <span className="font-medium">
                          $149 one-time registration fee + first month FREE
                        </span>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      {dealershipTiers.map((tier) => (
                        <DealershipCard
                          key={tier.tierId}
                          tier={tier}
                          onSelect={handlePlanSelect}
                          currentTier={currentTier}
                          isCurrentPlan={
                            currentUserType === "dealership" &&
                            currentTier === tier.tierId
                          }
                        />
                      ))}
                    </div>
                    {currentUserType !== "dealership" && (
                      <div className="text-center mt-6">
                        <p className="text-slate-600 mb-4">
                          Want to become a dealership? Register your business to
                          unlock professional selling features.
                        </p>
                        <Link href={getRoute("DealershipRegistration")}>
                          <Button className="bg-emerald-500 hover:bg-emerald-600">
                            <Building className="w-5 h-5 mr-2" />
                            Start Dealership Registration
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Special Statuses */}
              {shouldShowSpecialStatuses() && (
                <Card className="max-w-3xl mx-auto">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      {currentUser.dealership_verification_status ===
                        "pending_review" && (
                        <>
                          <Clock className="w-8 h-8 text-amber-500" />
                          <div>
                            <h3 className="font-semibold text-amber-900">
                              Dealership Application Under Review
                            </h3>
                            <p className="text-sm text-amber-800">
                              Your dealership registration is being reviewed.
                              You'll be notified within 2-3 business days.
                            </p>
                          </div>
                        </>
                      )}
                      {currentUser.dealership_verification_status ===
                        "declined" && (
                        <>
                          <XCircle className="w-8 h-8 text-red-500" />
                          <div>
                            <h3 className="font-semibold text-red-900">
                              Application Declined
                            </h3>
                            <p className="text-sm text-red-800">
                              {currentUser.admin_verification_notes ||
                                "Your application was declined. Please contact support."}
                            </p>
                            <Link
                              href={getRoute("DealershipRegistration")}
                              className="mt-2 inline-block"
                            >
                              <Button variant="outline" size="sm">
                                Submit New Application
                              </Button>
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Modals */}
            {planForSummary && (
              <OrderSummaryModal
                plan={planForSummary}
                onClose={() => setPlanForSummary(null)}
              />
            )}

            {showDowngradeModal && currentUser && (
              <DowngradeToGuestModal
                currentUser={currentUser}
                onClose={() => setShowDowngradeModal(false)}
                onSuccess={handleDowngradeSuccess}
              />
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
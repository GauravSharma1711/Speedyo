"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Loader2,
  ShoppingCart,
  Check,
  Tag,
  X,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { getSession } from "next-auth/react";
import { usePaymentStore } from "@/store/paymentStore";

export default function Checkout() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read params passed from OrderSummaryModal
  const typeParam     = searchParams.get("type") ?? "private_seller";
  const quantityParam = parseInt(searchParams.get("quantity") ?? "1");
  const promoParam    = searchParams.get("promoCode") ?? "";

  const { purchaseSlots, isProcessing, paymentError, paymentSuccess,
          lastReceiptUrl, clearPaymentState } = usePaymentStore();

  const [currentUser, setCurrentUser]   = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [quantity, setQuantity]         = useState(quantityParam);
  const [promoCode, setPromoCode]       = useState(promoParam);
  const [appliedPromo, setAppliedPromo] = useState(!!promoParam);
  const [errorMessage, setErrorMessage] = useState("");

  // Square card instance ref
  const cardRef      = useRef<HTMLDivElement>(null);
  const cardInstance = useRef<any>(null);
  const [sdkReady, setSdkReady] = useState(false);

  const pricePerSlot    = 50;        // $50 display price
  const pricePerSlotCents = 100;     // $1.00 for testing (in cents)
  const discount        = appliedPromo ? 0.2 : 0;
  const subtotal        = quantity * pricePerSlot;
  const discountAmount  = subtotal * discount;
  const total           = subtotal - discountAmount;
  // Actual cents to charge (testing price)
  const totalCents      = Math.round(quantity * pricePerSlotCents * (1 - discount));

  // ── Load user from session ─────────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const session = await getSession();
      setCurrentUser(session?.user ?? null);
      setIsLoadingUser(false);
    };
    loadUser();
    clearPaymentState();
  }, []);

  // ── Load Square Web SDK & mount card ──────────────────────────────────
  useEffect(() => {
    const initSquare = async () => {
      const sq = (window as any).Square;
      if (!sq) {
        setErrorMessage("Square payment SDK failed to load. Please refresh.");
        return;
      }

      try {
        const payments = sq.payments(
          process.env.NEXT_PUBLIC_SQUARE_APP_ID!,
          process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID!
        );
        const card = await payments.card();
        await card.attach(cardRef.current!);
        cardInstance.current = card;
        setSdkReady(true);
      } catch (err) {
        setErrorMessage("Failed to initialize payment form. Please refresh.");
      }
    };

    if ((window as any).Square) {
      initSquare();
    } else {
      // Wait for script to load
      const interval = setInterval(() => {
        if ((window as any).Square) {
          clearInterval(interval);
          initSquare();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  // ── Handle payment ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!cardInstance.current) {
      setErrorMessage("Payment form not ready. Please wait.");
      return;
    }

    // 1. Tokenize card via Square SDK
    let tokenResult;
    try {
      tokenResult = await cardInstance.current.tokenize();
    } catch (err) {
      setErrorMessage("Failed to process card. Please try again.");
      return;
    }

    if (tokenResult.status !== "OK") {
      setErrorMessage(
        tokenResult.errors?.[0]?.message ?? "Card tokenization failed."
      );
      return;
    }

    // 2. Send to backend via store
    const result = await purchaseSlots({
      paymentToken: tokenResult.token,
      quantity,
      promoCode: appliedPromo ? promoCode : undefined,
      amount: totalCents,
    });

    if (!result.success) {
      setErrorMessage(paymentError ?? "Payment failed.");
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === "SELLER20") {
      setAppliedPromo(true);
      setErrorMessage("");
    } else {
      setAppliedPromo(false);
      setErrorMessage("Invalid promo code");
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(false);
    setPromoCode("");
  };

  // ── Loading ────────────────────────────────────────────────────────────
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ── Success State ──────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-800">
              Payment Successful!
            </h2>
            <p className="text-slate-600">
              {quantity} slot{quantity > 1 ? "s" : ""} added to your account.
            </p>
            {lastReceiptUrl && (
              
                href={lastReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm"
              >
                View Receipt <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <Button
              className="w-full mt-4"
              onClick={() => router.push("/Dashboard")}
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Main Checkout UI ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Complete Your Purchase
          </h1>
          <p className="text-slate-600">Add vehicle slots to your account</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT — Account info + Square card form */}
          <div className="space-y-6">

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={currentUser?.full_name ?? currentUser?.name ?? ""}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={currentUser?.email ?? ""}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div>
                  <Label>Number of Slots</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setQuantity(parseInt(e.target.value) || 1)
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    ${pricePerSlot} per slot
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Square Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Square card mounts here */}
                  <div
                    ref={cardRef}
                    className="border rounded-lg p-3 min-h-[60px] bg-white"
                  />

                  {!sdkReady && !errorMessage && (
                    <p className="text-slate-400 text-xs text-center flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading payment form...
                    </p>
                  )}

                  {/* Test card hint */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                    <p className="font-semibold mb-1">Sandbox Test Card:</p>
                    <p>Card: 4111 1111 1111 1111</p>
                    <p>Expiry: 12/26 · CVV: 123 · ZIP: 12345</p>
                  </div>

                  {(errorMessage || paymentError) && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage || paymentError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isProcessing || !sdkReady}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-6"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Complete Purchase — ${total.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-400">
                    Secured by Square
                  </p>
                </form>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT — Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="flex justify-between py-3 border-b">
                  <span>Additional Slots</span>
                  <span>{quantity}x</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span>Price per slot</span>
                  <span>${pricePerSlot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-b">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between py-3 border-b text-emerald-600">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Promo Discount
                    </span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-emerald-50 px-4 rounded-lg">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Promo Code */}
                <div className="pt-4">
                  <Label>Promo Code</Label>
                  {!appliedPromo ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={promoCode}
                        disabled={isProcessing}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Enter code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyPromo}
                        disabled={!promoCode.trim()}
                      >
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg mt-2">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Check className="w-4 h-4" />
                        <span className="font-semibold">{promoCode}</span>
                        <Badge className="bg-emerald-100 text-emerald-800">
                          20% OFF
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={handleRemovePromo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Slot Info */}
                {currentUser?.private_seller_slots && (
                  <div className="bg-blue-50 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-slate-800 mb-2">
                      Current Slots
                    </h3>
                    <p className="text-sm text-slate-600">
                      Purchased: {currentUser.private_seller_slots.purchased}
                    </p>
                    <p className="text-sm text-slate-600">
                      Used: {currentUser.private_seller_slots.used}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-2">
                      Available:{" "}
                      {currentUser.private_seller_slots.purchased -
                        currentUser.private_seller_slots.used}
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
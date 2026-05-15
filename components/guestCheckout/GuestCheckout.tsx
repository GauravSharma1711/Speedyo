
"use client"

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Loader2, ShoppingCart, Check, Tag, X } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { guestPaymentService } from '@/services/guestPaymentService';

declare global {
  interface Window {
    Square?: any;
  }
}

export default function GuestCheckout() {
  const [email, setEmail]           = useState('');
  const [fullName, setFullName]     = useState('');
  const [quantity, setQuantity]     = useState(1);
  const [promoCode, setPromoCode]   = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sdkReady, setSdkReady]     = useState(false);

  // ── Same pattern as working Checkout ──
  const cardRef      = useRef<HTMLDivElement>(null);
  const cardInstance = useRef<any>(null);

  const pricePerSlot    = 8000;
  const discount        = appliedPromo ? 0.20 : 0;
  const subtotal        = pricePerSlot * quantity;
  const discountAmount  = subtotal * discount;
  const total           = subtotal - discountAmount;

  useEffect(() => {
    const initSquare = async () => {
      const sq = (window as any).Square;
      if (!sq) {
        setErrorMessage('Square payment SDK failed to load. Please refresh.');
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
      } catch (e) {
        console.error('Square init error:', e);
        setErrorMessage('Failed to initialize payment form. Please refresh.');
      }
    };

    // Square script is already loaded globally (same as Checkout page)
    if ((window as any).Square) {
      initSquare();
    } else {
      const interval = setInterval(() => {
        if ((window as any).Square) {
          clearInterval(interval);
          initSquare();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);


  const handleApplyPromo = () => {
    if (promoCode.toUpperCase().trim() === 'SELLER20') {
      setAppliedPromo(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid promo code');
      setAppliedPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(false);
    setPromoCode('');
    setErrorMessage('');
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !fullName) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (!cardInstance.current) {
      setErrorMessage('Payment form not ready. Please wait.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    let tokenResult;
    try {
      tokenResult = await cardInstance.current.tokenize();
    } catch {
      setErrorMessage('Failed to process card. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (tokenResult.status !== 'OK') {
      setErrorMessage(tokenResult.errors?.[0]?.message ?? 'Card tokenization failed.');
      setIsProcessing(false);
      return;
    }

    try {
      const response = await guestPaymentService.processPayment({
        paymentToken: tokenResult.token,
        email,
        fullName,
        quantity,
        promoCode: appliedPromo ? promoCode.toUpperCase().trim() : null,
        amount: Math.round(total), 
        paymentType: 'guest_private_seller',
      });

      if (response.success) {
        window.location.href = createPageUrl(
          `GuestOrderConfirmation?payment_id=${response.paymentId}&email=${encodeURIComponent(email)}&slots=${quantity}`
        );
      } else {
        setErrorMessage(response.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setErrorMessage('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">Complete Your Purchase</h1>
          <p className="text-slate-600">You're one step away from becoming a Private Seller on Speedyo!</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT — Contact info + Square card */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    We'll send your order confirmation and account details here
                  </p>
                </div>
                <div>
                  <Label htmlFor="quantity">Number of Vehicle Slots</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-slate-500 mt-1">¥{pricePerSlot} per slot</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* ── Square mounts here, same ref pattern as Checkout ── */}
                  <div ref={cardRef} className="border rounded-lg p-3 min-h-[60px] bg-white" />

                  {!sdkReady && !errorMessage && (
                    <p className="text-slate-400 text-xs text-center flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading payment form...
                    </p>
                  )}

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isProcessing || !sdkReady}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-6"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processing Payment...</>
                    ) : (
                      <><ShoppingCart className="w-5 h-5 mr-2" />Complete Purchase — ¥{total.toFixed(2)}</>
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-400">Secured by Square</p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-slate-600">Private Seller Slots</span>
                  <span className="font-semibold">{quantity}x</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-slate-600">Price per slot</span>
                  <span className="font-semibold">¥{pricePerSlot.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-semibold">¥{subtotal.toFixed(2)}</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between items-center py-3 border-b text-emerald-600">
                    <span className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />Promo Discount (20%)
                    </span>
                    <span className="font-semibold">-¥{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-emerald-50 px-4 rounded-lg">
                  <span className="text-lg font-bold text-slate-800">Total</span>
                  <span className="text-2xl font-bold text-blue-600">¥{total.toFixed(2)}</span>
                </div>

                {/* Promo Code */}
                <div className="pt-4">
                  <Label>Promo Code (Optional)</Label>
                  {!appliedPromo ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value); setErrorMessage(''); }}
                        placeholder="Enter code"
                        disabled={isProcessing}
                      />
                      <Button type="button" variant="outline"
                        onClick={handleApplyPromo} disabled={!promoCode.trim() || isProcessing}>
                        Apply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg mt-2">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Check className="w-4 h-4" />
                        <span className="font-semibold">{promoCode.toUpperCase()}</span>
                        <Badge className="bg-emerald-100 text-emerald-800">20% OFF</Badge>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemovePromo}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* What's Included */}
                <div className="bg-slate-50 rounded-lg p-4 mt-6">
                  <h3 className="font-semibold text-slate-800 mb-3">What's Included:</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {[
                      `${quantity} vehicle listing slot${quantity > 1 ? 's' : ''}`,
                      'Full access to Speedyo marketplace',
                      'Direct messaging with buyers',
                      'Test drive scheduling system',
                      'No commission fees on sales',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
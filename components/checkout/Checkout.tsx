"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import {
  Loader2,
  ShoppingCart,
  Check,
  Tag,
  X,
  ArrowLeft
} from 'lucide-react';

export default function Checkout() {
  const router = useRouter();

  // MOCK USER DATA
  const mockUser = {
    id: 'user_123',
    full_name: 'Gaurav Sharma',
    email: 'gaurav@example.com',
    private_seller_slots: {
      purchased: 10,
      used: 3
    }
  };

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [publicUser, setPublicUser] = useState<any>(null);

  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const pricePerSlot = 50;

  const discount = appliedPromo ? 0.2 : 0;

  const subtotal = quantity * pricePerSlot;

  const discountAmount = subtotal * discount;

  const total = subtotal - discountAmount;

  // MOCK FETCH USER
  useEffect(() => {
    const loadMockData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCurrentUser(mockUser);

      setPublicUser({
        full_name: mockUser.full_name,
        email: mockUser.email
      });
    };

    loadMockData();
  }, []);

  // MOCK PAYMENT SUBMIT
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setIsProcessing(true);

    setErrorMessage('');

    try {
      // MOCK PAYMENT DELAY
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('MOCK PAYMENT SUCCESS');

      console.log({
        user: currentUser,
        quantity,
        total,
        promoCode: appliedPromo ? promoCode : null
      });

      alert('Mock payment successful!');
    } catch (error) {
      console.error(error);

      setErrorMessage('Mock payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase().trim();

    if (code === 'SELLER20') {
      setAppliedPromo(true);

      setErrorMessage('');
    } else {
      setAppliedPromo(false);

      setErrorMessage('Invalid promo code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(false);

    setPromoCode('');
  };

  if (!currentUser || !publicUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
        onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">
            Complete Your Purchase
          </h1>

          <p className="text-slate-600">
            Add more vehicle slots to your account
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT SIDE */}
          <div className="space-y-6">

            {/* ACCOUNT INFO */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">

                <div>
                  <Label>Full Name</Label>

                  <Input
                    value={publicUser.full_name}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div>
                  <Label>Email</Label>

                  <Input
                    value={currentUser.email}
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

            {/* MOCK PAYMENT CARD */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>

              <CardContent>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* MOCK CARD UI */}
                  <div className="border rounded-lg p-4 space-y-4 bg-slate-50">

                    <div>
                      <Label>Card Number</Label>

                      <Input
                        placeholder="4111 1111 1111 1111"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                      <div>
                        <Label>Expiry</Label>

                        <Input placeholder="12/30" />
                      </div>

                      <div>
                        <Label>CVV</Label>

                        <Input placeholder="123" />
                      </div>

                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isProcessing}
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
                        Complete Purchase - ${total.toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-slate-500">
                    Mock payment system for testing UI
                  </p>

                </form>

              </CardContent>
            </Card>

          </div>

          {/* RIGHT SIDE */}
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

                    <span>
                      -${discountAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-50 to-emerald-50 px-4 rounded-lg">
                  <span className="text-lg font-bold">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* PROMO SECTION */}
                <div className="pt-4">

                  <Label>Promo Code</Label>

                  {!appliedPromo ? (
                    <div className="flex gap-2 mt-2">

                      <Input
                        value={promoCode}
                        disabled={isProcessing}
                        onChange={(e) =>
                          setPromoCode(e.target.value)
                        }
                        placeholder="Enter code"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyPromo}
                      >
                        Apply
                      </Button>

                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-lg mt-2">

                      <div className="flex items-center gap-2 text-emerald-700">

                        <Check className="w-4 h-4" />

                        <span className="font-semibold">
                          {promoCode}
                        </span>

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

                {/* SLOT INFO */}
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
                    Available:{' '}
                    {currentUser.private_seller_slots.purchased -
                      currentUser.private_seller_slots.used}
                  </p>

                </div>

              </CardContent>

            </Card>

          </div>

        </div>
      </div>
    </div>
  );
}
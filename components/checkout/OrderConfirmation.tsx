"use client"

import React, { useState, useEffect } from 'react';

import { useRouter,useSearchParams  } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Loader2, XCircle, Home, Receipt } from 'lucide-react';

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_USER = {
  id: 'usr_001',
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  private_seller_slots: {
    purchased: 5,
    used: 2,
  },
};

// Set to null to simulate guest (not logged in)
const MOCK_CURRENT_USER = MOCK_USER;

// Simulates URL params — change these to test different states:
//   payment_type: 'private_seller_payment' | 'guest_private_seller' | anything else
//   payment_id:   any string
//   quantity:     number string
//   user_email:   email string
const MOCK_PARAMS = {
  payment_type: 'private_seller_payment',
  payment_id: 'TXN-2024-A8F3C1D2',
  quantity: '3',
  user_email: 'john.doe@example.com',
};
// ─────────────────────────────────────────────────────────────────────────────

export default function OrderConfirmation() {
const router = useRouter();
const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Simulate user fetch
  useEffect(() => {
    setTimeout(() => {
      setCurrentUser(MOCK_CURRENT_USER);
    }, 300);
  }, []);

  // Simulate payment verification
  useEffect(() => {
    const verifyPayment = async () => {
      // Read from real URL params if present, else fall back to MOCK_PARAMS
 const paymentType = searchParams.get('payment_type') || MOCK_PARAMS.payment_type;
const paymentId   = searchParams.get('payment_id')   || MOCK_PARAMS.payment_id;
const quantity    = searchParams.get('quantity')      || MOCK_PARAMS.quantity;
const userEmail   = searchParams.get('user_email')    || MOCK_PARAMS.user_email;

      if (!paymentId || !paymentType) {
        setError('Invalid order confirmation. Missing payment information.');
        setIsLoading(false);
        return;
      }

      // Simulate short network delay
      await new Promise(r => setTimeout(r, 800));

      try {
        if (paymentType === 'private_seller_payment') {
          setOrderDetails({
            success: true,
            paymentType: 'private_seller',
            quantity: parseInt(quantity) || 1,
            userEmail,
            paymentId,
            message: MOCK_CURRENT_USER
              ? `Your ${quantity} vehicle slot${parseInt(quantity) > 1 ? 's have' : ' has'} been added to your account.`
              : `Your payment is confirmed! Create an account using ${userEmail} to activate your slots.`,
          });
        } else if (paymentType === 'guest_private_seller') {
          setOrderDetails({
            success: true,
            paymentType: 'guest_checkout',
            quantity: parseInt(quantity) || 1,
            userEmail,
            paymentId,
            message: `Your payment is confirmed! Create an account using ${userEmail} to activate your ${quantity} vehicle slot${parseInt(quantity) > 1 ? 's' : ''}.`,
          });
        } else {
          setOrderDetails({
            success: true,
            paymentType,
            paymentId,
            message: 'Your payment has been successfully processed.',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to confirm your payment. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, currentUser]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600 text-center">Confirming your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-red-600">Confirmation Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/subscription')}>
                Try Again
              </Button>
              <Button onClick={() => router.push('/Contact')}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderDetails) return null;

  const getOrderTitle = () => {
    if (
      orderDetails.paymentType === 'private_seller' ||
      orderDetails.paymentType === 'guest_checkout'
    ) {
      return 'Purchase Complete!';
    }
    return 'Payment Successful!';
  };

  // ── Success state ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <CardTitle className="text-3xl text-slate-800 mb-2">
            {getOrderTitle()}
          </CardTitle>
          <p className="text-slate-600">
            {orderDetails.message || 'Your payment has been successfully processed.'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Order Details */}
          <div className="bg-slate-50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-slate-800 mb-4">Order Details</h3>

            {orderDetails.quantity && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Vehicle Slots</span>
                <Badge className="bg-blue-100 text-blue-800">{orderDetails.quantity}</Badge>
              </div>
            )}

            {orderDetails.userEmail && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Email</span>
                <span className="text-slate-800">{orderDetails.userEmail}</span>
              </div>
            )}

            {orderDetails.paymentId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Transaction ID</span>
                <span className="text-slate-800 text-xs font-mono">{orderDetails.paymentId}</span>
              </div>
            )}
          </div>

          {/* Guest — next steps */}
          {!currentUser && orderDetails.paymentType === 'guest_checkout' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">📧 Check Your Email</h3>
              <p className="text-blue-800 text-sm mb-4">
                We've sent a confirmation email to{' '}
                <strong>{orderDetails.userEmail}</strong> with next steps to activate your account.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                <li>Create an account using the same email address</li>
                <li>Your vehicle slots will be automatically activated</li>
                <li>Start listing your vehicles!</li>
              </ol>
            </div>
          )}

          {/* Logged-in user — slots activated */}
          {currentUser && orderDetails.paymentType === 'private_seller' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="font-semibold text-emerald-900 mb-3">✅ Slots Activated!</h3>
              <p className="text-emerald-800 text-sm">
                Your {orderDetails.quantity} vehicle slot
                {orderDetails.quantity > 1 ? 's have' : ' has'} been added and are ready to use.
                Head to your dashboard to start listing!
              </p>
            </div>
          )}

          {/* Current slot summary (logged-in only) */}
          {currentUser?.private_seller_slots && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-800 mb-2 text-sm">Slot Summary</h3>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div>
                  <p className="text-slate-500">Purchased</p>
                  <p className="font-semibold text-slate-800">
                    {currentUser.private_seller_slots.purchased}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Used</p>
                  <p className="font-semibold text-slate-800">
                    {currentUser.private_seller_slots.used}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Available</p>
                  <p className="font-semibold text-emerald-700">
                    {currentUser.private_seller_slots.purchased -
                      currentUser.private_seller_slots.used}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push('/Dashboard')}
              className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.print()} className="flex-1">
              <Receipt className="w-4 h-4 mr-2" />
              Print Receipt
            </Button>
          </div>

          <p className="text-center text-sm text-slate-500">
            Need help?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
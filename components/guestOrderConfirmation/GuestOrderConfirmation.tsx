import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Mail, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function GuestOrderConfirmation() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const emailParam = urlParams.get('email');
    const quantityParam = parseInt(urlParams.get('quantity') || '1', 10);

    setEmail(emailParam || "");
    setQuantity(quantityParam);

    // Simulate verification delay
    setTimeout(() => {
      setIsVerifying(false);
    }, 2000);
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 flex items-center justify-center p-4">
        <Card className="max-w-md shadow-2xl border-0">
          <CardContent className="text-center p-12">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Payment...</h2>
            <p className="text-slate-600">Please wait while we confirm your purchase.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-emerald-50">Thank you for your purchase</p>
          </div>

          <CardContent className="p-8 space-y-6">
            {/* Order Details */}
            <div className="bg-slate-50 rounded-lg p-6 space-y-3">
              <h3 className="font-bold text-slate-800 text-lg mb-4">Order Details</h3>
              <div className="flex justify-between text-slate-600">
                <span>Vehicle Slots Purchased:</span>
                <span className="font-semibold text-slate-800">{quantity} slot{quantity > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email:</span>
                <span className="font-semibold text-slate-800">{email}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                What's Next?
              </h3>
              <div className="space-y-3 text-slate-600">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                  <div>
                    <p className="font-semibold text-slate-800">Check Your Email</p>
                    <p className="text-sm">We've sent a confirmation email to <strong>{email}</strong> with your receipt and next steps.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                  <div>
                    <p className="font-semibold text-slate-800">Create Your Account</p>
                    <p className="text-sm">Use the same email address to register on Speedio and your vehicle slots will be <strong>automatically activated</strong>!</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                  <div>
                    <p className="font-semibold text-slate-800">Start Selling</p>
                    <p className="text-sm">List your vehicles and connect with thousands of active buyers!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                onClick={() => window.location.href = createPageUrl("signIn")}
                className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-lg py-6"
              >
                Create Your Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link href={createPageUrl("/")} className="flex-1">
                <Button variant="outline" className="w-full text-lg py-6">
                  Back to Home
                </Button>
              </Link>
            </div>

            <div className="text-center text-sm text-slate-500 pt-4 border-t">
              <p>Need help? Contact us at <a href="mailto:support@speedio.app" className="text-blue-600 hover:underline">support@speedio.app</a></p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
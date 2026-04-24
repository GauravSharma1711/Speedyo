
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Clock, Mail } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function SuccessModal({ onClose, isOpen = true }) {
  // Prevent the modal from closing accidentally
  const handleBackdropClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
            <CardContent className="text-center py-12 px-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
              
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Request Submitted Successfully!
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Thank you for choosing our managed sales service. We've received your request and will review it within 24-48 hours.
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Next Steps:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Our team will review your submission</li>
                  <li>• We'll contact you within 1-2 business days</li>
                  <li>• Once approved, we'll create your professional listing</li>
                  <li>• We'll handle all buyer inquiries and negotiations</li>
                  <li>• You'll receive payment (minus 6% fee) when sold</li>
                </ul>
              </div>
              
              <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-emerald-800 mb-1">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold text-sm">Confirmation Email</span>
                </div>
                <p className="text-xs text-emerald-700">
                  A confirmation email with your request details and fee breakdown has been sent to your email address.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = createPageUrl("Feed")}
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                >
                  Go to Homepage
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <Button variant="outline" onClick={onClose} className="w-full">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

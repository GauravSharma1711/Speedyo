"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MessageSquare } from "lucide-react";
import FeedbackModal from "../feedback/FeedbackModal";

export default function Footer() {
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);

  return (
    <>
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo + Description */}
            <div>
              <Link href="/">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png"
                  alt="Speedyo Logo"
                  className="w-32 mb-4 brightness-0 invert"
                />
              </Link>

              <p className="text-slate-400">
                The trusted automotive marketplace and community platform.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/Marketplace" className="hover:text-white">
                    Browse Vehicles
                  </Link>
                </li>
                <li>
                  <Link href="/Feed" className="hover:text-white">
                    Community Feed
                  </Link>
                </li>
                <li>
                  <Link href="/Dashboard" className="hover:text-white">
                    Seller Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/Subscription" className="hover:text-white">
                    Pricing Plans
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/Managed-Sales" className="hover:text-white">
                    Managed Sales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dealership-managed-sales"
                    className="hover:text-white"
                  >
                    Dealership Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vehicle-transfer-guide"
                    className="hover:text-white"
                  >
                    Vehicle Transfer Guide
                  </Link>
                </li>
                <li>
                  <Link href="/warranty" className="hover:text-white">
                    Warranty
                  </Link>
                </li>
                {/* <li>
                  <Link href="/oist-portal" className="hover:text-white">
                    OIST Portal
                  </Link>
                </li> */}
                <li>
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="hover:text-white text-left"
                  >
                    Send Feedback
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-slate-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-center md:text-left">
                &copy; 2025 Speedyo. All rights reserved.
              </p>

              <Button
                onClick={() => setShowFeedbackModal(true)}
                variant="outline"
                size="sm"
                className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Share Your Feedback
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </>
  );
}
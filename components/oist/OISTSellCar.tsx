"use client"
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Handshake, DollarSign, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OISTSellCar({ onBack }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Services
      </Button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Sell Your Car on Okinawa
        </h1>
        <p className="text-lg text-slate-600">
          Choose the selling option that works best for you
        </p>
      </div>

      {/* Selling Options */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Managed Sales */}
        <Card className="bg-gradient-to-br from-emerald-50 to-white shadow-xl border-2 border-emerald-200 hover:shadow-2xl transition-all">
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-center">Managed Sales</CardTitle>
            <p className="text-center text-slate-600">Let Speedio handle everything</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Professional photography and listing creation</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Buyer screening and test drive coordination</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Complete paperwork and transfer assistance</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Safe payment processing and vehicle handover</p>
              </div>
            </div>
            <div className="pt-4">
              <Link to={createPageUrl("ManagedSales")}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                  Learn About Managed Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Private Seller */}
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-xl border-2 border-blue-200 hover:shadow-2xl transition-all">
          <CardHeader>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-center">Private Seller</CardTitle>
            <p className="text-center text-slate-600">List and manage your own sale</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Create and manage your own listing</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Communicate directly with potential buyers</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Set your own price and terms</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-slate-700">Flexible listing duration with affordable pricing</p>
              </div>
            </div>
            <div className="pt-4">
              <Link to={createPageUrl("Subscription")}>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  View Pricing & Features
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Create Your Account</h4>
                <p className="text-slate-600">Sign up for a Speedio account to access selling features</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Choose Your Selling Method</h4>
                <p className="text-slate-600">Select between full-service Managed Sales or independent Private Seller listing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-emerald-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Submit Your Vehicle Details</h4>
                <p className="text-slate-600">Provide information about your vehicle to get started</p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <a href="https://speedio.app/login">
              <Button size="lg" className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                Create Account & Get Started
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600 mb-4">
            Have questions about selling your vehicle?
          </p>
          <Link to={createPageUrl("Contact")}>
            <Button variant="outline">Contact Speedio Support</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
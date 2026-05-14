"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ExternalLink, Globe, ShoppingCart, UserPlus } from "lucide-react";
import AuthButton from "./AuthButton";

type OISTBuyCarProps = {
  onBack: () => void;
};

export default function OISTBuyCar({ onBack }: OISTBuyCarProps) {
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
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Buy a Car in Okinawa</h1>
        <p className="text-lg text-slate-600">
          Discover verified vehicles and connect with trusted sellers
        </p>
      </div>

      {/* How Speedio Helps */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl">How Speedio Can Help You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Browse Verified Listings</h4>
                <p className="text-slate-600">Access our curated marketplace of quality vehicles on Okinawa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Direct Seller Communication</h4>
                <p className="text-slate-600">Message sellers directly to ask questions and schedule car viewing</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Transparent Pricing</h4>
                <p className="text-slate-600">See detailed vehicle information and fair market prices</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Where to Find Vehicles */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Speedio Marketplace */}
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-xl border-0 flex flex-col">
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Speedio Marketplace</h3>
            </div>
            <p className="text-slate-600 mb-6 flex-1">
              Browse our curated collection of vehicles with detailed specifications, photos, and seller information.
            </p>
            <Button
              asChild
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Link href="/Marketplace">Browse Marketplace</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Facebook Marketplace */}
        <Card className="bg-gradient-to-br from-blue-50 to-white shadow-xl border-0 flex flex-col">
          <CardContent className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Facebook Marketplace</h3>
            </div>
            <p className="text-slate-600 mb-6 flex-1">
              Visit our dedicated Facebook Marketplace profile for additional listings and community updates.
            </p>
            <a href="https://www.facebook.com/marketplace/profile/738877393/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Facebook Profile
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Create Guest Account CTA */}
      <Card className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-xl border-0">
        <CardContent className="p-6 text-center">
          <UserPlus className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Create a Guest Account</h3>
          <p className="mb-6 text-blue-50">
            Sign up for free to save your favorite vehicles, message sellers, and get notified of new listings that match your preferences.
          </p>
          <AuthButton size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            Create Account
          </AuthButton>
        </CardContent>
      </Card>

      {/* Need Help */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-6 text-center">
          <p className="text-slate-600 mb-4">
            Need assistance with the buying process or have questions?
          </p>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Speedio Support</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
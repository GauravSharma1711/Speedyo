"use client"

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback } from "react";
import { profileService } from "@/services/profile/profileServices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input"; 
import { Label } from "@/components/ui/Label";
import {
  Handshake,
  CheckCircle,
  XCircle,
  DollarSign,
  Clock,
  Eye,
  Camera,
  Users,
  MapPin,
  User as UserIcon, 
  ArrowLeft, 
  Info
} from "lucide-react";

import Link from "next/link";

import { AnimatePresence } from "framer-motion";

import SimpleManagedSaleForm from "../../components/manageSales/SimpleManagedSaleForm";
import SuccessModal from "../../components/manageSales/SuccessModal";
import LocationVerification from "../../components/manageSales/LocationVerification";
import Footer from '../../components/layout/Footer';

export default function ManagedSalesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [showLocationVerification, setShowLocationVerification] = useState(false);
  const [loadError, setLoadError] = useState<any>(null);

  const checkOkinawaLocation = useCallback((locationString: string) => {
    if (!locationString) return false;
    const lowerLocation = locationString.toLowerCase();
    return (
      lowerLocation.includes('okinawa') ||
      (lowerLocation.includes('japan') && lowerLocation.includes('okinawa')) ||
      lowerLocation.includes('沖縄')
    );
  }, []);

  const loadUserData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const user = await profileService.me();
      setCurrentUser(user);

      if ((user as any)?.location) {
        const isValidLocation = checkOkinawaLocation((user as any).location);
        setIsLocationVerified(isValidLocation);
      }
    } catch (error) {
      console.log("User not authenticated - showing public view");
      setCurrentUser(null);
    }
    setIsLoading(false);
  }, [checkOkinawaLocation]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleRequestSubmitted = () => {
    setShowRequestForm(false);
    setShowSuccessModal(true);
    loadUserData();
  };

  const handleLocationVerification = (isVerified: boolean, userLocation: string) => {
    setIsLocationVerified(isVerified);
    setShowLocationVerification(false);

    if (isVerified) {
      setShowRequestForm(true);
    }
  };

  const handleStartRequest = () => {
    if (!currentUser) {
      router.push("/signIn");
      return;
    }

    if (!isLocationVerified) {
      setShowLocationVerification(true);
      return;
    }

    setShowRequestForm(true);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending_review':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-amber-100 text-amber-800",
          text: "Under Review"
        };
      case 'approved':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-blue-100 text-blue-800",
          text: "Approved"
        };
      case 'listed':
        return {
          icon: <Eye className="w-4 h-4" />,
          color: "bg-emerald-100 text-emerald-800",
          text: "Listed"
        };
      case 'declined':
        return {
          icon: <XCircle className="w-4 h-4" />,
          color: "bg-red-100 text-red-800",
          text: "Declined"
        };
      case 'sold':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: "bg-green-100 text-green-800",
          text: "Sold"
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: "bg-slate-100 text-slate-800",
          text: status
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <div className="flex flex-col min-h-screen">
        {/* Main Content */}
        <div className="flex-1">
          {/* Hero Section */}
          <div className="text-center py-6 md:py-16 px-4 bg-white/50 backdrop-blur-sm">
            {/* Header with Back Button */}
            <div className="mb-6 md:mb-12">
              <div className="max-w-6xl mx-auto">
                {/* Back button - Better mobile positioning */}
                <div className="mb-4 text-left md:absolute md:left-0">
                  <Link href="/Dashboard">
                    <Button variant="outline" size="sm" className="md:size-default">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Back</span>
                    </Button>
                  </Link>
                </div>

                {/* Title + subtitle */}
                <div className="text-center">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 mb-3 md:mb-4 px-2">
                    Managed Sales Service
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-6 px-2">
                    Let Speedyo handle everything. We'll sell your car while you relax.
                  </p>

                  {/* Quick Action Button */}
                  <div className="flex justify-center mt-6 md:mt-8 px-4">
                    {currentUser ? (
                      <Button
                        onClick={handleStartRequest}
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 md:py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <Handshake className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                        <span className="hidden sm:inline">Start Your Managed Sale Request</span>
                        <span className="sm:hidden">Start Request</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/signIn")}
                        size="lg"
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 md:py-6 shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                        Login to Request Service
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Geographic Restriction Alert */}
            <div className="max-w-2xl mx-auto px-2">
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="text-left sm:text-center flex-1">
                      <p className="font-semibold text-amber-800 text-sm sm:text-base">Currently Available in Okinawa, Japan Only</p>
                      <p className="text-xs sm:text-sm text-amber-700 mt-0.5">Our managed sales team operates exclusively in Okinawa Prefecture</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-3 sm:p-4 md:p-6">
            {/* Service Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Professional Photography</h3>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    High-quality photos and detailed inspections to showcase your vehicle perfectly.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Expert Negotiations</h3>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Our team handles all buyer inquiries, negotiations, and test drive coordination.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm shadow-lg sm:col-span-2 md:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-2 text-sm sm:text-base">Secure Transactions</h3>
                  <p className="text-slate-600 text-xs sm:text-sm">
                    Safe payment processing and paperwork handling from start to finish.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Card */}
            <Card className="bg-gradient-to-br from-white to-emerald-50/30 border-2 border-emerald-200 shadow-xl">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2 sm:mb-3">Simple, Transparent Pricing</h2>
                  <p className="text-slate-600 text-sm sm:text-base md:text-lg">No hidden fees. Pay only when your vehicle sells.</p>
                </div>

                {/* Service Fee Structure */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
                  {/* $500 - $3,000 */}
                  <div className="group relative bg-white rounded-xl p-4 sm:p-6 border-2 border-slate-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white text-xs font-bold px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
                        Affordable
                      </div>
                    </div>
                    <div className="text-center mt-3 sm:mt-4">
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 sm:mb-2">Vehicles</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">$500 - $3,000</p>
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3 sm:mb-4"></div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                        $300-$500
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Scaled Fee</p>
                      <p className="text-xs text-slate-500">Increases gradually as price rises</p>
                    </div>
                  </div>

                  {/* $3,001 - $8,333 */}
                  <div className="group relative bg-white rounded-xl p-4 sm:p-6 border-2 border-emerald-300 hover:border-emerald-500 transition-all duration-300 hover:shadow-xl shadow-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-bold px-3 sm:px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                        Flat Fee
                      </div>
                    </div>
                    <div className="text-center mt-3 sm:mt-4">
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 sm:mb-2">Vehicles</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">$3,001 - $8,333</p>
                      <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent mb-3 sm:mb-4"></div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                        $500
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Flat Fee</p>
                      <p className="text-xs text-slate-500">Simple and predictable pricing</p>
                    </div>
                  </div>

                  {/* $8,334+ */}
                  <div className="group relative bg-white rounded-xl p-4 sm:p-6 border-2 border-slate-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg sm:col-span-2 md:col-span-1">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-bold px-3 sm:px-4 py-1 rounded-full whitespace-nowrap">
                        Premium Sales
                      </div>
                    </div>
                    <div className="text-center mt-3 sm:mt-4">
                      <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1 sm:mb-2">Vehicles</p>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">$8,334+</p>
                      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3 sm:mb-4"></div>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                        6%
                      </p>
                      <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Service Fee</p>
                      <p className="text-xs text-slate-500">Percentage-based for high-value vehicles</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Pricing Calculator */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-200 mb-6 sm:mb-8">
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">Calculate Your Service Fee</h3>
                    <p className="text-slate-600 text-sm sm:text-base">Enter your vehicle's listing price to see the breakdown</p>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-md border border-slate-200">
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <Label htmlFor="calculator-price" className="text-sm sm:text-base font-semibold text-slate-700 mb-2 sm:mb-3 block">
                            Your Asking Price
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg sm:text-xl font-semibold">$</span>
                            <Input
                              id="calculator-price"
                              type="number"
                              placeholder="25,000"
                              className="pl-8 sm:pl-10 pr-3 sm:pr-4 text-lg sm:text-xl h-12 sm:h-14 border-2 border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-lg"
                              onChange={(e) => {
                                const askingPrice = parseInt(e.target.value) || 0;
                                const calculateFee = (p: number): number => {
                                  if (p < 500) return 300;
                                  if (p <= 3000) return Math.round(300 + (p - 500) * 0.08);
                                  if (p <= 8333) return 500;
                                  return Math.round(p * 0.06);
                                };
                                
                                if (askingPrice > 0) {
                                  const fee = calculateFee(askingPrice);
                                  const listingPrice = askingPrice + fee;
                                  const feePercentage = ((fee / listingPrice) * 100).toFixed(2);
                                  
                                  const display = document.getElementById('calculator-results');
                                  if (display) {
                                    display.innerHTML = `
                                      <div class="space-y-3 sm:space-y-4">
                                        <div class="flex flex-col sm:flex-row justify-between sm:items-center py-2 sm:py-3 border-b border-slate-200 gap-1 sm:gap-0">
                                          <span class="text-slate-600 font-medium text-sm sm:text-base">Your Asking Price:</span>
                                          <span class="text-xl sm:text-2xl font-bold text-slate-800">$${askingPrice.toLocaleString()}</span>
                                        </div>
                                        <div class="flex flex-col sm:flex-row justify-between sm:items-center py-2 sm:py-3 gap-2 sm:gap-0">
                                          <div>
                                            <span class="text-slate-600 font-medium block text-sm sm:text-base">Service Fee</span>
                                            <span class="text-xs text-slate-500">${
                                              askingPrice < 500 ? '$300 minimum' :
                                              askingPrice <= 3000 ? 'Scales $300-$500' :
                                              askingPrice <= 8333 ? '$500 flat' : '6% of asking price'
                                            }</span>
                                          </div>
                                          <div class="text-left sm:text-right">
                                            <span class="text-xl sm:text-2xl font-bold text-blue-600">+$${fee.toLocaleString()}</span>
                                            <span class="text-xs text-blue-500 block">(${feePercentage}%)</span>
                                          </div>
                                        </div>
                                        <div class="flex flex-col sm:flex-row justify-between sm:items-center py-3 sm:py-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl px-4 sm:px-6 border-2 border-emerald-300 shadow-sm gap-1 sm:gap-0">
                                          <span class="text-base sm:text-lg font-bold text-emerald-800">Vehicle Listed At:</span>
                                          <span class="text-2xl sm:text-3xl font-extrabold text-emerald-800">$${listingPrice.toLocaleString()}</span>
                                        </div>
                                        <div class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-3 sm:p-4 mt-3 sm:mt-4">
                                          <p class="text-xs sm:text-sm text-blue-800 leading-relaxed">
                                            <strong>How it works:</strong> Your vehicle will be listed at $${listingPrice.toLocaleString()}. When it sells, you receive your full asking price of $${askingPrice.toLocaleString()}. The service fee is included in the buyer's price.
                                          </p>
                                        </div>
                                      </div>
                                    `;
                                    display.classList.remove('hidden');
                                  }
                                } else {
                                  const display = document.getElementById('calculator-results');
                                  if (display) {
                                    display.classList.add('hidden');
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                        
                        <div id="calculator-results" className="hidden">
                          {/* Results will be dynamically inserted here */}
                        </div>
                        
                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 leading-relaxed">
                              <strong>No upfront payment required.</strong> Enter your asking price above. The service fee will be added to create the listing price. You receive your full asking price when the vehicle sells - the buyer pays the service fee.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border border-slate-200">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 text-center">What's Included in Every Sale</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">No upfront costs</p>
                        <p className="text-xs text-slate-600">Pay only when your vehicle sells</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Fee deducted after sale</p>
                        <p className="text-xs text-slate-600">No risk, no commitment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Professional photography</p>
                        <p className="text-xs text-slate-600">High-quality listing images</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Handle all inquiries</p>
                        <p className="text-xs text-slate-600">We manage buyer communication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Test drive coordination</p>
                        <p className="text-xs text-slate-600">Safe and organized viewings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Secure payment processing</p>
                        <p className="text-xs text-slate-600">Protected transactions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Section */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6 sm:p-8 text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 sm:mb-4">Ready to Get Started?</h2>
                <p className="text-slate-600 text-sm sm:text-base mb-6 max-w-2xl mx-auto px-2">
                  Submit your vehicle information and we'll take care of the rest. Our team will review your submission and get back to you within 24 hours.
                </p>

                {currentUser ? (
                  <Button
                    onClick={handleStartRequest}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  >
                    <Handshake className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    <span className="hidden sm:inline">Submit Managed Sale Request</span>
                    <span className="sm:hidden">Submit Request</span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push("/signIn")}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4"
                  >
                    <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    Login to Request Service
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">How Our Managed Service Works</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-blue-600">1</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Submit Details</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Provide your vehicle information and upload photos
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-emerald-600">2</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Professional Setup</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      We create professional listing with enhanced photography
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Active Marketing</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      We handle inquiries, showings, and negotiations
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl font-bold text-green-600">4</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2 text-sm sm:text-base">Get Paid</h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Secure transaction processing and paperwork completion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Verification Modal */}
          <AnimatePresence>
            {showLocationVerification && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                  <LocationVerification
                    user={currentUser}
                    onVerificationComplete={handleLocationVerification}
                  />
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Request Form Modal */}
          <AnimatePresence>
            {showRequestForm && (
              <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
                <div className="min-h-screen flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl my-8">
                    <SimpleManagedSaleForm
                      onSuccess={handleRequestSubmitted}
                      onClose={() => setShowRequestForm(false)}
                    />
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Success Modal */}
          <AnimatePresence>
            {showSuccessModal && (
              <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
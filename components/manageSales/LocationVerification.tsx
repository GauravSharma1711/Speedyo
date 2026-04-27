
"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { MapPin, CheckCircle, XCircle } from "lucide-react";
import { User } from "@/api/entities";

export default function LocationVerification({ user, onVerificationComplete }) {
  const [location, setLocation] = useState(user?.location || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const checkOkinawaLocation = (locationString) => {
    const lowerLocation = locationString.toLowerCase();
    return lowerLocation.includes('okinawa') || 
           (lowerLocation.includes('japan') && lowerLocation.includes('okinawa')) ||
           lowerLocation.includes('沖縄');
  };

  const handleVerifyLocation = async () => {
    if (!location.trim()) {
      alert("Please enter your location.");
      return;
    }

    setIsVerifying(true);

    // Check if location indicates Okinawa, Japan
    const isValidLocation = checkOkinawaLocation(location);

    if (isValidLocation) {
      // Save location to user profile if different
      if (user && user.location !== location) {
        try {
          await User.updateMyUserData({ location });
        } catch (error) {
          console.error("Failed to update user location:", error);
        }
      }
      
      setVerificationResult({ success: true, message: "Location verified! You're eligible for our Managed Sales Service." });
      setTimeout(() => {
        onVerificationComplete(true, location);
      }, 1500);
    } else {
      setVerificationResult({ 
        success: false, 
        message: "Sorry, our Managed Sales Service is currently only available to residents of Okinawa, Japan." 
      });
      setTimeout(() => {
        onVerificationComplete(false, location);
      }, 3000);
    }

    setIsVerifying(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-3">
          <MapPin className="w-6 h-6 text-blue-500" />
          Location Verification Required
        </CardTitle>
        <p className="text-slate-600 mt-2">
          Our Managed Sales Service is currently available only in Okinawa, Japan. 
          Please verify your location to continue.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="location" className="text-sm font-medium">
            Your Location (City, Prefecture, Country)
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Naha, Okinawa, Japan"
            className="mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            Please include at least your city and prefecture for verification.
          </p>
        </div>

        {verificationResult && (
          <Alert className={verificationResult.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}>
            <AlertDescription className="flex items-center gap-3">
              {verificationResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={verificationResult.success ? "text-emerald-800" : "text-red-800"}>
                {verificationResult.message}
              </span>
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">Why This Restriction?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Our managed sales team is physically located in Okinawa</li>
            <li>• We provide in-person vehicle inspections and photography</li>
            <li>• Local logistics and legal compliance requirements</li>
            <li>• Expansion to other regions coming soon!</li>
          </ul>
        </div>

        <Button
          onClick={handleVerifyLocation}
          disabled={isVerifying || !location.trim()}
          className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
        >
          {isVerifying ? "Verifying Location..." : "Verify My Location"}
        </Button>
      </CardContent>
    </Card>
  );
}
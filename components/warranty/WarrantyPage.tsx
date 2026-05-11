import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Wrench,
  XCircle,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Footer from "@/components/layout/Footer";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Speedyo Warranty Protection
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Drive with confidence. Our warranty plans provide comprehensive coverage for your
            vehicle purchase, protecting you from unexpected repair costs.
          </p>
        </div>

        {/* Warranty Plans */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Basic Warranty */}
          <Card className="shadow-xl bg-white border-2 border-blue-200 hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-white pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Basic Warranty</CardTitle>
                <Badge className="bg-blue-100 text-blue-800 text-sm">Essential</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">¥299</span>
                <span className="text-sm text-slate-500">/ ¥44,900</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Limited Reimbursement Service Contract
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Duration */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Coverage Period</p>
                  <p className="text-sm text-slate-600">24 months OR 10,000 km</p>
                  <p className="text-xs text-slate-500">
                    (whichever comes first, from date of vehicle delivery)
                  </p>
                </div>
              </div>

              {/* Important Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  This is a <strong>limited reimbursement service contract</strong> focused only
                  on the specific components listed below. It is not full mechanical breakdown
                  insurance.
                </p>
              </div>

              {/* What's Covered */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Covered Components (Limited Reimbursement Only)
                </h4>
                <div className="space-y-2">
                  {[
                    "Starter motor",
                    "Alternator",
                    "Battery (first 6 months only)",
                    "Drive belts (serpentine, alternator, AC)",
                    "Radiator, cooling hoses, and thermostat",
                    "Water pump",
                    "Engine mounts (maximum 1 unit)",
                    "Basic sensors (O2, coolant temperature, crank/cam position)",
                    "AC refrigerant recharge (maximum 1 time per year)",
                    "Headlight bulbs",
                    "Power window switch (1 unit)",
                    "Fuel pump (electronic failure only)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Caps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Important Financial Limits
                </h4>
                {[
                  { label: "Deductible", value: "¥8,000 per claim (paid by customer)" },
                  {
                    label: "Labor Cap",
                    value: "¥15,000 max per claim (excess is customer's responsibility)",
                  },
                  {
                    label: "Per-Claim Cap",
                    value:
                      "¥40,000 total per claim (parts + capped labor, after deductible)",
                  },
                  {
                    label: "Lifetime Vehicle Cap",
                    value: "¥80,000 total for entire coverage period",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-blue-800 flex-shrink-0">
                      {item.label}:
                    </span>
                    <span className="text-blue-700">{item.value}</span>
                  </div>
                ))}
                <p className="text-xs text-blue-600 mt-2 italic">
                  These limits exist to keep this plan affordable. All repairs require pre-approval
                  by Speedyo and must be performed at a Speedyo-approved facility. Unauthorized
                  repairs void coverage.
                </p>
              </div>

              {/* Not Covered */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Not Covered (Even for Listed Items)
                </h4>
                <div className="space-y-2">
                  {[
                    "Any internal engine or transmission components",
                    "Diagnostic fees (unless claim is approved)",
                    "Towing, rental cars, or consequential damages",
                    "Normal wear, gradual deterioration, or pre-existing conditions",
                    "Hybrid battery or electrical systems (nav, sliding doors, clusters)",
                    "Cosmetic or comfort-related issues",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500 italic">
                By purchasing the Basic Warranty, you acknowledge that repair costs for covered
                items can sometimes exceed the reimbursement limits above, and any amount over the
                caps is your responsibility.
              </p>
            </CardContent>
          </Card>

          {/* Premium Warranty */}
          <Card className="shadow-xl bg-white border-2 border-emerald-200 hover:shadow-2xl transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              RECOMMENDED
            </div>
            <CardHeader className="bg-gradient-to-br from-emerald-50 to-white pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Premium Warranty</CardTitle>
                <Badge className="bg-emerald-100 text-emerald-800 text-sm">Best Value</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-emerald-600">¥499</span>
              </div>
              <p className="text-sm text-emerald-700 mt-1">Extended Mechanical Protection</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Duration */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Coverage Period</p>
                  <p className="text-sm text-slate-600">24 months OR 10,000 km</p>
                  <p className="text-xs text-slate-500">(whichever comes first)</p>
                </div>
              </div>

              {/* What's Covered */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Covers Basic + Additional Items
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">Engine</p>
                    <div className="space-y-1 ml-4">
                      {[
                        "External oil leaks",
                        "Coil packs",
                        "Spark plugs (1 full set)",
                        "Idle air control valve (IACV)",
                        "Throttle body cleaning (1x)",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">Transmission</p>
                    <div className="space-y-1 ml-4">
                      {["Shift solenoid replacement", "CVT fluid change (1x per period)"].map(
                        (item) => (
                          <div key={item} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-600">{item}</span>
                          </div>
                        )
                      )}
                      <p className="text-xs text-red-600 ml-5">
                        (Internal/belt/pulley failure NOT covered)
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">Electrical</p>
                    <div className="space-y-1 ml-4">
                      {[
                        "Alternator (full)",
                        "Starter",
                        "Battery (12-month coverage)",
                        "Window motor (1 unit)",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">AC System</p>
                    <div className="space-y-1 ml-4">
                      {[
                        "Compressor (up to ¥20,000 labor cap)",
                        "Condenser leaks",
                        "Blower motor",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">Suspension</p>
                    <div className="space-y-1 ml-4">
                      {[
                        "Stabilizer links",
                        "Stabilizer bushings",
                        "Lower arm bushings (1 side)",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Caps - Premium */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Liability Limits
                </h4>
                {[
                  { label: "Deductible", value: "¥8,000 per claim" },
                  { label: "Labor Cap", value: "¥15,000 max per claim" },
                  { label: "Per-Claim Cap", value: "¥40,000 total per claim (after deductible)" },
                  {
                    label: "Lifetime Vehicle Cap",
                    value: "¥80,000 total for entire coverage period",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-emerald-800 flex-shrink-0">
                      {item.label}:
                    </span>
                    <span className="text-emerald-700">{item.value}</span>
                  </div>
                ))}
                <p className="text-xs text-emerald-600 mt-2 italic">
                  All repairs require pre-approval by Speedyo and must be performed at a
                  Speedyo-approved facility.
                </p>
              </div>

              {/* Not Covered */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Not Covered
                </h4>
                <div className="space-y-2">
                  {[
                    "Engine internal rebuild (head gasket, pistons, rods)",
                    "CVT/AT rebuild",
                    "Hybrid system",
                    "Assist systems (ABS, EPS, airbag)",
                    "Electronics (navigation, cameras, radar, power sliding doors)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Powertrain Protect Add-On */}
          <Card className="shadow-xl bg-white border-2 border-purple-200 hover:shadow-2xl transition-shadow">
            <CardHeader className="bg-gradient-to-br from-purple-50 to-white pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-2xl">Powertrain Protect</CardTitle>
                <Badge className="bg-purple-100 text-purple-800 text-sm">Add-On</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-purple-600">+¥199</span>
              </div>
              <p className="text-sm text-purple-700 mt-1">Optional coverage add-on</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Duration */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Coverage Period</p>
                  <p className="text-sm text-slate-600">24 months OR 10,000 km</p>
                  <p className="text-xs text-slate-500">(whichever comes first)</p>
                </div>
              </div>

              {/* What's Covered */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Limited Coverage with Caps
                </h4>
                <div className="space-y-2">
                  {[
                    { title: "Engine Internal Failure", details: "Up to ¥40,000 coverage" },
                    {
                      title: "Transmission Electronic Failure",
                      details: "Up to ¥30,000 coverage",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-slate-800">{item.title}</span>
                        <span className="text-slate-600"> - {item.details}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Not Covered */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Not Covered
                </h4>
                <div className="space-y-2">
                  {["CVT belt/pulley failure", "Hybrid system", "Turbo failure", "Full Transmission Rebuild"].map(
                    (item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Financial Caps - Powertrain */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-purple-900 text-sm mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Liability Limits
                </h4>
                {[
                  { label: "Deductible", value: "¥10,000 per claim" },
                  { label: "Engine Internal Failure Cap", value: "¥40,000 total reimbursement" },
                  {
                    label: "Transmission Electronic Failure Cap",
                    value: "¥30,000 total reimbursement",
                  },
                  {
                    label: "Lifetime Vehicle Cap",
                    value: "¥60,000 combined for entire coverage period",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-xs">
                    <span className="font-semibold text-purple-800 flex-shrink-0">
                      {item.label}:
                    </span>
                    <span className="text-purple-700">{item.value}</span>
                  </div>
                ))}
                <p className="text-xs text-purple-600 mt-2 italic">
                  This add-on can be purchased in addition to Premium Warranty. All claims require
                  pre-approval and use of Speedyo-approved facilities. Actual repair costs
                  exceeding caps remain the customer&apos;s responsibility.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wear & Tear Exclusions */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              Wear & Tear Exclusions (Not Covered Under Any Speedyo Warranty)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-slate-700">
              To maintain fair pricing and protect our customers and Speedyo from unnecessary
              costs, the following wear-and-tear items are not covered under the Basic, Premium, or
              Powertrain Protect plans.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Tires & Brakes */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Tires & Brakes
                </h4>
                <div className="space-y-2">
                  {["Tires", "Brake pads", "Brake rotors/drums", "Parking brake adjustments"].map(
                    (item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Routine Maintenance Consumables */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Routine Maintenance Consumables
                </h4>
                <div className="space-y-2">
                  {[
                    "Oil, coolant, transmission fluid, brake fluid (beyond covered service)",
                    "Filters (oil, air, cabin, fuel)",
                    "Spark plugs (except where included in Premium plan)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lighting & Misc. Consumables */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Lighting & Misc. Consumables
                </h4>
                <div className="space-y-2">
                  {["Headlight bulbs (other than covered once under Basic)", "Interior bulbs", "Fuses"].map(
                    (item) => (
                      <div key={item} className="flex items-start gap-2 text-sm">
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Rubber & Suspension Wear Items */}
              <div>
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Rubber & Suspension Wear Items
                </h4>
                <div className="space-y-2">
                  {[
                    "Bushings (except limited coverage under Premium)",
                    "Rubber mounts",
                    "Torn boots (CV boots, ball joint boots)",
                    "Suspension wear from age",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Wear Items */}
              <div className="md:col-span-2">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Other Wear Items
                </h4>
                <div className="space-y-2">
                  {[
                    "Wiper blades",
                    "Battery (beyond covered period)",
                    "Tires damaged from puncture, alignment issues, or road hazards",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Note to Customers */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h5 className="font-bold text-blue-900 mb-2">Note to Customers</h5>
              <p className="text-sm text-blue-800">
                Wear-and-tear items are considered regular maintenance and are the responsibility
                of the vehicle owner. This ensures that Speedyo can offer affordable warranty
                options while still protecting you from expensive, unexpected mechanical failures.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose Speedio Warranty */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Why Choose Speedyo Warranty?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-white rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Peace of Mind</h4>
                <p className="text-sm text-slate-600">
                  Drive worry-free knowing you&apos;re protected from unexpected repair costs
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-white rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-emerald-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Quality Repairs</h4>
                <p className="text-sm text-slate-600">
                  Work with trusted mechanics and repair shops across Okinawa
                </p>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-white rounded-xl">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-800 mb-2">Easy Claims</h4>
                <p className="text-sm text-slate-600">
                  Simple claim process with fast approval and minimal paperwork
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="shadow-lg bg-white/80 backdrop-blur-sm mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Purchase Warranty",
                  desc: "Select your warranty plan when purchasing your vehicle or within 7 days of purchase",
                },
                {
                  title: "Keep Your Records",
                  desc: "Maintain your warranty certificate and service records for any covered repairs",
                },
                {
                  title: "File a Claim",
                  desc: "Contact us if you need a covered repair. We'll guide you through the process and connect you with approved repair shops",
                },
                {
                  title: "Get Repaired",
                  desc: "Repairs are completed by qualified mechanics, and you're back on the road quickly",
                },
              ].map((step, idx) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">{step.title}</h4>
                    <p className="text-sm text-slate-600">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="shadow-lg bg-amber-50 border-2 border-amber-200 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-6 h-6" />
              Important Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-amber-900">
            <p>• Warranty must be purchased at the time of vehicle sale or within 7 days of delivery</p>
            <p>
              • All repairs must be <strong>pre-approved by Speedyo</strong> and performed at
              Speedyo-approved repair facilities — unauthorized repairs void coverage for that
              claim and may void the entire warranty
            </p>
            <p>
              • Regular maintenance per the vehicle manufacturer&apos;s schedule is required; missing
              records may result in claim denial
            </p>
            <p>• Pre-existing conditions or issues known at time of purchase are not covered</p>
            <p>
              • Coverage applies only to sudden mechanical failures — normal wear, gradual
              deterioration, and failures caused by lack of maintenance are excluded
            </p>
            <p>
              • Per-claim deductibles, labor caps, and lifetime vehicle caps apply to all plans —
              see each plan for specific limits
            </p>
            <p>
              • Diagnostic fees, towing, rental cars, and consequential damages are not covered
              under any plan unless the claim is approved
            </p>
            <p>
              • High-mileage vehicles (over 100,000 km): eligible for Basic Warranty only — 12
              months / 5,000 km coverage period, ¥80,000 lifetime vehicle cap
            </p>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="shadow-xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white border-0">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to Protect Your Investment?</h3>
            <p className="mb-6 text-blue-50">
              Contact us to add warranty coverage to your vehicle purchase
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                <Link href="/Marketplace">Browse Vehicles</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}


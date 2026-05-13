"use client";

import React, { useMemo } from "react";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  Phone,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Shield,
  JapaneseYenIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Footer from "@/components/layout/Footer";

export default function VehicleTransferGuide() {
  const fadeUpVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 60 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    []
  );

  const staggerContainer: Variants = useMemo(
    () => ({
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    }),
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="flex flex-col min-h-screen">
        {/* Hero */}
        <section className="relative px-6 py-20 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-emerald-900/20" />

          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeUpVariants}>
                <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-2 text-lg shadow-lg">
                  <FileText className="w-5 h-5 mr-2" />
                  Essential Guide for Military in Okinawa
                </Badge>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight"
                variants={fadeUpVariants}
              >
                🇯🇵➡️🇺🇸 Vehicle Transfer Guide
              </motion.h1>

              <motion.p
                className="text-xl lg:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed"
                variants={fadeUpVariants}
              >
                Complete step-by-step guide for transferring from Kanji (Japanese Plate) to
                Y-Plate (SOFA Registration) in Okinawa
              </motion.p>

              <motion.div
                className="mt-12 flex justify-center items-center gap-8 text-slate-600 flex-wrap"
                variants={fadeUpVariants}
              >
                {["8 Simple Steps", "Complete Cost Breakdown", "All Required Documents"].map(
                  (t) => (
                    <div key={t} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium">{t}</span>
                    </div>
                  )
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <div className="flex-1 py-12 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUpVariants}
            >
              <Card className="mb-8 bg-blue-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-2">Before You Start</h3>
                      <p className="text-blue-800 text-sm">
                        This guide covers the complete process of transferring a vehicle from
                        Japanese registration (Kanji plates) to SOFA Y-plate registration in
                        Okinawa. Choose the appropriate guide based on whether Speedio is handling
                        the LTO inspection or if you&apos;re doing the full process yourself.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Tabs defaultValue="speedio-managed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="speedio-managed" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Speedio-Managed Process
                </TabsTrigger>
                <TabsTrigger value="self-service">Self-Service Transfer</TabsTrigger>
              </TabsList>

              <TabsContent value="speedio-managed" className="space-y-6">
                <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-emerald-900 mb-2">
                      Speedio-Managed LTO Inspection Process
                    </h3>
                    <p className="text-emerald-800">
                      <strong>LTO First → JSVRO Second</strong> — Speedio handles the Government of
                      Japan inspection, then you complete SOFA registration at JSVRO.
                    </p>
                  </CardContent>
                </Card>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 1</Badge>
                        <span>Prepare Required Documents</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                          A. Documents the Buyer Must Provide
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b-2 border-slate-300">
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Document
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Notes
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {[
                                [
                                  "PDI Insurance (Liability Insurance)",
                                  "Must be purchased before final JSVRO visit. Buyer provides name + policy number.",
                                ],
                                [
                                  "Military ID & Driver's License",
                                  "Required for SOFA registration.",
                                ],
                                [
                                  "Military Orders (or LOI)",
                                  "Mandatory for first-time SOFA registration.",
                                ],
                                [
                                  "Road Tax Receipt (納税証明書)",
                                  "Speedio provides if needed.",
                                ],
                                [
                                  "If Buyer Not Present: POA or permission letter",
                                  "Only if someone performs JSVRO steps for them.",
                                ],
                              ].map(([doc, notes]) => (
                                <tr key={doc} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 text-slate-700 font-medium">{doc}</td>
                                  <td className="py-3 px-4 text-slate-600">{notes}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                          B. Documents Speedio Provides
                        </h4>
                        <p className="text-slate-600 mb-4 text-sm">
                          Speedio will prepare all Japanese-side documents before inspection:
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-emerald-100 border-b-2 border-emerald-300">
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Provided by Speedio
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {[
                                ["Japanese Title (車検証)", "In Speedio's name before sale."],
                                [
                                  "Recycled Vehicle Certificate (リサイクル券)",
                                  "Required for inspection.",
                                ],
                                [
                                  "Valid JCI (自賠責)",
                                  "New JCI purchased before LTO inspection.",
                                ],
                                [
                                  "Bill of Sale (譲渡証明書)",
                                  "Required to transfer ownership.",
                                ],
                                [
                                  "Stamp Certificate (印鑑証明書)",
                                  "Issued within 3 months.",
                                ],
                                [
                                  "Power of Attorney (委任状)",
                                  "Allows Speedio to complete the LTO inspection.",
                                ],
                              ].map(([doc, desc]) => (
                                <tr key={doc} className="hover:bg-emerald-50/30">
                                  <td className="py-3 px-4 text-slate-700 font-medium">{doc}</td>
                                  <td className="py-3 px-4 text-slate-600">{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 2 - LTO Inspection */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 2</Badge>
                        <span>LTO Inspection (Completed by Speedio)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-600">Speedio takes the vehicle to:</p>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-800">
                              Land Transportation Office – Minatogawa (軽陸)
                            </span>
                            <p className="text-slate-600 text-sm mt-1">
                              This is the official GOJ inspection center.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-semibold text-slate-800 mb-3">What Speedio does:</h5>
                        <ul className="space-y-2">
                          {[
                            "Submits required documents",
                            "Pays weight tax",
                            "Performs the full GOJ inspection",
                            "Pays inspection fees",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <h5 className="font-semibold text-emerald-900 mb-2">Obtains:</h5>
                        <ul className="space-y-1">
                          <li className="flex items-center gap-2 text-emerald-800">
                            <CheckCircle className="w-4 h-4" />
                            New Shaken (車検) valid for 2 years
                          </li>
                          <li className="flex items-center gap-2 text-emerald-800">
                            <CheckCircle className="w-4 h-4" />
                            Updated Japanese Title in Speedio&apos;s name if required
                          </li>
                        </ul>
                      </div>

                      <div className="mt-6">
                        <h5 className="font-semibold text-slate-800 mb-3">
                          Kei Car Cost Breakdown (Paid by Speedio)
                        </h5>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b-2 border-slate-300">
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Item
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Cost
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {[
                                ["Weight Tax", "¥6,600–¥8,200"],
                                ["Inspection Fee", "¥1,400–¥1,800"],
                                ["Stamp Fees", "¥1,500–¥2,000"],
                                ["JCI (12–25 months)", "¥17,540–¥18,000"],
                              ].map(([item, cost]) => (
                                <tr key={item} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 text-slate-700">{item}</td>
                                  <td className="py-3 px-4 text-slate-700">{cost}</td>
                                </tr>
                              ))}
                              <tr className="bg-emerald-100 font-semibold">
                                <td className="py-3 px-4 text-emerald-900">Total</td>
                                <td className="py-3 px-4 text-emerald-900">¥25,000–¥30,000</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <CheckCircle className="w-4 h-4 inline mr-2 text-blue-600" />
                          After inspection, the car is road legal, and the Buyer can proceed to
                          JSVRO.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 3 - Purchase PDI */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 3</Badge>
                        <span>Buyer Purchases PDI (Liability Insurance)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        This is Step 0 before JSVRO. Buyer must buy PDI in their name at:
                      </p>
                      <ul className="space-y-2 mb-4">
                        {["AIG (Camp Foster)", "USAA (online)", "ACE Insurance", "Or any Japanese provider"].map(
                          (item) => (
                            <li key={item} className="text-slate-700">
                              • {item}
                            </li>
                          )
                        )}
                      </ul>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                        <div className="flex items-center gap-2">
                          <JapaneseYenIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">
                            Cost: ¥9,000–¥13,000 for 1 year
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 4 - JSVRO Paperwork */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 4</Badge>
                        <span>JSVRO Paperwork (Buyer)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-800">Camp Foster JSVRO</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-800 mb-3">The Buyer brings:</h5>
                        <ul className="space-y-2">
                          {[
                            "New GOJ inspection (Speedio)",
                            "New Shaken (Speedio)",
                            "Bill of Sale (Speedio)",
                            "JCI (Speedio)",
                            "PDI Insurance (Buyer)",
                            "Road Tax Receipt (Speedio)",
                            "Military ID & Orders (Buyer)",
                          ].map((item) => (
                            <li key={item} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span className="text-slate-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-semibold text-slate-800 mb-3">What JSVRO Does:</h5>
                        <ul className="space-y-2">
                          {[
                            "Creates SOFA registration worksheets",
                            "Verifies documents",
                            "Confirms insurance coverage",
                            "Sends the Buyer to ALPA for plate purchase",
                          ].map((item) => (
                            <li key={item} className="text-slate-700">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 5 - Purchase Y-Plates */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 5</Badge>
                        <span>Purchase Y-Plates (Buyer)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-slate-800">
                              ALPA Window D (next to LTO)
                            </span>
                          </div>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-4">
                        {["Buyer attaches plates", "Rear plate sealed at Lane #7"].map((item) => (
                          <li key={item} className="text-slate-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                        <div className="flex items-center gap-2">
                          <JapaneseYenIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Fee: ¥2,280</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 6 - Finalize */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 6</Badge>
                        <span>Finalize at JSVRO (Buyer)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-3">Return to JSVRO with:</p>
                      <ul className="space-y-2 mb-4">
                        {[
                          "Y-plates installed",
                          "All documents from Speedio",
                          "Road Tax Conversion Slip",
                          "SOFA PDI policy",
                        ].map((item) => (
                          <li key={item} className="text-slate-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="font-semibold text-emerald-800 mb-2">JSVRO will issue:</p>
                        <ul className="space-y-1">
                          {["SOFA Road Tax Decal", "Military Registration", "All documents returned to the Buyer"].map(
                            (item) => (
                              <li key={item} className="flex items-center gap-2 text-emerald-700">
                                <CheckCircle className="w-4 h-4" />
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="self-service" className="space-y-6">
                <Card className="bg-gradient-to-r from-blue-50 to-slate-50 border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-blue-900 mb-2">
                      Complete Self-Service Transfer
                    </h3>
                    <p className="text-blue-800">
                      <strong>JSVRO First → LTO Second</strong> — You handle all inspections and
                      paperwork yourself.
                    </p>
                  </CardContent>
                </Card>

                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 1</Badge>
                        <span>Prepare Required Documents</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Section A: Documents the Client Must Provide */}
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                          A. Documents the Client Must Provide
                        </h4>
                        <p className="text-slate-600 mb-4 text-sm">
                          These must be brought by the SOFA member (buyer):
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-slate-100 border-b-2 border-slate-300">
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Required Item
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {[
                                [
                                  "1. PDI Insurance (Liability Insurance)",
                                  "Must be in the SOFA member's name. Purchased on-base (AIG / USAA) or Japanese company.",
                                ],
                                [
                                  "2. Military Orders / Letter of Employment",
                                  "Required for SOFA registration.",
                                ],
                                ["3. Personal ID", "Military ID + Driver's License."],
                                [
                                  "4. If not present: Letter of Attorney (委任状)",
                                  "Needed to transfer title into the buyer's name.",
                                ],
                              ].map(([item, desc]) => (
                                <tr key={item} className="hover:bg-slate-50">
                                  <td className="py-3 px-4 text-slate-700 font-medium">{item}</td>
                                  <td className="py-3 px-4 text-slate-600">{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Section B: Documents Provided by Speedio */}
                      <div>
                        <h4 className="font-semibold text-slate-800 mb-3 text-lg">
                          B. Documents Provided by Speedio
                        </h4>
                        <p className="text-slate-600 mb-4 text-sm">
                          Speedio will prepare the following before you visit JSVRO:
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-emerald-100 border-b-2 border-emerald-300">
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Provided by Speedio
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-slate-800">
                                  Description
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {[
                                [
                                  "1. Japanese Title (車検証)",
                                  "Updated into Speedio's name before transfer.",
                                ],
                                [
                                  "2. JCI Insurance (自賠責)",
                                  "Renewed JCI valid for the next inspection period.",
                                ],
                                [
                                  "3. Japanese Bill of Sale (譲渡証明書)",
                                  "Required for ownership transfer.",
                                ],
                                [
                                  "4. Stamp Certificate (印鑑証明書)",
                                  "Issued within 3 months.",
                                ],
                                [
                                  "5. Current Year Road Tax Receipt (納税証明書)",
                                  "Must show payment for the current tax year.",
                                ],
                                [
                                  "6. Letter of Attorney (委任状)",
                                  "Allowing Speedio to complete required steps.",
                                ],
                              ].map(([item, desc]) => (
                                <tr key={item} className="hover:bg-emerald-50/30">
                                  <td className="py-3 px-4 text-slate-700 font-medium">{item}</td>
                                  <td className="py-3 px-4 text-slate-600">{desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-sm text-emerald-800 font-medium">
                            <CheckCircle className="w-4 h-4 inline mr-2 text-emerald-600" />
                            Speedio hands all these documents to the buyer before the LTO visit.
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          JSVRO Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Hours:</span> 08:00–11:30, 12:30–15:30
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="font-medium">Phone:</span> 098-970-7481
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 2</Badge>
                        <span>Temporary Plates (if GOJ expired)</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-4">
                        If your Government of Japan (GOJ) inspection is expired, you must:
                      </p>
                      <ul className="space-y-2 ml-4">
                        {["Bring your JCI Policy and Payment", "Apply at JSVRO for temporary plates"].map(
                          (item) => (
                            <li key={item} className="text-slate-700">
                              • {item}
                            </li>
                          )
                        )}
                      </ul>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                        <div className="flex items-center gap-2">
                          <JapaneseYenIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Fee: ¥1,500</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 3</Badge>
                        <span>Pay Weight Tax</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-3">Pay at ALPA Payment Counter</p>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                        <div className="flex items-center gap-2">
                          <JapaneseYenIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Range: ¥11,900 – ¥25,000</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          (depends on vehicle type and weight)
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 4</Badge>
                        <span>JSVRO & Inspection Process</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {[
                          "Visit JSVRO counters 1–4 to complete 2 worksheets",
                          "Verify documents at Counter A or B",
                          "Proceed to Lane #5 for Safety Inspection (or lane near Door #6)",
                          "Fee: $50 JPY (¥8,000)",
                          "Pay Initial Registration Fee: ¥1,500 at ALPA counter",
                        ].map((item) => (
                          <li key={item} className="text-slate-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 inline-block">
                        <div className="flex items-center gap-2">
                          <JapaneseYenIcon className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold text-emerald-800">
                            Total (Inspection + Registration): ¥9,180 (approx.)
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 5 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 5</Badge>
                        <span>Obtain New Japanese Title</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-3">
                        Go to the Land Transportation Office (LTO)
                      </p>
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-start gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-slate-800">Address:</span>
                            <p className="text-slate-600">512-4 Minatogawa, Urasoe City</p>
                          </div>
                        </div>
                        <p className="text-slate-700 mt-3">
                          🪪 Window #2 for your new Japanese Title (Ninsho Sho).
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 6 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 6</Badge>
                        <span>Road Tax Conversion</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {[
                          "Proceed to the Road Tax Office (across from LTO)",
                          "Convert the Japanese receipt to the SOFA version",
                        ].map((item) => (
                          <li key={item} className="text-slate-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 7 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white text-lg px-4 py-2">STEP 7</Badge>
                        <span>Pay for Y-Plates</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {[
                          "Visit Main ALPA Building Window D (next to LTO)",
                          "Pay ¥2,280 for your Y-plates",
                          "Seal the rear plate at Lane #7 in the LTO parking lot",
                        ].map((item) => (
                          <li key={item} className="text-slate-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 inline-block">
                        <div className="flex items-center gap-2">
                          <JapaneseYenIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">Fee: ¥2,280</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Step 8 */}
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={fadeUpVariants}
                >
                  <Card className="mb-6 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">STEP 8</Badge>
                        <span>Finalize at JSVRO</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-3">Return to JSVRO with:</p>
                      <ul className="space-y-2 mb-4">
                        {["All completed paperwork", "New Y-plates affixed to your car"].map((item) => (
                          <li key={item} className="text-slate-700">
                            • {item}
                          </li>
                        ))}
                      </ul>
                      <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                        <p className="font-semibold text-emerald-800 mb-2">You will receive:</p>
                        <ul className="space-y-1">
                          {["Road Tax Decal", "Military Registration"].map((item) => (
                            <li key={item} className="flex items-center gap-2 text-emerald-700">
                              <CheckCircle className="w-4 h-4" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Cost Summary */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUpVariants}
            >
              <Card className="shadow-xl bg-gradient-to-br from-blue-50 to-emerald-50 border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <JapaneseYenIcon className="w-7 h-7 text-blue-600" />
                    Estimated Total Costs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-blue-200">
                          <th className="text-left py-3 px-2 font-semibold text-slate-800">Item</th>
                          <th className="text-left py-3 px-2 font-semibold text-slate-800">Fee</th>
                          <th className="text-left py-3 px-2 font-semibold text-slate-800">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {[
                          {
                            item: "JCI Insurance",
                            fee: "¥10,000",
                            notes: "From insurance provider",
                          },
                          {
                            item: "Temporary Plates (if needed)",
                            fee: "¥1,500",
                            notes: "JSVRO",
                          },
                          {
                            item: "Weight Tax",
                            fee: "¥11,900–¥25,000",
                            notes: "ALPA",
                          },
                          {
                            item: "Inspection (GOJ)",
                            fee: "$50 / ¥8,000",
                            notes: "Lane #5",
                          },
                          {
                            item: "Initial Registration",
                            fee: "¥1,500",
                            notes: "ALPA",
                          },
                          { item: "Y-Plates", fee: "¥2,280", notes: "ALPA Window D" },
                        ].map((row) => (
                          <tr key={row.item} className="hover:bg-white/50">
                            <td className="py-3 px-2 text-slate-700">{row.item}</td>
                            <td className="py-3 px-2 font-semibold text-slate-800">{row.fee}</td>
                            <td className="py-3 px-2 text-slate-600 text-sm">{row.notes}</td>
                          </tr>
                        ))}
                        <tr className="bg-blue-100 font-bold">
                          <td className="py-4 px-2 text-blue-900">Estimated Total</td>
                          <td className="py-4 px-2 text-blue-900">¥33,000 – ¥49,000</td>
                          <td className="py-4 px-2 text-blue-800 text-sm">Typical total range</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-white/60 rounded-lg border border-blue-200">
                    <p className="text-sm text-slate-600">
                      <AlertCircle className="w-4 h-4 inline mr-2 text-blue-600" />
                      <strong>Note:</strong> Costs may vary depending on vehicle type, weight, and
                      current exchange rates. It&apos;s recommended to budget for the higher end of
                      the estimate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}


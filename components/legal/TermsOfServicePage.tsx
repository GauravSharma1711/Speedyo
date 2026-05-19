import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import Footer from "@/components/layout/Footer";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "description", title: "2. Description of Service" },
  { id: "accounts", title: "3. User Accounts" },
  { id: "conduct", title: "4. User Conduct" },
  { id: "listing", title: "5. Listing & Selling" },
  { id: "fees", title: "6. Fees & Payments" },
  { id: "disclaimers", title: "7. Disclaimers" },
  { id: "indemnification", title: "8. Indemnification" },
  { id: "ip", title: "9. Intellectual Property" },
  { id: "termination", title: "10. Termination" },
  { id: "dispute", title: "11. Dispute Resolution" },
  { id: "governing", title: "12. Governing Law" },
  { id: "changes", title: "13. Changes to Terms" },
] as const;

export default function TermsOfServicePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Button asChild variant="outline" className="mb-4 md:mb-0">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Speedyo
              </Link>
            </Button>
            <div className="text-sm text-slate-600">Last updated: January 15, 2025</div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Please read these Terms of Service carefully before using our platform. Your use of
              Speedyo constitutes acceptance of these terms.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
            {/* Table of Contents Sidebar */}
            <div className="lg:sticky lg:top-8 lg:self-start order-last lg:order-first">
              <Card className="bg-white/80 backdrop-blur-sm shadow-md border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="min-w-0">
              <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-8">
                <CardContent className="p-6 md:p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600 prose-li:marker:text-blue-600 prose-blockquote:border-l-blue-600 prose-code:bg-slate-100 prose-pre:bg-slate-50 prose-pre:p-4">
                  <section id="acceptance" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      1. Acceptance of Terms
                    </h2>
                    <p>
                      Welcome to Speedyo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By
                      accessing or using our website, services, and applications (collectively, the
                      &quot;Service&quot;), you agree to be bound by these Terms of Service
                      (&quot;Terms&quot;) and our Privacy Policy. If you do not agree to these
                      Terms, you may not use the Service. This is a legally binding agreement.
                    </p>
                    <p>
                      These Terms apply to all users of the Service, including buyers, sellers, and
                      visitors. We reserve the right to modify these Terms at any time. Continued
                      use of the Service after changes constitutes acceptance of the revised Terms.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="description" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      2. Description of Service
                    </h2>
                    <p>
                      Speedyo is an online automotive marketplace that connects vehicle buyers and
                      sellers. We provide tools for listing vehicles, communicating with other
                      users, and facilitating the sales process. We also offer a &quot;Managed
                      Sales&quot; service where we handle the sale on behalf of the seller for a
                      fee.
                    </p>
                    <p>
                      The Service is provided &quot;as is&quot; and we do not guarantee the accuracy
                      of listings or the quality of vehicles. All transactions are between users.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="accounts" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      3. User Accounts and Responsibilities
                    </h2>
                    <p>
                      To access certain features, you must register for an account. You agree to
                      provide accurate, current, and complete information during the registration
                      process. You are responsible for safeguarding your password and for all
                      activities that occur under your account. You must be at least 18 years old
                      to create an account and list a vehicle.
                    </p>
                    <p>
                      You must notify us immediately of any unauthorized use of your account. We
                      are not liable for any loss or damage arising from your failure to comply
                      with these requirements.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="conduct" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      4. User Conduct and Content
                    </h2>
                    <p>
                      You are solely responsible for all content, including images, text, and
                      information (&quot;User Content&quot;), that you post on the Service. You
                      agree not to post User Content that is:
                    </p>
                    <ul>
                      <li>False, misleading, or fraudulent.</li>
                      <li>Infringing upon any third party&apos;s intellectual property rights.</li>
                      <li>Illegal, obscene, defamatory, or threatening.</li>
                      <li>In violation of any applicable laws or regulations.</li>
                    </ul>
                    <p>
                      We reserve the right, but are not obligated, to remove or edit any User
                      Content that we determine in our sole discretion violates these Terms. You
                      grant us a non-exclusive, royalty-free license to use, reproduce, and display
                      your User Content for the purpose of operating the Service.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="listing" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      5. Listing and Selling Vehicles
                    </h2>
                    <p>
                      Sellers are responsible for the accuracy of their listings, including the
                      vehicle&apos;s condition, mileage, history, and price. Speedyo does not own,
                      inspect, or take possession of any vehicles listed on the platform (unless
                      part of the Managed Sales service). All transactions are solely between the
                      buyer and the seller. Speedyo is not a party to any vehicle sale agreement.
                    </p>
                    <p>
                      Buyers are responsible for verifying all vehicle information. We recommend
                      professional inspections before purchase.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="fees" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      6. Fees and Payments
                    </h2>
                    <p>
                      We charge fees for certain services, such as Private Seller and Dealership
                      subscriptions. All fees are described on our Subscription page and are
                      non-refundable except as required by law. By selecting a paid service, you
                      agree to pay the applicable fees. We use a third-party payment processor
                      (Stripe) to handle all payments.
                    </p>
                    <p>
                      For Managed Sales, we add a 6% service fee to the buyer&apos;s price. Sellers
                      receive their full asking price minus any agreed-upon fees.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="disclaimers" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      7. Disclaimers and Limitation of Liability
                    </h2>
                    <p>
                      THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                      WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. SPEEDYO DOES NOT WARRANT
                      THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE. WE DO NOT
                      ENDORSE OR GUARANTEE THE QUALITY, SAFETY, OR LEGALITY OF ANY VEHICLE LISTED.
                    </p>
                    <p>
                      IN NO EVENT SHALL SPEEDIO, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE
                      LIABLE TO YOU FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL
                      DAMAGES WHATSOEVER RESULTING FROM YOUR USE OF THE SERVICE, WHETHER BASED ON
                      WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY. OUR MAXIMUM LIABILITY
                      SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO US IN THE PAST 12 MONTHS.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="indemnification" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">8. Indemnification</h2>
                    <p>
                      You agree to defend, indemnify, and hold harmless Speedyo and its affiliates
                      from and against any and all claims, damages, obligations, losses, liabilities,
                      costs or debt, and expenses (including but not limited to attorney&apos;s fees)
                      arising from your use of and access to the Service, your violation of any
                      term of these Terms, or your violation of any third-party right, including
                      without limitation any copyright, property, or privacy right.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="ip" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      9. Intellectual Property
                    </h2>
                    <p>
                      All content, features, and functionality of the Service, including but not
                      limited to text, graphics, logos, and software, are the exclusive property of
                      Speedyo or its licensors and are protected by international copyright,
                      trademark, and other intellectual property laws. You are granted a limited,
                      non-exclusive license to use the Service for its intended purpose only.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="termination" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">10. Termination</h2>
                    <p>
                      We may terminate or suspend your account and access to the Service
                      immediately, without prior notice, for any reason, including if we believe
                      you have violated these Terms. Upon termination, your right to use the Service
                      will cease immediately.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="dispute" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      11. Dispute Resolution
                    </h2>
                    <p>
                      Any disputes arising out of or related to these Terms or the Service shall be
                      resolved through binding arbitration in accordance with the rules of the
                      American Arbitration Association. You waive your right to participate in
                      class action lawsuits or class-wide arbitration.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="governing" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">12. Governing Law</h2>
                    <p>
                      These Terms shall be governed by the laws of the Naha District Court, Okinawa
                      Japan, without regard to its conflict of law principles. You agree to submit
                      to the personal jurisdiction of the courts located in Delaware for any
                      actions for which we retain the right to seek injunctive or other equitable
                      relief.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="changes" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">13. Changes to Terms</h2>
                    <p>
                      We reserve the right to modify these Terms at any time. We will provide
                      notice of any material changes by posting the new Terms on this page and
                      updating the &quot;Last updated&quot; date. Your continued use of the Service
                      after any such change constitutes your acceptance of the new Terms.
                    </p>
                  </section>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


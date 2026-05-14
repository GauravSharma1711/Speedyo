"use client";
import { useDealershipManageSaleStore } from "@/store/dealership/dealershipManageSalesStore";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  BarChart3,
  Building2,
  CheckCircle,
  Languages,
  Mail,
  Megaphone,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Shield,
  XCircle,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import Footer from "@/components/layout/Footer";

type FormData = {
  dealershipName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
};

const colorClass: Record<
  "blue" | "emerald" | "purple" | "amber",
  { wrapper: string; icon: string }
> = {
  blue: { wrapper: "from-blue-400 to-blue-600", icon: "text-blue-600" },
  emerald: { wrapper: "from-emerald-400 to-emerald-600", icon: "text-emerald-600" },
  purple: { wrapper: "from-purple-400 to-purple-600", icon: "text-purple-600" },
  amber: { wrapper: "from-amber-400 to-amber-600", icon: "text-amber-600" },
};

export default function DealershipManagedSales() {


  const {isSaving,error,inquiry} = useDealershipManageSaleStore();


  const [formData, setFormData] = useState<FormData>({
    dealershipName: "",
    contactName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log("[dealership-managed-sales] submitting (dummy):", formData);
    
      inquiry(formData);

      setSubmitSuccess(true);
      setFormData({
        dealershipName: "",
        contactName: "",
        email: "",
        phone: "",
        message: "",
      });

      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to submit inquiry:", error);
      alert(
        "Failed to send inquiry. Please try again or email us directly at kevin@speedyo.app"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fadeUpVariants: Variants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 60 },
      visible: {
        opacity: 1,
        y: 0,
        // Framer Motion v12 typings require an easing function/array, not a string.
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

  const features = useMemo(
    () => [
      {
        icon: Languages,
        title: "Bilingual Listings",
        description:
          "We translate and optimize your car listings for American buyers with professional English descriptions.",
        color: "blue" as const,
      },
      {
        icon: Megaphone,
        title: "Promotion",
        description:
          "Each listing is promoted across English-speaking car groups and military communities in Okinawa.",
        color: "emerald" as const,
      },
      {
        icon: MessageCircle,
        title: "Buyer Communication",
        description:
          "We handle all English messages, inquiries, and car viewing scheduling on your behalf.",
        color: "purple" as const,
      },
      {
        icon: Shield,
        title: "Verified Listings",
        description:
          "We verify both vehicles and dealerships to build trust with American buyers.",
        color: "amber" as const,
      },
    ],
    []
  );

  const howItWorksSteps = useMemo(
    () => [
      {
        number: 1,
        title: "Dealership Contacts Speedio",
        description: "Reach out to us via the form below or email us directly.",
        icon: Phone,
      },
      {
        number: 2,
        title: "We Collect Information",
        description: "Share vehicle details, photos, and pricing with our team.",
        icon: BarChart3,
      },
      {
        number: 3,
        title: "Listings Go Live",
        description:
          "Professional listings are created on your Speedio dealership page.",
        icon: Sparkles,
      },
      {
        number: 4,
        title: "We Promote & Manage",
        description:
          "Listings are promoted online across multiple channels. We handle all buyer inquiries.",
        icon: Megaphone,
      },
      {
        number: 5,
        title: "You Close the Sale",
        description:
          "We arrange car viewings and connect qualified buyers directly to your dealership.",
        icon: CheckCircle,
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      {
        icon: Target,
        title: "Direct Access to U.S. Buyers",
        description:
          "Reach thousands of American military members and their families stationed in Okinawa.",
      },
      {
        icon: Languages,
        title: "Bilingual Communication Team",
        description:
          "Our team speaks both English and Japanese, eliminating language barriers.",
      },
      {
        icon: Sparkles,
        title: "No Setup Required",
        description:
          "We handle everything from photography to promotion. You focus on closing sales.",
      },
      {
        icon: BarChart3,
        title: "Analytics & Reports",
        description: "Track views, leads, car viewing, and performance for each listing.",
      },
    ],
    []
  );

  const challenges = useMemo(
    () => [
      {
        icon: Users,
        title: "Limited Walk-In Traffic",
        description:
          "Most dealerships rely only on local walk-ins or word-of-mouth, missing online opportunities.",
      },
      {
        icon: Languages,
        title: "Language Barriers",
        description:
          "Marketing cars to the U.S. military community is difficult without English capability.",
      },
      {
        icon: XCircle,
        title: "Listings Get Lost",
        description:
          "Posts in Japanese groups are often missed or misunderstood by American buyers.",
      },
      {
        icon: TrendingUp,
        title: "Missed Sales Opportunities",
        description:
          "Dealerships lose potential sales because they can't reach the right audience effectively.",
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20">
      {/* Hero */}
      <section className="relative px-6 py-20 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://nxlgznimtbcesgofxlkv.supabase.co/storage/v1/object/public/Speedio/image_Dealership%20ManagedSalesService_hero.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-emerald-900/20" />

        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeUpVariants}>
              <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-2 text-lg shadow-lg">
                <Building2 className="w-5 h-5 mr-2" />
                For Okinawa Dealerships
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight"
              variants={fadeUpVariants}
            >
              Reach U.S. Buyers with Speedio&apos;s
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                {" "}
                Managed Sales Service
              </span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed"
              variants={fadeUpVariants}
            >
              We help Okinawa dealerships connect with American buyers through bilingual
              marketing, verified listings, and full sales support.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              variants={fadeUpVariants}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-lg px-10 py-7 shadow-lg hover:shadow-xl rounded-lg font-semibold"
                onClick={() =>
                  document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-lg px-10 py-7 border-2 hover:bg-white rounded-lg font-semibold"
                onClick={() => (window.location.href = "mailto:kevin@speedyo.app")}
              >
                <Mail className="w-5 h-5 mr-2" />
                Email Us
              </Button>
            </motion.div>

            <motion.div
              className="mt-12 flex justify-center items-center gap-8 text-slate-600 flex-wrap"
              variants={fadeUpVariants}
            >
              {["Bilingual Support", "U.S. Military Focused", "Full Service Management"].map(
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

      {/* Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <Badge className="mb-4 bg-red-100 text-red-600 px-4 py-2 text-base">
              <XCircle className="w-4 h-4 mr-2" />
              The Challenge
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Why Selling to American Buyers is Difficult
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Many Okinawa dealerships struggle to reach the lucrative American market despite
              having great inventory.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {challenges.map((challenge, index) => (
              <motion.div key={index} variants={fadeUpVariants}>
                <Card className="h-full bg-gradient-to-br from-white to-slate-50/50 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
                      <challenge.icon className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-3">
                      {challenge.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {challenge.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-2 text-base shadow-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              The Solution
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              The Managed Sales Service for Dealerships
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Speedio bridges the gap between Japanese dealerships and American buyers. We handle
              your car listings, English translations, promotions, buyer inquiries, and even test
              drive scheduling.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => {
              const c = colorClass[feature.color];
              return (
                <motion.div key={index} variants={fadeUpVariants}>
                  <Card className="bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-0 h-full">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${c.wrapper} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          <feature.icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-800 mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-600 px-6 py-2 text-base">
              <CheckCircle className="w-5 h-5 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              How Our Managed Sales Service Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Five simple steps to start reaching American buyers and growing your dealership
              sales.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {howItWorksSteps.map((step, index) => (
              <motion.div key={index} variants={fadeUpVariants}>
                <Card className="bg-gradient-to-br from-white to-slate-50/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow text-white font-bold">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{step.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 to-emerald-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Why Dealerships Choose Speedio
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Join forward-thinking dealerships already reaching American buyers through our
              platform.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {benefits.map((benefit, index) => (
              <motion.div key={index} variants={fadeUpVariants}>
                <Card className="bg-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <benefit.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-emerald-500 shadow-2xl border-0 max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-white text-xl lg:text-2xl italic mb-6 leading-relaxed">
                  &quot;Since joining Speedio&apos;s Managed Sales Service, we&apos;ve sold 3 cars
                  to American customers in one month! The bilingual support and promotions made
                  all the difference.&quot;
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Okinawa Auto Dealer</p>
                    <p className="text-blue-100 text-sm">Local Dealership Partner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact-form" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Ready to Connect With U.S. Buyers?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Join Speedio&apos;s Managed Sales Service for Dealerships and reach thousands of
              buyers in Okinawa&apos;s American community. No upfront setup — just results.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-slate-50/50">
              <CardHeader className="text-center border-b pb-6">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <Mail className="w-6 h-6 text-blue-500" />
                  Contact Speedio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {submitSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">Thank You!</h3>
                    <p className="text-slate-600 mb-6">
                      We&apos;ve received your inquiry and will get back to you within 24-48 hours.
                    </p>
                    <Button onClick={() => setSubmitSuccess(false)} variant="outline">
                      Send Another Inquiry
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="dealershipName">Dealership Name *</Label>
                        <Input
                          id="dealershipName"
                          name="dealershipName"
                          value={formData.dealershipName}
                          onChange={handleInputChange}
                          placeholder="Okinawa Auto Sales"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name *</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleInputChange}
                          placeholder="Tanaka Taro"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="tanaka@dealership.com"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+81 98-XXX-XXXX"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Tell Us About Your Dealership *</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="How many cars do you typically have in inventory? What types of vehicles do you sell? Any specific questions?"
                        rows={6}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-6 text-lg font-semibold"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Inquiry
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 py-6 text-lg font-semibold"
                        onClick={() => (window.location.href = "mailto:kevin@speedyo.app")}
                        disabled={isSubmitting}
                      >
                        <Mail className="w-5 h-5 mr-2" />
                        Email Directly
                      </Button>
                    </div>

                    <p className="text-xs text-slate-500 text-center">
                      We typically respond within 24-48 hours during business days.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}
          >
            <p className="text-slate-600 mb-4">Prefer to reach out directly?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:kevin@speedyo.app"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Mail className="w-5 h-5" />
                kevin@speedyo.app
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


"use client"
import React, { useState, useEffect } from "react";
import { userService } from "@/services/dashboard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Car,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  TrendingUp,
  Users,
  Clock,
  Tag,
  DollarSign,
  Zap,
  Camera,
  MessageCircle,
  ChevronRight,
  Star,
  Gift
} from "lucide-react";
import Link from "next/link";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function PrivateSellerPromo() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.me();
        setCurrentUser(user);
      } catch (error) {
        setCurrentUser(null);
      }
    };
    fetchUser();
  }, []);

  const promoCode = "SELLER20";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleScrollToHowItWorks = (e:any) => {
    e.preventDefault();
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    {
      icon: Car,
      title: "List Your Vehicles",
      description: "Create professional listings with photos and details in minutes",
      gradient: "from-blue-500 to-blue-600",
      stat: "2 min",
      statLabel: "Average listing time"
    },
    {
      icon: Users,
      title: "Reach Real Buyers",
      description: "Connect with verified buyers actively looking for vehicles",
      gradient: "from-purple-500 to-purple-600",
      stat: "Help Us Build",
      statLabel: "Active buyers"
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with interested buyers without middlemen",
      gradient: "from-emerald-500 to-emerald-600",
      stat: "24/7",
      statLabel: "Messaging support"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Protected transactions and verified user profiles",
      gradient: "from-amber-500 to-amber-600",
      stat: "100%",
      statLabel: "Secure platform"
    },
    {
      icon: Camera,
      title: "Professional Tools",
      description: "Easy-to-use tools to showcase your vehicle's best features",
      gradient: "from-pink-500 to-pink-600",
      stat: "Unlimited",
      statLabel: "Photos per listing"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Track views and engagement on your listings",
      gradient: "from-indigo-500 to-indigo-600",
      stat: "Real-time",
      statLabel: "Analytics dashboard"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      description: "Sign up for free in under 2 minutes. No credit card required to start.",
      action: "Sign Up Now"
    },
    {
      number: "2",
      title: "Choose Private Seller Plan",
      description: "Select the Private Seller option and purchase vehicle slots ($50 each, normally).",
      action: "View Pricing"
    },
    {
      number: "3",
      title: "Enter Promo Code",
      description: `Use code ${promoCode} at checkout to get 20% off your first purchase!`,
      action: "Copy Code"
    },
    {
      number: "4",
      title: "Start Selling",
      description: "List your vehicle and connect with buyers immediately after checkout.",
      action: null
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      {/* Hero Section with Background Image */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68aace4277990cd56b711f4b/72981e819_background_hero_carlot.jpg')"
          }}
        ></div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-blue-800/90 to-emerald-800/85"></div>

        {/* Additional Overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Speedio Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link href={createPageUrl("Landing")}>
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png"
                  alt="Speedio Logo"
                  className="h-12 md:h-16 mx-auto brightness-0 invert opacity-90"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </Link>
            </motion.div>

            {/* Promo Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Gift className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">Limited Time Offer</span>
              <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400">
                20% OFF
              </Badge>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Sell Your Vehicle on
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                Speedio
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto drop-shadow-md">
              Join other private sellers who trust Speedio to connect with serious buyers.
              <span className="font-semibold text-amber-200"> Get 20% off your first purchase!</span>
            </p>

            {/* Promo Code Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-block"
            >
              <Card className="bg-white/15 backdrop-blur-xl border-2 border-white/40 shadow-2xl">
                <CardContent className="p-6">
                  <p className="text-sm text-white mb-2 font-medium">Your Exclusive Promo Code</p>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white backdrop-blur-sm px-6 py-4 rounded-lg shadow-lg">
                      <code className="text-3xl font-bold text-blue-600 tracking-wider">
                        {promoCode}
                      </code>
                    </div>
                    <Button
                      onClick={handleCopyCode}
                      className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                    >
                      {copiedCode ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Tag className="w-4 h-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-white mt-3 font-medium">
                    Save $10 on your first vehicle slot purchase
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 w-full max-w-2xl mx-auto px-4">
              <Link href={createPageUrl("GuestCheckout") + `?promoCode=${promoCode}`} className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8 py-6 font-semibold">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <button onClick={handleScrollToHowItWorks} className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 rounded-md flex items-center justify-center text-lg px-8 py-6 font-semibold border border-white text-white bg-transparent hover:bg-white hover:text-blue-600 w-full sm:w-auto"
                >
                  Learn How It Works
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section - Enhanced */}
      <div className="relative py-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-emerald-50"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white border-0 text-sm px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Trusted Community
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Why Sellers Choose
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                Speedio
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Experience the most advanced platform for private vehicle sales, designed to help you sell faster and easier
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.05] group overflow-hidden relative">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                  <CardContent className="p-8 relative">
                    {/* Icon with gradient background */}
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-emerald-600 transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-slate-600 text-base leading-relaxed mb-6">
                      {feature.description}
                    </p>

                    {/* Stats badge */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 flex items-center justify-center`}>
                        <Sparkles className={`w-5 h-5 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{feature.stat}</p>
                        <p className="text-xs text-slate-500 font-medium">{feature.statLabel}</p>
                      </div>
                    </div>
                  </CardContent>

                  {/* Decorative corner element */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full transform translate-x-12 -translate-y-12 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500`}></div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-8 text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold">Money-Back Guarantee</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="bg-gradient-to-br from-blue-50 to-emerald-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Clock className="w-4 h-4 mr-2" />
              Ready in Minutes
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              How to Claim Your Discount
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Follow these simple steps to start selling with your exclusive 20% discount
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl font-bold text-white">{step.number}</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-slate-600 text-lg">
                          {step.description}
                        </p>
                      </div>
                      {step.action && (
                        <div className="flex-shrink-0 w-full md:w-auto">
                          {step.action === "Sign Up Now" && (
                            <Link href={createPageUrl("GuestCheckout") + `?promoCode=${promoCode}`}>
                              <Button
                                size="lg"
                                className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                              >
                                {step.action}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                          {step.action === "View Pricing" && (
                            <Link href={createPageUrl("Subscription")}>
                              <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                                {step.action}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </Link>
                          )}
                          {step.action === "Copy Code" && (
                            <Button
                              size="lg"
                              onClick={handleCopyCode}
                              className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              {copiedCode ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Tag className="w-4 h-4 mr-2" />
                                  {step.action}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Comparison */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-6 text-center">
            <h3 className="text-2xl font-bold mb-2">Special Offer Pricing</h3>
            <p className="text-blue-100">Limited time discount for new sellers</p>
          </div>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Regular Price */}
              <div className="text-center p-6 bg-slate-100 rounded-lg relative">
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white">Regular Price</Badge>
                </div>
                <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Standard Rate</p>
                <div className="relative">
                  <span className="text-4xl font-bold text-slate-400 line-through">$50</span>
                </div>
                <p className="text-slate-500 mt-2">per vehicle slot</p>
              </div>

              {/* Promo Price */}
              <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-lg relative">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-400">
                    <Star className="w-3 h-3 mr-1" />
                    Save $10
                  </Badge>
                </div>
                <Zap className="w-12 h-12 text-white mx-auto mb-4" />
                <p className="text-blue-100 mb-2">With Promo Code</p>
                <div className="relative">
                  <span className="text-5xl font-bold text-white">$40</span>
                </div>
                <p className="text-blue-100 mt-2">per vehicle slot</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm text-white font-semibold">
                    Use code: <code className="bg-white/20 px-2 py-1 rounded">{promoCode}</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-600 mb-4">
                ✓ No monthly fees  •  ✓ Keep 100% of sale price  •  ✓ Unlimited photos
              </p>
              <Link href={createPageUrl("GuestCheckout") + `?promoCode=${promoCode}`}>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Claim Your Discount Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Selling?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join Speedio today and connect with buyers in minutes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={createPageUrl("GuestCheckout") + `?promoCode=${promoCode}`}>
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-lg px-8 py-6">
                <Gift className="w-5 h-5 mr-2" />
                Claim Your 20% Discount
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 mt-6 text-sm">
            Questions? <Link href={createPageUrl("contact")} className="text-blue-400 hover:text-blue-300 underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { motion } from 'framer-motion';
import Link from "next/link";
import { useSession } from "next-auth/react";
import Footer from "@/components/layout/Footer";
import {
  Car,
  MessageCircle,
  Shield,
  TrendingUp,
  Star,
  ArrowRight,
  CheckCircle,
  Heart,
  Zap,
  Settings,
  Plus,
  Loader2,
  Anchor,
  Clock,
  Handshake,
  
} from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { AnimatedCounter } from "@/components/landing/AnimatedCounter";
import type { Stats } from "@/components/landing/landingTypes";
import { landingFeatures, landingTestimonials } from "@/components/landing/landingData";

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAuthCheckComplete = status !== "loading";

  const currentUser = session?.user ?? null;
  const currentUserDisplay = currentUser
    ? {
        full_name:
          (currentUser as { full_name?: string }).full_name ??
          (currentUser.email ? currentUser.email.split("@")[0] : undefined) ??
          "User",
      }
    : null;
  const [stats, setStats] = useState<Stats>({
    verifiedListings: 0,
    happyUsers: 0,
    satisfactionRate: 0,
    isLoading: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    // ── Stats fetch ─────────────────────────────────────────────────────────
    // TODO: Replace with your real API calls
    // Example using Next.js Route Handler:
    //   const res = await fetch("/api/stats");
    //   const data = await res.json();
    const fetchStats = async () => {
      try {
        // Simulated stats — replace with real fetch
        setStats({
          verifiedListings: 124,
          happyUsers: 580,
          satisfactionRate: 95,
          isLoading: false,
        });
      } catch {
        setStats({
          verifiedListings: 0,
          happyUsers: 0,
          satisfactionRate: 95,
          isLoading: false,
        });
      }
    };

    fetchStats();
  }, []);

const handleGetStarted = () => {
  if (isLoggedIn) {
    router.push("/Feed");
  } else {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/signIn`||"https://speedyo.app/login";
  }
};

    // Animation variants
  const fadeUpVariants: any = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const slideInLeft: any = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const slideInRight: any = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };


   return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-10"></div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Welcome back badge block */}
          {currentUserDisplay &&
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6">

              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-full px-4 py-2 shadow-sm">
                <span className="text-sm text-slate-600">👋</span>
                <span className="text-sm text-slate-700">
                  Welcome back, <span className="font-semibold text-slate-800">{currentUserDisplay.full_name}</span>
                </span>
              </div>
            </motion.div>
          }

          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}>

            <motion.div variants={fadeUpVariants}>
              <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2 text-lg">
                <Zap className="w-4 h-4 mr-2" />
                Your Drive Starts Here
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-7xl font-bold text-slate-800 mb-6 leading-tight"
              variants={fadeUpVariants}>

              Connect, Buy, Sell & Share Your
              <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent"> Passion</span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
              variants={fadeUpVariants}>

              Join the most trusted automotive marketplace and community. Whether you're buying your first car, selling your pride and joy, or connecting with fellow enthusiasts, Speedyo makes it seamless.
            </motion.p>

            {/* CTA Section for Hero */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">

              {isAuthCheckComplete ?
              currentUser ?
              <div className="relative w-full sm:w-auto">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg blur opacity-75 animate-pulse"></div>
                    <Button
                  size="lg"
                  className="relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-auto rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-lg px-8 py-4 w-full"
                onClick={() => router.push("/Feed")}
                  >
                      Go to Social Feed
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div> :

              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-lg px-8 py-4 h-auto w-full sm:w-auto"
                onClick={handleGetStarted}>

                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button> :

              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-emerald-500 text-lg px-8 py-4 h-auto w-full sm:w-auto cursor-not-allowed opacity-70"
                disabled>

                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  <span className="invisible">Go to Social Feed</span>
                  <span className="absolute">Loading...</span>
                </Button>
              }

              <Link  href="/Marketplace" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center text-lg px-8 py-4 h-auto font-semibold hover:bg-white/80 w-full sm:w-auto">

                  Browse Vehicles
                  <Car className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 flex justify-center items-center gap-8 text-slate-500"
              variants={fadeUpVariants}>

              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">
                  <AnimatedCounter
                    end={stats.verifiedListings}
                    duration={2000}
                    delay={0}
                    suffix="+" />
                </p>
                <p className="text-sm">Verified Listings</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">
                  <AnimatedCounter
                    end={stats.happyUsers}
                    duration={2500}
                    delay={0}
                    suffix="+" />
                </p>
                <p className="text-sm">Happy Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-800">
                  <AnimatedCounter
                    end={stats.satisfactionRate}
                    duration={1800}
                    delay={0}
                    suffix="%" />
                </p>
                <p className="text-sm">Satisfaction Rate</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-2 text-base shadow-lg">
              <Zap className="w-5 h-5 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              From finding your perfect vehicle to building lasting connections in the automotive community
            </p>
          </motion.div>

          <motion.div
            className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide snap-x snap-mandatory"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}>

            {landingFeatures.map((feature, index) =>
            <motion.div
              key={index}
              variants={fadeUpVariants}
              className="min-w-[280px] md:min-w-0 snap-center">
                <Card className="bg-gradient-to-br from-white to-slate-50/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 h-full group">
                  <CardContent className="p-8 text-center flex flex-col h-full">
                    <div className="mb-6">
                      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                      <p className="text-slate-600 leading-relaxed flex-1">{feature.description}</p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      <div className={`inline-flex items-center text-sm font-semibold text-${feature.color}-600 group-hover:gap-2 transition-all`}>
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* NEW: Pain Point Section for Military in Okinawa - REDESIGNED WITH BACKGROUND */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68aace4277990cd56b711f4b/fbce88fc1_leavingokinawa_image.png')"
          }}>

          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-slate-900/90"></div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            {/* Military Badge */}
            <div className="inline-flex items-center justify-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-3 mb-6">
              <Anchor className="w-6 h-6 text-blue-300 mr-3" />
              <span className="text-blue-100 font-semibold text-lg">For Military Members</span>
            </div>

            {/* Headline */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Leaving Okinawa?<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                We Can Help.
              </span>
            </h2>

            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">Don't let the stress of a Permanent Change of Station force you into a bad deal for your car. Speedyo offers a trusted solution for service members.


            </p>
          </motion.div>

          {/* Problem vs Solution Cards */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* The PCS Problem */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInLeft}>
              <Card className="bg-white/10 backdrop-blur-md shadow-xl border border-white/20 h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="hidden md:flex flex-shrink-0 bg-red-500/20 backdrop-blur-sm p-4 rounded-xl border border-red-400/30">
                      <Clock className="w-8 h-8 text-red-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">The PCS Problem</h3>
                      <p className="text-red-200 font-medium">Time is Not on Your Side</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white/90 leading-relaxed">
                      With looming departure deadlines, many service members are forced to sell their vehicles
                      for far less than they're worth.
                    </p>

                    <div className="bg-red-500/10 backdrop-blur-sm border-l-4 border-red-400 p-4 rounded">
                      <p className="text-white font-medium mb-2">Common scenarios:</p>
                      <ul className="space-y-2 text-sm text-white/80">
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>Accepting lowball offers from opportunistic buyers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>Junking a perfectly good car due to time constraints</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          <span>Last-minute panic sales at steep discounts</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* The Speedyo Solution */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInRight}>
              <Card className="bg-emerald-500/10 backdrop-blur-md shadow-xl border border-emerald-400/30 h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="hidden md:flex flex-shrink-0 bg-emerald-500/20 backdrop-blur-sm p-4 rounded-xl border border-emerald-400/30">
                      <Zap className="w-8 h-8 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">The Speedyo Solution</h3>
                      <p className="text-emerald-200 font-medium">Your On-Island Sales Team</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-white/90 leading-relaxed font-medium">
                      Use our Managed Sale Service. We handle everything—even after you've departed.
                    </p>

                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg">
                      <p className="text-white font-semibold mb-3">We handle:</p>
                      <ul className="space-y-2 text-sm text-white/90">
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                          <span>Professional photos & marketing</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                          <span>Buyer negotiations & car viewing</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                          <span>All paperwork & transactions</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-400" />
                          <span>Continue selling after you leave</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-emerald-500/10 backdrop-blur-sm border border-emerald-400/30 p-4 rounded-lg">
                      <p className="text-white font-bold text-lg">Get the best price, hassle-free.</p>
                      <p className="text-emerald-200 text-sm mt-1">No upfront costs • Fee only when sold</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to sell without the stress?
              </h3>
              <p className="text-blue-100 text-lg mb-8">
                Join hundreds of service members who've successfully sold their vehicles through Speedyo's Managed Sales.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
               
               <Link href="/Managed-Sales">
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto">
                    <Handshake className="w-6 h-6 mr-2 hidden md:inline" />
                    Explore Managed Sales
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/Contact">
                  <Button variant="outline" size="lg" className="border border-white text-white bg-transparent hover:bg-white hover:text-blue-600 text-lg px-8 py-6 w-full sm:w-auto">
                    <MessageCircle className="w-6 h-6 mr-2" />
                    Get Free Consultation
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">Trusted by Military</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">No Upfront Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium">Best Price Guarantee</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sell Your Car with Speedyo Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-4 py-2 text-base">
              <Car className="w-4 h-4 mr-2" />
              Start Selling Today
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Ready to Sell Your Car?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">Choose the selling approach that works best for you. Whether you prefer full control or complete convenience, Speedyo has you covered.

            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* DIY Selling Option */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInLeft}>

              <Card className="h-full bg-white border-2 border-slate-200 hover:border-blue-400 transition-all duration-300 hover:shadow-2xl group relative overflow-hidden flex flex-col">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <CardHeader className="relative pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-bold text-slate-800">Sell It Yourself</CardTitle>
                        <p className="text-sm text-slate-500">Full control, maximum flexibility</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-blue-500 text-blue-600 font-semibold">
                      DIY
                    </Badge>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-blue-600">¥8,000</span>
                      <span className="text-slate-600 font-medium">per vehicle</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">One-time payment • Sell up to 3 vehicles per year</p>
                  </div>
                </CardHeader>

                <CardContent className="relative flex flex-col flex-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      What's Included
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Professional listing tools & analytics</span>
                          <p className="text-xs text-slate-500 mt-0.5">Create stunning listings with our advanced editor</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Direct messaging with buyers</span>
                          <p className="text-xs text-slate-500 mt-0.5">Communicate instantly through our secure platform</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Seller dashboard & management</span>
                          <p className="text-xs text-slate-500 mt-0.5">Track views, messages, and performance metrics</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Keep 100% of your sale price</span>
                          <p className="text-xs text-slate-500 mt-0.5">No commission fees or hidden charges</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200">
                    <Button
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                      onClick={handleGetStarted}>
                      <Plus className="w-5 h-5 mr-2" />
                      Start Listing Now
                    </Button>
                    <p className="text-xs text-center text-slate-500 mt-3">
                      Perfect for individual sellers who want full control
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Managed Sales Option */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInRight}>

              <Card className="h-full bg-white border-2 border-emerald-300 hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl shadow-lg group relative overflow-hidden flex flex-col">
                {/* Popular Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 font-semibold shadow-md">
                    <Zap className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <CardHeader className="relative pb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800">Managed Sale Service</CardTitle>
                      <p className="text-sm text-slate-500">Sit back and relax—we handle everything</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-green-100/50 rounded-lg p-4 border-l-4 border-emerald-500">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-4xl font-extrabold text-emerald-600">FREE</span>
                      <span className="text-slate-600 font-medium">to list</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-sm">
                      <span className="text-slate-700 font-medium">Service fee:</span>
                      <span className="text-emerald-700 font-semibold"> ¥30000- ¥50000 minimum</span>
                      <span className="text-slate-500">or</span>
                      <span className="text-emerald-700 font-semibold">6% for ¥8,33300+</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Deducted from proceeds only after sale • No upfront costs</p>
                  </div>
                </CardHeader>

                <CardContent className="relative flex flex-col flex-1">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-emerald-500" />
                      Full-Service Selling
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Professional photography & listing</span>
                          <p className="text-xs text-slate-500 mt-0.5">High-quality photos and compelling descriptions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Expert buyer negotiations</span>
                          <p className="text-xs text-slate-500 mt-0.5">We handle all communications and price discussions</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Car Viewing coordination</span>
                          <p className="text-xs text-slate-500 mt-0.5">Safe, organized viewings with qualified buyers</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3 group/item">
                        <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <span className="text-slate-700 font-medium">Secure transaction handling</span>
                          <p className="text-xs text-slate-500 mt-0.5">Protected payments and complete paperwork assistance</p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200">
                        <Link href="/Managed-Sales">
                      <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-md hover:shadow-lg transition-all">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        Request Managed Sale
                      </Button>
                    </Link>
                    <p className="text-xs text-center text-slate-500 mt-3">
                      Perfect for hassle-free selling with maximum convenience
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Comparison Footer */}
          <motion.div
            className="mt-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

          <Card  className="bg-white rounded-xl p-4 md:p-6 max-w-3xl mx-auto border border-slate-200 shadow-md">
              <CardContent className="p-4 md:p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Not sure which option is right for you?</h3>
                <p className="text-slate-600 mb-6">
                  Both options give you access to thousands of qualified buyers. Choose DIY for maximum control and zero commission, or choose Managed Sales for a completely hands-off experience.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href={'/Subscription'} className="w-full">
                    <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50">
                      Compare All Plans
                    </Button>
                  </Link>
                  <Link href={'/Contact'} className="w-full">
                    <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Talk to an Expert
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - SIMPLIFIED */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            <Badge className="mb-6 bg-gradient-to-r from-blue-500 to-emerald-500 text-white px-6 py-2 text-base shadow-lg">
              <Settings className="w-5 h-5 mr-2" />
              Simple Process
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">How Speedyo Works</h2>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Three simple ways to use Speedyo - choose what works best for you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Lines - Desktop Only */}
            <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-[calc(100%-8rem)] max-w-2xl h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500 opacity-20" style={{ transform: 'translateY(-50%)' }}></div>

            {/* Browse & Buy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInLeft}
              className="relative">

              {/* Step Number */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                1
              </div>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full pt-8 flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  {/* Top section that expands to fill space */}
                  <div className="flex-1 flex flex-col text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Browse & Buy</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Explore thousands of verified vehicles, chat with sellers, and make secure purchases.
                    </p>
                  </div>

                  {/* Benefits list - grouped with button at bottom */}
                  <div className="space-y-3 text-left bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Always free to browse</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Direct seller messaging</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Verified listings</span>
                    </div>
                  </div>

                  {/* Button - stays with benefits list */}
                  <div className="mt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 font-semibold shadow-md"
                      onClick={handleGetStarted}>
                      Start Browsing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sell Your Way */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUpVariants}
              className="relative">

              {/* Step Number */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                2
              </div>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full border-2 border-emerald-300 pt-8 flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  {/* Top section that expands to fill space */}
                  <div className="flex-1 flex flex-col text-center">
                    <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-3 py-1 shadow-md mx-auto">
                      Most Popular
                    </Badge>
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Sell Your Way</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      DIY listing tools or full-service managed sales - you choose how to sell.
                    </p>
                  </div>

                  {/* Benefits list - grouped with button at bottom */}
                  <div className="space-y-3 text-left bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">¥5,000/car DIY option</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Or managed service</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Professional tools included</span>
                    </div>
                  </div>

                  {/* Button - stays with benefits list */}
                  <div className="mt-4">
                 <Link href="/Subscription">
                      <Button className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 h-12 font-semibold shadow-md">
                        Start Selling
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scale Your Business */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={slideInRight}
              className="relative">

              {/* Step Number */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg z-10">
                3
              </div>

              <Card className="bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 h-full pt-8 flex flex-col">
                <CardContent className="p-8 flex flex-col flex-1">
                  {/* Top section that expands to fill space */}
                  <div className="flex-1 flex flex-col text-center">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Scale Your Business</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">
                      Dealership plans with unlimited listings and advanced features.
                    </p>
                  </div>

                  {/* Benefits list - grouped with button at bottom */}
                  <div className="space-y-3 text-left bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Starting at  ¥39900/month</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Advanced analytics & CRM</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">Unlimited vehicle listings</span>
                    </div>
                  </div>

                  {/* Button - stays with benefits list */}
                  <div className="mt-4">
                 <Link href="/DealershipRegistration">
                      <Button variant="outline" className="w-full border-2 border-amber-300 text-amber-700 hover:bg-amber-50 h-12 font-semibold">
                        Become a Dealer
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            className="mt-16 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            <Card className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border-2 border-blue-200 max-w-3xl mx-auto shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-4">Ready to Get Started?</h3>
                <p className="text-slate-600 mb-6 text-lg">
                  Join thousands who trust Speedyo for buying, selling, and connecting in the automotive world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleGetStarted}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 shadow-md h-12 px-8 font-semibold">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                <Link href="/Marketplace">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 h-12 px-8 font-semibold">
                      Browse Vehicles
                      <Car className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 pt-6 border-t border-blue-200">
                  <div className="flex flex-wrap justify-center items-center gap-6 text-slate-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium">Free to join</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm font-medium">Verified listings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      <span>Secure platform</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUpVariants}>

            <h2 className="text-4xl font-bold text-slate-800 mb-4">What Our Users Say</h2>
            <p className="text-xl text-slate-600">Join thousands of satisfied buyers, sellers, and enthusiasts</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}>

            {landingTestimonials.map((testimonial, index) =>
            <motion.div key={index} variants={fadeUpVariants}>
                <Card className="bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) =>
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                    )}
                    </div>
                    <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <p className="font-semibold text-slate-800">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-20 bg-gradient-to-r from-blue-500 to-emerald-500"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUpVariants}>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
            variants={slideInLeft}>

            Ready to Start Your Journey?
          </motion.h2>
          <motion.p
            className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto"
            variants={slideInRight}>

            Join Speedyo today and discover why we're the preferred choice for automotive enthusiasts worldwide.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeUpVariants}>

            {isAuthCheckComplete ?
            currentUser ?
            <Button
            onClick={() => router.push("/Feed")}
              size="lg"
              className="flex items-center justify-center text-lg px-8 py-4 h-auto font-semibold bg-white text-blue-600 hover:bg-slate-100 w-full sm:w-auto">

                  <Heart className="w-5 h-5 mr-2" />
                  Go to Social Feed
                </Button> :

            <Button
              onClick={handleGetStarted}
              size="lg"
              className="flex items-center justify-center text-lg px-8 py-4 h-auto font-semibold bg-white text-blue-600 hover:bg-slate-100 w-full sm:w-auto">

                  <Heart className="w-5 h-5 mr-2" />
                  Join the Community
                </Button> :


            <Button
              size="lg"
              className="flex items-center justify-center text-lg px-8 py-4 h-auto font-semibold bg-white text-blue-600 w-full sm:w-auto cursor-not-allowed opacity-70"
              disabled>

                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Loading...
              </Button>
            }

            <Link href="/Subscription" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-center text-lg px-8 py-4 h-auto font-semibold border border-white text-white bg-transparent hover:bg-white hover:text-blue-600 w-full sm:w-auto">

                View Seller Plans
                <TrendingUp className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-10 flex justify-center items-center gap-6 text-blue-200 flex-wrap"
            variants={fadeUpVariants}>

            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free to join</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Verified listings</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Secure platform</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}

      <Footer />

    </div>
    );
}
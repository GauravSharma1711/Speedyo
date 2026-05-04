import { Car, Shield, TrendingUp, Users } from "lucide-react";
import type { LandingFeature, LandingTestimonial } from "./landingTypes";

export const landingFeatures: LandingFeature[] = [
  {
    icon: Car,
    title: "Smart Marketplace",
    description:
      "Browse thousands of verified vehicles from trusted sellers and dealerships.",
    color: "blue",
  },
  {
    icon: Users,
    title: "Social Community",
    description:
      "Connect with fellow car enthusiasts, share experiences, and discover trends.",
    color: "emerald",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Verified listings, secure messaging, and protected transactions for peace of mind.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Seller Tools",
    description:
      "Powerful analytics, subscription tiers, and tools to maximize your sales potential.",
    color: "amber",
  },
];

export const landingTestimonials: LandingTestimonial[] = [
  {
    name: "Sarah Chen",
    role: "Happy Buyer",
    content:
      "Found my dream car in just 2 days! The verification process gave me complete confidence in my purchase.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "Pro Seller",
    content:
      "Sold 12 vehicles this year through Speedio. The analytics and seller tools are game-changing!",
    rating: 5,
  },
  {
    name: "Jennifer Park",
    role: "Car Enthusiast",
    content:
      "Love the community aspect! Sharing my restoration projects and connecting with other enthusiasts.",
    rating: 5,
  },
];


import type { ComponentType } from "react";

export interface Stats {
  verifiedListings: number;
  happyUsers: number;
  satisfactionRate: number;
  isLoading: boolean;
}

export type LandingIcon = ComponentType<{ className?: string }>;

export interface LandingFeature {
  icon: LandingIcon;
  title: string;
  description: string;
  color: string;
}

export interface LandingTestimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}


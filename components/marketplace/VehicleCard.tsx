"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Car, MapPin, Eye, Shield, Star } from "lucide-react";
import Link from "next/link";
import { PublicUser } from "@/api/entities";

interface Vehicle {
  id: string;
  created_by_id?: string;
  primary_image?: string;
  title?: string;
  year?: number;
  mileage?: number;
  location?: string;
  price?: number;
  status?: string;
  featured?: boolean;
  verified?: boolean;
  views?: number;
}

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const [seller, setSeller] = useState<any>(null);
  const [isLoadingSeller, setIsLoadingSeller] = useState(true);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!vehicle.created_by_id) {
        setIsLoadingSeller(false);
        return;
      }

      try {
        const profiles = await PublicUser.filter({ user_id: vehicle.created_by_id });
        setSeller(
          profiles.length > 0
            ? profiles[0]
            : { full_name: "Unknown Seller", user_type: "guest", profile_image: null, verified: false }
        );
      } catch (error) {
        console.error("Failed to fetch seller:", error);
        setSeller({ full_name: "Unknown Seller", user_type: "guest", profile_image: null, verified: false });
      } finally {
        setIsLoadingSeller(false);
      }
    };

    fetchSeller();
  }, [vehicle.created_by_id]);

  const sellerName = seller?.full_name || "Unknown Seller";
  const sellerAvatar = seller?.profile_image;
  const sellerInitial = sellerName[0] || "S";

  return (
    // Next.js: <Link href="..."> replaces <Link to="..."> from react-router-dom
    // Path structure: /vehicle?id=... (adjust to match your Next.js route)
    <Link href={`/vehicle?id=${vehicle.id}`} className="h-full">
      <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col">
        <div className="h-64 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg relative overflow-hidden flex-shrink-0">
          {vehicle.primary_image ? (
            // Next.js: using <img> here since vehicle images are external/dynamic URLs.
            // Switch to next/image if you configure remotePatterns in next.config.ts.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vehicle.primary_image}
              alt={vehicle.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Car className="w-12 h-12 text-slate-400" />
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {vehicle.featured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {vehicle.verified && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge
              variant={vehicle.status === "available" ? "default" : "secondary"}
              className={`capitalize ${
                vehicle.status === "unavailable"
                  ? "bg-amber-100 text-amber-800 border-amber-300"
                  : vehicle.status === "sold"
                  ? "bg-slate-500 text-white"
                  : ""
              }`}
            >
              {vehicle.status}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
              {vehicle.title}
            </h3>
            <p className="text-sm text-slate-500">
              {vehicle.year} • {vehicle.mileage?.toLocaleString()} km
            </p>
          </div>

          <div className="flex items-center text-sm text-slate-600">
            <MapPin className="w-4 h-4 mr-1 text-slate-400 flex-shrink-0" />
            <span className="truncate">{vehicle.location}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex-1 min-w-0">
              <p className="text-2xl font-bold text-blue-600">
                ${vehicle.price?.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {isLoadingSeller ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ) : (
                  <>
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={sellerAvatar} />
                      <AvatarFallback className="text-xs bg-slate-200">
                        {sellerInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-slate-500 truncate">
                      {sellerName}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
              <Eye className="w-3 h-3" />
              {vehicle.views || 0}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
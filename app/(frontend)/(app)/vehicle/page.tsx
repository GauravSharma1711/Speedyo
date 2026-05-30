"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Car,
  MapPin,
  Shield,
  MessageCircle,
  CheckCircle,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  FileText,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Separator } from "@/components/ui/Separator";
import { Skeleton } from "@/components/ui/Skeleton";
import TestDriveModal from "@/components/messages/TestDriveModal";
import PostCard from "@/components/feed/PostCard";
import { useToast } from "@/components/ui/UseToast";
import { useVehicleDetailsStore } from "@/store/vehicle/vehicleDetails";
import { useVehicleActionsStore } from "@/store/vehicle/vehicleActions";
import { useVehiclePostsStore } from "@/store/posts/vehiclePosts";

type VehicleUI = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  description: string;
  location: string;
  price: number;
  status: "available" | "unavailable" | "sold";
  featured?: boolean;
  verified?: boolean;
  views?: number;
  saves?: number;
  website_managed?: boolean;

  primary_image?: string;
  images?: string[];

  fuel_type?: string;
  transmission?: string;

  recurring_availability?: Array<{
    day_of_week: string;
    start_time: string;
    end_time: string;
    meeting_address: string;
  }>;
};

type SellerUI = {
  user_id: string;
  full_name: string;
  user_type: "private_seller" | "dealership" | "guest";
  role?: "admin" | "user";
  profile_image: string | null;
  verified: boolean;
  bio?: string | null;
  location?: string | null;
};

type ManagedSaleRequestUI = {
  id: string;
  owner_receives_amount?: number | null;
  service_fee_amount?: number | null;
  vehicle_details?: {
    seller_asking_price?: number | null;
    financing_available?: "Yes" | "No" | null;
    warranty_available?: "Yes" | "No" | null;
    warranty_link?: string | null;

    body_type?: string | null;
    exterior_color?: string | null;
    interior_color?: string | null;
    doors?: number | null;
    seating_capacity?: number | null;
    steering_wheel?: string | null;

    engine_type?: string | null;
    engine_size?: string | null;
    power_output?: string | null;
    fuel_efficiency?: string | null;
    drivetrain?: string | null;
    drive_type?: string | null;

    headlights?: string | null;
    fog_lights?: string | null;
    alloy_wheels?: boolean | null;
    spoiler?: boolean | null;
    tinted_windows?: boolean | null;
    roof_type?: string | null;
    side_mirrors?: string | null;
    power_sliding_doors?: string | null;

    air_conditioning?: string | null;
    upholstery?: string | null;
    seat_type?: string | null;
    seat_adjustments?: string | null;
    power_windows?: string | null;
    interior_lighting?: string | null;
    cup_holders_storage?: boolean | null;
    child_lock_isofix?: boolean | null;
    navigation_system?: string | null;
    rear_camera?: boolean | null;
    parking_sensors?: string | null;

    abs?: boolean | null;
    esc_stability_control?: boolean | null;
    traction_control?: boolean | null;
    lane_departure_warning?: boolean | null;
    collision_mitigation?: boolean | null;
    cruise_control?: string | null;
    hill_start_assist?: boolean | null;
    immobilizer_alarm?: boolean | null;
    seat_belt_sensors?: boolean | null;
    airbags?: string[] | null;
    keyless_entry?: boolean | null;
    remote_door_locking?: boolean | null;

    bluetooth?: boolean | null;
    usb_ports?: boolean | null;
    twelve_v_outlet?: boolean | null;
    smart_key_push_start?: boolean | null;
    display_screen_size?: string | null;
    rear_entertainment_system?: boolean | null;
    voice_command_hands_free?: boolean | null;
    digital_dashboard_display?: boolean | null;
    infotainment_system?: string[] | null;
    steering_wheel_controls?: string[] | null;
  };
};

type PostUI = {
  id: string;
  created_date: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar: string | null;

  reactions?: Record<string, number>;
  user_reactions?: Array<{ user_email: string; reaction: string }>;
  comments_count?: number;
  shares?: number;
  views?: number;
};

function toNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const n = Number.parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : 0;
}

function VehiclePageContent(){

  
  const sp = useSearchParams();
  const vehicleId = (sp.get("id") ?? "").trim();
  const router = useRouter();
  const { toast } = useToast();

  const vehicleApi = useVehicleDetailsStore((s) => s.vehicle);
  const sellerApi = useVehicleDetailsStore((s) => s.seller);
  const msrApi = useVehicleDetailsStore((s) => s.msr);
  const isLoading = useVehicleDetailsStore((s) => s.isLoading);
  const isSellerLoading = useVehicleDetailsStore((s) => s.isSellerLoading);
  const isMsrLoading = useVehicleDetailsStore((s) => s.isMsrLoading);
  const error = useVehicleDetailsStore((s) => s.error);
  const fetchVehicle = useVehicleDetailsStore((s) => s.fetchVehicle);
  const fetchSeller = useVehicleDetailsStore((s) => s.fetchSeller);
  const incrementViews = useVehicleDetailsStore((s) => s.incrementViews);
  const fetchMsrByVehicle = useVehicleDetailsStore((s) => s.fetchMsrByVehicle);

  const posts = useVehiclePostsStore((s) => s.items);
  const postsLoading = useVehiclePostsStore((s) => s.isLoading);
  const postsError = useVehiclePostsStore((s) => s.error);
  const fetchPosts = useVehiclePostsStore((s) => s.fetch);

  const requestTestDrive = useVehicleActionsStore((s) => s.requestTestDrive);
  const toggleSave = useVehicleActionsStore((s) => s.toggleSave);
  const toggleLike = useVehicleActionsStore((s) => s.toggleLike);
  const share = useVehicleActionsStore((s) => s.share);
  const isRequestingTestDrive = useVehicleActionsStore((s) => s.isRequestingTestDrive);
  const isSaving = useVehicleActionsStore((s) => s.isSaving);
  const isLiking = useVehicleActionsStore((s) => s.isLiking);
  const isSharing = useVehicleActionsStore((s) => s.isSharing);
  const [savesCount, setSavesCount] = useState(0);
  const [shareHint, setShareHint] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;
    fetchVehicle(vehicleId);
  }, [vehicleId, fetchVehicle]);

  useEffect(() => {
    if (!vehicleApi?.id) return;
    incrementViews(vehicleApi.id);
    fetchSeller(vehicleApi.id);
    fetchPosts(vehicleApi.id, { page: 1, limit: 10 });
    if (vehicleApi.website_managed) fetchMsrByVehicle(vehicleApi.id);
  }, [vehicleApi?.id]);

  useEffect(() => {
    if (!vehicleApi?.id) return;
    setSavesCount((vehicleApi as any).saves_count ?? 0);
  }, [vehicleApi?.id, (vehicleApi as any)?.saves_count]);

  const vehicle: VehicleUI | null = useMemo(() => {
    if (!vehicleApi) return null;
    return {
      id: vehicleApi.id,
      title: vehicleApi.title ?? "Vehicle",
      make: vehicleApi.make ?? "",
      model: vehicleApi.model ?? "",
      year: vehicleApi.year ?? 0,
      mileage: vehicleApi.mileage ?? 0,
      condition: vehicleApi.condition ?? "",
      description: vehicleApi.description ?? "",
      location: vehicleApi.location ?? "",
      price: toNumber(vehicleApi.price),
      status: (vehicleApi.status ?? "available") as any,
      featured: vehicleApi.featured,
      verified: vehicleApi.verified,
      views: vehicleApi.views,
      saves: (vehicleApi as any).saves_count ?? 0,
      website_managed: vehicleApi.website_managed,
      primary_image: vehicleApi.primary_image ?? undefined,
      images: Array.isArray(vehicleApi.images) ? vehicleApi.images : [],
      fuel_type: vehicleApi.fuel_type ?? undefined,
      transmission: vehicleApi.transmission ?? undefined,
      recurring_availability: Array.isArray(vehicleApi.recurring_availability)
        ? (vehicleApi.recurring_availability as any)
        : [],
    };
  }, [vehicleApi]);

  const seller: SellerUI | null = useMemo(() => {
    if (!sellerApi) return null;
    return {
      user_id: sellerApi.id,
      full_name: sellerApi.full_name ?? "Seller",
      user_type: (sellerApi.user_type ?? "guest") as any,
      role: (sellerApi.role ?? "user") as any,
      profile_image: sellerApi.profile_image ?? null,
      verified: Boolean(sellerApi.isVerified),
      bio: sellerApi.bio ?? null,
      location: sellerApi.location ?? null,
    };
  }, [sellerApi]);

  const managedSaleRequest: ManagedSaleRequestUI | null = useMemo(() => {
    if (!msrApi) return null;
    return {
      id: msrApi.id,
      owner_receives_amount: msrApi.owner_receives_amount != null ? toNumber(msrApi.owner_receives_amount) : null,
      service_fee_amount: msrApi.service_fee_amount != null ? toNumber(msrApi.service_fee_amount) : null,
      vehicle_details: (msrApi.vehicle_details ?? {}) as any,
    };
  }, [msrApi]);

  const allImages = useMemo(() => {
    if (!vehicle) return [];
    const list = [vehicle.primary_image, ...(vehicle.images ?? [])].filter(Boolean) as string[];
    return Array.from(new Set(list));
  }, [vehicle?.primary_image, vehicle?.images]);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  useEffect(() => {
    setActiveImage(allImages[0] ?? null);
  }, [allImages.join("|")]);

  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const basePrice =
    managedSaleRequest?.owner_receives_amount ??
    managedSaleRequest?.vehicle_details?.seller_asking_price ??
    null;
  const serviceFee = managedSaleRequest?.service_fee_amount ?? null;
  const totalPrice = vehicle?.price ?? 0;

  const handleTestDriveSubmit = async (data: any) => {
    if (!vehicle) return;
    try {
      await requestTestDrive(vehicle.id, {
        requested_date: data?.preferred_date,
        requested_time: data?.preferred_time,
        additional_notes: data?.notes ?? "",
      });
      setShowTestDriveModal(false);
      setShowConfirmationModal(true);
    } catch (e) {
      toast({
        title: "Failed to request car viewing",
        description: e instanceof Error ? e.message : "Failed to request car viewing",
        variant: "destructive",
      });
    }
  };

  const handleReactToPost = async (post: PostUI, reactionType: string) => {
    // keep legacy behavior: PostCard itself updates via Post.update (existing entity layer).
    void post;
    void reactionType;
  };

  const handleCommentOnPost = async (_postId: string) => {
    // UI-only: no-op
  };

  const handleSharePost = async (_postId: string, _platform: string) => {
    void _postId;
    void _platform;
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <Skeleton className="h-12 w-1/2 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="w-24 h-16 rounded-md" />
              <Skeleton className="w-24 h-16 rounded-md" />
              <Skeleton className="w-24 h-16 rounded-md" />
            </div>
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-semibold">Vehicle not found</h2>
        <p className="text-slate-600 mt-2">
          This listing may have been removed or the link is incorrect.
        </p>
        <Button asChild className="mt-6">
          <Link href="/Marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br pt-1 p-2 sm:p-4 min-h-screen from-slate-50 via-blue-50/30 to-emerald-50/30 md:p-8">
      {showTestDriveModal && (
        <TestDriveModal
          conversation={managedSaleRequest ? ({ managedSaleRequestId: managedSaleRequest.id } as any) : null}
          vehicles={[
            {
              id: vehicle.id,
              title: vehicle.title,
              location: vehicle.location,
              recurring_availability: vehicle.recurring_availability ?? [],
            },
          ]}
          preselectedVehicleId={vehicle.id}
          currentUser={null}
          onClose={() => setShowTestDriveModal(false)}
          onSubmit={handleTestDriveSubmit}
        />
      )}

      <AnimatePresence>
        {showConfirmationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md"
            >
              <Card className="bg-white text-center">
                <CardContent className="p-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
                  <p className="text-slate-600 mb-6">
                    Your car viewing request for the “{vehicle.title}” has been sent. You’ll receive updates in
                    Messages.
                  </p>
                  <Button onClick={() => setShowConfirmationModal(false)} className="w-full">
                    Great, thanks!
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-8">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/Marketplace">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800">{vehicle.title}</h1>
          <div className="flex items-center gap-2 mt-2 text-slate-500">
            <MapPin className="w-4 h-4" />
            <span>{vehicle.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden shadow-lg bg-white/80 backdrop-blur-sm">
              <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                {activeImage ? (
                  <img src={activeImage} alt={vehicle.title} className="w-full h-full object-cover" />
                ) : (
                  <Car className="w-24 h-24 text-slate-300" />
                )}
              </div>
            </Card>

            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`shrink-0 rounded-md overflow-hidden border ${
                      activeImage === img ? "border-blue-500" : "border-slate-200"
                    }`}
                    aria-label="Select image"
                  >
                    <img src={img} alt="" className="w-24 h-16 object-cover" />
                  </button>
                ))}
              </div>
            )}

            <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{vehicle.description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {basePrice != null && serviceFee != null ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Price:</span>
                      <span className="font-semibold">¥{Number(basePrice).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Other Fees:</span>
                      <span className="font-semibold">¥{Number(serviceFee).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-slate-800">Total Price:</span>
                      <span className="text-3xl font-bold text-blue-600">¥{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-blue-600 mb-4">¥{vehicle.price.toLocaleString()}</p>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>{vehicle.views ?? 0} views</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4" />
                    <span>{savesCount} saves</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowTestDriveModal(true)}
                  className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
                  disabled={isRequestingTestDrive}
                >
                  Schedule Car Viewing
                </Button>

                <Button
                  onClick={() => {
                    const recipientId = seller?.user_id;
                    if (!recipientId) {
                      toast({
                        title: "Cannot open messages",
                        description: "Seller information is unavailable for this listing.",
                        variant: "destructive",
                      });
                      return;
                    }
                    const qs = new URLSearchParams({
                      recipient: recipientId,
                      vehicle: vehicle.id,
                    });
                    if (managedSaleRequest?.id) qs.set("managedSaleRequest", managedSaleRequest.id);
                    router.push(`/Messages?${qs.toString()}`);
                  }}
                  className="w-full mt-3"
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Seller
                </Button>

                <div className="flex mt-3 space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`flex-1 ${isFavorited ? "text-red-600 border-red-200" : ""}`}
                    onClick={async () => {
                      if (!vehicle || isSaving) return;


                      const wasFavorited = isFavorited;
                      const previousSavesCount = savesCount;
                      setIsFavorited(!isFavorited);
                      setSavesCount(savesCount + (wasFavorited ? -1 : 1));

                      try {
                        const res = await toggleSave(vehicle.id);
                        setIsFavorited(res.saved);
                        if (typeof res.saves_count === "number") setSavesCount(res.saves_count);
                      } catch (e) {
                        setIsFavorited(wasFavorited);
                        setSavesCount(previousSavesCount);
                        toast({
                          title: "Failed to save",
                          description: e instanceof Error ? e.message : "Failed to save",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isSaving}
                    aria-label="Save vehicle"
                  >
                    <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`flex-1 ${showShareModal ? "text-blue-600 border-blue-200" : ""}`}
                    onClick={async () => {
                      if (!vehicle) return;

                      const url = window.location.href;

                      if (
                        typeof navigator !== "undefined" &&
                        "share" in navigator &&
                        typeof (navigator as any).share === "function"
                      ) {
                        try {
                          await (navigator as any).share({ title: vehicle.title, url });
                          // Native share succeeded, now update DB
                          await share(vehicle.id);
                          setShareHint("Shared");
                          return;
                        } catch (e) {
                          // User cancelled or error, fall through to copy link
                        }
                      }

                      // Fallback: copy link to clipboard
                      try {
                        await share(vehicle.id);
                        await navigator.clipboard.writeText(url);
                        setShareHint("Link copied");
                        toast({ title: "Link copied", description: "Vehicle link copied to clipboard." });
                      } catch (e) {
                        setShareHint("Failed to share");
                        toast({
                          description: e instanceof Error ? e.message : "Failed to share",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={isSharing}
                    aria-label="Share vehicle"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {showShareModal && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                    {shareHint ?? "Link copied"}
                  </div>
                )}
              </CardContent>
            </Card>
            {seller ? (
              <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>About the Seller</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-16 h-16 border-2 border-blue-200">
                      <AvatarImage src={seller.profile_image ?? ""} />
                      <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                        {seller.full_name?.[0] || "S"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{seller.full_name}</h3>
                      {seller.role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="capitalize mt-1 bg-slate-100 text-slate-700 border-slate-300"
                        >
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="capitalize mt-1">
                          {seller.user_type === "private_seller"
                            ? "Private Seller"
                            : seller.user_type === "dealership"
                              ? "Dealership"
                              : "Seller"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {seller.verified && (
                    <div className="flex items-center gap-2 text-blue-600 mb-4 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm">Verified Seller</span>
                    </div>
                  )}

                  {seller.bio && <p className="text-slate-600 mb-4">{seller.bio}</p>}

                  <Separator className="my-4" />

                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/Profile?id=${seller.user_id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>About the Seller</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-500">
                    <p className="font-medium">Seller information not available</p>
                    <p className="text-sm mt-1">This is a legacy listing.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="w-full space-y-8">
          <Card className="shadow-lg bg-white border-0">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-2xl">Vehicle Specifications</CardTitle>
              <p className="text-sm text-slate-600 mt-1">Comprehensive details about this vehicle</p>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              <div className="space-y-10">
                <div className="bg-slate-50/50 rounded-xl p-6 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Make / Model</p>
                      <p className="text-base font-semibold text-slate-900">
                        {vehicle.make} {vehicle.model}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Year</p>
                      <p className="text-base font-semibold text-slate-900">{vehicle.year}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mileage</p>
                      <p className="text-base font-semibold text-slate-900">{vehicle.mileage.toLocaleString()} km</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Condition</p>
                      <p className="text-base font-semibold text-slate-900 capitalize">{vehicle.condition}</p>
                    </div>

                    {managedSaleRequest?.vehicle_details?.body_type && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Body Type</p>
                        <p className="text-base font-semibold text-slate-900 capitalize">
                          {managedSaleRequest.vehicle_details.body_type.replaceAll("_", " ")}
                        </p>
                      </div>
                    )}

                    {managedSaleRequest?.vehicle_details?.exterior_color && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Exterior Color</p>
                        <p className="text-base font-semibold text-slate-900">
                          {managedSaleRequest.vehicle_details.exterior_color}
                        </p>
                      </div>
                    )}

                    {managedSaleRequest?.vehicle_details?.interior_color && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Interior Color</p>
                        <p className="text-base font-semibold text-slate-900">
                          {managedSaleRequest.vehicle_details.interior_color}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-emerald-50/30 rounded-xl p-6 border border-emerald-100/50">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                    Engine & Performance
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Fuel Type</p>
                      <p className="text-base font-semibold text-slate-900 capitalize">
                        {vehicle.fuel_type ?? "—"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Transmission</p>
                      <p className="text-base font-semibold text-slate-900 capitalize">
                        {vehicle.transmission ?? "—"}
                      </p>
                    </div>

                    {managedSaleRequest?.vehicle_details?.drivetrain && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Drivetrain</p>
                        <p className="text-base font-semibold text-slate-900 uppercase">
                          {managedSaleRequest.vehicle_details.drivetrain}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {vehicle.website_managed &&
                  managedSaleRequest?.vehicle_details &&
                  (managedSaleRequest.vehicle_details.financing_available === "Yes" ||
                    managedSaleRequest.vehicle_details.warranty_available === "Yes") && (
                    <div className="bg-gradient-to-br from-green-50/50 to-blue-50/50 rounded-xl p-6 border border-green-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                        <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                        Financing & Warranty
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {managedSaleRequest.vehicle_details.financing_available === "Yes" && (
                          <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              </div>
                              <div>
                                <p className="font-bold text-green-900 text-base mb-1">Financing Available</p>
                                <p className="text-sm text-slate-600">Contact us for financing options and rates</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {managedSaleRequest.vehicle_details.warranty_available === "Yes" && (
                          <div className="bg-white rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-blue-900 text-base mb-1">Warranty Available</p>
                                {managedSaleRequest.vehicle_details.warranty_link ? (
                                  <p className="text-sm text-slate-600">
                                    {managedSaleRequest.vehicle_details.warranty_link}
                                  </p>
                                ) : (
                                  <p className="text-sm text-slate-600">Contact us for warranty details</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {vehicle.website_managed && (
            <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Documents Provided for Transfer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  All documents required for Kanji to Y-Plate transfer are included with your purchase:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "JCI Policy (transferred to your name)",
                    "Current Year Road Tax Receipt",
                    "Japanese Bill of Sale",
                    "Stamp Registration Paper (Inkan Sho Mei Sho)",
                    "Original Japanese Title",
                  ].map((doc) => (
                    <div
                      key={doc}
                      className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-blue-900 font-medium">{doc}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/vehicle-transfer-guide"
                  className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <Info className="w-4 h-4 mr-1" />
                  View Complete Transfer Guide & Process
                </Link>
              </CardContent>
            </Card>
          )}

          {vehicle.website_managed && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                Included with Your Purchase
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-md bg-gradient-to-br from-emerald-50 to-white border-emerald-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-emerald-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Vehicle Inspection</h4>
                    <p className="text-sm text-slate-600">Professional inspection and maintenance included</p>
                  </CardContent>
                </Card>

                <Card className="shadow-md bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">No Repair History</h4>
                    <p className="text-sm text-slate-600">Clean history with no known repairs</p>
                  </CardContent>
                </Card>

                <Card className="shadow-md bg-gradient-to-br from-purple-50 to-white border-purple-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Full Documentation</h4>
                    <p className="text-sm text-slate-600">Complete transfer support included</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {posts.length > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  Community Posts & Updates
                  <Badge variant="outline">{posts.length}</Badge>
                </CardTitle>
                <p className="text-slate-600">See what the community is saying about this vehicle</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={
                      ({
                        ...post,
                        created_date: (post as any).created_date ?? (post as any).createdAt ?? new Date().toISOString(),
                      } as any)
                    }
                    onReact={(reactionType) => {
                      if (reactionType === null) return;
                      return handleReactToPost(post as any, reactionType);
                    }}
                    onComment={() => handleCommentOnPost(post.id)}
                    onShare={(p) => handleSharePost((p as any).id ?? post.id, "copy")}
                    onEdit={() => {}}
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

}

export default function VehiclePage() {


     return (
      <Suspense fallback={<div>Loading...</div>}>
        <VehiclePageContent />
      </Suspense>
    )


}


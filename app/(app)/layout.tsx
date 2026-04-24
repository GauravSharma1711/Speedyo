"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  PlaneLanding, Home, Car, User, MessageCircle, Shield, Bell, LogOut, LogIn,
  DollarSign, Handshake, MessageSquare, ClipboardList, CalendarCheck, Megaphone,
  UserCheck, PlusSquare, HelpCircle, LayoutDashboard, ShoppingCart, TrendingUp, ArrowRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter,
  SidebarProvider, SidebarTrigger
} from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/DropdownMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/UseToast";
import { Toaster } from "@/components/ui/Toaster";

// TODO: Replace these with your actual Next.js API/auth calls
import { UserEntity, PublicUser ,Notification} from "@/api/entities";

import SetupAccountDialog from "@/components/setup/SetupAccountDialog";
import FeedbackModal from "@/components/feedback/FeedbackModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const navigationItems = [
  { title: "Feed",          href: "/Feed",          icon: Home,          description: "Social feed"        },
  { title: "Marketplace",   href: "/Marketplace",   icon: Car,           description: "Browse vehicles"    },
  { title: "Messages",      href: "/Messages",      icon: MessageCircle, description: "Chat with sellers"  },
  { title: "Dashboard",     href: "/Dashboard",     icon: LayoutDashboard, description: "Manage listings"  },
  { title: "Managed Sales", href: "/Managed-Sales", icon: Handshake,     description: "Full-service selling" },
];

const protectedPaths = ["/feed", "/dashboard", "/profile", "/messages", "/verification", "/admin", "/subscription"];

const getNotificationIcon = (iconName: string) => {
  const icons: Record<string, React.ElementType> = {
    MessageSquare, ClipboardList, CalendarCheck, Megaphone,
    UserCheck, Car, Handshake, DollarSign, Bell,
  };
  const IconComponent = icons[iconName];
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <Bell className="w-5 h-5" />;
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser]               = useState<any>(null);
  const [currentUserDisplay, setCurrentUserDisplay] = useState<any>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [notifications, setNotifications]           = useState<any[]>([]);
  const [unreadCount, setUnreadCount]               = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError]   = useState<string | null>(null);
  const [showSetupDialog, setShowSetupDialog]       = useState(false);
  const [showFeedbackModal, setShowFeedbackModal]   = useState(false);
  const [hideBottomNav, setHideBottomNav]           = useState(false);

  const pollingIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchNotificationsRef = useRef<((isInitialLoad?: boolean) => void) | null>(null);
  const POLLING_RATE = 120000;

  // Derive page-specific max-width from pathname
  const getContentMaxWidth = () => {
    if (pathname.startsWith("/dashboard"))    return "max-w-5xl";
    if (pathname.startsWith("/feed"))         return "max-w-4xl";
    if (pathname.startsWith("/marketplace"))  return "max-w-7xl";
    if (pathname.startsWith("/messages"))     return "max-w-5xl";
    if (pathname.startsWith("/profile"))      return "max-w-6xl";
    return "max-w-6xl";
  };

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // Nav active state helpers
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const getNavButtonClasses = (href: string) =>
    isActive(href)
      ? "border-blue-600 text-blue-600 bg-transparent"
      : "border-transparent text-slate-500 hover:bg-slate-100/50 hover:border-slate-300 hover:text-blue-600";

  // ---------------------------------------------------------------------------
  // Auth check
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      let user: any = null;
      try {
        user = await UserEntity.me();
        setCurrentUser(user);

        // Fetch or create PublicUser profile
        try {
          const publicProfiles = await PublicUser.filter({ user_id: user.id });
          if (publicProfiles.length > 0) {
            const existingProfile = publicProfiles[0];
            const shouldUpdate =
              (user.user_type && user.user_type !== existingProfile.user_type) ||
              user.verified !== existingProfile.verified ||
              (user.role && user.role !== existingProfile.role);

            if (shouldUpdate) {
              const updated = await PublicUser.update(existingProfile.id, {
                user_type: user.user_type || existingProfile.user_type,
                verified:  user.verified  || existingProfile.verified,
                role:      user.role      || existingProfile.role,
              });
              setCurrentUserDisplay(updated);
            } else {
              setCurrentUserDisplay(existingProfile);
            }
          } else {
            const newProfile = await PublicUser.create({
              user_id:       user.id,
              full_name:     user.full_name    || "New User",
              profile_image: user.profile_image,
              user_type:     user.user_type    || "guest",
              verified:      user.verified     || false,
              bio:           user.bio          || "",
              location:      user.location     || "",
              role:          user.role         || "user",
            });
            setCurrentUserDisplay(newProfile);
          }
        } catch {
          setCurrentUserDisplay({
            full_name:     user.full_name    || "User",
            profile_image: user.profile_image,
            user_type:     user.user_type    || "guest",
            verified:      user.verified     || false,
          });
        }

      } catch {
        setCurrentUser(null);
        setCurrentUserDisplay(null);
        user = null;
      } finally {
        setIsAuthCheckComplete(true);
        if (!user && protectedPaths.some(p => pathname.startsWith(p))) {
          router.push("/login");  // or window.location.href = "https://speedyo.app/login"
        }
      }
    };
    fetchUser();
  }, [pathname]);  // re-runs on route change, same as original currentPageName dep

  // ---------------------------------------------------------------------------
  // Setup dialog
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentUser && currentUserDisplay && isAuthCheckComplete) {
      const isSetupMarkedComplete = !!currentUser.setup_completed;
      const hasProfileImage = !!currentUserDisplay.profile_image;
      const hasLocation     = !!currentUserDisplay.location;
      const hasRealName     = currentUserDisplay.full_name &&
                              currentUserDisplay.full_name !== currentUser.email?.split("@")[0];

      setShowSetupDialog(!isSetupMarkedComplete && (!hasProfileImage || !hasLocation || !hasRealName));
    } else {
      setShowSetupDialog(false);
    }
  }, [currentUser, currentUserDisplay, isAuthCheckComplete]);

  const handleSetupUpdate = async () => {
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);
      const profiles = await PublicUser.filter({ user_id: user.id });
      setCurrentUserDisplay(profiles[0] ?? { full_name: user.full_name || "User", profile_image: user.profile_image, user_type: user.user_type || "guest", verified: user.verified || false });
    } catch (e) { console.error(e); }
  };

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  const fetchNotifications = useCallback(async (isInitialLoad = false) => {
    if (!currentUser?.id) return;
    if (isInitialLoad) setIsNotificationsLoading(true);
    setNotificationError(null);
    try {
      const items = await Notification.filter({ recipient_id: currentUser.id }, "-created_date", 10);
      setNotifications(items);
      setUnreadCount(items.filter((n: any) => !n.read).length);
    } catch (error: any) {
      if (error?.response?.status === 429) {
        setNotificationError("Too many requests. Notifications paused temporarily.");
        if (pollingIntervalRef.current) { clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; }
        setTimeout(() => {
          if (!pollingIntervalRef.current && fetchNotificationsRef.current) {
            pollingIntervalRef.current = setInterval(() => fetchNotificationsRef.current?.(false), POLLING_RATE);
          }
        }, 600000);
      } else {
        setNotificationError("Failed to load notifications");
      }
    } finally {
      if (isInitialLoad) setIsNotificationsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => { fetchNotificationsRef.current = fetchNotifications; }, [fetchNotifications]);

  useEffect(() => {
    if (!currentUser?.id) {
      if (pollingIntervalRef.current) { clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; }
      return;
    }
    const startPolling = () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(() => fetchNotificationsRef.current?.(false), POLLING_RATE);
    };
    const stopPolling = () => {
      if (pollingIntervalRef.current) { clearInterval(pollingIntervalRef.current); pollingIntervalRef.current = null; }
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => fetchNotificationsRef.current?.(false), 2000);
        setTimeout(startPolling, 5000);
      } else { stopPolling(); }
    };
    setTimeout(() => fetchNotificationsRef.current?.(true), 1000);
    setTimeout(startPolling, 10000);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { stopPolling(); document.removeEventListener("visibilitychange", handleVisibility); };
  }, [currentUser?.id]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleLogin  = () => { window.location.href = "https://speedyo.app/login"; };
  const handleLogout = async () => {
    await UserEntity.logout();
    setCurrentUser(null); setCurrentUserDisplay(null);
    setNotifications([]); setUnreadCount(0);
    router.push("/feed");
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      try {
        await Notification.update(notification.id, { read: true });
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (e) { console.error(e); }
    }
    if (notification.url) window.location.href = notification.url;
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    const ids = notifications.filter(n => !n.read).map(n => n.id);
    try {
      await Promise.all(ids.map(id => Notification.update(id, { read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const getUpgradeCTA = () => {
    if (!currentUserDisplay) return null;
    switch (currentUserDisplay.user_type) {
      case "guest":          return { title: "Start Selling Today", description: "Become a Private Seller",   icon: Car,        ctaText: "Get Started" };
      case "private_seller": return { title: "Need More Slots?",    description: "Just $50 per vehicle",      icon: ShoppingCart, ctaText: "Buy Slots"  };
      case "dealership":     return { title: "Manage Subscription", description: "Upgrade or modify plan",    icon: TrendingUp, ctaText: "View Plans"  };
      default: return null;
    }
  };

  // Hide bottom nav when Messages page signals it
  useEffect(() => {
    const handler = (e: any) => setHideBottomNav(e.detail.hide);
    window.addEventListener("updateBottomNavVisibility", handler);
    return () => window.removeEventListener("updateBottomNavVisibility", handler);
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/messages")) setHideBottomNav(false);
  }, [pathname]);

  const isMessagesPage = pathname.startsWith("/messages");

  // ---------------------------------------------------------------------------
  // Notification panel (reused in both mobile + desktop headers)
  // ---------------------------------------------------------------------------
  const NotificationPanel = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-white text-xs font-semibold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b bg-slate-50">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
              {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount} new</Badge>}
            </h3>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" className="p-0 h-auto text-blue-600" onClick={handleMarkAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="h-96">
          {isNotificationsLoading && notifications.length === 0 ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-3 w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 border-b border-slate-100 last:border-0 ${!n.read ? "bg-blue-50/50" : ""}`} onClick={() => handleNotificationClick(n)}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${!n.read ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                    {getNotificationIcon(n.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.read ? "text-slate-900 font-medium" : "text-slate-700"}`}>{n.content}</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(n.created_date).toLocaleString()}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-slate-500">
              <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium mb-1">No notifications yet</p>
              <p className="text-sm">{notificationError ?? "We'll notify you when something happens!"}</p>
              {notificationError && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchNotifications(true)}>Try Again</Button>
              )}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );

  // Profile dropdown (reused in both headers)
  const ProfileDropdown = () => (
    currentUser && currentUserDisplay ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
            <AvatarImage src={currentUserDisplay.profile_image} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
              {currentUserDisplay.full_name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="flex items-center gap-3 p-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentUserDisplay.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                {currentUserDisplay.full_name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{currentUserDisplay.full_name}</p>
              {currentUserDisplay.role === "admin"
                ? <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border-slate-300">Admin</Badge>
                : <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                    {currentUserDisplay.user_type === "private_seller" ? "Private Seller" : currentUserDisplay.user_type === "dealership" ? "Dealership" : "Guest"}
                  </Badge>
              }
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild><Link href="/" className="cursor-pointer"><PlaneLanding className="mr-2 h-4 w-4" />Welcome</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/profile" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/dashboard" className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/managed-sales" className="cursor-pointer"><Handshake className="mr-2 h-4 w-4" />Managed Sales</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href="/subscription" className="cursor-pointer"><DollarSign className="mr-2 h-4 w-4" />Pricing</Link></DropdownMenuItem>
          {currentUserDisplay?.role === "admin" && (
            <><DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/admin" className="cursor-pointer"><Shield className="mr-2 h-4 w-4" /><span className="font-medium">Admin Panel</span></Link></DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem asChild><Link href="/contact" className="cursor-pointer"><HelpCircle className="mr-2 h-4 w-4" />Help & Feedback</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600"><LogOut className="w-4 h-4 mr-2" />Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
        <LogIn className="w-4 h-4 mr-2" />Login
      </Button>
    )
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <style>{`.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none;}.scrollbar-hide::-webkit-scrollbar{display:none;}`}</style>
      <SidebarProvider>
        <div className="flex w-full justify-center">
          {/* ── Sidebar ─────────────────────────────────────────── */}
          <Sidebar className="hidden md:block border-r border-slate-200/60 backdrop-blur-sm w-64 flex-shrink-0">
            <SidebarHeader className="border-b border-slate-200/60 pb-0 flex pl-10 pt-6">
              <Link href="/"><img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedyo Logo" className="w-24" /></Link>
            </SidebarHeader>

            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${isActive(item.href) ? "bg-white/80 text-slate-800" : "hover:bg-white/80 hover:scale-[1.02] text-slate-700"}`}>
                          <Link href={item.href} className="bg-white/80 text-slate-800 my-1 px-4 py-3 text-sm flex w-full items-center gap-3 rounded-xl transition-all duration-300">
                            <div className={`p-2 rounded-lg transition-all duration-300 ${isActive(item.href) ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"}`}>
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-semibold text-sm">{item.title}</span>
                              <p className={`text-xs mt-0.5 ${isActive(item.href) ? "text-slate-600" : "text-slate-500"}`}>{item.description}</p>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-6">
                <div className="px-3">
                  <Button variant="outline" className="w-full justify-start gap-2 bg-transparent border-slate-300/70 text-slate-600 hover:bg-slate-100 hover:text-slate-800" onClick={() => setShowFeedbackModal(true)}>
                    <MessageSquare className="w-4 h-4" />Share Feedback
                  </Button>
                </div>
              </SidebarGroup>

              <SidebarGroup className="mt-8">
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-xl border border-blue-200/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Trust & Safety</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">Get your vehicle verified for increased trust and better sales chances.</p>
                  <Button size="sm" className="w-full bg-slate-300 text-slate-600 cursor-not-allowed" disabled>Coming Soon</Button>
                </div>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/60 p-4">
              {isAuthCheckComplete && (currentUser && currentUserDisplay ? (
                <div className="space-y-3">
                  {getUpgradeCTA() && (() => {
                    const cta = getUpgradeCTA()!;
                    const CtaIcon = cta.icon;
                    return (
                      <Link href="/subscription">
                        <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all duration-200 cursor-pointer">
                          <div className="relative p-3 flex items-center gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-md flex items-center justify-center group-hover:bg-slate-300 transition-colors">
                              <CtaIcon className="w-4 h-4 text-slate-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-700 leading-tight">{cta.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5 leading-tight">{cta.description}</p>
                            </div>
                            <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0 transform group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </Link>
                    );
                  })()}
                  <div className="flex items-center gap-3">
                    <Link href={`/profile?id=${currentUser.id}`}>
                      <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                        <AvatarImage src={currentUserDisplay.profile_image} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">{currentUserDisplay.full_name?.[0] ?? "U"}</AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{currentUserDisplay.full_name}</p>
                      {currentUserDisplay.role === "admin"
                        ? <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border-slate-300">Admin</Badge>
                        : <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                            {currentUserDisplay.user_type === "private_seller" ? "Private Seller" : currentUserDisplay.user_type === "dealership" ? "Dealership" : "Guest"}
                          </Badge>
                      }
                    </div>
                    <Button size="icon" variant="ghost" onClick={handleLogout} title="Logout">
                      <LogOut className="w-4 h-4 text-slate-500" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                  <LogIn className="w-4 h-4 mr-2" />Login / Register
                </Button>
              ))}
            </SidebarFooter>
          </Sidebar>

          {/* ── Main content ────────────────────────────────────── */}
          <main className={`flex-1 flex flex-col min-h-screen ${getContentMaxWidth()} overflow-x-hidden`}>

            {/* Mobile header */}
            {!isMessagesPage && (
              <header className="md:hidden bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 sticky top-0 z-50 h-[60px] flex items-center">
                <div className="flex items-center justify-between w-full">
                  <Link href="/feed">
                    <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedyo Logo" className="h-6 object-contain" />
                  </Link>
                  <div className="flex items-center gap-3">
                    {currentUser && <NotificationPanel />}
                    <ProfileDropdown />
                  </div>
                </div>
              </header>
            )}

            {/* Desktop header */}
            <header className="hidden md:flex bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 py-0 sticky top-0 z-50">
              <div className={`flex items-center justify-between h-16 w-full mx-auto ${getContentMaxWidth()}`}>
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />

                <div className="flex items-center gap-2">
                  {navigationItems.slice(0, 4).map(item => (  // Feed, Marketplace, Messages, Dashboard
                    <Link key={item.href} href={item.href}>
                      <Button variant="ghost" className={`px-4 py-2 h-16 w-24 rounded-none border-b-4 transition-all duration-200 ${getNavButtonClasses(item.href)}`} title={item.title}>
                        <item.icon className="w-5 h-5" />
                      </Button>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center gap-2 sm:gap-4">
                  {currentUser && <NotificationPanel />}
                  <ProfileDropdown />
                </div>
              </div>
            </header>

            {/* Page content */}
            <div className={`flex-1 overflow-auto ${hideBottomNav ? "pb-0" : "pb-16"} md:pb-0`}>
              {children}
            </div>

            {/* Mobile bottom nav */}
            {!hideBottomNav && (
              <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 z-50 shadow-lg">
                <div className="flex items-center justify-center">
                  {[
                    { href: "/feed",      icon: Home,          name: "feed"      },
                    { href: "/marketplace", icon: Car,         name: "marketplace" },
                  ].map(item => (
                    <Link key={item.href} href={item.href} className="flex-1">
                      <Button variant="ghost" className={`flex flex-col items-center justify-center h-14 w-full text-xs font-medium transition-all duration-200 ${pathname.startsWith(item.href) ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-100/50 hover:text-blue-600"}`}>
                        <item.icon className="w-5 h-5" />
                      </Button>
                    </Link>
                  ))}

                  {/* Create post */}
                  <div className="flex-1">
                    <Button variant="ghost" className="flex flex-col items-center justify-center h-14 w-full text-slate-500 hover:bg-slate-100/50 hover:text-blue-600"
                      onClick={() => {
                        if (!pathname.startsWith("/feed")) { router.push("/feed"); }
                        else { window.dispatchEvent(new CustomEvent("openCreatePost", { detail: { type: "text" } })); }
                      }}>
                      <PlusSquare className="w-5 h-5" />
                    </Button>
                  </div>

                  {[
                    { href: "/messages",  icon: MessageCircle },
                    { href: "/dashboard", icon: LayoutDashboard },
                  ].map(item => (
                    <Link key={item.href} href={item.href} className="flex-1">
                      <Button variant="ghost" className={`flex flex-col items-center justify-center h-14 w-full text-xs font-medium transition-all duration-200 ${pathname.startsWith(item.href) ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-100/50 hover:text-blue-600"}`}>
                        <item.icon className="w-5 h-5" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </SidebarProvider>

      <AnimatePresence>
        {showSetupDialog && currentUser && currentUserDisplay && (
          <SetupAccountDialog user={currentUser} userDisplay={currentUserDisplay} onClose={() => setShowSetupDialog(false)} onUpdate={handleSetupUpdate} />
        )}
      </AnimatePresence>

      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
      <Toaster />
    </div>
  );
}
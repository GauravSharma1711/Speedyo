"use client";
import { signOut, useSession } from "next-auth/react"
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PlaneLanding,
  Home,
  Car,
  User,
  MessageCircle,
  Shield,
  Bell,
  LogOut,
  LogIn,
  DollarSign,
  Handshake,
  MessageSquare,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  UserCheck,
  PlusSquare,
  HelpCircle,
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/Sidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Skeleton } from "@/components/ui/Skeleton";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/UseToast";
import { Toaster } from "@/components/ui/Toaster";
import FeedbackModal from "@/components/feedback/FeedbackModal";
import SetupAccountDialog from "@/components/setup/SetupAccountDialog";

// ─── Replace these with your actual API/entity imports ───────────────────────
// import { UserEntity } from "@/entities/User";
// import { PublicUser } from "@/entities/PublicUser";
// import { Notification } from "@/entities/Notification";
// import { sendEmail } from "@/functions/sendEmail";
// import SetupAccountDialog from "./components/setup/SetupAccountDialog";
// import FeedbackModal from "./components/feedback/FeedbackModal";
// ─────────────────────────────────────────────────────────────────────────────

// ─── Types ────────────────────────────────────────────────────────────────────
interface CurrentUser {
  id: string;
  email?: string;
  full_name?: string;
  profile_image?: string;
  user_type?: string;
  verified?: boolean;
  role?: string;
  bio?: string;
  location?: string;
  setup_completed?: boolean;
  welcome_email_sent?: boolean;
  created_date?: string;
}

interface CurrentUserDisplay {
  full_name?: string;
  profile_image?: string;
  user_type?: string;
  verified?: boolean;
  role?: string;
  bio?: string;
  location?: string;
}

interface NotificationItem {
  id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  icon?: string;
  url?: string;
  created_date: string;
}

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Replaces `createPageUrl(pageName)` from the original base44 project.
 * Adjust the mapping to match your Next.js route structure.
 */
function createPageUrl(pageName: string, params?: Record<string, string>): string {
  const routes: Record<string, string> = {
    Feed: "/Feed",
    Marketplace: "/Marketplace",
    Messages: "/Messages",
    Dashboard: "/Dashboard",
    ManagedSales: "/Managed-Sales",
    Landing: "/",
    Profile: "/Profile",
    Subscription: "/Subscription",
    OrderConfirmation: "/Order-Confirmation",
    Checkout: "/Checkout",
    TermsOfService: "/Terms",
    PrivacyPolicy: "/Privacy",
    Contact: "/Contact",
    PrivateSellerPromo: "/Private-Seller",
    GuestCheckout: "/Guest-Checkout",
    GuestOrderConfirmation: "/Guest-Order-Confirmation",
    DealershipManagedSales: "/Dealership-Managed-Sales",
    SignAgreement: "/Sign-Agreement",
    AdminPanel: "/AdminPanel",
    LiaisonAgreement: "/Liaison-Agreement",
    ViewDealershipAgreement: "/View-Dealership-Agreement",
    LiaisonApplication: "/Liaison-Application",
    PhotographerAgreement: "/Photographer-Agreement",
    VehicleTransferGuide: "/Vehicle-Transfer-Guide",
    Warranty: "/Warranty",
    OISTPortal: "/Oist-Portal",
    Verification: "/Verification",
  };

  const base = routes[pageName] ?? `/${pageName.toLowerCase()}`;
  if (!params) return base;
  const qs = new URLSearchParams(params).toString();
  return qs ? `${base}?${qs}` : base;
}

const navigationItems = [
  { title: "Feed", url: createPageUrl("Feed"), icon: Home, description: "Social feed" },
  { title: "Marketplace", url: createPageUrl("Marketplace"), icon: Car, description: "Browse vehicles" },
  { title: "Messages", url: createPageUrl("Messages"), icon: MessageCircle, description: "Chat with sellers" },
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard, description: "Manage listings" },
  { title: "Managed Sales", url: createPageUrl("ManagedSales"), icon: Handshake, description: "Full-service selling" },
];

const pagesWithoutSidebar = [
  "Landing", "ManagedSales", "Subscription", "OrderConfirmation", "Checkout",
  "TermsOfService", "PrivacyPolicy", "Contact", "PrivateSellerPromo",
  "GuestCheckout", "GuestOrderConfirmation", "DealershipManagedSales",
  "SignAgreement", "AdminPanel", "LiaisonAgreement", "ViewDealershipAgreement",
  "LiaisonApplication", "PhotographerAgreement", "VehicleTransferGuide",
  "Warranty", "OISTPortal",
];

const protectedPages = [
  "Feed", "Dashboard", "Profile", "Messages", "Verification", "AdminPanel", "Subscription",
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageSquare,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  UserCheck,
  Car,
  Handshake,
  DollarSign,
  Bell,
};

function getNotificationIcon(iconName?: string) {
  const IconComponent = iconName ? iconMap[iconName] : null;
  return IconComponent ? (
    <IconComponent className="w-5 h-5" />
  ) : (
    <Bell className="w-5 h-5" />
  );
}

// ─── Layout Component ─────────────────────────────────────────────────────────

export default function Layout({ children, currentPageName }: LayoutProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentUserDisplay, setCurrentUserDisplay] = useState<CurrentUserDisplay | null>(null);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(false);

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchNotificationsRef = useRef<((isInitial?: boolean) => Promise<void>) | null>(null);
  const POLLING_RATE = 120_000; // 2 minutes

  const showSidebar = !pagesWithoutSidebar.includes(currentPageName);

  const { data: session, status } = useSession()

  // ── Content max-width per page ─────────────────────────────────────────────
  const getContentMaxWidth = () => {
    switch (currentPageName) {
      case "Dashboard":   return "max-w-5xl";
      case "Feed":        return "max-w-4xl";
      case "Marketplace": return "max-w-7xl";
      case "Messages":    return "max-w-5xl";
      case "Profile":     return "max-w-6xl";
      case "Vehicle":     return "max-w-6xl";
      default:            return "max-w-6xl";
    }
  };

  // ── Scroll to top on route change ─────────────────────────────────────────
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // ── Active nav helpers ────────────────────────────────────────────────────
  const isNavItemActive = (pageName: string) => pathname === createPageUrl(pageName);

  const getNavButtonClasses = (pageName: string) =>
    isNavItemActive(pageName)
      ? "border-blue-600 text-blue-600 bg-transparent"
      : "border-transparent text-slate-500 hover:bg-slate-100/50 hover:border-slate-300 hover:text-blue-600";

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
  if (status === "loading") return

  if (session?.user) {
    setCurrentUser({
      id: session.user.id,
      email: session.user.email ?? "",
      full_name: (session.user as any).full_name,
      profile_image: (session.user as any).image ?? undefined,
      user_type: (session.user as any).user_type,
      verified: (session.user as any).isVerified,
      role: (session.user as any).role,
      bio: (session.user as any).bio,
      location: (session.user as any).location ?? undefined,
      setup_completed: (session.user as any).setup_completed ?? false,
    })
    setCurrentUserDisplay({
      full_name: (session.user as any).full_name,
      profile_image: (session.user as any).image ?? undefined,
      user_type: (session.user as any).user_type,
      verified: (session.user as any).isVerified,
      role: (session.user as any).role,
      bio: (session.user as any).bio,
      location: (session.user as any).location ?? undefined,
    })
  } else {
    setCurrentUser(null)
    setCurrentUserDisplay(null)

    // redirect if on protected page
    if (protectedPages.includes(currentPageName)) {
      window.location.href = "/signIn"
    }
  }

  setIsAuthCheckComplete(status === "authenticated" || status === "unauthenticated")
}, [session, status, currentPageName])

  // ── Setup dialog ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentUser && currentUserDisplay && isAuthCheckComplete) {
      const isSetupMarkedComplete = !!currentUser.setup_completed;
      const hasProfileImage = !!currentUserDisplay.profile_image;
      const hasLocation = !!currentUserDisplay.location;
      const hasRealName =
        currentUserDisplay.full_name &&
        currentUserDisplay.full_name !== currentUser.email?.split("@")[0];

      const shouldShowSetup =
        !isSetupMarkedComplete && (!hasProfileImage || !hasLocation || !hasRealName);

      setShowSetupDialog(shouldShowSetup);
    } else {
      setShowSetupDialog(false);
    }
  }, [currentUser, currentUserDisplay, isAuthCheckComplete]);

  const handleSetupClose = () => setShowSetupDialog(false);
  const handleSetupUpdate = () => {
    setShowSetupDialog(false);
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(
    async (isInitialLoad = false) => {
      if (!currentUser?.id) return;
      if (isInitialLoad) setIsNotificationsLoading(true);
      setNotificationError(null);

      try {
        // TODO: Replace with your API call
        // const userNotifications = await Notification.filter(
        //   { recipient_id: currentUser.id }, "-created_date", 10
        // );
        const userNotifications: NotificationItem[] = [];
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter((n) => !n.read).length);
      } catch (error: any) {
        console.error("Failed to fetch notifications:", error);
        if (error?.response?.status === 429) {
          setNotificationError("Too many requests. Notifications paused temporarily.");
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setTimeout(() => {
            if (!pollingIntervalRef.current && currentUser?.id && fetchNotificationsRef.current) {
              pollingIntervalRef.current = setInterval(
                () => fetchNotificationsRef.current?.(false),
                POLLING_RATE
              );
            }
          }, 600_000);
        } else {
          setNotificationError("Failed to load notifications");
        }
      } finally {
        if (isInitialLoad) setIsNotificationsLoading(false);
      }
    },
    [currentUser?.id, POLLING_RATE]
  );

  useEffect(() => {
    fetchNotificationsRef.current = fetchNotifications;
  }, [fetchNotifications]);

  useEffect(() => {
    if (!currentUser?.id) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    const startPolling = () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(
        () => fetchNotificationsRef.current?.(false),
        POLLING_RATE
      );
    };

    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => fetchNotificationsRef.current?.(false), 2000);
        setTimeout(startPolling, 5000);
      } else {
        stopPolling();
      }
    };

    setTimeout(() => fetchNotificationsRef.current?.(true), 1000);
    setTimeout(startPolling, 10_000);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [currentUser?.id, POLLING_RATE]);

  // ── Auth actions ──────────────────────────────────────────────────────────
  const handleLogin = () => {
    window.location.href = "/signIn"; // adjust to your login route
  };

  // const handleLogout = async () => {

  //   // TODO: call your auth provider's sign-out
  //   // await UserEntity.logout();
  //   await signOut({ callbackUrl: "/signIn" })
  //   setCurrentUser(null);
  //   setCurrentUserDisplay(null);
  //   setNotifications([]);
  //   setUnreadCount(0);
  //   window.location.href = createPageUrl("Feed");
  // };

  const handleLogout = async () => {
  await signOut({ callbackUrl: "/signIn" })
}


  // ── Notification actions ──────────────────────────────────────────────────
  const handleNotificationClick = async (notification: NotificationItem) => {
    if (!notification.read) {
      try {
        // TODO: await Notification.update(notification.id, { read: true });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    if (notification.url) window.location.href = notification.url;
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    try {
      // TODO: await Promise.all(unreadIds.map((id) => Notification.update(id, { read: true })));
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // ── Upgrade CTA ───────────────────────────────────────────────────────────
  const getUpgradeCTA = () => {
    if (!currentUserDisplay) return null;
    switch (currentUserDisplay.user_type) {
      case "guest":
        return { title: "Start Selling Today", description: "Become a Private Seller", icon: Car, ctaText: "Get Started" };
      case "private_seller":
        return { title: "Need More Slots?", description: "Just $50 per vehicle", icon: ShoppingCart, ctaText: "Buy Slots" };
      case "dealership":
        return { title: "Manage Subscription", description: "Upgrade or modify plan", icon: TrendingUp, ctaText: "View Plans" };
      default:
        return null;
    }
  };

  // ── Bottom nav visibility (Messages page) ─────────────────────────────────
  useEffect(() => {
    const handleBottomNavVisibility = (event: Event) => {
      setHideBottomNav((event as CustomEvent<{ hide: boolean }>).detail.hide);
    };
    window.addEventListener("updateBottomNavVisibility", handleBottomNavVisibility);
    return () => window.removeEventListener("updateBottomNavVisibility", handleBottomNavVisibility);
  }, []);

  useEffect(() => {
    if (currentPageName !== "Messages") setHideBottomNav(false);
  }, [currentPageName]);

  // ── Shared notification panel ─────────────────────────────────────────────
  const NotificationsPanel = () => (
    <PopoverContent className="w-96 p-0" align="end">
      <div className="p-4 border-b bg-slate-50">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1">{unreadCount} new</Badge>
            )}
          </h3>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 hover:text-blue-800" onClick={handleMarkAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-96">
        {isNotificationsLoading && notifications.length === 0 ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0 ${!notification.read ? "bg-blue-50/50" : ""}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${!notification.read ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                  {getNotificationIcon(notification.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-relaxed ${!notification.read ? "text-slate-900 font-medium" : "text-slate-700"}`}>
                    {notification.content}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(notification.created_date).toLocaleString()}
                  </p>
                </div>
                {!notification.read && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 text-slate-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium mb-1">No notifications yet</p>
            <p className="text-sm">{notificationError ?? "We'll notify you when something happens!"}</p>
            {notificationError && (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchNotifications(true)}>
                Try Again
              </Button>
            )}
          </div>
        )}
      </ScrollArea>
    </PopoverContent>
  );

  // ── Shared user dropdown ──────────────────────────────────────────────────
  const UserDropdownContent = () => (
    <DropdownMenuContent align="end" className="w-56">
      <div className="flex items-center gap-3 p-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={currentUserDisplay?.profile_image} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
            {currentUserDisplay?.full_name?.[0] ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{currentUserDisplay?.full_name}</p>
          {currentUserDisplay?.role === "admin" ? (
            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border-slate-300">Admin</Badge>
          ) : (
            <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
              {currentUserDisplay?.user_type === "private_seller" ? "Private Seller" : currentUserDisplay?.user_type === "dealership" ? "Dealership" : "Guest"}
            </Badge>
          )}
        </div>
      </div>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild><Link href={createPageUrl("Landing")} className="cursor-pointer"><PlaneLanding className="mr-2 h-4 w-4" />Welcome</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href={createPageUrl("Profile")} className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profile</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href={createPageUrl("Dashboard")} className="cursor-pointer"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href={createPageUrl("ManagedSales")} className="cursor-pointer"><Handshake className="mr-2 h-4 w-4" />Managed Sales</Link></DropdownMenuItem>
      <DropdownMenuItem asChild><Link href={createPageUrl("Subscription")} className="cursor-pointer"><DollarSign className="mr-2 h-4 w-4" />Pricing</Link></DropdownMenuItem>
      {currentUserDisplay?.role === "admin" && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={createPageUrl("AdminPanel")} className="cursor-pointer">
              <Shield className="mr-2 h-4 w-4" />
              <span className="font-medium">Admin Panel</span>
            </Link>
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuItem asChild><Link href={createPageUrl("contact")} className="cursor-pointer"><HelpCircle className="mr-2 h-4 w-4" />Help &amp; Feedback</Link></DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
        <LogOut className="w-4 h-4 mr-2" />Logout
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <SidebarProvider className="flex flex-1">
        {showSidebar ? (
          <>
            {/* ── Sidebar ───────────────────────────────────────────────── */}
            <Sidebar className="border-r border-slate-200/60 backdrop-blur-sm">
              <SidebarHeader className="border-b border-slate-200/60 pb-0 flex pl-10 pt-6">
                <Link href={createPageUrl("Landing")}>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png"
                    alt="Speedyo Logo"
                    className="w-24"
                  />
                </Link>
              </SidebarHeader>

              <SidebarContent className="p-3">
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                              pathname === item.url
                                ? "bg-white/80 text-slate-800"
                                : "hover:bg-white/80 hover:scale-[1.02] text-slate-700"
                            }`}
                          >
                            <Link
                              href={item.url}
                              className="bg-white/80 text-slate-800 my-1 px-4 py-3 text-sm flex w-full items-center gap-3 rounded-xl transition-all duration-300 h-8"
                            >
                              <div className={`p-2 rounded-lg transition-all duration-300 ${
                                pathname === item.url
                                  ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                              }`}>
                                <item.icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 text-left">
                                <span className="font-semibold text-sm">{item.title}</span>
                                <p className={`text-xs mt-0.5 ${pathname === item.url ? "text-slate-600" : "text-slate-500"}`}>
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                {/* Feedback CTA */}
                <SidebarGroup className="mt-6">
                  <div className="px-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 bg-transparent border-slate-300/70 text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      onClick={() => setShowFeedbackModal(true)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Share Feedback
                    </Button>
                  </div>
                </SidebarGroup>

                {/* Trust & Safety */}
                <SidebarGroup className="mt-8">
                  <div className="p-4 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-xl border border-blue-200/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">Trust &amp; Safety</span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Get your vehicle verified for increased trust and better sales chances.
                    </p>
                    <Button size="sm" className="w-full bg-slate-300 text-slate-600 cursor-not-allowed" disabled>
                      Coming Soon
                    </Button>
                  </div>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-slate-200/60 p-4">
                {isAuthCheckComplete && (
                  currentUser && currentUserDisplay ? (
                    <div className="space-y-3">
                      {(() => {
                        const cta = getUpgradeCTA();
                        if (!cta) return null;
                        const CtaIcon = cta.icon;
                        return (
                          <Link href={createPageUrl("Subscription")}>
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
                        <Link href={createPageUrl("Profile") + `?id=${currentUser.id}`}>
                          <Avatar className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                            <AvatarImage src={currentUserDisplay.profile_image} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                              {currentUserDisplay.full_name?.[0] ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{currentUserDisplay.full_name}</p>
                          {currentUserDisplay.role === "admin" ? (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-slate-100 text-slate-700 border-slate-300">Admin</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 capitalize">
                              {currentUserDisplay.user_type === "private_seller" ? "Private Seller" : currentUserDisplay.user_type === "dealership" ? "Dealership" : "Guest"}
                            </Badge>
                          )}
                        </div>
                        <Button size="icon" variant="ghost" onClick={handleLogout} title="Logout">
                          <LogOut className="w-4 h-4 text-slate-500" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={handleLogin} className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 font-bold">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login / Register
                    </Button>
                  )
                )}
              </SidebarFooter>
            </Sidebar>

            {/* ── Main Content ──────────────────────────────────────────── */}
            <SidebarInset className="min-w-0 overflow-x-hidden bg-transparent">

              {/* Mobile Header */}
              {currentPageName !== "Messages" &&
                currentPageName !== "GuestCheckout" &&
                currentPageName !== "GuestOrderConfirmation" && (
                  <header className="md:hidden bg-white/70 backdrop-blur-md border-b border-slate-200/60 px-4 sticky top-0 z-50 h-[60px] flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <Link href={createPageUrl("Feed")}>
                        <img
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png"
                          alt="Speedyo Logo"
                          className="h-6 object-contain"
                        />
                      </Link>

                      <div className="flex items-center gap-3">
                        {currentUser && (
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
                            <NotificationsPanel />
                          </Popover>
                        )}

                        {currentUser && currentUserDisplay ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                                <AvatarImage src={currentUserDisplay.profile_image} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                                  {currentUserDisplay.full_name?.[0] ?? "U"}
                                </AvatarFallback>
                              </Avatar>
                            </DropdownMenuTrigger>
                            <UserDropdownContent />
                          </DropdownMenu>
                        ) : (
                          <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                            <LogIn className="w-4 h-4 mr-2" />Login
                          </Button>
                        )}
                      </div>
                    </div>
                  </header>
                )}

              {/* Desktop Header */}
              <header className="hidden md:flex sticky top-0 z-50">
                <div className="w-full px-8">
                  <div
                    className={`flex items-center justify-between h-16 w-full mx-auto bg-white/70 backdrop-blur-md border border-slate-200/60 ${getContentMaxWidth()}`}
                  >
                    <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200 ml-2" />

                  {/* Desktop Nav Icons */}
                  <div className="flex items-center gap-2">
                    {[
                      { page: "Feed", icon: Home },
                      { page: "Marketplace", icon: Car },
                      { page: "Messages", icon: MessageCircle },
                      { page: "Dashboard", icon: LayoutDashboard },
                    ].map(({ page, icon: Icon }) => (
                      <Link key={page} href={createPageUrl(page)}>
                        <Button
                          variant="ghost"
                          className={`px-4 py-2 h-16 w-24 rounded-none border-b-4 transition-all duration-200 ${getNavButtonClasses(page)}`}
                          title={page}
                        >
                          <Icon className="w-7 h-7" />
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Desktop Right Side */}
                  <div className="flex items-center gap-2 sm:gap-4 mr-2">
                    {currentUser && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="relative">
                            <Bell className="w-6 h-6 text-slate-600" />
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
                        <NotificationsPanel />
                      </Popover>
                    )}

                    {currentUser && currentUserDisplay ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                            <AvatarImage src={currentUserDisplay.profile_image} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                              {currentUserDisplay.full_name?.[0] ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                        </DropdownMenuTrigger>
                        <UserDropdownContent />
                      </DropdownMenu>
                    ) : (
                      <Button onClick={handleLogin} size="sm" className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                        <LogIn className="w-4 h-4 mr-2" />Login
                      </Button>
                    )}
                  </div>
                  </div>
                </div>
              </header>

              {/* Page Content */}
              <div className={`flex-1 overflow-auto ${
                hideBottomNav ||
                currentPageName === "GuestCheckout" ||
                currentPageName === "GuestOrderConfirmation"
                  ? "pb-0"
                  : "pb-16"
              } md:pb-0`}>
                <div className={`w-full mx-auto ${getContentMaxWidth()} px-4 sm:px-6`}>
                  {children}
                </div>
              </div>

              {/* Mobile Bottom Nav */}
              {!hideBottomNav &&
                currentPageName !== "GuestCheckout" &&
                currentPageName !== "GuestOrderConfirmation" && (
                  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/60 z-50 shadow-lg">
                    <div className="flex items-center justify-center">
                      {[
                        { page: "Feed", icon: Home },
                        { page: "Marketplace", icon: Car },
                      ].map(({ page, icon: Icon }) => (
                        <Link key={page} href={createPageUrl(page)} className="flex-1">
                          <Button
                            variant="ghost"
                            className={`flex flex-col items-center justify-center h-14 w-full text-xs font-medium transition-all duration-200 ${
                              currentPageName === page ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-100/50 hover:text-blue-600"
                            }`}
                            title={page}
                          >
                            <Icon className="w-5 h-5" />
                          </Button>
                        </Link>
                      ))}

                      {/* Create Post */}
                      <div className="flex-1">
                        <Button
                          variant="ghost"
                          className="flex flex-col items-center justify-center h-14 w-full text-xs font-medium transition-all duration-200 text-slate-500 hover:bg-slate-100/50 hover:text-blue-600"
                          title="Create Post"
                          onClick={() => {
                            if (currentPageName !== "Feed") {
                              window.location.href = createPageUrl("Feed");
                            } else {
                              window.dispatchEvent(new CustomEvent("openCreatePost", { detail: { type: "text" } }));
                            }
                          }}
                        >
                          <PlusSquare className="w-5 h-5" />
                        </Button>
                      </div>

                      {[
                        { page: "Messages", icon: MessageCircle },
                        { page: "Dashboard", icon: LayoutDashboard },
                      ].map(({ page, icon: Icon }) => (
                        <Link key={page} href={createPageUrl(page)} className="flex-1">
                          <Button
                            variant="ghost"
                            className={`flex flex-col items-center justify-center h-14 w-full text-xs font-medium transition-all duration-200 ${
                              currentPageName === page ? "text-blue-600 bg-blue-50/50" : "text-slate-500 hover:bg-slate-100/50 hover:text-blue-600"
                            }`}
                            title={page}
                          >
                            <Icon className="w-5 h-5" />
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </SidebarInset>
          </>
        ) : (
          /* Pages without sidebar */
          <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-x-hidden">
            <div className="flex-1 overflow-auto">{children}</div>
          </main>
        )}
      </SidebarProvider>

      {/* Setup Account Dialog */}
      <AnimatePresence>
        {showSetupDialog && currentUser && currentUserDisplay && (
          <SetupAccountDialog
            user={currentUser}
            userDisplay={currentUserDisplay}
            onClose={handleSetupClose}
            onUpdate={handleSetupUpdate}
          />
        )}
      </AnimatePresence>

    {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
      <Toaster />
    </div>
  );
}
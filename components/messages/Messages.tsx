"use client"

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import {
  MessageCircle,
  Search,
  LogIn,
  Loader2,
  ArrowLeft
} from "lucide-react";

import ConversationList from "../messages/ConversationList";
import ChatInterface from "../messages/ChatInterface";
import TestDriveModal from "../messages/TestDriveModal";
import { useToast } from "@/components/ui/UseToast";

type UserType = {
  id: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
  user_type?: string;
  verified?: boolean;
  bio?: string;
  location?: string;
  role?: string;
};

type PublicUserType = {
  id?: string;
  user_id: string;
  full_name?: string;
  email?: string;
  profile_image?: string | null;
  user_type?: string;
  verified?: boolean;
  role?: string;
  [key: string]: any;
};

type MessageType = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content?: string;
  read?: boolean;
  created_date?: string;
  vehicle_id?: string | null;
  managed_sale_request_id?: string | null;
  conversation_id?: string;
  message_type?: string;
  test_drive_details?: any;
  [key: string]: any;
};

type VehicleType = {
  id: string;
  title?: string;
  created_by_id?: string;
  original_owner_id?: string;
  website_managed?: boolean;
  [key: string]: any;
};

type ManagedSaleRequestType = {
  id: string;
  vehicle_details?: { title?: string };
  [key: string]: any;
};

type ConversationType = {
  id: string;
  conversationId?: string;
  otherUserId: string;
  vehicleId?: string | null;
  managedSaleRequestId?: string | null;
  messages: MessageType[];
  lastMessage: MessageType | null;
  unreadCount: number;
};

const MOCK_USER: UserType = {
  id: "user-1",
  full_name: "Demo User",
  email: "demo@example.com",
  user_type: "guest",
  verified: false,
};

const MOCK_PUBLIC_USER: PublicUserType = {
  id: "pub-1",
  user_id: "user-1",
  full_name: "Demo User",
  email: "demo@example.com",
};

const MOCK_MESSAGES: MessageType[] = [
  {
    id: "msg-1",
    sender_id: "user-2",
    recipient_id: "user-1",
    content: "Hey, is this car still available?",
    read: false,
    created_date: new Date(Date.now() - 60000).toISOString(),
    vehicle_id: "vehicle-1",
    conversation_id: "vehicle_vehicle-1_user-1_user-2",
  },
  {
    id: "msg-2",
    sender_id: "user-1",
    recipient_id: "user-2",
    content: "Yes it is! Would you like to schedule a test drive?",
    read: true,
    created_date: new Date(Date.now() - 30000).toISOString(),
    vehicle_id: "vehicle-1",
    conversation_id: "vehicle_vehicle-1_user-1_user-2",
  },
];

const MOCK_USERS: PublicUserType[] = [
  MOCK_PUBLIC_USER,
  { id: "pub-2", user_id: "user-2", full_name: "Jane Smith", email: "jane@example.com" },
];

const MOCK_VEHICLES: VehicleType[] = [
  { id: "vehicle-1", title: "2020 Toyota Camry", created_by_id: "user-2" },
];

const MOCK_MANAGED_SALE_REQUESTS: ManagedSaleRequestType[] = [];
// ---------------------------------------------------------------------------

export default function Messages() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentUserPublic, setCurrentUserPublic] = useState<PublicUserType | null>(null);
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [currentMessages, setCurrentMessages] = useState<MessageType[]>([]);
  const [users, setUsers] = useState<PublicUserType[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [managedSaleRequests, setManagedSaleRequests] = useState<ManagedSaleRequestType[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const loadMessagingDataRef = useRef<((retainSelection?: boolean) => Promise<void>) | null>(null);

  const { toast } = useToast();

  const POLLING_RATE = 300000;

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.user_id === userId) ?? { user_id: userId, full_name: "Unknown User", email: "unknown" };
  }, [users]);

  const getVehicleById = useCallback((vehicleId?: string | null) => {
    if (!vehicleId) return undefined;
    return vehicles.find(v => v.id === vehicleId);
  }, [vehicles]);

  const getManagedSaleRequestById = useCallback((requestId?: string | null): ManagedSaleRequestType => {
    if (!requestId) return { id: "" };
    return managedSaleRequests.find(r => r.id === requestId) ?? { id: requestId };
  }, [managedSaleRequests]);

  // -------------------------------------------------------------------------
  // Group messages into conversations
  // -------------------------------------------------------------------------
  const groupMessagesIntoConversations = useCallback((allMessages: MessageType[], userPublicId: string): ConversationType[] => {
    const conversationMap = new Map<string, ConversationType>();

    const userMessages = allMessages.filter(msg =>
      msg.sender_id === userPublicId || msg.recipient_id === userPublicId
    );

    userMessages.forEach(message => {
      const otherUserId = message.sender_id === userPublicId ? message.recipient_id : message.sender_id;
      const sortedUserIds = [userPublicId, otherUserId].sort().join("_");

      const conversationKey = message.managed_sale_request_id
        ? `msr_${message.managed_sale_request_id}_${sortedUserIds}`
        : `vehicle_${message.vehicle_id}_${sortedUserIds}`;

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          conversationId: conversationKey,
          otherUserId,
          vehicleId: message.vehicle_id ?? null,
          managedSaleRequestId: message.managed_sale_request_id ?? null,
          messages: [],
          lastMessage: null,
          unreadCount: 0,
        });
      }

      const conv = conversationMap.get(conversationKey)!;
      conv.messages.push(message);

      if (!conv.lastMessage || new Date(message.created_date ?? 0) > new Date(conv.lastMessage.created_date ?? 0)) {
        conv.lastMessage = message;
      }

      if (!message.read && message.recipient_id === userPublicId) {
        conv.unreadCount++;
      }
    });

    return Array.from(conversationMap.values()).sort((a, b) => {
      const aTime = a.lastMessage?.created_date ? new Date(a.lastMessage.created_date).getTime() : 0;
      const bTime = b.lastMessage?.created_date ? new Date(b.lastMessage.created_date).getTime() : 0;
      return bTime - aTime;
    });
  }, []);

  // -------------------------------------------------------------------------
  // Mark as read
  // -------------------------------------------------------------------------
  const markConversationAsRead = useCallback((conversation: ConversationType) => {
    if (!currentUserPublic?.user_id) return;

    const unreadIds = new Set(
      conversation.messages
        .filter(m => m.recipient_id === currentUserPublic.user_id && !m.read)
        .map(m => m.id)
    );
    if (unreadIds.size === 0) return;

    setMessages(prev => prev.map(m => unreadIds.has(m.id) ? { ...m, read: true } : m));
    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id
          ? { ...c, unreadCount: 0, messages: c.messages.map(m => unreadIds.has(m.id) ? { ...m, read: true } : m) }
          : c
      )
    );
    setCurrentMessages(prev => prev.map(m => unreadIds.has(m.id) ? { ...m, read: true } : m));
  }, [currentUserPublic]);

  // -------------------------------------------------------------------------
  // Select conversation
  // -------------------------------------------------------------------------
  const handleSelectConversation = useCallback((conversation: ConversationType) => {
    setSelectedConversation(conversation);
    setCurrentMessages(conversation.messages ?? []);

    setConversations(prev =>
      prev.map(c =>
        c.id === conversation.id
          ? {
              ...c,
              unreadCount: 0,
              messages: c.messages.map(m =>
                m.recipient_id === currentUserPublic?.user_id ? { ...m, read: true } : m
              ),
            }
          : c
      )
    );

    if (conversation.unreadCount > 0) markConversationAsRead(conversation);
  }, [currentUserPublic, markConversationAsRead]);

  // -------------------------------------------------------------------------
  // Load data (mock)
  // -------------------------------------------------------------------------
  const loadMessagingData = useCallback(async (retainSelection = false) => {
    setIsLoading(true);
    try {
      // Simulate async fetch
      await new Promise(r => setTimeout(r, 200));

      const user = MOCK_USER;
      const userPublicProfile = MOCK_PUBLIC_USER;
      const fetchedMessages = MOCK_MESSAGES;
      const allUsers = MOCK_USERS;
      const allVehicles = MOCK_VEHICLES;
      const allManagedSaleRequests = MOCK_MANAGED_SALE_REQUESTS;

      setCurrentUser(user);
      setCurrentUserPublic(userPublicProfile);
      setUsers(allUsers);
      setVehicles(allVehicles);
      setManagedSaleRequests(allManagedSaleRequests);

      const userPublicId = userPublicProfile.user_id;
      const filteredMessages = fetchedMessages.filter(
        m => m.sender_id === userPublicId || m.recipient_id === userPublicId
      );
      setMessages(filteredMessages);

      const groupedConversations = groupMessagesIntoConversations(filteredMessages, userPublicId);
      setConversations(groupedConversations);

      // Handle URL params
      const urlParams = new URLSearchParams(window.location.search);
      const recipientParam = urlParams.get("recipient");
      const vehicleParam = urlParams.get("vehicle");
      const managedSaleRequestParam = urlParams.get("managedSaleRequest");

      let conversationToSetActive: ConversationType | null = null;

      if (recipientParam) {
        const existing = groupedConversations.find(c => {
          const hasVehicleMatch = vehicleParam ? c.vehicleId === vehicleParam : !c.vehicleId;
          const hasMSRMatch = managedSaleRequestParam ? c.managedSaleRequestId === managedSaleRequestParam : !c.managedSaleRequestId;
          return c.otherUserId === recipientParam && hasVehicleMatch && hasMSRMatch;
        });

        if (existing) {
          conversationToSetActive = existing;
        } else {
          const sortedUserIds = [userPublicId, recipientParam].sort().join("_");
          const newConvId = managedSaleRequestParam
            ? `msr_${managedSaleRequestParam}_${sortedUserIds}`
            : vehicleParam
            ? `vehicle_${vehicleParam}_${sortedUserIds}`
            : `general_${sortedUserIds}`;

          const newConv: ConversationType = {
            id: newConvId,
            conversationId: newConvId,
            otherUserId: recipientParam,
            vehicleId: vehicleParam ?? null,
            managedSaleRequestId: managedSaleRequestParam ?? null,
            messages: [],
            lastMessage: null,
            unreadCount: 0,
          };
          groupedConversations.unshift(newConv);
          conversationToSetActive = newConv;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      if (retainSelection && selectedConversation) {
        const selectedId = selectedConversation.conversationId ?? selectedConversation.id;
        if (selectedId) {
          conversationToSetActive = groupedConversations.find(c => c.id === selectedId) ?? null;
        }
      }

      if (!isMobileView && !conversationToSetActive && groupedConversations.length > 0) {
        conversationToSetActive = groupedConversations[0];
      }

      if (conversationToSetActive) {
        handleSelectConversation(conversationToSetActive);
      } else {
        setSelectedConversation(null);
        setCurrentMessages([]);
      }

      setIsPollingPaused(false);
    } catch (error: unknown) {
      console.error("Failed to load messaging data:", error);
      const err = error as any;
      if (err?.response?.status === 429) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsPollingPaused(true);
        toast({ title: "Loading Paused", description: "Too many requests. Retrying in 10 minutes.", variant: "destructive" });
        setTimeout(() => {
          setIsPollingPaused(false);
          if (!pollIntervalRef.current) {
            pollIntervalRef.current = setInterval(() => loadMessagingDataRef.current?.(true), 600000);
          }
        }, 600000);
      } else if (err?.response?.status === 401 || err?.message?.includes("Not Authenticated")) {
        setCurrentUser(null);
        setCurrentUserPublic(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupMessagesIntoConversations, handleSelectConversation, selectedConversation, toast, isMobileView]);

  useEffect(() => { loadMessagingDataRef.current = loadMessagingData; }, [loadMessagingData]);

  useEffect(() => {
    setIsLoading(true);
    loadMessagingData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const shouldHideBottomNav = isMobileView && !!selectedConversation;
    window.dispatchEvent(new CustomEvent("updateBottomNavVisibility", { detail: { hide: shouldHideBottomNav } }));
    return () => {
      window.dispatchEvent(new CustomEvent("updateBottomNavVisibility", { detail: { hide: false } }));
    };
  }, [isMobileView, selectedConversation]);

  useEffect(() => {
    if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; }
    if (currentUser && !isPollingPaused) {
      pollIntervalRef.current = setInterval(() => loadMessagingDataRef.current?.(true), POLLING_RATE);
    }
    return () => { if (pollIntervalRef.current) { clearInterval(pollIntervalRef.current); pollIntervalRef.current = null; } };
  }, [currentUser, isPollingPaused, POLLING_RATE]);

  // -------------------------------------------------------------------------
  // Send message
  // -------------------------------------------------------------------------
  const handleSendMessage = useCallback(async (messageData: MessageType) => {
    const userPublicId = currentUserPublic?.user_id;
    if (!messageData.content?.trim() || !selectedConversation || !userPublicId) return;

    const sortedUserIds = [userPublicId, selectedConversation.otherUserId].sort().join("_");
    const conversation_id = selectedConversation.managedSaleRequestId
      ? `msr_${selectedConversation.managedSaleRequestId}_${sortedUserIds}`
      : selectedConversation.vehicleId
      ? `vehicle_${selectedConversation.vehicleId}_${sortedUserIds}`
      : `general_${sortedUserIds}`;

    const newMessage: MessageType = {
      ...messageData,
      id: `msg-${Date.now()}`,
      sender_id: userPublicId,
      recipient_id: selectedConversation.otherUserId,
      content: messageData.content.trim(),
      vehicle_id: selectedConversation.vehicleId ?? null,
      managed_sale_request_id: selectedConversation.managedSaleRequestId ?? null,
      conversation_id,
      created_date: new Date().toISOString(),
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessages(prev => [...prev, newMessage]);
    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: newMessage }
          : c
      )
    );

    return newMessage;
  }, [selectedConversation, currentUserPublic]);

  // -------------------------------------------------------------------------
  // Test drive
  // -------------------------------------------------------------------------
  const handleTestDriveSubmitFromModal = async (testDriveData: any) => {
    try {
      const confirmationMsg: MessageType = {
        id: `msg-${Date.now()}`,
        sender_id: currentUserPublic?.user_id ?? "",
        recipient_id: currentUserPublic?.user_id ?? "",
        content: `Your test drive request for "${testDriveData.vehicleTitle}" has been submitted.`,
        message_type: "confirmation_test_drive",
        vehicle_id: testDriveData.vehicleId,
        test_drive_details: testDriveData,
        read: true,
        created_date: new Date().toISOString(),
      };

      setMessages(prev => [...prev, confirmationMsg]);
      if (selectedConversation?.vehicleId === testDriveData.vehicleId) {
        setCurrentMessages(prev => [...prev, confirmationMsg]);
      }

      setShowTestDriveModal(false);
      toast({ title: "Test Drive Requested", description: "Your request has been sent." });
    } catch (error) {
      console.error("Failed to send test drive request:", error);
      toast({ title: "Failed to Request Test Drive", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleApproveTestDrive = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message?.test_drive_details) return;

      const preferredDate = message.test_drive_details.preferred_date;
      const approvalMsg: MessageType = {
        id: `msg-${Date.now()}`,
        sender_id: currentUserPublic?.user_id ?? "",
        recipient_id: message.sender_id,
        content: `✅ Test Drive Approved!\n\nDate: ${preferredDate ? format(new Date(preferredDate), "MMM d, yyyy") : "TBD"}\nTime: ${message.test_drive_details.preferred_time}\nLocation: ${message.test_drive_details.location}`,
        message_type: "test_drive_status_update",
        vehicle_id: message.vehicle_id,
        managed_sale_request_id: message.managed_sale_request_id,
        conversation_id: message.conversation_id,
        read: false,
        created_date: new Date().toISOString(),
      };

      setMessages(prev => [...prev, approvalMsg]);
      setCurrentMessages(prev => [...prev, approvalMsg]);
      toast({ title: "Test Drive Approved", description: `Approved for ${message.test_drive_details.vehicleTitle}.`, variant: "default" });
    } catch (error) {
      console.error("Failed to approve test drive:", error);
      toast({ title: "Failed to Approve", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleDeclineTestDrive = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message?.test_drive_details) return;

      const declineMsg: MessageType = {
        id: `msg-${Date.now()}`,
        sender_id: currentUserPublic?.user_id ?? "",
        recipient_id: message.sender_id,
        content: "❌ Test Drive Request Declined\n\nWe're unable to accommodate this request at this time.",
        message_type: "test_drive_status_update",
        vehicle_id: message.vehicle_id,
        managed_sale_request_id: message.managed_sale_request_id,
        conversation_id: message.conversation_id,
        read: false,
        created_date: new Date().toISOString(),
      };

      setMessages(prev => [...prev, declineMsg]);
      setCurrentMessages(prev => [...prev, declineMsg]);
      toast({ title: "Test Drive Declined", description: `Declined for ${message.test_drive_details.vehicleTitle}.`, variant: "default" });
    } catch (error) {
      console.error("Failed to decline test drive:", error);
      toast({ title: "Failed to Decline", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleRequestTestDrive = useCallback(() => {
    if (selectedConversation?.vehicleId || selectedConversation?.managedSaleRequestId) {
      setShowTestDriveModal(true);
    } else {
      toast({ title: "Cannot Request Test Drive", description: "No vehicle associated with this conversation.", variant: "destructive" });
    }
  }, [selectedConversation, toast]);

  const handleBackClick = () => {
    if (isMobileView && selectedConversation) {
      setSelectedConversation(null);
    } else {
      window.history.back();
    }
  };

  // -------------------------------------------------------------------------
  // Filtered conversations
  // -------------------------------------------------------------------------
  const filteredConversations = conversations.filter(conv => {
    const otherUser = getUserById(conv.otherUserId);
    const vehicle = getVehicleById(conv.vehicleId);
    const managedSaleRequest = getManagedSaleRequestById(conv.managedSaleRequestId);
    const term = searchTerm.toLowerCase();

    return (
      otherUser.full_name?.toLowerCase().includes(term) ||
      otherUser.email?.toLowerCase().includes(term) ||
      vehicle?.title?.toLowerCase().includes(term) ||
      managedSaleRequest?.vehicle_details?.title?.toLowerCase().includes(term)
    );
  });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <MessageCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Messages</h2>
          <p className="text-slate-600 mb-6">Please log in to view and send messages.</p>
          <Button
            onClick={() => router.push("/signIn")}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${isMobileView && selectedConversation ? "h-screen" : "h-[calc(100vh-56px)]"} md:h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30`}>
      <div className="flex w-full h-full">
        {/* Sidebar */}
        <div className={`${isMobileView && selectedConversation ? "hidden" : "block"} w-full md:w-80 border-r border-slate-200/60 bg-white/80 backdrop-blur-sm flex flex-col flex-shrink-0`}>
          <div className="p-4 border-b border-slate-200/60 bg-white/90 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              {isMobileView && (
                <Button variant="ghost" size="icon" onClick={handleBackClick} className="flex-shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Messages
              </h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={filteredConversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              getUserById={getUserById}
              getVehicleById={getVehicleById}
              getManagedSaleRequestById={getManagedSaleRequestById}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className={`${isMobileView && !selectedConversation ? "hidden" : "flex"} flex-1 flex flex-col bg-white/60 backdrop-blur-sm overflow-hidden h-full`}>
          {selectedConversation && currentUserPublic ? (
            <ChatInterface
              key={selectedConversation.id}
              conversation={selectedConversation}
              currentUser={currentUserPublic}
              otherUser={getUserById(selectedConversation.otherUserId)}
              onSendMessage={handleSendMessage}
              onRequestTestDrive={handleRequestTestDrive}
              onApproveTestDrive={handleApproveTestDrive}
              onDeclineTestDrive={handleDeclineTestDrive}
              getVehicleById={getVehicleById}
              getManagedSaleRequestById={getManagedSaleRequestById}
              onBack={() => setSelectedConversation(null)}
              isMobileView={isMobileView}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
              <div className="text-center max-w-md">
                <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No conversation selected</h3>
                <p className="text-slate-500">Select a conversation from the left panel to view messages, or start a new one.</p>
                {filteredConversations.length === 0 && (
                  <div className="mt-6">
                    <Button
                      variant="outline"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      onClick={() => router.push("/Dashboard")}
                    >
                      Go to Dashboard to find vehicles
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showTestDriveModal && selectedConversation && currentUserPublic && (
        <TestDriveModal
          conversation={selectedConversation}
          vehicles={vehicles.map(v => ({ ...v, title: v.title ?? "" }))}
          onClose={() => setShowTestDriveModal(false)}
          onSubmit={handleTestDriveSubmitFromModal}
          currentUser={currentUserPublic}
          preselectedVehicleId={selectedConversation.vehicleId ?? undefined}
        />
      )}
    </div>
  );
}
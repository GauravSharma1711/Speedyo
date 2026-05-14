"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import { MessageCircle, Search, LogIn, Loader2, ArrowLeft } from "lucide-react";
import { io as socketIo, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

import ConversationList from "../messages/ConversationList";
import ChatInterface from "../messages/ChatInterface";
import TestDriveModal from "../messages/TestDriveModal";
import { useToast } from "@/components/ui/UseToast";
import { useMessagesStore } from "@/store/messages/messages";
import type { Conversation, Message } from "@/services/messages/messageServices";

type VehicleType = {
  id: string;
  title?: string | null ;
  created_by_id?: string | null;
  primary_image_thumbnail?: string | null;
  [key: string]: any;
};

export default function Messages() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const {
    conversations,
    currentConversation,
    currentMessages,
    selectedConversationId,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    fetchConversations,
    selectConversation,
    sendMessage,
    markAsRead,
    onSocketNewMessage,
    clearUnread,
    reset,
    createConversation,
  } = useMessagesStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [newConversationData, setNewConversationData] = useState<{
    recipientId: string;
    vehicleId?: string;
    managedSaleRequestId?: string;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);

  const currentUserId = session?.user?.id;


  useEffect(() => {
    if (status === "authenticated") {
      fetchConversations().then(() => {
        const params = new URLSearchParams(window.location.search);
        const convId = params.get("conversationId");


        const recipientId = params.get("recipient");
        const vehicleId = params.get("vehicle");


        const currentConversations = useMessagesStore.getState().conversations;

        if (recipientId) {
          const existingConv = currentConversations.find(
            c => c.other_user?.id === recipientId &&
            (!vehicleId || c.vehicleId === vehicleId)
          );

          if (existingConv) {
            selectConversation(existingConv.id);
          } else {
            createConversation(recipientId, vehicleId || undefined).then((newConv) => {
              if (newConv) {
                selectConversation(newConv.id);
              }
            });
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (convId) {
          selectConversation(convId);
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          if (currentConversations.length > 0) {
            selectConversation(currentConversations[0].id);
          }
        }
      });
    }
    return () => reset();
  }, [status]);

  useEffect(() => {
    if (!currentUserId) return;

    const socket = socketIo(
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      { path: "/socket.io", transports: ["websocket"] }
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      const conversationIds = conversations.map((c) => c.id);
      socket.emit("join", { userId: currentUserId, conversationIds });
    });

    socket.on(
      "new_message",
      (payload: { message: Message; conversationId: string }) => {
        onSocketNewMessage({ ...payload, currentUserId: currentUserId ?? "" });
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };

  }, [currentUserId]);

  useEffect(() => {
    if (socketRef.current?.connected && currentUserId) {
      const ids = conversations.map((c) => c.id);
      socketRef.current.emit("join", { userId: currentUserId, conversationIds: ids });
    }
  }, [conversations, currentUserId]);


  useEffect(() => {
    const onResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const hide = isMobileView && !!selectedConversationId;
    window.dispatchEvent(
      new CustomEvent("updateBottomNavVisibility", { detail: { hide } })
    );
    return () =>{

      window.dispatchEvent(
        new CustomEvent("updateBottomNavVisibility", { detail: { hide: false } })
      );
    }
  }, [isMobileView, selectedConversationId]);

  const handleSelectConversation = useCallback(
    async (conversation: Conversation) => {
      if (socketRef.current) {
        socketRef.current.emit("join_conversation", conversation.id);
      }
      await selectConversation(conversation.id);
      await markAsRead(conversation.id);
    },
    [selectConversation, markAsRead]
  );

  const handleSendMessage = useCallback(
    async (messageData: Partial<Message> & { content: string }) => {
      if (!currentConversation || !messageData.content?.trim()) return;

      try {
        const sent = await sendMessage({
          recipientId: currentConversation.other_user?.id ?? "",
          content: messageData.content.trim(),
          vehicleId: currentConversation.vehicleId ?? null,
          managedSaleRequestId: currentConversation.managedSaleRequestId ?? null,
          message_type: messageData.message_type ?? "general",
        });
        return sent ?? undefined;
      } catch (err) {
        console.error("handleSendMessage error:", err);
        toast({
          title: "Failed to send",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
    [currentConversation, sendMessage, toast]
  );

  const handleTestDriveSubmitFromModal = async (testDriveData: any) => {
    try {
      await sendMessage({
        recipientId: currentConversation?.other_user?.id ?? "",
        content: `Car Viewing request for "${testDriveData.vehicleTitle}": ${testDriveData.preferred_date} at ${testDriveData.preferred_time}`,
        vehicleId: testDriveData.vehicleId ?? currentConversation?.vehicleId,
        managedSaleRequestId: currentConversation?.managedSaleRequestId ?? null,
        message_type: "test_drive_request",
        test_drive_details: {
          preferred_date: testDriveData.preferred_date,
          preferred_time: testDriveData.preferred_time,
          location: testDriveData.location,
          notes: testDriveData.notes,
          vehicleTitle: testDriveData.vehicleTitle,
          status: "pending",
        },
      });

      setShowTestDriveModal(false);
      toast({ title: "Car Viewing Requested", description: "Your request has been sent." });
    } catch {
      toast({
        title: "Failed to Request Car Viewing",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveTestDrive = async (messageId: string) => {
    const message = currentMessages.find((m) => m.id === messageId);
    if (!message?.test_drive_details || !currentConversation) return;
    try {
      const { preferred_date, preferred_time, location, vehicleTitle } =
        message.test_drive_details;
      await sendMessage({
        recipientId: message.senderId,
        content: `✅ Car Viewing Approved!\n\nDate: ${preferred_date ? format(new Date(preferred_date), "MMM d, yyyy") : "TBD"}\nTime: ${preferred_time}\nLocation: ${location}`,
        vehicleId: message.vehicleId ?? null,
        managedSaleRequestId: message.managedSaleRequestId ?? null,
        message_type: "test_drive_status_update",
      });
      toast({ title: "Car Viewing Approved", description: `Approved for ${vehicleTitle}.` });
    } catch {
      toast({ title: "Failed to Approve", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleDeclineTestDrive = async (messageId: string) => {
    const message = currentMessages.find((m) => m.id === messageId);
    if (!message?.test_drive_details || !currentConversation) return;
    try {
      await sendMessage({
        recipientId: message.senderId,
        content: "❌ Car Viewing Request Declined\n\nWe're unable to accommodate this request at this time.",
        vehicleId: message.vehicleId ?? null,
        managedSaleRequestId: message.managedSaleRequestId ?? null,
        message_type: "test_drive_status_update",
      });
      toast({ title: "Car Viewing Declined", description: `Declined for ${message.test_drive_details.vehicleTitle}.` });
    } catch {
      toast({ title: "Failed to Decline", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleRequestTestDrive = useCallback(() => {
    if (currentConversation?.vehicleId || currentConversation?.managedSaleRequestId) {
      setShowTestDriveModal(true);
    } else {
      toast({
        title: "Cannot Request Car Viewing",
        description: "No vehicle associated with this conversation.",
        variant: "destructive",
      });
    }
  }, [currentConversation, toast]);

  const handleBackClick = () => {
    if (isMobileView && selectedConversationId) {
      useMessagesStore.setState({ selectedConversationId: null, currentConversation: null });
    } else {
      window.history.back();
    }
  };

  const getUserById = useCallback(
    (userId: string) => {
      const conv = conversations.find(
        (c) => c.user1?.id === userId || c.user2?.id === userId
      );
      return (
        (conv?.user1?.id === userId ? conv?.user1 : conv?.user2) ?? {
          id: userId,
          full_name: "Unknown User",
        }
      );
    },
    [conversations]
  );

  const getVehicleById = useCallback(
    (vehicleId?: string | null): VehicleType | undefined => {
      if (!vehicleId) return undefined;
      const conv = conversations.find((c) => c.vehicleId === vehicleId);
      return conv?.vehicle
        ? { ...conv.vehicle, id: conv.vehicle.id }
        : undefined;
    },
    [conversations]
  );

  const getManagedSaleRequestById = useCallback(
    (requestId?: string | null) => {
      if (!requestId) return { id: "" };
      const conv = conversations.find((c) => c.managedSaleRequestId === requestId);
      return conv?.managedSaleRequest ?? { id: requestId };
    },
    [conversations]
  );

  const allVehicles: VehicleType[] = conversations
    .filter((c) => c.vehicle)
    .map((c) => ({ ...c.vehicle!, id: c.vehicle!.id }));

  const filteredConversations = conversations.filter((conv) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const other = conv.other_user;
    return (
      other?.full_name?.toLowerCase().includes(term) ||
      conv.vehicle?.title?.toLowerCase().includes(term) ||
      conv.managedSaleRequest?.vehicle_details?.title?.toLowerCase().includes(term)
    );
  });

  const selectedConvForChat = currentConversation
    ? {
        id: currentConversation.id,
        conversationId: currentConversation.id,
        otherUserId: currentConversation.other_user?.id ?? "",
        vehicleId: currentConversation.vehicleId ?? null,
        managedSaleRequestId: currentConversation.managedSaleRequestId ?? null,
        messages: currentMessages as any[],
        lastMessage: currentMessages[currentMessages.length - 1] ?? null,
        unreadCount: 0,
      }
    : null;

  if (status === "loading" || isLoadingConversations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
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
    <div
      className={`${isMobileView && selectedConversationId ? "h-screen" : "h-[calc(100vh-56px)]"} md:h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30`}
    >
      <div className="flex w-full h-full">
        <div
          className={`${
            isMobileView && selectedConversationId ? "hidden" : "block"
          } w-full md:w-80 border-r border-slate-200/60 bg-white/80 backdrop-blur-sm flex flex-col flex-shrink-0`}
        >
          <div className="p-4 border-b border-slate-200/60 bg-white/90 flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              {isMobileView && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackClick}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              )}
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                Messages
              </h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ConversationList
              conversations={filteredConversations as any}
              selectedConversation={selectedConvForChat}
              onSelectConversation={(conv: any) => handleSelectConversation(conv)}
            />
          </div>
        </div>

        <div
          className={`${
            isMobileView && !selectedConversationId ? "hidden" : "flex"
          } flex-1 flex flex-col bg-white/60 backdrop-blur-sm overflow-hidden h-full`}
        >
          {selectedConvForChat && currentConversation ? (
            <ChatInterface
              key={selectedConvForChat.id}
              conversation={selectedConvForChat}
              currentUser={{ user_id: currentUserId ?? "", ...session?.user } as any}
              otherUser={
                (currentConversation.other_user ??
                  conversations.find((c) => c.id === currentConversation.id)?.other_user ??
                  { id: currentConversation.user2Id ?? "" }
                ) as any
              }
              onSendMessage={handleSendMessage as any}
              onRequestTestDrive={handleRequestTestDrive}
              onApproveTestDrive={handleApproveTestDrive}
              onDeclineTestDrive={handleDeclineTestDrive}
              getVehicleById={getVehicleById as any}
              getManagedSaleRequestById={getManagedSaleRequestById as any}
              onBack={() =>
                useMessagesStore.setState({
                  selectedConversationId: null,
                  currentConversation: null,
                })
              }
              isMobileView={isMobileView}
              isLoadingMessages={isLoadingMessages}
              isSending={isSending}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
              <div className="text-center max-w-md">
                {isLoadingMessages ? (
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                ) : (
                  <>
                    <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-600 mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-slate-500">
                      Select a conversation from the left panel to view messages, or start a new one.
                    </p>
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
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showTestDriveModal && selectedConvForChat && (
        <TestDriveModal
          conversation={selectedConvForChat}
          vehicles={allVehicles.map((v) => ({ ...v, title: v.title ?? "" }))}
          onClose={() => setShowTestDriveModal(false)}
          onSubmit={handleTestDriveSubmitFromModal}
          currentUser={{ user_id: currentUserId ?? "", ...session?.user } as any}
          preselectedVehicleId={currentConversation?.vehicleId ?? undefined}
        />
      )}
    </div>
  );
}
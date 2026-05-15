'use client'
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Send, Car, Languages, Handshake, Paperclip,
  Smile, Phone, Video, ArrowLeft, MoreVertical,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import QuickActions from "./QuickActions";



export default function ChatInterface({
  conversation,
  currentUser,
  otherUser,
  onSendMessage,
  onRequestTestDrive,
  onApproveTestDrive,
  onDeclineTestDrive,
  getVehicleById,
  getManagedSaleRequestById,
  onBack,
  isMobileView,
  isSending,
  isLoadingMessages,
}: any) {
  const [newMessage, setNewMessage] = useState("");
  const [showTranslations, setShowTranslations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newMessage.trim();
    if (!content || isSending) return;

    setNewMessage(""); 

    try {
      await onSendMessage({ content, message_type: "general" });
    } catch {
      setNewMessage(content);
    }
  };

  const conversationVehicle = conversation?.vehicleId
    ? getVehicleById(conversation.vehicleId)
    : null;
  const conversationManagedSale = conversation?.managedSaleRequestId
    ? getManagedSaleRequestById(conversation.managedSaleRequestId)
    : null;

  const contextTitle =
    conversationManagedSale?.vehicle_details?.title || conversationVehicle?.title;
  const ContextIcon = conversationManagedSale ? Handshake : conversationVehicle ? Car : null;
  const contextBadgeColor = conversationManagedSale
    ? "text-emerald-600 border-emerald-200"
    : "text-blue-600 border-blue-200";


  const allMessages = useMemo(() => {
    return [...(conversation?.messages ?? [])].sort((a: any, b: any) => {
      const aTime = new Date(a.createdAt ?? a.created_date ?? 0).getTime();
      const bTime = new Date(b.createdAt ?? b.created_date ?? 0).getTime();
      return aTime - bTime;
    });
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col h-full">
      {isMobileView && (
        <div className="flex items-center p-3 border-b border-slate-200/60 flex-shrink-0 md:hidden">
          <Button variant="ghost" size="icon" className="mr-2 flex-shrink-0" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={otherUser?.profile_image ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xs">
              {otherUser?.full_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold text-slate-800 truncate ml-2 text-sm">
            {otherUser?.full_name || "Unknown User"}
          </h3>
          {/* <Button
            size="sm" variant="ghost"
            onClick={() => setShowTranslations(!showTranslations)}
            className={`ml-auto px-2 ${showTranslations ? "bg-blue-50 text-blue-600" : "text-slate-600"}`}
          >
            <Languages className="w-4 h-4" />
          </Button> */}
          <Button size="icon" variant="ghost" className="flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="hidden md:flex items-center p-3 border-b border-slate-200/60 flex-shrink-0">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={otherUser?.profile_image ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
            {otherUser?.full_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 ml-3 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">
            {otherUser?.full_name || "Unknown User"}
          </h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {otherUser?.role === "admin" ? (
              <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300">Admin</Badge>
            ) : (
              <Badge variant="outline" className="text-xs capitalize">
                {otherUser?.user_type || "guest"}
              </Badge>
            )}
            {ContextIcon && contextTitle && (
              <Badge variant="outline" className={`text-xs ${contextBadgeColor} max-w-[150px] truncate`}>
                <ContextIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{contextTitle}</span>
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-1 ml-2 flex-shrink-0">
          {/* <Button
            size="sm" variant="ghost"
            onClick={() => setShowTranslations(!showTranslations)}
            className={`px-3 ${showTranslations ? "bg-blue-50 text-blue-600" : "text-slate-600"}`}
          >
            <Languages className="w-4 h-4" />
            <span className="ml-2">{showTranslations ? "Hide" : "Show"}</span>
          </Button> */}
          <Button size="icon" variant="ghost" disabled className="hidden sm:inline-flex text-slate-400 cursor-not-allowed">
            <Phone className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" disabled className="hidden sm:inline-flex text-slate-400 cursor-not-allowed">
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {allMessages.map((message: any) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={(message.senderId ?? message.sender_id) === currentUser?.user_id}
                currentUser={currentUser}
                otherUser={otherUser}
                relatedVehicle={
                  (message.vehicleId ?? message.vehicle_id)
                    ? getVehicleById(message.vehicleId ?? message.vehicle_id)
                    : null
                }
                onApproveTestDrive={onApproveTestDrive}
                onDeclineTestDrive={onDeclineTestDrive}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {conversationVehicle && (
        <div className="p-2 border-t border-slate-200/60 overflow-x-auto whitespace-nowrap bg-white/80 backdrop-blur-sm flex-shrink-0">
          <QuickActions onRequestTestDrive={onRequestTestDrive} isTestDriveAvailable={true} />
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="text-slate-600 flex-shrink-0" type="button">
            <Smile className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-slate-600 flex-shrink-0" type="button">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={contextTitle ? `Message about ${contextTitle}...` : "Type your message..."}
            className="flex-1 border-slate-200"
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isSending && <p className="text-xs text-blue-600 mt-1">Sending...</p>}
      </form>
    </div>
  );
}
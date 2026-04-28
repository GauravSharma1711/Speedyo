'use client'
import React, { useState, useRef, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Send, 
  Car, 
  Languages,
  Handshake,
  Paperclip,
  Smile,
  Phone,
  Video,
  ArrowLeft,
  MoreVertical 
} from "lucide-react";
// import { InvokeLLM } from "@/integrations/Core";
import { Notification ,PublicUser} from "@/api/entities";



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
  isMobileView
}) {
  const [newMessage, setNewMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [otherUserData, setOtherUserData] = useState(null);
  const [isLoadingOtherUser, setIsLoadingOtherUser] = useState(true);
  const messagesEndRef = useRef(null);

  // Fetch other user's public data using conversation.otherUserId (user ID)
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!conversation.otherUserId) {
        setIsLoadingOtherUser(false);
        return;
      }

      try {
        // Use filter with user_id, not get() with the user ID
        const profiles = await PublicUser.filter({ user_id: conversation.otherUserId });
        if (profiles.length > 0) {
          setOtherUserData(profiles[0]);
        } else {
          setOtherUserData({
            full_name: "Unknown User",
            user_type: "guest",
            profile_image: null,
            verified: false,
            role: "user" 
          });
        }
      } catch (error) {
        console.error("Failed to fetch other user:", error);
        setOtherUserData({
          full_name: "Unknown User",
          user_type: "guest", 
          profile_image: null,
          verified: false,
          role: "user" 
        });
      } finally {
        setIsLoadingOtherUser(false);
      }
    };

    fetchOtherUser();
  }, [conversation.otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, optimisticMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const originalNewMessageContent = newMessage;
    const optimisticId = `optimistic-${Date.now()}`; 
    const now = new Date().toISOString();

    // Create optimistic message for immediate display
    const optimisticMessage = {
      id: optimisticId,
      recipient_id: conversation.otherUserId,
      sender_id: currentUser.user_id, 
      content: originalNewMessageContent, 
      message_type: "general",
      vehicle_id: conversation.vehicleId, 
      managed_sale_request_id: conversation.managedSaleRequestId,
      created_date: now,
      read: false,
      isOptimistic: true
    };

    // Add optimistic message to local state
    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    setNewMessage(""); // Clear input immediately for better UX

    try {
      setIsTranslating(true);
      
      const messageData = {
        recipient_id: conversation.otherUserId,
        sender_id: currentUser.user_id, 
        content: originalNewMessageContent, 
        message_type: "general",
        vehicle_id: conversation.vehicleId, 
        managed_sale_request_id: conversation.managedSaleRequestId, 
        conversation_id: conversation.conversationId 
      };

      // Auto-translate to Japanese if message is in English
      try {
        const translationResponse = await InvokeLLM({
          prompt: `Translate this message to Japanese if it's in English, or to English if it's in Japanese. If it's already in the target language, return it unchanged. Message: "${originalNewMessageContent}"`,
          response_json_schema: {
            type: "object",
            properties: {
              translated_text: { type: "string" },
              original_language: { type: "string" },
              target_language: { type: "string" }
            }
          }
        });

        messageData.translated_content = translationResponse.translated_text;
        messageData.original_language = translationResponse.original_language;
        messageData.translated_to = translationResponse.target_language;
      } catch (error) {
        console.error("Translation failed:", error);
        // Continue without translation if LLM fails, but log the error
      }
      
      setIsTranslating(false);

      // Send message to server
      const createdMessage = await onSendMessage(messageData);

      // Remove optimistic message once the real message is processed
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticId));

      // Create notification for the recipient
      if (createdMessage) {
        try {
          await Notification.create({
            recipient_id: conversation.otherUserId,
            sender_id: currentUser.user_id, 
            type: "new_message",
            content: `${currentUser.full_name} sent you a message.`,
            related_entity_type: "Message",
            related_entity_id: createdMessage.id,
            url: ("/Messages"),
            icon: "MessageSquare"
          });
        } catch (error) {
          console.error("Failed to create notification:", error);
        }
      }

    } catch (error) {
      console.error("Failed to send message:", error);
      // If sending fails, remove the optimistic message and allow user to retry
      setOptimisticMessages(prev => prev.filter(msg => msg.id !== optimisticId));
      setNewMessage(originalNewMessageContent); // Restore the message text for user to retry
      alert("Failed to send message. Please try again.");
      setIsTranslating(false);
    }
  };

  const handleApprove = async (messageId, testDriveDetails) => {
    if (onApproveTestDrive) {
      await onApproveTestDrive(messageId, testDriveDetails);
    }
  };

  const handleDecline = async (messageId) => {
    if (onDeclineTestDrive) {
      await onDeclineTestDrive(messageId);
    }
  };

  // Get the context for the header (vehicle or managed sale)
  const conversationVehicle = conversation.vehicleId ? getVehicleById(conversation.vehicleId) : null;
  const conversationManagedSale = conversation.managedSaleRequestId ? getManagedSaleRequestById(conversation.managedSaleRequestId) : null;

  const contextTitle = conversationManagedSale?.vehicle_details?.title || conversationVehicle?.title;
  const ContextIcon = conversationManagedSale ? Handshake : conversationVehicle ? Car : null;
  const contextBadgeColor = conversationManagedSale ? "text-emerald-600 border-emerald-200" : "text-blue-600 border-blue-200";

  // Combine real messages with optimistic messages for display
  const allMessages = [
    ...conversation.messages,
    ...optimisticMessages
  ].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  return (
    <div className="flex flex-col h-full">
      {/* Mobile-only Header */}
      {isMobileView && (
        <div className="flex items-center p-3 border-b border-slate-200/60 flex-shrink-0 md:hidden">
          <Button variant="ghost" size="icon" className="mr-2 flex-shrink-0" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          {isLoadingOtherUser ? (
            <div className="flex items-center gap-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ) : (
            <>
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={otherUserData?.profile_image} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white text-xs">
                  {otherUserData?.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-slate-800 truncate ml-2 text-sm">{otherUserData?.full_name}</h3>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowTranslations(!showTranslations)}
            className={`ml-auto text-slate-600 hover:bg-blue-50 hover:text-blue-600 ${
              showTranslations ? 'bg-blue-50 text-blue-600' : ''
            } px-2`}
            title={showTranslations ? 'Hide Translations' : 'Show Translations'}
          >
            <Languages className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="flex-shrink-0">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Desktop Header - Hidden on Mobile */}
      <div className="hidden md:flex items-center p-3 border-b border-slate-200/60 flex-shrink-0">
        {isLoadingOtherUser ? (
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ) : (
          <>
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={otherUserData?.profile_image} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                {otherUserData?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 ml-3 min-w-0">
              <h3 className="font-semibold text-slate-800 truncate">{otherUserData?.full_name}</h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {otherUserData?.role === 'admin' ? (
                  <Badge variant="outline" className="text-xs capitalize bg-slate-100 text-slate-700 border-slate-300">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs capitalize">
                    {otherUserData?.user_type || 'guest'}
                  </Badge>
                )}
                {otherUserData?.verified && (
                  <Badge className="bg-blue-500 text-xs">Verified</Badge>
                )}
                {/* Context indicator */}
                {ContextIcon && contextTitle && (
                  <Badge variant="outline" className={`text-xs ${contextBadgeColor} max-w-[150px] truncate`}>
                    <ContextIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                    <span className="truncate">{contextTitle}</span>
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
        
        <div className="flex gap-1 ml-2 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowTranslations(!showTranslations)}
            className={`text-slate-600 hover:bg-blue-50 hover:text-blue-600 ${
              showTranslations ? 'bg-blue-50 text-blue-600' : ''
            } px-3`}
            title={showTranslations ? 'Hide Translations' : 'Show Translations'}
          >
            <Languages className="w-4 h-4" />
            <span className="ml-2">{showTranslations ? 'Hide' : 'Show'}</span>
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            disabled
            className="hidden sm:inline-flex text-slate-400 cursor-not-allowed"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            disabled
            className="hidden sm:inline-flex text-slate-400 cursor-not-allowed"
          >
            <Video className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {allMessages.map((message) => (
          <MessageBubble
            key={message.id} 
            message={message}
            isOwn={message.sender_id === currentUser.user_id}
            currentUser={currentUser}
            otherUser={otherUserData}
            showTranslation={showTranslations}
            relatedVehicle={message.vehicle_id ? getVehicleById(message.vehicle_id) : null}
            onApproveTestDrive={handleApprove}
            onDeclineTestDrive={handleDecline}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Only show if there's a vehicle context (not for managed sales) */}
      {conversationVehicle && (
        <div className="p-2 border-t border-slate-200/60 overflow-x-auto whitespace-nowrap bg-white/80 backdrop-blur-sm flex-shrink-0">
          <QuickActions onRequestTestDrive={onRequestTestDrive} />
        </div>
      )}

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost" className="text-slate-600 flex-shrink-0">
            <Smile className="w-5 h-5" />
          </Button>
          <Button size="icon" variant="ghost" className="text-slate-600 flex-shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={contextTitle
              ? `Message about ${contextTitle}...`
              : "Type your message..."
            }
            className="flex-1 border-slate-200"
            disabled={isTranslating}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || isTranslating}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {isTranslating && (
          <p className="text-xs text-blue-600 mt-1">Translating message...</p>
        )}
      </form>
    </div>
  );
}

'use client'
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Car, MessageCircle, Handshake } from "lucide-react";
import { format } from "date-fns";

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: {
  conversations: any[];
  selectedConversation: any;
  onSelectConversation: (conversation: any) => void;
}) {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <MessageCircle className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="font-semibold text-slate-600 mb-2">No conversations yet</h3>
        <p className="text-sm text-slate-500">
          Start conversations by messaging sellers about their vehicles
        </p>
      </div>
    );
  }



  return (
    <div className="divide-y divide-slate-200/60">
      {conversations.map((conversation) => {
        const otherUser = conversation.other_user;
        const vehicle = conversation.vehicle;
        const managedSaleRequest = conversation.managedSaleRequest;

        const isSelected = selectedConversation?.id === conversation.id;
        const unreadCount = conversation.unread_count ?? 0;

        const contextTitle =
          managedSaleRequest?.vehicle_details?.title ||
          vehicle?.title ||
          "General Discussion";
        const ContextIcon = managedSaleRequest ? Handshake : vehicle ? Car : MessageCircle;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
              isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={otherUser?.profile_image ?? undefined} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                  {otherUser?.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-slate-800 truncate">
                    {otherUser?.full_name || "Unknown User"}
                  </h4>

                  <div className="flex items-center gap-2">
                    {conversation.last_message_at && (
                      <span className="text-xs text-slate-500">
                        {format(new Date(conversation.last_message_at), "MMM d")}
                      </span>
                    )}
                    {unreadCount > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1.5 text-sm font-medium mb-1 truncate ${
                    managedSaleRequest ? "text-emerald-700" : "text-blue-700"
                  }`}
                >
                  <ContextIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{contextTitle}</span>
                </div>

                {(() => {
                  const lastMsg = conversation.messages?.[conversation.messages.length - 1];
                  let displayContent = lastMsg?.content ?? conversation.last_message;

                    if (lastMsg?.message_type === "test_drive_request" && displayContent) {
    try {
      const parsed = JSON.parse(displayContent);
      displayContent = `Car Viewing: ${parsed.vehicle_title} on ${parsed.requested_date}`;
    } catch {
      displayContent = "Car Viewing Request";
    }
  }

                  return displayContent && (
                    <p className="text-sm text-slate-600 truncate mb-2">
                      {lastMsg?.message_type === "system" ? (
                        <span className="flex items-center gap-1">System</span>
                      ) : (
                        displayContent
                      )}
                    </p>
                  );
                })()}

                {otherUser?.role === "admin" ? (
                  <Badge
                    variant="outline"
                    className="text-xs capitalize mt-1 bg-slate-100 text-slate-700 border-slate-300"
                  >
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs capitalize mt-1">
                    {otherUser?.user_type === "private_seller"
                      ? "Private Seller"
                      : otherUser?.user_type === "dealership"
                      ? "Dealership"
                      : otherUser?.user_type || "Member"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

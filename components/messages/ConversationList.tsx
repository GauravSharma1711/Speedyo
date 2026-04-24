
import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car, MessageCircle, Handshake } from "lucide-react";
import { format } from "date-fns";
import { PublicUser } from "@/entities/PublicUser";

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
  getUserById,
  getVehicleById,
  getManagedSaleRequestById
}) {
  const [usersData, setUsersData] = useState({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Fetch all unique user data when conversations change
  useEffect(() => {
    const fetchUsersData = async () => {
      setLoadingUsers(true);
      const uniqueUserIds = [...new Set(conversations.map(conv => conv.otherUserId))];
      const userData = {};

      try {
        // Fetch all users in parallel
        const userPromises = uniqueUserIds.map(async (userId) => {
          try {
            const profiles = await PublicUser.filter({ user_id: userId });
            if (profiles.length > 0) {
              userData[userId] = profiles[0];
            } else {
              userData[userId] = {
                full_name: "Unknown User",
                user_type: "guest",
                profile_image: null,
                verified: false,
                role: null // Default role
              };
            }
          } catch (error) {
            console.error(`Failed to fetch user ${userId}:`, error);
            userData[userId] = {
              full_name: "Unknown User",
              user_type: "guest", 
              profile_image: null,
              verified: false,
              role: null // Default role
            };
          }
        });

        await Promise.all(userPromises);
        setUsersData(userData);
      } catch (error) {
        console.error("Failed to fetch users data:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (conversations.length > 0) {
      fetchUsersData();
    } else {
      setLoadingUsers(false);
    }
  }, [conversations]);

  if (conversations.length === 0) {
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
        const lastMessage = conversation.lastMessage;
        const otherUser = usersData[conversation.otherUserId];
        const vehicle = conversation.vehicleId ? getVehicleById(conversation.vehicleId) : null;
        const managedSaleRequest = conversation.managedSaleRequestId ? getManagedSaleRequestById(conversation.managedSaleRequestId) : null;
        const isSelected = selectedConversation?.id === conversation.id;

        const contextTitle = managedSaleRequest?.vehicle_details?.title || vehicle?.title || "General Discussion";
        const ContextIcon = managedSaleRequest ? Handshake : vehicle ? Car : MessageCircle;

        return (
          <div
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
              isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {loadingUsers ? (
                <Skeleton className="w-12 h-12 rounded-full" />
              ) : (
                <Avatar className="w-12 h-12">
                  <AvatarImage src={otherUser?.profile_image} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                    {otherUser?.full_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  {loadingUsers ? (
                    <Skeleton className="h-4 w-24" />
                  ) : (
                    <h4 className="font-semibold text-slate-800 truncate">
                      {otherUser?.full_name || "Unknown User"}
                    </h4>
                  )}
                  <div className="flex items-center gap-2">
                    {lastMessage && (
                      <span className="text-xs text-slate-500">
                        {format(new Date(lastMessage.created_date), 'MMM d')}
                      </span>
                    )}
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-blue-500 text-white text-xs px-2 py-1">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Context Information (Vehicle or Managed Sale) */}
                <div className={`flex items-center gap-1.5 text-sm font-medium mb-1 truncate ${
                  managedSaleRequest ? 'text-emerald-700' : 'text-blue-700'
                }`}>
                  <ContextIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{contextTitle}</span>
                </div>
                
                {/* Last message preview */}
                {lastMessage && (
                  <p className="text-sm text-slate-600 truncate mb-2">
                    {lastMessage.message_type === 'system' ? (
                      <span className="flex items-center gap-1">Managed Sale Request</span>
                    ) : (
                      lastMessage.content
                    )}
                  </p>
                )}

                {/* User type badge */}
                {loadingUsers ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  otherUser?.role === 'admin' ? (
                    <Badge variant="outline" className="text-xs capitalize mt-1 bg-slate-100 text-slate-700 border-slate-300">
                      Admin
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs capitalize mt-1">
                      {otherUser?.user_type === 'private_seller' ? 'Private Seller' : 
                       otherUser?.user_type === 'dealership' ? 'Dealership' : 
                       otherUser?.user_type || 'Member'}
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

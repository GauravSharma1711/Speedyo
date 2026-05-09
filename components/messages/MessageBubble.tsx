'use client'
import React, { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { format, formatDistanceToNow } from "date-fns";
import TestDriveStatusBadge from "./TestDriveStatusBadge";
import { Info, Languages } from "lucide-react";

type MessageLike = {
  id: string;
  content?: string | null;
  message_type?: string | null;
  read?: boolean;
  isOptimistic?: boolean;
  test_drive_details?: any;
  translated_content?: string | null;
  translated_to?: string | null;
  sender_id?: string;
  recipient_id?: string;
  vehicle_id?: string | null;
  created_date?: string;
  senderId?: string;
  recipientId?: string;
  vehicleId?: string | null;
  createdAt?: string;
};

type UserLike = {
  user_id?: string;
  full_name?: string | null;
  image?: string | null;
  profile_image?: string | null;
};

type Props = {
  message: MessageLike;
  isOwn: boolean;
  currentUser: UserLike;
  otherUser: UserLike;
  relatedVehicle: any;
  onApproveTestDrive: (messageId: string) => void | Promise<void>;
  onDeclineTestDrive: (messageId: string) => void | Promise<void>;
};

export default function MessageBubble({
  message,
  isOwn,
  currentUser,
  otherUser,
  relatedVehicle,
  onApproveTestDrive,
  onDeclineTestDrive,
}: Props) {
  const [showTranslation, setShowTranslation] = useState(false);

  const senderId = message.senderId ?? message.sender_id;
  const createdAt = message.createdAt ?? message.created_date;

  const isMyMessage = isOwn || senderId === currentUser?.user_id;
  const bubbleStyles = isMyMessage
    ? "bg-blue-100 text-blue-900 rounded-br-none"
    : "bg-slate-100 text-slate-800 rounded-bl-none";

  const opacity = message.isOptimistic ? "opacity-70" : "opacity-100";

  const renderMessageContent = () => {
    switch (message.message_type) {
      case "confirmation_test_drive":
        return (
          <div className="flex items-center gap-2 text-sm text-slate-600 italic">
            <Info className="w-4 h-4" />
            <span>{message.content}</span>
          </div>
        );

      case "test_drive_request": {
        const details = message.test_drive_details;
        if (!details) return "Test drive request details are missing.";

        return (
          <Card className="bg-white/80 border-slate-200/80">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-800">Test Drive Request</p>
                  <p className="text-sm text-slate-600">For: {relatedVehicle?.title || "Vehicle"}</p>
                </div>
                <TestDriveStatusBadge status={details.status} />
              </div>
              <div className="text-sm space-y-1 text-slate-700">
                <p>
                  <strong>Date:</strong> {format(new Date(details.preferred_date), "EEE, MMM d, yyyy")}
                </p>
                <p>
                  <strong>Time:</strong> {details.preferred_time}
                </p>
                <p>
                  <strong>Location:</strong> {details.location}
                </p>
                {message.content && !message.content.startsWith("Test drive request for") && (
                  <p className="pt-2 border-t border-slate-200/50 text-sm text-slate-600 italic">
                    {message.content}
                  </p>
                )}
              </div>

              {details.status === "pending" && !isMyMessage && (
                <div className="flex gap-2 pt-2 border-t border-slate-200/80">
                  <Button
                    size="sm"
                    onClick={() => onApproveTestDrive(message.id)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDeclineTestDrive(message.id)}
                    className="flex-1"
                  >
                    Decline
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      }

      case "system":
        return (
          <div className="flex items-center gap-2 text-sm text-slate-600 italic">
            <Info className="w-4 h-4" />
            <span>{message.content}</span>
          </div>
        );

      default:
        return <span>{message.content}</span>;
    }
  };

  return (
    <div className={`flex gap-3 mb-4 ${isMyMessage ? "justify-end" : "justify-start"}`}>
      {!isMyMessage && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={otherUser?.profile_image ?? undefined} />
          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
            {otherUser?.full_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-[70%] ${opacity}`}>
        <div className={`rounded-lg px-4 py-2 ${bubbleStyles}`}>
          {renderMessageContent()}

          {message.translated_content && showTranslation && (
            <div className="mt-2 pt-2 border-t border-slate-200/50">
              <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                <Languages className="w-3 h-3" />
                <span>Translated to {message.translated_to}</span>
              </div>
              <p className="text-sm italic">{message.translated_content}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          {createdAt && <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>}
          {message.read && <span>• Read</span>}

          {message.translated_content && (
            <button
              type="button"
              onClick={() => setShowTranslation((v) => !v)}
              className="ml-auto inline-flex items-center gap-1 text-slate-400 hover:text-slate-600"
              title={showTranslation ? "Hide translation" : "Show translation"}
            >
              <Languages className="w-3 h-3" />
              <span>{showTranslation ? "Hide" : "Translate"}</span>
            </button>
          )}
        </div>
      </div>

      {isMyMessage && (
        <Avatar className="w-8 h-8 mt-1">
          <AvatarImage src={currentUser?.image ?? undefined} />
          <AvatarFallback className="bg-blue-500 text-white text-xs">
            {currentUser?.full_name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

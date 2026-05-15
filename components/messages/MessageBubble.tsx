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


const translationApiKey = process.env.NEXT_PUBLIC_CLOUD_TRANSLATION_API

  

export default function MessageBubble({
  message,
  isOwn,
  currentUser,
  otherUser,
  relatedVehicle,
  onApproveTestDrive,
  onDeclineTestDrive,
}: Props) {


      const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const senderId = message.senderId ?? message.sender_id;
  const createdAt = message.createdAt ?? message.created_date;
    const messageText = message.content  ?? "";
      const isTranslated = translatedText !== null;

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
            <span>{isTranslated ? translatedText : message.content}</span>
          </div>
        );

      case "test_drive_request": {
        const details = message.test_drive_details;
        if (!details) return "Car Viewing request details are missing.";

        return (
          <Card className="bg-white/80 border-slate-200/80">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-slate-800">Car Viewing  Request</p>
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
                {message.content && !message.content.startsWith("Car Viewing request for") && (
                  <p className="pt-2 border-t border-slate-200/50 text-sm text-slate-600 italic">
                 {isTranslated ? translatedText : message.content}
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
            <span>{isTranslated ? translatedText : message.content}</span>
          </div>
        );

      default:
      return <span>{isTranslated ? translatedText : message.content}</span>;
    }
  };


const handleToggleTranslation = async () => {
    if (isTranslated) {
      setTranslatedText(null);
      return;
    }
    if (!messageText) return;
    setIsTranslating(true);
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${translationApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            q: messageText,
            target: "ja",
            source: "en",
            format: "text",
          }),
        }
      );
      const data = await response.json();
      const translated = data?.data?.translations?.[0]?.translatedText;
      if (translated) setTranslatedText(translated);
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setIsTranslating(false);
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
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          {createdAt && <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>}
          {message.read && <span>• Read</span>}

           {messageText   && (
            <button
              type="button"
              onClick={handleToggleTranslation}
              disabled={isTranslating}
              className={`ml-auto inline-flex items-center gap-1 hover:text-slate-600 transition-colors ${
                isTranslating ? "animate-pulse text-slate-400" : ""
              } ${isTranslated ? "text-blue-500" : "text-slate-400"}`}
              title={isTranslated ? "Show original" : "Translate to Japanese"}
            >
              <Languages className="w-3 h-3" />
              <span>{isTranslating ? "..." : isTranslated ? "Hide" : "Translate"}</span>
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

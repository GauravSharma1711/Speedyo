// components/ChatWindow.tsx
"use client";
import { useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useSocket } from "@/hooks/useSocket";

interface Props {
  conversationId: string;
  recipientId: string;
  currentUserId: string;
  vehicleId?: string;
  conversationIds: string[]; // all conversations user is part of
}

export default function ChatWindow({
  conversationId,
  recipientId,
  currentUserId,
  vehicleId,
  conversationIds,
}: Props) {
  const [input, setInput] = useState("");

  // Connect socket and join rooms
  useSocket(currentUserId, conversationIds);

  const { messages, isLoading, isTyping, sendMessage, emitTyping } =
    useMessages(conversationId, currentUserId);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(input.trim(), recipientId, vehicleId);
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    emitTyping(true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-center text-gray-400">Loading...</p>}
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;
          const parsed = msg.message_type !== "general" ? JSON.parse(msg.content) : null;

          return (
            <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              {parsed ? (
                // Render card for test_drive_request etc.
                <TestDriveCard data={parsed} />
              ) : (
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
        {isTyping && (
          <p className="text-sm text-gray-400 italic">Typing...</p>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-full disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Simple card renderer for test drive messages
function TestDriveCard({ data }: { data: any }) {
  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-sm">Test Drive Request</p>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[data.status] ?? "bg-gray-100"}`}>
          {data.status}
        </span>
      </div>
      <p className="text-sm text-gray-600">For: {data.vehicle_title}</p>
      <p className="text-sm text-gray-600">Date: {data.requested_date}</p>
      <p className="text-sm text-gray-600">Time: {data.requested_time}</p>
      {data.location && <p className="text-sm text-gray-600">Location: {data.location}</p>}
    </div>
  );
}
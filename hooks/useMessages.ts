
import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket } from "@/lib/socket";

interface Message {
  id: string;
  content: string;
  message_type: string;
  senderId: string;
  createdAt: string;
  read: boolean;
  sender: { id: string; full_name: string | null; profile_image: string | null };
}

export function useMessages(conversationId: string | null, currentUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial fetch
  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Socket listeners
  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();

    // Join this conversation room
    socket.emit("join_conversation", conversationId);

    // New message received
    socket.on("new_message", ({ message, conversationId: convId }) => {
      if (convId !== conversationId) return;
      setMessages((prev) => {
        // Avoid duplicates (optimistic update already added it)
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    // Message card updated (e.g. test drive status changed)
    socket.on("message_updated", ({ messageId, updatedContent, conversationId: convId }) => {
      if (convId !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: updatedContent } : m
        )
      );
    });

    // Typing indicator
    socket.on("user_typing", ({ userId, isTyping: typing }) => {
      if (userId === currentUserId) return;
      setIsTyping(typing);
    });

    return () => {
      socket.off("new_message");
      socket.off("message_updated");
      socket.off("user_typing");
      socket.emit("leave_conversation", conversationId);
    };
  }, [conversationId, currentUserId]);

  // Send message
  const sendMessage = useCallback(
    async (content: string, recipientId: string, vehicleId?: string) => {
      if (!conversationId) return;

      // Optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticMessage: Message = {
        id: tempId,
        content,
        message_type: "general",
        senderId: currentUserId,
        createdAt: new Date().toISOString(),
        read: false,
        sender: { id: currentUserId, full_name: null, profile_image: null },
      };
      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId, content, vehicleId }),
        });

        const data = await res.json();

        if (data.success) {
          // Replace optimistic message with real one
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? data.message : m))
          );
        } else {
          // Remove optimistic message on failure
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    },
    [conversationId, currentUserId]
  );

  // Emit typing indicator
  const emitTyping = useCallback(
    (isCurrentlyTyping: boolean) => {
      if (!conversationId) return;
      const socket = getSocket();
      socket.emit("typing", { conversationId, userId: currentUserId, isTyping: isCurrentlyTyping });

      if (isCurrentlyTyping) {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit("typing", { conversationId, userId: currentUserId, isTyping: false });
        }, 2000);
      }
    },
    [conversationId, currentUserId]
  );

  return { messages, isLoading, isTyping, sendMessage, emitTyping };
}
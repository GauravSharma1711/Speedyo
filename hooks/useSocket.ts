
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export function useSocket(userId: string | undefined, conversationIds: string[] = []) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();
    socketRef.current = socket;

    // Join personal room + all conversation rooms
    socket.emit("join", { userId, conversationIds });

    return () => {
      // Don't disconnect — just leave rooms
      conversationIds.forEach((id) => socket.emit("leave_conversation", id));
    };
  }, [userId, conversationIds.join(",")]);

  return socketRef.current ?? getSocket();
}
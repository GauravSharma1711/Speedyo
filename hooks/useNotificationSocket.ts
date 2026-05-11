"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import { useNotificationsStore } from "@/store/notifications";

export function useNotificationSocket(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    const socket = getSocket();

    socket.emit("subscribe_notifications", userId);

    const handleNewNotification = (notification: any) => {
      useNotificationsStore.getState().addNotification(notification);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.emit("unsubscribe_notifications", userId);
    };
  }, [userId]);
}
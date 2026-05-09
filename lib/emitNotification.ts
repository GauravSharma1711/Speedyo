export function emitNotification(userId: string, notification: any) {
  const io = (global as any).io;
  if (io) {
    io.to(`notifications:${userId}`).emit("new_notification", notification);
  }
}
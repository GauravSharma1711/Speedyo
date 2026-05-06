
import { createServer } from "node:http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Store io globally so API routes can emit events
  (global as any).io = io;

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // User joins their personal room and conversation rooms
    socket.on("join", ({ userId, conversationIds }: { userId: string; conversationIds: string[] }) => {
      // Join personal room for notifications
      socket.join(`user:${userId}`);

      // Join all conversation rooms
      conversationIds.forEach((convId) => {
        socket.join(`conversation:${convId}`);
      });

      console.log(`User ${userId} joined ${conversationIds.length} conversations`);
    });

    // Join a specific conversation (when user opens it)
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    // Leave a conversation room
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicator
    socket.on("typing", ({ conversationId, userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
      socket.to(`conversation:${conversationId}`).emit("user_typing", { userId, isTyping });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(3000, () => {
    console.log("> Ready on http://localhost:3000");
  });
});
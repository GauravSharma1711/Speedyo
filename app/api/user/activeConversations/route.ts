import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

type ConversationSummary = {
  conversation_id: string;
  vehicleId: string | null;
  lastMessageAt: string;
  lastMessage: string;
  unreadCount: number;
  otherUser: {
    id: string;
    full_name: string | null;
    profile_image: string | null;
  };
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const messages = await prisma.message.findMany({
      where: {
        conversationId: { not: null },
        OR: [{ senderId: userId }, { recipientId: userId }],
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        createdAt: true,
        content: true,
        conversationId: true,
        senderId: true,
        recipientId: true,
        read: true,
        vehicleId: true,
      },
    });

    const seen = new Set<string>();
    const summaries: ConversationSummary[] = [];

    for (const m of messages) {
      const cid = m.conversationId;
      if (!cid || seen.has(cid)) continue;
      seen.add(cid);

      const otherUserId = m.senderId === userId ? m.recipientId : m.senderId;
      const [otherUser, unreadCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: otherUserId },
          select: { id: true, full_name: true, profile_image: true },
        }),
        prisma.message.count({
          where: {
            conversationId: cid,
            recipientId: userId,
            read: false,
          },
        }),
      ]);

      if (!otherUser) continue;

      summaries.push({
        conversation_id: cid,
        vehicleId: m.vehicleId ?? null,
        lastMessageAt: m.createdAt.toISOString(),
        lastMessage: m.content,
        unreadCount,
        otherUser,
      });
    }

    return NextResponse.json({ success: true, conversations: summaries });
  } catch (error) {
    console.error("GET /api/user/activeConversations failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

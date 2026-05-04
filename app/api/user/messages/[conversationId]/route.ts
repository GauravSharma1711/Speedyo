import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function GET(
  request: NextRequest,
   { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


      const { conversationId } = params;

    if (!conversationId) {
      return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        user1: { select: { id: true, full_name: true, profile_image: true, role: true } },
        user2: { select: { id: true, full_name: true, profile_image: true, role: true } },
        vehicle: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            primary_image_thumbnail: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isParticipant =
      conversation.user1Id === session.user.id ||
      conversation.user2Id === session.user.id;

    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const isUser1 = conversation.user1Id === session.user.id;

    // Mark as read + reset unread count
    await Promise.all([
      prisma.message.updateMany({
        where: { conversationId, recipientId: session.user.id, read: false },
        data: { read: true },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: isUser1 ? { user1_unread: 0 } : { user2_unread: 0 },
      }),
    ]);

    return NextResponse.json({
      success: true,
      conversation,
      messages,
      other_user: isUser1 ? conversation.user2 : conversation.user1,
    });
  } catch (error) {
    console.error("Failed to get messages", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
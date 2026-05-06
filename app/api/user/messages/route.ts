// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, content, vehicleId } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json(
        { error: "recipientId and content are required" },
        { status: 400 }
      );
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const conversation = await prisma.conversation.upsert({
      where: {
        user1Id_user2Id_vehicleId: {
          user1Id: session.user.id,
          user2Id: recipientId,
          vehicleId: vehicleId ?? null,
        },
      },
      create: {
        user1Id: session.user.id,
        user2Id: recipientId,
        vehicleId: vehicleId ?? null,
        last_message: content.trim(),
        last_message_at: new Date(),
        last_message_type: "general",
        user2_unread: 1,
      },
      update: {
        last_message: content.trim(),
        last_message_at: new Date(),
        last_message_type: "general",
        user2_unread: { increment: 1 },
      },
    });

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        content: content.trim(),
        message_type: "general",
        conversationId: conversation.id,
        vehicleId: vehicleId ?? null,
      },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
    });

    await prisma.notification.create({
      data: {
        recipientId,
        senderId: session.user.id,
        type: "new_message",
        content: `New message from ${session.user.full_name ?? session.user.email}`,
        related_entity_type: "conversation",
        related_entity_id: conversation.id,
        url: `/messages?conversationId=${conversation.id}`,
      },
    });

    // Emit via Socket.io
    const io = (global as any).io;
    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", {
        message,
        conversationId: conversation.id,
      });

      io.to(`user:${recipientId}`).emit("new_notification", {
        type: "new_message",
        conversationId: conversation.id,
        content: `New message from ${session.user.full_name ?? session.user.email}`,
      });
    }

    return NextResponse.json(
      { success: true, message, conversationId: conversation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to send message", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: session.user.id },
          { user2Id: session.user.id },
        ],
      },
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
      orderBy: { last_message_at: "desc" },
    });

    // Attach unread count relative to the logged-in user
    const conversationsWithUnread = conversations.map((conv) => ({
      ...conv,
      unread_count: conv.user1Id === session.user.id ? conv.user1_unread : conv.user2_unread,
      other_user: conv.user1Id === session.user.id ? conv.user2 : conv.user1,
    }));

    return NextResponse.json({ success: true, conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Failed to get conversations", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
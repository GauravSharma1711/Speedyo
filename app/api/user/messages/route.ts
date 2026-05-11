import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { emitNotification } from "@/lib/emitNotification";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }],
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
            authorId: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            message_type: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { last_message_at: "desc" },
    });

    const result = conversations.map((conv) => ({
      ...conv,
      unread_count: conv.user1Id === session.user.id ? conv.user1_unread : conv.user2_unread,
      other_user: conv.user1Id === session.user.id ? conv.user2 : conv.user1,
    }));

    return NextResponse.json({ success: true, conversations: result });
  } catch (error) {
    console.error("GET /api/user/messages failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientId,
      content,
      vehicleId,
      managedSaleRequestId: _managedSaleRequestId,
      message_type = "general",
      test_drive_details,
    }: {
      recipientId: string;
      content: string;
      vehicleId?: string | null;
      managedSaleRequestId?: string | null;
      message_type?: string;
      test_drive_details?: any;
    } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ error: "recipientId and content are required" }, { status: 400 });
    }

    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true },
    });
    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const prismaMessageType =
      ([
        "inquiry",
        "test_drive_request",
        "general",
        "system",
        "confirmation_test_drive",
        "test_drive_status_update",
      ] as const).includes(message_type as any)
        ? (message_type as any)
        : ("general" as const);

    const [user1Id, user2Id] =
      session.user.id < recipientId
        ? [session.user.id, recipientId]
        : [recipientId, session.user.id];

    const isUser1 = session.user.id === user1Id;

    let conversation = await prisma.conversation.findFirst({
      where: { user1Id, user2Id, vehicleId: vehicleId ?? null },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          user1Id,
          user2Id,
          vehicleId: vehicleId ?? null,
          last_message: content.trim(),
          last_message_at: new Date(),
          last_message_type: prismaMessageType,
          user2_unread: isUser1 ? 1 : 0,
          user1_unread: isUser1 ? 0 : 1,
        },
      });
    } else {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          last_message: content.trim(),
          last_message_at: new Date(),
          last_message_type: prismaMessageType,
          ...(isUser1
            ? { user2_unread: { increment: 1 } }
            : { user1_unread: { increment: 1 } }),
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId,
        content: content.trim(),
        message_type: prismaMessageType,
        conversationId: conversation.id,
        vehicleId: vehicleId ?? null,
        test_drive_details: test_drive_details ?? undefined,
      },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
    });

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        senderId: session.user.id,
        type: "new_message",
        content: `New message from ${session.user.full_name ?? session.user.email}`,
        related_entity_type: "conversation",
        related_entity_id: conversation.id,
        url: `/Messages?conversationId=${conversation.id}`,
      },
    });

    const io = (global as any).io;
    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", {
        message,
        conversationId: conversation.id,
      });
    }

    // Emit real-time notification via WebSocket
    emitNotification(recipientId, notification);

    return NextResponse.json(
      { success: true, message, conversationId: conversation.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/user/messages failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
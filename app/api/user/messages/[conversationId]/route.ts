import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

type RouteContext = { params: Promise<{ conversationId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await context.params;

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
            authorId: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isUser1 = conversation.user1Id === session.user.id;
    const isUser2 = conversation.user2Id === session.user.id;

    if (!isUser1 && !isUser2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
      orderBy: { createdAt: "asc" },
    });

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
    console.error("GET /api/user/messages/[conversationId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = await context.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, user1Id: true, user2Id: true },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isUser1 = conversation.user1Id === session.user.id;
    const isUser2 = conversation.user2Id === session.user.id;

    if (!isUser1 && !isUser2) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/user/messages/[conversationId] failed", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
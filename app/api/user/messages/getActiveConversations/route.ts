import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


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
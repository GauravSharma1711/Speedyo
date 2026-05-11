import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const cursor = searchParams.get("cursor");

    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
    });

    let nextCursor: string | null = null;
    if (notifications.length > limit) {
      notifications.pop();
      nextCursor = notifications[notifications.length - 1]?.id ?? null;
    }

    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    return NextResponse.json({ notifications, nextCursor, unreadCount });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      recipientId,
      senderId,
      type,
      content,
      icon,
      url,
      related_entity_type,
      related_entity_id,
    } = body;

    if (!recipientId || !content?.trim()) {
      return NextResponse.json({ error: "recipientId and content are required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        recipientId,
        senderId: senderId ?? session.user.id,
        type: type ?? "general",
        content: content.trim(),
        icon: icon ?? null,
        url: url ?? null,
        related_entity_type: related_entity_type ?? null,
        related_entity_id: related_entity_id ?? null,
        read: false,
      },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/notifications]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

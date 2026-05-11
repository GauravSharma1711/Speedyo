import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId") ?? session.user.id;
    const senderId = searchParams.get("senderId");
    const messageType = searchParams.get("messageType");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (recipientId) where.recipientId = recipientId;
    if (senderId) where.senderId = senderId;
    if (messageType) where.message_type = messageType;

    const [messages, total] = await prisma.$transaction([
      prisma.message.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          sender: { select: { id: true, full_name: true, profile_image: true, role: true } },
          recipient: { select: { id: true, full_name: true, profile_image: true, role: true } },
        },
      }),
      prisma.message.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/messages]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

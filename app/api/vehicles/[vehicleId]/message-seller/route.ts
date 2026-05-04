import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

function makeConversationId(a: string, b: string, vehicleId: string) {
  const [x, y] = [a, b].sort();
  return `${x}_${y}_${vehicleId}`;
}

export async function POST(req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { vehicleId } = params;
    const { content } = await req.json();
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, authorId: true },
    });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    if (!vehicle.authorId) return NextResponse.json({ error: "Vehicle has no seller" }, { status: 400 });

    const senderId = session.user.id;
    const recipientId = vehicle.authorId;
    if (senderId === recipientId) {
      return NextResponse.json({ error: "You cannot message yourself" }, { status: 400 });
    }

    const conversation_id = makeConversationId(senderId, recipientId, vehicleId);

    const message = await prisma.message.create({
      data: {
        senderId,
        recipientId,
        content: content.trim(),
        conversation_id,
        message_type: "general",
        vehicleId,
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vehicles/[id]/message-seller failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


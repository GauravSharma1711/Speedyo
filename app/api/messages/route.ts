import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function POST(request:NextRequest){

    try {

     const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


     const conversation = await prisma.conversation.upsert({ /* ... */ });

    const message = await prisma.message.create({
      data: { /* ... */ },
      include: {
        sender: { select: { id: true, full_name: true, profile_image: true } },
      },
    });

    await prisma.notification.create({ /* ... */ });

    // ── Emit to conversation room so all participants get it instantly ──
    const io = (global as any).io;
    if (io) {
      io.to(`conversation:${conversation.id}`).emit("new_message", {
        message,
        conversationId: conversation.id,
      });

      // Also emit to recipient's personal room for notification badge
      io.to(`user:${recipientId}`).emit("new_notification", {
        type: "new_message",
        conversationId: conversation.id,
      });
    }




         return NextResponse.json({ success: true, message, conversationId: conversation.id }, { status: 201 });
    } catch (error) {
        console.error("Failed to send message", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

}
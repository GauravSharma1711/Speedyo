import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function PATCH(req: NextRequest, context: { params: Promise<{ messageId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId } = await context.params;
    const body = await req.json();

    const message = await prisma.message.update({
      where: { id: messageId },
      data: body,
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("[PATCH /api/messages/[messageId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

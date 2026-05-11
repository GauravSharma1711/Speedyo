import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { notificationIds, markAll } = await request.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true },
      });
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await prisma.notification.updateMany({
        where: {
          id: { in: notificationIds },
          recipientId: userId,
        },
        data: { read: true },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request: provide notificationIds or markAll" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: markAll ? "All notifications marked as read" : "Notifications marked as read",
    });
  } catch (error: any) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
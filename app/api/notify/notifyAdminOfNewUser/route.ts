import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { sendAdminNewUserNotificationMail } from "@/helpers/sendAdminNewUserNotificationMail";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get the newly registered user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        full_name: true,
        email: true,
        user_type: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all admin emails
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
    });

    if (admins.length === 0) {
      console.log("No admin users found to notify");
      return NextResponse.json({ message: "No admins to notify" }, { status: 200 });
    }

    const adminEmails = admins.map((a) => a.email);

    // Send email to all admins using your helper
    await sendAdminNewUserNotificationMail(
      adminEmails,
      user.full_name ?? "Not provided",
      user.email,
      user.user_type,
      user.createdAt.toISOString(),
      user.id
    );

    return NextResponse.json({
      message: "Admin notification sent successfully",
      adminCount: admins.length,
    });

  } catch (error: any) {
    console.error("Failed to notify admin of new user:", error);
    return NextResponse.json(
      {
        error: "Failed to send admin notification",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

interface NotificationPreferences {
  email_notifications: {
    all_emails: boolean;
    new_follower_post: boolean;
    new_follower_vehicle: boolean;
  };
  inapp_notifications: {
    all_notifications: boolean;
    new_follower_post: boolean;
    new_follower_vehicle: boolean;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email_notifications: true,
        inapp_notifications: true,
      },
    });

    return NextResponse.json({
      success: true,
      email_notifications: user?.email_notifications ?? null,
      inapp_notifications: user?.inapp_notifications ?? null,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email_notifications, inapp_notifications }: NotificationPreferences = body;

    if (!email_notifications || !inapp_notifications) {
      return NextResponse.json(
        { error: "email_notifications and inapp_notifications are required" },
        { status: 400 }
      );
    }

    // Upsert email_notifications
    await prisma.emailNotifications.upsert({
      where: { userId: session.user.id },
      update: {
        all_emails: email_notifications.all_emails,
        new_follower_post: email_notifications.new_follower_post,
        new_follower_vehicle: email_notifications.new_follower_vehicle,
      },
      create: {
        userId: session.user.id,
        all_emails: email_notifications.all_emails,
        new_follower_post: email_notifications.new_follower_post,
        new_follower_vehicle: email_notifications.new_follower_vehicle,
      },
    });

    // Upsert inapp_notifications
    await prisma.inAppNotifications.upsert({
      where: { userId: session.user.id },
      update: {
        all_notifications: inapp_notifications.all_notifications,
        new_follower_post: inapp_notifications.new_follower_post,
        new_follower_vehicle: inapp_notifications.new_follower_vehicle,
      },
      create: {
        userId: session.user.id,
        all_notifications: inapp_notifications.all_notifications,
        new_follower_post: inapp_notifications.new_follower_post,
        new_follower_vehicle: inapp_notifications.new_follower_vehicle,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Notification settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);
    return NextResponse.json(
      { error: "Failed to update notification settings" },
      { status: 500 }
    );
  }
}

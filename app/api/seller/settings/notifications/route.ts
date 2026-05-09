
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";



export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [emailSettings, inAppSettings] = await Promise.all([
      prisma.emailNotifications.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.inAppNotifications.findUnique({
        where: { userId: session.user.id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        email: emailSettings ?? {
          all_emails: true,
          new_follower_post: true,
          new_follower_vehicle: true,
        },
        in_app: inAppSettings ?? {
          all_notifications: true,
          new_follower_post: true,
          new_follower_vehicle: true,
        },
      },
    });
  } catch (error) {
    console.error("Failed to get notification settings", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, in_app } = body;


    if (!email && !in_app) {
      return NextResponse.json(
        { error: "Provide email or in_app settings to update" },
        { status: 400 }
      );
    }

    const updates = await Promise.all([

      email
        ? prisma.emailNotifications.upsert({
            where: { userId: session.user.id },
            update: {
              ...(typeof email.all_emails === "boolean" && {
                all_emails: email.all_emails,
              }),
              ...(typeof email.new_follower_post === "boolean" && {
                new_follower_post: email.new_follower_post,
              }),
              ...(typeof email.new_follower_vehicle === "boolean" && {
                new_follower_vehicle: email.new_follower_vehicle,
              }),
            },
            create: {
              userId: session.user.id,
              all_emails: email.all_emails ?? true,
              new_follower_post: email.new_follower_post ?? true,
              new_follower_vehicle: email.new_follower_vehicle ?? true,
            },
          })
        : null,

      // In-app settings
      in_app
        ? prisma.inAppNotifications.upsert({
            where: { userId: session.user.id },
            update: {
              ...(typeof in_app.all_notifications === "boolean" && {
                all_notifications: in_app.all_notifications,
              }),
              ...(typeof in_app.new_follower_post === "boolean" && {
                new_follower_post: in_app.new_follower_post,
              }),
              ...(typeof in_app.new_follower_vehicle === "boolean" && {
                new_follower_vehicle: in_app.new_follower_vehicle,
              }),
            },
            create: {
              userId: session.user.id,
              all_notifications: in_app.all_notifications ?? true,
              new_follower_post: in_app.new_follower_post ?? true,
              new_follower_vehicle: in_app.new_follower_vehicle ?? true,
            },
          })
        : null,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        email: updates[0],
        in_app: updates[1],
      },
    });
  } catch (error) {
    console.error("Failed to update notification settings", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
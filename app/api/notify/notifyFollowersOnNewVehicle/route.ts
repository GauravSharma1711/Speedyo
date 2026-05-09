import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import { sendNewVehicleListingMail } from "@/helpers/sendNewVehicleListingMail";
import { emitNotification } from "@/lib/emitNotification";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await request.json();

    if (!vehicleId) {
      return NextResponse.json({ error: "vehicleId is required" }, { status: 400 });
    }

    // Fetch vehicle + author in one query
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        title: true,
        price: true,
        year: true,
        mileage: true,
        location: true,
        authorId: true,
        author: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (!vehicle.authorId) {
      return NextResponse.json({ error: "Vehicle has no author" }, { status: 400 });
    }

    const authorName = vehicle.author?.full_name ?? "A seller";

    // Get all followers of the author + their notification preferences
    const follows = await prisma.follow.findMany({
      where: { followedId: vehicle.authorId },
      select: {
        follower: {
          select: {
            id: true,
            email: true,
            inapp_notifications: true,
            email_notifications: true,
          },
        },
      },
    });

    if (follows.length === 0) {
      return NextResponse.json({
        message: "No followers to notify",
        notificationsSent: 0,
      });
    }

    // Deduplicate followers
    const seenIds = new Set<string>();
    const uniqueFollowers = follows
      .map((f) => f.follower)
      .filter((follower) => {
        if (seenIds.has(follower.id)) return false;
        seenIds.add(follower.id);
        return true;
      });

    let notificationsSent = 0;
    let emailsSent = 0;

    // ── In-app notifications ──────────────────────────────────────
    const followersWantingInApp = uniqueFollowers.filter((follower) => {
      const prefs = follower.inapp_notifications;
      return (
        prefs?.all_notifications !== false &&
        prefs?.new_follower_vehicle !== false
      );
    });

    if (followersWantingInApp.length > 0) {
      const createdNotifications = await prisma.notification.createManyAndReturn({
        data: followersWantingInApp.map((follower) => ({
          recipientId: follower.id,
          senderId: vehicle.authorId as string,
          type: "new_vehicle_listing" as const,
          content: `${authorName} listed a new vehicle: ${vehicle.title}`,
          url: `/vehicle?id=${vehicleId}`,
          icon: "Car",
          read: false,
        })),
      });

      notificationsSent = followersWantingInApp.length;

      // Emit real-time notifications via WebSocket
      createdNotifications.forEach((notification) => {
        emitNotification(notification.recipientId, notification);
      });
    }

    // ── Email notifications ───────────────────────────────────────
    const followersWantingEmail = uniqueFollowers.filter((follower) => {
      const prefs = follower.email_notifications;
      return (
        prefs?.all_emails !== false &&
        prefs?.new_follower_vehicle !== false
      );
    });

    if (followersWantingEmail.length > 0) {
      const followerEmails = followersWantingEmail.map((f) => f.email);

   await sendNewVehicleListingMail(
  followerEmails,
  authorName,
  vehicleId,        
  vehicle.title,
  Number(vehicle.price),
  vehicle.year,
  vehicle.mileage ?? undefined,
  vehicle.location ?? undefined,
);

      emailsSent = followerEmails.length;
    }

    return NextResponse.json({
      message: "Followers notified successfully",
      notificationsSent,
      emailsSent,
      totalFollowers: follows.length,
    });

  } catch (error: any) {
    console.error("Error in notifyFollowersOfNewVehicle:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
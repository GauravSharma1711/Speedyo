import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { NotificationType } from "@/lib/generated/prisma/enums";

// GET - Get all users the current user is following
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: {
      id: true,
      followedId: true,
      followed: {
        select: {
          id: true,
          full_name: true,
          profile_image: true,
          user_type: true,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    following: follows.map((f) => ({
      id: f.id,
      followed_id: f.followedId,
      user: f.followed,
    })),
  });
}

// POST - Follow a user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const followedId = body?.followedId as string | undefined;
  if (!followedId) return NextResponse.json({ error: "followedId is required" }, { status: 400 });

  const followerId = session.user.id as string;
  if (followedId === followerId) {
    return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
  }

  let follow = null;
  try {
    follow = await prisma.follow.create({
      data: { followerId, followedId },
    });
  } catch (e) {
    follow = await prisma.follow.findFirst({
      where: { followerId, followedId },
      select: { id: true, followerId: true, followedId: true },
    });
  }

  if (!follow) return NextResponse.json({ error: "Failed to create follow" }, { status: 500 });

  const sender = await prisma.user.findUnique({
    where: { id: followerId },
    select: { full_name: true, email: true },
  });

  const senderName = sender?.full_name || sender?.email || "Someone";
  await prisma.notification.create({
    data: {
      recipientId: followedId,
      senderId: followerId,
      type: NotificationType.new_follower,
      content: `${senderName} started following you`,
      url: `/profile?id=${followerId}`,
      icon: "UserPlus",
      read: false,
    },
  });

  return NextResponse.json(
    { success: true, follow: { id: follow.id, follower_id: followerId, followed_id: followedId } },
    { status: 200 }
  );
}
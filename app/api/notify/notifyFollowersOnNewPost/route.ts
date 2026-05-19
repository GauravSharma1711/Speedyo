
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import { sendNewPostNotificationMail } from "@/helpers/sendNewPostNotificationMail";
import { emitNotification } from "@/lib/emitNotification";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    // Fetch post + author in one query
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        content: true,
        authorId: true,
        author: {
          select: {
            id: true,
            full_name: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.authorId) {
      return NextResponse.json({ error: "Post has no author" }, { status: 400 });
    }

    const authorName = post.author?.full_name ?? "A user";

    // Get all followers of the author + their notification preferences
    const follows = await prisma.follow.findMany({
      where: { followedId: post.authorId },
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

    // Deduplicate followers (same as base44 version)
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
        prefs?.new_follower_post !== false
      );
    });

    if (followersWantingInApp.length > 0) {
      const createdNotifications = await prisma.notification.createManyAndReturn({
        data: followersWantingInApp.map((follower) => ({
          recipientId: follower.id,
          senderId: post.authorId,
          type: "new_post" as const,
          content: `${authorName} shared a new post`,
          url: "/Feed",
          icon: "MessageSquare",
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
        prefs?.new_follower_post !== false
      );
    });

    if (followersWantingEmail.length > 0) {
      const followerEmails = followersWantingEmail.map((f) => ({ email: f.email, userId: f.id }));
      const postContent = post.content
        ? post.content.substring(0, 200) + (post.content.length > 200 ? "..." : "")
        : undefined;

      await sendNewPostNotificationMail(followerEmails, authorName, postContent);
      emailsSent = followerEmails.length;
    }

    return NextResponse.json({
      message: "Followers notified successfully",
      notificationsSent,
      emailsSent,
      totalFollowers: follows.length,
    });

  } catch (error: any) {
    console.error("Error in notifyFollowersOfNewPost:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
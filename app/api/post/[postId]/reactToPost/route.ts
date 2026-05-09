import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

const VALID_REACTIONS = ["like", "love", "laugh", "wow", "fire", "angry"] as const;
type ReactionType = (typeof VALID_REACTIONS)[number];

type UserReaction = { user_email: string; reaction: string };

export async function POST(req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await ctx.params;
  const { reactionType }: { reactionType: ReactionType | null } = await req.json();

  if (reactionType !== null && !VALID_REACTIONS.includes(reactionType)) {
    return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { reactions: true, user_reactions: true, authorId: true },
  });

  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const { email: userEmail, id: userId } = session.user;
  const reactions = { ...(post.reactions as Record<string, number>) };
  const userReactions = [...((post.user_reactions as UserReaction[]) ?? [])];

  // Remove existing reaction if any
  const existingIdx = userReactions.findIndex((r) => r.user_email === userEmail);
  const previousReaction = existingIdx > -1 ? userReactions[existingIdx].reaction : null;

  if (previousReaction) {
    reactions[previousReaction] = Math.max(0, (reactions[previousReaction] || 0) - 1);
    userReactions.splice(existingIdx, 1);
  }

  // Toggle off if same reaction or null, otherwise add new
  const isToggleOff = reactionType === null || reactionType === previousReaction;

  if (!isToggleOff && reactionType) {
    reactions[reactionType] = (reactions[reactionType] || 0) + 1;
    userReactions.push({ user_email: userEmail, reaction: reactionType });
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { likes: reactions.like ?? 0, reactions, user_reactions: userReactions },
    select: { id: true, likes: true, reactions: true, user_reactions: true },
  });

  // Notify author (fire and forget — don't let this block the response)
  if (!isToggleOff && post.authorId && post.authorId !== userId) {
    prisma.notification.create({
      data: {
        recipientId: post.authorId,
        senderId: userId,
        type: "post_like",
        content: `${session.user.full_name ?? "Someone"} reacted to your post`,
        url: "/feed",
        icon: "Heart",
        read: false,
      },
    }).catch(console.error);
  }

  return NextResponse.json({
    success: true,
    activeReaction: isToggleOff ? null : reactionType,
    post: updatedPost,
  });
}
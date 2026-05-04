import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

type UserReaction = { user_email: string; reaction: string };

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!session?.user?.id || !email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId, reactionType } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, reactions: true, user_reactions: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updatedReactions = { ...(post.reactions as Record<string, number>) };
    const updatedUserReactions = [...(post.user_reactions as UserReaction[])];

    const existingReactionIndex = updatedUserReactions.findIndex((ur) => ur.user_email === email);

    if (existingReactionIndex > -1) {
      const oldReaction = updatedUserReactions[existingReactionIndex].reaction;
      updatedReactions[oldReaction] = Math.max(0, (updatedReactions[oldReaction] || 0) - 1);
      updatedUserReactions.splice(existingReactionIndex, 1);
    }

    if (reactionType) {
      updatedReactions[reactionType] = (updatedReactions[reactionType] || 0) + 1;
      updatedUserReactions.push({
        user_email: email,
        reaction: reactionType,
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        reactions: updatedReactions,
        user_reactions: updatedUserReactions,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[POST /api/post/updatePostReactions]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

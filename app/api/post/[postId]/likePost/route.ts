import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function POST(req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await ctx.params;

    const userId = session.user.id;
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json({ error: "User email required" }, { status: 400 });
    }

    type UserReaction = { user_email: string; reaction: string };
    const result = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ reactions: unknown; user_reactions: unknown; author_id: string }>>`
        SELECT reactions, user_reactions, author_id
        FROM posts
        WHERE id = ${postId}
        FOR UPDATE
      `;

      const row = rows[0];
      if (!row) {
        throw Object.assign(new Error("Post not found"), { code: "POST_NOT_FOUND" });
      }

      const updatedReactions = { ...(row.reactions as Record<string, number> | null | undefined) } as Record<
        string,
        number
      >;
      const updatedUserReactions = [
        ...((row.user_reactions as UserReaction[] | null | undefined) ?? []),
      ] as UserReaction[];

      const existingIdx = updatedUserReactions.findIndex((r) => r.user_email === userEmail);
      const previousReaction = existingIdx > -1 ? updatedUserReactions[existingIdx].reaction : null;

      if (existingIdx > -1 && previousReaction) {
        updatedReactions[previousReaction] = Math.max(0, (updatedReactions[previousReaction] || 0) - 1);
        updatedUserReactions.splice(existingIdx, 1);
      }

      const willLike = previousReaction !== "like";
      if (willLike) {
        updatedReactions.like = (updatedReactions.like || 0) + 1;
        updatedUserReactions.push({ user_email: userEmail, reaction: "like" });
      }

      const updatedPost = await tx.post.update({
        where: { id: postId },
        data: {
          likes: updatedReactions.like ?? 0,
          reactions: updatedReactions,
          user_reactions: updatedUserReactions,
        },
        select: {
          id: true,
          likes: true,
          user_reactions: true,
          reactions: true,
          authorId: true,
        },
      });

      if (willLike && row.author_id && row.author_id !== userId) {
        await tx.notification.create({
          data: {
            recipientId: row.author_id,
            senderId: userId,
            type: "post_like",
            content: `${session.user.full_name ?? "Someone"} liked your post`,
            url: `/Feed`,
            icon: "Heart",
            read: false,
          },
        });
      }

      return { updatedPost, willLike };
    });

    return NextResponse.json({
      success: true,
      liked: result.willLike,
      likes: result.updatedPost.likes,
      user_reactions: result.updatedPost.user_reactions,
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "POST_NOT_FOUND"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

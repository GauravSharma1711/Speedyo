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

    const ALLOWED_REACTIONS = new Set(["like", "love", "laugh", "wow", "fire", "angry"]);
    if (reactionType !== null && reactionType !== undefined) {
      if (typeof reactionType !== "string" || !ALLOWED_REACTIONS.has(reactionType)) {
        return NextResponse.json({ error: "Invalid reactionType" }, { status: 400 });
      }
    }

    const updatedPost = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ reactions: unknown; user_reactions: unknown }>>`
        SELECT reactions, user_reactions
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

      return tx.post.update({
        where: { id: postId },
        data: {
          reactions: updatedReactions,
          user_reactions: updatedUserReactions,
          likes: updatedReactions.like ?? 0,
        },
      });
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "POST_NOT_FOUND"
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[POST /api/post/updatePostReactions]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

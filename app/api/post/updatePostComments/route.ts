import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const commentsCount = await prisma.comment.count({
      where: { postId },
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { comments_count: commentsCount },
      select: {
        id: true,
        comments_count: true,
        content: true,
        authorId: true,
        post_type: true,
        likes: true,
        views: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedPost);
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error syncing comment count:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

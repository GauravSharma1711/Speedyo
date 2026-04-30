
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

    // Atomic increment — avoids race condition same as views route
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { shares: { increment: 1 } },
      select: {
        id: true,
        shares: true,
        content: true,
        authorId: true,
        post_type: true,
        likes: true,
        views: true,
        comments_count: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedPost);

  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.error("Error incrementing post shares:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
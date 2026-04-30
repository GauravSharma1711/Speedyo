import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    // Increment views atomically — no need to fetch first then update
    // This avoids a race condition where two requests read the same count
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({
      success: true,
      newViewCount: updatedPost.views,
    });

  } catch (error: any) {
    // Prisma throws P2025 when record not found
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    console.error("Error incrementing post views:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Missing postId" }, { status: 400 });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    return NextResponse.json({
      success: true,
      newViewCount: updatedPost.views,
    });
  } catch (error: unknown) {
    const code = error && typeof error === "object" && "code" in error ? (error as { code?: string }).code : undefined;
    if (code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    console.error("Error incrementing post views:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

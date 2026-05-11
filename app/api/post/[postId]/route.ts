import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true, full_name: true, profile_image: true } } },
    });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("[GET /api/post/[postId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;
    const body = await req.json();
    const { content, images, article_title } = body;

    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (existing.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updateData: any = {};
    if (content !== undefined) updateData.content = content;
    if (images !== undefined) updateData.images = images;
    if (article_title !== undefined) updateData.article_title = article_title;

    const updated = await prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (error) {
    console.error("[PATCH /api/post/[postId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { postId } = await params;
    const existing = await prisma.post.findUnique({ where: { id: postId } });
    if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });
    if (existing.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.post.delete({ where: { id: postId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/post/[postId]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
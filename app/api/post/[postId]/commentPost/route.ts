import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

function validateCommentBody(body: Record<string, unknown>): string | null {
  const { content, parentCommentId } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0)
    return "content is required";

  if (content.trim().length > 2000) return "content must be 2000 characters or fewer";

  if (parentCommentId !== undefined && typeof parentCommentId !== "string")
    return "parentCommentId must be a string";

  return null;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await ctx.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const body = await req.json();

    const validationError = validateCommentBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { content, parentCommentId } = body;

    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { id: true, postId: true, parentCommentId: true },
      });

      if (!parentComment) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json(
          { error: "Parent comment does not belong to this post" },
          { status: 400 }
        );
      }

      if (parentComment.parentCommentId) {
        return NextResponse.json(
          { error: "Replies to replies are not allowed" },
          { status: 400 }
        );
      }
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          authorId: session.user.id,
          content: content.trim(),
          parentCommentId: parentCommentId ?? null,
        },
        include: {
          author: {
            select: {
              id: true,
              full_name: true,
              profile_image: true,
              role: true,
              user_type: true,
              business_name: true,
            },
          },
          parentComment: parentCommentId
            ? {
                select: {
                  id: true,
                  content: true,
                  author: {
                    select: {
                      id: true,
                      full_name: true,
                    },
                  },
                },
              }
            : false,
        },
      }),

      prisma.post.update({
        where: { id: postId },
        data: { comments_count: { increment: 1 } },
      }),

      ...(parentCommentId
        ? [
            prisma.comment.update({
              where: { id: parentCommentId },
              data: { replies_count: { increment: 1 } },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/post/[postId]/commentPost]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await ctx.params;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where: { postId, parentCommentId: null },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              full_name: true,
              profile_image: true,
              role: true,
              user_type: true,
              business_name: true,
            },
          },
          replies: {
            take: 3,
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id: true,
                  full_name: true,
                  profile_image: true,
                  role: true,
                  user_type: true,
                  business_name: true,
                },
              },
            },
          },
        },
      }),

      prisma.comment.count({
        where: { postId, parentCommentId: null },
      }),
    ]);

    return NextResponse.json({
      success: true,
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("[GET /api/post/[postId]/commentPost]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

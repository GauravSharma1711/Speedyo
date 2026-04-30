import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

function validateCommentBody(body: Record<string, unknown>): string | null {
  const { content, parentCommentId } = body;

  if (!content || typeof content !== "string" || content.trim().length === 0)
    return "content is required";

  if (content.trim().length > 2000)
    return "content must be 2000 characters or fewer";

  if (parentCommentId !== undefined && typeof parentCommentId !== "string")
    return "parentCommentId must be a string";

  return null;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;

    // Verify post exists
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

    // If it's a reply, verify parent comment exists and belongs to this post
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

      // Prevent nested replies (only 1 level deep)
      if (parentComment.parentCommentId) {
        return NextResponse.json(
          { error: "Replies to replies are not allowed" },
          { status: 400 }
        );
      }
    }

    // Create comment + update counters in a transaction
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          authorId:       session.user.id,
          content:        content.trim(),
          parentCommentId: parentCommentId ?? null,
        },
        include: {
          author: {
            select: {
              id:            true,
              full_name:     true,
              profile_image: true,
              role:          true,
              user_type:     true,
              business_name: true,
            },
          },
          // Include parent comment info if it's a reply
          parentComment: parentCommentId
            ? {
                select: {
                  id:      true,
                  content: true,
                  author: {
                    select: {
                      id:        true,
                      full_name: true,
                    },
                  },
                },
              }
            : false,
        },
      }),

      // Increment post comments_count
      prisma.post.update({
        where: { id: postId },
        data: { comments_count: { increment: 1 } },
      }),

      // If it's a reply, increment parent comment replies_count
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
    console.error("[POST /api/posts/[postId]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET comments for a post (with pagination)
export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(req.url);

    const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip   = (page - 1) * limit;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch only top-level comments (no parentCommentId)
    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where:   { postId, parentCommentId: null },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id:            true,
              full_name:     true,
              profile_image: true,
              role:          true,
              user_type:     true,
              business_name: true,
            },
          },
          // Eagerly load first 3 replies per comment
          replies: {
            take:    3,
            orderBy: { createdAt: "asc" },
            include: {
              author: {
                select: {
                  id:            true,
                  full_name:     true,
                  profile_image: true,
                  role:          true,
                  user_type:     true,
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
        hasMore:    page * limit < total,
      },
    });
  } catch (error) {
    console.error("[GET /api/posts/[postId]/comments]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
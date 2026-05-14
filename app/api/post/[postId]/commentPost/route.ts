import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { emitNotification } from "@/lib/emitNotification";

function validateCommentBody(body: Record<string, unknown>): string | null {
  const content = body.content;
  const parentCommentId = body.parentCommentId ?? body.parent_comment_id;

  if (!content || typeof content !== "string" || content.trim().length === 0)
    return "content is required";

  if (content.trim().length > 2000) return "content must be 2000 characters or fewer";

  if (parentCommentId !== undefined && parentCommentId !== null && typeof parentCommentId !== "string")
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

    const { content, parentCommentId: pc1, parent_comment_id: pc2 } = body;
    const parentCommentId = pc1 ?? pc2 ?? null;

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

    // Send notifications
    const postWithAuthor = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, author: { select: { full_name: true } } }
    });

    if (postWithAuthor && postWithAuthor.authorId !== session.user.id) {
      // Notify post author about new comment - create notification record
      await prisma.notification.create({
        data: {
          recipientId: postWithAuthor.authorId,
          senderId: session.user.id as string,
          type: "new_comment",
          content: `${comment.author.full_name} commented on your post`,
          related_entity_type: "Post",
          related_entity_id: postId,
          url: `/Feed#post-${postId}`,
          icon: "MessageCircle",
          read: false,
        },
      });
      // Also emit socket notification
      emitNotification(postWithAuthor.authorId, {
        type: "new_comment",
        message: `${comment.author.full_name} commented on your post`,
      });
    }

    // If reply, notify parent comment author
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { authorId: true, author: { select: { full_name: true } } }
      });
      if (parentComment && parentComment.authorId !== session.user.id && parentComment.authorId !== postWithAuthor?.authorId) {
        await prisma.notification.create({
          data: {
            recipientId: parentComment.authorId,
            senderId: session.user.id as string,
            type: "comment_reply",
            content: `${comment.author.full_name} replied to your comment`,
            related_entity_type: "Post",
            related_entity_id: postId,
            url: `/Feed#comment-${parentCommentId}`,
            icon: "MessageCircle",
            read: false,
          },
        });
        emitNotification(parentComment.authorId, {
          type: "comment_reply",
          message: `${comment.author.full_name} replied to your comment`,
        });
      }
    }

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

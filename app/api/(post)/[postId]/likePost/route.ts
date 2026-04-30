import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

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

    // Fetch current post
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        likes: true,
        user_reactions: true,
        reactions: true,
        authorId: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;

    type UserReaction = { user_email: string; reaction: string };
    const userReactions = post.user_reactions as UserReaction[];

    // Check if user already liked this post
    const alreadyLiked = userReactions.some(
      (r) => r.user_email === userEmail && r.reaction === "like"
    );

    let updatedLikes: number;
    let updatedUserReactions: UserReaction[];

    if (alreadyLiked) {
      // Unlike — remove the like
      updatedLikes = Math.max(0, post.likes - 1);
      updatedUserReactions = userReactions.filter(
        (r) => !(r.user_email === userEmail && r.reaction === "like")
      );
    } else {
      // Like — add the like
      updatedLikes = post.likes + 1;
      updatedUserReactions = [
        ...userReactions,
        { user_email: userEmail, reaction: "like" },
      ];
    }

    // Update post likes + user_reactions atomically
    const [updatedPost] = await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          likes: updatedLikes,
          user_reactions: updatedUserReactions,
        },
        select: {
          id: true,
          likes: true,
          user_reactions: true,
          reactions: true,
          authorId: true,
        },
      }),

      // Send notification to post author (if not liking own post)
      ...(post.authorId && post.authorId !== userId
        ? [
            prisma.notification.create({
              data: {
                recipientId: post.authorId,
                senderId: userId,
                type: "post_like",
                content: `${session.user.full_name ?? "Someone"} liked your post`,
                url: `/feed`,
                icon: "Heart",
                read: false,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({
      success: true,
      liked: !alreadyLiked,
      likes: updatedPost.likes,
      user_reactions: updatedPost.user_reactions,
    });

  } catch (error: any) {
    if (error?.code === "P2025") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.error("Error liking post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
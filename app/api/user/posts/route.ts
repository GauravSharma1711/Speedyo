import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? searchParams.get("id");
  const page = Math.max(1, toInt(searchParams.get("page"), 1));
  const limit = Math.min(50, Math.max(1, toInt(searchParams.get("limit"), 24)));
  const skip = (page - 1) * limit;

  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const [total, rows] = await Promise.all([
    prisma.post.count({ where: { authorId: userId } }),
    prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
            user_type: true,
            role: true,
            isVerified: true,
          },
        },
      },
    }),
  ]);

  const posts = rows.map((p) => ({
    id: p.id,
    created_date: p.createdAt,
    updated_date: p.updatedAt,
    post_type: p.post_type,
    content: p.content,
    images: p.images,
    images_thumbnails: p.images_thumbnails,
    images_small: p.images_small,
    images_medium: p.images_medium,
    video_url: p.video_url,
    video_thumbnail: p.video_thumbnail,
    article_title: p.article_title,
    article_excerpt: p.article_excerpt,

    views: p.views,
    shares: p.shares,
    comments_count: p.comments_count,
    reactions: p.reactions,
    user_reactions: p.user_reactions,

    author: p.author ?? null,
    author_id: p.authorId,
    vehicle_id: p.vehicleId,
  }));

  return NextResponse.json({ success: true, page, limit, total, posts }, { status: 200 });
}
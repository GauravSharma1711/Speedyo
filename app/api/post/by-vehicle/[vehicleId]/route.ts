import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ vehicleId: string }> }) {
  try {
    const { vehicleId } = await ctx.params;
    if (!vehicleId) return NextResponse.json({ error: "Missing vehicleId" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, toInt(searchParams.get("limit"), 10)));
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.post.count({ where: { vehicleId } }),
      prisma.post.findMany({
        where: { vehicleId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          post_type: true,
          content: true,
          images: true,
          images_thumbnails: true,
          images_small: true,
          images_medium: true,
          video_url: true,
          video_thumbnail: true,
          article_title: true,
          article_excerpt: true,
          views: true,
          shares: true,
          comments_count: true,
          reactions: true,
          user_reactions: true,
          authorId: true,
          author: {
            select: {
              id: true,
              full_name: true,
              profile_image: true,
              role: true,
              user_type: true,
              isVerified: true,
            },
          },
        },
      }),
    ]);

    const posts = items.map((p) => ({
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
      author_id: p.authorId,
      author_name: p.author?.full_name ?? null,
      author_avatar: p.author?.profile_image ?? null,
      author: p.author,
      vehicle_id: vehicleId,
    }));

    return NextResponse.json({ success: true, page, limit, total, posts }, { status: 200 });
  } catch (error) {
    console.error("GET /api/post/by-vehicle/[vehicleId] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


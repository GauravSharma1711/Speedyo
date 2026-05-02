import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const VALID_POST_TYPES = ["text", "image", "video", "article", "vehicle_promo"] as const;

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validatePostBody(body: Record<string, unknown>): string | null {
  const { post_type, content, images, video_url, article_title } = body;

  if (!post_type || !VALID_POST_TYPES.includes(post_type as (typeof VALID_POST_TYPES)[number])) {
    return `post_type must be one of: ${VALID_POST_TYPES.join(", ")}`;
  }

  switch (post_type) {
    case "text":
      if (!content || typeof content !== "string" || content.trim().length === 0)
        return "content is required for text posts";
      break;

    case "image":
      if (!Array.isArray(images) || images.length === 0) return "at least one image URL is required";
      if (images.some((img) => typeof img !== "string" || !isValidUrl(img)))
        return "all image entries must be valid URLs";
      break;

    case "video":
      if (!video_url || typeof video_url !== "string" || !isValidUrl(video_url))
        return "a valid video_url is required";
      break;

    case "article":
      if (!article_title || typeof article_title !== "string" || article_title.trim().length === 0)
        return "article_title is required";
      if (!content || typeof content !== "string" || content.trim().length === 0)
        return "content (article body) is required";
      if (
        body.article_excerpt &&
        typeof body.article_excerpt === "string" &&
        body.article_excerpt.length > 300
      )
        return "article_excerpt must be 300 characters or fewer";
      break;

    case "vehicle_promo":
      if (!body.vehicleId || typeof body.vehicleId !== "string")
        return "vehicleId is required for vehicle_promo posts";
      break;
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const validationError = validatePostBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const {
      post_type,
      content,
      vehicleId,
      images,
      images_thumbnails,
      images_small,
      images_medium,
      video_url,
      video_thumbnail,
      article_title,
      article_excerpt,
    } = body;

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        select: { authorId: true },
      });

      if (!vehicle) {
        return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (vehicle.authorId !== session.user.id && user?.role !== "admin") {
        return NextResponse.json(
          { error: "You don't have permission to promote this vehicle" },
          { status: 403 }
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        post_type: post_type,
        content: content ?? "",
        vehicleId: vehicleId ?? null,
        images: images ?? [],
        images_thumbnails: images_thumbnails ?? [],
        images_small: images_small ?? [],
        images_medium: images_medium ?? [],

        ...(post_type === "video" && {
          video_url,
          video_thumbnail: video_thumbnail ?? null,
        }),

        ...(post_type === "article" && {
          article_title,
          article_excerpt: article_excerpt ?? null,
        }),
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
        vehicle:
          post_type === "vehicle_promo"
            ? {
                select: {
                  id: true,
                  title: true,
                  make: true,
                  model: true,
                  year: true,
                  price: true,
                  status: true,
                  verified: true,
                  primary_image_thumbnail: true,
                },
              }
            : false,
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/post/createPost]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

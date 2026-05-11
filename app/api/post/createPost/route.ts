import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const VALID_POST_TYPES = ["text", "image", "video", "article", "vehicle_promo"] as const;

function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  // Allow absolute URLs and relative paths like /uploads/images/...
  if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function validatePostBody(body: Record<string, unknown>): string | null {
  const { post_type, content, images, article_title } = body;

  if (!post_type || !VALID_POST_TYPES.includes(post_type as (typeof VALID_POST_TYPES)[number])) {
    return `post_type must be one of: ${VALID_POST_TYPES.join(", ")}`;
  }

  const vehicleId = (body.vehicle_id ?? body.vehicleId) as unknown;
  if (!vehicleId || typeof vehicleId !== "string") return "vehicle_id is required";

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
      if (!Array.isArray(images) || images.length === 0) return "at least one media URL is required";
      if (images.some((img) => typeof img !== "string" || !isValidUrl(img)))
        return "all media entries must be valid URLs";
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
      if (!content && (!Array.isArray(images) || images.length === 0)) {
        return "content or images is required for vehicle_promo posts";
      }
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
      images,
      images_thumbnails,
      images_small,
      images_medium,
      video_thumbnail,
      article_title,
      article_excerpt,
    } = body;

    const vehicleId =
      typeof body.vehicle_id === "string"
        ? body.vehicle_id
        : typeof body.vehicleId === "string"
          ? body.vehicleId
          : null;

    if (!vehicleId) {
      return NextResponse.json({ error: "vehicle_id is required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { authorId: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    if (vehicle.authorId !== session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "admin") {
        return NextResponse.json(
          { error: "You don't have permission to post for this vehicle" },
          { status: 403 },
        );
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        post_type: post_type,
        content: content ?? "",
        vehicleId,
        images: images ?? [],
        images_thumbnails: images_thumbnails ?? [],
        images_small: images_small ?? [],
        images_medium: images_medium ?? [],
        ...(post_type === "video" && {
          video_url: Array.isArray(images) && typeof images[0] === "string" ? images[0] : null,
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
        vehicle: {
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
        },
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/post/createPost]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

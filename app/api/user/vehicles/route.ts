import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let userId = searchParams.get("userId") ?? searchParams.get("id");
  const type = (searchParams.get("type") ?? "managed").toLowerCase();
  const page = Math.max(1, toInt(searchParams.get("page"), 1));
  const limit = Math.min(50, Math.max(1, toInt(searchParams.get("limit"), 24)));
  const skip = (page - 1) * limit;

  // Auto-detect from session if no userId or "me" provided
  if (!userId || userId === "me") {
    const session = await getServerSession(authOptions);
    userId = session?.user?.id ?? null;
  }

  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  const where =
    type === "direct"
      ? { authorId: userId }
      : { original_owner_id: userId }; 

  const [total, rows] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        title: true,
        make: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        condition: true,
        description: true,
        location: true,
        fuel_type: true,
        transmission: true,
        status: true,
        featured: true,
        verified: true,
        views: true,
        shares: true,
        primary_image: true,
        authorId: true,
        original_owner_id: true,
        _count: { select: { vehicleLikes: true, vehicleSaves: true } },
      },
    }),
  ]);

  const vehicles = rows.map((v) => {
    const priceNum = v.price ? Number(v.price) : null;
    const authorId = v.authorId ?? v.original_owner_id;

    return {
      id: v.id,
      primary_image: v.primary_image,
      primary_image_thumbnail: v.primary_image,
      title: v.title,
      year: v.year,
      mileage: v.mileage,
      location: v.location,
      price: priceNum,
      status: v.status,
      featured: v.featured,
      verified: v.verified,
      views: v.views,
      shares: v.shares,
      created_by: authorId,
      created_by_id: authorId,
      condition: v.condition,
      make: v.make,
      model: v.model,
      likes_count: v._count.vehicleLikes,
      saves_count: v._count.vehicleSaves,
      createdAt: v.createdAt,
    };
  });

  return NextResponse.json({ success: true, page, limit, total, vehicles }, { status: 200 });
}
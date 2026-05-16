import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

function toInt(value: string | null, fallback: number) {
  const n = value ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function toFloat(value: string | null) {
  if (value === null) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeSort(sort: string | null) {
  const s = (sort ?? "-createdAt").trim();
  const desc = s.startsWith("-");
  const key = desc ? s.slice(1) : s;

  const direction = desc ? ("desc" as const) : ("asc" as const);
  if (key === "createdAt") return { createdAt: direction };
  if (key === "price") return { price: direction };
  if (key === "year") return { year: direction };
  if (key === "mileage") return { mileage: direction };
  return { createdAt: "desc" as const };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, toInt(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, toInt(searchParams.get("limit"), 24)));
    const skip = (page - 1) * limit;

    const q = (searchParams.get("q") ?? "").trim();
    const make = (searchParams.get("make") ?? "").trim();
    const condition = (searchParams.get("condition") ?? "").trim();
    const fuelType = (searchParams.get("fuelType") ?? "").trim();
    const location = (searchParams.get("location") ?? "").trim();

    const priceRange = (searchParams.get("priceRange") ?? "").trim();
    const [rangeMin, rangeMax] = priceRange ? priceRange.split("-") : [];
    const priceMin =
      toFloat(searchParams.get("priceMin")) ?? (rangeMin ? Number.parseFloat(rangeMin) : null);
    const priceMax =
      toFloat(searchParams.get("priceMax")) ?? (rangeMax ? Number.parseFloat(rangeMax) : null);
    const status = (searchParams.get("status") ?? "").trim();

        const session = await getServerSession(authOptions);
    const isGuest = session?.user?.user_type === "guest";

    console.log("sesion",session);

    const where: any = {
      AND: [],
    };
       if (isGuest) {
      where.AND.push({isDirectListing: { not: true } });
    }if (status) {
      where.AND.push({ status });
    } else {
      where.AND.push({ OR: [{ status: "available" }, { status: "unavailable" }] });
    }

    if (make) where.AND.push({ make });
    if (condition) where.AND.push({ condition });
    if (fuelType) where.AND.push({ fuel_type: fuelType });
    if (location) where.AND.push({ location: { contains: location, mode: "insensitive" } });

    if (priceMin !== null || priceMax !== null) {
      const priceFilter: any = {};
      if (priceMin !== null) priceFilter.gte = String(priceMin);
      if (priceMax !== null) priceFilter.lte = String(priceMax);
      where.AND.push({ price: priceFilter });
    }

    if (q) {
      where.AND.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { make: { contains: q, mode: "insensitive" } },
          { model: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    const orderBy = normalizeSort(searchParams.get("sort"));

    const [total, rawVehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        orderBy,
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
          isDirectListing:true,
          featured: true,
          verified: true,
          website_managed: true,
          views: true,
          shares: true,
          primary_image: true,
          primary_image_thumbnail: true,
          primary_image_small: true,
          primary_image_medium: true,
          images: true,
          images_thumbnails: true,
          images_small: true,
          images_medium: true,
          authorId: true,
          _count: {
            select: { vehicleLikes: true, vehicleSaves: true },
          },
        },
      }),
    ]);

    const vehicles = rawVehicles.map(({ _count, ...rest }) => ({
      ...rest,
      likes_count: _count.vehicleLikes,
      saves_count: _count.vehicleSaves,
      shares_count: rest.shares,
    }));

    return NextResponse.json({
      success: true,
      page,
      limit,
      total,
      vehicles,
    });
  } catch (error) {
    console.error("GET /api/vehicles failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


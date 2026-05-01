import { NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { featured: true, status: "available" },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        condition: true,
        location: true,
        fuel_type: true,
        transmission: true,
        primary_image: true,
        verified: true,
        featured: true,
        views: true,
        likes_count: true,
        saves_count: true,
        shares_count: true,
      },
    });

    return NextResponse.json({ success: true, vehicles });
  } catch (error) {
    console.error("GET /api/vehicles/featured failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


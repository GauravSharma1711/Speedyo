import { NextResponse } from "next/server";
import prisma from "@/db/prisma";

const listSelect = {
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
  shares: true,
  _count: {
    select: { vehicleLikes: true, vehicleSaves: true },
  },
};

export async function GET() {
  try {
    const rows = await prisma.vehicle.findMany({
      where: { featured: true, status: "available" },
      orderBy: { createdAt: "desc" },
      take: 24,
      select: listSelect,
    });

    const vehicles = rows.map(({ _count, ...rest }) => ({
      ...rest,
      likes_count: _count.vehicleLikes,
      saves_count: _count.vehicleSaves,
      shares_count: rest.shares,
    }));

    return NextResponse.json({ success: true, vehicles });
  } catch (error) {
    console.error("GET /api/vehicles/featured failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

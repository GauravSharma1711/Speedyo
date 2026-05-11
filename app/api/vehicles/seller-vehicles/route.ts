import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        make: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        condition: true,
        status: true,
        verified: true,
        featured: true,
        views: true,
        primary_image: true,
        primary_image_thumbnail: true,
        location: true,
        fuel_type: true,
        transmission: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            vehicleLikes: true,
            vehicleSaves: true,
            testDriveRequests: true,
          },
        },
      },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error("Failed to get current user created vehicles", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
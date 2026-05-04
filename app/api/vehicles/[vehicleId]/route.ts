import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

export async function GET(_req: NextRequest, { params }: { params: { vehicleId: string } }) {
  try {
    const { vehicleId } = params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
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
        website_managed: true,
        views: true,
        primary_image: true,
        primary_image_thumbnail: true,
        primary_image_small: true,
        primary_image_medium: true,
        images: true,
        images_thumbnails: true,
        images_small: true,
        images_medium: true,
        likes_count: true,
        saves_count: true,
        shares_count: true,
        recurring_availability: true,
        booked_slots: true,
        dealership_name: true,
        dealershipAgreementId: true,
        original_owner_id: true,
        authorId: true,
        author: {
          select: {
            id: true,
            full_name: true,
            profile_image: true,
            bio: true,
            location: true,
            user_type: true,
            isVerified: true,
          },
        },
      },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("GET /api/vehicles/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


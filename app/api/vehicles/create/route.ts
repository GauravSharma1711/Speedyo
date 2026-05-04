import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const {
      title,
      make,
      model,
      year,
      price,
      mileage,
      condition,
      description,
      location,
      fuel_type,
      transmission,
      images,
      primary_image,
      featured,
    } = body as Record<string, unknown>;

    if (!title || !make || !model || year === undefined || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: title, make, model, year, price" },
        { status: 400 }
      );
    }

    const created = await prisma.vehicle.create({
      data: {
        title: String(title),
        make: String(make),
        model: String(model),
        year: Number(year),
        price: String(price),
        mileage: mileage === undefined || mileage === null ? null : Number(mileage),
        condition: condition ? (String(condition) as any) : null,
        description: description ? String(description) : null,
        location: location ? String(location) : null,
        fuel_type: fuel_type ? (String(fuel_type) as any) : null,
        transmission: transmission ? (String(transmission) as any) : null,
        images: Array.isArray(images) ? (images as string[]) : [],
        images_thumbnails: [],
        images_small: [],
        images_medium: [],
        primary_image: primary_image ? String(primary_image) : null,
        featured: Boolean(featured ?? false),
        authorId: session.user.id,
        original_owner_id: session.user.id,
      },
    });

    return NextResponse.json({ success: true, vehicle: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vehicles/create failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


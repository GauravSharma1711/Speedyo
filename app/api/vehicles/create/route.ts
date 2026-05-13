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

    const dedupeWindowMs = 5 * 60 * 1000;
    const dedupeSince = new Date(Date.now() - dedupeWindowMs);
    const normalizedTitle = String(title).trim();
    const normalizedMake = String(make).trim();
    const normalizedModel = String(model).trim();
    const normalizedYear = Number(year);
    const normalizedPrice = String(price);

    const result = await prisma.$transaction(
      async (tx) => {
      const dedupeKey = `vehicle:create:${session.user.id}:${normalizedTitle}:${normalizedMake}:${normalizedModel}:${normalizedYear}:${normalizedPrice}`;
      const lockRows = await tx.$queryRaw<Array<{ locked: boolean }>>`
        SELECT pg_try_advisory_xact_lock(hashtext(${dedupeKey})) AS locked
      `;
      const locked = lockRows?.[0]?.locked ?? false;

      const existing = await tx.vehicle.findFirst({
        where: {
          authorId: session.user.id,
          title: normalizedTitle,
          make: normalizedMake,
          model: normalizedModel,
          year: normalizedYear,
          price: normalizedPrice,
          createdAt: { gte: dedupeSince },
        },
        orderBy: { createdAt: "desc" },
      });

      if (existing) return { vehicle: existing, deduped: true as const };
      if (!locked) {
        return { vehicle: null, deduped: false as const, retry: true as const };
      }

      const created = await tx.vehicle.create({
        data: {
          title: normalizedTitle,
          make: normalizedMake,
          model: normalizedModel,
          year: normalizedYear,
          price: normalizedPrice,
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

      return { vehicle: created, deduped: false as const };
      },
      { maxWait: 10_000, timeout: 20_000 },
    );

    if ("retry" in result && result.retry) {
      return NextResponse.json(
        { error: "Please retry (duplicate create in progress)" },
        { status: 409 },
      );
    }

    if (result.deduped) {
      return NextResponse.json({ success: true, vehicle: result.vehicle, deduped: true }, { status: 200 });
    }

    // Increment used slots for private sellers
await prisma.privateSellerSlots.updateMany({
  where: { userId: session.user.id },
  data: { used: { increment: 1 } },
});


    return NextResponse.json({ success: true, vehicle: result.vehicle }, { status: 201 });
  } catch (error) {
    console.error("POST /api/vehicles/create failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


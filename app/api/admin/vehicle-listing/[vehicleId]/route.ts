


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ vehicleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await context.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    await prisma.vehicle.delete({
      where: { id: vehicleId },
    });

    return NextResponse.json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    console.error("Failed to delete vehicle", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ vehicleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await context.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const formData = await request.formData();

    // ── Scalar fields (only include if sent) ──
    const make         = formData.get("make") as string | null;
    const model        = formData.get("model") as string | null;
    const year         = formData.get("year") as string | null;
    const price        = formData.get("price") as string | null;
    const mileage      = formData.get("mileage") as string | null;
    const condition    = formData.get("condition") as string | null;
    const fuel_type    = formData.get("fuel_type") as string | null;
    const transmission = formData.get("transmission") as string | null;
    const status       = formData.get("status") as string | null;
    const location     = formData.get("location") as string | null;
    const description  = formData.get("description") as string | null;

    // ── Image fields ──
    const primaryImageFile = formData.get("primary_image") as File | null;
    const imageFiles       = formData.getAll("images") as File[];

    // ── Upload primary image if provided ──
    let primary_image: string | undefined;
    if (primaryImageFile && primaryImageFile.size > 0) {
      const result = await uploadFile(primaryImageFile, "vehicles");
      primary_image = result.url;
    }

    // ── Upload additional images if provided ──
    let images: string[] | undefined;
    if (imageFiles.length > 0) {
      const results = await Promise.all(
        imageFiles.map((file) => uploadFile(file, "vehicles"))
      );
      images = results.map((r) => r.url);
    }

    // ── Build update payload — only fields that were sent ──
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        ...(make         && { make }),
        ...(model        && { model }),
        ...(year         && { year: parseInt(year) }),
        ...(price        && { price }),
        ...(mileage      && { mileage: parseInt(mileage) }),
        ...(condition    && { condition: condition as any }),
        ...(fuel_type    && { fuel_type: fuel_type as any }),
        ...(transmission && { transmission: transmission as any }),
        ...(status       && { status: status as any }),
        ...(location     && { location }),
        ...(description  && { description }),
        ...(primary_image && { primary_image }),
        ...(images       && { images }),
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    console.error("Failed to update vehicle", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

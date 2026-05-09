import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";
import { FuelType, Transmission, VehicleCondition } from "@/lib/generated/prisma/enums";



export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  
    const slots = await prisma.privateSellerSlots.findUnique({
      where: { userId: session.user.id },
    });

    if (!slots || slots.purchased <= slots.used) {
      return NextResponse.json(
        { error: "No available vehicle slots" },
        { status: 403 }
      );
    }

    const formData = await request.formData();

   
    const make = formData.get("make") as string;
    const model = formData.get("model") as string;
    const year = parseInt(formData.get("year") as string);
    const price = parseFloat(formData.get("price") as string);
    const mileage = formData.get("mileage") ? parseInt(formData.get("mileage") as string) : null;
    const condition = formData.get("condition") as VehicleCondition | null;
    const fuel_type = formData.get("fuel_type") as FuelType| null;
    const transmission = formData.get("transmission") as Transmission | null;
    const description = formData.get("description") as string | null;
    const location = formData.get("location") as string | null;
    const title = formData.get("title") as string | null ?? `${year} ${make} ${model}`;

    if (!make || !model || !year || !price) {
      return NextResponse.json(
        { error: "Missing required fields: make, model, year, price" },
        { status: 400 }
      );
    }


    const imageFiles = formData.getAll("images") as File[];

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of imageFiles) {
      const result = await uploadFile(file, "vehicles");
      uploadedUrls.push(result.url);
    }

    // First image is the primary image
    const primaryImage = uploadedUrls[0];
    const remainingImages = uploadedUrls.slice(1);

    // Create the vehicle listing
    const vehicle = await prisma.vehicle.create({
      data: {
        title,
        make,
        model,
        year,
        price,
        mileage,
        condition,
        fuel_type,
        transmission,
        description,
        location,
        original_owner_id: session.user.id,
        primary_image: primaryImage,
        primary_image_thumbnail: primaryImage,
        primary_image_small: primaryImage,
        primary_image_medium: primaryImage,
        images: remainingImages,
        images_thumbnails: remainingImages,
        images_small: remainingImages,
        images_medium: remainingImages,
        authorId: session.user.id,
        status: "available",
      },
    });

    // Increment used slots
    await prisma.privateSellerSlots.update({
      where: { userId: session.user.id },
      data: { used: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle listing", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";
import { FuelType, Transmission, VehicleCondition } from "@/lib/generated/prisma/enums";


// get listing by id
export async function GET(
    params:{listingId:string}
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== 'private_seller') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listingId =  params.listingId;

    const listing = await prisma.vehicle.findUnique({
        where:{id:listingId,original_owner_id:session.user.id},

    })

          return NextResponse.json({
      success: true,
      data: listing,
    });
  
  } catch (error) {
    console.error("Failed to get listing by id ", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// edit listing
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ listingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await context.params;

    const listing = await prisma.vehicle.findUnique({
      where: { id: listingId, authorId: session.user.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const formData = await request.formData();

   
    const make = formData.get("make") as string | null;
    const model = formData.get("model") as string | null;
    const yearRaw = formData.get("year") as string | null;
    const priceRaw = formData.get("price") as string | null;
    const mileageRaw = formData.get("mileage") as string | null;
    const condition = formData.get("condition") as VehicleCondition | null;
    const fuel_type = formData.get("fuel_type") as FuelType | null;
    const transmission = formData.get("transmission") as Transmission | null;
    const description = formData.get("description") as string | null;
    const location = formData.get("location") as string | null;
    const title = formData.get("title") as string | null;

    const year = yearRaw ? parseInt(yearRaw) : null;
    const price = priceRaw ? parseFloat(priceRaw) : null;
    const mileage = mileageRaw ? parseInt(mileageRaw) : null;

   
    const imageFiles = formData.getAll("images") as File[];
    let imageUpdateData: Record<string, unknown> = {};

    if (imageFiles && imageFiles.length > 0) {
      const uploadedUrls: string[] = [];

      for (const file of imageFiles) {
        const result = await uploadFile(file, "vehicles");
        uploadedUrls.push(result.url);
      }

      const primaryImage = uploadedUrls[0];
  const remainingImages = uploadedUrls.slice(1);
      imageUpdateData = {
        primary_image: primaryImage,
        primary_image_thumbnail: primaryImage,
        primary_image_small: primaryImage,
        primary_image_medium: primaryImage,
       images: remainingImages,           
  images_thumbnails: remainingImages,
  images_small: remainingImages,
  images_medium: remainingImages,
      };
    }

    // Build update object — only include fields that were actually sent
    const updateData: Record<string, unknown> = {};

    if (make) updateData.make = make;
    if (model) updateData.model = model;
    if (year) updateData.year = year;
    if (price) updateData.price = price;
    if (mileage !== null) updateData.mileage = mileage;
    if (condition) updateData.condition = condition;
    if (fuel_type) updateData.fuel_type = fuel_type;
    if (transmission) updateData.transmission = transmission;
    if (description !== null) updateData.description = description;
    if (location !== null) updateData.location = location;

    // Auto-regenerate title if make/model/year changed but no explicit title sent
    if (!title && (make || model || year)) {
      updateData.title = `${year ?? listing.year} ${make ?? listing.make} ${model ?? listing.model}`;
    } else if (title) {
      updateData.title = title;
    }

    if (Object.keys(updateData).length === 0 && Object.keys(imageUpdateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.vehicle.update({
      where: { id: listingId },
      data: {
        ...updateData,
        ...imageUpdateData,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Failed to update listing", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// delete listing 

export async function DELETE(
  context: { params: Promise<{ listingId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.user_type !== "private_seller") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { listingId } = await context.params;

    const listing = await prisma.vehicle.findUnique({
      where: { id: listingId, authorId: session.user.id },
    });

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }


    const activeTestDrive = await prisma.testDriveRequest.findFirst({
      where: {
        vehicleId: listingId,
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (activeTestDrive) {
      return NextResponse.json(
        { error: "Cannot delete listing with active test drive requests. Cancel them first." },
        { status: 409 }
      );
    }


    await prisma.vehicle.delete({
      where: { id: listingId },
    });

  
    await prisma.privateSellerSlots.update({
      where: { userId: session.user.id },
      data: { used: { decrement: 1 } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete listing", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

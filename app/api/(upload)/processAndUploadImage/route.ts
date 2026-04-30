// app/api/images/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const thumbnail = formData.get("thumbnail") as File | null;
    const small = formData.get("small") as File | null;
    const medium = formData.get("medium") as File | null;
    const large = formData.get("large") as File | null;

    if (!thumbnail || !small || !medium || !large) {
      return NextResponse.json(
        {
          error: "Missing required image sizes",
          received: {
            thumbnail: !!thumbnail,
            small: !!small,
            medium: !!medium,
            large: !!large,
          },
        },
        { status: 400 }
      );
    }

    console.log(`Uploading pre-processed images...`);
    console.log(`  Thumbnail: ${(thumbnail.size / 1024).toFixed(2)} KB`);
    console.log(`  Small:     ${(small.size / 1024).toFixed(2)} KB`);
    console.log(`  Medium:    ${(medium.size / 1024).toFixed(2)} KB`);
    console.log(`  Large:     ${(large.size / 1024).toFixed(2)} KB`);

    // Upload all sizes in parallel — same as base44 version
    const [thumbnailResult, smallResult, mediumResult, largeResult] =
      await Promise.all([
        uploadFile(thumbnail, "uploads/images"),
        uploadFile(small, "uploads/images"),
        uploadFile(medium, "uploads/images"),
        uploadFile(large, "uploads/images"),
      ]);

    const processedImages = {
      thumbnail: thumbnailResult.url,
      small: smallResult.url,
      medium: mediumResult.url,
      large: largeResult.url,
    };

    console.log(`All images uploaded successfully`);

    return NextResponse.json({
      success: true,
      images: processedImages,
      stats: {
        thumbnail: `${(thumbnail.size / 1024).toFixed(2)} KB`,
        small: `${(small.size / 1024).toFixed(2)} KB`,
        medium: `${(medium.size / 1024).toFixed(2)} KB`,
        large: `${(large.size / 1024).toFixed(2)} KB`,
      },
    });

  } catch (error: any) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: "Image upload failed", details: error.message },
      { status: 500 }
    );
  }
}
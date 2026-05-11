import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";
import sharp from "sharp";

const SIZES = {
  thumbnail: { width: 100, height: 100, fit: "cover" as const },
  small:     { width: 300, height: 300, fit: "cover" as const },
  medium:    { width: 800, height: 800, fit: "inside" as const },
  large:     { width: 1600, height: 1600, fit: "inside" as const },
};

async function processImage(input: Buffer, size: keyof typeof SIZES): Promise<Buffer> {
  const { width, height, fit } = SIZES[size];
  const pipeline = sharp(input).resize(width, height, { fit, withoutEnlargement: true });
  if (size === "thumbnail" || size === "small") {
    return pipeline.webp({ quality: 70 }).toBuffer();
  }
  return pipeline.webp({ quality: 85 }).toBuffer();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const [thumbnail, small, medium, large] = await Promise.all([
      processImage(buffer, "thumbnail"),
      processImage(buffer, "small"),
      processImage(buffer, "medium"),
      processImage(buffer, "large"),
    ]);

    const [thumbnailResult, smallResult, mediumResult, largeResult] =
      await Promise.all([
        uploadFile(thumbnail, "uploads/images"),
        uploadFile(small, "uploads/images"),
        uploadFile(medium, "uploads/images"),
        uploadFile(large, "uploads/images"),
      ]);

    const original = buffer.length;
    const totalProcessed = thumbnail.length + small.length + medium.length + large.length;

    return NextResponse.json({
      success: true,
      url: largeResult.url,
      urls: {
        thumbnail: thumbnailResult.url,
        small: smallResult.url,
        medium: mediumResult.url,
        large: largeResult.url,
      },
      stats: {
        original_kb: (original / 1024).toFixed(1),
        processed_kb: (totalProcessed / 1024).toFixed(1),
        saved: `${(((original - totalProcessed) / original) * 100).toFixed(0)}%`,
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

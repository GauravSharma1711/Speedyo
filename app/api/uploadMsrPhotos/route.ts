// app/api/uploadMsrPhotos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";



export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Don't block upload on session — the MSR POST route already validates session
    // But still log for debugging
    if (!session?.user?.id) {
      console.warn("[uploadMsrPhotos] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate file types
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.type}` },
          { status: 400 }
        );
      }
      // 30MB limit per file
      if (file.size > 30 * 1024 * 1024) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        );
      }
    }

    const results = await Promise.all(
      files.map((file) => uploadFile(file, "uploads/vehicles"))
    );

    const urls = results.map((r) => r.url);
    console.log("[uploadMsrPhotos] Uploaded:", urls);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("[POST /api/uploadMsrPhotos]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
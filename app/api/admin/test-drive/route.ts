import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const testDriveRequests = await prisma.testDriveRequest.findMany({
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            price: true,
            location: true,
            primary_image_thumbnail: true,
          },
        },
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            profile_image: true,
          },
        },
           report: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, testDriveRequests });
  } catch (error) {
    console.error("Failed to get test drive requests", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
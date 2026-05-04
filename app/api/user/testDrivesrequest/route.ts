import { NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requests = await prisma.testDriveRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: {
          select: {
            id: true,
            title: true,
            make: true,
            model: true,
            year: true,
            price: true,
            primary_image: true,
            location: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("GET /api/user/testDrivesrequest failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


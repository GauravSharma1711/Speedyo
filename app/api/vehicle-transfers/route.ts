import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");

    console.log("buyer id 4584985569564-6", buyerId);
      console.log("seller id 4584985569564-6", sellerId);
      
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (buyerId) where.buyerId = buyerId;
    if (sellerId) where.sellerId = sellerId;

    const transfers = await prisma.vehicleTransfer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        vehicle: { select: { id: true, title: true, make: true, model: true, year: true, primary_image: true, price: true } },
        buyer: { select: { id: true, full_name: true, email: true } },
        seller: { select: { id: true, full_name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, transfers });
  } catch (error) {
    console.error("[GET /api/vehicle-transfers]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

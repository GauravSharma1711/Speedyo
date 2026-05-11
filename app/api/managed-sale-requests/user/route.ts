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
    const userId = searchParams.get("userId") ?? session.user.id;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "24"));
    const skip = (page - 1) * limit;

    const requests = await prisma.managedSaleRequest.findMany({
      where: { submitted_by_user_id: userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      requests: requests.map(r => ({
        ...r,
        created_date: r.createdAt,
        updated_date: r.updatedAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/managed-sale-requests/user]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

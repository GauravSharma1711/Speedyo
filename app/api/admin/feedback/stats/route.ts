import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") ?? "").trim();

    const where: any = {};
    if (category) where.category = category;

    const [totalAll, totalNew, avgAgg] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.count({ where: { ...where, status: "new" as never } }),
      prisma.feedback.aggregate({
        where,
        _avg: { satisfaction_rating: true },
      }),
    ]);

    const avgRatingAll = avgAgg._avg.satisfaction_rating ?? 0;

    return NextResponse.json(
      {
        success: true,
        totalAll,
        totalNew,
        avgRatingAll: Number(avgRatingAll.toFixed(1)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/feedback/stats failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { limit } = getPagination(req, { defaultLimit: 100, maxLimit: 100 });

    const items = await prisma.managedSaleRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        status: true,
        contact_full_name: true,
        contact_email: true,
        contact_phone: true,
        vehicle_make: true,
        vehicle_model: true,
        vehicle_year: true,
        created_vehicle_id: true,
      },
    });

    return NextResponse.json({ success: true, items }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/managed-sale-requests failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


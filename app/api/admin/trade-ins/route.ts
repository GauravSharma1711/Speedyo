import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

const VALID_STATUSES = ["pending", "contacted", "quoted", "completed", "cancelled"] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { page, limit, skip, searchParams } = getPagination(req, { defaultLimit: 50, maxLimit: 100 });
    const status = (searchParams.get("status") ?? "").trim();
    const search = (searchParams.get("search") ?? "").trim();

    if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const where: any = {
      ...(status && { status: status as never }),
      ...(search && {
        OR: [
          { full_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { vehicle_make: { contains: search, mode: "insensitive" } },
          { vehicle_model: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.oISTTradeInRequest.count({ where }),
      prisma.oISTTradeInRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({ success: true, page, limit, total, items }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/trade-ins failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


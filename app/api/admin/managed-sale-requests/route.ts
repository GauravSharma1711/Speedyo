import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

const VALID_STATUSES = [
  "pending_initial_review",
  "pending_review",
  "pending_approval",
  "approved",
  "declined",
  "listed",
  "sold",
  "cancelled",
  "cancellation_requested",
  "edit_requested",
] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { page, limit, skip, searchParams } = getPagination(req, {
      defaultLimit: 50,
      maxLimit: 100,
    });

    const status = (searchParams.get("status") ?? "").trim();
    const search = (searchParams.get("search") ?? "").trim();
    const userId = searchParams.get("userId") ?? "";

    if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const where: any = {};
    if (status) where.status = status;
    if (userId) where.submittedByUserId = userId;

    if (search) {
      where.OR = [
        { vehicle_title: { contains: search, mode: "insensitive" } },
        { vehicle_make: { contains: search, mode: "insensitive" } },
        { vehicle_model: { contains: search, mode: "insensitive" } },
        { contact_full_name: { contains: search, mode: "insensitive" } },
        { contact_email: { contains: search, mode: "insensitive" } },
        {
          submittedByUser: {
            OR: [
              { full_name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.managedSaleRequest.count({ where }),
      prisma.managedSaleRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          submittedByUser: {
            select: {
              id: true,
              email: true,
              full_name: true,
              profile_image: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, page, limit, total, requests }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/managed-sale-requests failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

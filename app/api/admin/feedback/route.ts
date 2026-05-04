import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

const VALID_STATUSES = ["new", "reviewed", "in_progress", "resolved"] as const;
const VALID_CATEGORIES = [
  "general",
  "marketplace",
  "feed",
  "messaging",
  "managed_sales",
  "dashboard",
  "other",
] as const;

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { page, limit, skip, searchParams } = getPagination(req, { defaultLimit: 50, maxLimit: 100 });
    const status = (searchParams.get("status") ?? "").trim();
    const category = (searchParams.get("category") ?? "").trim();
    const search = (searchParams.get("search") ?? "").trim();

    if (status && !VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }
    if (
      category &&
      !VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])
    ) {
      return NextResponse.json(
        { error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    const where: any = {
      ...(status && { status: status as never }),
      ...(category && { category: category as never }),
      ...(search && {
        OR: [
          { user_name: { contains: search, mode: "insensitive" } },
          { user_email: { contains: search, mode: "insensitive" } },
          { feedback_text: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json(
      { success: true, page, limit, total, items },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/feedback failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


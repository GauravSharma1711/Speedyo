import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { page, limit, skip, searchParams } = getPagination(req, { defaultLimit: 50, maxLimit: 100 });
    const status = (searchParams.get("status") ?? "").trim(); // pending|approved|declined

    if (status) {
      const VALID = new Set(["pending", "approved", "declined"]);
      if (!VALID.has(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${Array.from(VALID).join(", ")}` },
          { status: 400 }
        );
      }
    }

    const where: any = status ? { status: status as never } : {};

    const [total, requests] = await Promise.all([
      prisma.vehicleEditRequest.count({ where }),
      prisma.vehicleEditRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          requestedByUser: {
            select: {
              id: true,
              email: true,
              full_name: true,
              profile_image: true,
              user_type: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              title: true,
              make: true,
              model: true,
              year: true,
              price: true,
              mileage: true,
              condition: true,
              location: true,
              status: true,
              primary_image: true,
              featured: true,
              verified: true,
              website_managed: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json(
      { success: true, page, limit, total, requests },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/vehicles/edit-requests failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


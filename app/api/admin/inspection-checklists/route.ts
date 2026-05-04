import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";
import { getPagination } from "@/app/api/_utils/pagination";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { page, limit, skip, searchParams } = getPagination(req, {
      defaultLimit: 100,
      maxLimit: 100,
    });
    const search = (searchParams.get("search") ?? "").trim();
    const managedSaleRequestId = (searchParams.get("managedSaleRequestId") ?? "").trim();

    const where: any = {};
    if (managedSaleRequestId) where.managedSaleRequestId = managedSaleRequestId;

    if (search) {
      where.OR = [
        { dealership_name: { contains: search, mode: "insensitive" } },
        { vehicle_info: { path: ["make"], string_contains: search } as any },
        { vehicle_info: { path: ["model"], string_contains: search } as any },
        { vehicle_info: { path: ["vin"], string_contains: search } as any },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.vehicleInspectionChecklist.count({ where }),
      prisma.vehicleInspectionChecklist.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          managedSaleRequest: {
            select: {
              id: true,
              status: true,
              contact_full_name: true,
              contact_email: true,
              vehicle_make: true,
              vehicle_model: true,
              vehicle_year: true,
              createdAt: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({ success: true, page, limit, total, items }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/inspection-checklists failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = (await req.json().catch(() => null)) as any;
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const dateValue = body.date_of_inspection;
    const date =
      dateValue instanceof Date
        ? dateValue
        : typeof dateValue === "string"
          ? new Date(dateValue)
          : null;
    if (!date || Number.isNaN(date.getTime())) {
      return NextResponse.json(
        { error: "date_of_inspection must be a valid date" },
        { status: 400 }
      );
    }

    const inspector_name = typeof body.inspector_name === "string" ? body.inspector_name.trim() : "";
    if (!inspector_name) {
      return NextResponse.json({ error: "inspector_name is required" }, { status: 400 });
    }

    const managedSaleRequestId =
      typeof body.managedSaleRequestId === "string" && body.managedSaleRequestId.trim()
        ? body.managedSaleRequestId.trim()
        : null;

    if (managedSaleRequestId) {
      const msr = await prisma.managedSaleRequest.findUnique({
        where: { id: managedSaleRequestId },
        select: { id: true },
      });
      if (!msr) {
        return NextResponse.json({ error: "ManagedSaleRequest not found" }, { status: 404 });
      }
    }

    const checklist = await prisma.vehicleInspectionChecklist.create({
      data: {
        date_of_inspection: date,
        inspector_name,
        dealership_name: typeof body.dealership_name === "string" ? body.dealership_name : null,
        warranty: typeof body.warranty === "string" ? body.warranty : null,
        repair_service_details:
          typeof body.repair_service_details === "string" ? body.repair_service_details : null,
        verified_by_speedio:
          typeof body.verified_by_speedio === "string" ? body.verified_by_speedio : null,
        dealership_representative:
          typeof body.dealership_representative === "string" ? body.dealership_representative : null,
        inspection_notes: typeof body.inspection_notes === "string" ? body.inspection_notes : null,
        overall_condition: typeof body.overall_condition === "string" ? body.overall_condition : null,
        recommended_sale_price: body.recommended_sale_price ?? null,
        vehicle_info: body.vehicle_info ?? {},
        exterior_condition: body.exterior_condition ?? [],
        interior_condition: body.interior_condition ?? [],
        engine_mechanical: body.engine_mechanical ?? [],
        documentation: body.documentation ?? [],
        photos_media: body.photos_media ?? [],
        managedSaleRequestId,
      },
      include: {
        managedSaleRequest: {
          select: { id: true, status: true, vehicle_make: true, vehicle_model: true, vehicle_year: true },
        },
      },
    });

    return NextResponse.json({ success: true, checklist }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/inspection-checklists failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


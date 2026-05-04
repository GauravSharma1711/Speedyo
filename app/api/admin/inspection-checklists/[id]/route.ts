import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

function parseDate(value: unknown) {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

async function updateChecklist(req: NextRequest, id: string) {
  const body = (await req.json().catch(() => null)) as any;
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const data: any = {};

  if ("date_of_inspection" in body) {
    const d = parseDate(body.date_of_inspection);
    if (!d) {
      return NextResponse.json(
        { error: "date_of_inspection must be a valid date" },
        { status: 400 }
      );
    }
    data.date_of_inspection = d;
  }

  if ("inspector_name" in body) {
    const v = typeof body.inspector_name === "string" ? body.inspector_name.trim() : "";
    if (!v) return NextResponse.json({ error: "inspector_name is required" }, { status: 400 });
    data.inspector_name = v;
  }

  const optionalStringFields = [
    "dealership_name",
    "warranty",
    "repair_service_details",
    "verified_by_speedio",
    "dealership_representative",
    "inspection_notes",
    "overall_condition",
  ] as const;
  for (const key of optionalStringFields) {
    if (key in body) {
      const v = body[key];
      data[key] = typeof v === "string" ? v : v == null ? null : String(v);
    }
  }

  if ("recommended_sale_price" in body) data.recommended_sale_price = body.recommended_sale_price ?? null;

  const jsonFields = [
    "vehicle_info",
    "exterior_condition",
    "interior_condition",
    "engine_mechanical",
    "documentation",
    "photos_media",
  ] as const;
  for (const key of jsonFields) {
    if (key in body) data[key] = body[key] ?? (key === "vehicle_info" ? {} : []);
  }

  if ("managedSaleRequestId" in body) {
    const v = body.managedSaleRequestId;
    const managedSaleRequestId =
      typeof v === "string" && v.trim() ? v.trim() : v == null ? null : String(v);

    if (managedSaleRequestId) {
      const msr = await prisma.managedSaleRequest.findUnique({
        where: { id: managedSaleRequestId },
        select: { id: true },
      });
      if (!msr) {
        return NextResponse.json({ error: "ManagedSaleRequest not found" }, { status: 404 });
      }
    }

    data.managedSaleRequestId = managedSaleRequestId;
  }

  const checklist = await prisma.vehicleInspectionChecklist.update({
    where: { id },
    data,
    include: {
      managedSaleRequest: {
        select: { id: true, status: true, vehicle_make: true, vehicle_model: true, vehicle_year: true },
      },
    },
  });

  return NextResponse.json({ success: true, checklist }, { status: 200 });
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const existing = await prisma.vehicleInspectionChecklist.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Checklist not found" }, { status: 404 });

    return await updateChecklist(req, id);
  } catch (error) {
    console.error("PUT /api/admin/inspection-checklists/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  return PUT(req, context);
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await context.params;
    const existing = await prisma.vehicleInspectionChecklist.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: "Checklist not found" }, { status: 404 });

    await prisma.vehicleInspectionChecklist.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/admin/inspection-checklists/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


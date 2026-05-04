import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await context.params;

    const body = (await req.json().catch(() => null)) as null | { managedSaleRequestId?: string | null };
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const managedSaleRequestId =
      typeof body.managedSaleRequestId === "string"
        ? body.managedSaleRequestId.trim() || null
        : body.managedSaleRequestId ?? null;

    if (managedSaleRequestId) {
      const msr = await prisma.managedSaleRequest.findUnique({
        where: { id: managedSaleRequestId },
        select: { id: true },
      });
      if (!msr) return NextResponse.json({ error: "ManagedSaleRequest not found" }, { status: 404 });
    }

    const existing = await prisma.vehicleInspectionChecklist.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Checklist not found" }, { status: 404 });

    const checklist = await prisma.vehicleInspectionChecklist.update({
      where: { id },
      data: { managedSaleRequestId },
      include: {
        managedSaleRequest: {
          select: { id: true, status: true, vehicle_make: true, vehicle_model: true, vehicle_year: true },
        },
      },
    });

    return NextResponse.json({ success: true, checklist }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/inspection-checklists/[id]/link-msr failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


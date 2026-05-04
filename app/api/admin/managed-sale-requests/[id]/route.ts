import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import prisma from "@/db/prisma";
import { workflowAdminPatchMsr, workflowDeleteMsr } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;

    const request = await prisma.managedSaleRequest.findUnique({
      where: { id },
      include: {
        submittedByUser: {
          select: {
            id: true,
            email: true,
            full_name: true,
            profile_image: true,
            phone: true,
            user_type: true,
          },
        },
        createdVehicle: {
          select: {
            id: true,
            title: true,
            status: true,
            price: true,
            recurring_availability: true,
            booked_slots: true,
            primary_image: true,
          },
        },
        inspectionChecklists: {
          select: {
            id: true,
            createdAt: true,
            date_of_inspection: true,
            inspector_name: true,
            dealership_name: true,
            managedSaleRequestId: true,
            vehicle_info: true,
            overall_condition: true,
            recommended_sale_price: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Managed sale request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/managed-sale-requests/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const updated = await workflowAdminPatchMsr(id, admin.userId, body);
    return NextResponse.json({ success: true, request: updated }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const deleteVehicle =
      new URL(req.url).searchParams.get("deleteVehicle") === "true";

    const result = await workflowDeleteMsr(id, admin.userId, { deleteVehicle });
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}

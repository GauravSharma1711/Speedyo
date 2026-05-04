import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import { workflowPatchStatus } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const body = (await req.json().catch(() => null)) as null | {
      status?: string;
      userFacingNotes?: string | null;
      adminNotes?: string | null;
      recurringAvailability?: unknown;
      recurring_availability?: unknown;
    };

    if (!body?.status?.trim()) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const recurringAvailability =
      body.recurringAvailability !== undefined ? body.recurringAvailability : body.recurring_availability;

    const request = await workflowPatchStatus(id, admin.userId, {
      status: body.status,
      userFacingNotes: body.userFacingNotes,
      adminNotes: body.adminNotes,
      recurringAvailability,
    });

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}

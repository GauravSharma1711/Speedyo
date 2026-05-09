import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { TransferStatus } from "@/lib/generated/prisma/enums";

const transferInclude = {
  vehicle: { select: { id: true, title: true } },
  buyer: { select: { id: true, full_name: true, email: true } },
  seller: { select: { id: true, full_name: true, email: true } },
  createdBy: { select: { id: true, full_name: true, email: true } },
};

const TOTAL_STEPS = 6;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ transferId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { transferId } = await context.params;
    const existing = await prisma.vehicleTransfer.findUnique({ where: { id: transferId } });
    if (!existing) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }


    const body = await request.json();

    console.log("body",body)
    const { steps_completed, status, user_facing_notes, admin_notes } = body;

  
    if (steps_completed !== undefined) {
      const isValid =
        Array.isArray(steps_completed) &&
        steps_completed.every((s) => Number.isInteger(s) && s >= 1 && s <= TOTAL_STEPS);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid steps_completed values" }, { status: 400 });
      }
    }


    if (existing.status === "completed" && status && status !== "completed") {
      return NextResponse.json({ error: "Cannot revert a completed transfer" }, { status: 400 });
    }

    // Next unchecked step
    const currentStep = (() => {
      if (!steps_completed || steps_completed.length === 0) return 1;
      for (let i = 1; i <= TOTAL_STEPS; i++) {
        if (!steps_completed.includes(i)) return i;
      }
      return TOTAL_STEPS;
    })();

    // Auto-complete if all steps checked
    const allStepsDone = steps_completed?.length === TOTAL_STEPS;
    const resolvedStatus = allStepsDone ? "completed" : (status ?? existing.status);
    const isNowCompleted = resolvedStatus === "completed";

    const transfer = await prisma.vehicleTransfer.update({
      where: { id: transferId },
      data: {
        ...(steps_completed !== undefined && { steps_completed, current_step: currentStep }),
        status: resolvedStatus as TransferStatus,
        ...(user_facing_notes !== undefined && { user_facing_notes }),
        ...(admin_notes !== undefined && { admin_notes }),
        ...(isNowCompleted && !existing.completed_date && { completed_date: new Date() }),
      },
      include: transferInclude,
    });

    return NextResponse.json({ success: true, transfer });
  } catch (error) {
    console.error("Failed to update transfer", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
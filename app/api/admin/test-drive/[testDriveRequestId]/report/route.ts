
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const reportInclude = {
  testDriveRequest: {
    select: {
      id: true,
      requester_name: true,
      requester_email: true,
      requested_date: true,
      requested_time: true,
      status: true,
      vehicle: {
        select: { id: true, title: true, make: true, model: true, year: true },
      },
    },
  },
};

// POST — Create report
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ testDriveRequestId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testDriveRequestId } = await context.params;

    const existing = await prisma.testDriveRequest.findUnique({
      where: { id: testDriveRequestId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test drive request not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      buyer_interest_level,
      buyer_feedback,
      speedio_assessment,
      recommended_next_steps,
      admin_notes,
    } = body;

    if (!buyer_interest_level || !speedio_assessment) {
      return NextResponse.json(
        { error: "buyer_interest_level and speedio_assessment are required" },
        { status: 400 }
      );
    }

    const report = await prisma.testDriveReport.create({
      data: {
        testDriveRequestId,
        buyer_interest_level,
        buyer_feedback: buyer_feedback ?? null,
        speedio_assessment,
        recommended_next_steps: recommended_next_steps ?? null,
        admin_notes: admin_notes ?? null,
      },
      include: reportInclude,
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    console.error("Failed to create test drive report", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — Edit report
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ testDriveRequestId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testDriveRequestId } = await context.params;

    const existing = await prisma.testDriveReport.findUnique({
      where: { testDriveRequestId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      buyer_interest_level,
      buyer_feedback,
      speedio_assessment,
      recommended_next_steps,
      admin_notes,
    } = body;

    const report = await prisma.testDriveReport.update({
      where: { testDriveRequestId },
      data: {
        ...(buyer_interest_level !== undefined && { buyer_interest_level }),
        ...(buyer_feedback !== undefined && { buyer_feedback }),
        ...(speedio_assessment !== undefined && { speedio_assessment }),
        ...(recommended_next_steps !== undefined && { recommended_next_steps }),
        ...(admin_notes !== undefined && { admin_notes }),
      },
      include: reportInclude,
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Failed to update test drive report", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
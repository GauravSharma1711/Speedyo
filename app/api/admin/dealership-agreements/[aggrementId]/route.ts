import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendAgreementSignedMail } from "@/helpers/sendAgreementSignedMail";
import { sendAgreementMail } from "@/helpers/sendAgreementMail";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const { aggrementId } = await context.params;

    const agreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: aggrementId },
      include: {
        createdByAdmin: { select: { id: true, full_name: true, email: true } },
      },
    });

    if (!agreement) {
      return NextResponse.json({ success: false, error: "Agreement not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, agreement });
  } catch (error) {
    console.error("Failed to get agreement", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aggrementId } = await context.params;

    const existing = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    await prisma.dealershipVehicleAgreement.delete({
      where: { id: aggrementId },
    });

    return NextResponse.json({ success: true, message: "Agreement deleted successfully" });
  } catch (error) {
    console.error("Failed to delete dealership agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// update after signing the aggrement
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const { aggrementId } = await context.params;
    const { status, signed_at, signed_by_name } = await request.json();

    if (!aggrementId || !signed_by_name || status !== "signed") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const existingAgreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!existingAgreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (existingAgreement.status === "signed") {
      return NextResponse.json({ error: "Agreement already signed" }, { status: 400 });
    }

    if (existingAgreement.status === "cancelled") {
      return NextResponse.json({ error: "Agreement has been cancelled" }, { status: 400 });
    }

    const updatedAgreement = await prisma.dealershipVehicleAgreement.update({
      where: { id: aggrementId },
      data: {
        status: "signed",
        signed_at: new Date(signed_at),
        signed_by_name,
        agreement_accepted: true,
      },
    });

    // Send confirmation email
    await sendAgreementSignedMail(
      existingAgreement.email,
      signed_by_name,
      existingAgreement.dealership_name,
      existingAgreement.representative_name,
      Number(existingAgreement.service_fee_amount),
      existingAgreement.id,
    );

    return NextResponse.json({ success: true, updatedAgreement });
  } catch (error) {
    console.error("Failed to update dealership agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








// SEND Aggrement MAIL

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aggrementId } = await context.params;

    const agreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    await sendAgreementMail(
      agreement.email,
      agreement.representative_name,
      agreement.dealership_name,
      agreement.status,
      agreement.id,
    );

    return NextResponse.json({ success: true, message: "Agreement email sent successfully" });
  } catch (error) {
    console.error("Failed to send agreement mail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

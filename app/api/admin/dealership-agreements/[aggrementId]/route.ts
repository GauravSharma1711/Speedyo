import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendAgreementSignedMail } from "@/helpers/sendAgreementSignedMail";
import { sendAgreementMail } from "@/helpers/sendAgreementMail";

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
    console.error("Failed to delete agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// update after signing the aggrement
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aggrementId } = await context.params;

    const { status, signed_at, signed_by_name } = await request.json();

    const existingAgreement = await prisma.dealershipVehicleAgreement.findFirst({
      where: {
        id: aggrementId,
        created_by_admin_id: session.user.id,
      },
    });

    if (!existingAgreement) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const updatedAgreement = await prisma.dealershipVehicleAgreement.update({
      where: {
        id: aggrementId,
      },
      data: {
        status,
        signed_at,
        signed_by_name,
        agreement_accepted: true,
      },
    });

    // send signed  mail
    await sendAgreementSignedMail(
      existingAgreement.email,
      existingAgreement.signed_by_name ?? existingAgreement.representative_name,
      existingAgreement.dealership_name,
      existingAgreement.representative_name,
      Number(existingAgreement.service_fee_amount),
      existingAgreement.id,
    );

    return NextResponse.json({
      success: true,
      updatedAgreement,
    });
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

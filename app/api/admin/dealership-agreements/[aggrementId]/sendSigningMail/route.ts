import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendDealershipSendAgreementMail } from "@/helpers/sendDealershipSigningmail";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ agreementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agreementId } = await context.params;

    const agreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (!agreement.email) {
      return NextResponse.json({ error: "No email linked to this agreement" }, { status: 400 });
    }

    if (!agreement.agreement_url) {
      return NextResponse.json({ error: "No agreement URL found" }, { status: 400 });
    }

    await sendDealershipSendAgreementMail(
      agreement.email,
      agreement.dealership_name,
      agreement.representative_name,
      agreement.agreement_url,
      agreement.id,
      agreement.service_fee_amount ? Number(agreement.service_fee_amount) : null,
    );

    await prisma.dealershipVehicleAgreement.update({
      where: { id: agreementId },
      data: { status: "pending_signature" },
    });

    return NextResponse.json({
      success: true,
      message: "Agreement sent successfully",
    });
  } catch (error) {
    console.error("Failed to send dealership send-agreement mail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
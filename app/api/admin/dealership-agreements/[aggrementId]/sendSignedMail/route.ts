import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { sendDealershipSignedAgreementMail } from "@/helpers/sendDeaslershipSignedMail";

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

    console.log("aggrementid",aggrementId);

    const agreement = await prisma.dealershipVehicleAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    if (agreement.status !== "signed") {
      return NextResponse.json(
        { error: "Agreement has not been signed yet" },
        { status: 400 },
      );
    }

    if (!agreement.email) {
      return NextResponse.json(
        { error: "No email linked to this agreement" },
        { status: 400 },
      );
    }

    await sendDealershipSignedAgreementMail(
      agreement.email,
      agreement.dealership_name,
      agreement.representative_name,
      agreement.id,
      agreement.service_fee_amount ? Number(agreement.service_fee_amount) : null,
    );

    return NextResponse.json({
      success: true,
      message: "Signed agreement email sent successfully",
    });
  } catch (error) {
    console.error("Failed to send dealership signed-agreement mail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
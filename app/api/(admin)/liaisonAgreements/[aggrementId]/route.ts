import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { LanguageProficiency } from "@/lib/generated/prisma/enums";
import { sendLiaisonAgreementMail } from "@/helpers/sendLiaisonAgreementMail";


// DELETE AGGREMENT
export async function DELETE(
  request: NextRequest,
  { params }: { params: { agreementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agreementId } = params;

    const existing = await prisma.liaisonAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    await prisma.liaisonAgreement.delete({
      where: { id: agreementId },
    });

    return NextResponse.json({ success: true, message: "Agreement deleted successfully" });
  } catch (error) {
    console.error("Failed to delete agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// ADD APPLICATION

export async function POST(
  request: NextRequest,
  { params }: { params: { agreementId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agreementId } = params;

    const existing = await prisma.liaisonAgreement.findUnique({
      where: { id: agreementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      full_name,
      email,
      phone,
      language_proficiency,
      motivation,
      address,
      previous_experience,
      automotive_knowledge,
      availability,
      resume_url,
    } = body;

    if (!full_name || !email || !phone || !language_proficiency || !motivation) {
      return NextResponse.json(
        { error: "full_name, email, phone, language_proficiency, and motivation are required" },
        { status: 400 }
      );
    }

    // Create application and link it to the agreement
    const application = await prisma.liaisonApplication.create({
      data: {
        full_name,
        email,
        phone,
        language_proficiency: language_proficiency as LanguageProficiency,
        motivation,
        address: address ?? null,
        previous_experience: previous_experience ?? null,
        automotive_knowledge: automotive_knowledge ?? null,
        availability: availability ?? null,
        resume_url: resume_url ?? null,
        reviewed_by_admin_id: existing.created_by_admin_id,
        
      },
    });

    // Link application back to agreement
    await prisma.liaisonAgreement.update({
      where: { id: agreementId },
      data: {
         application_id: application.id,
         status:"signed"
         },
    });

    // Send mail
    await sendLiaisonAgreementMail(
      email,
      full_name,
      existing.position_title,
      Number(existing.fixed_fee_percentage),
      Number(existing.residual_pay_percentage),
      existing.status,
      phone,
      language_proficiency,
      agreementId,
    );

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    console.error("Failed to add application to agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}





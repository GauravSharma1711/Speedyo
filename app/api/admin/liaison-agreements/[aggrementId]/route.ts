import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { LanguageProficiency } from "@/lib/generated/prisma/enums";
import { sendLiaisonAgreementMail } from "@/helpers/sendLiaisonAgreementMail";
import { uploadFile } from "@/lib/storage/uploadFile";

// DELETE AGGREMENT
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

    const existing = await prisma.liaisonAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    await prisma.liaisonAgreement.delete({
      where: { id: aggrementId },
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
  context: { params: Promise<{ aggrementId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { aggrementId } = await context.params;

    const existing = await prisma.liaisonAgreement.findUnique({
      where: { id: aggrementId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    // ── Parse FormData ────────────────────────────────────────────────────────
    const formData = await request.formData();

    const full_name          = formData.get("full_name") as string | null;
    const email              = formData.get("email") as string | null;
    const phone              = formData.get("phone") as string | null;
    const language_proficiency = formData.get("language_proficiency") as string | null;
    const motivation         = formData.get("motivation") as string | null;

    if (!full_name || !email || !phone || !language_proficiency || !motivation) {
      return NextResponse.json(
        { error: "full_name, email, phone, language_proficiency, and motivation are required" },
        { status: 400 },
      );
    }

    const address             = formData.get("address") as string | null;
    const previous_experience = formData.get("previous_experience") as string | null;
    const automotive_knowledge = formData.get("automotive_knowledge") as string | null;
    const availability        = formData.get("availability") as string | null;

    // ── Upload resume (single file, optional) ─────────────────────────────────
    let resume_url: string | null = null;
    const resumeEntry = formData.get("resume");
    if (resumeEntry instanceof File && resumeEntry.size > 0) {
      const result = await uploadFile(resumeEntry, "resumes");
      resume_url = result.url;
    }

    // ── Create application & update agreement ─────────────────────────────────
    const application = await prisma.liaisonApplication.create({
      data: {
        full_name,
        email,
        phone,
        language_proficiency: language_proficiency as LanguageProficiency,
        motivation,
        address:              address ?? null,
        previous_experience:  previous_experience ?? null,
        automotive_knowledge: automotive_knowledge ?? null,
        availability:         availability ?? null,
        resume_url,
        reviewed_by_admin_id: existing.created_by_admin_id,
      },
    });

    await prisma.liaisonAgreement.update({
      where: { id: aggrementId },
      data: {
        application_id: application.id,
        status: "signed",
      },
    });

    await sendLiaisonAgreementMail(
      email,
      full_name,
      existing.position_title,
      Number(existing.fixed_fee_percentage),
      Number(existing.residual_pay_percentage),
      existing.status,
      phone,
      language_proficiency,
      aggrementId,
    );

    // ── Return updated agreement with application included ────────────────────
    const updatedAgreement = await prisma.liaisonAgreement.findUnique({
      where: { id: aggrementId },
      include: { application: true },
    });

    return NextResponse.json({ success: true, agreement: updatedAgreement }, { status: 201 });
  } catch (error) {
    console.error("Failed to add application to liaison agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}








export async function GET(
  request: NextRequest,
  context: { params: Promise<{ aggrementId: string }> }  
) {
  const { aggrementId } = await context.params;  

  try {
    const agreement = await prisma.liaisonAgreement.findUnique({
      where: { id: aggrementId },
      include: { application: true },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    return NextResponse.json({ agreement }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch liaison agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
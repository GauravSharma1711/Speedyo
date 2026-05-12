// app/api/admin/photographer-agreements/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const parseDate = (dateStr: string | undefined | null): Date | null => {
  if (!dateStr) return null;

  // Handle DD-MM-YY or DD-MM-YYYY format
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // months are 0-indexed
      const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }
  }

  // Fallback for ISO format like "2026-05-10"
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const photographerInclude = {
  createdByAdmin: { select: { id: true, full_name: true, email: true } },
  application: {
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      photography_experience_years: true,
      motivation: true,
      address: true,
      automotive_photography_experience: true,
      portfolio_url: true,
      equipment: true,
      availability: true,
      location_preferences: true,
      sample_work_urls: true,
      status: true,
      admin_notes: true,
      reviewed_by_admin_id: true,
      reviewed_at: true,
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    console.log("photograph aggrement body",body);

    const {
      agreement_title,
      position_title,
      photographer_email,
      fixed_percentage,
      termination_notice_days,
      agreement_start_date,
      agreement_end_date,
      admin_notes,
    } = body;

    const agreement = await prisma.photographerAgreement.create({
      data: {
        ...(agreement_title && { agreement_title }),
         ...(photographer_email && { photographer_email }),
        ...(position_title && { position_title }),
        ...(fixed_percentage && { fixed_percentage }),
      ...(termination_notice_days != null && { termination_notice_days: Number(termination_notice_days) }),
       ...(parseDate(agreement_start_date) && { agreement_start_date: parseDate(agreement_start_date) }),
    ...(parseDate(agreement_end_date) && { agreement_end_date: parseDate(agreement_end_date) }),
        created_by_admin_id: session.user.id,
        admin_notes: admin_notes ?? null,
      },
    });


    
    const agreementUrl = `http://localhost:3000/PhotographerAgreement?id=${agreement.id}`;

    // Update the record with the generated URL
    const updatedAgreement = await prisma.photographerAgreement.update({
      where: { id: agreement.id },
      data: { agreement_url: agreementUrl },
    });

    return NextResponse.json({ success: true, agreement: updatedAgreement }, { status: 201 });
  } catch (error) {
    console.error("Failed to create photographer agreement", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agreements = await prisma.photographerAgreement.findMany({
      where: { created_by_admin_id: session.user.id },
      include: photographerInclude,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, agreements });
  } catch (error) {
    console.error("Failed to get photographer agreements", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
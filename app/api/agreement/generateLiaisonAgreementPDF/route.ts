import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { agreementId } = await request.json();

    if (!agreementId) {
      return NextResponse.json({ error: "agreementId is required" }, { status: 400 });
    }

    // Fetch agreement + linked application (has contact info)
    const agreement = await prisma.liaisonAgreement.findUnique({
      where: { id: agreementId },
      include: { application: true },
    });

    if (!agreement) {
      return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
    }

    const app = agreement.application; // contact info lives here

    // ── Generate PDF ──────────────────────────────────────────────
    const doc = new jsPDF();
    let y = 20;

    const nextLine = (gap = 7) => { y += gap; };
    const checkPage = () => {
      if (y > 250) { doc.addPage(); y = 20; }
    };

    // ── Title ─────────────────────────────────────────────────────
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(agreement.agreement_title, 20, y);
    nextLine(15);

    // ── 1. Liaison Information ────────────────────────────────────
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("1. Liaison Information", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    if (app) {
      doc.text(`Full Name: ${app.full_name}`, 25, y); nextLine();
      doc.text(`Address: ${app.address ?? "N/A"}`, 25, y); nextLine();
      doc.text(`Phone / Email: ${app.phone} / ${app.email}`, 25, y); nextLine(12);
    } else {
      doc.text("Liaison information not available", 25, y); nextLine(12);
    }

    // ── 2. Position Title ─────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("2. Position Title", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(agreement.position_title, 25, y);
    nextLine(12);

    // ── 3. Responsibilities ───────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("3. Responsibilities", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const responsibilities = [
      "Serve as an interpreter during meetings and communications",
      "Accurately translate between Japanese and English",
      "Maintain full confidentiality of all communications",
      "Assist with documentation and submission of dealership info",
      "Support communication and coordination with dealerships",
      "Represent Speedyo professionally",
    ];

    responsibilities.forEach((resp) => {
      checkPage();
      doc.text(`• ${resp}`, 25, y);
      nextLine();
    });
    nextLine(5);

    // ── 4. Compensation ───────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("4. Compensation", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Fixed Fee: ${agreement.fixed_fee_percentage}% of service fee per assisted sale`,
      25, y
    );
    nextLine();
    doc.text(
      `Residual Pay: ${agreement.residual_pay_percentage}% for subsequent sales`,
      25, y
    );
    nextLine(12);

    // ── 5. Confidentiality ────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("5. Confidentiality", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Liaison shall not disclose proprietary information.", 25, y);
    nextLine(12);

    // ── 6. Term and Termination ───────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("6. Term and Termination", 20, y);
    nextLine(8);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const startDate = agreement.agreement_start_date
      ? new Date(agreement.agreement_start_date).toLocaleDateString()
      : "[Start Date]";
    const endDate = agreement.agreement_end_date
      ? new Date(agreement.agreement_end_date).toLocaleDateString()
      : "indefinite";

    doc.text(`Effective from ${startDate} to ${endDate}`, 25, y);
    nextLine();
    doc.text(
      `${agreement.termination_notice_days} days notice required for termination`,
      25, y
    );
    nextLine(12);

    // ── 7. Signatures ─────────────────────────────────────────────
    checkPage();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("7. Signatures", 20, y);
    nextLine(10);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Note: your Prisma schema doesn't have signed_by_liaison / liaison_signed_at
    // Those fields don't exist — signature info is tracked via agreement.status
    doc.text(`Agreement Status: ${agreement.status}`, 25, y);
    nextLine();

    if (agreement.status === "signed") {
      doc.text(`Signed by Liaison: ${app?.full_name ?? "N/A"}`, 25, y);
      nextLine();
    } else {
      doc.text("Liaison Signature: ______________________", 25, y);
      nextLine();
    }

    if (agreement.admin_notes) {
      nextLine(5);
      checkPage();
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Admin Notes", 20, y);
      nextLine(8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(agreement.admin_notes, 25, y);
    }

    // ── Output ────────────────────────────────────────────────────
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const liaisionName = app?.full_name?.replace(/\s+/g, "_") ?? agreementId;
    const filename = `Liaison_Agreement_${liaisionName}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
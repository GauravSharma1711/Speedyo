import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import prisma from "@/db/prisma";
import jsPDF from "jspdf";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { user: true, transaction: true },
    });

    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fmt = (d: Date | null) =>
      d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

    const fmtAmt = (n: any) => `JPY ${Number(n).toLocaleString("ja-JP")}`;

    const doc = new jsPDF();
    let y = 20;
    const nextLine = (gap = 7) => { y += gap; };
    const checkPage = () => { if (y > 260) { doc.addPage(); y = 20; } };

    // Header
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Speedio", 20, 18);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Vehicle Marketplace", 20, 26);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 190, 18, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.invoice_number, 190, 26, { align: "right" });

    // Status badge
    const isPaid = invoice.status === "paid";
    doc.setFillColor(isPaid ? 220 : 254, isPaid ? 252 : 249, isPaid ? 231 : 195);
    doc.roundedRect(150, 29, 40, 8, 2, 2, "F");
    doc.setTextColor(isPaid ? 22 : 133, isPaid ? 101 : 77, isPaid ? 52 : 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.status.toUpperCase(), 170, 34.5, { align: "center" });

    y = 55;
    doc.setTextColor(30, 41, 59);

    // Info grid
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("BILLED TO", 20, y);
    doc.text("INVOICE DATE", 110, y);
    nextLine(5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.text(invoice.user.full_name ?? "—", 20, y);
    doc.text(fmt(invoice.createdAt), 110, y);
    nextLine(6);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(invoice.user.email, 20, y);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("PAYMENT DATE", 110, y);
    nextLine(5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.text(fmt(invoice.paid_at), 110, y);
    nextLine(6);

    if (invoice.period_start && invoice.period_end) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(148, 163, 184);
      doc.text("BILLING PERIOD", 110, y);
      nextLine(5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.text(`${fmt(invoice.period_start)} – ${fmt(invoice.period_end)}`, 110, y);
    }

    // Divider
    y += 12;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    nextLine(10);

    // Table header
    checkPage();
    doc.setFillColor(241, 245, 249);
    doc.rect(20, y - 4, 170, 10, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 116, 139);
    doc.text("DESCRIPTION", 24, y + 2);
    doc.text("CURRENCY", 130, y + 2);
    doc.text("AMOUNT", 190, y + 2, { align: "right" });
    nextLine(14);

    // Table row
    checkPage();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(invoice.description, 24, y);
    doc.text(invoice.currency, 130, y);
    doc.text(fmtAmt(invoice.amount), 190, y, { align: "right" });
    nextLine(12);

    // Total row
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    nextLine(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y - 4, 170, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Total", 24, y + 4);
    doc.setTextColor(30, 64, 175);
    doc.text(fmtAmt(invoice.amount), 190, y + 4, { align: "right" });
    nextLine(20);

    // Footer
    checkPage();
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    nextLine(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Thank you for using Speedio.", 20, y);
    doc.text(`Transaction: ${invoice.transaction?.square_payment_id ?? invoice.transactionId}`, 190, y, { align: "right" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const isView = request.nextUrl.searchParams.get("view") === "true";


    return new NextResponse(pdfBuffer, {
  status: 200,
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `${isView ? "inline" : "attachment"}; filename="Invoice_${invoice.invoice_number}.pdf"`,
  },
});

  } catch (error) {
    console.error("Invoice PDF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
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

    // id here is the square_payment_id or transaction id
    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [{ id }, { square_payment_id: id }],
        userId: session.user.id,
      },
      include: { user: true, invoice: true },
    });

    if (!transaction) {
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
    doc.text("Speedyo", 20, 18);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Vehicle Marketplace", 20, 26);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PAYMENT RECEIPT", 190, 18, { align: "right" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(transaction.square_payment_id ?? transaction.id, 190, 26, { align: "right" });

    // Status badge
    const isSuccess = transaction.status === "completed";
    doc.setFillColor(isSuccess ? 220 : 254, isSuccess ? 252 : 249, isSuccess ? 231 : 195);
    doc.roundedRect(150, 29, 40, 8, 2, 2, "F");
    doc.setTextColor(isSuccess ? 22 : 133, isSuccess ? 101 : 77, isSuccess ? 52 : 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(transaction.status.toUpperCase(), 170, 34.5, { align: "center" });

    y = 55;
    doc.setTextColor(30, 41, 59);

    // Info grid
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("PAID BY", 20, y);
    doc.text("PAYMENT DATE", 110, y);
    nextLine(5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.text(transaction.user.full_name ?? "—", 20, y);
    doc.text(fmt(transaction.createdAt), 110, y);
    nextLine(6);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(transaction.user.email, 20, y);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("PAYMENT METHOD", 110, y);
    nextLine(5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.text("Square", 110, y);
    nextLine(6);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184);
    doc.text("TRANSACTION TYPE", 110, y);
    nextLine(5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(transaction.transaction_type.replace(/_/g, " ").toUpperCase(), 110, y);

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
    const description = transaction.invoice?.description
      ?? transaction.transaction_type.replace(/_/g, " ");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(description, 24, y);
    doc.text(transaction.currency, 130, y);
    doc.text(fmtAmt(transaction.amount), 190, y, { align: "right" });
    nextLine(12);

    // Slots purchased (if applicable)
    if (transaction.slots_purchased) {
      checkPage();
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Slots purchased: ${transaction.slots_purchased}`, 24, y);
      nextLine(10);
    }

    // Total row
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    nextLine(8);
    doc.setFillColor(248, 250, 252);
    doc.rect(20, y - 4, 170, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text("Total Paid", 24, y + 4);
    doc.setTextColor(30, 64, 175);
    doc.text(fmtAmt(transaction.amount), 190, y + 4, { align: "right" });
    nextLine(20);

    // Invoice reference (if linked)
    if (transaction.invoice) {
      checkPage();
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Invoice Reference: ${transaction.invoice.invoice_number}`, 20, y);
      nextLine(10);
    }

    // Footer
    checkPage();
    doc.setDrawColor(226, 232, 240);
    doc.line(20, y, 190, y);
    nextLine(8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("Thank you for using Speedyo.", 20, y);
    doc.text(`Transaction ID: ${transaction.square_payment_id ?? transaction.id}`, 190, y, { align: "right" });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const isView = request.nextUrl.searchParams.get("view") === "true";

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${isView ? "inline" : "attachment"}; filename="Receipt_${transaction.square_payment_id ?? transaction.id}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Payment receipt PDF error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
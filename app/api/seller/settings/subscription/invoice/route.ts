
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // paid | unpaid | overdue | cancelled | refunded
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const page = parseInt(searchParams.get("page") ?? "1");
    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(status && { status: status as any }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          transaction: {
            select: {
              id: true,
              transaction_type: true,
              square_payment_id: true,
              square_receipt_url: true,
              subscription_tier: true,
              slots_purchased: true,
              promo_code_used: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.invoice.count({ where }),
    ]);

    const summary = await prisma.invoice.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _sum: { amount: true },
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
        summary: summary.reduce(
          (acc, s) => ({
            ...acc,
            [s.status]: {
              count: s._count.id,
              total_amount: s._sum.amount ?? 0,
            },
          }),
          {}
        ),
      },
    });
  } catch (error) {
    console.error("Failed to get invoices", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
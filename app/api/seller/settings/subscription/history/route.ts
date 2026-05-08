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
    const status = searchParams.get("status");         // pending | completed | failed | refunded | cancelled
    const type = searchParams.get("type");             // subscription_purchase | slot_purchase etc
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const page = parseInt(searchParams.get("page") ?? "1");
    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(status && { status: status as any }),
      ...(type && { transaction_type: type as any }),
    };

    const [transactions, total] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where,
        include: {
          invoice: {
            select: {
              id: true,
              invoice_number: true,
              status: true,
              invoice_url: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.paymentTransaction.count({ where }),
    ]);

    // Summary — only count completed transactions
    const completedTransactions = await prisma.paymentTransaction.findMany({
      where: { userId: session.user.id, status: "completed" },
      select: { amount: true, transaction_type: true },
    });

    const totalSpent = completedTransactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );

    const spentByType = completedTransactions.reduce(
      (acc, t) => ({
        ...acc,
        [t.transaction_type]:
          (acc[t.transaction_type as keyof typeof acc] ?? 0) + Number(t.amount),
      }),
      {} as Record<string, number>
    );

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        },
        summary: {
          total_spent: Math.round(totalSpent * 100) / 100,
          total_transactions: completedTransactions.length,
          by_type: spentByType,
        },
      },
    });
  } catch (error) {
    console.error("Failed to get payment history", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can list all tickets
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status      = searchParams.get("status")      ?? undefined;
    const ticket_type = searchParams.get("ticket_type") ?? undefined;
    const priority    = searchParams.get("priority")    ?? undefined;

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(status      && { status:      status      as never }),
        ...(ticket_type && { ticket_type: ticket_type as never }),
        ...(priority    && { priority:    priority    as never }),
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, tickets }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/support-tickets]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
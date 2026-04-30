import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const VALID_STATUSES    = ["open", "in_progress", "resolved", "closed"] as const;
const VALID_PRIORITIES  = ["low", "medium", "high", "urgent"] as const;
const VALID_TICKET_TYPES = ["general", "billing", "technical", "listing_issue"] as const;

function validateUpdateBody(body: Record<string, unknown>): string | null {
  const { status, priority, ticket_type, assigned_to, resolution_notes } = body;

  if (
    status !== undefined &&
    !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])
  )
    return `status must be one of: ${VALID_STATUSES.join(", ")}`;

  if (
    priority !== undefined &&
    !VALID_PRIORITIES.includes(priority as typeof VALID_PRIORITIES[number])
  )
    return `priority must be one of: ${VALID_PRIORITIES.join(", ")}`;

  if (
    ticket_type !== undefined &&
    !VALID_TICKET_TYPES.includes(ticket_type as typeof VALID_TICKET_TYPES[number])
  )
    return `ticket_type must be one of: ${VALID_TICKET_TYPES.join(", ")}`;

  if (assigned_to !== undefined && typeof assigned_to !== "string")
    return "assigned_to must be a string (admin email)";

  if (resolution_notes !== undefined && typeof resolution_notes !== "string")
    return "resolution_notes must be a string";

  if (resolution_notes && resolution_notes.length > 2000)
    return "resolution_notes must be 2000 characters or fewer";

  // At least one field must be provided
  if (
    status === undefined &&
    priority === undefined &&
    ticket_type === undefined &&
    assigned_to === undefined &&
    resolution_notes === undefined
  )
    return "at least one field must be provided to update";

  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin only
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { role: true, email: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Check ticket exists
    const existing = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const body = await req.json();

    const validationError = validateUpdateBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { status, priority, ticket_type, assigned_to, resolution_notes } = body;

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status           !== undefined && { status }),
        ...(priority         !== undefined && { priority }),
        ...(ticket_type      !== undefined && { ticket_type }),
        ...(assigned_to      !== undefined && { assigned_to }),
        ...(resolution_notes !== undefined && { resolution_notes }),
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/support-tickets/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/support-tickets/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
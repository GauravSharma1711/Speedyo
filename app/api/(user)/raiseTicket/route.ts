import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

const VALID_TICKET_TYPES = ["general", "billing", "technical", "listing_issue"] as const;
const VALID_PRIORITIES   = ["low", "medium", "high", "urgent"] as const;

function validateTicketBody(body: Record<string, unknown>): string | null {
  const { name, email, subject, message, ticket_type, priority } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0)
    return "name is required";

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "a valid email is required";

  if (!subject || typeof subject !== "string" || subject.trim().length === 0)
    return "subject is required";

 

  if (!message || typeof message !== "string" || message.trim().length === 0)
    return "message is required";


  if (ticket_type && !VALID_TICKET_TYPES.includes(ticket_type as typeof VALID_TICKET_TYPES[number]))
    return `ticket_type must be one of: ${VALID_TICKET_TYPES.join(", ")}`;

  if (priority && !VALID_PRIORITIES.includes(priority as typeof VALID_PRIORITIES[number]))
    return `priority must be one of: ${VALID_PRIORITIES.join(", ")}`;

  return null;
}

export async function POST(req: NextRequest) {
  try {
   
    const body = await req.json();

    const validationError = validateTicketBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const {
      name,
      email,
      subject,
      message,
      ticket_type,
      priority,
    } = body;

    const ticket = await prisma.supportTicket.create({
      data: {
        name:        name.trim(),
        email:       email.trim().toLowerCase(),
        subject:     subject.trim(),
        message:     message.trim(),
        ticket_type: ticket_type ?? "general",
        priority:    priority    ?? "medium",
        status:      "open",
      },
    });

    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/support-tickets]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


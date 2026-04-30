import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const VALID_STATUSES   = ["new", "reviewed", "in_progress", "resolved"] as const;
const VALID_CATEGORIES = ["general", "marketplace", "feed", "messaging", "managed_sales", "dashboard", "other"] as const;

function validateUpdateBody(body: Record<string, unknown>): string | null {
  const { status, category, admin_notes } = body;

  if (
    status !== undefined &&
    !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])
  )
    return `status must be one of: ${VALID_STATUSES.join(", ")}`;

  if (
    category !== undefined &&
    !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
  )
    return `category must be one of: ${VALID_CATEGORIES.join(", ")}`;

  if (admin_notes !== undefined && typeof admin_notes !== "string")
    return "admin_notes must be a string";

  if (admin_notes && admin_notes.length > 2000)
    return "admin_notes must be 2000 characters or fewer";

  if (
    status      === undefined &&
    category    === undefined &&
    admin_notes === undefined
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
      select: { role: true },
    });

    if (user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.feedback.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Feedback not found" }, { status: 404 });
    }

    const body = await req.json();

    const validationError = validateUpdateBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { status, category, admin_notes } = body;

    const feedback = await prisma.feedback.update({
      where: { id: params.id },
      data: {
        ...(status      !== undefined && { status }),
        ...(category    !== undefined && { category }),
        ...(admin_notes !== undefined && { admin_notes }),
      },
      include: {
        user: {
          select: {
            id:            true,
            full_name:     true,
            profile_image: true,
            user_type:     true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 200 });
  } catch (error) {
    console.error("[PATCH /api/feedback/:id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
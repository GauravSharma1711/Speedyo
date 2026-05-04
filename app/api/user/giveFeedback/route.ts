import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const VALID_CATEGORIES = ["general", "marketplace", "feed", "messaging", "managed_sales", "dashboard", "other"] as const;

function validateFeedbackBody(body: Record<string, unknown>): string | null {
  const { satisfaction_rating, feedback_text, category } = body;
 
  if (
    satisfaction_rating === undefined ||
    typeof satisfaction_rating !== "number" ||
    !Number.isInteger(satisfaction_rating) ||
    satisfaction_rating < 1 ||
    satisfaction_rating > 5
  )
    return "satisfaction_rating must be an integer between 1 and 5";
 
  if (!feedback_text || typeof feedback_text !== "string" || feedback_text.trim().length === 0)
    return "feedback_text is required";
 
  if (feedback_text.trim().length > 3000)
    return "feedback_text must be 3000 characters or fewer";
 
  if (
    category !== undefined &&
    !VALID_CATEGORIES.includes(category as typeof VALID_CATEGORIES[number])
  )
    return `category must be one of: ${VALID_CATEGORIES.join(", ")}`;
 
  return null;
}


export async function POST(req: NextRequest) {
  try {
    // Auth optional — guests can submit feedback too
    const session = await getServerSession(authOptions);
 
    const body = await req.json();
 
    const validationError = validateFeedbackBody(body);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }
 
    const { satisfaction_rating, feedback_text, category } = body;
 
    // If logged in, pull name + email from their account
    let user_email: string | null = null;
    let user_name:  string | null = null;
    let userId:     string | null = null;
 
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where:  { id: session.user.id },
        select: { id: true, email: true, full_name: true },
      });
 
      if (user) {
        userId     = user.id;
        user_email = user.email;
        user_name  = user.full_name ?? null;
      }
    }
 
    const feedback = await prisma.feedback.create({
      data: {
        satisfaction_rating,
        feedback_text: feedback_text.trim(),
        category:      category ?? "general",
        status:        "new",
        userId,
        user_email,
        user_name,
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
 
    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/feedback]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

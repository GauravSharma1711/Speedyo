// app/api/unsubscribe/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";

const appUrl = process.env.APP_URL || "https://speedyo.app";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const type = searchParams.get("type"); // 'all', 'post', 'vehicle'

  // ── Validate params ───────────────────────────────────────────
  if (!email || !type) {
    return new NextResponse(errorHtml("This unsubscribe link is invalid or has expired."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!["all", "post", "vehicle"].includes(type)) {
    return new NextResponse(errorHtml("Invalid unsubscribe type."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return new NextResponse(errorHtml("User not found."), {
        status: 404,
        headers: { "Content-Type": "text/html" },
      });
    }

    // ── Update preferences based on type ──────────────────────
    if (type === "all") {
      await prisma.emailNotifications.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          new_follower_post: false,
          new_follower_vehicle: false,
          all_emails: false,
        },
        update: {
          new_follower_post: false,
          new_follower_vehicle: false,
          all_emails: false,
        },
      });
    } else if (type === "post") {
      await prisma.emailNotifications.upsert({
        where: { userId: user.id },
        create: { userId: user.id, new_follower_post: false },
        update: { new_follower_post: false },
      });
    } else if (type === "vehicle") {
      await prisma.emailNotifications.upsert({
        where: { userId: user.id },
        create: { userId: user.id, new_follower_vehicle: false },
        update: { new_follower_vehicle: false },
      });
    }

    // ── Return success HTML ────────────────────────────────────
    const message =
      type === "all"
        ? "You have been unsubscribed from all email notifications."
        : type === "post"
        ? "You will no longer receive emails when people you follow create new posts."
        : "You will no longer receive emails when people you follow list new vehicles.";

    return new NextResponse(successHtml(message, appUrl), {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });

  } catch (error: any) {
    console.error("Error in unsubscribe route:", error);
    return new NextResponse(
      errorHtml("An error occurred while processing your request. Please try again later."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function successHtml(message: string, appUrl: string): string {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(to bottom right, #f8fafc, #e0f2fe);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 50px 20px;
            margin: 0;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          h1 { color: #1e293b; margin-bottom: 20px; }
          p { color: #475569; line-height: 1.6; margin-bottom: 20px; }
          .icon { font-size: 48px; color: #10b981; margin-bottom: 20px; }
          .button {
            display: inline-block;
            background: linear-gradient(to right, #3b82f6, #10b981);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✓</div>
          <h1>Successfully Unsubscribed</h1>
          <p>${message}</p>
          <p>You can update your email preferences anytime in your account settings.</p>
          <a href="${appUrl}/Feed" class="button">Return to Speedyo</a>
        </div>
      </body>
    </html>
  `;
}

function errorHtml(message: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1>Error</h1>
        <p style="color: #475569;">${message}</p>
      </body>
    </html>
  `;
}
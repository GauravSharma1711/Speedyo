


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ testDriveRequestId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testDriveRequestId } = await context.params;

    const existing = await prisma.testDriveRequest.findUnique({
      where: { id: testDriveRequestId },
      include: {
        vehicle: { select: { id: true, title: true, make: true, model: true, year: true, location: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Test drive request not found" }, { status: 404 });
    }

    const body = await request.json();
    console.log("body",body);
    const { status, confirmed_date, confirmed_time, location, admin_note } = body;

    // ── Update the test drive request ──
    const testDriveRequest = await prisma.testDriveRequest.update({
      where: { id: testDriveRequestId },
      data: {
        ...(status && { status }),
        ...(confirmed_date !== undefined && { confirmed_date }),
        ...(confirmed_time !== undefined && { confirmed_time }),
        ...(location !== undefined && { location }),
        ...(admin_note !== undefined && { admin_note }),
      },
      include: {
        vehicle: { select: { id: true, title: true, make: true, model: true, year: true, price: true, location: true } },
        user: { select: { id: true, full_name: true, email: true } },
      },
    });

    // ── Update the message card in the conversation ──
    if (existing.userId) {
      const vehicleTitle = `${existing.vehicle.year} ${existing.vehicle.make} ${existing.vehicle.model}`;

      // Find the conversation between user and admin for this vehicle
      const conversation = await prisma.conversation.findUnique({
        where: {
          user1Id_user2Id_vehicleId: {
            user1Id: existing.userId,
            user2Id: session.user.id,
            vehicleId: existing.vehicleId,
          },
        },
      });

      if (conversation) {
        // Find the original test drive message card and update it in place
        const existingMessage = await prisma.message.findFirst({
          where: {
            conversationId: conversation.id,
            message_type: "test_drive_request",
          },
        });

        if (existingMessage) {
     let existingCard: Record<string, any> = {};
try {
  existingCard = existingMessage.content
    ? JSON.parse(existingMessage.content)
    : {};
} catch {
  existingCard = {};
}

          await prisma.message.update({
            where: { id: existingMessage.id },
            data: {
              content: JSON.stringify({
                ...existingCard,
                status: status ?? existing.status,
                confirmed_date: confirmed_date ?? existing.confirmed_date,
                confirmed_time: confirmed_time ?? existing.confirmed_time,
                location: location ?? existing.location ?? existing.vehicle.location ?? "",
              }),
            },
          });
        }

        // Update conversation snapshot
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            last_message: `Test drive ${status ?? existing.status} for ${vehicleTitle}`,
            last_message_at: new Date(),
            last_message_type: "test_drive_status_update",
            user1_unread: { increment: 1 }, // user1 (the requester) has a new update
          },
        });

        // Notify the user
        await prisma.notification.create({
          data: {
            recipientId: existing.userId,
            senderId: session.user.id,
            type: "test_drive_status_update",
            content: `Your test drive request for "${vehicleTitle}" has been ${status ?? existing.status}.`,
            related_entity_type: "test_drive_request",
            related_entity_id: testDriveRequestId,
            url: `/Messages?conversationId=${conversation.id}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, testDriveRequest });
  } catch (error) {
    console.error("Failed to update test drive request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
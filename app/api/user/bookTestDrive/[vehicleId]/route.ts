import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { upsertVehicleConversation } from "@/lib/conversations/upsertVehicleConversation";
import { MessageType } from "@/lib/generated/prisma/enums";




export async function POST(
  request: NextRequest,
  context: { params: Promise<{ vehicleId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await context.params;

    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        author: { select: { id: true, full_name: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const body = await request.json();
    const { requested_date, requested_time, additional_notes } = body;

    if (!requested_date || !requested_time) {
      return NextResponse.json(
        { error: "requested_date and requested_time are required" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });

       // Find admin to send message to
    const admin = existing.authorId
      ? { id: existing.authorId }
      : await prisma.user.findFirst({ where: { role: "admin" }, select: { id: true } });

    if (!admin) {
      return NextResponse.json({ error: "No admin found" }, { status: 500 });
    }
  
     const testDriveRequest = await prisma.testDriveRequest.create({
      data: {
        vehicleId,
        requester_name: session.user.full_name ?? session.user.email,
        requester_email: session.user.email,
        requester_phone: dbUser?.phone ?? null,
        requested_date,
        requested_time,
        additional_notes: additional_notes ?? null,
        userId: session.user.id,
      },
      include: {
        vehicle: { select: { id: true, title: true, make: true, model: true, year: true } },
        user: { select: { id: true, full_name: true, email: true } },
      },
    });

    const vehicleTitle = `${existing.year} ${existing.make} ${existing.model}`;
    const requesterName = session.user.full_name ?? session.user.email;

    const conversation = await upsertVehicleConversation(prisma, {
      userAId: session.user.id,
      userBId: admin.id,
      vehicleId,
      recipientUnreadForUserId: admin.id,
      last_message: `Test drive request for ${vehicleTitle}`,
      last_message_at: new Date(),
      last_message_type: MessageType.test_drive_request,
    });

     await prisma.message.create({
      data: {
        senderId: session.user.id,
        recipientId: admin.id,
        conversationId: conversation.id,
        vehicleId,
        message_type: "test_drive_request",
        content: JSON.stringify({
          testDriveRequestId: testDriveRequest.id,
          vehicle_title: vehicleTitle,
          requested_date,
          requested_time,
          location: existing.location ?? "",
          status: "pending",
          additional_notes: additional_notes ?? null,
        }),
      },
    });

       await prisma.notification.create({
      data: {
        recipientId: session.user.id,
        type: "test_drive_request",
        content: `Your test drive request for "${vehicleTitle}" was successfully submitted.`,
        related_entity_type: "test_drive_request",
        related_entity_id: testDriveRequest.id,
        url: `/messages?conversationId=${conversation.id}`,
      },
    });


       if (existing.authorId) {
      await prisma.notification.create({
        data: {
          recipientId: existing.authorId,
          senderId: session.user.id,
          type: "test_drive_request",
          content: `New test drive request from ${requesterName} for "${vehicleTitle}".`,
          related_entity_type: "test_drive_request",
          related_entity_id: testDriveRequest.id,
          url: `/admin/test-drives/${testDriveRequest.id}`,
        },
      });
    } else {
      const admins = await prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true },
      });

      await prisma.notification.createMany({
        data: admins.map((a) => ({
          recipientId: a.id,
          senderId: session.user.id,
          type: "test_drive_request" as const,
          content: `New test drive request from ${requesterName} for "${vehicleTitle}".`,
          related_entity_type: "test_drive_request",
          related_entity_id: testDriveRequest.id,
          url: `/admin/test-drives/${testDriveRequest.id}`,
        })),
      });
    }

    return NextResponse.json({ success: true, testDriveRequest }, { status: 201 });
  } catch (error) {
    console.error("Failed to request test drive", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
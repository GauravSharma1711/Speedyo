import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { upsertVehicleConversation } from "@/lib/conversations/upsertVehicleConversation";
import { MessageType } from "@/lib/generated/prisma/enums";

export async function POST(req: NextRequest, context: { params: Promise<{ vehicleId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vehicleId } = await context.params;
    const { requested_date, requested_time, additional_notes } = await req.json();

    if (!requested_date || !requested_time) {
      return NextResponse.json({ error: "requested_date and requested_time are required" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, status: true, authorId: true, website_managed: true, title: true, location: true },
    });

    if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    if (vehicle.status !== "available") {
      return NextResponse.json({ error: "Vehicle is not available for test drives" }, { status: 400 });
    }

    const requesterName = session.user.full_name ?? "User";
    const requesterEmail = session.user.email ?? "";

    const recipientId = await (async () => {
      if (vehicle.website_managed) {
        const admin = await prisma.user.findFirst({
          where: { role: "admin" },
          select: { id: true },
          orderBy: { createdAt: "asc" },
        });
        if (admin?.id) return admin.id;
      }
      return vehicle.authorId ?? null;
    })();

    if (!recipientId) {
      return NextResponse.json({ error: "Recipient not found for this vehicle" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true },
    });

    const vehicleTitle = vehicle.title ?? "Vehicle";

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.testDriveRequest.create({
        data: {
          vehicleId,
          requester_name: requesterName,
          requester_email: requesterEmail,
          requester_phone: dbUser?.phone ?? null,
          requested_date,
          requested_time,
          additional_notes: additional_notes || null,
          userId: session.user.id,
        },
      });

      const conversation = await upsertVehicleConversation(tx, {
        userAId: session.user.id,
        userBId: recipientId,
        vehicleId,
        recipientUnreadForUserId: recipientId,
        last_message: `Test drive request for ${vehicleTitle}`,
        last_message_at: new Date(),
        last_message_type: MessageType.test_drive_request,
      });

      const message = await tx.message.create({
        data: {
          senderId: session.user.id,
          recipientId,
          vehicleId,
          conversationId: conversation.id,
          message_type: "test_drive_request",
          content: JSON.stringify({
            testDriveRequestId: created.id,
            vehicle_title: vehicleTitle,
            requested_date,
            requested_time,
            location: vehicle.location ?? "",
            status: "pending",
            additional_notes: additional_notes ?? null,
          }),
        },
      });

      const url = `/vehicle?id=${vehicleId}`;

      await tx.notification.createMany({
        data: [
          {
            recipientId,
            senderId: session.user.id,
            type: "test_drive_request",
            content: `${requesterName} requested a test drive for ${vehicleTitle}.`,
            related_entity_type: "vehicle",
            related_entity_id: vehicleId,
            url,
            icon: "Calendar",
            read: false,
          },
          {
            recipientId: session.user.id,
            senderId: recipientId,
            type: "test_drive_request",
            content: `Your test drive request for "${vehicleTitle}" was submitted.`,
            related_entity_type: "vehicle",
            related_entity_id: vehicleId,
            url,
            icon: "Calendar",
            read: false,
          },
        ],
      });

      return { created, message };
    });

    return NextResponse.json(
      { success: true, request: result.created, message: result.message },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/vehicles/[id]/test-drive failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

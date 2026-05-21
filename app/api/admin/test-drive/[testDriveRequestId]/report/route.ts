
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

const reportInclude = {
  testDriveRequest: {
    select: {
      id: true,
      requester_name: true,
      requester_email: true,
      requested_date: true,
      requested_time: true,
      status: true,
      vehicle: {
        select: { id: true, title: true, make: true, model: true, year: true },
      },
    },
  },
};

// POST — Create report
export async function POST(
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
    });

    if (!existing) {
      return NextResponse.json({ error: "Test drive request not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      buyer_interest_level,
      buyer_feedback,
      speedio_assessment,
      recommended_next_steps,
      admin_notes,
    } = body;

    console.log("body",body);

    if (!buyer_interest_level || !speedio_assessment) {
      return NextResponse.json(
        { error: "buyer_interest_level and speedio_assessment are required" },
        { status: 400 }
      );
    }

    const report = await prisma.testDriveReport.create({
      data: {
        testDriveRequestId,
        buyer_interest_level,
        buyer_feedback: buyer_feedback ?? null,
        speedio_assessment,
        recommended_next_steps: recommended_next_steps ?? null,
        admin_notes: admin_notes ?? null,
      },
      include: reportInclude,
    });

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    console.error("Failed to create test drive report", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH — Edit report
// export async function PATCH(
//   request: NextRequest,
//   context: { params: Promise<{ testDriveRequestId: string }> },
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== "admin") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { testDriveRequestId } = await context.params;

//     const existing = await prisma.testDriveReport.findUnique({
//       where: { testDriveRequestId },
//     });

//     if (!existing) {
//       return NextResponse.json({ error: "Report not found" }, { status: 404 });
//     }

//     const body = await request.json();
//     const {
//       buyer_interest_level,
//       buyer_feedback,
//       speedio_assessment,
//       recommended_next_steps,
//       admin_notes,
//     } = body;

//     const report = await prisma.testDriveReport.update({
//       where: { testDriveRequestId },
//       data: {
//         ...(buyer_interest_level !== undefined && { buyer_interest_level }),
//         ...(buyer_feedback !== undefined && { buyer_feedback }),
//         ...(speedio_assessment !== undefined && { speedio_assessment }),
//         ...(recommended_next_steps !== undefined && { recommended_next_steps }),
//         ...(admin_notes !== undefined && { admin_notes }),
//       },
//       include: reportInclude,
//     });

//     return NextResponse.json({ success: true, report });
//   } catch (error) {
//     console.error("Failed to update test drive report", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }



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

    const existing = await prisma.testDriveReport.findUnique({
      where: { testDriveRequestId },
      include: reportInclude,
    });

    if (!existing) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      buyer_interest_level,
      buyer_feedback,
      speedio_assessment,
      recommended_next_steps,
      admin_notes,
    } = body;

    const report = await prisma.testDriveReport.update({
      where: { testDriveRequestId },
      data: {
        ...(buyer_interest_level !== undefined && { buyer_interest_level }),
        ...(buyer_feedback !== undefined && { buyer_feedback }),
        ...(speedio_assessment !== undefined && { speedio_assessment }),
        ...(recommended_next_steps !== undefined && { recommended_next_steps }),
        ...(admin_notes !== undefined && { admin_notes }),
      },
      include: reportInclude,
    });

    // ── Fetch the test drive request with vehicle ─────────────────────────────
    const testDriveRequest = await prisma.testDriveRequest.findUnique({
      where: { id: testDriveRequestId },
      include: {
        vehicle: true,
        user: true,
      },
    });

    if (testDriveRequest?.vehicle) {
      const vehicle = testDriveRequest.vehicle;
      const adminId = session.user.id;

      // ── Find managed sale request for this vehicle ────────────────────────
      const managedSaleRequest = vehicle.website_managed && vehicle.original_owner_id
        ? await prisma.managedSaleRequest.findFirst({
            where: { created_vehicle_id: vehicle.id },
            orderBy: { createdAt: "desc" },
          })
        : null;

      const originalOwnerId = vehicle.original_owner_id ?? null;

      if (originalOwnerId && managedSaleRequest) {
        const reportMessage =
          `📋 Test Drive Report - ${vehicle.title ?? "Vehicle"}\n\n` +
          `A potential buyer has completed their test drive of your vehicle. Here's our detailed assessment:\n\n` +
          `🎯 Buyer Interest Level: ${buyer_interest_level ?? existing.buyer_interest_level}\n\n` +
          `📝 Speedio's Assessment:\n${speedio_assessment ?? existing.speedio_assessment}\n\n` +
          `💬 Buyer's Feedback:\n${buyer_feedback ?? existing.buyer_feedback ?? "No specific feedback provided"}\n\n` +
          `🚀 Recommended Next Steps:\n${recommended_next_steps ?? existing.recommended_next_steps ?? "To be determined"}\n\n` +
          `📊 Test Drive Details:\n` +
          `• Date: ${testDriveRequest.confirmed_date ?? testDriveRequest.requested_date}\n` +
          `• Time: ${testDriveRequest.confirmed_time ?? testDriveRequest.requested_time}\n\n` +
          `🎉 We'll continue working with them on next steps and keep you informed.`;

        // ── Upsert conversation ───────────────────────────────────────────────
        const [user1Id, user2Id] = [adminId, originalOwnerId].sort();

        const conversation = await prisma.conversation.upsert({
          where: {
            user1Id_user2Id_vehicleId: {
              user1Id,
              user2Id,
              vehicleId: vehicle.id,
            },
          },
          create: {
            user1Id,
            user2Id,
            vehicleId: vehicle.id,
            last_message: reportMessage,
            last_message_at: new Date(),
            last_message_type: "system",
            user1_unread: user1Id === originalOwnerId ? 1 : 0,
            user2_unread: user2Id === originalOwnerId ? 1 : 0,
          },
          update: {
            last_message: reportMessage,
            last_message_at: new Date(),
            last_message_type: "system",
            user1_unread: user1Id === originalOwnerId ? { increment: 1 } : undefined,
            user2_unread: user2Id === originalOwnerId ? { increment: 1 } : undefined,
          },
        });

        // ── Send message to owner ─────────────────────────────────────────────
        await prisma.message.create({
          data: {
            senderId: adminId,
            recipientId: originalOwnerId,
            content: reportMessage,
            message_type: "system",
            vehicleId: vehicle.id,
            conversationId: conversation.id,
            read: false,
          },
        });

        // ── Notify owner ──────────────────────────────────────────────────────
        await prisma.notification.create({
          data: {
            recipientId: originalOwnerId,
            senderId: adminId,
            type: "test_drive_status_update",
            content: `Test drive report completed for your ${vehicle.title ?? "vehicle"}. Buyer shows ${(buyer_interest_level ?? existing.buyer_interest_level).replace(/_/g, " ")} interest.`,
            related_entity_type: "Vehicle",
            related_entity_id: vehicle.id,
            url: "/Messages",
            icon: "FileText",
            read: false,
          },
        });
      }

      // ── Also notify the buyer (test drive requester) if they have an account ─
      if (testDriveRequest.userId) {
        await prisma.notification.create({
          data: {
            recipientId: testDriveRequest.userId,
            senderId: adminId,
            type: "test_drive_status_update",
            content: `Your test drive report for ${vehicle.title ?? "the vehicle"} is ready.`,
            related_entity_type: "Vehicle",
            related_entity_id: vehicle.id,
            url: "/Messages",
            icon: "FileText",
            read: false,
          },
        });
      }
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("Failed to update test drive report", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
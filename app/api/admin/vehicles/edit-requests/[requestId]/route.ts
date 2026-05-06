import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { requireAdmin } from "@/app/api/_utils/admin";

const VALID_STATUSES = ["approved", "declined"] as const;
type ValidStatus = (typeof VALID_STATUSES)[number];

const VEHICLE_UPDATE_ALLOWLIST = new Set([
  "title",
  "make",
  "model",
  "year",
  "price",
  "mileage",
  "condition",
  "description",
  "location",
  "fuel_type",
  "transmission",
  "status",
  "primary_image",
  "primary_image_thumbnail",
  "primary_image_small",
  "primary_image_medium",
  "images",
  "images_thumbnails",
  "images_small",
  "images_medium",
  "featured",
  "verified",
]);

function pickAllowedVehicleChanges(requestedChanges: unknown) {
  if (!requestedChanges || typeof requestedChanges !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(requestedChanges as Record<string, unknown>)) {
    if (VEHICLE_UPDATE_ALLOWLIST.has(k)) out[k] = v;
  }
  return out;
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ requestId: string }> }
) {
  try {
    const gate = await requireAdmin();
    if (!gate.ok) return gate.response;
    const { userId: adminId } = gate;
    const { requestId } = await context.params;

    const body = (await req.json().catch(() => null)) as
      | null
      | { status?: string; admin_notes?: string; apply_changes?: boolean };

    if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

    const status = body.status as ValidStatus | undefined;
    const admin_notes = body.admin_notes;
    const apply_changes = body.apply_changes !== false; // default true on approve

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    if (admin_notes !== undefined && typeof admin_notes !== "string") {
      return NextResponse.json({ error: "admin_notes must be a string" }, { status: 400 });
    }

    if (status === "declined" && (!admin_notes || !admin_notes.trim())) {
      return NextResponse.json(
        { error: "admin_notes is required when declining" },
        { status: 400 }
      );
    }

    const existing = await prisma.vehicleEditRequest.findUnique({
      where: { id: requestId },
      include: { vehicle: { select: { id: true, title: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Edit request not found" }, { status: 404 });
    }

    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: `Edit request already processed (${existing.status})` },
        { status: 400 }
      );
    }

    const processedAt = new Date();
    const processedBy = adminId;

    const result = await prisma.$transaction(async (tx) => {
      let updatedVehicle: any = null;
      let changesWereApplied = false;

      if (status === "approved" && apply_changes) {
        const changes = pickAllowedVehicleChanges(existing.requested_changes);
        if (Object.keys(changes).length > 0) {
          updatedVehicle = await tx.vehicle.update({
            where: { id: existing.vehicleId },
            data: changes as any,
          });
          changesWereApplied = true;
        }
      }

      const updatedRequest = await tx.vehicleEditRequest.update({
        where: { id: existing.id },
        data: {
          status,
          admin_notes: admin_notes ?? null,
          processed_by_admin: processedBy,
          processed_at: processedAt,
        },
      });

      const vehicleTitle = existing.vehicle?.title ?? "your vehicle";
      const vehicleUrl = status === "approved" ? `/vehicle?id=${existing.vehicleId}` : `/dashboard?tab=listings`;

      await tx.notification.create({
        data: {
          recipientId: existing.requestedByUserId,
          senderId: adminId,
          type: status === "approved" ? "vehicle_edit_approved" : "vehicle_edit_declined",
          content:
            status === "approved"
              ? changesWereApplied
                ? `Your edit request for "${vehicleTitle}" has been approved and applied to the listing.`
                : `Your edit request for "${vehicleTitle}" has been approved.`
              : `Your edit request for "${vehicleTitle}" has been declined. Reason: ${admin_notes}`,
          related_entity_type: "vehicle",
          related_entity_id: existing.vehicleId,
          url: vehicleUrl,
          icon: status === "approved" ? "CheckCircle" : "XCircle",
          read: false,
        },
      });

      return { updatedRequest, updatedVehicle, changesWereApplied };
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    console.error("PUT /api/admin/vehicles/edit-requests/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


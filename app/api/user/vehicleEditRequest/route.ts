import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";
import { Prisma } from "@/lib/generated/prisma/client";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Use formData instead of json() because image is a File
    const formData = await request.formData();

    const vehicleId = formData.get("vehicleId") as string;
    const reason = formData.get("reason") as string;
    const requested_changes_raw = formData.get("requested_changes") as string;
    const imageFile = formData.get("primary_image") as File | null;

    // Validate required fields
    if (!vehicleId || !reason?.trim() || !requested_changes_raw) {
      return NextResponse.json(
        { error: "vehicleId, reason, and requested_changes are required" },
        { status: 400 }
      );
    }

    // Parse the JSON string sent as form field
    let requested_changes: Record<string, unknown>;
    try {
      requested_changes = JSON.parse(requested_changes_raw);
    } catch {
      return NextResponse.json(
        { error: "requested_changes must be valid JSON" },
        { status: 400 }
      );
    }

    if (typeof requested_changes !== "object" || Object.keys(requested_changes).length === 0) {
      return NextResponse.json(
        { error: "requested_changes must be a non-empty object" },
        { status: 400 }
      );
    }

    // Validate allowed fields
    const ALLOWED_FIELDS = ["title", "price", "description", "mileage", "condition", "location", "primary_image"];
    const invalidFields = Object.keys(requested_changes).filter(
      (key) => !ALLOWED_FIELDS.includes(key)
    );
    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields in requested_changes: ${invalidFields.join(", ")}` },
        { status: 400 }
      );
    }


    if (imageFile && imageFile.size > 0) {
      const { url } = await uploadFile(imageFile, "vehicles");
      requested_changes.primary_image = url;
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
    }

    const existingRequest = await prisma.vehicleEditRequest.findFirst({
      where: {
        vehicleId,
        requestedByUserId: session.user.id,
        status: "pending",
      },
    });
    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending edit request for this vehicle" },
        { status: 409 }
      );
    }

    const editRequest = await prisma.vehicleEditRequest.create({
      data: {
        vehicleId,
        requestedByUserId: session.user.id,
         requested_changes : requested_changes as Prisma.InputJsonValue,
        reason: reason.trim(),
      },
    });

    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          recipientId: admin.id,
          senderId: session.user.id,
          type: "vehicle_edit_request",
          content: `${session.user.full_name} requested edits for "${vehicle.title}". Changes: ${Object.keys(requested_changes).join(", ")}.`,
          related_entity_id: vehicleId,
          url: `/admin?tab=edit_requests`,
          icon: "Edit",
          read: false,
        })),
      });
    }

    return NextResponse.json({ success: true, editRequest }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vehicle edit request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
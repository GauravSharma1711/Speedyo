import prisma from "@/db/prisma";
import { normalizeImagesToNewFormat } from "./images";
import { calculateServiceFeeAmount, resolvePricingFromMsr } from "./pricing";
import { mapFuelType, mapTransmission, mapVehicleCondition } from "./maps";

const DASHBOARD_URL = "/dashboard";

type MsrFull = NonNullable<Awaited<ReturnType<typeof prisma.managedSaleRequest.findUnique>>>;

function ensureSubmitter(msr: MsrFull) {
  const sid = msr.submitted_by_user_id;
  if (!sid) throw new Error("NO_SUBMITTER");
  return sid;
}

function recurringFromMsr(msr: MsrFull): unknown[] {
  const access = msr.access_arrangements as Record<string, unknown> | null;
  const ra = access?.recurring_availability;
  return Array.isArray(ra) ? ra : [];
}

function buildVehicleData(
  msr: MsrFull,
  buyerPrice: number,
  recurringAvailability: unknown[],
  opts: { featured: boolean; status?: "available" | "sold" | "cancelled" }
) {
  const imgs = normalizeImagesToNewFormat(msr.vehicle_images as unknown[]);
  const year = msr.vehicle_year ?? new Date().getFullYear();

  const title =
    msr.vehicle_title?.trim() ||
    `${year} ${msr.vehicle_make ?? ""} ${msr.vehicle_model ?? ""}`.trim();

  if (!title || !(msr.vehicle_make && msr.vehicle_model)) {
    throw new Error("INCOMPLETE_VEHICLE");
  }

  return {
    title,
    make: msr.vehicle_make!,
    model: msr.vehicle_model!,
    year,
    mileage: msr.vehicle_mileage ?? 0,
    condition: mapVehicleCondition(msr.vehicle_condition),
    description: msr.vehicle_description ?? undefined,
    fuel_type: mapFuelType(msr.vehicle_fuel_type),
    transmission: mapTransmission(msr.vehicle_transmission),
    location: msr.vehicle_location ?? undefined,
    price: buyerPrice,
    website_managed: true,
    status: opts.status ?? "available",
    verified: true,
    featured: opts.featured,
    views: 0,
    authorId: msr.submitted_by_user_id ?? undefined,
    original_owner_id: msr.submitted_by_user_id ?? undefined,
    recurring_availability: recurringAvailability.length ? recurringAvailability : [],
    booked_slots: [],
    images: imgs.images,
    images_thumbnails: imgs.images_thumbnails,
    images_small: imgs.images_small,
    images_medium: imgs.images_medium,
    primary_image: imgs.images[0] ?? null,
    primary_image_thumbnail: imgs.images_thumbnails[0] ?? null,
    primary_image_small: imgs.images_small[0] ?? null,
    primary_image_medium: imgs.images_medium[0] ?? null,
  };
}

/** POST approve-list parity: create vehicle + MSR listed + fee fields + notifications. */
export async function workflowApproveAndList(
  requestId: string,
  adminId: string,
  body?: { adminNotes?: string | null; userFacingNotes?: string | null }
) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  if (msr.created_vehicle_id) throw new Error("ALREADY_LISTED");

  const submitter = ensureSubmitter(msr);

  const pricing = resolvePricingFromMsr(msr);
  if (!pricing) throw new Error("PRICING");

  const recurring = recurringFromMsr(msr);
  const vehicleData = buildVehicleData(msr, pricing.buyerPrice, recurring, { featured: true });

  return prisma.$transaction(async (tx) => {
    const vehicle = await tx.vehicle.create({ data: vehicleData as any });

    const imgs = normalizeImagesToNewFormat(msr.vehicle_images as unknown[]);

    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: {
        status: "listed",
        created_vehicle_id: vehicle.id,
        final_sale_price_for_buyer: pricing.buyerPrice,
        owner_receives_amount: pricing.ownerReceives,
        service_fee_amount: pricing.serviceFee,
        admin_notes:
          body?.adminNotes ??
          `Approved by admin. Vehicle listed with ID: ${vehicle.id}`,
        user_facing_notes:
          body?.userFacingNotes ?? "Your managed sale request has been approved and your vehicle is now listed!",
        vehicle_images: imgs.images,
        vehicle_images_thumbnails: imgs.images_thumbnails,
        vehicle_images_small: imgs.images_small,
        vehicle_images_medium: imgs.images_medium,
      },
    });

     const messageContent = 
      `🎉 Great news! Your managed sale request for "${vehicle.title}" has been approved by our team.\n\n` +
      `Your vehicle is now live on Speedio with the following details:\n` +
      `• Listed Price (Buyer Pays): $${pricing.buyerPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n` +
      `• You Will Receive: $${pricing.ownerReceives.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n` +
      `• Service Fee: $${pricing.serviceFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n` +
      `• Status: Available for test drives\n` +
      `• Managed by: Speedyo Team\n\n` +
      `We've set up test drive availability based on your access arrangements. Potential buyers can now schedule test drives, and we'll coordinate everything for you.\n\n` +
      `You can view your live listing anytime from your dashboard. We'll keep you updated on any test drive requests and buyer interest.\n\n` +
      `Thank you for choosing Speedyo's managed sales service! 🚗`;

        const [user1Id, user2Id] = [adminId, submitter].sort();


 const conversation = await tx.conversation.upsert({
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
        last_message: messageContent,
        last_message_at: new Date(),
        last_message_type: "system",
        // user1 is admin (sender), so the submitter's unread count = 1
        user1_unread: user1Id === submitter ? 1 : 0,
        user2_unread: user2Id === submitter ? 1 : 0,
      },
      update: {
        last_message: messageContent,
        last_message_at: new Date(),
        last_message_type: "system",
        // Increment the submitter's unread count on the correct side
        user1_unread: user1Id === submitter ? { increment: 1 } : undefined,
        user2_unread: user2Id === submitter ? { increment: 1 } : undefined,
      },
    });

    
    await tx.message.create({
      data: {
        senderId: adminId,
        recipientId: submitter,
        content: messageContent,
        message_type: "system",
        managedSaleRequestId: requestId,
        vehicleId: vehicle.id,
        conversationId: conversation.id,
        read: false,
      },
    });

    // const sorted = [adminId, submitter].sort().join("_");
    // const conversationId = `msr_${requestId}_${sorted}`;

    // await tx.message.create({
    //   data: {
    //     senderId: adminId,
    //     recipientId: submitter,
    //     content: `🎉 Great news! Your managed sale request for "${vehicle.title}" has been approved by our team.\n\nYour vehicle is now live on Speedio with the following details:\n• Listed Price (Buyer Pays): $${pricing.buyerPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• You Will Receive: $${pricing.ownerReceives.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• Service Fee: $${pricing.serviceFee.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• Status: Available for test drives\n• Managed by: Speedyo Team\n\nWe've set up test drive availability based on your access arrangements. Potential buyers can now schedule test drives, and we'll coordinate everything for you.\n\nYou can view your live listing anytime from your dashboard. We'll keep you updated on any test drive requests and buyer interest.\n\nThank you for choosing Speedyo's managed sales service! 🚗`,
    //     message_type: "system",
    //     managedSaleRequestId: requestId,
    //     vehicleId: vehicle.id,
    //     conversationId: conversationId,
    //     read: false,
    //   },
    // });

    await tx.notification.create({
      data: {
        recipientId: submitter,
        senderId: adminId,
        type: "managed_sale_status",
        content: `Great news! Your managed sale request for "${vehicle.title}" has been approved and is now live on the marketplace at $${pricing.buyerPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}. You'll receive $${pricing.ownerReceives.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} when it sells.`,
        related_entity_type: "Vehicle",
        related_entity_id: vehicle.id,
        url: `/vehicle?id=${vehicle.id}`,
        icon: "CheckCircle",
        read: false,
      },
    });

    return { vehicle, managedSaleRequest: updated };
  });
}


export async function workflowPatchStatus(
  requestId: string,
  adminId: string,
  body: {
    status: string;
    userFacingNotes?: string | null;
    adminNotes?: string | null;
    recurringAvailability?: unknown;
    recurring_availability?: unknown;
  }
) {
  const raw = body.status.trim();
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  const submitter = msr.submitted_by_user_id;

  const recurringSlots = Array.isArray(body.recurringAvailability)
    ? body.recurringAvailability
    : Array.isArray(body.recurring_availability)
      ? body.recurring_availability
      : recurringFromMsr(msr);

  if (raw === "approved") {
    const pricing = resolvePricingFromMsr(msr);
    if (!pricing) throw new Error("PRICING");
    if (!submitter) throw new Error("NO_SUBMITTER");

    const vehicleData = buildVehicleData(msr, pricing.buyerPrice, recurringSlots, {
      featured: false,
    });

    return prisma.$transaction(async (tx) => {
      let vehicleId = msr.created_vehicle_id;
      if (vehicleId) {
        await tx.vehicle.update({
          where: { id: vehicleId },
          data: vehicleData as any,
        });
      } else {
        const v = await tx.vehicle.create({ data: vehicleData as any });
        vehicleId = v.id;
      }

      const imgs = normalizeImagesToNewFormat(msr.vehicle_images as unknown[]);

      const updated = await tx.managedSaleRequest.update({
        where: { id: requestId },
        data: {
          status: "listed",
          created_vehicle_id: vehicleId,
          final_sale_price_for_buyer: pricing.buyerPrice,
          owner_receives_amount: pricing.ownerReceives,
          service_fee_amount: pricing.serviceFee,
          admin_notes: body.adminNotes ?? body.userFacingNotes ?? undefined,
          user_facing_notes:
            body.userFacingNotes ??
            "Your managed sale request has been approved and listed with test drive availability!",
          vehicle_images: imgs.images,
          vehicle_images_thumbnails: imgs.images_thumbnails,
          vehicle_images_small: imgs.images_small,
          vehicle_images_medium: imgs.images_medium,
        },
      });

      let vTitle = updated.vehicle_title ?? "your vehicle";
      await tx.message.create({
        data: {
          senderId: adminId,
          recipientId: submitter,
          content: `🎉 Great news! Your managed sale request for "${vTitle}" has been approved by our team.\n\nYour vehicle is now live on Speedio with the following details:\n• Listed Price: $${pricing.buyerPrice.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}\n• Status: Available for test drives\n• Managed by: Speedyo Team\n\nWe've set up test drive availability based on your access arrangements.\n\nThank you for choosing Speedyo's managed sales service! 🚗`,
          message_type: "system",
          managedSaleRequestId: requestId,
          vehicleId: vehicleId!,
          conversation_id: `managed_sale_${requestId}`,
          read: false,
        },
      });

      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your managed sale for '${vTitle}' has been approved and listed with test drive availability!`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "CheckCircle",
          read: false,
        },
      });

      return updated;
    });
  }

  if (raw === "declined") {
    if (!submitter) throw new Error("NO_SUBMITTER");
    const notes = body.userFacingNotes ?? "No reason provided.";
    const vTitle = msr.vehicle_title ?? "your request";

    return prisma.$transaction(async (tx) => {
      const updated = await tx.managedSaleRequest.update({
        where: { id: requestId },
        data: {
          status: "declined",
          admin_notes: body.adminNotes ?? notes,
          user_facing_notes: notes,
        },
      });

      await tx.message.create({
        data: {
          senderId: adminId,
          recipientId: submitter,
          content: `Regarding your managed sale request for "${vTitle}", it has been declined. Reason: ${notes} Please check your dashboard for more details.`,
          message_type: "system",
          managedSaleRequestId: requestId,
          conversation_id: `managed_sale_${requestId}`,
          read: false,
        },
      });

      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your managed sale for '${vTitle}' was declined. Reason: ${notes}`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "XCircle",
          read: false,
        },
      });

      return updated;
    });
  }

  if (raw === "sold") {
    return workflowMarkSold(requestId, adminId);
  }

  const allowed = new Set([
    "pending_initial_review",
    "pending_review",
    "approved",
    "declined",
    "listed",
    "sold",
    "cancelled",
    "cancellation_requested",
    "edit_requested",
  ]);
  if (!allowed.has(raw)) throw new Error("BAD_STATUS");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: {
        status: raw as any,
        ...(body.userFacingNotes !== undefined && { user_facing_notes: body.userFacingNotes }),
        ...(body.adminNotes !== undefined && { admin_notes: body.adminNotes }),
      },
    });

    if (submitter) {
      const vTitle = msr.vehicle_title ?? "your vehicle";
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your managed sale for '${vTitle}' status changed to '${raw.replace(/_/g, " ")}'.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "Bell",
          read: false,
        },
      });
    }

    return updated;
  });
}

export async function workflowMarkSold(requestId: string, adminId: string) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  if (!msr.created_vehicle_id) throw new Error("NO_VEHICLE");
  const submitter = msr.submitted_by_user_id;
  const vTitle = msr.vehicle_title ?? "your vehicle";

  return prisma.$transaction(async (tx) => {
    await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: { status: "sold" },
    });
    await tx.vehicle.update({
      where: { id: msr.created_vehicle_id! },
      data: { status: "sold" },
    });

    if (submitter) {
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Congratulations! Your vehicle, "${vTitle}", has been sold.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "DollarSign",
          read: false,
        },
      });
    }

    return tx.managedSaleRequest.findUnique({ where: { id: requestId } });
  });
}

export async function workflowApproveCancellation(requestId: string, adminId: string) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  const submitter = msr.submitted_by_user_id;
  const vTitle = msr.vehicle_title ?? "your listing";

  return prisma.$transaction(async (tx) => {
    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: {
        status: "cancelled",
        user_facing_notes: "Your cancellation request has been approved. The listing has been removed.",
      },
    });

    if (msr.created_vehicle_id) {
      await tx.vehicle.update({
        where: { id: msr.created_vehicle_id },
        data: { status: "cancelled" },
      });
    }

    if (submitter) {
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your cancellation request for '${vTitle}' has been approved. The listing has been removed from the marketplace.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "CheckCircle",
          read: false,
        },
      });
    }

    return updated;
  });
}

export async function workflowDeclineCancellation(
  requestId: string,
  adminId: string,
  reason: string
) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  const submitter = msr.submitted_by_user_id;
  const vTitle = msr.vehicle_title ?? "your listing";
  const previousStatus = msr.created_vehicle_id ? "listed" : "approved";

  return prisma.$transaction(async (tx) => {
    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: {
        status: previousStatus as any,
        user_facing_notes: `Your cancellation request has been declined. Reason: ${reason}`,
      },
    });

    if (submitter) {
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your cancellation request for '${vTitle}' has been declined. Reason: ${reason}`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "XCircle",
          read: false,
        },
      });
    }

    return updated;
  });
}

function vehicleDetailsPatchToUpdates(vd: Record<string, unknown>) {
  const u: Record<string, unknown> = {};
  if (vd.title !== undefined) u.vehicle_title = vd.title as string | null | undefined;
  if (vd.make !== undefined) u.vehicle_make = vd.make as string | null | undefined;
  if (vd.model !== undefined) u.vehicle_model = vd.model as string | null | undefined;
  if (vd.year !== undefined) u.vehicle_year = Number(vd.year);
  if (vd.mileage !== undefined) u.vehicle_mileage = Number(vd.mileage);
  if (vd.condition !== undefined) u.vehicle_condition = vd.condition ? String(vd.condition) : null;
  if (vd.description !== undefined) u.vehicle_description = vd.description ? String(vd.description) : null;
  if (vd.fuel_type !== undefined) u.vehicle_fuel_type = vd.fuel_type ? String(vd.fuel_type) : null;
  if (vd.transmission !== undefined) {
    u.vehicle_transmission = vd.transmission ? String(vd.transmission) : null;
  }
  if (vd.location !== undefined) u.vehicle_location = vd.location ? String(vd.location) : null;
  if (vd.seller_asking_price !== undefined) {
    const p = Number(vd.seller_asking_price);
    if (!Number.isNaN(p)) u.seller_asking_price = p;
  }

  if (vd.images !== undefined && Array.isArray(vd.images)) {
    const n = normalizeImagesToNewFormat(vd.images);
    u.vehicle_images = n.images;
    u.vehicle_images_thumbnails = n.images_thumbnails;
    u.vehicle_images_small = n.images_small;
    u.vehicle_images_medium = n.images_medium;
  }

  return u;
}

function vehiclePatchForListing(vd: Record<string, unknown>, buyerPrice?: number) {
  const vu: Record<string, unknown> = {};
  if (vd.title !== undefined) vu.title = vd.title as string | undefined | null;
  if (vd.make !== undefined) vu.make = vd.make as string | undefined | null;
  if (vd.model !== undefined) vu.model = vd.model as string | undefined | null;
  if (vd.year !== undefined) vu.year = Number(vd.year);
  if (vd.mileage !== undefined) vu.mileage = Number(vd.mileage);
  if (vd.condition !== undefined) vu.condition = mapVehicleCondition(vd.condition);
  if (vd.description !== undefined) vu.description = vd.description ?? null;
  if (vd.fuel_type !== undefined) vu.fuel_type = mapFuelType(vd.fuel_type);
  if (vd.transmission !== undefined) vu.transmission = mapTransmission(vd.transmission);
  if (vd.location !== undefined) vu.location = vd.location ?? null;
  if (buyerPrice !== undefined) vu.price = buyerPrice;
  if (vd.images !== undefined && Array.isArray(vd.images)) {
    const n = normalizeImagesToNewFormat(vd.images);
    vu.images = n.images;
    vu.images_thumbnails = n.images_thumbnails;
    vu.images_small = n.images_small;
    vu.images_medium = n.images_medium;
    vu.primary_image = n.images[0] ?? null;
    vu.primary_image_thumbnail = n.images_thumbnails[0] ?? null;
    vu.primary_image_small = n.images_small[0] ?? null;
    vu.primary_image_medium = n.images_medium[0] ?? null;
  }
  return vu;
}

export async function workflowApproveEditRequest(
  requestId: string,
  adminId: string,
  index: number,
  body?: { adminNotes?: string | null }
) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  const edits = Array.isArray(msr.edit_requests) ? ([...msr.edit_requests] as any[]) : [];
  const edit = edits[index];
  if (!edit || typeof edit !== "object") throw new Error("BAD_INDEX");

  const rc = edit.requested_changes ?? {};
  const vehicleChanges = (rc.vehicle_details ?? {}) as Record<string, unknown>;
  const accessChanges = (rc.access_arrangements ?? {}) as Record<string, unknown>;

  const msrPatches = vehicleDetailsPatchToUpdates(vehicleChanges);
  let nextAccess =
    typeof msr.access_arrangements === "object" && msr.access_arrangements
      ? ({ ...(msr.access_arrangements as object) } as Record<string, unknown>)
      : {};
  Object.assign(nextAccess, accessChanges);

  if (vehicleChanges.seller_asking_price !== undefined) {
    const ask = Number(vehicleChanges.seller_asking_price);
    if (!Number.isNaN(ask) && ask > 0) {
      const sf = calculateServiceFeeAmount(ask);
      msrPatches.owner_receives_amount = ask;
      msrPatches.service_fee_amount = sf;
      msrPatches.final_sale_price_for_buyer = ask + sf;
    }
  }

  edits[index] = {
    ...edit,
    status: "approved",
    admin_notes: body?.adminNotes ?? "Edit request approved",
    processed_at: new Date().toISOString(),
  };

  msrPatches.edit_requests = edits;
  msrPatches.access_arrangements = nextAccess;

  msrPatches.status = msr.created_vehicle_id ? "listed" : "approved";
  msrPatches.user_facing_notes = `Your edit request has been approved and applied. ${body?.adminNotes ?? ""}`;

  const imgs = normalizeImagesToNewFormat(
    Array.isArray(vehicleChanges.images) ? (vehicleChanges.images as unknown[]) : (msr.vehicle_images as unknown[])
  );
  if (imgs.images.length || vehicleChanges.images) {
    msrPatches.vehicle_images = imgs.images;
    msrPatches.vehicle_images_thumbnails = imgs.images_thumbnails;
    msrPatches.vehicle_images_small = imgs.images_small;
    msrPatches.vehicle_images_medium = imgs.images_medium;
  }

  const buyerForPatch =
    msrPatches.final_sale_price_for_buyer !== undefined
      ? Number(msrPatches.final_sale_price_for_buyer)
      : msr.final_sale_price_for_buyer != null
        ? Number(msr.final_sale_price_for_buyer)
        : undefined;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: msrPatches as any,
    });

    if (updated.created_vehicle_id) {
      const bp =
        !Number.isNaN(Number(buyerForPatch ?? NaN)) && buyerForPatch != null ? buyerForPatch : undefined;

      const vu = vehiclePatchForListing(vehicleChanges, bp ?? (updated.final_sale_price_for_buyer != null ? Number(updated.final_sale_price_for_buyer) : undefined));

      if (accessChanges.recurring_availability !== undefined) {
        vu.recurring_availability = accessChanges.recurring_availability;
      }
      if (Object.keys(vu).length > 0) {
        await tx.vehicle.update({
          where: { id: updated.created_vehicle_id! },
          data: vu as any,
        });
      }
    }

    const submitter = updated.submitted_by_user_id;
    if (submitter) {
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your edit request for '${updated.vehicle_title ?? "your listing"}' has been approved and applied. ${body?.adminNotes ? `Note: ${body.adminNotes}` : ""}`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "CheckCircle",
          read: false,
        },
      });
    }

    return updated;
  });
}

export async function workflowDeclineEditRequest(
  requestId: string,
  adminId: string,
  index: number,
  reason: string
) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");
  const edits = Array.isArray(msr.edit_requests) ? ([...msr.edit_requests] as any[]) : [];
  const edit = edits[index];
  if (!edit || typeof edit !== "object") throw new Error("BAD_INDEX");

  edits[index] = {
    ...edit,
    status: "declined",
    admin_notes: reason || "Edit request declined",
    processed_at: new Date().toISOString(),
  };

  const revertStatus = msr.created_vehicle_id ? "listed" : "approved";

  return prisma.$transaction(async (tx) => {
    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: {
        edit_requests: edits as any,
        status: revertStatus as any,
        user_facing_notes: `Your edit request has been declined. Reason: ${reason}`,
      },
    });

    const submitter = updated.submitted_by_user_id;
    if (submitter) {
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your edit request for '${updated.vehicle_title ?? "your listing"}' was declined. Reason: ${reason}`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "XCircle",
          read: false,
        },
      });
    }

    return updated;
  });
}

/** Direct admin PATCH (modal save): flat MSR scalars + recalc fees when asking price changes. */
export async function workflowAdminPatchMsr(
  requestId: string,
  adminId: string,
  body: Record<string, unknown>
) {
  const skipUserNotify =
    body.suppress_notification === true || body.suppressNotification === true;

  const forbid = new Set([
    "id",
    "createdAt",
    "updatedAt",
    "created_vehicle_id",
    "submitted_by_user_id",
    "createdVehicle",
    "submittedByUser",
    "messages",
    "inspectionChecklists",
    "suppress_notification",
    "suppressNotification",
  ]);

  const msrBefore = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msrBefore) throw new Error("NOT_FOUND");

  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (forbid.has(k)) continue;
    data[k] = v;
  }

  const asking =
    typeof data.seller_asking_price === "number"
      ? data.seller_asking_price
      : data.seller_asking_price !== undefined
        ? Number(data.seller_asking_price)
        : undefined;

  if (asking !== undefined && !Number.isNaN(asking) && asking >= 0) {
    const serviceFee = calculateServiceFeeAmount(asking);
    data.owner_receives_amount = asking;
    data.service_fee_amount = serviceFee;
    data.final_sale_price_for_buyer = asking + serviceFee;
  }

  const vi = body.vehicle_images;
  if (vi !== undefined && Array.isArray(vi)) {
    const n = normalizeImagesToNewFormat(vi);
    data.vehicle_images = n.images;
    data.vehicle_images_thumbnails = n.images_thumbnails;
    data.vehicle_images_small = n.images_small;
    data.vehicle_images_medium = n.images_medium;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("EMPTY_PATCH");
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: data as any,
    });

    if (updated.created_vehicle_id && (Object.keys(data).length || asking !== undefined || vi !== undefined)) {
      const vd: Record<string, unknown> = {
        title: data.vehicle_title,
        make: data.vehicle_make,
        model: data.vehicle_model,
        year: data.vehicle_year,
        mileage: data.vehicle_mileage,
        condition: mapVehicleCondition(data.vehicle_condition),
        description: data.vehicle_description,
        fuel_type: mapFuelType(data.vehicle_fuel_type),
        transmission: mapTransmission(data.vehicle_transmission),
        location: data.vehicle_location,
      };

      Object.keys(vd).forEach((k) => {
        if (vd[k] === undefined) delete vd[k];
      });

      const buyer =
        typeof data.final_sale_price_for_buyer === "number"
          ? data.final_sale_price_for_buyer
          : updated.final_sale_price_for_buyer != null
            ? Number(updated.final_sale_price_for_buyer)
            : undefined;

      const vu = vehiclePatchForListing(
        vd,
        buyer !== undefined && !Number.isNaN(buyer) ? buyer : undefined
      );

      if (
        typeof data.access_arrangements === "object" &&
        data.access_arrangements &&
        (data.access_arrangements as Record<string, unknown>).recurring_availability !== undefined
      ) {
        vu.recurring_availability =
          (data.access_arrangements as Record<string, unknown>).recurring_availability ?? [];
      } else if (body.access_arrangements && typeof body.access_arrangements === "object") {
        const aa = body.access_arrangements as Record<string, unknown>;
        if (aa.recurring_availability !== undefined) vu.recurring_availability = aa.recurring_availability;
      }

      if (typeof vi !== "undefined" && Array.isArray(vi)) {
        Object.assign(vu, vehiclePatchForListing({ images: vi }, vu.price as number | undefined));
      }

      if (Object.keys(vu).length > 0 && updated.created_vehicle_id) {
        await tx.vehicle.update({
          where: { id: updated.created_vehicle_id },
          data: vu as any,
        });
      }
    }

    const submitter = msrBefore.submitted_by_user_id;
    if (!skipUserNotify && submitter && adminId) {
      const prev = String(msrBefore.status);
      const next = String(updated.status);
      const vt = updated.vehicle_title ?? "your listing";
      const isInitialCompleted =
        prev === "pending_initial_review" && next === "pending_review";

      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: isInitialCompleted
            ? `✅ Great news! We've completed the details for your "${vt}" listing. Our team is now reviewing it for final approval.`
            : `Your managed sale request for "${vt}" has been updated by our team.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: isInitialCompleted ? "CheckCircle" : "Edit",
          read: false,
        },
      });
    }

    return updated;
  });
}

export async function workflowDeleteMsr(
  requestId: string,
  adminId: string,
  opts: { deleteVehicle: boolean }
) {
  const msr = await prisma.managedSaleRequest.findUnique({ where: { id: requestId } });
  if (!msr) throw new Error("NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    const linkedVehicleId = msr.created_vehicle_id;
    const submitter = msr.submitted_by_user_id;
    const vTitle = msr.vehicle_title ?? "your request";

    await tx.message.deleteMany({ where: { managedSaleRequestId: requestId } });
    await tx.vehicleInspectionChecklist.updateMany({
      where: { managedSaleRequestId: requestId },
      data: { managedSaleRequestId: null },
    });

    await tx.managedSaleRequest.delete({ where: { id: requestId } });

    if (opts.deleteVehicle && linkedVehicleId) {
      await tx.vehicle.delete({ where: { id: linkedVehicleId } });
    }

    if (submitter && adminId) {
      await tx.notification.create({
        data: {
          recipientId: submitter,
          senderId: adminId,
          type: "managed_sale_status",
          content: `Your managed sale request for "${vTitle}" has been removed by an administrator.`,
          related_entity_type: "ManagedSaleRequest",
          related_entity_id: requestId,
          url: DASHBOARD_URL,
          icon: "XCircle",
          read: false,
        },
      });
    }

    return { deleted: true as const };
  });
}

export async function workflowUpdateAvailability(
  requestId: string,
  recurringAvailability: unknown[]
) {
  return prisma.$transaction(async (tx) => {
    const msr = await tx.managedSaleRequest.findUnique({ where: { id: requestId } });
    if (!msr) throw new Error("NOT_FOUND");

    const access =
      typeof msr.access_arrangements === "object" && msr.access_arrangements
        ? ({ ...(msr.access_arrangements as object) } as Record<string, unknown>)
        : {};
    access.recurring_availability = recurringAvailability;

    await tx.managedSaleRequest.update({
      where: { id: requestId },
      data: { access_arrangements: access as any },
    });

    if (msr.created_vehicle_id) {
      await tx.vehicle.update({
        where: { id: msr.created_vehicle_id },
        data: { recurring_availability: recurringAvailability as any },
      });
    }

    return tx.managedSaleRequest.findUnique({ where: { id: requestId } });
  });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/app/api/_utils/admin";
import prisma from "@/db/prisma";
import { workflowAdminPatchMsr, workflowDeleteMsr } from "@/lib/managed-sales/workflows";
import { managedSaleWorkflowResponse } from "@/app/api/_utils/workflow-error";
import { uploadFile } from "@/lib/storage/uploadFile";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;

    const request = await prisma.managedSaleRequest.findUnique({
      where: { id },
      include: {
        submittedByUser: {
          select: {
            id: true,
            email: true,
            full_name: true,
            profile_image: true,
            phone: true,
            user_type: true,
          },
        },
        createdVehicle: {
          select: {
            id: true,
            title: true,
            status: true,
            price: true,
            recurring_availability: true,
            booked_slots: true,
            primary_image: true,
          },
        },
        inspectionChecklists: {
          select: {
            id: true,
            createdAt: true,
            date_of_inspection: true,
            inspector_name: true,
            dealership_name: true,
            managedSaleRequestId: true,
            vehicle_info: true,
            overall_condition: true,
            recommended_sale_price: true,
          },
        },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Managed sale request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, request }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/managed-sale-requests/[id] failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
//   try {
//     const admin = await requireAdmin();
//     if (!admin.ok) return admin.response;

//     const { id } = await ctx.params;

//     const contentType = req.headers.get("content-type") || "";
//     let body: Record<string, unknown> = {};

//     if (contentType.includes("application/json")) {
//       body = await req.json();
//     } else {
//       const formData = await req.formData();
//       for (const [key, value] of formData.entries()) {
//         if (typeof value === "string") {
//           if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
//             try {
//               body[key] = JSON.parse(value);
//             } catch {
//               body[key] = value;
//             }
//           } else {
//             body[key] = value;
//           }
//         }
//       }
//     }

//     const numericIntFields = ["vehicle_year", "vehicle_mileage", "doors", "seating_capacity"];
//     const numericDecimalFields = ["seller_asking_price", "service_fee_amount", "owner_receives_amount", "final_sale_price_for_buyer"];

//     for (const field of numericIntFields) {
//       if (body[field] !== undefined && body[field] !== "") {
//         body[field] = parseInt(String(body[field]), 10);
//       }
//     }

//     for (const field of numericDecimalFields) {
//       if (body[field] !== undefined && body[field] !== "") {
//         body[field] = parseFloat(String(body[field]));
//       }
//     }

//     // Handle vehicle_images upload
//     const imageFiles = formData.getAll("vehicle_images") as File[];
//     const uploadedUrls: string[] = [];

//     for (const file of imageFiles) {
//       if (!(file instanceof File) || file.size === 0) continue;

//       if (!file.type.startsWith("image/"))
//         return NextResponse.json({ error: "All vehicle_images must be image files" }, { status: 400 });

//       if (file.size > 10 * 1024 * 1024)
//         return NextResponse.json({ error: "Each image must be smaller than 10MB" }, { status: 400 });

//       const { url } = await uploadFile(file, "managed-sales");
//       uploadedUrls.push(url);
//     }

//     const existingUrls: string[] = Array.isArray(body.vehicle_images)
//       ? (body.vehicle_images as string[]).filter((v) => typeof v === "string")
//       : [];

//     if (uploadedUrls.length > 0 || existingUrls.length > 0) {
//       body.vehicle_images = [...existingUrls, ...uploadedUrls];
//     }

//     if (!body.vehicle_images) delete body.vehicle_images;

//     if (Object.keys(body).length === 0)
//       return NextResponse.json({ error: "Empty body" }, { status: 400 });

//     const updated = await workflowAdminPatchMsr(id, admin.userId, body);
//     return NextResponse.json({ success: true, request: updated }, { status: 200 });
//   } catch (error) {
//     return managedSaleWorkflowResponse(error);
//   }
// }

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;

    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, unknown> = {};
    let formData: FormData | null = null;

    if (contentType.includes("application/json")) {
      const raw = await req.json();

      // Flatten nested frontend payload into DB-level fields
      const contact = raw.requester_contact_info || {};
      const vehicle = raw.vehicle_details || {};
      const access = raw.access_arrangements || {};

      // If the payload is nested (from RequestForm), flatten it
      if (raw.requester_contact_info || raw.vehicle_details || raw.access_arrangements) {
        body = {
          // Contact
          contact_full_name: contact.full_name || undefined,
          contact_email: contact.email || undefined,
          contact_phone: contact.phone || undefined,

          // Status & pricing (top-level in payload)
          status: raw.status || undefined,
          terms_agreed: raw.terms_agreed ?? undefined,
          service_fee_amount: raw.service_fee_amount || undefined,
          owner_receives_amount: raw.owner_receives_amount || undefined,
          final_sale_price_for_buyer: raw.final_sale_price_for_buyer || undefined,

          // Vehicle basic
          vehicle_title: vehicle.title || undefined,
          vehicle_make: vehicle.make || undefined,
          vehicle_model: vehicle.model || undefined,
          vehicle_year: vehicle.year || undefined,
          vehicle_mileage: vehicle.mileage !== "" ? vehicle.mileage : undefined,
          vehicle_condition: vehicle.condition || undefined,
          vehicle_description: vehicle.description || undefined,
          vehicle_fuel_type: vehicle.fuel_type || undefined,
          vehicle_transmission: vehicle.transmission || undefined,
          vehicle_location: vehicle.location || undefined,
          seller_asking_price: vehicle.seller_asking_price || undefined,

          // Financing & warranty
          financing_available: vehicle.financing_available || undefined,
          warranty_available: vehicle.warranty_available || undefined,
          warranty_link: vehicle.warranty_link || undefined,

          // Images
          vehicle_images: vehicle.images || undefined,
          vehicle_images_thumbnails: vehicle.images_thumbnails || undefined,
          vehicle_images_small: vehicle.images_small || undefined,
          vehicle_images_medium: vehicle.images_medium || undefined,

          // Specs
          drive_type: vehicle.drive_type || undefined,
          engine_size: vehicle.engine_size || undefined,
          body_type: vehicle.body_type || undefined,
          exterior_color: vehicle.exterior_color || undefined,
          interior_color: vehicle.interior_color || undefined,
          doors: vehicle.doors || undefined,
          seating_capacity: vehicle.seating_capacity || undefined,
          steering_wheel: vehicle.steering_wheel || undefined,

          // Registration
          current_plate_type: vehicle.current_plate_type || undefined,
          shaken_valid_until: vehicle.shaken_valid_until || undefined,
          road_tax_paid: vehicle.road_tax_paid || undefined,
          jci_insurance_valid_until: vehicle.jci_insurance_valid_until || undefined,
          title_type: vehicle.title_type || undefined,
          registration_location: vehicle.registration_location || undefined,

          // Performance
          engine_type: vehicle.engine_type || undefined,
          power_output: vehicle.power_output || undefined,
          fuel_efficiency: vehicle.fuel_efficiency || undefined,
          drivetrain: vehicle.drivetrain || undefined,
          suspension_type: vehicle.suspension_type || undefined,
          brakes: vehicle.brakes || undefined,
          tire_condition: vehicle.tire_condition || undefined,
          battery_condition: vehicle.battery_condition || undefined,
          hybrid_system_status: vehicle.hybrid_system_status || undefined,
          maintenance_history: vehicle.maintenance_history || undefined,

          // Exterior features
          power_sliding_doors: vehicle.power_sliding_doors || undefined,
          headlights: vehicle.headlights || undefined,
          fog_lights: vehicle.fog_lights || undefined,
          alloy_wheels: vehicle.alloy_wheels ?? undefined,
          spoiler: vehicle.spoiler ?? undefined,
          tinted_windows: vehicle.tinted_windows ?? undefined,
          roof_type: vehicle.roof_type || undefined,
          side_mirrors: vehicle.side_mirrors || undefined,
          keyless_entry: vehicle.keyless_entry ?? undefined,
          remote_door_locking: vehicle.remote_door_locking ?? undefined,
          body_condition: vehicle.body_condition || undefined,

          // Interior
          air_conditioning: vehicle.air_conditioning || undefined,
          upholstery: vehicle.upholstery || undefined,
          seat_type: vehicle.seat_type || undefined,
          seat_adjustments: vehicle.seat_adjustments || undefined,
          navigation_system: vehicle.navigation_system || undefined,
          rear_camera: vehicle.rear_camera ?? undefined,
          parking_sensors: vehicle.parking_sensors || undefined,
          power_windows: vehicle.power_windows || undefined,
          interior_lighting: vehicle.interior_lighting || undefined,
          cup_holders_storage: vehicle.cup_holders_storage ?? undefined,
          child_lock_isofix: vehicle.child_lock_isofix ?? undefined,

          // Arrays
          infotainment_system: vehicle.infotainment_system || undefined,
          steering_wheel_controls: vehicle.steering_wheel_controls || undefined,
          airbags: vehicle.airbags || undefined,

          // Safety
          abs: vehicle.abs ?? undefined,
          esc_stability_control: vehicle.esc_stability_control ?? undefined,
          lane_departure_warning: vehicle.lane_departure_warning ?? undefined,
          collision_mitigation: vehicle.collision_mitigation ?? undefined,
          cruise_control: vehicle.cruise_control || undefined,
          traction_control: vehicle.traction_control ?? undefined,
          hill_start_assist: vehicle.hill_start_assist ?? undefined,
          immobilizer_alarm: vehicle.immobilizer_alarm ?? undefined,
          seat_belt_sensors: vehicle.seat_belt_sensors ?? undefined,

          // Tech
          bluetooth: vehicle.bluetooth ?? undefined,
          usb_ports: vehicle.usb_ports ?? undefined,
          twelve_v_outlet: vehicle.twelve_v_outlet ?? undefined,
          smart_key_push_start: vehicle.smart_key_push_start ?? undefined,
          display_screen_size: vehicle.display_screen_size || undefined,
          rear_entertainment_system: vehicle.rear_entertainment_system ?? undefined,
          voice_command_hands_free: vehicle.voice_command_hands_free ?? undefined,
          digital_dashboard_display: vehicle.digital_dashboard_display ?? undefined,

          // Access arrangements as JSON
          access_arrangements: Object.keys(access).length > 0 ? access : undefined,

          // Admin-only fields passed directly
          admin_notes: raw.admin_notes || undefined,
          user_facing_notes: raw.user_facing_notes || undefined,
          edit_requests: raw.edit_requests || undefined,
          cancellation_reason: raw.cancellation_reason || undefined,
          created_vehicle_id: raw.created_vehicle_id || undefined,
        };

        // Remove undefined keys so Prisma doesn't try to set them
        Object.keys(body).forEach((k) => {
          if (body[k] === undefined) delete body[k];
        });

      } else {
        // Already flat (admin-only quick updates like status change)
        body = raw;
      }

    } else {
      // multipart/form-data path — keep as-is
      formData = await req.formData();
      for (const [key, value] of formData.entries()) {
        if (typeof value === "string") {
          if (value.trim().startsWith("{") || value.trim().startsWith("[")) {
            try {
              body[key] = JSON.parse(value);
            } catch {
              body[key] = value;
            }
          } else {
            body[key] = value;
          }
        }
      }
    }

    // Numeric coercions
    const numericIntFields = ["vehicle_year", "vehicle_mileage", "doors", "seating_capacity"];
    const numericDecimalFields = [
      "seller_asking_price",
      "service_fee_amount",
      "owner_receives_amount",
      "final_sale_price_for_buyer",
    ];

    for (const field of numericIntFields) {
      if (body[field] !== undefined && body[field] !== "") {
        body[field] = parseInt(String(body[field]), 10);
      }
    }
    for (const field of numericDecimalFields) {
      if (body[field] !== undefined && body[field] !== "") {
        body[field] = parseFloat(String(body[field]));
      }
    }

    // Handle file uploads from formData
    const uploadedUrls: string[] = [];
    if (formData) {
      const imageFiles = formData.getAll("vehicle_images_files") as File[];
      for (const file of imageFiles) {
        if (!(file instanceof File) || file.size === 0) continue;
        if (!file.type.startsWith("image/")) {
          return NextResponse.json({ error: "All vehicle_images must be image files" }, { status: 400 });
        }
        if (file.size > 10 * 1024 * 1024) {
          return NextResponse.json({ error: "Each image must be smaller than 10MB" }, { status: 400 });
        }
        const { url } = await uploadFile(file, "managed-sales");
        uploadedUrls.push(url);
      }
    }

    // Merge existing + newly uploaded image URLs
    const existingUrls: string[] = Array.isArray(body.vehicle_images)
      ? (body.vehicle_images as string[]).filter((v) => typeof v === "string")
      : [];

    if (uploadedUrls.length > 0 || existingUrls.length > 0) {
      body.vehicle_images = [...existingUrls, ...uploadedUrls];
    } else {
      delete body.vehicle_images;
    }

    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "Empty body" }, { status: 400 });
    }

    const updated = await workflowAdminPatchMsr(id, admin.userId, body);
    return NextResponse.json({ success: true, request: updated }, { status: 200 });

  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await ctx.params;
    const deleteVehicle =
      new URL(req.url).searchParams.get("deleteVehicle") === "true";

    const result = await workflowDeleteMsr(id, admin.userId, { deleteVehicle });
    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return managedSaleWorkflowResponse(error);
  }
}
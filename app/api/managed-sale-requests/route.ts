// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/db/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/option";

// export async function POST(req: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();

//     console.log("msr body",body);

//     const msr = await prisma.managedSaleRequest.create({
//       data: {
//         submitted_by_user_id: session.user.id,
//         contact_full_name: body.contact_full_name || "",
//         contact_email: body.contact_email || "",
//         contact_phone: body.contact_phone || null,
//         listing_type: body.listing_type || "managed_sales",
//         status: body.status || "pending_initial_review",
//         vehicle_title: body.vehicle_title || null,
//         vehicle_make: body.vehicle_make || null,
//         vehicle_model: body.vehicle_model || null,
//         vehicle_year: body.vehicle_year ? parseInt(String(body.vehicle_year)) : null,
//         vehicle_mileage: body.vehicle_mileage ? parseInt(String(body.vehicle_mileage)) : null,
//         vehicle_condition: body.vehicle_condition || null,
//         vehicle_description: body.vehicle_description || null,
//         vehicle_fuel_type: body.vehicle_fuel_type || null,
//         vehicle_transmission: body.vehicle_transmission || null,
//         vehicle_location: body.vehicle_location || null,
//         seller_asking_price: body.seller_asking_price ? parseFloat(String(body.seller_asking_price)) : null,
//         service_fee_amount: body.service_fee_amount ? parseFloat(String(body.service_fee_amount)) : null,
//         owner_receives_amount: body.owner_receives_amount ? parseFloat(String(body.owner_receives_amount)) : null,
//         final_sale_price_for_buyer: body.final_sale_price_for_buyer ? parseFloat(String(body.final_sale_price_for_buyer)) : null,
//         terms_agreed: body.terms_agreed || false,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       request: {
//         ...msr,
//         created_date: msr.createdAt,
//       },
//     }, { status: 201 });
//   } catch (error) {
//     console.error("[POST /api/managed-sale-requests]", error);
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Frontend sends nested structure — extract them
    const contact = body.requester_contact_info || {};
    const vehicle = body.vehicle_details || {};
    const access = body.access_arrangements || {};

    // Filter out blob URLs — they're temporary browser URLs, not real image URLs
    const validImages = (vehicle.images || []).filter(
      (url: string) => url && !url.startsWith("blob:")
    );
    const validThumbnails = (vehicle.images_thumbnails || []).filter(
      (url: string) => url && !url.startsWith("blob:")
    );
    const validSmall = (vehicle.images_small || []).filter(
      (url: string) => url && !url.startsWith("blob:")
    );
    const validMedium = (vehicle.images_medium || []).filter(
      (url: string) => url && !url.startsWith("blob:")
    );


    const msr = await prisma.managedSaleRequest.create({
      data: {
        submitted_by_user_id: session.user.id,

        // Contact info
        contact_full_name: contact.full_name || "",
        contact_email: contact.email || "",
        contact_phone: contact.phone || null,

        // Status & type
        listing_type: body.listing_type || "managed_sales",
        status: body.status || "pending_initial_review",
        terms_agreed: body.terms_agreed || false,

        // Pricing
        seller_asking_price: vehicle.seller_asking_price
          ? parseFloat(String(vehicle.seller_asking_price))
          : null,
        service_fee_amount: body.service_fee_amount
          ? parseFloat(String(body.service_fee_amount))
          : null,
        owner_receives_amount: body.owner_receives_amount
          ? parseFloat(String(body.owner_receives_amount))
          : null,
        final_sale_price_for_buyer: body.final_sale_price_for_buyer
          ? parseFloat(String(body.final_sale_price_for_buyer))
          : null,

        // Basic vehicle info
        vehicle_title: vehicle.title || null,
        vehicle_make: vehicle.make || null,
        vehicle_model: vehicle.model || null,
        vehicle_year: vehicle.year ? parseInt(String(vehicle.year)) : null,
        vehicle_mileage: vehicle.mileage !== "" && vehicle.mileage != null
          ? parseInt(String(vehicle.mileage))
          : null,
        vehicle_condition: vehicle.condition || null,
        vehicle_description: vehicle.description || null,
        vehicle_fuel_type: vehicle.fuel_type || null,
        vehicle_transmission: vehicle.transmission || null,
        vehicle_location: vehicle.location || null,

        // Financing & warranty
        financing_available: vehicle.financing_available || null,
        warranty_available: vehicle.warranty_available || null,
        warranty_link: vehicle.warranty_link || null,

        // Images — blob URLs are filtered out
        vehicle_images: validImages,
        vehicle_images_thumbnails: validThumbnails,
        vehicle_images_small: validSmall,
        vehicle_images_medium: validMedium,

        // Specs
        drive_type: vehicle.drive_type || null,
        engine_size: vehicle.engine_size || null,
        body_type: vehicle.body_type || null,
        exterior_color: vehicle.exterior_color || null,
        interior_color: vehicle.interior_color || null,
        doors: vehicle.doors ? parseInt(String(vehicle.doors)) : null,
        seating_capacity: vehicle.seating_capacity
          ? parseInt(String(vehicle.seating_capacity))
          : null,
        steering_wheel: vehicle.steering_wheel || null,

        // Registration
        current_plate_type: vehicle.current_plate_type || null,
        shaken_valid_until: vehicle.shaken_valid_until || null,
        road_tax_paid: vehicle.road_tax_paid || null,
        jci_insurance_valid_until: vehicle.jci_insurance_valid_until || null,
        title_type: vehicle.title_type || null,
        registration_location: vehicle.registration_location || null,

        // Performance
        engine_type: vehicle.engine_type || null,
        power_output: vehicle.power_output || null,
        fuel_efficiency: vehicle.fuel_efficiency || null,
        drivetrain: vehicle.drivetrain || null,
        suspension_type: vehicle.suspension_type || null,
        brakes: vehicle.brakes || null,
        tire_condition: vehicle.tire_condition || null,
        battery_condition: vehicle.battery_condition || null,
        hybrid_system_status: vehicle.hybrid_system_status || null,
        maintenance_history: vehicle.maintenance_history || null,

        // Exterior features
        power_sliding_doors: vehicle.power_sliding_doors || null,
        headlights: vehicle.headlights || null,
        fog_lights: vehicle.fog_lights || null,
        alloy_wheels: vehicle.alloy_wheels ?? false,
        spoiler: vehicle.spoiler ?? false,
        tinted_windows: vehicle.tinted_windows ?? false,
        roof_type: vehicle.roof_type || null,
        side_mirrors: vehicle.side_mirrors || null,
        keyless_entry: vehicle.keyless_entry ?? false,
        remote_door_locking: vehicle.remote_door_locking ?? false,
        body_condition: vehicle.body_condition || null,

        // Interior features
        air_conditioning: vehicle.air_conditioning || null,
        upholstery: vehicle.upholstery || null,
        seat_type: vehicle.seat_type || null,
        seat_adjustments: vehicle.seat_adjustments || null,
        navigation_system: vehicle.navigation_system || null,
        rear_camera: vehicle.rear_camera ?? false,
        parking_sensors: vehicle.parking_sensors || null,
        power_windows: vehicle.power_windows || null,
        interior_lighting: vehicle.interior_lighting || null,
        cup_holders_storage: vehicle.cup_holders_storage ?? false,
        child_lock_isofix: vehicle.child_lock_isofix ?? false,

        // Arrays
        infotainment_system: vehicle.infotainment_system || [],
        steering_wheel_controls: vehicle.steering_wheel_controls || [],
        airbags: vehicle.airbags || [],

        // Safety
        abs: vehicle.abs ?? false,
        esc_stability_control: vehicle.esc_stability_control ?? false,
        lane_departure_warning: vehicle.lane_departure_warning ?? false,
        collision_mitigation: vehicle.collision_mitigation ?? false,
        cruise_control: vehicle.cruise_control || null,
        traction_control: vehicle.traction_control ?? false,
        hill_start_assist: vehicle.hill_start_assist ?? false,
        immobilizer_alarm: vehicle.immobilizer_alarm ?? false,
        seat_belt_sensors: vehicle.seat_belt_sensors ?? false,

        // Tech
        bluetooth: vehicle.bluetooth ?? false,
        usb_ports: vehicle.usb_ports ?? false,
        twelve_v_outlet: vehicle.twelve_v_outlet ?? false,
        smart_key_push_start: vehicle.smart_key_push_start ?? false,
        display_screen_size: vehicle.display_screen_size || null,
        rear_entertainment_system: vehicle.rear_entertainment_system ?? false,
        voice_command_hands_free: vehicle.voice_command_hands_free ?? false,
        digital_dashboard_display: vehicle.digital_dashboard_display ?? false,

        // Access arrangements stored as JSON
        access_arrangements: access,
      },
    });

    return NextResponse.json(
      {
        success: true,
        request: {
          ...msr,
          created_date: msr.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/managed-sale-requests]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}



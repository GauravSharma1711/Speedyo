import { NextRequest, NextResponse } from "next/server";
import prisma from "@/db/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/option";
import { uploadFile } from "@/lib/storage/uploadFile";





export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const formData = await req.formData();

    const contact_full_name = formData.get("contact_full_name") as string | null;
    const contact_email     = formData.get("contact_email")     as string | null;
    const contact_phone     = formData.get("contact_phone")     as string | null;
    const terms_agreed      = formData.get("terms_agreed")      as string | null;

    // Required fields
    if (!contact_full_name?.trim())
      return NextResponse.json({ error: "contact_full_name is required" }, { status: 400 });

    if (!contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact_email))
      return NextResponse.json({ error: "a valid contact_email is required" }, { status: 400 });

    if (terms_agreed !== "true")
      return NextResponse.json({ error: "terms_agreed must be accepted" }, { status: 400 });

    // Upload vehicle images
    const imageFiles = formData.getAll("vehicle_images") as File[];
    const vehicle_images: string[] = [];

    for (const file of imageFiles) {
      if (!file.type.startsWith("image/"))
        return NextResponse.json({ error: "All vehicle_images must be image files" }, { status: 400 });

      if (file.size > 10 * 1024 * 1024)
        return NextResponse.json({ error: "Each image must be smaller than 10MB" }, { status: 400 });

      const { url } = await uploadFile(file, "managed-sales");
      vehicle_images.push(url);
    }

    // Parse access arrangements
    let access_arrangements = {};
    const rawAccess = formData.get("access_arrangements") as string | null;
    if (rawAccess) {
      try { access_arrangements = JSON.parse(rawAccess); }
      catch { return NextResponse.json({ error: "access_arrangements must be valid JSON" }, { status: 400 }); }
    }

    const g = (key: string) => (formData.get(key) as string | null) || null;
    const n = (key: string) => { const v = g(key); return v ? parseInt(v) : null; };
    const d = (key: string) => { const v = g(key); return v ? parseFloat(v) : null; };
    const b = (key: string) => { const v = g(key); return v === null ? null : v === "true"; };
    const a = (key: string) => { const v = g(key); if (!v) return []; try { return JSON.parse(v); } catch { return []; } };

    const managedSaleRequest = await prisma.managedSaleRequest.create({
      data: {
        // Contact
        contact_full_name: contact_full_name.trim(),
        contact_email:     contact_email.trim().toLowerCase(),
        contact_phone,

        // Vehicle basics
        vehicle_title:        g("vehicle_title"),
        vehicle_make:         g("vehicle_make"),
        vehicle_model:        g("vehicle_model"),
        vehicle_year:         n("vehicle_year"),
        vehicle_mileage:      n("vehicle_mileage"),
        vehicle_condition:    g("vehicle_condition"),
        vehicle_description:  g("vehicle_description"),
        vehicle_fuel_type:    g("vehicle_fuel_type"),
        vehicle_transmission: g("vehicle_transmission"),
        vehicle_location:     g("vehicle_location"),
        seller_asking_price:  d("seller_asking_price"),
        financing_available:  g("financing_available"),
        warranty_available:   g("warranty_available"),
        warranty_link:        g("warranty_link"),

        // Images (same URL for all resolutions — swap when resizer is ready)
        vehicle_images,
        vehicle_images_thumbnails: vehicle_images,
        vehicle_images_small:      vehicle_images,
        vehicle_images_medium:     vehicle_images,

        // Legal / registration
        current_plate_type:        g("current_plate_type"),
        shaken_valid_until:        g("shaken_valid_until"),
        road_tax_paid:             g("road_tax_paid"),
        jci_insurance_valid_until: g("jci_insurance_valid_until"),
        title_type:                g("title_type"),
        registration_location:     g("registration_location"),

        // Specs
        drive_type:       g("drive_type"),
        engine_size:      g("engine_size"),
        body_type:        g("body_type"),
        exterior_color:   g("exterior_color"),
        interior_color:   g("interior_color"),
        doors:            n("doors"),
        seating_capacity: n("seating_capacity"),
        steering_wheel:   g("steering_wheel"),

        // Performance
        engine_type:          g("engine_type"),
        power_output:         g("power_output"),
        fuel_efficiency:      g("fuel_efficiency"),
        drivetrain:           g("drivetrain"),
        suspension_type:      g("suspension_type"),
        brakes:               g("brakes"),
        tire_condition:       g("tire_condition"),
        battery_condition:    g("battery_condition"),
        hybrid_system_status: g("hybrid_system_status"),
        maintenance_history:  g("maintenance_history"),

        // Exterior
        power_sliding_doors: g("power_sliding_doors"),
        headlights:          g("headlights"),
        fog_lights:          g("fog_lights"),
        alloy_wheels:        b("alloy_wheels"),
        spoiler:             b("spoiler"),
        tinted_windows:      b("tinted_windows"),
        roof_type:           g("roof_type"),
        side_mirrors:        g("side_mirrors"),
        body_condition:      g("body_condition"),
        keyless_entry:       b("keyless_entry"),
        remote_door_locking: b("remote_door_locking"),

        // Interior
        air_conditioning:          g("air_conditioning"),
        upholstery:                g("upholstery"),
        seat_type:                 g("seat_type"),
        seat_adjustments:          g("seat_adjustments"),
        navigation_system:         g("navigation_system"),
        rear_camera:               b("rear_camera"),
        parking_sensors:           g("parking_sensors"),
        power_windows:             g("power_windows"),
        interior_lighting:         g("interior_lighting"),
        cup_holders_storage:       b("cup_holders_storage"),
        child_lock_isofix:         b("child_lock_isofix"),
        display_screen_size:       g("display_screen_size"),
        rear_entertainment_system: b("rear_entertainment_system"),
        digital_dashboard_display: b("digital_dashboard_display"),

        // Safety
        abs:                    b("abs"),
        esc_stability_control:  b("esc_stability_control"),
        lane_departure_warning: b("lane_departure_warning"),
        collision_mitigation:   b("collision_mitigation"),
        cruise_control:         g("cruise_control"),
        traction_control:       b("traction_control"),
        hill_start_assist:      b("hill_start_assist"),
        immobilizer_alarm:      b("immobilizer_alarm"),
        seat_belt_sensors:      b("seat_belt_sensors"),

        // Technology
        bluetooth:                b("bluetooth"),
        usb_ports:                b("usb_ports"),
        twelve_v_outlet:          b("twelve_v_outlet"),
        smart_key_push_start:     b("smart_key_push_start"),
        voice_command_hands_free: b("voice_command_hands_free"),

        // Arrays
        infotainment_system:     a("infotainment_system"),
        steering_wheel_controls: a("steering_wheel_controls"),
        airbags:                 a("airbags"),

        // Misc
        access_arrangements,
        terms_agreed:        true,
        status:              "pending_review",
        submitted_by_user_id: session?.user?.id ?? null,
      },
    });

    return NextResponse.json(
      { success: true, managedSaleRequest, message: "Managed sale request submitted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit managed sale request", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
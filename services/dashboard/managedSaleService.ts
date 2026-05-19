import axios from "@/lib/axios";

export type ManagedSaleRequest = {
  id: string;
  submitted_by_user_id?: string | null;
  status?: string | null;
  vehicle_details?: Record<string, any>;
  created_vehicle_id?: string | null;
  edit_requests?: Array<Record<string, any>>;
  user_facing_notes?: string | null;
  cancellation_reason?: string | null;
  calculated_buyer_price?: number | null;
  service_fee_amount?: number | null;
  access_arrangements?: Record<string, any>;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  created_date?: string | Date | null;
};

function transformRequest(request: any): ManagedSaleRequest {
  // Check if already transformed (has vehicle_details)
  if (request.vehicle_details && typeof request.vehicle_details === 'object') {
    return request;
  }

  // Transform flat API response to nested structure
  const vehicleDetails: Record<string, any> = {};
  const vehiclePrefixes = [
    'title', 'make', 'model', 'year', 'mileage', 'condition', 'description',
    'fuel_type', 'transmission', 'location', 'seller_asking_price',
    'financing_available', 'warranty_available', 'warranty_link',
    'drive_type', 'engine_size', 'body_type', 'exterior_color', 'interior_color',
    'doors', 'seating_capacity', 'steering_wheel', 'current_plate_type',
    'shaken_valid_until', 'road_tax_paid', 'jci_insurance_valid_until',
    'title_type', 'registration_location', 'engine_type', 'power_output',
    'fuel_efficiency', 'drivetrain', 'suspension_type', 'brakes',
    'tire_condition', 'battery_condition', 'hybrid_system_status', 'maintenance_history',
    'power_sliding_doors', 'headlights', 'fog_lights', 'alloy_wheels', 'spoiler',
    'tinted_windows', 'roof_type', 'side_mirrors', 'body_condition',
    'air_conditioning', 'upholstery', 'seat_type', 'seat_adjustments',
    'navigation_system', 'rear_camera', 'parking_sensors', 'power_windows',
    'interior_lighting', 'cup_holders_storage', 'child_lock_isofix',
    'display_screen_size', 'rear_entertainment_system', 'digital_dashboard_display',
    'infotainment_system', 'steering_wheel_controls', 'airbags', 'bluetooth',
    'usb_ports', 'twelve_v_outlet', 'smart_key_push_start', 'keyless_entry',
    'remote_door_locking', 'voice_command_hands_free', 'abs', 'esc_stability_control',
    'lane_departure_warning', 'collision_mitigation', 'cruise_control',
    'traction_control', 'hill_start_assist', 'immobilizer_alarm', 'seat_belt_sensors',
  ];

  for (const key of vehiclePrefixes) {
    if (request[`vehicle_${key}`] !== undefined) {
      vehicleDetails[key] = request[`vehicle_${key}`];
    } else if (request[key] !== undefined) {
      vehicleDetails[key] = request[key];
    }
  }

  // Copy image arrays
  if (request.vehicle_images) vehicleDetails.images = request.vehicle_images;
  if (request.vehicle_images_thumbnails) vehicleDetails.images_thumbnails = request.vehicle_images_thumbnails;
  if (request.vehicle_images_small) vehicleDetails.images_small = request.vehicle_images_small;
  if (request.vehicle_images_medium) vehicleDetails.images_medium = request.vehicle_images_medium;

  return {
    ...request,
    vehicle_details: vehicleDetails,
    created_date: request.created_date || request.createdAt,
  };
}

export const managedSaleService = {
  async listByUser(userId: string): Promise<ManagedSaleRequest[]> {
    const res = await axios.get<{ success: true; requests: ManagedSaleRequest[] }>(
      "/api/managed-sale-requests/user",
      { params: { userId } }
    );
    return (res.data.requests ?? []).map(transformRequest);
  },

  async create(data: Record<string, any>): Promise<ManagedSaleRequest> {
    const res = await axios.post<{ success: true; request: ManagedSaleRequest }>(
      "/api/managed-sale-requests",
      data
    );
    return res.data.request;
  },

  async update(id: string, data: Record<string, any>): Promise<ManagedSaleRequest> {
    const res = await axios.patch<{ success: true; request: ManagedSaleRequest }>(
      `/api/admin/managed-sale-requests/${id}`,
      data
    );
    return res.data.request;
  },
};

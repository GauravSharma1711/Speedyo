import axios from "@/lib/axios";
import { GuestDashboardVehicle } from "@/store/dashboard/guestDashboardStore";

export type DashboardVehicle = {
  id: string;
  created_by?: string;
  created_by_id?: string;
  title?: string | null;
  year?: number | null;
  make?: string | null;
  model?: string | null;
  price?: number | null;
  status?: string | null;
  recurring_availability?: Record<string, any> | null;
  primary_image?: string | null;
  primary_image_thumbnail?: string | null;
  views?: number | null;
  likes_count?: number | null;
  saves_count?: number | null;
  condition?: string | null;
  mileage?: number | null;
  location?: string | null;
  verified?: boolean | null;
  featured?: boolean | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  edit_requests?: Array<Record<string, any>>;
  website_managed?: boolean;
};

export const vehicleService = {
  async listMyVehicles(userId: string): Promise<DashboardVehicle[]> {
    const res = await axios.get<{ success: true; vehicles: DashboardVehicle[] }>("/api/user/vehicles", {
      params: { userId, type: "managed", page: 1, limit: 100 },
    });
    return res.data.vehicles;
  },


async getDirectListings(): Promise<GuestDashboardVehicle[]> {
  const res = await axios.get("/api/vehicles/getDirectListedVehicles");  
  return res.data.vehicles;
},

async createListing(
  data: Omit<GuestDashboardVehicle, 'id' | 'isDirectListing'>, 
  isDirectListing: boolean = false
) {
  const res = await axios.post("/api/vehicles/create", { ...data, isDirectListing });
  return res.data.vehicle;
},


};

import api from "@/lib/axios";

export type VehicleDetailsApi = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  price: string | number | null;
  mileage: number | null;
  condition: string | null;
  description: string | null;
  location: string | null;
  fuel_type: string | null;
  transmission: string | null;
  status: string | null;
  featured: boolean;
  verified: boolean;
  website_managed: boolean;
  isDirectListing: boolean;
  dealer_fee: number | null;
  views: number;
  shares: number;
  primary_image: string | null;
  images: string[];
  recurring_availability: any[];
  saves_count: number;
  likes_count: number;
  shares_count: number;
};

export type GetVehicleDetailsResponse = {
  success: true;
  vehicle: VehicleDetailsApi;
};

export type SellerProfileApi = {
  id: string;
  full_name: string | null;
  profile_image: string | null;
  bio: string | null;
  location: string | null;
  isVerified: boolean;
  role: string | null;
  user_type: string | null;
  createdAt: string;
};

export type GetSellerProfileResponse = {
  success: true;
  seller: SellerProfileApi | null;
};

export type IncrementVehicleViewsBody = { vehicleId: string };
export type IncrementVehicleViewsResponse = { success: true; newViewCount: number };

export const vehicleDetailsService = {
  getById: async (vehicleId: string) => {
    const res = await api.get<GetVehicleDetailsResponse>(`/api/vehicles/${vehicleId}`);
    return res.data;
  },

  getSellerVehicles : async ()=>{
    const res =  await api.get('/api/vehicles/seller-vehicles');
    return res.data;
  },


  incrementViews: async (body: IncrementVehicleViewsBody) => {
    const res = await api.post<IncrementVehicleViewsResponse>("/api/vehicles/incrementVehicleViews", body);
    return res.data;
  },
  getSellerProfile: async (vehicleId: string) => {
    const res = await api.get<GetSellerProfileResponse>(`/api/vehicles/${vehicleId}/seller-profile`);
    return res.data;
  },
};


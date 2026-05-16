import api from "@/lib/axios";

export type VehiclesSortKey = "createdAt" | "price" | "mileage" | "year";

export type ListVehiclesParams = {
  page?: number;
  limit?: number;
  q?: string;
  make?: string;
  condition?: string;
  fuelType?: string;
  location?: string;
  priceRange?: string; 
  priceMin?: number | null;
  priceMax?: number | null;
  status?: string;
  sort?: `-${VehiclesSortKey}` | VehiclesSortKey;
};

export type VehicleListItemApi = {
  id: string;
  createdAt: string;
  isDirectListing:boolean
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
  views: number;
  shares: number;
  primary_image: string | null;
  primary_image_thumbnail: string | null;
  primary_image_small: string | null;
  primary_image_medium: string | null;
  images: string[];
  images_thumbnails: string[];
  images_small: string[];
  images_medium: string[];
  authorId: string | null;
  likes_count: number;
  saves_count: number;
  shares_count: number;
};

export type ListVehiclesResponse = {
  success: true;
  page: number;
  limit: number;
  total: number;
  vehicles: VehicleListItemApi[];
};

function addParam(sp: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  const v = String(value).trim();
  if (!v) return;
  sp.set(key, v);
}

export const marketplaceVehicleService = {
  list: async (params: ListVehiclesParams) => {
    const sp = new URLSearchParams();
    addParam(sp, "page", params.page);
    addParam(sp, "limit", params.limit);
    addParam(sp, "q", params.q);
    addParam(sp, "make", params.make);
    addParam(sp, "condition", params.condition);
    addParam(sp, "fuelType", params.fuelType);
    addParam(sp, "location", params.location);
    addParam(sp, "priceRange", params.priceRange);
    addParam(sp, "priceMin", params.priceMin);
    addParam(sp, "priceMax", params.priceMax);
    addParam(sp, "status", params.status);
    addParam(sp, "sort", params.sort);

    const res = await api.get<ListVehiclesResponse>(`/api/vehicles?${sp.toString()}`);
    return res.data;
  },
};


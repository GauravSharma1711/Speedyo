import api from "@/lib/axios";

export type PublicManagedSaleVehicleDetails = Record<string, any>;

export type PublicManagedSaleByVehicle = {
  id: string;
  createdAt: string;
  updatedAt: string;
  created_vehicle_id: string;
  website_managed: boolean | null;
  service_fee_amount: string | number | null;
  owner_receives_amount: string | number | null;
  final_sale_price_for_buyer: string | number | null;
  vehicle_details: PublicManagedSaleVehicleDetails;
};

export type GetPublicMsrByVehicleResponse = {
  success: true;
  msr: PublicManagedSaleByVehicle | null;
};

export const publicManagedSaleService = {
  getByVehicleId: async (vehicleId: string) => {
    const res = await api.get<GetPublicMsrByVehicleResponse>(
      `/api/managed-sale-requests/by-vehicle/${vehicleId}`
    );
    return res.data;
  },
};


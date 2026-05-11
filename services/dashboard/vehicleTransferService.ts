import axios from "@/lib/axios";

export type VehicleTransfer = {
  id: string;
  vehicle_id?: string | null;
  buyer_id?: string | null;
  seller_id?: string | null;
  status?: string | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
};

export const vehicleTransferService = {
  async listByBuyer(buyerId: string): Promise<VehicleTransfer[]> {
    const res = await axios.get<{ success: true; transfers: VehicleTransfer[] }>(
      "/api/vehicle-transfers",
      { params: { buyerId } }
    );
    return res.data.transfers ?? [];
  },

  async listBySeller(sellerId: string): Promise<VehicleTransfer[]> {
    const res = await axios.get<{ success: true; transfers: VehicleTransfer[] }>(
      "/api/vehicle-transfers",
      { params: { sellerId } }
    );
    return res.data.transfers ?? [];
  },
};

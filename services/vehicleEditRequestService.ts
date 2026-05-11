import axios from "@/lib/axios";

export type VehicleEditRequestData = {
  id: string;
  vehicle_id: string;
  requested_by_user_id: string;
  requested_changes: Record<string, any>;
  reason: string;
  status: string;
  createdAt: string | Date;
};

export const vehicleEditRequestService = {
  async create(data: {
    vehicleId: string;
    reason: string;
    requested_changes: Record<string, any>;
    primary_image?: File | null;
  }): Promise<VehicleEditRequestData> {
    const formData = new FormData();
    formData.append("vehicleId", data.vehicleId);
    formData.append("reason", data.reason);
    formData.append("requested_changes", JSON.stringify(data.requested_changes));
    if (data.primary_image) {
      formData.append("primary_image", data.primary_image);
    }

    const res = await axios.post<{ success: true; editRequest: VehicleEditRequestData }>(
      "/api/user/vehicleEditRequest",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.editRequest;
  },
};
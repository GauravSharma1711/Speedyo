import api from "@/lib/axios";

export type MessageSellerBody = { content: string };
export type MessageSellerResponse = { success: true; message: any };

export type RequestTestDriveBody = {
  requested_date: string;
  requested_time: string;
  additional_notes?: string | null;
};
export type RequestTestDriveResponse = { success: true; request: any; message: any };

export type ToggleLikeResponse = { success: true; liked: boolean; likes_count?: number };
export type ToggleSaveResponse = { success: true; saved: boolean; saves_count?: number };
export type ShareVehicleResponse = { success: true; shares_count?: number };

export const vehicleActionService = {
  messageSeller: async (vehicleId: string, body: MessageSellerBody) => {
    const res = await api.post<MessageSellerResponse>(`/api/vehicles/${vehicleId}/message-seller`, body);
    return res.data;
  },
  requestTestDrive: async (vehicleId: string, body: RequestTestDriveBody) => {
    const res = await api.post<RequestTestDriveResponse>(`/api/vehicles/${vehicleId}/test-drive`, body);
    return res.data;
  },
  toggleLike: async (vehicleId: string) => {
    const res = await api.post<ToggleLikeResponse>(`/api/vehicles/${vehicleId}/like`);
    return res.data;
  },
  toggleSave: async (vehicleId: string) => {
    const res = await api.post<ToggleSaveResponse>(`/api/vehicles/${vehicleId}/saves`);
    return res.data;
  },
  share: async (vehicleId: string) => {
    const res = await api.post<ShareVehicleResponse>(`/api/vehicles/${vehicleId}/share`);
    return res.data;
  },
};


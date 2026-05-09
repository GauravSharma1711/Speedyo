import api from "@/lib/axios";
import { UpdateVehicleData, ManageAvailabilityData } from "@/store/admin/vehicleListing";


const vehicleListingService = {
  getAll: async () => {
    const res = await api.get("/api/admin/vehicle-listing");
    return res.data;
  },

  update: async (vehicleId: string, data: FormData) => {
    const res = await api.patch(`/api/admin/vehicle-listing/${vehicleId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  delete: async (vehicleId: string) => {
    const res = await api.delete(`/api/admin/vehicle-listing/${vehicleId}`); 
    return res.data;
  },

  associateDealership: async (vehicleId: string, dealershipId: string) => {
    const res = await api.post(
      `/api/admin/vehicle-listing/${vehicleId}/asociateDealership/${dealershipId}`
    );
    return res.data;
  },

  removeDealershipAssociation: async (vehicleId: string) => {
  const res = await api.delete(
    `/api/admin/vehicle-listing/${vehicleId}/asociateDealership`
  );
  return res.data;
},

  toggleFeatured: async (vehicleId: string) => {
    const res = await api.patch(`/api/admin/vehicle-listing/${vehicleId}/toggleFeatured`);
    return res.data;
  },

  markSold: async (vehicleId: string) => {
    const res = await api.patch(`/api/admin/vehicle-listing/${vehicleId}/markAsSold`);
    return res.data;
  },

 manageTestDriveAvailability: async (vehicleId: string, data: ManageAvailabilityData) => {
  const res = await api.post(
    `/api/admin/vehicle-listing/${vehicleId}/testDriveSlot`,
    data  
  );
  return res.data;
},
};

export default vehicleListingService;
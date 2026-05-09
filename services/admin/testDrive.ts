import api from "@/lib/axios";
import {
  UpdateTestDriveData,
  CreateReportData,
  UpdateReportData,
} from "@/store/admin/testDrive";

const testDriveService = {
  getAll: async () => {
    const res = await api.get("/api/admin/test-drive");
    return res.data;
  },

  update: async (testDriveId: string, data: UpdateTestDriveData) => {
    const res = await api.patch(`/api/admin/test-drive/${testDriveId}`, data);
    return res.data;
  },

  createReport: async (testDriveId: string, data: CreateReportData) => {
    const res = await api.post(`/api/admin/test-drive/${testDriveId}/report`, data);
    return res.data;
  },

  updateReport: async (testDriveId: string, data: UpdateReportData) => {
    const res = await api.patch(`/api/admin/test-drive/${testDriveId}/report`, data);
    return res.data;
  },
};

export default testDriveService;
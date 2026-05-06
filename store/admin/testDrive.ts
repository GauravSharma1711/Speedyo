import { create } from "zustand";
import { immer } from "zustand/middleware/immer";


export type TestDrive = {
  id: string;
  createdAt: string;
  updatedAt: string;
  vehicleId: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string;
  requested_date: string;
  requested_time: string;
  confirmed_date?: string;
  confirmed_time?: string;
  status: string;
  additional_notes?: string;
  cancellation_reason?: string;
  seller_notes?: string;
  userId?: string;
  location?: string;
  vehicle?: { id: string; title: string };
  user?: { id: string; full_name: string; email: string };
  report?: {
    id: string;
    testDriveRequestId: string;
    buyer_interest_level: string;
    buyer_feedback?: string;
    speedio_assessment: string;
    recommended_next_steps?: string;
    admin_notes?: string;
  };
};

export type UpdateTestDriveData = {
  status?: string;
  confirmed_date?: string;
  confirmed_time?: string;
  location?: string;
  additional_notes?: string;
  cancellation_reason?: string;
  seller_notes?: string;
};

export type CreateReportData = {
  buyer_interest_level: string;
  buyer_feedback?: string;
  speedio_assessment: string;
  recommended_next_steps?: string;
  admin_notes?: string;
};




export type UpdateReportData = Partial<CreateReportData>;

interface TestDriveState {
  testDrives: TestDrive[];
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  getAll: () => Promise<void>;
  update: (testDriveId: string, data: UpdateTestDriveData) => Promise<void>;
  createReport: (testDriveId: string, data: CreateReportData) => Promise<void>;
  updateReport: (testDriveId: string, data: UpdateReportData) => Promise<void>;
}

export const useTestDriveStore = create<TestDriveState>()(
  immer((set) => ({
    testDrives: [],
    isLoading: false,
    error: null,

    clearError() {
      set({ error: null });
    },

    async getAll() {
      set({ isLoading: true, error: null });
      try {
        const res = await testDriveService.getAll();
        set({ testDrives: res.testDrives, isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ?? "Failed to fetch test drives",
        });
        throw error;
      }
    },

    async update(testDriveId, data) {
      set({ isLoading: true, error: null });
      try {
        const res = await testDriveService.update(testDriveId, data);
        set((state) => {
          const index = state.testDrives.findIndex((t) => t.id === testDriveId);
          if (index !== -1) state.testDrives[index] = res.testDrive;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ?? "Failed to update test drive",
        });
        throw error;
      }
    },

    async createReport(testDriveId, data) {
      set({ isLoading: true, error: null });
      try {
        const res = await testDriveService.createReport(testDriveId, data);
        // attach report to the matching test drive in state
        set((state) => {
          const index = state.testDrives.findIndex((t) => t.id === testDriveId);
          if (index !== -1) state.testDrives[index].report = res.report;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ?? "Failed to create report",
        });
        throw error;
      }
    },

    async updateReport(testDriveId, data) {
      set({ isLoading: true, error: null });
      try {
        const res = await testDriveService.updateReport(testDriveId, data);
        // update report inside matching test drive in state
        set((state) => {
          const index = state.testDrives.findIndex((t) => t.id === testDriveId);
          if (index !== -1) state.testDrives[index].report = res.report;
        });
        set({ isLoading: false });
      } catch (error: any) {
        set({
          isLoading: false,
          error:
            error?.response?.data?.message ?? "Failed to update report",
        });
        throw error;
      }
    },
  }))
);
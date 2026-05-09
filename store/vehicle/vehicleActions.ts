import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { vehicleActionService } from "@/services/vehicle/vehicleActionServices";

type VehicleActionsState = {
  isMessaging: boolean;
  isRequestingTestDrive: boolean;
  isLiking: boolean;
  isSaving: boolean;
  isSharing: boolean;
  error: string | null;
};

type VehicleActions = {
  messageSeller: (vehicleId: string, content: string) => Promise<void>;
  requestTestDrive: (vehicleId: string, body: { requested_date: string; requested_time: string; additional_notes?: string | null }) => Promise<void>;
  toggleLike: (vehicleId: string) => Promise<{ liked: boolean; likes_count?: number }>;
  toggleSave: (vehicleId: string) => Promise<{ saved: boolean; saves_count?: number }>;
  share: (vehicleId: string) => Promise<{ shares_count?: number }>;
  clearError: () => void;
};

export const useVehicleActionsStore = create<VehicleActionsState & VehicleActions>()(
  immer((set) => ({
    isMessaging: false,
    isRequestingTestDrive: false,
    isLiking: false,
    isSaving: false,
    isSharing: false,
    error: null,

    clearError: () =>
      set((s) => {
        s.error = null;
      }),

    messageSeller: async (vehicleId, content) => {
      set((s) => {
        s.isMessaging = true;
        s.error = null;
      });
      try {
        await vehicleActionService.messageSeller(vehicleId, { content });
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to send message")
            : e instanceof Error
              ? e.message
              : "Failed to send message";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isMessaging = false;
        });
      }
    },

    requestTestDrive: async (vehicleId, body) => {
      set((s) => {
        s.isRequestingTestDrive = true;
        s.error = null;
      });
      try {
        await vehicleActionService.requestTestDrive(vehicleId, body);
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to request test drive")
            : e instanceof Error
              ? e.message
              : "Failed to request test drive";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isRequestingTestDrive = false;
        });
      }
    },

    toggleLike: async (vehicleId) => {
      set((s) => {
        s.isLiking = true;
        s.error = null;
      });
      try {
        const res = await vehicleActionService.toggleLike(vehicleId);
        return { liked: res.liked, likes_count: res.likes_count };
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to like vehicle")
            : e instanceof Error
              ? e.message
              : "Failed to like vehicle";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isLiking = false;
        });
      }
    },

    toggleSave: async (vehicleId) => {
      set((s) => {
        s.isSaving = true;
        s.error = null;
      });
      try {
        const res = await vehicleActionService.toggleSave(vehicleId);
        return { saved: res.saved, saves_count: res.saves_count };
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to save vehicle")
            : e instanceof Error
              ? e.message
              : "Failed to save vehicle";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isSaving = false;
        });
      }
    },

    share: async (vehicleId) => {
      set((s) => {
        s.isSharing = true;
        s.error = null;
      });
      try {
        const res = await vehicleActionService.share(vehicleId);
        return { shares_count: res.shares_count };
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to share vehicle")
            : e instanceof Error
              ? e.message
              : "Failed to share vehicle";
        set((s) => {
          s.error = msg;
        });
        throw new Error(msg);
      } finally {
        set((s) => {
          s.isSharing = false;
        });
      }
    },
  }))
);


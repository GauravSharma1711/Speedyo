import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import paymentService, {
  Payment,
  Invoice,
  SubscriptionDetails,
  SlotPurchaseData,
  GuestSlotPurchaseData,
} from "@/services/paymentService";

// ── State Type ─────────────────────────────────────────────────────────────

interface PaymentState {
  // Payment form state
  isProcessing: boolean;
  paymentError: string | null;
  lastPaymentId: string | null;
  lastReceiptUrl: string | null;
  paymentSuccess: boolean;

  // History state
  payments: Payment[];
  invoices: Invoice[];
  subscription: SubscriptionDetails | null;
  isLoadingHistory: boolean;
  historyError: string | null;

  // Actions
  clearPaymentState: () => void;
  clearError: () => void;
  purchaseSlots: (data: SlotPurchaseData) => Promise<{
    success: boolean;
    paymentId?: string;
    receiptUrl?: string;
    slotsAdded?: number;
    totalSlots?: number;
    availableSlots?: number;
    wasUpgraded?: boolean;
  }>;
  purchaseSlotsAsGuest: (data: GuestSlotPurchaseData) => Promise<{
    success: boolean;
    paymentId?: string;
    slotsPurchased?: number;
  }>;
  getHistory: () => Promise<void>;
}

// ── Store ──────────────────────────────────────────────────────────────────

export const usePaymentStore = create<PaymentState>()(
  immer((set) => ({
    // Initial state
    isProcessing: false,
    paymentError: null,
    lastPaymentId: null,
    lastReceiptUrl: null,
    paymentSuccess: false,

    payments: [],
    invoices: [],
    subscription: null,
    isLoadingHistory: false,
    historyError: null,

    clearPaymentState() {
      set({
        isProcessing: false,
        paymentError: null,
        lastPaymentId: null,
        lastReceiptUrl: null,
        paymentSuccess: false,
      });
    },

    clearError() {
      set({ paymentError: null, historyError: null });
    },

    // ── Purchase slots (logged-in user) ──────────────────────────────────
    async purchaseSlots(data) {
      set({ isProcessing: true, paymentError: null, paymentSuccess: false });

      try {
        const result = await paymentService.purchaseSlots(data);

        set({
          isProcessing: false,
          paymentSuccess: true,
          lastPaymentId: result.paymentId ?? null,
          lastReceiptUrl: result.receiptUrl ?? null,
        });

        return {
          success: true,
          paymentId: result.paymentId,
          receiptUrl: result.receiptUrl,
          slotsAdded: result.slotsAdded,
          totalSlots: result.totalSlots,
          availableSlots: result.availableSlots,
          wasUpgraded: result.wasUpgraded,
        };
      } catch (error: any) {
        const msg =
          error?.response?.data?.error ??
          error?.message ??
          "Payment failed. Please try again.";

        set({
          isProcessing: false,
          paymentError: msg,
          paymentSuccess: false,
        });

        return { success: false };
      }
    },

    // ── Purchase slots as guest ──────────────────────────────────────────
    async purchaseSlotsAsGuest(data) {
      set({ isProcessing: true, paymentError: null, paymentSuccess: false });

      try {
        const result = await paymentService.purchaseSlotsAsGuest(data);

        set({
          isProcessing: false,
          paymentSuccess: true,
          lastPaymentId: result.paymentId ?? null,
        });

        return {
          success: true,
          paymentId: result.paymentId,
          slotsPurchased: result.slotsPurchased,
        };
      } catch (error: any) {
        const msg =
          error?.response?.data?.error ??
          error?.message ??
          "Payment failed. Please try again.";

        set({
          isProcessing: false,
          paymentError: msg,
          paymentSuccess: false,
        });

        return { success: false };
      }
    },

    // ── Fetch payment history ────────────────────────────────────────────
    async getHistory() {
      set({ isLoadingHistory: true, historyError: null });

      try {
        const result = await paymentService.getHistory();

        set({
          payments: result.payments ?? [],
          invoices: result.invoices ?? [],
          subscription: result.subscription ?? null,
          isLoadingHistory: false,
        });
      } catch (error: any) {
        set({
          isLoadingHistory: false,
          historyError:
            error?.response?.data?.error ?? "Failed to fetch payment history",
        });
      }
    },
  }))
);
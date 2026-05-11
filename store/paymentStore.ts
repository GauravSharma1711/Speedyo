import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import paymentService, {
  Payment,
  Invoice,
  SubscriptionDetails,
  SlotPurchaseData,
  GuestSlotPurchaseData,
  SlotDetails,
  DealershipSubscription,
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

  verifyDealership: (data: { paymentToken: string; tierId: string }) => Promise<{
  success: boolean;
  paymentId?: string;
  receiptUrl?: string;
}>;

  verifySubscriptionPayment: (data: { paymentToken: string; tierId: string }) => Promise<{
  success: boolean;
  paymentId?: string;
  receiptUrl?: string;
}>;

  purchaseSlotsAsGuest: (data: GuestSlotPurchaseData) => Promise<{
    success: boolean;
    paymentId?: string;
    slotsPurchased?: number;
  }>;
  getHistory: () => Promise<void>;


  slotDetails: SlotDetails | null;
  dealershipSubscriptionDetails:  DealershipSubscription | null;
isLoadingSlots: boolean;
isLoadingdealershipDetails:boolean
fetchSlotDetails: () => Promise<void>;
fetchDealershipSubscription:()=>Promise<void>
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
dealershipSubscriptionDetails: null,

        slotDetails: null,
isLoadingSlots: false,
isLoadingdealershipDetails:false,


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

        slotDetails: null,
isLoadingSlots: false,

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



    async verifyDealership(data) {
  set({ isProcessing: true, paymentError: null, paymentSuccess: false });
  try {
    const result = await paymentService.verifyDealership(data);
    set({
      isProcessing: false,
      paymentSuccess: true,
      lastPaymentId: result.paymentId ?? null,
      lastReceiptUrl: result.receiptUrl ?? null,
    });
    return { success: true, paymentId: result.paymentId, receiptUrl: result.receiptUrl };
  } catch (error: any) {
    const msg = error?.response?.data?.error ?? error?.message ?? "Payment failed.";
    set({ isProcessing: false, paymentError: msg, paymentSuccess: false });
    return { success: false };
  }
},


   async verifySubscriptionPayment(data) {
  set({ isProcessing: true, paymentError: null, paymentSuccess: false });
  try {
    const result = await paymentService.verifySubscriptionPayment(data);
    set({
      isProcessing: false,
      paymentSuccess: true,
      lastPaymentId: result.paymentId ?? null,
      lastReceiptUrl: result.receiptUrl ?? null,
    });
    return { success: true, paymentId: result.paymentId, receiptUrl: result.receiptUrl };
  } catch (error: any) {
    const msg = error?.response?.data?.error ?? error?.message ?? "Payment failed.";
    set({ isProcessing: false, paymentError: msg, paymentSuccess: false });
    return { success: false };
  }
},


async fetchSlotDetails() {
  set({ isLoadingSlots: true });
  try {
    const result = await paymentService.getSlotDetails();
    set({ slotDetails: result, isLoadingSlots: false });
  } catch (error: any) {
    set({ isLoadingSlots: false });
  }
},



async fetchDealershipSubscription() {
  set({ isLoadingdealershipDetails: true });
  try {
    const result = await paymentService.fetchDealershipSubscription();
    set({ dealershipSubscriptionDetails: result, isLoadingdealershipDetails: false });
  } catch (error: any) {
    set({ isLoadingdealershipDetails: false });
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
import api from "@/lib/axios";

// ── Types ──────────────────────────────────────────────────────────────────

export type SlotPurchaseData = {
  paymentToken: string;  // tokenized card from Square Web SDK
  quantity: number;
  promoCode?: string;
  amount: number;        // in cents
};

export type GuestSlotPurchaseData = {
  paymentToken: string;
  email: string;
  fullName: string;
  quantity: number;
  promoCode?: string;
  amount: number;        // in cents
};

export type PaymentHistoryResponse = {
  payments: Payment[];
  invoices: Invoice[];
  subscription: SubscriptionDetails | null;
};

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created: string;
  receipt_url: string | null;
  transaction_type: string;
  slots_purchased: number | null;
  invoice_number: string | null;
};

export type Invoice = {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  created: string;
  paid_at: string | null;
  invoice_url: string | null;
};

export type SubscriptionDetails = {
  id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  tier: string;
};

// ── Service ────────────────────────────────────────────────────────────────

const paymentService = {

  // Private seller slot purchase (logged-in user)
  purchaseSlots: async (data: SlotPurchaseData) => {
    const res = await api.post("/api/payment/createCheckout", {
      type: "private_seller",
      paymentToken: data.paymentToken,
      quantity: data.quantity,
      promoCode: data.promoCode ?? null,
      amount: data.amount,
    });
    return res.data;
  },

  verifyDealership: async (data: { paymentToken: string; tierId: string }) => {
  const res = await api.post("/api/payment/createCheckout", {
    purpose: "dealership_verification",
    paymentToken: data.paymentToken,
    tierId: data.tierId,
  });
  return res.data;
},

  // Guest slot purchase (no account)
  purchaseSlotsAsGuest: async (data: GuestSlotPurchaseData) => {
    const res = await api.post("/api/payment/createGuestCheckout", {
      paymentToken: data.paymentToken,
      email: data.email,
      fullName: data.fullName,
      quantity: data.quantity,
      promoCode: data.promoCode ?? null,
      amount: data.amount,
    });
    return res.data;
  },

  // Verify a payment by ID
  verifyPayment: async (paymentId: string) => {
    const res = await api.post("/api/payments/verify-payment", { paymentId });
    return res.data;
  },

  // Get payment history
  getHistory: async (): Promise<PaymentHistoryResponse> => {
    const res = await api.get("/api/payment/getPaymentHistory");
    return res.data;
  },
};

export default paymentService;
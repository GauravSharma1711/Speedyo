import axios from "@/lib/axios";

export type SquareConfig = {
  applicationId: string;
  locationId: string;
};

export type PaymentResponse = {
  success: boolean;
  message?: string;
  paymentId: string;
  isGuest?: boolean;
  slotsPurchased?: number;
  error?: string;
};

export const guestPaymentService = {
  async getSquareConfig(): Promise<SquareConfig> {
    const res = await axios.get("/api/payment/getSquareConfig");
    return res.data;
  },

  async processPayment(data: {
    paymentToken: string;
    email: string;
    fullName: string;
    quantity: number;
    promoCode: string | null;
    amount: number;
    paymentType: "guest_private_seller" | "private_seller";
  }): Promise<PaymentResponse> {
    const res = await axios.post("/api/payment/processSquarePayment", data);
    return res.data;
  },

  async createGuestCheckout(data: {
    email: string;
    fullName: string;
    quantity: number;
    promoCode?: string;
    paymentToken: string;
  }): Promise<PaymentResponse> {
    const res = await axios.post("/api/payment/createGuestCheckout", data);
    return res.data;
  },
};
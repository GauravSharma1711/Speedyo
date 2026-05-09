import { squareClient } from "@/lib/payment/square";

export async function createSquareCustomer(user: {
  email: string;
  full_name?: string;
  phone?: string;
}) {
  const response = await squareClient.customers.create({
    emailAddress: user.email,
    givenName: user.full_name ?? undefined,
    phoneNumber: user.phone ?? undefined,
    idempotencyKey: `customer-${user.email}-${Date.now()}`,
  });

  return response.customer?.id;
}
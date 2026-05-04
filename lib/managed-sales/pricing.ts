export function calculateServiceFeeAmount(price: unknown): number {
  const numericPrice =
    typeof price === "number" ? price : parseFloat(String(price ?? ""));
  if (!numericPrice || Number.isNaN(numericPrice) || numericPrice <= 0) return 0;

  const p = Math.floor(numericPrice);

  if (p < 500) return 300;
  if (p <= 3000) return Math.round(300 + (p - 500) * 0.08);
  if (p <= 8333) return 500;
  return Math.round(p * 0.06);
}

export type ResolvedMsrPricing = {
  buyerPrice: number;
  serviceFee: number;
  ownerReceives: number;
};

export function resolvePricingFromMsr(msr: {
  final_sale_price_for_buyer?: unknown;
  owner_receives_amount?: unknown;
  service_fee_amount?: unknown;
  seller_asking_price?: unknown;
  edit_requests?: unknown;
}): ResolvedMsrPricing | null {
  const ext = msr as Record<string, unknown>;

  const fp = msr.final_sale_price_for_buyer;
  const or = msr.owner_receives_amount;
  const sf = msr.service_fee_amount;

  if (
    fp !== undefined &&
    fp !== null &&
    or !== undefined &&
    or !== null &&
    sf !== undefined &&
    sf !== null
  ) {
    const buyerPrice = Number(fp);
    const serviceFee = Number(sf);
    const ownerReceives = Number(or);
    if ([buyerPrice, serviceFee, ownerReceives].every((x) => !Number.isNaN(x))) {
      return { buyerPrice, serviceFee, ownerReceives };
    }
  }

  const asking = msr.seller_asking_price;
  if (asking !== undefined && asking !== null) {
    const ownerReceives = Number(asking);
    if (!Number.isNaN(ownerReceives) && ownerReceives > 0) {
      const serviceFee = calculateServiceFeeAmount(ownerReceives);
      return {
        buyerPrice: ownerReceives + serviceFee,
        serviceFee,
        ownerReceives,
      };
    }
  }

  const legacyBuyer = ext.calculated_buyer_price ?? ext.calculatedBuyerPrice;
  if (legacyBuyer !== undefined && legacyBuyer !== null) {
    const buyerPrice = Number(legacyBuyer);
    if (!Number.isNaN(buyerPrice) && buyerPrice > 0) {
      const sfRaw = ext.service_fee_amount ?? msr.service_fee_amount;
      const serviceFee =
        sfRaw !== undefined && sfRaw !== null && !Number.isNaN(Number(sfRaw))
          ? Number(sfRaw)
          : calculateServiceFeeAmount(buyerPrice);
      const ownerReceives = buyerPrice - serviceFee;
      if (!Number.isNaN(ownerReceives) && ownerReceives >= 0) {
        return { buyerPrice, serviceFee, ownerReceives };
      }
    }
  }

  const vd = ext.vehicle_details ?? ext.vehicleDetails;
  if (vd && typeof vd === "object" && vd !== null) {
    const nested = (vd as Record<string, unknown>).seller_asking_price;
    if (nested !== undefined && nested !== null) {
      const ownerReceives = Number(nested);
      if (!Number.isNaN(ownerReceives) && ownerReceives > 0) {
        const serviceFee = calculateServiceFeeAmount(ownerReceives);
        return {
          buyerPrice: ownerReceives + serviceFee,
          serviceFee,
          ownerReceives,
        };
      }
    }
  }

  return null;
}

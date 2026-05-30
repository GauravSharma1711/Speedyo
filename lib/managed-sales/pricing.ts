export function calculateServiceFeeAmount(price: unknown): number {
  const numericPrice =
    typeof price === "number" ? price : parseFloat(String(price ?? ""));
  if (!numericPrice || Number.isNaN(numericPrice) || numericPrice <= 0) return 0;

  const p = Math.floor(numericPrice);

  // if (p < 30000) return 300;
  // if (p <= 50000) return Math.round(300 + (p - 30000) * 0.08);
  // if (p <= 100000) return 500;
  // return Math.round(p * 0.06);

  
  if (p < 50000) return 30000;
if (p <= 300000) return Math.round(30000 + (p - 50000) * 0.08);
if (p <= 833300) return 50000;
return Math.round(p * 0.06);
}

export type ResolvedMsrPricing = {
  buyerPrice: number;
  serviceFee: number;
  ownerReceives: number;
};

export function resolvePricingFromMsr(msr: {
  listing_type?: unknown;
  final_sale_price_for_buyer?: unknown;
  owner_receives_amount?: unknown;
  service_fee_amount?: unknown;
  seller_asking_price?: unknown;
  edit_requests?: unknown;
  dealer_fee?: unknown;
}): ResolvedMsrPricing | null {
  const ext = msr as Record<string, unknown>;
  const listingType = msr.listing_type ?? ext.listing_type;

  // Direct listings: service fee is always 0, no bracket recalculation
  if (listingType === "direct") {
    const fp = msr.final_sale_price_for_buyer;
    const or = msr.owner_receives_amount;
    if (fp !== undefined && fp !== null) {
      const buyerPrice = Number(fp);
      const ownerReceives = or !== undefined && or !== null ? Number(or) : buyerPrice;
      if (!Number.isNaN(buyerPrice)) {
        return {
          buyerPrice,
          serviceFee: 0,
          ownerReceives: Number.isNaN(ownerReceives) ? buyerPrice : ownerReceives,
        };
      }
    }
    const asking = msr.seller_asking_price;
    if (asking !== undefined && asking !== null) {
      const ownerReceives = Number(asking);
      if (!Number.isNaN(ownerReceives) && ownerReceives > 0) {
        return { buyerPrice: ownerReceives, serviceFee: 0, ownerReceives };
      }
    }
    return { buyerPrice: 0, serviceFee: 0, ownerReceives: 0 };
  }

  // Managed sales: apply service fee brackets (existing logic)
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
      // include dealer misc fee (if provided) into buyer price for managed listings
      const dealerRaw = ext.dealer_fee ?? ext.dealerFee ?? null;
      const dealerFee =
        dealerRaw !== undefined && dealerRaw !== null && !Number.isNaN(Number(dealerRaw))
          ? Number(dealerRaw)
          : 0;
      return {
        buyerPrice: ownerReceives + serviceFee + dealerFee,
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
        const dealerRaw = ext.dealer_fee ?? ext.dealerFee ?? null;
        const dealerFee =
          dealerRaw !== undefined && dealerRaw !== null && !Number.isNaN(Number(dealerRaw))
            ? Number(dealerRaw)
            : 0;
        return {
          buyerPrice: ownerReceives + serviceFee + dealerFee,
          serviceFee,
          ownerReceives,
        };
      }
    }
  }

  return null;
}

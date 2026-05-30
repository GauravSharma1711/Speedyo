import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { marketplaceVehicleService } from "@/services/marketplace/vehicleServices";
import type {
  ListVehiclesParams,
  VehicleListItemApi,
} from "@/services/marketplace/vehicleServices";
import { calculateServiceFeeAmount } from "@/lib/managed-sales/pricing";

export type MarketplaceVehicle = {
  id: string;
  isDirectListing?:boolean,
  title?: string;
  make?: string;
  model?: string;
  description?: string;
  condition?: string;
  fuel_type?: string;
  location?: string;
  price?: number;
  dealer_fee?: number;
  buyer_total?: number;
  year?: number;
  mileage?: number;
  status?: string;
  featured?: boolean;
  verified?: boolean;
  views?: number;
  primary_image?: string;
  created_by_id?: string;
};

export type MarketplaceFilters = {
  make: string;
  priceRange: string;
  condition: string;
  fuelType: string;
  location: string;
};

type MarketplaceVehiclesState = {
  items: MarketplaceVehicle[];
  total: number;
  page: number;
  limit: number;

  search: string;
  sort: "recent" | "price_low" | "price_high" | "mileage" | "year";
  filters: MarketplaceFilters;

  isLoading: boolean;
  error: string | null;
};

type MarketplaceVehiclesActions = {
  fetch: () => Promise<void>;
  setSearch: (q: string) => void;
  setSort: (sort: MarketplaceVehiclesState["sort"]) => void;
  setFilters: (filters: MarketplaceFilters) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  clearFilters: () => void;
};

function toNumberOrUndefined(v: unknown): number | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  const n = Number.parseFloat(String(v));
  return Number.isFinite(n) ? n : undefined;
}

function normalizeVehicle(v: VehicleListItemApi): MarketplaceVehicle {
  const price = toNumberOrUndefined(v.price);
  const dealerFee = toNumberOrUndefined(v.dealer_fee);

  // Determine buyer-facing total safely:
  // Priority:
  // 1. server-provided `final_sale_price_for_buyer` (authoritative)
  // 2. direct listings -> buyer pays listed price (no Speedyo fee)
  // 3. if server returned seller_asking_price for this item, compute buyer total = asking + serviceFee + dealer_fee
  // 4. otherwise assume `v.price` is already the buyer-facing total (created by server/workflow)
  let buyerTotal: number | undefined;
  const serverProvided = toNumberOrUndefined((v as any).final_sale_price_for_buyer);
  const sellerAsking = toNumberOrUndefined((v as any).seller_asking_price ?? (v as any).vehicle_details?.seller_asking_price);

  if (serverProvided !== undefined) {
    buyerTotal = serverProvided;
  } else if (v.isDirectListing) {
    buyerTotal = price;
  } else if (sellerAsking !== undefined) {
    // compute from seller asking price + service fee + dealer misc fee
    let serviceFee = 0;
    try {
      serviceFee = calculateServiceFeeAmount(sellerAsking) ?? 0;
    } catch (e) {
      if (sellerAsking < 30000) serviceFee = 300;
      else if (sellerAsking <= 50000) serviceFee = Math.round(300 + (sellerAsking - 30000) * 0.08);
      else if (sellerAsking <= 100000) serviceFee = 500;
      else serviceFee = Math.round(sellerAsking * 0.06);
    }
    buyerTotal = sellerAsking + (dealerFee ?? 0) + serviceFee;
  } else {
    // Fallback: treat returned price as buyer total
    buyerTotal = price;
  }

  return {
    id: v.id,
    isDirectListing:v.isDirectListing,
    title: v.title ?? undefined,
    make: v.make ?? undefined,
    model: v.model ?? undefined,
    description: v.description ?? undefined,
    condition: v.condition ?? undefined,
    fuel_type: v.fuel_type ?? undefined,
    location: v.location ?? undefined,
    price: toNumberOrUndefined(v.price),
    dealer_fee: v.dealer_fee ?? undefined,
    buyer_total: buyerTotal ?? undefined,
    year: v.year ?? undefined,
    mileage: v.mileage ?? undefined,
    status: v.status ?? undefined,
    featured: Boolean(v.featured),
    verified: Boolean(v.verified),
    views: v.views ?? 0,
    primary_image: v.primary_image ?? undefined,
    created_by_id: v.authorId ?? undefined,
  };
}

function buildParams(state: MarketplaceVehiclesState): ListVehiclesParams {
  const sort =
    state.sort === "recent"
      ? ("-createdAt" as const)
      : state.sort === "price_low"
        ? ("price" as const)
        : state.sort === "price_high"
          ? ("-price" as const)
          : state.sort === "mileage"
            ? ("mileage" as const)
            : ("-year" as const);

  return {
    page: state.page,
    limit: state.limit,
    q: state.search,
    make: state.filters.make,
    condition: state.filters.condition,
    fuelType: state.filters.fuelType,
    location: state.filters.location,
    priceRange: state.filters.priceRange,
    sort,
  };
}

const EMPTY_FILTERS: MarketplaceFilters = {
  make: "",
  priceRange: "",
  condition: "",
  fuelType: "",
  location: "",
};

export const useMarketplaceVehiclesStore = create<
  MarketplaceVehiclesState & MarketplaceVehiclesActions
>()(
  immer((set, get) => ({
    items: [],
    total: 0,
    page: 1,
    limit: 24,

    search: "",
    sort: "recent",
    filters: EMPTY_FILTERS,

    isLoading: false,
    error: null,

    fetch: async () => {
      if (get().isLoading) return;
      set((s) => {
        s.isLoading = true;
        s.error = null;
      });

      try {
        const params = buildParams(get());
        const res = await marketplaceVehicleService.list(params);
        set((s) => {
          s.items = res.vehicles.map(normalizeVehicle);
          s.total = res.total;
          s.page = res.page;
          s.limit = res.limit;
        });
      } catch (e) {
        const msg =
          typeof e === "object" && e !== null && "response" in e
            ? String((e as any).response?.data?.error ?? "Failed to load vehicles")
            : e instanceof Error
              ? e.message
              : "Failed to load vehicles";
        set((s) => {
          s.error = msg;
        });
      } finally {
        set((s) => {
          s.isLoading = false;
        });
      }
    },

    setSearch: (q) =>
      set((s) => {
        s.search = q;
        s.page = 1;
      }),
    setSort: (sort) =>
      set((s) => {
        s.sort = sort;
        s.page = 1;
      }),
    setFilters: (filters) =>
      set((s) => {
        s.filters = filters;
        s.page = 1;
      }),
    setPage: (page) =>
      set((s) => {
        s.page = page;
      }),
    setLimit: (limit) =>
      set((s) => {
        s.limit = limit;
        s.page = 1;
      }),
    clearFilters: () =>
      set((s) => {
        s.filters = EMPTY_FILTERS;
        s.page = 1;
      }),
  }))
);


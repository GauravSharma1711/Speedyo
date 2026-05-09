"use client"

import React, { useEffect, useMemo, useState } from "react";
import { Search, Car, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";

import VehicleCard from "../marketplace/VehicleCard";
import SearchFilters from "../marketplace/SearchFilters";
import { useMarketplaceVehiclesStore } from "@/store/marketplace/vehicles";

const SEARCH_DEBOUNCE_MS = 400;

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const items = useMarketplaceVehiclesStore((s) => s.items);
  const total = useMarketplaceVehiclesStore((s) => s.total);
  const isLoading = useMarketplaceVehiclesStore((s) => s.isLoading);
  const error = useMarketplaceVehiclesStore((s) => s.error);
  const sort = useMarketplaceVehiclesStore((s) => s.sort);
  const filters = useMarketplaceVehiclesStore((s) => s.filters);
  const setFilters = useMarketplaceVehiclesStore((s) => s.setFilters);
  const setSort = useMarketplaceVehiclesStore((s) => s.setSort);
  const setSearch = useMarketplaceVehiclesStore((s) => s.setSearch);
  const fetch = useMarketplaceVehiclesStore((s) => s.fetch);

  const vehiclesForMakeOptions = useMemo(() => items, [items]);

  useEffect(() => {
    fetch();
    if (window.innerWidth >= 768) {
      setIsFiltersOpen(true);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchTerm);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchTerm, setSearch]);

  useEffect(() => {
    fetch();
  }, [filters, sort, fetch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-2 sm:p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header content removed as per instructions */}

        {/* Search Bar */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base sm:text-lg border-slate-200 focus:ring-2 focus:ring-blue-500" />

              </div>
              <Button
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 h-12 px-6 sm:px-8"
                onClick={() => fetch()}
                disabled={isLoading}
              >
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          vehicles={vehiclesForMakeOptions}
          isOpen={isFiltersOpen}
        />

        {/* Results Summary & Filter Toggle for Mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <p className="text-slate-600 text-sm sm:text-base">
            Showing {items.length} of {total} vehicles
          </p>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 md:hidden flex items-center justify-center gap-2 h-10 text-sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter className="w-4 h-4" />
              <span>{isFiltersOpen ? 'Hide' : 'Show'} Filters</span>
            </Button>
            <Select value={sort} onValueChange={(v) => setSort(v as any)}>
              <SelectTrigger className="flex-1 sm:w-48 h-10 text-sm">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent" className="text-sm">Most Recent</SelectItem>
                <SelectItem value="price_low" className="text-sm">Price: Low to High</SelectItem>
                <SelectItem value="price_high" className="text-sm">Price: High to Low</SelectItem>
                <SelectItem value="mileage" className="text-sm">Lowest Mileage</SelectItem>
                <SelectItem value="year" className="text-sm">Newest Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </div>
        )}

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {items.map((vehicle, index) =>
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}>

                <VehicleCard
                  vehicle={vehicle}
                />

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {items.length === 0 && !isLoading &&
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No vehicles found</h3>
            <p className="text-slate-500">Try adjusting your search terms or filters</p>
          </div>
        }
      </div>
    </div>);

}
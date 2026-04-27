"use client"

import React, { useState, useEffect, useCallback } from "react";
import { Vehicle } from "@/api/entities";
import { Search, Car, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { motion, AnimatePresence } from "framer-motion";

import VehicleCard from "../marketplace/VehicleCard";
import SearchFilters from "../marketplace/SearchFilters";

export default function Marketplace() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    make: "",
    priceRange: "",
    condition: "",
    fuelType: "",
    location: ""
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    const allVehiclesData = await Vehicle.list("-created_date", 100); // Fetch all vehicles
    const filteredByStatus = allVehiclesData.filter(v => v.status === 'available' || v.status === 'unavailable');
    setVehicles(filteredByStatus);
    setFilteredVehicles(filteredByStatus);
    setIsLoading(false);
  };

  const filterVehicles = useCallback(() => {
    let filtered = vehicles;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter((vehicle) =>
        vehicle.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.make) {
      filtered = filtered.filter((vehicle) => vehicle.make === filters.make);
    }
    if (filters.condition) {
      filtered = filtered.filter((vehicle) => vehicle.condition === filters.condition);
    }
    if (filters.fuelType) {
      filtered = filtered.filter((vehicle) => vehicle.fuel_type === filters.fuelType);
    }
    if (filters.location) {
      filtered = filtered.filter((vehicle) =>
        vehicle.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter((vehicle) => {
        if (max) {
          return vehicle.price >= min && vehicle.price <= max;
        }
        return vehicle.price >= min;
      });
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm, filters]);

  useEffect(() => {
    loadData();
    // Set initial filter visibility based on screen size, but don't add a resize listener
    // that would interfere with the mobile keyboard.
    if (window.innerWidth >= 768) { // md breakpoint
      setIsFiltersOpen(true);
    }
  }, []);

  useEffect(() => {
    filterVehicles();
  }, [filterVehicles]);

  const getUserByEmail = (email) => {
    // This function is now a placeholder. The required info is on the vehicle object.
    // The VehicleCard component is updated to use vehicle.author_name etc.
    return { email };
  };

  // Helper function for creating page URLs
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "Contact":
        return "/contact";
      // Add other page mappings if necessary
      default:
        return `/${pageName.toLowerCase()}`;
    }
  };

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
              <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 h-12 px-6 sm:px-8">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <SearchFilters filters={filters} setFilters={setFilters} vehicles={vehicles} isOpen={isFiltersOpen} />

        {/* Results Summary & Filter Toggle for Mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <p className="text-slate-600 text-sm sm:text-base">
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
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
            <Select defaultValue="recent">
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


        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredVehicles.map((vehicle, index) =>
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}>

                <VehicleCard
                  vehicle={vehicle}
                  seller={getUserByEmail(vehicle.created_by)} />

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filteredVehicles.length === 0 && !isLoading &&
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No vehicles found</h3>
            <p className="text-slate-500">Try adjusting your search terms or filters</p>
          </div>
        }
      </div>
    </div>);

}
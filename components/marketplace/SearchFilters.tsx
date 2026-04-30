import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Filter, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchFilters({ filters, setFilters, vehicles, isOpen }) {
  const makes = [...new Set(vehicles.map(v => v.make).filter(Boolean))];
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      make: "",
      priceRange: "",
      condition: "",
      fuelType: "",
      location: ""
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <Card className="bg-white border border-slate-200 shadow-sm mt-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  className="ml-auto text-slate-500 hover:text-slate-700 h-8 px-2 sm:px-3"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="text-xs sm:text-sm">Clear All</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <Select value={filters.make} onValueChange={(value) => handleFilterChange('make', value)}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm border-slate-200 bg-white">
                    <SelectValue placeholder="Make" />
                  </SelectTrigger>
                  <SelectContent>
                    {makes.map((make) => (
                      <SelectItem key={make} value={make} className="text-sm">{make}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm border-slate-200 bg-white">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-10000" className="text-sm">Under $10,000</SelectItem>
                    <SelectItem value="10000-25000" className="text-sm">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25000-50000" className="text-sm">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50000-100000" className="text-sm">$50,000 - $100,000</SelectItem>
                    <SelectItem value="100000-999999" className="text-sm">$100,000+</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm border-slate-200 bg-white">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent" className="text-sm">Excellent</SelectItem>
                    <SelectItem value="good" className="text-sm">Good</SelectItem>
                    <SelectItem value="fair" className="text-sm">Fair</SelectItem>
                    <SelectItem value="poor" className="text-sm">Poor</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.fuelType} onValueChange={(value) => handleFilterChange('fuelType', value)}>
                  <SelectTrigger className="h-10 sm:h-11 text-sm border-slate-200 bg-white">
                    <SelectValue placeholder="Fuel Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasoline" className="text-sm">Gasoline</SelectItem>
                    <SelectItem value="diesel" className="text-sm">Diesel</SelectItem>
                    <SelectItem value="hybrid" className="text-sm">Hybrid</SelectItem>
                    <SelectItem value="electric" className="text-sm">Electric</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="border-slate-200 bg-white h-10 sm:h-11 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
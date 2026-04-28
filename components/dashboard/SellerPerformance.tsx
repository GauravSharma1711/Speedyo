import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, MessageCircle, Car, DollarSign } from "lucide-react";
import VehicleAnalytics from "./VehicleAnalytics";

export default function SellerPerformance({ vehicles, messages, posts }) {
  const totalViews = vehicles.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalListings = vehicles.length;
  const avgPrice = vehicles.length > 0 ? vehicles.reduce((sum, v) => sum + (v.price || 0), 0) / vehicles.length : 0;
  const activeListings = vehicles.filter(v => v.status === 'available').length;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20">
          <CardContent className="p-4 text-center">
            <Car className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{activeListings}</div>
            <div className="text-sm text-slate-600">Active Listings</div>
            <div className="text-xs text-slate-500">of {totalListings} total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald-700">{totalViews.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Total Views</div>
            <div className="text-xs text-slate-500">all time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{messages.length}</div>
            <div className="text-sm text-slate-600">Inquiries</div>
            <div className="text-xs text-slate-500">all time</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-amber-700">${Math.round(avgPrice).toLocaleString()}</div>
            <div className="text-sm text-slate-600">Avg. Price</div>
            <div className="text-xs text-slate-500">your listings</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <VehicleAnalytics vehicles={vehicles} messages={messages} />
    </div>
  );
}
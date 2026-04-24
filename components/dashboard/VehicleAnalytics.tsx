import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MessageCircle, 
  Calendar,
  Target
} from "lucide-react";
import { format } from "date-fns";

export default function VehicleAnalytics({ vehicles, messages }) {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalInquiries: 0,
    avgViewsPerListing: 0,
    topPerforming: null,
    viewsTrend: 0,
    inquiriesTrend: 0
  });

  useEffect(() => {
    calculateAnalytics();
  }, [vehicles, messages, selectedPeriod]);

  const calculateAnalytics = () => {
    if (vehicles.length === 0) {
      setAnalytics({
        totalViews: 0,
        totalInquiries: 0,
        avgViewsPerListing: 0,
        topPerforming: null,
        viewsTrend: 0,
        inquiriesTrend: 0
      });
      return;
    }

    const totalViews = vehicles.reduce((sum, vehicle) => sum + (vehicle.views || 0), 0);
    const totalInquiries = messages.filter(m => m.message_type === 'inquiry').length;
    const avgViewsPerListing = vehicles.length > 0 ? Math.round(totalViews / vehicles.length) : 0;
    
    const topPerforming = vehicles.reduce((prev, current) => 
      (prev.views || 0) > (current.views || 0) ? prev : current
    );

    // Simulate trends (in a real app, you'd compare with previous periods)
    const viewsTrend = Math.floor(Math.random() * 20) - 5; // Random between -5 and +15
    const inquiriesTrend = Math.floor(Math.random() * 15); // Random between 0 and +15

    setAnalytics({
      totalViews,
      totalInquiries,
      avgViewsPerListing,
      topPerforming,
      viewsTrend,
      inquiriesTrend
    });
  };

  const MetricCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue" }) => (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-sm font-semibold text-slate-600">{title}</p>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {trend !== undefined && (
            <div className="text-right">
              <TrendingUp className={`w-4 h-4 ml-auto ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              <span className={`text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center gap-4">
        <h3 className="text-xl font-semibold text-slate-800">Performance Analytics</h3>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period 
                ? 'bg-gradient-to-r from-blue-500 to-emerald-500' 
                : 'hover:bg-blue-50'
              }
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          icon={Eye} 
          title="Total Views" 
          value={analytics.totalViews.toLocaleString()}
          subtitle="All listings"
          trend={analytics.viewsTrend}
          color="blue"
        />
        <MetricCard 
          icon={MessageCircle} 
          title="Inquiries" 
          value={analytics.totalInquiries}
          subtitle="This period"
          trend={analytics.inquiriesTrend}
          color="emerald"
        />
        <MetricCard 
          icon={Target} 
          title="Avg Views/Listing" 
          value={analytics.avgViewsPerListing}
          subtitle="Performance metric"
          color="purple"
        />
        <MetricCard 
          icon={BarChart3} 
          title="Conversion Rate" 
          value={analytics.totalViews > 0 ? `${Math.round((analytics.totalInquiries / analytics.totalViews) * 100)}%` : '0%'}
          subtitle="Inquiries/Views"
          color="amber"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Listing */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Top Performing Listing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPerforming ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-100">
                  <h4 className="font-bold text-slate-800 mb-2">{analytics.topPerforming.title}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Views</p>
                      <p className="text-xl font-bold text-emerald-600">{analytics.topPerforming.views || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Price</p>
                      <p className="text-xl font-bold text-blue-600">${analytics.topPerforming.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge className={
                      analytics.topPerforming.status === 'available' ? 'bg-emerald-500' :
                      analytics.topPerforming.status === 'pending' ? 'bg-amber-500' : 'bg-slate-500'
                    }>
                      {analytics.topPerforming.status}
                    </Badge>
                    <Badge variant="outline">
                      {analytics.topPerforming.year} {analytics.topPerforming.make}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No listings available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Recent Inquiry Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.filter(m => m.message_type === 'inquiry').slice(0, 5).map((inquiry, index) => (
                <div key={inquiry.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Vehicle Inquiry</p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(inquiry.created_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    New
                  </Badge>
                </div>
              ))}
              {messages.filter(m => m.message_type === 'inquiry').length === 0 && (
                <p className="text-slate-500 text-center py-4">No inquiries yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listing Performance Breakdown */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Individual Listing Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {vehicles.slice(0, 5).map((vehicle, index) => (
              <div key={vehicle.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{vehicle.title}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-slate-500">
                      Listed {format(new Date(vehicle.created_date), 'MMM d')}
                    </span>
                    <Badge className={
                      vehicle.status === 'available' ? 'bg-emerald-500' :
                      vehicle.status === 'pending' ? 'bg-amber-500' : 'bg-slate-500'
                    }>
                      {vehicle.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{vehicle.views || 0}</p>
                      <p className="text-xs text-slate-500">Views</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-600">${vehicle.price?.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">Price</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
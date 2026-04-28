  "use client"
  
  import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import FeedFilters from "./FeedFilters";
import { Card, CardContent } from "@/components/ui/Card";
import { Car } from "lucide-react";

export default function Feed({ posts, users, vehicles, onPostCreated, onReact, onComment, onShare }) {
  const [filteredPosts, setFilteredPosts] = useState(posts);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  const handleFilterChange = (filters) => {
    // Basic filtering logic, can be expanded
    let newFilteredPosts = [...posts];
    if (filters.postType !== "all") {
      newFilteredPosts = newFilteredPosts.filter(p => p.post_type === filters.postType);
    }
    setFilteredPosts(newFilteredPosts);
  };

  const getUserById = (email) => {
    return users.find((u) => u.email === email);
  };

  const getVehicleById = (vehicleId) => {
    return vehicles.find((v) => v.id === vehicleId);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters */}
        <div className="lg:col-span-1">
          <FeedFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Main Feed Content */}
        <div className="lg:col-span-3 space-y-6">
          <CreatePost onPostCreated={onPostCreated} />

          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={getUserById(post.created_by)}
              vehicle={post.related_vehicle_id ? getVehicleById(post.related_vehicle_id) : null}
              onReact={onReact}
              onComment={onComment}
              onShare={onShare}
            />
          ))}
        </div>
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Featured Vehicles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles
            .filter(vehicle => vehicle.featured && vehicle.status === 'available') // Only show featured and available vehicles
            .slice(0, 3)
            .map((vehicle) => (
              <Card key={vehicle.id} className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-lg relative overflow-hidden">
                  {vehicle.primary_image ? (
                    <img
                      src={vehicle.primary_image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg">{vehicle.title}</h3>
                  <p className="text-blue-600 font-semibold mt-1">${vehicle.price?.toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </>
  );
}
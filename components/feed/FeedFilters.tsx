
"use client"

import React, { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Clock, TrendingUp, Eye, Activity, Zap, Flame, ChevronLeft, ChevronRight } from "lucide-react";

export default function FeedFilters({ sortBy, setSortBy }) {
  const filters = [
    { id: "recent", label: "Most Recent", icon: Clock, description: "Latest posts first" },
    { id: "popular", label: "Most Popular", icon: TrendingUp, description: "Based on likes & reactions" },
    { id: "viewed", label: "Most Viewed", icon: Eye, description: "Highest view count" },
    { id: "interactive", label: "Most Interactive", icon: Activity, description: "Comments + shares + reactions" },
    { id: "trending", label: "Trending Now", icon: Flame, description: "Hot posts right now" },
    { id: "engagement", label: "Engagement Score", icon: Zap, description: "AI-calculated engagement" }
  ];

  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Added a small threshold (5px) for showRight to prevent premature hiding
      // due to potential sub-pixel rendering or scroll snap issues.
      setShowLeft(scrollLeft > 0);
      setShowRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    checkScroll(); // Initial check on mount
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Debounce resize events if performance becomes an issue, but for now, direct listener is fine.
      window.addEventListener("resize", checkScroll);
    }
    // Cleanup function
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4 relative">
        {/* Scroll Left Button */}
        {showLeft && ( // Conditionally render button based on scroll position
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-white/70 hover:bg-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}

        {/* Scrollable Filters */}
        <div
          ref={scrollRef}
          className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={sortBy === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(filter.id)}
              className={`transition-all duration-200 flex-shrink-0 ${
                sortBy === filter.id
                  ? "bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white" // Added text-white for gradient buttons
                  : "hover:bg-blue-50 hover:text-blue-600"
              }`}
              title={filter.description}
            >
              <filter.icon className="w-4 h-4 mr-2" />
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Scroll Right Button */}
        {showRight && ( // Conditionally render button based on scroll position
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex bg-white/70 hover:bg-white"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

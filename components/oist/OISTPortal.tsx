"use client";

import React, { useMemo, useState } from "react";

import Footer from "@/components/layout/Footer";
import OISTBuyCar from "@/components/oist/OISTBuyCar";
import OISTSellCar from "@/components/oist/OISTSellCar";
import OISTTradeIn from "@/components/oist/OISTTradeIn";
import OISTWelcome from "@/components/oist/OISTWelcome";

type Service = "welcome" | "buy" | "sell" | "trade-in";

export default function OISTPortal() {
  const [service, setService] = useState<Service>("welcome");

  const content = useMemo(() => {
    switch (service) {
      case "buy":
        return <OISTBuyCar onBack={() => setService("welcome")} />;
      case "sell":
        return <OISTSellCar onBack={() => setService("welcome")} />;
      case "trade-in":
        return <OISTTradeIn onBack={() => setService("welcome")} />;
      case "welcome":
      default:
        return <OISTWelcome onSelectService={(s) => setService(s)} />;
    }
  }, [service]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      <div className="max-w-6xl mx-auto px-4 py-12">{content}</div>
      <Footer />
    </div>
  );
}


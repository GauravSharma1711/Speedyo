"use client"
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, DollarSign, RefreshCw } from "lucide-react";

export default function OISTWelcome({ onSelectService }) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png"
          alt="Speedio Logo"
          className="h-12 mx-auto mb-6"
        />
        <div className="relative mb-8">
          <img
            src="https://nxlgznimtbcesgofxlkv.supabase.co/storage/v1/object/public/Speedio/OIST%20community.png"
            alt="OIST Community"
            className="w-full h-80 object-cover rounded-2xl shadow-xl"
            loading="lazy"
            srcSet="https://nxlgznimtbcesgofxlkv.supabase.co/storage/v1/object/public/Speedio/OIST%20community.png?width=640 640w,
                    https://nxlgznimtbcesgofxlkv.supabase.co/storage/v1/object/public/Speedio/OIST%20community.png?width=1024 1024w,
                    https://nxlgznimtbcesgofxlkv.supabase.co/storage/v1/object/public/Speedio/OIST%20community.png 1920w"
            sizes="(max-width: 768px) 640px, (max-width: 1024px) 1024px, 1920px"
          />
          <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome OIST Community Members
            </h1>
            <p className="text-lg md:text-xl text-white/95 max-w-2xl drop-shadow-lg">
              Comprehensive vehicle buying and selling services for the OIST community.
            </p>
          </div>
        </div>
      </div>

      {/* About Speedio */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Speedio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-700 leading-relaxed">
            Whether you're new to Okinawa and looking for a reliable vehicle, or preparing to leave the island and need to sell your car, Speedio is here to help.
          </p>
          <p className="text-slate-700 leading-relaxed">
            We provide comprehensive vehicle buying and selling services designed specifically for the OIST community, making your car journey in Okinawa smooth and hassle-free.
          </p>
        </CardContent>
      </Card>

      {/* Service Selection */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
          How can Speedio help you today?
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Buy a Car */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => onSelectService("buy")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Buy a Car</h3>
              <p className="text-slate-600 mb-4">
                Browse verified listings and find your perfect vehicle on Okinawa
              </p>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Sell a Car */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => onSelectService("sell")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Sell a Car</h3>
              <p className="text-slate-600 mb-4">
                List your vehicle or let Speedio handle the entire selling process
              </p>
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
                Get Started
              </Button>
            </CardContent>
          </Card>

          {/* Trade-in */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={() => onSelectService("trade-in")}>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Trade-in a Vehicle</h3>
              <p className="text-slate-600 mb-4">
                Get a quote for your current vehicle and upgrade to a new one
              </p>
              <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
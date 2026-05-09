"use client"
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { X, ShoppingCart, Plus, Minus, ArrowRight, AlertTriangle } from 'lucide-react';


export default function BuyMoreSlotsModal({ isOpen, onClose, currentSlots }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  
  const pricePerSlot = 50;
  const totalPrice = pricePerSlot * quantity;
  
  // Check if user has 3 or more available slots
  const hasMaxSlots = currentSlots.remaining >= 3;

  const createCheckoutUrl = () => {
    const params = new URLSearchParams({
      type: 'private_seller',
      name: 'Private Seller Vehicle Slots',
      price: ' ¥50',
      quantity: quantity.toString()
    });
  return `/Checkout?${params.toString()}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="shadow-2xl border-2 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-blue-50 to-emerald-50">
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
                Buy More Vehicle Slots
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Current Status - Hidden on Mobile */}
              <div className="hidden md:block bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Current Status</h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{currentSlots.purchased}</p>
                    <p className="text-xs text-slate-600">Purchased</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-600">{currentSlots.used}</p>
                    <p className="text-xs text-slate-600">Used</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">{currentSlots.remaining}</p>
                    <p className="text-xs text-slate-600">Remaining</p>
                  </div>
                </div>
              </div>

              {/* Maximum Slots Alert */}
              {hasMaxSlots && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Maximum Available Slots Reached</strong>
                    <p className="text-sm mt-1">
                      You currently have {currentSlots.remaining} unused slot{currentSlots.remaining > 1 ? 's' : ''}. 
                      Please use some of your existing slots before purchasing more. You can purchase additional slots once you have fewer than 3 available.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Slot Selection */}
              {!hasMaxSlots && (
                <>
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">
                      How many additional slots do you want?
                    </label>
                    <div className="flex items-center justify-between bg-white p-4 rounded-lg border-2 border-blue-200">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-12 w-12"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{quantity}</div>
                        <p className="text-xs text-slate-500 mt-1">
                          vehicle slot{quantity > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setQuantity(Math.min(3, quantity + 1))}
                        disabled={quantity >= 3}
                        className="h-12 w-12"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>
                    <p className="text-xs text-center text-slate-500">
                      Select 1-3 additional vehicle slots
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">Price per slot:</span>
                      <span className="font-medium text-slate-900">${pricePerSlot}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-700">Quantity:</span>
                      <span className="font-medium text-slate-900">× {quantity}</span>
                    </div>
                    <div className="pt-2 border-t border-blue-300">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-900 font-semibold">Total:</span>
                        <span className="text-3xl font-bold text-blue-600">${totalPrice}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 text-right">One-time payment</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="border-t bg-slate-50 p-4">
              {hasMaxSlots ? (
                <Button 
                  onClick={onClose}
                  className="w-full text-lg py-6"
                  variant="outline"
                >
                  Close
                </Button>
              ) : (
             <Button 
  onClick={() => router.push(createCheckoutUrl())}
  className="w-full text-lg py-6 bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
>
  Proceed to Payment
  <ArrowRight className="ml-2 h-5 w-5" />
</Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

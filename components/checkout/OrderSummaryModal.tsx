
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, ShoppingCart, ArrowRight, Minus, Plus, Tag, Check, AlertCircle } from 'lucide-react';

export default function OrderSummaryModal({ plan, onClose }: { plan: any, onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  const isPrivateSeller = plan.type === 'private_seller';
  const pricePerUnit = isPrivateSeller ? 50 : parseFloat(plan.price.replace('$', '')); // $50 per slot
  
  // Calculate discount (20% for SELLER20)
  const discountPercentage = promoApplied ? 0.20 : 0;
  const subtotal = isPrivateSeller ? pricePerUnit * quantity : pricePerUnit;
  const discountAmount = subtotal * discountPercentage;
  const totalPrice = subtotal - discountAmount;

  const handleApplyPromo = () => {
    setIsValidatingPromo(true);
    setPromoError('');
    
    // Simulate validation (actual validation happens in backend)
    setTimeout(() => {
      const upperPromo = promoCode.toUpperCase().trim();
      if (upperPromo === 'SELLER20') {
        setPromoApplied(true);
        setPromoError('');
      } else {
        setPromoError('Invalid promo code');
        setPromoApplied(false);
      }
      setIsValidatingPromo(false);
    }, 500);
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoError('');
  };

  const handleCheckout = async () => {
    const params = new URLSearchParams({
      type: plan.type,
      name: plan.name,
      price: plan.price,
    });
    
    if (plan.tierId) {
      params.append('tierId', plan.tierId);
    }
    
    if (isPrivateSeller) {
      params.append('quantity', quantity.toString());
    }

    if (promoApplied && promoCode) {
      params.append('promoCode', promoCode.toUpperCase().trim());
    }
    
    window.location.href = `/Checkout?${params.toString()}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
              Order Summary
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-600">You have selected the following plan. Please review and proceed to payment.</p>
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
              
              {isPrivateSeller ? (
                <>
                  <p className="text-sm text-slate-500 mt-2"> ¥50 per vehicle slot</p>
                  
                  <div className="mt-4 space-y-3">
                    <label className="text-sm font-medium text-slate-700">How many vehicles do you want to sell?</label>
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-2xl font-bold text-slate-800">{quantity}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setQuantity(Math.min(3, quantity + 1))}
                        disabled={quantity >= 3}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 text-center">Select 1-3 vehicle slots</p>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-3xl font-extrabold text-blue-600 mt-2">{plan.price}</p>
                  <p className="text-sm text-slate-500">{plan.type === 'dealership' ? 'per month' : 'one-time'}</p>
                </>
              )}
            </div>

            {/* Promo Code Section - Only for Private Seller */}
            {isPrivateSeller && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Have a promo code?
                </label>
                {!promoApplied ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoError('');
                      }}
                      className="flex-1"
                      disabled={isValidatingPromo}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleApplyPromo}
                      disabled={!promoCode.trim() || isValidatingPromo}
                    >
                      {isValidatingPromo ? 'Validating...' : 'Apply'}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium text-green-700">
                        {promoCode.toUpperCase()} applied (20% off)
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleRemovePromo}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                {promoError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {promoError}
                  </div>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            {isPrivateSeller && (
              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span> ¥{subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (20%):</span>
                    <span> ¥{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-slate-800 font-semibold">Total:</span>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-blue-600"> ¥{totalPrice.toFixed(2)}</span>
                    <p className="text-xs text-slate-500 mt-1">
                      One-time payment for {quantity} vehicle slot{quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleCheckout} className="w-full text-lg py-6">
              Proceed to Payment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </motion.div>
  );
}

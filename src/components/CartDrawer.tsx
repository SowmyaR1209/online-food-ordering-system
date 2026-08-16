import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck, MapPin, Sparkles, Check } from 'lucide-react';
import { CartItem, Address, Restaurant } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentRestaurant: Restaurant | null;
  onAddToCart: (item: any) => void;
  onRemoveFromCart: (itemId: string) => void;
  onClearCart: () => void;
  selectedAddress: Address | null;
  onSelectAddress: () => void;
  onProceedToCheckout: (appliedDiscount: number, note: string) => void;
  isProcessingCheckout: boolean;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  currentRestaurant,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  selectedAddress,
  onSelectAddress,
  onProceedToCheckout,
  isProcessingCheckout,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState('');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 40.00 : 0;
  const taxAndPacking = subtotal > 0 ? Number((subtotal * 0.05 + 25.00).toFixed(2)) : 0;
  const totalAmount = Math.max(0, subtotal + deliveryFee + taxAndPacking - appliedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === 'BITEDASH50' || code === 'SAVE50' || code === 'SAVE5') {
      setAppliedDiscount(50.00);
      setPromoMessage('🎉 ₹50.00 discount applied successfully!');
    } else if (code === 'TASTY10' || code === 'FIRST10') {
      const discount = Number((subtotal * 0.10).toFixed(2));
      setAppliedDiscount(discount);
      setPromoMessage(`🎉 10% discount (₹${discount.toFixed(2)}) applied!`);
    } else if (code === 'FREEDELIVERY') {
      setAppliedDiscount(40.00);
      setPromoMessage('🎉 Free delivery promo (₹40 OFF) applied!');
    } else {
      setPromoMessage('❌ Invalid coupon code. Try BITEDASH50 or TASTY10');
      setAppliedDiscount(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif]">Your Cart</h2>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                  {currentRestaurant ? currentRestaurant.name : 'Selected Items'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={onClearCart}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer text-xs font-semibold"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                id="close-cart-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
                    Explore top rated restaurants and add delicious items to your order.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-extrabold shadow-md hover:bg-orange-600 transition cursor-pointer"
                >
                  Explore Restaurants
                </button>
              </div>
            ) : (
              <>
                {/* Item List */}
                <div className="space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Order Items ({cart.reduce((sum, i) => sum + i.quantity, 0)})
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                    {cart.map((item) => (
                      <div key={item.menuItem.id} className="py-2.5 px-2 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-xs text-slate-900 line-clamp-1">{item.menuItem.name}</p>
                          <p className="text-[11px] text-slate-500">
                            ₹{item.menuItem.price.toFixed(2)} each
                          </p>
                        </div>

                        {/* Quantity Counter */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs text-xs font-bold">
                          <button
                            onClick={() => onRemoveFromCart(item.menuItem.id)}
                            className="px-2 py-1 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-l-lg transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 min-w-5 text-center text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => onAddToCart(item.menuItem)}
                            className="px-2 py-1 text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-r-lg transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item total */}
                        <div className="text-right min-w-[50px]">
                          <span className="font-extrabold text-xs text-slate-900">
                            ₹{(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address section */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Delivering To</span>
                    <button
                      onClick={onSelectAddress}
                      className="text-orange-600 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">
                        {selectedAddress ? selectedAddress.label : 'Select Delivery Address'}
                      </p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {selectedAddress
                          ? `${selectedAddress.street}, ${selectedAddress.city} ${selectedAddress.zip}`
                          : 'Please choose where to deliver your food.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Promo Code Form */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Offers & Promos
                  </div>
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="promo-code-input"
                        type="text"
                        placeholder="Try 'BITEDASH50' or 'TASTY10'"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-8.5 pr-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-orange-500 outline-hidden uppercase font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                  {promoMessage && (
                    <p className={`text-[11px] font-medium ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>

                {/* Order Note */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Cooking / Delivery Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave with security, extra napkins, cutlery..."
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>

                {/* Bill Details */}
                <div className="space-y-2.5 pt-3 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Bill Summary
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Item Total</span>
                      <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-slate-900">₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Restaurant Packing</span>
                      <span className="font-semibold text-slate-900">₹{taxAndPacking.toFixed(2)}</span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Coupon Discount</span>
                        <span>-₹{appliedDiscount.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                      <span>Total Amount</span>
                      <span className="text-orange-600 font-['Outfit',sans-serif] text-base font-black">
                        ₹{totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Checkout action */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white space-y-3">
              <button
                id="checkout-razorpay-btn"
                disabled={isProcessingCheckout}
                onClick={() => onProceedToCheckout(appliedDiscount, orderNote)}
                className="w-full py-3.5 px-4 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-between transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <div className="text-left">
                  <div className="text-[11px] font-semibold text-orange-100 uppercase tracking-wider">Pay with Razorpay</div>
                  <div className="text-base font-black font-['Outfit',sans-serif]">₹{totalAmount.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold">
                  {isProcessingCheckout ? (
                    <span>Opening Checkout...</span>
                  ) : (
                    <>
                      <span>Proceed to Pay</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secured by Razorpay • 256-Bit SSL Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

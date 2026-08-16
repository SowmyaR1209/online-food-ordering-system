import React, { useState } from 'react';
import { CheckCircle2, Clock, MapPin, ChefHat, Bike, Home, Phone, MessageSquare, ShieldCheck, Sparkles, ArrowRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface LiveOrderTrackerProps {
  orders: Order[];
  onAdvanceOrderStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  onReorder: (order: Order) => void;
  onExploreMore: () => void;
}

const STATUS_STEPS: { key: OrderStatus; label: string; desc: string; icon: any }[] = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Waiting for restaurant confirmation', icon: Clock },
  { key: 'PREPARING', label: 'Kitchen Preparing', desc: 'Chef is cooking your fresh dishes', icon: ChefHat },
  { key: 'SHIPPED', label: 'On The Way', desc: 'Delivery partner has picked up your food', icon: Bike },
  { key: 'DELIVERED', label: 'Delivered Fresh', desc: 'Order completed. Enjoy your meal!', icon: Home },
];

export const LiveOrderTracker: React.FC<LiveOrderTrackerProps> = ({
  orders,
  onAdvanceOrderStatus,
  onReorder,
  onExploreMore,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'PREPARING':
        return 1;
      case 'SHIPPED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = activeOrder ? getStepIndex(activeOrder.status) : 0;

  const handleNextStatus = async () => {
    if (!activeOrder) return;
    const nextStatuses: { [key in OrderStatus]: OrderStatus | null } = {
      PENDING: 'PREPARING',
      PREPARING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
      DELIVERED: null,
    };

    const next = nextStatuses[activeOrder.status];
    if (next) {
      await onAdvanceOrderStatus(activeOrder.id, next);
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200 max-w-xl mx-auto space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-['Outfit',sans-serif]">No Active Orders Yet</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          When you place an order with Razorpay, you can track the live preparation and delivery status here in real time.
        </p>
        <button
          onClick={onExploreMore}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          Explore Top Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
            Live Order Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time status updates powered by BiteDash dispatcher
          </p>
        </div>

        {/* Order Selector Tabs */}
        {orders.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {orders.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  (activeOrder?.id === o.id)
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                #{o.id.slice(-5)} • {o.restaurantName} ({o.status})
              </button>
            ))}
          </div>
        )}
      </div>

      {activeOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Status Stepper, Driver Card & Map */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Progress Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-lg shadow-slate-100 space-y-6">
              {/* Order Status Headline */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {activeOrder.status === 'DELIVERED' ? 'Completed' : 'Live Status'}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-2 font-['Outfit',sans-serif]">
                    {STATUS_STEPS[currentStepIdx]?.label}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {STATUS_STEPS[currentStepIdx]?.desc}
                  </p>
                </div>

                {activeOrder.status !== 'DELIVERED' && (
                  <div className="text-right bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-sm">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated ETA</p>
                    <p className="text-lg font-black text-orange-400 font-['Outfit',sans-serif]">
                      ~{activeOrder.estimatedDeliveryMinutes || 20} mins
                    </p>
                  </div>
                )}
              </div>

              {/* Visual 4-Step Progress Bar */}
              <div className="relative pt-2 pb-2">
                <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full" />
                <div
                  className="absolute top-1/2 left-4 h-1.5 bg-linear-to-r from-orange-500 to-amber-500 -translate-y-1/2 rounded-full transition-all duration-700"
                  style={{ width: `${(currentStepIdx / (STATUS_STEPS.length - 1)) * 92}%` }}
                />

                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const Icon = step.icon;
                    const isDone = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center max-w-[80px]">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-md transition-all duration-300 ${
                            isCurrent
                              ? 'bg-orange-500 text-white scale-110 ring-4 ring-orange-100'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border-2 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isDone && !isCurrent ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-[11px] font-bold mt-2 leading-tight ${isCurrent ? 'text-orange-600' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fast Test Controller: Advance Order Status */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Order Dispatch Simulation</p>
                  <p className="text-[11px] text-slate-500">Advance status to test real-time state transitions.</p>
                </div>
                {activeOrder.status !== 'DELIVERED' ? (
                  <button
                    id="advance-status-btn"
                    onClick={handleNextStatus}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Advance to Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Order Fulfilled
                  </span>
                )}
              </div>
            </div>

            {/* Live Delivery Route Simulator Map */}
            <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 text-white relative shadow-lg">
              <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Live GPS Dispatch Track</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">BiteDash Telemetry</span>
              </div>

              {/* Map Canvas Graphic Mockup */}
              <div className="relative h-56 bg-slate-900 flex items-center justify-center overflow-hidden p-4">
                {/* Map Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Animated Route Line */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M 60 160 Q 180 80, 280 120 T 480 90"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="4"
                    strokeDasharray="8 6"
                    className="animate-pulse"
                  />
                </svg>

                {/* Restaurant Marker */}
                <div className="absolute left-8 bottom-8 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-lg ring-4 ring-orange-950">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 mt-1 bg-slate-950/80 px-2 py-0.5 rounded">
                    {activeOrder.restaurantName.split(' ')[0]}
                  </span>
                </div>

                {/* Delivery Rider Marker (Moves dynamically with state) */}
                <div
                  className="absolute transition-all duration-1000 flex flex-col items-center"
                  style={{
                    left: currentStepIdx === 0 ? '15%' : currentStepIdx === 1 ? '35%' : currentStepIdx === 2 ? '68%' : '88%',
                    top: currentStepIdx === 0 ? '60%' : currentStepIdx === 1 ? '40%' : currentStepIdx === 2 ? '45%' : '30%',
                  }}
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xl ring-4 ring-amber-400/30 animate-bounce">
                    <Bike className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 bg-slate-950/90 px-2 py-0.5 rounded shadow mt-1">
                    {activeOrder.driverName || 'Marco (Driver)'}
                  </span>
                </div>

                {/* Customer Delivery Pin */}
                <div className="absolute right-8 top-8 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-lg ring-4 ring-emerald-950">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-200 mt-1 bg-slate-950/80 px-2 py-0.5 rounded">
                    Your Doorstep
                  </span>
                </div>
              </div>

              {/* Driver Contact bar */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                    🏍️
                  </div>
                  <div>
                    <p className="font-bold text-xs text-white">{activeOrder.driverName || 'Marco Rossi'}</p>
                    <p className="text-[11px] text-slate-400">Honda PCX 160 • Delivery Partner</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${activeOrder.driverPhone || '+14155550199'}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition text-xs flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                  <button
                    onClick={() => alert(`Direct dispatch chat initiated with driver ${activeOrder.driverName || 'Marco'}`)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Message</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Receipt Summary & Payment Verification */}
          <div className="lg:col-span-5 space-y-6">
            {/* Receipt Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order Receipt</p>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif]">
                    #{activeOrder.id}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-slate-400 font-medium">
                    {new Date(activeOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                    Paid
                  </span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                {activeOrder.restaurantImage && (
                  <img
                    src={activeOrder.restaurantImage}
                    alt={activeOrder.restaurantName}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                )}
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{activeOrder.restaurantName}</h4>
                  <p className="text-[11px] text-slate-500">Delicious Meals Dispatched</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ordered Items</div>
                <div className="divide-y divide-slate-100 text-xs">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-700 font-bold text-[11px] flex items-center justify-center">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>Delivery Address ({activeOrder.deliveryAddress?.label || 'Home'})</span>
                </div>
                <p className="text-slate-600 pl-5 text-[11px]">
                  {activeOrder.deliveryAddress?.street}, {activeOrder.deliveryAddress?.city}{' '}
                  {activeOrder.deliveryAddress?.zip}
                </p>
              </div>

              {/* Payment Verification Badge */}
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1 text-xs text-blue-950">
                <div className="flex items-center gap-1.5 font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Razorpay Verified Payment</span>
                </div>
                <div className="text-[11px] text-blue-800 font-mono space-y-0.5 pt-1">
                  <p>Payment ID: <span className="font-bold">{activeOrder.paymentId || 'pay_rzp_mock_101'}</span></p>
                  <p>Gateway: <span className="font-bold">Razorpay Test Signature Verified</span></p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{activeOrder.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900">₹{activeOrder.deliveryFee?.toFixed(2) || '40.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Packing</span>
                  <span className="font-semibold text-slate-900">₹{activeOrder.taxAndPacking?.toFixed(2) || '0.00'}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{activeOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-extrabold text-slate-900">
                  <span>Total Paid</span>
                  <span className="text-orange-600 font-black font-['Outfit',sans-serif]">
                    ₹{activeOrder.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  id="reorder-btn"
                  onClick={() => onReorder(activeOrder)}
                  className="flex-1 py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reorder Dishes</span>
                </button>
                <button
                  onClick={onExploreMore}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Explore More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

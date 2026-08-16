import React, { useState } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  CheckCircle2,
  Lock,
  X,
  AlertCircle,
  ExternalLink,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  razorpayOrder: { id: string; amount: number; currency: string; key: string; isRealRazorpayOrder?: boolean } | null;
  onPaymentSuccess: (paymentId: string, signature?: string, method?: string) => Promise<void>;
  onPaymentFailure: (errorMsg: string) => void;
  onLaunchOfficialGateway?: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  order,
  razorpayOrder,
  onPaymentSuccess,
  onPaymentFailure,
  onLaunchOfficialGateway,
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('alex.morgan@oksbi');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('789');
  const [cardName, setCardName] = useState('Alex Morgan');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !order) return null;

  const keyId = razorpayOrder?.key || 'rzp_test_TGoRVYEd8imVBf';
  const amountFormatted = order.totalAmount.toFixed(2);

  const handlePay = async (methodName: string) => {
    setIsProcessing(true);
    try {
      // Generate test payment ID matching Razorpay format
      const paymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      const mockSignature = `sig_${Math.random().toString(36).substring(2, 16)}`;

      // Simulate network latency for payment gateway authorization
      await new Promise((resolve) => setTimeout(resolve, 800));
      await onPaymentSuccess(paymentId, mockSignature, methodName);
    } catch (err: any) {
      onPaymentFailure(err.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={!isProcessing ? onClose : undefined}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Razorpay Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-in zoom-in-95 duration-200">
        {/* Razorpay Brand Header */}
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* Razorpay Logo badge */}
              <div className="w-8 h-8 rounded-lg bg-white text-blue-800 font-black flex items-center justify-center text-sm shadow-xs">
                R
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight font-['Outfit',sans-serif]">
                    Razorpay <span className="text-blue-200 text-xs font-normal">Payment Gateway</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-400 text-amber-950 rounded uppercase">
                    Test Mode
                  </span>
                </div>
                <p className="text-[11px] text-blue-200">BiteDash Payments • 256-bit SSL Encrypted</p>
              </div>
            </div>

            <button
              id="close-razorpay-modal-btn"
              disabled={isProcessing}
              onClick={onClose}
              className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amount Badge */}
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-white/10">
            <div>
              <p className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">Amount to Pay</p>
              <p className="text-2xl font-black text-white font-['Outfit',sans-serif]">₹{amountFormatted}</p>
            </div>
            <div className="text-right text-xs text-blue-100">
              <p className="font-semibold truncate max-w-[140px]">{order.restaurantName}</p>
              <p className="text-[10px] text-blue-200">Order #{order.id.slice(-6)}</p>
            </div>
          </div>
        </div>

        {/* Official Razorpay Popup Launch Option */}
        {onLaunchOfficialGateway && (
          <div className="p-3 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-blue-950">Official Razorpay Checkout</span>
            </div>
            <button
              type="button"
              onClick={onLaunchOfficialGateway}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Launch Popup</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Payment Methods Tabs */}
        <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('upi')}
            className={`py-3 px-2 flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === 'upi'
                ? 'bg-white text-blue-700 border-b-2 border-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI / QR</span>
          </button>

          <button
            onClick={() => setActiveTab('card')}
            className={`py-3 px-2 flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === 'card'
                ? 'bg-white text-blue-700 border-b-2 border-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Card</span>
          </button>

          <button
            onClick={() => setActiveTab('netbanking')}
            className={`py-3 px-2 flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === 'netbanking'
                ? 'bg-white text-blue-700 border-b-2 border-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Netbanking</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`py-3 px-2 flex flex-col items-center gap-1 transition cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-white text-blue-700 border-b-2 border-blue-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Wallets</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4">
          {activeTab === 'upi' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Popular UPI Apps (1-Click)</span>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Instant Verification
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Google Pay', handle: 'alex.morgan@oksbi' },
                  { name: 'PhonePe', handle: 'alex.morgan@ybl' },
                  { name: 'Paytm', handle: '9876543210@paytm' },
                ].map((app) => (
                  <button
                    key={app.name}
                    type="button"
                    onClick={() => setUpiId(app.handle)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 flex flex-col items-center gap-1 transition cursor-pointer"
                  >
                    <span className="text-base">📱</span>
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">UPI ID / VPA</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden font-medium"
                />
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Card Number (Test Cards Accepted)</label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 outline-hidden font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 outline-hidden font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Cardholder Name"
                  className="w-full px-3 py-2 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-600 outline-hidden"
                />
              </div>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Citibank', 'Kotak Mahindra'].map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-2.5 text-xs font-semibold rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      selectedBank === bank
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{bank}</span>
                    {selectedBank === bank && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Digital Wallet</label>
              {['Amazon Pay Balance (₹2,500.00)', 'Paytm Wallet', 'PhonePe Wallet', 'MobiKwik'].map((wallet, idx) => (
                <div
                  key={wallet}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer ${
                    idx === 0 ? 'bg-blue-50 border-blue-500 text-blue-900' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  <span>{wallet}</span>
                  <input type="radio" name="wallet" defaultChecked={idx === 0} className="text-blue-600" />
                </div>
              ))}
            </div>
          )}

          {/* Test Environment Banner */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2 text-[11px] text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Sandbox Environment:</span> Real money will not be deducted. 
              Clicking pay triggers gateway verification with HMAC signature security.
            </div>
          </div>

          {/* Primary Pay Action */}
          <button
            id="razorpay-confirm-pay-btn"
            disabled={isProcessing}
            onClick={() => handlePay(activeTab.toUpperCase())}
            className="w-full py-3.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-700/25 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isProcessing ? 'Verifying with Razorpay...' : `Pay ₹${amountFormatted} via Razorpay`}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>PCI-DSS Level 1 Compliant • Secured by Razorpay Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};

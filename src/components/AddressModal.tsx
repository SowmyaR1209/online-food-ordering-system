import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { Address } from '../types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAddress: (address: Omit<Address, 'id'>) => Promise<void>;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSaveAddress,
}) => {
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('San Francisco');
  const [state, setState] = useState('CA');
  const [zip, setZip] = useState('94103');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveAddress({
        label,
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zip: zip.trim(),
        isDefault: false,
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 z-10 animate-in zoom-in-95 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif]">Add Delivery Address</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Label selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Address Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Home', 'Work', 'Other'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setLabel(type)}
                  className={`py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                    label === type
                      ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Street */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Street Address & Apt/Suite</label>
            <input
              type="text"
              required
              placeholder="e.g. 550 California Street, Apt 302"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden font-medium"
            />
          </div>

          {/* City / State / Zip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">State</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Zip Code</label>
              <input
                type="text"
                required
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            {isSubmitting ? 'Saving Address...' : 'Save & Select Address'}
          </button>
        </form>
      </div>
    </div>
  );
};

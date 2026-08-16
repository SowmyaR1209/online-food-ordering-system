import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  LogIn,
  UserPlus,
  ArrowRight,
  Check,
  AlertCircle,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { apiService } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup';
  promptMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  promptMessage,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await apiService.login({
          email: email.trim(),
          password: password.trim(),
        });
        onSuccess(res.user);
        onClose();
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        const res = await apiService.signup({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          phone: phone.trim() || undefined,
          role,
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await apiService.login({ email: demoEmail, password: demoPass });
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header decoration */}
        <div className="bg-linear-to-r from-orange-500 via-amber-500 to-rose-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center font-black text-sm shadow-md">
              B
            </div>
            <span className="font-black font-['Outfit',sans-serif] tracking-wide text-lg">BiteDash</span>
          </div>

          <h3 className="text-xl font-extrabold font-['Outfit',sans-serif]">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            {promptMessage ||
              (mode === 'login'
                ? 'Sign in to access saved addresses, past orders, and fast checkout.'
                : 'Sign up to explore top restaurants, live tracking, and special promos.')}
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-5">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 text-xs font-extrabold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Quick Demo Logins Banner */}
          <div className="p-3 bg-orange-50/70 border border-orange-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-orange-900">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>1-Click Demo Profiles</span>
              </span>
              <span className="text-[10px] text-orange-600 uppercase tracking-wider font-extrabold">Instant</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('alex.morgan@example.com', 'password123')}
                disabled={isLoading}
                className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-orange-100/60 border border-orange-200 text-left transition cursor-pointer group"
              >
                <p className="text-[11px] font-extrabold text-slate-900 group-hover:text-orange-600">
                  Alex (Customer)
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">alex.morgan@example.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@bitedash.com', 'admin123')}
                disabled={isLoading}
                className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-orange-100/60 border border-orange-200 text-left transition cursor-pointer group"
              >
                <p className="text-[11px] font-extrabold text-slate-900 group-hover:text-orange-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" /> Sarah (Admin)
                </p>
                <p className="text-[10px] text-slate-500 font-mono truncate">admin@bitedash.com</p>
              </button>
            </div>
          </div>

          {/* Error notification */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-medium text-slate-900"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-medium text-slate-900"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a strong password'}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-hidden font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="space-y-1.5 pt-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      role === 'USER'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold ring-1 ring-orange-500'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold">Customer</p>
                      <p className="text-[10px] text-slate-500">Order food & track deliveries</p>
                    </div>
                    {role === 'USER' && <Check className="w-4 h-4 text-orange-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between ${
                      role === 'ADMIN'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-extrabold">Admin / Partner</p>
                      <p className="text-[10px] text-slate-500">Manage orders & metrics</p>
                    </div>
                    {role === 'ADMIN' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs tracking-wide shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to BiteDash' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch text */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="text-orange-600 font-bold hover:underline cursor-pointer"
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

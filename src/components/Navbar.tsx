import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  UtensilsCrossed,
  ShieldAlert,
  Sparkles,
  MapPin,
  Search,
  ChevronDown,
  CheckCircle2,
  User as UserIcon,
  LogIn,
  LogOut,
  UserPlus,
  Users,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { Address, UserRole, User } from '../types';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  activeTab: 'explore' | 'restaurant' | 'orders' | 'admin';
  setActiveTab: (tab: 'explore' | 'restaurant' | 'orders' | 'admin') => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedAddress: Address | null;
  addresses: Address[];
  onSelectAddress: (addr: Address) => void;
  onAddNewAddress: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeOrdersCount: number;
  currentUser: User | null;
  onOpenAuthModal: (mode?: 'login' | 'signup') => void;
  onLogout: () => void;
  onSwitchUser?: (user: User) => void;
  availableUsers?: User[];
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  activeTab,
  setActiveTab,
  role,
  setRole,
  selectedAddress,
  addresses,
  onSelectAddress,
  onAddNewAddress,
  searchQuery,
  setSearchQuery,
  activeOrdersCount,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onSwitchUser,
  availableUsers = [],
}) => {
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const addressMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (addressMenuRef.current && !addressMenuRef.current.contains(event.target as Node)) {
        setShowAddressDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveTab('explore')}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-hidden"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-linear-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <UtensilsCrossed className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-['Outfit',sans-serif]">
                    Bite<span className="text-orange-600">Dash</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-orange-100 text-orange-700 rounded-md">
                    Fast
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden lg:block font-medium">Fresh food delivered fast</p>
              </div>
            </button>

            {/* Address Selector */}
            {currentUser && (
              <div className="relative hidden md:block" ref={addressMenuRef}>
                <button
                  id="address-selector-btn"
                  onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100/80 text-left text-xs font-medium text-slate-700 transition border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  <div className="max-w-[150px] lg:max-w-[180px] truncate">
                    <span className="font-bold text-slate-900 block truncate">
                      {selectedAddress ? `${selectedAddress.label}: ${selectedAddress.street}` : 'Select Address'}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {selectedAddress ? `${selectedAddress.city}, ${selectedAddress.zip}` : 'Add delivery location'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>

                {showAddressDropdown && (
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Saved Delivery Addresses
                    </div>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          onClick={() => {
                            onSelectAddress(addr);
                            setShowAddressDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start justify-between gap-2 transition cursor-pointer ${
                            selectedAddress?.id === addr.id
                              ? 'bg-orange-50 text-orange-950 border border-orange-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              {addr.label}
                              {addr.isDefault && (
                                <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">Default</span>
                              )}
                            </p>
                            <p className="text-slate-600 mt-0.5 line-clamp-1">{addr.street}</p>
                            <p className="text-slate-400 text-[11px]">{addr.city}, {addr.state} {addr.zip}</p>
                          </div>
                          {selectedAddress?.id === addr.id && (
                            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="pt-2 mt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setShowAddressDropdown(false);
                          onAddNewAddress();
                        }}
                        className="w-full py-2 px-3 text-center text-xs font-semibold text-orange-600 hover:bg-orange-50 rounded-xl transition cursor-pointer"
                      >
                        + Add New Delivery Address
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search bar */}
          {activeTab === 'explore' && (
            <div className="flex-1 max-w-sm hidden sm:block">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="restaurant-search-input"
                  type="text"
                  placeholder="Search restaurants, cuisines, dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-xs sm:text-sm rounded-full border border-slate-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-hidden text-slate-800 placeholder-slate-400 font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action buttons & User Menu */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Live Orders button */}
            <button
              id="nav-orders-btn"
              onClick={() => setActiveTab('orders')}
              className={`relative px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
              }`}
            >
              <span>Orders</span>
              {activeOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-extrabold animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* Admin Analytics Toggle (Visible if Admin or for fast demo) */}
            {(role === 'ADMIN' || currentUser?.role === 'ADMIN') && (
              <button
                id="nav-admin-btn"
                onClick={() => {
                  if (activeTab === 'admin') {
                    setActiveTab('explore');
                  } else {
                    setActiveTab('admin');
                  }
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
                title="Admin Analytics Portal"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* User Account / Login State */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="nav-user-menu-btn"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition text-slate-800 text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-extrabold text-xs">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="font-extrabold text-xs text-slate-900 leading-tight truncate max-w-[90px]">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <span className="text-[10px] text-orange-600 font-bold block">
                      {currentUser.role === 'ADMIN' ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 space-y-3">
                    {/* User Profile Card */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-extrabold text-xs text-slate-900">{currentUser.name}</p>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md ${
                            currentUser.role === 'ADMIN'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                      {currentUser.phone && (
                        <p className="text-[10px] text-slate-400">{currentUser.phone}</p>
                      )}
                    </div>

                    {/* Quick navigation actions */}
                    <div className="space-y-1 text-xs">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          setActiveTab('orders');
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>My Live Orders</span>
                        <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">
                          {activeOrdersCount}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onAddNewAddress();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-semibold text-slate-700 flex items-center justify-between transition cursor-pointer"
                      >
                        <span>Manage Addresses ({addresses.length})</span>
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      {currentUser.role === 'ADMIN' ? (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setActiveTab('admin');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 font-semibold text-indigo-700 flex items-center justify-between transition cursor-pointer"
                        >
                          <span>Executive Analytics Portal</span>
                          <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowUserDropdown(false);
                            setRole('ADMIN');
                            setActiveTab('admin');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-indigo-50 font-semibold text-indigo-700 flex items-center justify-between transition cursor-pointer"
                        >
                          <span>View Admin Analytics</span>
                          <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                      )}
                    </div>

                    {/* Fast Demo Account Switcher */}
                    {availableUsers.length > 1 && onSwitchUser && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Quick Switch Account
                        </p>
                        <div className="space-y-1">
                          {availableUsers
                            .filter((u) => u.id !== currentUser.id)
                            .slice(0, 3)
                            .map((u) => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  onSwitchUser(u);
                                  setShowUserDropdown(false);
                                }}
                                className="w-full text-left p-1.5 rounded-lg hover:bg-orange-50 text-[11px] flex items-center justify-between transition cursor-pointer"
                              >
                                <span className="font-semibold text-slate-800">{u.name}</span>
                                <span className="text-[9px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                  {u.role}
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Logout Button */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        id="nav-logout-btn"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-rose-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="nav-login-btn"
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>

                <button
                  id="nav-signup-btn"
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative px-3 sm:px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/25 flex items-center gap-1.5 sm:gap-2 transition hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Cart</span>
              <div className="flex items-center gap-1 bg-orange-600/70 px-1.5 py-0.5 rounded-md text-[11px]">
                <span>{cartCount}</span>
                {cartTotal > 0 && <span className="hidden xs:inline">• ₹{cartTotal.toFixed(2)}</span>}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

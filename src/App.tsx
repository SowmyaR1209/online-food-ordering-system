import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Utensils, ShieldCheck, Flame, Compass, ArrowRight, Clock, Star, Gift, Truck } from 'lucide-react';
import { Restaurant, MenuItem, CartItem, Order, Address, UserRole, OrderStatus, User } from './types';
import { apiService } from './services/api';
import { Navbar } from './components/Navbar';
import { CuisineFilterBar } from './components/CuisineFilterBar';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetail } from './components/RestaurantDetail';
import { CartDrawer } from './components/CartDrawer';
import { RazorpayModal } from './components/RazorpayModal';
import { LiveOrderTracker } from './components/LiveOrderTracker';
import { AdminAnalyticsView } from './components/AdminAnalytics';
import { AddressModal } from './components/AddressModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'explore' | 'restaurant' | 'orders' | 'admin'>('explore');
  const [role, setRole] = useState<UserRole>('USER');

  // User & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bitedash_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(undefined);

  // Restaurants & Filter State
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState<boolean>(true);
  const [selectedCuisine, setSelectedCuisine] = useState<string>('All');
  const [selectedDietary, setSelectedDietary] = useState<string>('All');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Restaurant State
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: MenuItem[] }>({});
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartRestaurant, setCartRestaurant] = useState<Restaurant | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrderForPayment, setActiveOrderForPayment] = useState<Order | null>(null);
  const [razorpayOrderData, setRazorpayOrderData] = useState<any>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState<boolean>(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState<boolean>(false);

  // Toast / Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Initial Load: User, Addresses, Restaurants, Orders
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoadingRestaurants(true);
        const [userData, ordersData, allUsers] = await Promise.all([
          apiService.getCurrentUser(currentUser?.id).catch(() => null),
          apiService.getOrders().catch(() => []),
          apiService.getAllUsers().catch(() => []),
        ]);

        if (allUsers && allUsers.length > 0) {
          setAvailableUsers(allUsers);
        }

        const activeUser = currentUser || userData?.user;
        if (activeUser) {
          setCurrentUser(activeUser);
          setRole(activeUser.role);
          if (activeUser.addresses && activeUser.addresses.length > 0) {
            setAddresses(activeUser.addresses);
            setSelectedAddress(activeUser.addresses.find((a) => a.isDefault) || activeUser.addresses[0]);
          }
        }

        if (ordersData) {
          setOrders(ordersData);
        }
      } catch (err) {
        console.error('Initialization error', err);
      } finally {
        fetchRestaurants();
      }
    };

    initializeData();
  }, []);

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bitedash_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bitedash_user');
    }
  }, [currentUser]);

  // Auth Handlers
  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'login', prompt?: string) => {
    setAuthModalMode(mode);
    setAuthPromptMessage(prompt);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      setSelectedAddress(user.addresses.find((a) => a.isDefault) || user.addresses[0]);
    } else {
      setAddresses([]);
      setSelectedAddress(null);
    }
    showToast(`Welcome, ${user.name}!`);
    // Refresh available users list
    apiService.getAllUsers().then((list) => {
      if (list && list.length > 0) setAvailableUsers(list);
    });
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (e) {
      console.warn('Logout warning', e);
    }
    setCurrentUser(null);
    setRole('USER');
    setAddresses([]);
    setSelectedAddress(null);
    if (activeTab === 'admin') setActiveTab('explore');
    showToast('You have signed out', 'info');
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setRole(user.role);
    if (user.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
      setSelectedAddress(user.addresses.find((a) => a.isDefault) || user.addresses[0]);
    }
    showToast(`Switched account to: ${user.name}`);
  };

  // Fetch Restaurants when filters change
  const fetchRestaurants = async () => {
    try {
      setLoadingRestaurants(true);
      const res = await apiService.getRestaurants({
        cuisine: selectedCuisine,
        dietaryTag: selectedDietary,
        search: searchQuery,
        minRating: minRating || undefined,
      });
      setRestaurants(res.data);
    } catch (e) {
      console.error('Failed to load restaurants', e);
    } finally {
      setLoadingRestaurants(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, selectedDietary, minRating, searchQuery]);

  // Open a Restaurant Detail
  const handleSelectRestaurant = async (restaurant: Restaurant) => {
    try {
      setSelectedRestaurant(restaurant);
      setLoadingMenu(true);
      setActiveTab('restaurant');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const res = await apiService.getRestaurantMenu(restaurant.id);
      setMenuItems(res.items);
      setCategories(res.categories);
    } catch (err) {
      console.error('Failed to load restaurant menu', err);
      showToast('Failed to load menu. Please try again.', 'error');
    } finally {
      setLoadingMenu(false);
    }
  };

  // Cart Management
  const handleAddToCart = (item: MenuItem) => {
    // If cart has items from a different restaurant, confirm replacement
    if (cart.length > 0 && cartRestaurant && cartRestaurant.id !== item.restaurantId) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from "${cartRestaurant.name}". Reset cart to add items from "${selectedRestaurant?.name}"?`
      );
      if (!confirmSwitch) return;
      setCart([{ menuItem: item, quantity: 1 }]);
      setCartRestaurant(selectedRestaurant);
      showToast(`Added ${item.name} to cart!`);
      return;
    }

    if (!cartRestaurant && selectedRestaurant) {
      setCartRestaurant(selectedRestaurant);
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.menuItem.id === item.id);
      if (existingIdx >= 0) {
        const next = [...prevCart];
        next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + 1 };
        return next;
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });

    showToast(`Added ${item.name} to cart!`);
  };

  const handleRemoveFromCart = (menuItemId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.menuItem.id === menuItemId);
      if (!existing) return prevCart;
      if (existing.quantity <= 1) {
        const next = prevCart.filter((i) => i.menuItem.id !== menuItemId);
        if (next.length === 0) setCartRestaurant(null);
        return next;
      }
      return prevCart.map((i) => (i.menuItem.id === menuItemId ? { ...i, quantity: i.quantity - 1 } : i));
    });
  };

  const handleClearCart = () => {
    setCart([]);
    setCartRestaurant(null);
    showToast('Cart cleared', 'info');
  };

  // Save new address
  const handleSaveAddress = async (newAddrData: Omit<Address, 'id'>) => {
    try {
      const saved = await apiService.addAddress(newAddrData, currentUser?.id);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddress(saved);
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          addresses: [...(currentUser.addresses || []), saved],
        });
      }
      showToast(`Address saved: ${saved.street}`);
    } catch (e) {
      console.error(e);
      showToast('Failed to save address', 'error');
    }
  };

  // Trigger Razorpay Standard Checkout Gateway
  const launchRazorpayGateway = (
    order: Order,
    rzpOrder: { id: string; amount: number; currency: string; key: string; isRealRazorpayOrder?: boolean },
    restaurant: Restaurant
  ) => {
    const keyToUse = rzpOrder.key || 'rzp_test_TGoRVYEd8imVBf';

    // If key is dummy or not a live valid razorpay key, or running in an iframe / static host where checkout.js fails
    const openCheckout = () => {
      try {
        if (typeof (window as any).Razorpay !== 'function') {
          setIsRazorpayModalOpen(true);
          return;
        }

        const options: any = {
          key: keyToUse,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency || 'INR',
          name: 'BiteDash Food Delivery',
          description: `Order #${order.id.slice(-6)} • ${restaurant.name}`,
          image: restaurant.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          handler: async (response: any) => {
            await handlePaymentSuccess(
              response.razorpay_payment_id || `pay_${Date.now()}`,
              response.razorpay_signature,
              'Razorpay Gateway'
            );
          },
          prefill: {
            name: currentUser?.name || 'Alex Morgan',
            email: currentUser?.email || 'alex.morgan@example.com',
            contact: currentUser?.phone ? currentUser.phone.replace(/[^0-9+]/g, '') : '+919876543210',
          },
          notes: {
            order_id: order.id,
            restaurant: restaurant.name,
          },
          theme: {
            color: '#ea580c',
          },
          modal: {
            ondismiss: () => {
              setIsProcessingCheckout(false);
              // Open modal fallback if user dismisses or checkout script fails
              setIsRazorpayModalOpen(true);
            },
          },
        };

        // If it's a real order created via Razorpay Orders API, include order_id
        if (rzpOrder.isRealRazorpayOrder && rzpOrder.id && rzpOrder.id.startsWith('order_')) {
          options.order_id = rzpOrder.id;
        }

        const rzpInstance = new (window as any).Razorpay(options);

        rzpInstance.on('payment.failed', (response: any) => {
          console.warn('Razorpay payment failed:', response);
          showToast(response.error?.description || 'Razorpay Gateway error: Falling back to sandbox checkout', 'info');
          setIsRazorpayModalOpen(true);
        });

        rzpInstance.open();
      } catch (err: any) {
        console.warn('Error launching Razorpay popup, opening sandbox modal:', err);
        setIsRazorpayModalOpen(true);
      }
    };

    // If script is already loaded
    if (typeof (window as any).Razorpay === 'function') {
      openCheckout();
    } else {
      // Load checkout.js or fall back to sandbox modal
      try {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => openCheckout();
        script.onerror = () => {
          console.warn('Failed to load Razorpay checkout.js script, using built-in checkout');
          setIsRazorpayModalOpen(true);
        };
        document.body.appendChild(script);
      } catch (e) {
        setIsRazorpayModalOpen(true);
      }
    }
  };

  // Initiate Razorpay Checkout
  const handleProceedToCheckout = async (discountAmount: number, orderNote: string) => {
    // Check if user is logged in
    if (!currentUser) {
      setIsCartOpen(false);
      handleOpenAuthModal('login', 'Please sign in or create an account to complete your order.');
      return;
    }

    if (!selectedAddress) {
      showToast('Please select a delivery address', 'error');
      setIsAddressModalOpen(true);
      return;
    }

    if (!cartRestaurant || cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    setIsProcessingCheckout(true);
    try {
      // 1. Create order on backend: POST /api/orders
      const orderPayload = {
        userId: currentUser.id,
        restaurantId: cartRestaurant.id,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          name: c.menuItem.name,
          price: c.menuItem.price,
          quantity: c.quantity,
          category: c.menuItem.category,
        })),
        deliveryAddress: selectedAddress,
        discount: discountAmount,
      };

      const result = await apiService.createOrder(orderPayload);
      setActiveOrderForPayment(result.order);
      setRazorpayOrderData(result.razorpayOrder);
      setIsCartOpen(false);

      // Launch Razorpay Gateway
      launchRazorpayGateway(result.order, result.razorpayOrder, cartRestaurant);
    } catch (err: any) {
      console.error('Checkout error', err);
      showToast(err.message || 'Failed to initialize checkout', 'error');
      setIsRazorpayModalOpen(true);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Payment Verification & Order Status Transition: POST /api/payments/verify
  const handlePaymentSuccess = async (paymentId: string, signature?: string, method?: string) => {
    if (!activeOrderForPayment) return;

    try {
      const verifyRes = await apiService.verifyPayment({
        orderId: activeOrderForPayment.id,
        razorpayPaymentId: paymentId,
        razorpayOrderId: razorpayOrderData?.id,
        razorpaySignature: signature,
        paymentMethod: method || 'Razorpay Test Checkout',
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Update orders list
      setOrders((prev) => [verifyRes.order, ...prev.filter((o) => o.id !== verifyRes.order.id)]);
      setCart([]);
      setCartRestaurant(null);
      setIsRazorpayModalOpen(false);

      showToast('🎉 Payment verified with Razorpay! Kitchen has started preparing your order.');
      setActiveTab('orders');
    } catch (err: any) {
      console.error('Payment verification failed', err);
      showToast('Payment verification failed. Please try again.', 'error');
    }
  };

  // Advance Order status in live simulation
  const handleAdvanceOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const updated = await apiService.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      showToast(`Order status updated to: ${nextStatus}`);
    } catch (e) {
      console.error('Failed to update order status', e);
    }
  };

  // Reorder dishes
  const handleReorder = (pastOrder: Order) => {
    const matchedRestaurant = restaurants.find((r) => r.id === pastOrder.restaurantId);
    if (matchedRestaurant) {
      handleSelectRestaurant(matchedRestaurant);
      showToast(`Viewing menu for ${pastOrder.restaurantName}`);
    } else {
      setActiveTab('explore');
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 max-w-sm ${
              notification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : notification.type === 'info'
                ? 'bg-slate-900 text-white border-slate-800'
                : 'bg-emerald-900 text-white border-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={setRole}
        selectedAddress={selectedAddress}
        addresses={addresses}
        onSelectAddress={setSelectedAddress}
        onAddNewAddress={() => {
          if (!currentUser) {
            handleOpenAuthModal('login', 'Please sign in to add delivery addresses.');
          } else {
            setIsAddressModalOpen(true);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeOrdersCount={activeOrdersCount}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        availableUsers={availableUsers}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: EXPLORE RESTAURANTS */}
        {activeTab === 'explore' && (
          <div className="space-y-8 pb-16">
            {/* Promotional Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-linear-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-6 sm:p-10 shadow-xl">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide">
                  <Gift className="w-3.5 h-3.5 text-amber-300" />
                  <span>Use code <span className="underline font-black">BITEDASH50</span> for ₹50 off</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight font-['Outfit',sans-serif]">
                  Satisfy your cravings in minutes.
                </h1>

                <p className="text-slate-100 text-sm sm:text-base font-medium max-w-lg">
                  Explore gourmet pizzas, artisan sushi, smash burgers, and fresh vegan bowls from top culinary kitchens.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-200">
                    <Truck className="w-4 h-4 text-orange-400" />
                    <span>Average 25 min delivery</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Razorpay Instant Checkout</span>
                  </div>
                </div>
              </div>

              {/* Background Art Accent */}
              <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Filter Bar */}
            <CuisineFilterBar
              selectedCuisine={selectedCuisine}
              onSelectCuisine={setSelectedCuisine}
              selectedDietary={selectedDietary}
              onSelectDietary={setSelectedDietary}
              minRating={minRating}
              onToggleMinRating={() => setMinRating(minRating ? null : 4.8)}
              totalCount={restaurants.length}
            />

            {/* Restaurant Cards Grid */}
            {loadingRestaurants ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                    <div className="aspect-16/10 bg-slate-200 rounded-xl" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 max-w-lg mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800">No restaurants found</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your cuisine or dietary filters to find matching kitchens.
                </p>
                <button
                  onClick={() => {
                    setSelectedCuisine('All');
                    setSelectedDietary('All');
                    setMinRating(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onClick={() => handleSelectRestaurant(restaurant)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: RESTAURANT MENU DETAIL */}
        {activeTab === 'restaurant' && selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            menuItems={menuItems}
            categories={categories}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onBack={() => setActiveTab('explore')}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {/* VIEW 3: LIVE ORDER TRACKER */}
        {activeTab === 'orders' && (
          <LiveOrderTracker
            orders={orders}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onReorder={handleReorder}
            onExploreMore={() => setActiveTab('explore')}
          />
        )}

        {/* VIEW 4: ADMIN REVENUE ANALYTICS */}
        {activeTab === 'admin' && (
          <AdminAnalyticsView onBackToCustomer={() => setActiveTab('explore')} />
        )}
      </main>

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentRestaurant={cartRestaurant}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        selectedAddress={selectedAddress}
        onSelectAddress={() => {
          if (!currentUser) {
            handleOpenAuthModal('login', 'Please sign in to manage delivery addresses.');
          } else {
            setIsAddressModalOpen(true);
          }
        }}
        onProceedToCheckout={handleProceedToCheckout}
        isProcessingCheckout={isProcessingCheckout}
      />

      {/* Razorpay Modal */}
      <RazorpayModal
        isOpen={isRazorpayModalOpen}
        onClose={() => setIsRazorpayModalOpen(false)}
        order={activeOrderForPayment}
        razorpayOrder={razorpayOrderData}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={(msg) => showToast(msg, 'error')}
        onLaunchOfficialGateway={() => {
          if (activeOrderForPayment && razorpayOrderData) {
            const rest = cartRestaurant || restaurants.find((r) => r.id === activeOrderForPayment.restaurantId) || {
              id: activeOrderForPayment.restaurantId,
              name: activeOrderForPayment.restaurantName,
              image: activeOrderForPayment.restaurantImage || '',
            } as Restaurant;
            launchRazorpayGateway(activeOrderForPayment, razorpayOrderData, rest);
          }
        }}
      />

      {/* Add New Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSaveAddress={handleSaveAddress}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
        initialMode={authModalMode}
        promptMessage={authPromptMessage}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-xs">
              B
            </div>
            <span className="font-extrabold text-slate-900 font-['Outfit',sans-serif]">BiteDash Platform</span>
            <span>• Full-stack food ordering, authentication & Razorpay checkout</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span>100% Secure Checkout</span>
            <span>•</span>
            <span>Fast & Reliable Delivery</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

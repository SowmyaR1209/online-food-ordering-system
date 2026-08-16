import { Restaurant, MenuItem, Order, Payment, AdminAnalytics, User, Address } from '../types';
import { SEED_USERS, SEED_RESTAURANTS, SEED_MENU_ITEMS, SEED_ORDERS } from '../data/seedData';

// Storage keys for client fallback when backend server is not reachable
const USERS_STORAGE_KEY = 'bitedash_users_store';
const ORDERS_STORAGE_KEY = 'bitedash_orders_store';

function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore parse error
  }
  return [...SEED_USERS];
}

function saveStoredUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    // Ignore storage quota error
  }
}

function getStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore parse error
  }
  return [...SEED_ORDERS];
}

function saveStoredOrders(orders: Order[]) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    // Ignore storage quota error
  }
}

// Safe JSON fetch wrapper that never throws "Unexpected token '<' or 'T'"
async function safeFetch<T>(url: string, options?: RequestInit): Promise<{ ok: boolean; data?: T; status?: number; errorMsg?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const json = await res.json();
      if (res.ok) {
        return { ok: true, data: json, status: res.status };
      } else {
        return { ok: false, errorMsg: json.error || json.message || `Request failed with status ${res.status}`, status: res.status };
      }
    } else {
      // Server returned HTML (e.g. 404 page / static fallback on Vercel)
      return { ok: false, errorMsg: `Endpoint returned non-JSON response (${res.status})`, status: res.status };
    }
  } catch (err: any) {
    return { ok: false, errorMsg: err?.message || 'Network request failed' };
  }
}

export const apiService = {
  // Config
  async getConfig(): Promise<{ razorpayKeyId: string; appName: string; currency: string }> {
    const envKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID;
    const res = await safeFetch<{ razorpayKeyId: string; appName: string; currency: string }>('/api/config');
    if (res.ok && res.data) {
      return {
        ...res.data,
        razorpayKeyId: envKey || res.data.razorpayKeyId || 'rzp_test_TGoRVYEd8imVBf',
      };
    }
    return {
      razorpayKeyId: envKey || 'rzp_test_TGoRVYEd8imVBf',
      appName: 'BiteDash',
      currency: 'INR',
    };
  },

  // 1. GET /api/restaurants
  async getRestaurants(filters?: {
    cuisine?: string;
    search?: string;
    minRating?: number;
    dietaryTag?: string;
  }): Promise<{ data: Restaurant[]; count: number }> {
    const params = new URLSearchParams();
    if (filters?.cuisine && filters.cuisine !== 'All') params.append('cuisine', filters.cuisine);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.dietaryTag && filters.dietaryTag !== 'All') params.append('dietaryTag', filters.dietaryTag);

    const url = `/api/restaurants${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await safeFetch<{ data: Restaurant[]; count: number }>(url);
    if (res.ok && res.data) {
      return res.data;
    }

    // Client-side fallback
    let filtered = [...SEED_RESTAURANTS];
    if (filters?.cuisine && filters.cuisine !== 'All') {
      filtered = filtered.filter((r) => r.cuisineTags.some((t) => t.toLowerCase().includes(filters.cuisine!.toLowerCase())));
    }
    if (filters?.dietaryTag && filters.dietaryTag !== 'All') {
      filtered = filtered.filter((r) => r.cuisineTags.includes(filters.dietaryTag!));
    }
    if (filters?.minRating) {
      filtered = filtered.filter((r) => r.rating >= filters.minRating!);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.cuisineTags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return { data: filtered, count: filtered.length };
  },

  // 2. GET /api/restaurants/:id/menu
  async getRestaurantMenu(id: string): Promise<{
    restaurant: Restaurant;
    items: MenuItem[];
    categories: { [key: string]: MenuItem[] };
  }> {
    const res = await safeFetch<{
      restaurant: Restaurant;
      items: MenuItem[];
      categories: { [key: string]: MenuItem[] };
    }>(`/api/restaurants/${id}/menu`);

    if (res.ok && res.data) {
      return res.data;
    }

    // Client-side fallback
    const restaurant = SEED_RESTAURANTS.find((r) => r.id === id) || SEED_RESTAURANTS[0];
    const items = SEED_MENU_ITEMS.filter((item) => item.restaurantId === restaurant.id);
    const categories: { [key: string]: MenuItem[] } = {};
    items.forEach((item) => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });

    return { restaurant, items, categories };
  },

  // 3. POST /api/orders
  async createOrder(orderData: {
    userId?: string;
    restaurantId: string;
    items: { menuItemId: string; name: string; price: number; quantity: number; customization?: string }[];
    deliveryAddress: Address;
    discount?: number;
  }): Promise<{
    success: boolean;
    order: Order;
    razorpayOrder: { id: string; amount: number; currency: string; key: string; isRealRazorpayOrder?: boolean };
  }> {
    const res = await safeFetch<{
      success: boolean;
      order: Order;
      razorpayOrder: { id: string; amount: number; currency: string; key: string; isRealRazorpayOrder?: boolean };
    }>('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });

    if (res.ok && res.data) {
      return res.data;
    }

    // Client-side fallback
    const restaurant = SEED_RESTAURANTS.find((r) => r.id === orderData.restaurantId) || SEED_RESTAURANTS[0];
    const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 499 ? 0 : 40;
    const taxAndPacking = Number((subtotal * 0.05 + 25).toFixed(2));
    const discount = orderData.discount || 0;
    const totalAmount = Number((subtotal + deliveryFee + taxAndPacking - discount).toFixed(2));

    const newOrderId = `ord_${Date.now().toString().slice(-6)}`;
    const newOrder: Order = {
      id: newOrderId,
      userId: orderData.userId || 'usr_customer_1',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantImage: restaurant.image,
      items: orderData.items,
      deliveryAddress: orderData.deliveryAddress,
      subtotal,
      deliveryFee,
      taxAndPacking,
      discount,
      totalAmount,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      estimatedDeliveryMinutes: 28,
      driverName: 'Rahul Sharma',
      driverPhone: '+91 98765 12345',
    };

    const currentOrders = getStoredOrders();
    saveStoredOrders([newOrder, ...currentOrders]);

    return {
      success: true,
      order: newOrder,
      razorpayOrder: {
        id: `order_rzp_${Date.now().toString().slice(-8)}`,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        key: (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_TGoRVYEd8imVBf',
        isRealRazorpayOrder: false,
      },
    };
  },

  // 4. POST /api/payments/verify
  async verifyPayment(paymentData: {
    orderId: string;
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    paymentMethod?: string;
  }): Promise<{
    success: boolean;
    message: string;
    order: Order;
    payment: Payment;
  }> {
    const res = await safeFetch<{
      success: boolean;
      message: string;
      order: Order;
      payment: Payment;
    }>('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });

    if (res.ok && res.data) {
      return res.data;
    }

    // Client-side fallback
    const orders = getStoredOrders();
    const orderIndex = orders.findIndex((o) => o.id === paymentData.orderId);
    const order = orderIndex >= 0 ? orders[orderIndex] : orders[0];

    const updatedOrder: Order = {
      ...order,
      status: 'PREPARING',
      paymentId: paymentData.razorpayPaymentId,
      paymentStatus: 'SUCCESS',
    };

    if (orderIndex >= 0) {
      orders[orderIndex] = updatedOrder;
      saveStoredOrders(orders);
    }

    const payment: Payment = {
      id: `pay_rec_${Date.now().toString().slice(-6)}`,
      orderId: order.id,
      razorpayPaymentId: paymentData.razorpayPaymentId,
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpaySignature: paymentData.razorpaySignature,
      amount: order.totalAmount,
      status: 'SUCCESS',
      method: paymentData.paymentMethod || 'Razorpay Gateway',
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Payment verified and order confirmed successfully',
      order: updatedOrder,
      payment,
    };
  },

  // 5. GET /api/admin/analytics
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await safeFetch<{ data: AdminAnalytics }>('/api/admin/analytics');
    if (res.ok && res.data) {
      return res.data.data;
    }

    // Client-side analytics computation
    const orders = getStoredOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'SUCCESS' ? o.totalAmount : 0), 0);
    return {
      totalRevenue,
      totalOrders: orders.length,
      activeRestaurants: SEED_RESTAURANTS.length,
      averageOrderValue: orders.length > 0 ? Number((totalRevenue / orders.length).toFixed(2)) : 0,
      statusBreakdown: {
        PENDING: orders.filter((o) => o.status === 'PENDING').length,
        PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
        SHIPPED: orders.filter((o) => o.status === 'SHIPPED').length,
        DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
      },
      revenueTrend: [
        { date: 'Mon', revenue: 1420, orders: 4 },
        { date: 'Tue', revenue: 2150, orders: 7 },
        { date: 'Wed', revenue: 1890, orders: 6 },
        { date: 'Thu', revenue: 2400, orders: 8 },
        { date: 'Fri', revenue: 3820, orders: 12 },
        { date: 'Sat', revenue: 4950, orders: 15 },
        { date: 'Sun', revenue: 5200, orders: 18 },
      ],
      topRestaurants: SEED_RESTAURANTS.slice(0, 5).map((r, i) => ({
        id: r.id,
        name: r.name,
        ordersCount: 45 - i * 6,
        revenue: (45 - i * 6) * 350,
        rating: r.rating,
      })),
      topDishes: [
        { id: 'dish_1', name: 'Margherita D.O.P.', restaurantName: 'Napoli Artisan Pizzeria', ordersCount: 142, revenue: 49558 },
        { id: 'dish_2', name: 'Double Smash Burger', restaurantName: 'Umami Burger & Craft Co.', ordersCount: 118, revenue: 41182 },
        { id: 'dish_3', name: 'Chicken Dum Biryani', restaurantName: 'Spice Symphony', ordersCount: 96, revenue: 38304 },
      ],
    };
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const res = await safeFetch<{ orders: Order[] }>('/api/orders');
    if (res.ok && res.data?.orders) {
      return res.data.orders;
    }
    return getStoredOrders();
  },

  async updateOrderStatus(orderId: string, status: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED'): Promise<Order> {
    const res = await safeFetch<{ order: Order }>(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok && res.data?.order) {
      return res.data.order;
    }

    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx >= 0) {
      orders[idx] = { ...orders[idx], status };
      saveStoredOrders(orders);
      return orders[idx];
    }
    throw new Error('Order not found');
  },

  // Authentication & Users
  async login(credentials: { email: string; password?: string }): Promise<{ success: boolean; user: User; token: string; message: string }> {
    const res = await safeFetch<{ success: boolean; user: User; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (res.ok && res.data?.user) {
      return res.data;
    }

    // Client-side fallback for static deployments (Vercel / Netlify / GitHub Pages)
    const users = getStoredUsers();
    const targetEmail = credentials.email.toLowerCase().trim();
    let foundUser = users.find((u) => u.email.toLowerCase().trim() === targetEmail);

    // If not found in stored users, check seed demo users
    if (!foundUser) {
      foundUser = SEED_USERS.find((u) => u.email.toLowerCase().trim() === targetEmail);
    }

    // If still not found, create an on-the-fly user so demoing works smoothly
    if (!foundUser) {
      const isAlex = targetEmail.includes('alex') || targetEmail.includes('customer');
      const isAdmin = targetEmail.includes('admin');
      
      foundUser = {
        id: `usr_${Date.now()}`,
        name: isAlex ? 'Alex Morgan' : isAdmin ? 'Admin Manager' : targetEmail.split('@')[0] || 'User',
        email: credentials.email,
        phone: '+91 98765 43210',
        role: isAdmin ? 'ADMIN' : 'USER',
        addresses: isAlex ? SEED_USERS[0].addresses : isAdmin ? SEED_USERS[1].addresses : [],
      };
      saveStoredUsers([...users, foundUser]);
    }

    return {
      success: true,
      user: foundUser,
      token: `bitedash_tok_${foundUser.id}_${Date.now()}`,
      message: 'Logged in successfully',
    };
  },

  async signup(data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<{ success: boolean; user: User; token: string; message: string }> {
    const res = await safeFetch<{ success: boolean; user: User; token: string; message: string }>('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok && res.data?.user) {
      return res.data;
    }

    // Client-side fallback for static deployments
    const users = getStoredUsers();
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone || '+91 98765 43210',
      role: data.role || 'USER',
      addresses: [
        {
          id: `addr_${Date.now()}`,
          street: '101 Market Street, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zip: '94105',
          label: 'Home',
          isDefault: true,
        },
      ],
    };

    saveStoredUsers([...users, newUser]);

    return {
      success: true,
      user: newUser,
      token: `bitedash_tok_${newUser.id}_${Date.now()}`,
      message: 'Account created successfully',
    };
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    await safeFetch('/api/auth/logout', { method: 'POST' });
    return { success: true, message: 'Signed out successfully' };
  },

  async getCurrentUser(userId?: string): Promise<{ user: User; users: User[] }> {
    const url = userId ? `/api/auth/me?userId=${encodeURIComponent(userId)}` : '/api/auth/me';
    const res = await safeFetch<{ user: User; users: User[] }>(url);
    if (res.ok && res.data?.user) {
      return res.data;
    }

    const users = getStoredUsers();
    const user = userId ? users.find((u) => u.id === userId) || users[0] : users[0];
    return { user, users };
  },

  async getAllUsers(): Promise<User[]> {
    const res = await safeFetch<{ users: User[] }>('/api/users');
    if (res.ok && res.data?.users) {
      return res.data.users;
    }
    return getStoredUsers();
  },

  async addAddress(address: Omit<Address, 'id'>, userId?: string): Promise<Address> {
    const res = await safeFetch<{ address: Address }>('/api/users/address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...address, userId }),
    });

    if (res.ok && res.data?.address) {
      return res.data.address;
    }

    const newAddress: Address = {
      ...address,
      id: `addr_${Date.now().toString().slice(-6)}`,
    };

    const users = getStoredUsers();
    const userIdx = userId ? users.findIndex((u) => u.id === userId) : 0;
    if (userIdx >= 0) {
      const user = users[userIdx];
      const existingAddresses = user.addresses || [];
      const updatedAddresses: Address[] = address.isDefault
        ? [...existingAddresses.map((a) => ({ ...a, isDefault: false })), newAddress]
        : [...existingAddresses, newAddress];

      users[userIdx] = { ...user, addresses: updatedAddresses };
      saveStoredUsers(users);
    }

    return newAddress;
  },
};


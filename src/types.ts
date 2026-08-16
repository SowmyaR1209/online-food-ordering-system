export type UserRole = 'USER' | 'ADMIN';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  label: 'Home' | 'Work' | 'Other';
  isDefault?: boolean;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone?: string;
  role: UserRole;
  addresses: Address[];
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token?: string;
  message?: string;
  error?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  cuisineTags: string[];
  priceRange?: '₹' | '₹₹' | '₹₹₹' | '₹₹₹₹' | '$' | '$$' | '$$$' | '$$$$';
  minOrder?: number;
  address?: string;
  featured?: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietaryTags: string[];
  image?: string;
  isAvailable?: boolean;
  calories?: number;
  spicyLevel?: 0 | 1 | 2 | 3;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customization?: string;
  category?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  taxAndPacking: number;
  discount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  deliveryAddress: Address;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  estimatedDeliveryMinutes?: number;
  driverName?: string;
  driverPhone?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  amount: number;
  method?: string;
  timestamp: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  customization?: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeRestaurants: number;
  statusBreakdown: {
    PENDING: number;
    PREPARING: number;
    SHIPPED: number;
    DELIVERED: number;
  };
  revenueTrend: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  topRestaurants: {
    id: string;
    name: string;
    ordersCount: number;
    revenue: number;
    rating: number;
  }[];
  topDishes: {
    id: string;
    name: string;
    restaurantName: string;
    ordersCount: number;
    revenue: number;
  }[];
}

export interface RestaurantFilter {
  cuisine?: string;
  search?: string;
  minRating?: number;
  maxDeliveryTime?: number;
  dietaryTag?: string;
}

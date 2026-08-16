import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Store, Clock, CheckCircle2, ShieldAlert, Database, Code, RefreshCw, ChevronRight, Layers, ArrowUpRight, Award, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { AdminAnalytics, Order, OrderStatus } from '../types';
import { apiService } from '../services/api';

interface AdminAnalyticsProps {
  onBackToCustomer: () => void;
}

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  PREPARING: '#3b82f6',
  SHIPPED: '#8b5cf6',
  DELIVERED: '#10b981',
};

export const AdminAnalyticsView: React.FC<AdminAnalyticsProps> = ({ onBackToCustomer }) => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'schema'>('overview');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, allOrders] = await Promise.all([
        apiService.getAdminAnalytics(),
        apiService.getOrders(),
      ]);
      setAnalytics(analyticsData);
      setOrders(allOrders);
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      fetchDashboardData();
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const statusPieData = analytics?.statusBreakdown
    ? [
        { name: 'Pending', value: analytics.statusBreakdown.PENDING, color: STATUS_COLORS.PENDING },
        { name: 'Preparing', value: analytics.statusBreakdown.PREPARING, color: STATUS_COLORS.PREPARING },
        { name: 'Shipped', value: analytics.statusBreakdown.SHIPPED, color: STATUS_COLORS.SHIPPED },
        { name: 'Delivered', value: analytics.statusBreakdown.DELIVERED, color: STATUS_COLORS.DELIVERED },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-md flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Admin Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">GET /api/admin/analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-['Outfit',sans-serif]">
              BiteDash Executive Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Live platform metrics, real-time Razorpay revenue ingestion, status pipeline tracking, and technical schema control.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="admin-schema-btn"
              onClick={() => setShowSchemaModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Schema & API Specs</span>
            </button>

            <button
              onClick={onBackToCustomer}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-extrabold hover:bg-slate-100 transition cursor-pointer shadow-sm"
            >
              Back to Customer App →
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Metrics & Revenue Charts
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Live Dispatch Queue ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'schema'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          PostgreSQL / Prisma Architecture
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                  ₹
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  ₹{analytics?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.4% this week</span>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  {analytics?.totalOrders || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">Across all restaurants</p>
              </div>
            </div>

            {/* Average Order Value */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Order</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  ₹{analytics?.averageOrderValue?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">Per transaction average</p>
              </div>
            </div>

            {/* Active Restaurants */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Partner Kitchens</span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 font-['Outfit',sans-serif]">
                  {analytics?.activeRestaurants || 8} Active
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">100% operational uptime</p>
              </div>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 7-Day Revenue Trend Chart */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif]">
                    Weekly Revenue & Order Ingestion
                  </h3>
                  <p className="text-xs text-slate-500">Real-time daily transaction totals</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-orange-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Revenue (₹)
                  </span>
                  <span className="flex items-center gap-1 text-indigo-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Orders
                  </span>
                </div>
              </div>

              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueTrend || []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '12px',
                      }}
                      formatter={(value: any, name: any) => [
                        name === 'Revenue (₹)' ? `₹${Number(value).toLocaleString()}` : value,
                        name,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (₹)"
                      stroke="#ea580c"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                    <Bar dataKey="orders" name="Orders Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Order Status Distribution Donut */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif]">
                  Order Status Pipeline
                </h3>
                <p className="text-xs text-slate-500">Live order fulfillment stages</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                {statusPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400">No active orders</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {statusPieData.map((d) => (
                  <div key={d.name} className="p-2 bg-slate-50 rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-bold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Dishes & Best Performing Restaurants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Dishes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Top Best-Selling Dishes
                </h3>
                <span className="text-xs text-slate-400 font-medium">By Volume</span>
              </div>

              <div className="divide-y divide-slate-100">
                {analytics?.topDishes.map((dish, i) => (
                  <div key={dish.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center text-xs">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{dish.name}</p>
                        <p className="text-[11px] text-slate-500">{dish.restaurantName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 block">₹{dish.revenue.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">{dish.ordersCount} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Restaurants */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
                  <Store className="w-4 h-4 text-orange-500" />
                  Partner Restaurant Performance
                </h3>
                <span className="text-xs text-slate-400 font-medium">Rankings</span>
              </div>

              <div className="divide-y divide-slate-100">
                {analytics?.topRestaurants.map((rest, i) => (
                  <div key={rest.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-700 font-extrabold flex items-center justify-center text-xs">
                        #{i + 1}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{rest.name}</p>
                        <p className="text-[11px] text-emerald-600 font-semibold">★ {rest.rating.toFixed(1)} rating</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 block">₹{rest.revenue.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400">{rest.ordersCount} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Live Dispatch Queue with Status Action */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit',sans-serif]">
                All Customer Orders & Dispatch Controls
              </h3>
              <p className="text-xs text-slate-500">
                Update status dynamically across PENDING, PREPARING, SHIPPED, and DELIVERED stages.
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl">
              {orders.length} total orders recorded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-3">Order ID</th>
                  <th className="pb-3 px-3">Restaurant</th>
                  <th className="pb-3 px-3">Items</th>
                  <th className="pb-3 px-3">Total Amount</th>
                  <th className="pb-3 px-3">Payment</th>
                  <th className="pb-3 px-3">Current Status</th>
                  <th className="pb-3 px-3">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      #{order.id}
                      <span className="block text-[10px] font-sans font-normal text-slate-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-800 max-w-[150px] truncate">
                      {order.restaurantName}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-[200px]">
                      <span className="line-clamp-1 font-medium">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-black text-slate-900">
                      ₹{order.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 font-mono">
                        Razorpay {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide text-white"
                        style={{ backgroundColor: STATUS_COLORS[order.status] }}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="bg-white border border-slate-200 rounded-lg text-xs py-1 px-2 font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 outline-hidden cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Database & API Specification Inspector */}

      {(activeTab === 'schema' || showSchemaModal) && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black font-['Outfit',sans-serif]">PostgreSQL / Prisma Database Schema</h3>
                <p className="text-xs text-slate-400">Exact data modeling defined in BiteDash technical specifications</p>
              </div>
            </div>
            {showSchemaModal && (
              <button
                onClick={() => setShowSchemaModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-slate-800 cursor-pointer"
              >
                Close View
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

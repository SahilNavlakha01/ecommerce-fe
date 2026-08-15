"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GetDashboardStats, GetDashboardRecentOrders, GetDashboardLowStock } from "@/Services/GetService";
import { UserCircleIcon, BoxCubeIcon, TableIcon, ListIcon } from "@/icons";
import { errorToast } from "@/utils/toast";
import { formatDate } from "@/utils/dateFormat";
import { DashboardLoading } from "@/components/ui/AdminLoading";

interface DashboardStats {
  totalUsers: number;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  customerUsers: number;
  b2bUsers: number;
  activeProducts: number;
  pendingOrders: number;
  paidOrders: number;
  activeCarts: number;
  lowStockCount: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCategories: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    customerUsers: 0,
    b2bUsers: 0,
    activeProducts: 0,
    pendingOrders: 0,
    paidOrders: 0,
    activeCarts: 0,
    lowStockCount: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [orderSortKey, setOrderSortKey] = useState<string>('createdAt');
  const [orderSortDir, setOrderSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, recentRes, lowStockRes] = await Promise.all([
        GetDashboardStats().catch(() => null),
        GetDashboardRecentOrders().catch(() => null),
        GetDashboardLowStock().catch(() => null),
      ]);

      if (statsRes?.data?.data) {
        const s = statsRes.data.data;
        setStats({
          totalUsers: Number(s.totalUsers) || 0,
          customerUsers: Number(s.customerUsers) || 0,
          b2bUsers: Number(s.b2bUsers) || 0,
          totalCategories: Number(s.totalCategories) || 0,
          totalProducts: Number(s.totalProducts) || 0,
          activeProducts: Number(s.activeProducts) || 0,
          totalOrders: Number(s.totalOrders) || 0,
          paidOrders: Number(s.paidOrders) || 0,
          pendingOrders: Number(s.pendingOrders) || 0,
          totalRevenue: Number(s.totalRevenue) || 0,
          activeCarts: Number(s.activeCarts) || 0,
          lowStockCount: Number(s.lowStockCount) || 0,
        });
      }

      if (recentRes?.data?.data) {
        setRecentOrders(recentRes.data.data);
      }

      if (lowStockRes?.data?.data) {
        setLowStockProducts(lowStockRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      errorToast('Error loading dashboard data. Please refresh the page');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSort = (key: string) => {
    setOrderSortDir(prev => orderSortKey === key && prev === 'asc' ? 'desc' : 'asc');
    setOrderSortKey(key);
  };

  const sortedOrders = [...recentOrders].sort((a, b) => {
    const aVal = a[orderSortKey] ?? '';
    const bVal = b[orderSortKey] ?? '';
    const cmp = typeof aVal === 'number' && typeof bVal === 'number'
      ? aVal - bVal
      : String(aVal).localeCompare(String(bVal));
    return orderSortDir === 'asc' ? cmp : -cmp;
  });

  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      subtitle: `${stats.customerUsers} Customers, ${stats.b2bUsers} B2B`,
      icon: <UserCircleIcon />,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      link: "/admin/users",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      subtitle: "Product categories",
      icon: <BoxCubeIcon />,
      gradient: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      link: "/admin/categories",
      change: "+5%",
      changeType: "increase"
    },
    {
      title: "Products",
      value: stats.totalProducts,
      subtitle: `${stats.activeProducts} Active`,
      icon: <TableIcon />,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      link: "/admin/products",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      subtitle: `${stats.paidOrders} Paid, ${stats.pendingOrders} Pending`,
      icon: <ListIcon />,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      link: "/admin/orders",
      change: "+23%",
      changeType: "increase"
    },
  ];

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold font-heading mb-2">Welcome Back, Admin!</h1>
          <p className="text-teal-100 text-lg">Here's what's happening with your jewelry store today</p>
          <div className="flex items-center mt-4 space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-teal-100">All systems operational</span>
            </div>
            <div className="text-sm text-teal-200">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <DashboardLoading />
      ) : (
        <>
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardCards.map((stat, index) => (
              <Link
                key={stat.title}
                href={stat.link}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                    <div className={`text-2xl ${stat.textColor}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    stat.changeType === 'increase' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 font-heading">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-500 group-hover:text-teal-600 transition-colors">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <span>View details</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Enhanced Recent Orders */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 font-heading">Recent Orders</h2>
                  <p className="text-gray-600 mt-1">Latest customer transactions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live updates</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50/50">
                  <tr>
                    {[
                      { label: 'Order ID', key: 'orderId', cls: 'px-3 sm:px-8' },
                      { label: 'Customer', key: 'userName', cls: 'px-2 sm:px-6' },
                      { label: 'Amount', key: 'finalAmount', cls: 'px-2 sm:px-6' },
                      { label: 'Payment', key: 'paymentStatus', cls: 'px-2 sm:px-6' },
                      { label: 'Delivery', key: 'deliveryStatus', cls: 'px-2 sm:px-6' },
                      { label: 'Date', key: 'createdAt', cls: 'px-2 sm:px-6' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleOrderSort(col.key)}
                        className={`${col.cls} py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors`}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <span className="flex flex-col">
                            <svg className={`w-2.5 h-2.5 -mb-0.5 ${orderSortKey === col.key && orderSortDir === 'asc' ? 'text-teal-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 16 16"><path d="M8 4l4 5H4z"/></svg>
                            <svg className={`w-2.5 h-2.5 ${orderSortKey === col.key && orderSortDir === 'desc' ? 'text-teal-600' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 16 16"><path d="M8 12L4 7h8z"/></svg>
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedOrders.map((order, index) => (
                    <tr key={order.orderId || index} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-3 sm:px-8 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mr-2 sm:mr-3"></div>
                          <span className="text-xs sm:text-sm font-bold text-gray-900 font-mono truncate">{order.invoiceNumber || `ORD-${order.orderId}`}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 sm:mr-3">
                            {order.userName?.charAt(0) || 'U'}
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{order.userName || 'Unknown User'}</span>
                        </div>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">₹{(order.finalAmount || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                          typeof order.paymentStatus === 'string'
                            ? order.paymentStatus.toLowerCase().includes('paid') || order.paymentStatus.toLowerCase().includes('b2b')
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : order.paymentStatus.toLowerCase().includes('pending')
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-red-100 text-red-700 border border-red-200"
                            : order.paymentStatus === 1 
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : order.paymentStatus === 0
                            ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}>
                          {typeof order.paymentStatus === 'string' ? order.paymentStatus : order.paymentStatus === 1 ? 'Paid' : order.paymentStatus === 0 ? 'Pending' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                        <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                          typeof order.deliveryStatus === 'string'
                            ? order.deliveryStatus.toLowerCase().includes('delivered')
                              ? "bg-green-100 text-green-700 border border-green-200"
                              : order.deliveryStatus.toLowerCase().includes('shipped')
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : order.deliveryStatus.toLowerCase().includes('pending')
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                              : "bg-gray-100 text-gray-700 border border-gray-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                        }`}>
                          {order.deliveryStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-2 sm:px-6 py-3 sm:py-5 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-200">
              <Link
                href="/admin/orders"
                className="inline-flex items-center text-teal-600 hover:text-teal-800 text-sm font-semibold transition-colors duration-200 group"
              >
                <span>View all orders</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { href: "/admin/users", icon: <UserCircleIcon />, title: "Manage Users", desc: "Add, edit, and manage user accounts", color: "from-blue-500 to-blue-600" },
              { href: "/admin/categories", icon: <BoxCubeIcon />, title: "Manage Categories", desc: "Organize product categories", color: "from-teal-500 to-teal-600" },
              { href: "/admin/products", icon: <TableIcon />, title: "Manage Products", desc: "Add and update jewelry items", color: "from-purple-500 to-purple-600" },
              { href: "/admin/orders", icon: <ListIcon />, title: "Manage Orders", desc: "Process and track orders", color: "from-green-500 to-green-600" }
            ].map((action, index) => (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-gray-100 text-center"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <div className="text-2xl">{action.icon}</div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 font-heading">{action.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{action.desc}</p>
                <div className="mt-4 flex items-center justify-center text-sm text-gray-500 group-hover:text-teal-600 transition-colors">
                  <span>Get started</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </div>
              </Link>
            ))}
          </div>

          {/* Revenue Overview */}
          {/* <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 font-heading">Revenue Overview</h2>
                <p className="text-gray-600 mt-1">Total earnings from completed orders</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-teal-600">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Paid Orders</p>
                    <p className="text-2xl font-bold text-green-900">{stats.paidOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-900">{stats.pendingOrders}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-teal-800">Avg Order Value</p>
                    <p className="text-2xl font-bold text-teal-900">
                      ₹{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.paidOrders || 0).toLocaleString('en-IN') : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Low Stock Alert */}
          {lowStockProducts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 bg-red-50 border-b border-red-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-red-900">Low Stock Alert</h2>
                    <p className="text-sm text-red-700">{lowStockProducts.length} products need restocking</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {lowStockProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">SKU: {product.skuCode}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          {product.stockQuantity} left
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link
                    href="/admin/products"
                    className="inline-flex items-center text-red-600 hover:text-red-800 text-sm font-semibold transition-colors duration-200"
                  >
                    <span>Manage Inventory</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
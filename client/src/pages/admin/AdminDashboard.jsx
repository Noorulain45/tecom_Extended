import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const statusColors = {
  pending:    { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  confirmed:  { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  processing: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-400' },
  shipped:    { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  delivered:  { bg: 'bg-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-400' },
  cancelled:  { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400' },
};

// ── Fallback data shown when API is unavailable ──────────────────────────────
const FALLBACK_ANALYTICS = {
  totalRevenue: 0,
  totalOrders: 0,
  pendingOrders: 0,
  totalUsers: 0,
  totalProducts: 0,
  lowStockCount: 0,
  monthlyRevenue: [],
  topProducts: [],
  ordersByStatus: [],
};

const StatCard = ({ icon, label, value, sub, accent, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center`}>
        {icon}
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm font-medium text-gray-500">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const { isSuperAdmin } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data.data))
      .catch((err) => {
        console.error(err);
        setError(true);
        // Use fallback so the page never goes blank
        setAnalytics(FALLBACK_ANALYTICS);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </div>
  );

  const data = analytics || FALLBACK_ANALYTICS;
  const maxRevenue = Math.max(...(data.monthlyRevenue?.map(m => m.revenue) || [1]));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── API error banner (non-blocking) ── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-xl">
          <span>⚠️</span>
          <span>Could not load live analytics. Showing placeholder data — check your API connection.</span>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back — here's what's happening.</p>
        </div>
        {isSuperAdmin && (
          <Link
            to="/admin/superadmin"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <AdminPanelSettingsIcon fontSize="small" />
            Super Admin Panel
          </Link>
        )}
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<AttachMoneyIcon fontSize="small" className="text-emerald-600" />}
          accent="bg-emerald-50"
          label="Total Revenue"
          value={`$${data.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          sub="Excl. cancelled orders"
        />
        <StatCard
          icon={<ShoppingBagIcon fontSize="small" className="text-blue-600" />}
          accent="bg-blue-50"
          label="Total Orders"
          value={data.totalOrders?.toLocaleString() || '0'}
          sub={`${data.pendingOrders || 0} pending`}
        />
        <StatCard
          icon={<PeopleIcon fontSize="small" className="text-violet-600" />}
          accent="bg-violet-50"
          label="Total Users"
          value={data.totalUsers?.toLocaleString() || '0'}
        />
        <StatCard
          icon={<LocalCafeIcon fontSize="small" className="text-amber-600" />}
          accent="bg-amber-50"
          label="Active Products"
          value={data.totalProducts || '0'}
          sub={data.lowStockCount > 0 ? `⚠ ${data.lowStockCount} low stock` : '✓ All stocked'}
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">

        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Monthly Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 12 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <TrendingUpIcon fontSize="small" />
              <span className="text-xs font-semibold">Revenue</span>
            </div>
          </div>
          {data.monthlyRevenue?.length > 0 ? (
            <div className="flex items-end gap-2" style={{ height: '160px' }}>
              {data.monthlyRevenue.map((m, i) => {
                const pct = Math.max(4, (m.revenue / maxRevenue) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full rounded-t-lg bg-emerald-100 group-hover:bg-emerald-500 transition-colors duration-200 cursor-default relative"
                      style={{ height: `${pct * 1.4}px` }}
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ${m.revenue.toFixed(0)}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{MONTHS[m._id.month - 1]}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-300">
              <span className="text-4xl">📊</span>
              <span className="text-sm">No revenue data yet</span>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Top Products</h2>
          {data.topProducts?.length > 0 ? (
            <div className="space-y-4">
              {data.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-100 text-amber-700'
                    : i === 1 ? 'bg-gray-100 text-gray-600'
                    : 'bg-orange-50 text-orange-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div
                          className="h-1 bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(100, (p.totalSold / (data.topProducts[0]?.totalSold || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">{p.totalSold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-300">
              <span className="text-4xl">🍵</span>
              <span className="text-sm">No sales data yet</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Status Breakdown ────────────────────────────────────────── */}
      {data.ordersByStatus?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Orders by Status</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {data.ordersByStatus.map((s) => {
              const c = statusColors[s._id] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
              return (
                <div key={s._id} className={`${c.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-bold ${c.text}`}>{s.count}</p>
                  <p className={`text-xs font-medium capitalize mt-0.5 ${c.text}`}>{s._id}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Quick Nav ─────────────────────────────────────────────────────── */}
      {/* NOTE: "Manage Users" card removed for regular admin.
          Only Products, Orders, (and Super Admin if isSuperAdmin) are shown. */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/admin/products"
          className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50"
        >
          <span className="text-2xl flex-shrink-0">🍵</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">Manage Products</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Add, edit, remove products &amp; variants</p>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 transition-all duration-200 hover:border-blue-200 hover:bg-blue-50/50"
        >
          <span className="text-2xl flex-shrink-0">📦</span>
          <div>
            <p className="font-semibold text-gray-800 text-sm">View Orders</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Accept, reject &amp; track shipments</p>
          </div>
        </Link>

        {isSuperAdmin && (
          <Link
            to="/admin/superadmin"
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 transition-all duration-200 hover:border-amber-200 hover:bg-amber-50/50"
          >
            <span className="text-2xl flex-shrink-0">⚡</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Super Admin</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Manage admins, full analytics</p>
            </div>
          </Link>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
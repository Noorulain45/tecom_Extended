import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI, productAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

import PeopleIcon          from '@mui/icons-material/People';
import ShoppingBagIcon     from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon     from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon     from '@mui/icons-material/ReceiptLong';
import BlockIcon           from '@mui/icons-material/Block';
import CheckCircleIcon     from '@mui/icons-material/CheckCircle';
import EditIcon            from '@mui/icons-material/Edit';
import DeleteIcon          from '@mui/icons-material/Delete';
import AddIcon             from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BarChartIcon        from '@mui/icons-material/BarChart';
import InventoryIcon       from '@mui/icons-material/Inventory';
import SecurityIcon        from '@mui/icons-material/Security';

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CATEGORIES = ['green-tea','black-tea','herbal-tea','oolong-tea','white-tea','chai','matcha'];
const CAFFEINE   = ['none','low','medium','high'];
const POLL_INTERVAL = 5000;

const statusColors = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  accepted:   'bg-blue-100 text-blue-700',
  processing: 'bg-violet-100 text-violet-700',
  dispatched: 'bg-purple-100 text-purple-700',
  shipped:    'bg-indigo-100 text-indigo-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
  rejected:   'bg-red-100 text-red-600',
};

const roleColors = {
  superadmin: 'bg-amber-100 text-amber-700',
  admin:      'bg-blue-100 text-blue-700',
  user:       'bg-gray-100 text-gray-600',
};

/* What actions are available per status */
const NEXT_ACTIONS = {
  pending:    [{ label: 'Accept',    status: 'accepted',   cls: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
               { label: 'Reject',    status: 'rejected',   cls: 'bg-red-50 text-red-600 hover:bg-red-100' }],
  accepted:   [{ label: 'Dispatch',  status: 'dispatched', cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }],
  dispatched: [{ label: 'Delivered', status: 'delivered',  cls: 'bg-purple-50 text-purple-700 hover:bg-purple-100' }],
  delivered:  [],
  rejected:   [],
  confirmed:  [{ label: 'Dispatch',  status: 'dispatched', cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }],
  processing: [{ label: 'Dispatch',  status: 'dispatched', cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100' }],
  shipped:    [{ label: 'Delivered', status: 'delivered',  cls: 'bg-purple-50 text-purple-700 hover:bg-purple-100' }],
  cancelled:  [],
};

// ─────────────────────────────────────────────
// Tab Button
// ─────────────────────────────────────────────
const TabBtn = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-5 py-3 text-sm font-semibold rounded-xl transition-all duration-150 whitespace-nowrap ${
      active ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
    {badge !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

// ─────────────────────────────────────────────
// Order Activity Feed (for Analytics tab)
// ─────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTIVITY_STYLES = {
  accepted:   { bg: '#d1fae5', color: '#065f46', icon: '✓' },
  rejected:   { bg: '#fee2e2', color: '#991b1b', icon: '✕' },
  dispatched: { bg: '#dbeafe', color: '#1e40af', icon: '→' },
  delivered:  { bg: '#ede9fe', color: '#5b21b6', icon: '★' },
  pending:    { bg: '#fef9c3', color: '#92400e', icon: '◉' },
};

const OrderActivityFeed = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchOrders = async (silent = false) => {
    try {
      const { data } = await adminAPI.getOrders({ limit: 50, page: 1 });
      const all = data.data ?? [];
      all.sort((a, b) => new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt));
      setOrders(all);
    } catch { /* silent */ }
    finally { if (!silent) setLoading(false); }
  };

  useEffect(() => {
    fetchOrders(false);
    pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  const counts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const activityOrders = orders.filter(o =>
    ['accepted','rejected','dispatched','delivered'].includes(o.orderStatus)
  );

  const statItems = [
    { label: 'Pending',    key: 'pending',    color: '#f59e0b' },
    { label: 'Accepted',   key: 'accepted',   color: '#3b82f6' },
    { label: 'Dispatched', key: 'dispatched', color: '#8b5cf6' },
    { label: 'Delivered',  key: 'delivered',  color: '#10b981' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">Order Activity</h3>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" />
          Live
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        {statItems.map(s => (
          <div key={s.key} className="py-3 text-center">
            <p className="text-xl font-bold" style={{ color: s.color }}>{counts[s.key] || 0}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {loading ? (
          <div className="py-10 text-center text-gray-400 text-sm">Loading…</div>
        ) : activityOrders.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No order activity yet.</div>
        ) : (
          activityOrders.map(order => {
            const s = ACTIVITY_STYLES[order.orderStatus] || ACTIVITY_STYLES.pending;
            return (
              <div key={order._id}
                className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/60 transition-colors last:border-b-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-gray-800">{order.orderNumber}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                      style={{ background: s.bg, color: s.color }}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.user?.name || 'Customer'} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · €{order.total?.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(order.updatedAt ?? order.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Section: Analytics
// ─────────────────────────────────────────────
const AnalyticsSection = ({ analytics, loading }) => {
  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
    </div>
  );
  if (!analytics) return <p className="text-gray-400 text-sm">No analytics data available.</p>;

  const maxRev = Math.max(...(analytics.monthlyRevenue?.map(m => m.revenue) || [1]));

  const cards = [
    { label: 'Total Revenue',   value: `$${analytics.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`, icon: '💰', color: 'bg-emerald-50 border-emerald-100', val: 'text-emerald-700' },
    { label: 'Total Orders',    value: analytics.totalOrders?.toLocaleString(), icon: '📦', color: 'bg-blue-50 border-blue-100', val: 'text-blue-700' },
    { label: 'Pending Orders',  value: analytics.pendingOrders, icon: '⏳', color: 'bg-yellow-50 border-yellow-100', val: 'text-yellow-700' },
    { label: 'Total Users',     value: analytics.totalUsers?.toLocaleString(), icon: '👥', color: 'bg-violet-50 border-violet-100', val: 'text-violet-700' },
    { label: 'Active Products', value: analytics.totalProducts, icon: '🍵', color: 'bg-amber-50 border-amber-100', val: 'text-amber-700' },
    { label: 'Low Stock',       value: analytics.lowStockCount || 0, icon: '⚠️', color: 'bg-red-50 border-red-100', val: 'text-red-600' },
    { label: 'Avg Order Value', value: analytics.totalOrders ? `$${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)}` : '$0.00', icon: '📊', color: 'bg-teal-50 border-teal-100', val: 'text-teal-700' },
    { label: 'Delivered',       value: analytics.ordersByStatus?.find(s => s._id === 'delivered')?.count || 0, icon: '✅', color: 'bg-green-50 border-green-100', val: 'text-green-700' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl border p-5 ${c.color}`}>
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className={`text-2xl font-bold ${c.val}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
            <span className="text-xs text-gray-400">Last 12 months</span>
          </div>
          {analytics.monthlyRevenue?.length > 0 ? (
            <div className="flex items-end gap-1.5" style={{ height: 160 }}>
              {analytics.monthlyRevenue.map((m, i) => {
                const pct = Math.max(4, (m.revenue / maxRev) * 100);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full rounded-t-lg bg-emerald-100 group-hover:bg-emerald-500 transition-colors cursor-default relative"
                      style={{ height: `${pct * 1.4}px` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        ${m.revenue.toFixed(0)}
                      </span>
                    </div>
                    <span className="text-[9px] text-gray-400">{MONTHS[m._id.month - 1]}</span>
                  </div>
                );
              })}
            </div>
          ) : <div className="h-40 flex items-center justify-center text-gray-300">No data yet</div>}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5">Top Selling</h3>
          {analytics.topProducts?.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div className="h-1 bg-emerald-500 rounded-full"
                          style={{ width: `${(p.totalSold / (analytics.topProducts[0]?.totalSold || 1)) * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{p.totalSold}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400">No data</p>}
        </div>
      </div>

      {/* ── Order Activity Feed ── */}
      <OrderActivityFeed />

      {/* Status breakdown */}
      {analytics.ordersByStatus?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-5">Orders by Status</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {analytics.ordersByStatus.map(s => (
              <div key={s._id} className={`${statusColors[s._id]?.split(' ')[0] || 'bg-gray-100'} rounded-xl p-4 text-center`}>
                <p className={`text-2xl font-bold ${statusColors[s._id]?.split(' ')[1] || 'text-gray-700'}`}>{s.count}</p>
                <p className={`text-xs font-medium capitalize mt-1 ${statusColors[s._id]?.split(' ')[1] || 'text-gray-500'}`}>{s._id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Section: Manage Admins
// ─────────────────────────────────────────────
const ManageAdminsSection = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ role: 'admin', page, limit: 10, ...(search && { search }) });
      setAdmins(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load admins'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggleBlock = async (userId) => {
    try {
      const { data } = await adminAPI.toggleBlock(userId);
      setAdmins(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: data.data.isBlocked } : u));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDemote = async (userId) => {
    if (!window.confirm('Demote this admin to regular user?')) return;
    try {
      await adminAPI.updateRole(userId, 'user');
      toast.success('Admin demoted to user');
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Admin Accounts</h3>
          <p className="text-sm text-gray-500 mt-0.5">Manage admin roles and access</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-sm font-semibold text-blue-700">
          {pagination?.total || 0} admins
        </div>
      </div>

      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search admins by name or email..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Admin</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Joined</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {admins.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {u._id !== currentUser?._id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleBlock(u._id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                          {u.isBlocked ? <><CheckCircleIcon fontSize="inherit" /> Unblock</> : <><BlockIcon fontSize="inherit" /> Block</>}
                        </button>
                        <button onClick={() => handleDemote(u._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                          Demote
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">You</span>
                    )}
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">No admins found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

// ─────────────────────────────────────────────
// Section: Block / Unblock Users
// ─────────────────────────────────────────────
const BlockManagementSection = () => {
  const [users, setUsers]     = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]       = useState(1);

  const fetch = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (search)     params.search = search;
    if (roleFilter) params.role   = roleFilter;
    try {
      const { data } = await adminAPI.getUsers(params);
      let filtered = data.data;
      if (statusFilter === 'blocked') filtered = filtered.filter(u => u.isBlocked);
      if (statusFilter === 'active')  filtered = filtered.filter(u => !u.isBlocked);
      setUsers(filtered);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleToggleBlock = async (userId) => {
    try {
      const { data } = await adminAPI.toggleBlock(userId);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: data.data.isBlocked } : u));
      toast.success(data.message);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateRole(userId, role);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-gray-900 text-lg">Block / Unblock Management</h3>
        <p className="text-sm text-gray-500 mt-0.5">Control access for all users and admins</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
          <option value="">All Roles</option>
          <option value="user">Users only</option>
          <option value="admin">Admins only</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition">
          <option value="">All Statuses</option>
          <option value="active">Active only</option>
          <option value="blocked">Blocked only</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Joined</th>
                <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {u.role !== 'superadmin' ? (
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Superadmin</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${u.isBlocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isBlocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    {u.role !== 'superadmin' && (
                      <button onClick={() => handleToggleBlock(u._id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                        {u.isBlocked ? <><CheckCircleIcon sx={{ fontSize: 14 }} /> Unblock</> : <><BlockIcon sx={{ fontSize: 14 }} /> Block</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  );
};

// ─────────────────────────────────────────────
// Product Form Modal
// ─────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name: '', description: '', shortDescription: '', basePrice: '',
  category: 'green-tea', origin: '', thumbnail: '', caffeineLevel: 'medium',
  brewingTime: '', temperature: '', isFeatured: false, flavor: '', tags: '',
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState(product ? {
    ...product,
    flavor: product.flavor?.join(', ') || '',
    tags:   product.tags?.join(', ') || '',
  } : EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      basePrice: parseFloat(form.basePrice),
      flavor: form.flavor.split(',').map(f => f.trim()).filter(Boolean),
      tags:   form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (product?._id) { await productAPI.update(product._id, payload); toast.success('Product updated!'); }
      else              { await productAPI.create(payload);               toast.success('Product created!'); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl z-10 p-8">
        <h2 className="font-bold text-xl text-gray-900 mb-6">{product ? 'Edit Product' : 'New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Product Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Base Price ($) *</label>
              <input name="basePrice" type="number" step="0.01" min="0" value={form.basePrice} onChange={handleChange} required className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Short Description</label>
              <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Origin</label>
              <input name="origin" value={form.origin} onChange={handleChange} className={inputCls} placeholder="Darjeeling, India" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Caffeine Level</label>
              <select name="caffeineLevel" value={form.caffeineLevel} onChange={handleChange} className={inputCls}>
                {CAFFEINE.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Brewing Time</label>
              <input name="brewingTime" value={form.brewingTime} onChange={handleChange} className={inputCls} placeholder="3-4 minutes" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Temperature</label>
              <input name="temperature" value={form.temperature} onChange={handleChange} className={inputCls} placeholder="90°C" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Thumbnail URL</label>
              <input name="thumbnail" value={form.thumbnail} onChange={handleChange} className={inputCls} placeholder="https://..." />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Flavour Notes (comma separated)</label>
              <input name="flavor" value={form.flavor} onChange={handleChange} className={inputCls} placeholder="floral, earthy, sweet" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange} className={inputCls} placeholder="premium, bestseller" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-emerald-600" />
                <span className="text-sm text-gray-700 font-medium">Mark as Featured product</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 mt-4">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Section: Products
// ─────────────────────────────────────────────
const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll({ page, limit: 12, ...(search && { search }) });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate "${name}"?`)) return;
    try { await productAPI.delete(id); toast.success('Product deactivated'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Products & Variants</h3>
          <p className="text-sm text-gray-500 mt-0.5">Add, edit, remove products and manage variants</p>
        </div>
        <button onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors">
          <AddIcon fontSize="small" /> Add Product
        </button>
      </div>
      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search products..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />

      {loading ? (
        <div className="grid grid-cols-1 gap-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Product</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Category</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Price</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Variants</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Rating</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={p.thumbnail} alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=40'; }} />
                          <div>
                            <p className="font-semibold text-gray-800">{p.name}</p>
                            {p.isFeatured && <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 capitalize text-xs">{p.category?.replace('-', ' ')}</td>
                      <td className="px-5 py-4 font-bold text-gray-800">${p.basePrice?.toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">{p.variants?.length || 0} variants</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-amber-500 font-semibold text-sm">{p.rating > 0 ? `★ ${p.rating}` : '—'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setModal(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><EditIcon fontSize="small" /></button>
                          <button onClick={() => handleDelete(p._id, p.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><DeleteIcon fontSize="small" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No products found.</div>}
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); fetch(); }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Section: Orders (with polling + action buttons)
// ─────────────────────────────────────────────
const OrdersSection = () => {
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [updating, setUpdating]     = useState({});
  const [newPendingCount, setNewPendingCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const knownIds  = useRef(new Set());
  const pollRef   = useRef(null);

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const params = { page, limit: 15 };
    if (statusFilter) params.status = statusFilter;
    if (search)       params.search = search;
    try {
      const { data } = await adminAPI.getOrders(params);
      const incoming = data.data ?? [];
      setOrders(incoming);
      setPagination(data.pagination);

      if (knownIds.current.size === 0) {
        incoming.forEach(o => knownIds.current.add(o._id));
        return;
      }
      if (silent) {
        const newPending = incoming.filter(o => o.orderStatus === 'pending' && !knownIds.current.has(o._id));
        if (newPending.length > 0) {
          newPending.forEach(o => knownIds.current.add(o._id));
          setNewPendingCount(c => c + newPending.length);
          setShowBanner(true);
        }
      }
      incoming.forEach(o => knownIds.current.add(o._id));
    } catch {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchOrders(false); }, [fetchOrders]);
  useEffect(() => {
    pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchOrders]);

  const handleAction = async (orderId, status) => {
    setUpdating(u => ({ ...u, [orderId]: true }));
    try {
      const { data } = await adminAPI.updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: data.data?.orderStatus ?? status } : o));
      toast.success(`Order ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(u => ({ ...u, [orderId]: false }));
    }
  };

  const STATUS_FILTER_OPTIONS = ['pending','accepted','dispatched','delivered','rejected'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Orders</h3>
          <p className="text-sm text-gray-500 mt-0.5">Accept, dispatch and track all orders</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse inline-block" />
          Live · polls every 5s
        </span>
      </div>

      {/* New order banner */}
      {showBanner && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-amber-800">
              {newPendingCount} new pending order{newPendingCount > 1 ? 's' : ''} received
            </span>
          </div>
          <button onClick={() => { setShowBanner(false); setNewPendingCount(0); }}
            className="text-xs text-amber-600 underline bg-none border-none cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-1">
        {STATUS_FILTER_OPTIONS.map(s => (
          <button key={s} onClick={() => { setStatusFilter(statusFilter === s ? '' : s); setPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all capitalize ${
              statusFilter === s
                ? `${statusColors[s]} border-transparent`
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}>
            {s}
          </button>
        ))}
        {statusFilter && (
          <button onClick={() => setStatusFilter('')} className="text-xs text-gray-400 hover:text-gray-600 px-2">Clear ✕</button>
        )}
      </div>

      <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
        placeholder="Search by order number..."
        className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition" />

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Order</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Customer</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Items</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Total</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Date</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-gray-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(order => {
                    const actions = NEXT_ACTIONS[order.orderStatus] ?? [];
                    const isUpd   = updating[order._id];
                    return (
                      <tr key={order._id}
                        className={`hover:bg-gray-50/60 transition-colors${order.orderStatus === 'pending' ? ' bg-amber-50/40' : ''}`}>
                        <td className="px-5 py-4">
                          <span className="font-mono text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">{order.orderNumber}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800">{order.user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-500 text-xs">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</td>
                        <td className="px-5 py-4 font-bold text-gray-800">${order.total?.toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          {actions.length > 0 ? (
                            <div className="flex gap-1.5">
                              {actions.map(action => (
                                <button key={action.status} disabled={isUpd}
                                  onClick={() => handleAction(order._id, action.status)}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${action.cls}`}>
                                  {isUpd ? '…' : action.label}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orders.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">No orders found.</div>}
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main SuperAdmin Dashboard
// ─────────────────────────────────────────────
const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab]           = useState('analytics');
  const [analytics, setAnalytics]           = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data.data))
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const tabs = [
    { id: 'analytics', label: 'Analytics',      icon: <BarChartIcon fontSize="small" /> },
    { id: 'admins',    label: 'Manage Admins',   icon: <AdminPanelSettingsIcon fontSize="small" /> },
    { id: 'access',    label: 'Block / Unblock', icon: <SecurityIcon fontSize="small" /> },
    { id: 'products',  label: 'Products',        icon: <InventoryIcon fontSize="small" /> },
    { id: 'orders',    label: 'Orders',          icon: <ReceiptLongIcon fontSize="small" /> },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
            <AdminPanelSettingsIcon className="text-white" fontSize="small" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-400">Full platform control — admins, users, products & orders</p>
          </div>
        </div>
      </div>

      {/* Quick stats strip */}
      {!analyticsLoading && analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Revenue',  value: `$${analytics.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 0 }) || '0'}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Orders',   value: analytics.totalOrders?.toLocaleString(),  color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: 'Users',    value: analytics.totalUsers?.toLocaleString(),   color: 'text-violet-600', bg: 'bg-violet-50' },
            { label: 'Products', value: analytics.totalProducts,                  color: 'text-amber-600',  bg: 'bg-amber-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-8 scrollbar-hide">
        {tabs.map(tab => (
          <TabBtn key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}
            icon={tab.icon} label={tab.label} badge={tab.badge} />
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'analytics' && <AnalyticsSection analytics={analytics} loading={analyticsLoading} />}
        {activeTab === 'admins'    && <ManageAdminsSection />}
        {activeTab === 'access'    && <BlockManagementSection />}
        {activeTab === 'products'  && <ProductsSection />}
        {activeTab === 'orders'    && <OrdersSection />}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
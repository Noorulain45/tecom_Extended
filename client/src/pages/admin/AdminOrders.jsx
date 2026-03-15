import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '../../services/api';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────────────────────────
   Status config
   Flow: pending → accepted → dispatched → delivered
         pending → rejected  (terminal)
         delivered            (terminal)
───────────────────────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
  pending:    'bg-amber-50 text-amber-700 border border-amber-200',
  accepted:   'bg-blue-50 text-blue-700 border border-blue-200',
  dispatched: 'bg-purple-50 text-purple-700 border border-purple-200',
  delivered:  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected:   'bg-red-50 text-red-600 border border-red-200',
  // legacy statuses from existing data
  confirmed:  'bg-blue-50 text-blue-700 border border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border border-purple-200',
  shipped:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
  cancelled:  'bg-red-50 text-red-600 border border-red-200',
};

/* What actions are available at each status */
const NEXT_ACTIONS = {
  pending:    [{ label: 'Accept',   status: 'accepted',   style: 'action-accept' },
               { label: 'Reject',   status: 'rejected',   style: 'action-reject' }],
  accepted:   [{ label: 'Dispatch', status: 'dispatched', style: 'action-dispatch' }],
  dispatched: [{ label: 'Delivered',status: 'delivered',  style: 'action-delivered' }],
  delivered:  [],
  rejected:   [],
  // legacy
  confirmed:  [{ label: 'Dispatch', status: 'dispatched', style: 'action-dispatch' }],
  processing: [{ label: 'Dispatch', status: 'dispatched', style: 'action-dispatch' }],
  shipped:    [{ label: 'Delivered',status: 'delivered',  style: 'action-delivered' }],
  cancelled:  [],
};

const POLL_INTERVAL = 5000; // 5 seconds

const styles = `
  .ao-wrap { padding: 24px; max-width: 1280px; margin: 0 auto; }

  /* ── Notification banner ── */
  .ao-notif {
    display: flex; align-items: center; justify-content: space-between;
    background: #fffbeb; border: 1px solid #fcd34d;
    border-radius: 8px; padding: 12px 18px; margin-bottom: 20px;
    animation: ao-slide-in 0.3s ease;
  }
  @keyframes ao-slide-in { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  .ao-notif-left { display: flex; align-items: center; gap: 10px; }
  .ao-notif-dot { width: 8px; height: 8px; background: #f59e0b; border-radius: 50%; animation: ao-pulse 1.2s infinite; }
  @keyframes ao-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .ao-notif-text { font-size: 13px; font-weight: 500; color: #92400e; }
  .ao-notif-dismiss { font-size: 11px; color: #b45309; cursor: pointer; text-decoration: underline; background: none; border: none; font-family: inherit; }

  /* ── Action buttons ── */
  .action-btn {
    padding: 5px 12px; border-radius: 5px; border: none; cursor: pointer;
    font-size: 11px; font-weight: 500; letter-spacing: 0.04em;
    transition: all 0.15s; white-space: nowrap;
  }
  .action-accept   { background: #d1fae5; color: #065f46; }
  .action-accept:hover   { background: #6ee7b7; }
  .action-reject   { background: #fee2e2; color: #991b1b; }
  .action-reject:hover   { background: #fca5a5; }
  .action-dispatch { background: #dbeafe; color: #1e40af; }
  .action-dispatch:hover { background: #93c5fd; }
  .action-delivered{ background: #ede9fe; color: #5b21b6; }
  .action-delivered:hover{ background: #c4b5fd; }

  .action-btns { display: flex; gap: 6px; }

  /* ── Status badge ── */
  .status-badge { font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 20px; text-transform: capitalize; display: inline-block; }

  /* ── Live dot ── */
  .live-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; }
  .live-dot::before { content: ''; display: inline-block; width: 7px; height: 7px; background: #10b981; border-radius: 50%; animation: ao-pulse 2s infinite; }
`;

const AdminOrders = () => {
  const [orders, setOrders]         = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [updating, setUpdating]     = useState({});
  const [newPendingCount, setNewPendingCount] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const knownOrderIds = useRef(new Set());
  const pollRef       = useRef(null);

  /* ── Fetch orders ── */
  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const params = { page, limit: 20 };
    if (statusFilter) params.status = statusFilter;
    if (search)       params.search = search;
    try {
      const { data } = await adminAPI.getOrders(params);
      const incoming = data.data ?? [];
      setOrders(incoming);
      setPagination(data.pagination);

      // First load — seed known IDs
      if (knownOrderIds.current.size === 0) {
        incoming.forEach(o => knownOrderIds.current.add(o._id));
        return;
      }

      // On subsequent silent polls — detect new pending orders
      if (silent) {
        const newPending = incoming.filter(
          o => o.orderStatus === 'pending' && !knownOrderIds.current.has(o._id)
        );
        if (newPending.length > 0) {
          newPending.forEach(o => knownOrderIds.current.add(o._id));
          setNewPendingCount(c => c + newPending.length);
          setShowBanner(true);
        }
        // Always add all to known set
        incoming.forEach(o => knownOrderIds.current.add(o._id));
      } else {
        incoming.forEach(o => knownOrderIds.current.add(o._id));
      }
    } catch {
      if (!silent) toast.error('Failed to load orders');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, statusFilter, search]);

  /* Initial load */
  useEffect(() => { fetchOrders(false); }, [fetchOrders]);

  /* Polling */
  useEffect(() => {
    pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchOrders]);

  /* ── Update order status ── */
  const handleAction = async (orderId, status) => {
    setUpdating(u => ({ ...u, [orderId]: true }));
    try {
      const { data } = await adminAPI.updateOrderStatus(orderId, { status });
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, orderStatus: data.data?.orderStatus ?? status } : o
      ));
      toast.success(`Order ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(u => ({ ...u, [orderId]: false }));
    }
  };

  const dismissBanner = () => { setShowBanner(false); setNewPendingCount(0); };

  return (
    <div className="ao-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-tea-900">Orders</h1>
          {pagination && (
            <p className="text-sm text-gray-400 mt-0.5">{pagination.total} total</p>
          )}
        </div>
        <span className="live-dot">Live updates every 5s</span>
      </div>

      {/* New order notification banner */}
      {showBanner && (
        <div className="ao-notif">
          <div className="ao-notif-left">
            <div className="ao-notif-dot" />
            <span className="ao-notif-text">
              {newPendingCount} new pending order{newPendingCount > 1 ? 's' : ''} received
            </span>
          </div>
          <button className="ao-notif-dismiss" onClick={dismissBanner}>Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by order number or customer…"
          className="input flex-1"
        />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input w-44"
        >
          <option value="">All Statuses</option>
          {['pending','accepted','dispatched','delivered','rejected'].map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-tea-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-tea-50 border-b border-tea-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Order #</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tea-50">
                  {orders.map(order => {
                    const actions = NEXT_ACTIONS[order.orderStatus] ?? [];
                    const isUpd   = updating[order._id];
                    return (
                      <tr key={order._id}
                        className={`hover:bg-gray-50 transition-colors${order.orderStatus === 'pending' ? ' bg-amber-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-tea-600">{order.orderNumber}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 text-xs">{order.user?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{order.user?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          €{order.total?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`status-badge ${STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          {actions.length > 0 ? (
                            <div className="action-btns">
                              {actions.map(action => (
                                <button
                                  key={action.status}
                                  className={`action-btn ${action.style}`}
                                  disabled={isUpd}
                                  onClick={() => handleAction(order._id, action.status)}
                                >
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

              {orders.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🍵</p>
                  No orders found.
                </div>
              )}
            </div>
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export default AdminOrders;
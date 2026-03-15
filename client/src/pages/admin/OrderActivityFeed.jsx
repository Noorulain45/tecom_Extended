import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../services/api';

/*
  Drop this component anywhere inside SuperAdminDashboard:

    import OrderActivityFeed from './OrderActivityFeed';
    ...
    <OrderActivityFeed />

  It polls every 5s and shows a live feed of order status changes,
  grouped by admin action (accepted / rejected / dispatched / delivered).
*/

const POLL_INTERVAL = 5000;

const STATUS_STYLES = {
  accepted:   { bg: '#d1fae5', color: '#065f46', icon: '✓' },
  rejected:   { bg: '#fee2e2', color: '#991b1b', icon: '✕' },
  dispatched: { bg: '#dbeafe', color: '#1e40af', icon: '→' },
  delivered:  { bg: '#ede9fe', color: '#5b21b6', icon: '★' },
  pending:    { bg: '#fef9c3', color: '#92400e', icon: '◉' },
};

const styles = `
  .oaf-wrap { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  .oaf-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
  .oaf-title { font-size: 14px; font-weight: 600; color: #111827; }
  .oaf-live { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; }
  .oaf-live-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; animation: oaf-pulse 2s infinite; }
  @keyframes oaf-pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

  .oaf-list { max-height: 380px; overflow-y: auto; }
  .oaf-item { display: flex; align-items: flex-start; gap: 12px; padding: 14px 20px; border-bottom: 1px solid #f9fafb; transition: background 0.15s; }
  .oaf-item:hover { background: #fafafa; }
  .oaf-item:last-child { border-bottom: none; }

  .oaf-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .oaf-body { flex: 1; min-width: 0; }
  .oaf-order-num { font-size: 12px; font-weight: 600; color: #111827; }
  .oaf-desc { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .oaf-time { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .oaf-status-pill { display: inline-block; font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; text-transform: capitalize; }

  .oaf-empty { padding: 40px 20px; text-align: center; color: #9ca3af; font-size: 13px; }

  .oaf-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; border-bottom: 1px solid #f3f4f6; }
  .oaf-stat { padding: 14px 16px; text-align: center; border-right: 1px solid #f3f4f6; }
  .oaf-stat:last-child { border-right: none; }
  .oaf-stat-num { font-size: 22px; font-weight: 700; color: #111827; }
  .oaf-stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
`;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const OrderActivityFeed = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchOrders = async (silent = false) => {
    try {
      // Fetch recent orders across all statuses, sorted by updatedAt
      const { data } = await adminAPI.getOrders({ limit: 50, page: 1 });
      const all = data.data ?? [];
      // Sort by most recently updated
      all.sort((a, b) => new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt));
      setOrders(all);
    } catch {
      // silent fail — superadmin feed is non-critical
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);
    pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, []);

  // Stats
  const counts = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const statItems = [
    { label: 'Pending',    key: 'pending',    color: '#f59e0b' },
    { label: 'Accepted',   key: 'accepted',   color: '#3b82f6' },
    { label: 'Dispatched', key: 'dispatched', color: '#8b5cf6' },
    { label: 'Delivered',  key: 'delivered',  color: '#10b981' },
  ];

  // Only show orders that have moved past pending (activity = status changes)
  const activityOrders = orders.filter(o =>
    ['accepted','rejected','dispatched','delivered'].includes(o.orderStatus)
  );

  return (
    <div className="oaf-wrap">
      <style>{styles}</style>

      <div className="oaf-header">
        <span className="oaf-title">Order Activity</span>
        <span className="oaf-live">
          <span className="oaf-live-dot" />
          Live
        </span>
      </div>

      {/* Stats row */}
      <div className="oaf-stats">
        {statItems.map(s => (
          <div className="oaf-stat" key={s.key}>
            <div className="oaf-stat-num" style={{ color: s.color }}>{counts[s.key] || 0}</div>
            <div className="oaf-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Activity feed */}
      <div className="oaf-list">
        {loading ? (
          <div className="oaf-empty">Loading…</div>
        ) : activityOrders.length === 0 ? (
          <div className="oaf-empty">No order activity yet.</div>
        ) : (
          activityOrders.map(order => {
            const s = STATUS_STYLES[order.orderStatus] || STATUS_STYLES.pending;
            return (
              <div className="oaf-item" key={order._id}>
                <div className="oaf-icon" style={{ background: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <div className="oaf-body">
                  <span className="oaf-order-num">{order.orderNumber}</span>
                  {' '}
                  <span
                    className="oaf-status-pill"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {order.orderStatus}
                  </span>
                  <p className="oaf-desc">
                    {order.user?.name || 'Customer'} · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} · €{order.total?.toFixed(2)}
                  </p>
                  <p className="oaf-time">{timeAgo(order.updatedAt ?? order.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrderActivityFeed;
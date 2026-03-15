import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_ICONS = {
  accepted:   '✓',
  rejected:   '✕',
  dispatched: '→',
  delivered:  '★',
  confirmed:  '✓',
  shipped:    '📦',
  cancelled:  '✕',
};

const STATUS_COLORS = {
  accepted:   { bg: '#d1fae5', color: '#065f46' },
  rejected:   { bg: '#fee2e2', color: '#991b1b' },
  dispatched: { bg: '#dbeafe', color: '#1e40af' },
  delivered:  { bg: '#ede9fe', color: '#5b21b6' },
  confirmed:  { bg: '#d1fae5', color: '#065f46' },
  shipped:    { bg: '#dbeafe', color: '#1e40af' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const styles = `
  .nb-wrap { position: relative; display: inline-block; }

  .nb-btn {
    position: relative; background: none; border: none; cursor: pointer;
    padding: 8px; border-radius: 8px; color: inherit;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s;
  }
  .nb-btn:hover { background: rgba(0,0,0,0.05); }

  .nb-badge {
    position: absolute; top: 2px; right: 2px;
    min-width: 17px; height: 17px; border-radius: 10px;
    background: #ef4444; color: #fff;
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px; line-height: 1;
    border: 2px solid #fff;
    animation: nb-pop 0.25s ease;
  }
  @keyframes nb-pop { from { transform: scale(0); } to { transform: scale(1); } }

  .nb-dropdown {
    position: absolute; right: 0; top: calc(100% + 8px);
    width: 340px; background: #fff;
    border: 1px solid #e5e7eb; border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    z-index: 9999; overflow: hidden;
    animation: nb-fade 0.18s ease;
  }
  @keyframes nb-fade { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

  .nb-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .nb-header-title { font-size: 13px; font-weight: 600; color: #111827; }
  .nb-header-actions { display: flex; gap: 10px; }
  .nb-header-btn {
    font-size: 11px; color: #6b7280; background: none; border: none;
    cursor: pointer; padding: 0; font-family: inherit;
    transition: color 0.15s;
  }
  .nb-header-btn:hover { color: #111827; }

  .nb-list { max-height: 380px; overflow-y: auto; }

  .nb-item {
    display: flex; align-items: flex-start; gap: 11px;
    padding: 12px 16px; cursor: pointer;
    border-bottom: 1px solid #f9fafb;
    transition: background 0.12s;
    text-decoration: none;
  }
  .nb-item:last-child { border-bottom: none; }
  .nb-item:hover { background: #f9fafb; }
  .nb-item.unread { background: #fffbeb; }
  .nb-item.unread:hover { background: #fef3c7; }

  .nb-icon {
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px;
  }

  .nb-item-body { flex: 1; min-width: 0; }
  .nb-item-title { font-size: 12.5px; font-weight: 600; color: #111827; line-height: 1.4; }
  .nb-item-body-text { font-size: 11.5px; color: #6b7280; margin-top: 2px; line-height: 1.5; }
  .nb-item-meta { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .nb-item-order { font-size: 10.5px; font-family: monospace; color: #9ca3af; }
  .nb-item-time { font-size: 10.5px; color: #9ca3af; }
  .nb-unread-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

  .nb-empty {
    padding: 36px 16px; text-align: center;
    font-size: 13px; color: #9ca3af;
  }
  .nb-empty-icon { font-size: 32px; margin-bottom: 8px; }
`;

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const wrapRef  = useRef(null);
  const navigate = useNavigate();

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
  };

  const handleClickNotif = (notif) => {
    markRead(notif.id);
    setOpen(false);
    navigate(`/orders/${notif.orderId}`);
  };

  return (
    <div className="nb-wrap" ref={wrapRef}>
      <style>{styles}</style>

      {/* Bell button */}
      <button className="nb-btn" onClick={handleOpen} title="Notifications" aria-label="Notifications">
        {/* Bell SVG */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <span className="nb-header-title">
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </span>
            <div className="nb-header-actions">
              {unreadCount > 0 && (
                <button className="nb-header-btn" onClick={markAllRead}>Mark all read</button>
              )}
              {notifications.length > 0 && (
                <button className="nb-header-btn" onClick={clearAll}>Clear all</button>
              )}
            </div>
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <div className="nb-empty-icon">🔔</div>
                <p>No notifications yet</p>
                <p style={{ fontSize: 11, marginTop: 4 }}>You'll be notified when your order status changes</p>
              </div>
            ) : (
              notifications.map(notif => {
                const s = STATUS_COLORS[notif.status] || { bg: '#f3f4f6', color: '#374151' };
                const icon = STATUS_ICONS[notif.status] || '•';
                return (
                  <div
                    key={notif.id}
                    className={`nb-item${!notif.read ? ' unread' : ''}`}
                    onClick={() => handleClickNotif(notif)}
                  >
                    <div className="nb-icon" style={{ background: s.bg, color: s.color }}>
                      {icon}
                    </div>
                    <div className="nb-item-body">
                      <p className="nb-item-title">{notif.title}</p>
                      <p className="nb-item-body-text">{notif.body}</p>
                      <div className="nb-item-meta">
                        <span className="nb-item-order">{notif.orderNumber}</span>
                        <span className="nb-item-time">· {timeAgo(notif.createdAt)}</span>
                      </div>
                    </div>
                    {!notif.read && <div className="nb-unread-dot" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
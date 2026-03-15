import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { orderAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 10000; // 10 seconds
const STORAGE_KEY   = 'tea_order_statuses';   // { orderId: status }
const NOTIF_KEY     = 'tea_notifications';     // array of notification objects

/* Human-readable messages per status */
const STATUS_MESSAGES = {
  accepted:   { title: 'Order Accepted! 🎉',    body: 'Your order has been accepted and is being prepared.' },
  rejected:   { title: 'Order Rejected',         body: 'Unfortunately your order has been rejected. Please contact support.' },
  dispatched: { title: 'Order Dispatched! 🚚',   body: 'Your order is on its way to you.' },
  delivered:  { title: 'Order Delivered! ✅',    body: 'Your order has been delivered. Enjoy your tea!' },
  // legacy statuses
  confirmed:  { title: 'Order Confirmed! ✓',    body: 'Your order has been confirmed.' },
  shipped:    { title: 'Order Shipped! 📦',      body: 'Your order has been shipped.' },
  cancelled:  { title: 'Order Cancelled',        body: 'Your order has been cancelled.' },
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]'); }
    catch { return []; }
  });
  const pollRef = useRef(null);

  /* Persist notifications to localStorage whenever they change */
  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  /* Load cached order statuses */
  const getCachedStatuses = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  };

  const setCachedStatuses = (statuses) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  };

  /* Poll and diff */
  const checkForUpdates = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await orderAPI.getAll();
      const orders   = data.data ?? data ?? [];
      const cached   = getCachedStatuses();
      const newNotifs = [];

      orders.forEach(order => {
        const prev    = cached[order._id];
        const current = order.orderStatus;

        // First time seeing this order — just cache it, no notification
        if (!prev) {
          cached[order._id] = current;
          return;
        }

        // Status changed and it's one we care about
        if (prev !== current && STATUS_MESSAGES[current]) {
          cached[order._id] = current;
          const msg = STATUS_MESSAGES[current];
          newNotifs.push({
            id:          `${order._id}-${current}-${Date.now()}`,
            orderId:     order._id,
            orderNumber: order.orderNumber,
            status:      current,
            title:       msg.title,
            body:        msg.body,
            read:        false,
            createdAt:   new Date().toISOString(),
          });
        }
      });

      if (newNotifs.length > 0) {
        setCachedStatuses(cached);
        setNotifications(prev => [...newNotifs, ...prev].slice(0, 50)); // cap at 50
      } else {
        // Still update cache for any new orders
        setCachedStatuses(cached);
      }
    } catch {
      /* silent — notifications are non-critical */
    }
  }, [user]);

  /* Start/stop polling based on auth */
  useEffect(() => {
    if (!user) {
      clearInterval(pollRef.current);
      return;
    }
    checkForUpdates(); // immediate first check
    pollRef.current = setInterval(checkForUpdates, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [user, checkForUpdates]);

  /* Clear cached statuses on logout */
  useEffect(() => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, markRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
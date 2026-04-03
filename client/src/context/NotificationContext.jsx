import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { orderAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL = 10000;
const STORAGE_KEY   = 'tea_order_statuses';
const NOTIF_KEY     = 'tea_notifications';
const NEST_URL      = import.meta.env.VITE_NEST_URL || 'http://localhost:3002';

const STATUS_MESSAGES = {
  accepted:   { title: 'Order Accepted! 🎉',    body: 'Your order has been accepted and is being prepared.' },
  rejected:   { title: 'Order Rejected',         body: 'Unfortunately your order has been rejected. Please contact support.' },
  dispatched: { title: 'Order Dispatched! 🚚',   body: 'Your order is on its way to you.' },
  delivered:  { title: 'Order Delivered! ✅',    body: 'Your order has been delivered. Enjoy your tea!' },
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
  const pollRef   = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const pushNotif = useCallback((notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 50));
  }, []);

  /* ── Socket.IO — real-time review notifications ── */
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = io(NEST_URL, {
      auth: { token: token || '' },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('new_review', (data) => {
      pushNotif({ id: `review-${data.reviewId}-${Date.now()}`, type: 'new_review', title: '⭐ New Review', body: data.message, reviewerName: data.reviewerName, productName: data.productName, productId: data.productId, reviewId: data.reviewId, read: false, createdAt: data.createdAt });
    });
    socket.on('review_reply', (data) => {
      pushNotif({ id: `reply-${data.reviewId}-${Date.now()}`, type: 'review_reply', title: '💬 New Reply', body: data.message, read: false, createdAt: data.createdAt });
    });
    socket.on('review_liked', (data) => {
      pushNotif({ id: `like-${data.reviewId}-${Date.now()}`, type: 'review_liked', title: '👍 Review Liked', body: data.message, read: false, createdAt: data.createdAt });
    });
    socket.on('review_moderated', (data) => {
      pushNotif({ id: `mod-${data.reviewId}-${Date.now()}`, type: 'review_moderated', title: '🚩 Review Update', body: data.message, read: false, createdAt: data.createdAt });
    });
    socket.on('product_updated', (data) => {
      pushNotif({ id: `prod-${data.productId}-${Date.now()}`, type: 'product_updated', title: '🛍️ Product Updated', body: data.message, read: false, createdAt: data.createdAt });
    });

    return () => { socket.disconnect(); };
  }, [pushNotif]);

  /* ── Order status polling (existing) ── */
  const getCachedStatuses = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  };
  const setCachedStatuses = (s) => localStorage.setItem(STORAGE_KEY, JSON.stringify(s));

  const checkForUpdates = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await orderAPI.getAll();
      const orders  = data.data ?? data ?? [];
      const cached  = getCachedStatuses();
      const newNotifs = [];

      orders.forEach(order => {
        const prev    = cached[order._id];
        const current = order.orderStatus;
        if (!prev) { cached[order._id] = current; return; }
        if (prev !== current && STATUS_MESSAGES[current]) {
          cached[order._id] = current;
          const msg = STATUS_MESSAGES[current];
          newNotifs.push({ id: `${order._id}-${current}-${Date.now()}`, orderId: order._id, orderNumber: order.orderNumber, status: current, title: msg.title, body: msg.body, read: false, createdAt: new Date().toISOString() });
        }
      });

      setCachedStatuses(cached);
      if (newNotifs.length > 0) setNotifications(prev => [...newNotifs, ...prev].slice(0, 50));
    } catch { /* silent */ }
  }, [user]);

  useEffect(() => {
    if (!user) { clearInterval(pollRef.current); return; }
    checkForUpdates();
    pollRef.current = setInterval(checkForUpdates, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [user, checkForUpdates]);

  useEffect(() => {
    if (!user) localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearAll    = () => setNotifications([]);

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

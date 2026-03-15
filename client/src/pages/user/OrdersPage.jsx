import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { orderAPI } from '../../services/api';
import Pagination from '../../components/ui/Pagination';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    orderAPI.getMyOrders({ page, limit: 10 })
      .then(({ data }) => { setOrders(data.data); setPagination(data.pagination); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-tea-100 rounded-2xl animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-3xl text-tea-900 mb-8">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">📦</p>
          <h3 className="font-display text-xl text-tea-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-6">Start exploring our collection of teas.</p>
          <Link to="/shop" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="block card hover:shadow-md transition-shadow p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-tea-900 font-mono text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <span className={`badge text-xs ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  <p className="font-semibold text-tea-800">${order.total.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getOne(id)
      .then(({ data }) => setOrder(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancel(id, { reason: 'Cancelled by customer' });
      setOrder(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse"><div className="h-10 bg-tea-100 rounded w-1/3 mb-6" /><div className="h-64 bg-tea-100 rounded-2xl" /></div>;
  if (!order) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/orders" className="text-sm text-tea-600 hover:text-tea-800 mb-1 block">← My Orders</Link>
          <h1 className="font-display text-2xl text-tea-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`badge text-sm py-1 px-3 ${statusColors[order.orderStatus]}`}>{order.orderStatus}</span>
      </div>

      {/* Progress tracker */}
      {order.orderStatus !== 'cancelled' && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-tea-100 z-0" />
            <div className="absolute top-4 left-0 h-0.5 bg-tea-500 z-0 transition-all" style={{ width: `${Math.max(0, (currentStep / (statusSteps.length - 1)) * 100)}%` }} />
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i <= currentStep ? 'bg-tea-600 border-tea-600 text-white' : 'bg-white border-tea-200 text-gray-400'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className="text-xs capitalize text-gray-500 hidden sm:block">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5 mb-4">
        <h2 className="font-display text-lg text-tea-900 mb-4">Items Ordered</h2>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-3">
              {item.thumbnail && <img src={item.thumbnail} alt={item.name} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />}
              <div className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                {item.variant?.name && <p className="text-xs text-gray-500">{item.variant.name}</p>}
                <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-800 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        {/* Shipping */}
        <div className="card p-5">
          <h2 className="font-display text-base text-tea-900 mb-3">Shipping Address</h2>
          <address className="not-italic text-sm text-gray-600 leading-relaxed">
            {order.shippingAddress.street}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
            {order.shippingAddress.country}
          </address>
          {order.trackingNumber && (
            <p className="mt-3 text-xs font-mono bg-gray-50 px-2 py-1 rounded">Tracking: {order.trackingNumber}</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="card p-5">
          <h2 className="font-display text-base text-tea-900 mb-3">Payment</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>Method</span><span className="capitalize font-medium text-gray-800">{order.paymentMethod.toUpperCase()}</span></div>
            <div className="flex justify-between"><span>Status</span><span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-gray-800'}`}>{order.paymentStatus}</span></div>
            <div className="flex justify-between"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `$${order.shippingCost.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>${order.tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold text-tea-900 border-t border-tea-100 pt-2 mt-1"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Cancel button */}
      {['pending', 'confirmed'].includes(order.orderStatus) && (
        <button onClick={handleCancel} disabled={cancelling} className="w-full py-2.5 rounded-lg border border-red-300 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-50">
          {cancelling ? 'Cancelling...' : 'Cancel Order'}
        </button>
      )}
    </div>
  );
};

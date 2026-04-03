import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sever-theta-three.vercel.app/api',
  headers: { 'Content-Type': 'application/json' },
});

// NestJS service axios instance
export const nestApi = axios.create({
  baseURL: (import.meta.env.VITE_NEST_URL || 'http://localhost:3002') + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};
api.interceptors.request.use(attachToken);
nestApi.interceptors.request.use(attachToken);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (data) => api.put('/cart/update', data),
  remove: (data) => api.delete('/cart/remove', { data }),
  clear: () => api.delete('/cart/clear'),
};


// ── Products (public) ─────────────────────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (category, params) => api.get(`/products/category/${category}`, { params }),
  search: (query) => api.get('/products/search', { params: { q: query } }),

  // ── Used by SuperAdminDashboard ProductsSection ──
  create: (data) => api.post('/admin/products', data),
  update: (id, data) => api.put(`/admin/products/${id}`, data),
  delete: (id) => api.delete(`/admin/products/${id}`),
};

// ── Orders (user) ─────────────────────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  // Analytics / stats
  getAnalytics: () => api.get('/admin/stats'),
  getStats: () => api.get('/admin/stats'),

  // Products (kept for backwards-compat with any other admin pages)
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Orders
  // SuperAdminDashboard calls adminAPI.getOrders(params)
  getOrders: (params) => api.get('/admin/orders', { params }),
  getAllOrders: (params) => api.get('/admin/orders', { params }), // alias
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

  // Users
  // SuperAdminDashboard calls adminAPI.getUsers(params)
  getUsers: (params) => api.get('/admin/users', { params }),
  getAllUsers: (params) => api.get('/admin/users', { params }), // alias

  // SuperAdminDashboard calls adminAPI.toggleBlock(userId)
  toggleBlock: (id) => api.put(`/admin/users/${id}/block`),

  // SuperAdminDashboard calls adminAPI.updateRole(userId, role)
  updateRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }), // alias

  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

export default api;

// ── Reviews (NestJS) ──────────────────────────────────────────────────────────
export const reviewsAPI = {
  getByProduct: (productId) => nestApi.get(`/reviews/product/${productId}`),
  add: (productId, data) => nestApi.post(`/reviews/product/${productId}`, data),
  addReply: (reviewId, data) => nestApi.post(`/reviews/${reviewId}/reply`, data),
  deleteReply: (reviewId, replyId) => nestApi.delete(`/reviews/${reviewId}/reply/${replyId}`),
  toggleLike: (reviewId) => nestApi.post(`/reviews/${reviewId}/like`),
  delete: (reviewId) => nestApi.delete(`/reviews/${reviewId}`),
  flag: (reviewId) => nestApi.patch(`/reviews/${reviewId}/flag`),
};
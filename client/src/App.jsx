import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';

// Guards
import { PrivateRoute, AdminRoute, SuperAdminRoute } from './components/auth/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import ShopPage from './pages/shop/ShopPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';

// User pages
import { OrdersPage, OrderDetailPage } from './pages/user/OrdersPage';
import ProfilePage from './pages/user/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

// Main storefront layout
const StoreLayout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
                success: { iconTheme: { primary: '#538349', secondary: '#fff' } },
              }}
            />
            <Routes>
              {/* Store routes */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected user routes */}
                <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute><OrdersPage /></PrivateRoute>} />
                <Route path="/orders/:id" element={<PrivateRoute><OrderDetailPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="superadmin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={
                <StoreLayout>
                  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
                    <p className="text-6xl mb-4">🍵</p>
                    <h1 className="font-display text-3xl text-tea-900 mb-3">Page Not Found</h1>
                    <p className="text-gray-500 mb-6">Looks like this page steeped too long and disappeared.</p>
                    <a href="/" className="btn-primary">Back to Home</a>
                  </div>
                </StoreLayout>
              } />
            </Routes>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
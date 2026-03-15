import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PaymentIcon from '@mui/icons-material/Payment';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminLayout = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ── Nav items — Users removed, new items added ───────────────────────────
  const navItems = [
    {
      label: 'Dashboard',
      to: '/admin',
      icon: <DashboardIcon fontSize="small" />,
      exact: true,
    },
    {
      label: 'Products',
      to: '/admin/products',
      icon: <LocalCafeIcon fontSize="small" />,
    },
    {
      label: 'Orders',
      to: '/admin/orders',
      icon: <ShoppingBagIcon fontSize="small" />,
    },
    {
      label: 'Payments',
      to: '/admin/payments',
      icon: <PaymentIcon fontSize="small" />,
    },

    // Super Admin nav item — only visible to superadmins
    ...(isSuperAdmin
      ? [{
          label: 'Super Admin',
          to: '/admin/superadmin',
          icon: <AdminPanelSettingsIcon fontSize="small" />,
          badge: 'SA',
        }]
      : []),
  ];

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-gray-950 text-white w-64">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-sm flex-shrink-0">
          🍃
        </div>
        <div>
          <p className="font-bold text-sm text-white tracking-tight">TeaLeaf</p>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Admin</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/8'
              }`}
            >
              {/* Icon */}
              <span className={active ? 'text-white' : 'text-gray-500 group-hover:text-white transition-colors'}>
                {item.icon}
              </span>

              {/* Label */}
              <span className="flex-1">{item.label}</span>


              {item.badge && (
                <span className="text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name?.split(' ')[0]}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        >
          <LogoutIcon fontSize="small" />
          Sign Out
        </button>

        <Link
          to="/"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/8 transition-all"
        >
          <span>🏠</span>
          Back to Store
        </Link>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon fontSize="small" />
          </button>

          <div className="hidden md:block">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm text-gray-600 font-medium">
              {user?.name?.split(' ')[0]}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isSuperAdmin
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {isSuperAdmin ? 'Superadmin' : 'Admin'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
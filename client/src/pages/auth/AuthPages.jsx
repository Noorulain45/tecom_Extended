// pages/auth/AuthPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import toast from 'react-hot-toast';

// ── Shared input style ─────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 rounded-xl border border-gray-200 text-base bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition';

// ══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════════════
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'user' ? from : '/admin', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 items-center justify-center relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-emerald-500 opacity-40 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-60 h-60 rounded-full bg-emerald-700 opacity-40 blur-3xl" />
        {/* floating emoji */}
        <div className="absolute top-10 right-16 text-6xl opacity-20 select-none rotate-12">🍃</div>
        <div className="absolute bottom-16 left-12 text-5xl opacity-20 select-none -rotate-12">🍵</div>

        <div className="text-center text-white z-10 px-14">
          <div className="w-20 h-20 rounded-3xl bg-white/20 flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <LocalCafeIcon sx={{ fontSize: 40 }} className="text-white" />
          </div>
          <h2 className="font-display text-5xl font-bold mb-4">Welcome Back</h2>
          <p className="text-emerald-100 text-lg leading-relaxed max-w-xs mx-auto">
            Your collection of rare teas awaits. Continue your journey.
          </p>

          {/* trust badges */}
          <div className="mt-10 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {[
              '10,000+ happy tea lovers',
              'Teas from 20+ countries',
              'Free shipping over $50',
            ].map((t) => (
              <div key={t} className="flex items-center gap-3 text-sm text-emerald-100">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs text-white flex-shrink-0">✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">

          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-sm">🍃</span>
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-emerald-700">TeaHaven</span>
          </div>

          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-500 text-base mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-800 font-semibold">
              Create one →
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8">
            <p className="text-sm font-semibold text-amber-800 mb-2">Demo Credentials</p>
            <div className="text-xs text-amber-700 space-y-1 leading-relaxed">
              <p>User: john@example.com / password123</p>
              <p>Admin: admin@tea.com / password123</p>
              <p>Superadmin: superadmin@tea.com / password123</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={`${inputCls} focus:ring-emerald-400`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className={`${inputCls} pr-16 focus:ring-emerald-400`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 hover:text-gray-700 transition"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            By signing in you agree to our{' '}
            <span className="text-gray-600 underline cursor-pointer">Terms</span> &{' '}
            <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════
// REGISTER PAGE
// ══════════════════════════════════════════════════════════════
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created!');
      navigate('/shop');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-950 items-center justify-center relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-emerald-600 opacity-20 blur-3xl" />
        <div className="absolute bottom-[-40px] left-[-40px] w-56 h-56 rounded-full bg-amber-500 opacity-15 blur-3xl" />
        {/* floating emojis */}
        <div className="absolute top-12 left-12 text-5xl opacity-20 select-none rotate-6">🌿</div>
        <div className="absolute bottom-14 right-14 text-6xl opacity-20 select-none -rotate-12">🍃</div>

        <div className="text-center z-10 px-14">
          <div className="w-20 h-20 rounded-3xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8">
            <span className="text-4xl">🍵</span>
          </div>
          <h2 className="font-display text-5xl font-bold text-white mb-4">Join TeaHaven</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-xs mx-auto">
            Discover rare teas from the world's finest gardens. Your journey starts here.
          </p>

          {/* perks */}
          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { emoji: '🎁', label: 'Welcome discount' },
              { emoji: '📦', label: 'Order tracking' },
              { emoji: '⭐', label: 'Loyalty rewards' },
              { emoji: '🍵', label: 'Brew guides' },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 text-sm text-gray-300">
                <span>{p.emoji}</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">

          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="text-white text-sm">🍃</span>
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-emerald-700">TeaHaven</span>
          </div>

          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500 text-base mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-800 font-semibold">
              Sign in →
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={`${inputCls} focus:ring-emerald-400`}
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={`${inputCls} focus:ring-emerald-400`}
                placeholder="you@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  className={`${inputCls} focus:ring-emerald-400`}
                  placeholder="Min. 6 chars"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm</label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  required
                  className={`${inputCls} focus:ring-emerald-400`}
                  placeholder="Repeat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 mt-2"
            >
              {loading ? 'Creating account...' : 'Create My Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            By creating an account you agree to our{' '}
            <span className="text-gray-600 underline cursor-pointer">Terms</span> &{' '}
            <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};
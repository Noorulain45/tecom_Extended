# 🍵 TeaLeaf — E-Commerce Tea Platform

A full-stack e-commerce platform for premium teas, built with React, Node.js, Express, and MongoDB.

---

## Architecture Overview

```
tea-platform/
├── backend/          # Node.js + Express REST API
│   ├── controllers/  # Business logic (auth, products, cart, orders, admin)
│   ├── middleware/   # JWT auth + role-based access control
│   ├── models/       # Mongoose schemas (User, Product, Cart, Order)
│   ├── routes/       # Express route definitions
│   └── utils/        # DB seeder
└── frontend/         # React.js SPA
    └── src/
        ├── components/  # Reusable UI (Navbar, ProductCard, Filters, Pagination)
        ├── context/     # AuthContext, CartContext
        ├── pages/       # Route pages (Home, Shop, Admin, etc.)
        └── services/    # Axios API layer
```

---

## Backend Responsibilities (per spec)

| Feature | Implementation |
|---|---|
| JWT Auth | `controllers/authController.js` — login, register, token generation |
| Password Hashing | bcryptjs pre-save hook in `models/User.js` |
| Role Assignment | `role` field on User: `user`, `admin`, `superadmin` |
| Block/Unblock | `isBlocked` field, checked on every protected request |
| Product CRUD | `controllers/productController.js` |
| Backend Pagination | `page`, `limit`, `total`, `totalPages` returned from API |
| Backend Filtering | category, price, rating, flavor, search, caffeine — all server-side |
| Backend Sorting | price-asc, price-desc, rating, newest, popular — all server-side |
| Variant Management | Subdocument with `priceModifier` + `stock` per variant |
| Stock Validation | Checked in cart add/update AND order placement |
| Cart in Database | `models/Cart.js` — persisted per user |
| Order Placement | Stock decremented atomically on order creation |
| Stock Restore | Restored on order cancellation |
| Analytics | Aggregation pipeline in `controllers/adminController.js` |
| Role Middleware | `middleware/auth.js` — `protect`, `adminOnly`, `superadminOnly` |

---

## Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, MUI, react-hot-toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (jsonwebtoken) + bcryptjs

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

This creates 8 premium tea products and 4 users:

| Email | Password | Role |
|---|---|---|
| superadmin@tea.com | password123 | superadmin |
| admin@tea.com | password123 | admin |
| john@example.com | password123 | user |
| jane@example.com | password123 | user |

### 4. Run Backend

```bash
cd backend
npm run dev   # nodemon for hot-reload
# or
npm start
```

Backend runs on: `http://localhost:5000`

### 5. Run Frontend

```bash
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

> The frontend proxies `/api` requests to `http://localhost:5000` via the `"proxy"` field in `package.json`.

---

## API Reference

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/update-profile` | Private |
| PUT | `/api/auth/change-password` | Private |

### Products
| Method | Route | Access |
|---|---|---|
| GET | `/api/products?page=1&limit=12&category=green-tea&sort=price-asc` | Public |
| GET | `/api/products/:id` | Public |
| GET | `/api/products/:id/variants/:variantId` | Public |
| POST | `/api/products` | Admin+ |
| PUT | `/api/products/:id` | Admin+ |
| DELETE | `/api/products/:id` | Admin+ |
| POST | `/api/products/:id/reviews` | User |
| POST | `/api/products/:id/variants` | Admin+ |
| PUT | `/api/products/:id/variants/:variantId` | Admin+ |

### Cart
| Method | Route | Body |
|---|---|---|
| GET | `/api/cart` | — |
| POST | `/api/cart/add` | `{ productId, variantId, quantity }` |
| PUT | `/api/cart/update` | `{ productId, variantId, quantity }` |
| DELETE | `/api/cart/remove` | `{ productId, variantId }` |
| DELETE | `/api/cart/clear` | — |

### Orders
| Method | Route | Access |
|---|---|---|
| POST | `/api/orders` | User |
| GET | `/api/orders?page=1&status=pending` | User (own) |
| GET | `/api/orders/:id` | User (own) / Admin |
| PUT | `/api/orders/:id/cancel` | User (own) |

### Admin
| Method | Route | Access |
|---|---|---|
| GET | `/api/admin/analytics` | Admin+ |
| GET | `/api/admin/users?page=1&role=user` | Admin+ |
| PUT | `/api/admin/users/:id/block` | Admin+ |
| PUT | `/api/admin/users/:id/role` | Superadmin only |
| GET | `/api/admin/orders?status=pending` | Admin+ |
| PUT | `/api/admin/orders/:id/status` | Admin+ |

---

## Key Design Decisions

### No Client-Side Pagination
All pagination is handled by the backend. The frontend only sends `page` and `limit` parameters and renders what it receives. `Pagination.jsx` is a pure display component.

### No Client-Side Filtering
Every filter (category, price range, rating, flavor, caffeine level, search) is sent as a query param to the backend. The frontend never filters the `products` array locally.

### Stock Validation on Backend
Stock is validated in two places:
1. **Cart operations** — `cartController.js` checks variant stock before adding/updating
2. **Order placement** — `orderController.js` re-validates all items before creating the order

This prevents race conditions and overselling.

### Role Hierarchy
```
superadmin > admin > user
```
- `superadmin` can change user roles, manage admins
- `admin` can manage products and orders, block/unblock regular users
- `user` can shop, see their own orders/cart

### Soft Delete
Products are not deleted from the database. Instead `isActive` is set to `false`. This preserves order history integrity.

---

## Frontend Pages

| Route | Component | Auth |
|---|---|---|
| `/` | HomePage | Public |
| `/shop` | ShopPage | Public |
| `/products/:id` | ProductDetailPage | Public |
| `/cart` | CartPage | Public (shows sign-in prompt) |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/checkout` | CheckoutPage | User |
| `/orders` | OrdersPage | User |
| `/orders/:id` | OrderDetailPage | User |
| `/profile` | ProfilePage | User |
| `/admin` | AdminDashboard | Admin+ |
| `/admin/products` | AdminProducts | Admin+ |
| `/admin/orders` | AdminOrders | Admin+ |
| `/admin/users` | AdminUsers | Admin+ |

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productAPI } from '../services/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Prosto+One&family=Jost:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cart-root {
    font-family: 'Jost', sans-serif;
    background: #fff;
    color: #1c1814;
    min-height: 100vh;
  }

  /* ── Stepper ── */
  .stepper {
    display: flex; align-items: center;
    padding: 28px 60px 0;
    border-bottom: none;
    gap: 0;
  }
  .step {
    display: flex; align-items: center; gap: 10px;
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #c4b49a; font-weight: 500; white-space: nowrap;
  }
  .step.active { color: #1c1814; }
  .step-line {
    flex: 1; height: 1px; background: #e0e0e0; margin: 0 16px;
  }

  /* ── Main layout ── */
  .cart-body { padding: 36px 60px 60px; display: grid; grid-template-columns: 1fr 300px; gap: 40px; align-items: start; }

  /* ── Items column ── */
  .cart-items-col {}

  .cart-item {
    display: grid;
    grid-template-columns: 60px 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 18px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .cart-item:first-child { border-top: 1px solid #f0f0f0; }

  .cart-item-img {
    width: 60px; height: 60px; object-fit: cover;
    background: #f4f3f0; display: block;
  }
  .cart-item-img-ph {
    width: 60px; height: 60px; background: #f4f3f0;
    display: flex; align-items: center; justify-content: center; font-size: 22px;
  }

  .cart-item-info {}
  .cart-item-name {
    font-size: 12.5px; color: #1c1814; text-decoration: none;
    line-height: 1.4; display: block; margin-bottom: 3px;
  }
  .cart-item-name:hover { color: #7a7268; }
  .cart-item-variant { font-size: 11px; color: #a89f95; font-weight: 300; margin-bottom: 6px; }
  .cart-item-remove {
    font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #c4b49a; background: none; border: none; cursor: pointer;
    font-family: 'Jost', sans-serif; font-weight: 500; padding: 0;
    transition: color 0.15s;
  }
  .cart-item-remove:hover { color: #c0392b; }

  .cart-item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
  .cart-item-price { font-size: 12.5px; color: #1c1814; }

  .qty-row { display: flex; align-items: center; gap: 10px; }
  .qty-btn {
    width: 20px; height: 20px; border: 1px solid #ddd;
    background: transparent; cursor: pointer; border-radius: 50%;
    font-size: 15px; color: #7a7268;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.14s; line-height: 1; font-weight: 300;
  }
  .qty-btn:hover { border-color: #1c1814; color: #1c1814; }
  .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
  .qty-num { font-size: 12.5px; color: #1c1814; min-width: 14px; text-align: center; }

  /* Subtotal row */
  .cart-subtotal-row {
    display: flex; justify-content: space-between;
    padding: 20px 0 0;
    font-size: 13px; color: #1c1814;
  }

  /* Back to shopping */
  .back-btn {
    display: inline-block; margin-top: 20px;
    padding: 11px 28px; border: 1px solid #1c1814;
    font-family: 'Jost', sans-serif; font-size: 10px;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: #1c1814; text-decoration: none; font-weight: 500;
    background: transparent; cursor: pointer;
    transition: all 0.18s;
  }
  .back-btn:hover { background: #1c1814; color: #fff; }

  /* ── Right column ── */
  .cart-right-col { display: flex; flex-direction: column; gap: 16px; }

  /* Order summary */
  .order-summary {
    background: #f7f6f3; padding: 26px 24px;
  }
  .summary-title {
    font-size: 14px; font-weight: 500; color: #1c1814;
    margin-bottom: 20px;
  }
  .summary-row {
    display: flex; justify-content: space-between;
    font-size: 12.5px; color: #7a7268; margin-bottom: 12px;
  }
  .summary-row.total {
    font-size: 13.5px; color: #1c1814; font-weight: 500;
    border-top: 1px solid #e0e0e0; padding-top: 14px; margin-top: 4px; margin-bottom: 0;
  }
  .summary-shipping-note {
    font-size: 11px; color: #a89f95; margin-top: 10px; margin-bottom: 18px;
    font-weight: 300;
  }
  .checkout-btn {
    width: 100%; padding: 14px;
    background: #1c1814; color: #fff;
    border: none; cursor: pointer;
    font-family: 'Jost', sans-serif; font-size: 10.5px;
    letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.2s;
  }
  .checkout-btn:hover { background: #332e28; }

  /* Payment types */
  .payment-panel { background: #f7f6f3; padding: 22px 24px; }
  .payment-title { font-size: 13px; font-weight: 500; color: #1c1814; margin-bottom: 14px; }
  .payment-icons { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .payment-icon {
    height: 26px; padding: 4px 8px;
    background: #fff; border: 1px solid #e8e8e8; border-radius: 3px;
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 600; letter-spacing: 0.04em; color: #555;
    min-width: 40px;
  }
  .payment-icon.visa   { color: #1a1f71; }
  .payment-icon.mc     { color: #eb001b; }
  .payment-icon.maestro{ color: #007bc1; }

  /* ── Delivery & Retour ── */
  .delivery-section {
    padding: 0 60px 52px;
    display: grid; grid-template-columns: 1fr 300px; gap: 40px;
  }
  .delivery-box {
    background: #f7f6f3; padding: 28px 28px;
    grid-column: 2;
  }
  .delivery-title { font-size: 14px; font-weight: 500; color: #1c1814; margin-bottom: 18px; }
  .delivery-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .delivery-list li {
    display: flex; gap: 10px; font-size: 12px; color: #7a7268;
    line-height: 1.6; font-weight: 300;
  }
  .delivery-list li::before {
    content: '›'; color: #1c1814; font-size: 14px;
    flex-shrink: 0; margin-top: -1px;
  }

  /* ── Popular this season ── */
  .popular-section { padding: 20px 60px 68px; border-top: 1px solid #ececec; }
  .popular-title {
    font-family: 'Prosto One', cursive;
    font-size: 28px; font-weight: 400;
    text-align: center; margin-bottom: 40px; color: #1c1814;
  }
  .popular-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .popular-card { cursor: pointer; text-align: center; }
  .popular-card:hover .popular-img { transform: scale(1.05); }
  .popular-img-wrap {
    background: #f4f3f0; margin-bottom: 14px;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    aspect-ratio: 1 / 1;
  }
  .popular-img { width: 80%; height: 80%; object-fit: contain; transition: transform 0.4s ease; display: block; }
  .popular-name { font-size: 12.5px; color: #1c1814; margin-bottom: 5px; line-height: 1.4; }
  .popular-price { font-size: 12px; color: #a89f95; }

  /* ── Empty / Auth / Loading ── */
  .cart-state {
    min-height: 60vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 14px; text-align: center;
    padding: 40px;
  }
  .cart-state-icon { font-size: 48px; }
  .cart-state h2 { font-family: 'Prosto One', cursive; font-size: 24px; color: #1c1814; }
  .cart-state p { font-size: 13px; color: #a89f95; font-weight: 300; }
  .cart-state a {
    margin-top: 6px; padding: 11px 28px;
    background: #1c1814; color: #fff; border-radius: 2px;
    font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase;
    text-decoration: none; font-weight: 500;
  }
  .spinner {
    width: 28px; height: 28px; border: 2px solid #ececec;
    border-top-color: #c4b49a; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

/* ── Payment icon SVG labels ── */
const PaymentIcons = () => (
  <div className="payment-icons">
    <div className="payment-icon visa">VISA</div>
    <div className="payment-icon mc">MC</div>
    <div className="payment-icon maestro">Maestro</div>
    <div className="payment-icon">iDEAL</div>
    <div className="payment-icon">Advance</div>
  </div>
);

const CartPage = () => {
  const { cart, cartLoading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState({});
  const [popular, setPopular]   = useState([]);

  /* Fetch popular / featured products */
  useEffect(() => {
    productAPI.getAll({ limit: 3, isFeatured: true })
      .then(res => {
        const data = res.data?.data ?? res.data ?? [];
        setPopular(data.slice(0, 3));
      })
      .catch(() => {
        productAPI.getAll({ limit: 3 })
          .then(res => setPopular((res.data?.data ?? res.data ?? []).slice(0, 3)))
          .catch(() => {});
      });
  }, []);

  const handleQtyChange = async (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    const key = `${item.product._id}-${item.variant?.variantId}`;
    setUpdating(u => ({ ...u, [key]: true }));
    try { await updateQuantity(item.product._id, item.variant?.variantId, newQty); }
    finally { setUpdating(u => ({ ...u, [key]: false })); }
  };

  const shipping    = cart.total >= 50 ? 0 : 3.95;
  const grandTotal  = cart.total + shipping;

  /* ── Stepper (always shown) ── */
  const Stepper = () => (
    <div className="stepper">
      <span className="step active">1. My Bag</span>
      <div className="step-line" />
      <span className="step">2. Delivery</span>
      <div className="step-line" />
      <span className="step">3. Review & Payment</span>
    </div>
  );

  /* ── Not signed in — redirect to login ── */
  if (!user) {
    navigate('/login', { state: { from: { pathname: '/cart' } }, replace: true });
    return null;
  }

  /* ── Loading ── */
  if (cartLoading) return (
    <div className="cart-root">
      <style>{styles}</style>
      <Stepper />
      <div className="cart-state">
        <div className="spinner" />
        <p>Loading your bag…</p>
      </div>
    </div>
  );

  /* ── Empty ── */
  if (!cart.items || cart.items.length === 0) return (
    <div className="cart-root">
      <style>{styles}</style>
      <Stepper />
      <div className="cart-state">
        <span className="cart-state-icon">🍵</span>
        <h2>Your bag is empty</h2>
        <p>Discover our collection of premium teas.</p>
        <Link to="/shop">Browse Teas</Link>
      </div>
    </div>
  );

  return (
    <div className="cart-root">
      <style>{styles}</style>
      <Stepper />

      {/* ── Items + Summary ── */}
      <div className="cart-body">

        {/* Left — items */}
        <div className="cart-items-col">
          {cart.items.map(item => {
            const key       = `${item.product._id}-${item.variant?.variantId}`;
            const itemPrice = (item.priceAtAdd + (item.variant?.priceModifier || 0)) * item.quantity;
            const isUpd     = updating[key];
            return (
              <div key={key} className="cart-item">
                {item.product.thumbnail
                  ? <img className="cart-item-img" src={item.product.thumbnail} alt={item.product.name}
                      onError={e => { e.target.style.display="none"; }} />
                  : <div className="cart-item-img-ph">🍵</div>
                }

                <div className="cart-item-info">
                  <Link to={`/products/${item.product._id}`} className="cart-item-name">
                    {item.product.name}
                    {item.variant?.name && ` · ${item.variant.name}`}
                  </Link>
                  {item.variant?.name && <p className="cart-item-variant">{item.variant.name}</p>}
                  <button className="cart-item-remove"
                    onClick={() => removeItem(item.product._id, item.variant?.variantId)}>
                    Remove
                  </button>
                </div>

                <div className="cart-item-right">
                  <div className="qty-row">
                    <button className="qty-btn" disabled={isUpd || item.quantity <= 1}
                      onClick={() => handleQtyChange(item, -1)}>−</button>
                    <span className="qty-num">{item.quantity}</span>
                    <button className="qty-btn" disabled={isUpd}
                      onClick={() => handleQtyChange(item, 1)}>+</button>
                  </div>
                  <span className="cart-item-price">€{itemPrice.toFixed(2)}</span>
                </div>
              </div>
            );
          })}

          {/* Subtotal */}
          <div className="cart-subtotal-row">
            <span>Subtotal</span>
            <span>€{cart.total.toFixed(2)}</span>
          </div>

          <Link to="/shop" className="back-btn">Back to Shopping</Link>
        </div>

        {/* Right — summary + payment */}
        <div className="cart-right-col">
          {/* Order Summary */}
          <div className="order-summary">
            <p className="summary-title">Order summery</p>
            <div className="summary-row"><span>Subtotal</span><span>€{cart.total.toFixed(2)}</span></div>
            <div className="summary-row">
              <span>Delivery</span>
              <span>{shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>€{grandTotal.toFixed(2)}</span>
            </div>
            <p className="summary-shipping-note">Estimated shipping time: 2 days</p>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              Check Out
            </button>
          </div>

          {/* Payment types */}
          <div className="payment-panel">
            <p className="payment-title">Payment type</p>
            <PaymentIcons />
          </div>
        </div>
      </div>

      {/* ── Delivery & Retour ── */}
      <div className="delivery-section">
        <div /> {/* empty left col spacer */}
        <div className="delivery-box">
          <p className="delivery-title">Delivery and retour</p>
          <ul className="delivery-list">
            <li>Order before 12:00 and we will ship the same day.</li>
            <li>Orders made after Friday 12:00 are processed on Monday.</li>
            <li>To return your articles, please contact us first.</li>
            <li>Postal charges for retour are not reimbursed.</li>
          </ul>
        </div>
      </div>

      {/* ── Popular this season ── */}
      {popular.length > 0 && (
        <section className="popular-section">
          <h2 className="popular-title">Popular this season</h2>
          <div className="popular-grid">
            {popular.map(p => (
              <div className="popular-card" key={p._id}
                onClick={() => navigate(`/products/${p._id}`)}>
                <div className="popular-img-wrap">
                  <img className="popular-img" src={p.thumbnail || p.image} alt={p.name}
                    onError={e => { e.target.style.opacity = "0"; }} />
                </div>
                <p className="popular-name">{p.name}</p>
                <p className="popular-price">€{Number(p.basePrice ?? 0).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CartPage;
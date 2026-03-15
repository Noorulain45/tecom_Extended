import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Prosto+One&family=Jost:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .co-root { font-family: 'Jost', sans-serif; background: #fff; color: #1c1814; min-height: 100vh; }

  /* ── Stepper ── */
  .stepper { display: flex; align-items: center; padding: 28px 60px 0; gap: 0; }
  .step { display: flex; align-items: center; gap: 10px; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #c4b49a; font-weight: 500; white-space: nowrap; }
  .step.active { color: #1c1814; }
  .step-line { flex: 1; height: 1px; background: #e0e0e0; margin: 0 16px; }

  /* ── Layout ── */
  .co-body { padding: 40px 60px 60px; display: grid; grid-template-columns: 1fr 320px; gap: 48px; align-items: start; }

  /* ── Form sections ── */
  .co-section { margin-bottom: 28px; }
  .co-section-title { font-family: 'Prosto One', cursive; font-size: 20px; font-weight: 400; color: #1c1814; margin-bottom: 22px; }

  .co-label { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #c4b49a; font-weight: 500; margin-bottom: 7px; display: block; }
  .co-input {
    width: 100%; padding: 11px 14px; border: 1px solid #e0e0e0; border-radius: 2px;
    font-family: 'Jost', sans-serif; font-size: 13px; color: #1c1814;
    background: transparent; outline: none; transition: border-color 0.15s;
  }
  .co-input:focus { border-color: #a89f95; }
  .co-input::placeholder { color: #c4b49a; }
  .co-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .co-field { margin-bottom: 14px; }

  /* Payment options */
  .co-payment-opts { display: flex; flex-direction: column; gap: 10px; }
  .co-payment-opt {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border: 1px solid #e0e0e0; border-radius: 2px;
    cursor: pointer; transition: border-color 0.15s;
  }
  .co-payment-opt.selected { border-color: #1c1814; }
  .co-payment-opt input { accent-color: #1c1814; width: 15px; height: 15px; cursor: pointer; }
  .co-payment-label { font-size: 13px; color: #1c1814; }
  .co-payment-desc { font-size: 11.5px; color: #a89f95; font-weight: 300; margin-top: 2px; }

  /* ── Summary panel ── */
  .co-summary { background: #f7f6f3; padding: 28px 24px; position: sticky; top: 24px; }
  .co-summary-title { font-size: 14px; font-weight: 500; color: #1c1814; margin-bottom: 18px; }

  .co-summary-items { max-height: 220px; overflow-y: auto; margin-bottom: 20px; display: flex; flex-direction: column; gap: 12px; }
  .co-summary-item { display: flex; gap: 12px; align-items: center; }
  .co-summary-item-img { width: 44px; height: 44px; object-fit: cover; background: #ece9e4; flex-shrink: 0; }
  .co-summary-item-info { flex: 1; min-width: 0; }
  .co-summary-item-name { font-size: 12px; color: #1c1814; line-height: 1.4; }
  .co-summary-item-qty { font-size: 11px; color: #a89f95; margin-top: 2px; font-weight: 300; }
  .co-summary-item-price { font-size: 12px; color: #1c1814; flex-shrink: 0; }

  .co-divider { height: 1px; background: #e0e0e0; margin: 4px 0 16px; }
  .co-summary-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #7a7268; margin-bottom: 10px; }
  .co-summary-row.total { font-size: 14px; color: #1c1814; font-weight: 500; border-top: 1px solid #e0e0e0; padding-top: 14px; margin-top: 4px; margin-bottom: 0; }

  .co-place-btn {
    width: 100%; padding: 15px; margin-top: 22px;
    background: #1c1814; color: #fff; border: none; cursor: pointer;
    font-family: 'Jost', sans-serif; font-size: 10.5px;
    letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500;
    transition: background 0.2s;
  }
  .co-place-btn:hover:not(:disabled) { background: #332e28; }
  .co-place-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .co-shipping-note { font-size: 11px; color: #a89f95; text-align: center; margin-top: 10px; font-weight: 300; }
`;

const PAYMENT_METHODS = [
  { value: 'cod',  label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
  { value: 'card', label: 'Credit / Debit Card', desc: 'Secure card payment' },
  { value: 'upi',  label: 'UPI', desc: 'Pay using UPI apps' },
];

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    street: '', city: '', state: '', zipCode: '', country: '',
    paymentMethod: 'cod', notes: '',
  });

  const shipping  = cart.total >= 50 ? 0 : 3.95;
  const grandTotal = cart.total + shipping;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!cart.items?.length) { toast.error('Your cart is empty'); return; }
    setPlacing(true);
    try {
      const { data } = await orderAPI.create({
        shippingAddress: {
          street: form.street, city: form.city,
          state: form.state, zipCode: form.zipCode, country: form.country,
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      });
      await clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.data._id}`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="co-root">
      <style>{styles}</style>

      {/* Stepper */}
      <div className="stepper">
        <span className="step">1. My Bag</span>
        <div className="step-line" />
        <span className="step active">2. Delivery</span>
        <div className="step-line" />
        <span className="step">3. Review & Payment</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="co-body">

          {/* ── Left: form ── */}
          <div>
            {/* Shipping address */}
            <div className="co-section">
              <h2 className="co-section-title">Shipping Address</h2>
              <div className="co-field">
                <label className="co-label">Street Address</label>
                <input name="street" value={form.street} onChange={handleChange} required className="co-input" placeholder="123 Tea Garden Lane" />
              </div>
              <div className="co-grid2">
                <div className="co-field">
                  <label className="co-label">City</label>
                  <input name="city" value={form.city} onChange={handleChange} required className="co-input" placeholder="Darjeeling" />
                </div>
                <div className="co-field">
                  <label className="co-label">State</label>
                  <input name="state" value={form.state} onChange={handleChange} required className="co-input" placeholder="West Bengal" />
                </div>
              </div>
              <div className="co-grid2">
                <div className="co-field">
                  <label className="co-label">ZIP Code</label>
                  <input name="zipCode" value={form.zipCode} onChange={handleChange} required className="co-input" placeholder="734101" />
                </div>
                <div className="co-field">
                  <label className="co-label">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} required className="co-input" placeholder="India" />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="co-section">
              <h2 className="co-section-title">Payment Method</h2>
              <div className="co-payment-opts">
                {PAYMENT_METHODS.map(pm => (
                  <label key={pm.value} className={`co-payment-opt${form.paymentMethod === pm.value ? ' selected' : ''}`}>
                    <input type="radio" name="paymentMethod" value={pm.value}
                      checked={form.paymentMethod === pm.value} onChange={handleChange} />
                    <div>
                      <p className="co-payment-label">{pm.label}</p>
                      <p className="co-payment-desc">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="co-section">
              <h2 className="co-section-title">Order Notes <span style={{ fontSize: 13, fontFamily: 'Jost', fontWeight: 300, color: '#a89f95' }}>(optional)</span></h2>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
                className="co-input" style={{ resize: 'none', height: 80 }}
                placeholder="Any special instructions for your order…" />
            </div>
          </div>

          {/* ── Right: summary ── */}
          <div className="co-summary">
            <p className="co-summary-title">Order Summary</p>

            <div className="co-summary-items">
              {cart.items?.map(item => (
                <div key={`${item.product._id}-${item.variant?.variantId}`} className="co-summary-item">
                  <img className="co-summary-item-img"
                    src={item.product.thumbnail} alt={item.product.name}
                    onError={e => { e.target.style.background = '#ece9e4'; e.target.style.display = 'none'; }} />
                  <div className="co-summary-item-info">
                    <p className="co-summary-item-name">{item.product.name}</p>
                    {item.variant?.name && <p className="co-summary-item-qty">{item.variant.name}</p>}
                    <p className="co-summary-item-qty">× {item.quantity}</p>
                  </div>
                  <span className="co-summary-item-price">
                    €{((item.priceAtAdd + (item.variant?.priceModifier || 0)) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="co-divider" />
            <div className="co-summary-row"><span>Subtotal</span><span>€{cart.total.toFixed(2)}</span></div>
            <div className="co-summary-row">
              <span>Delivery</span>
              <span>{shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`}</span>
            </div>
            <div className="co-summary-row total">
              <span>Total</span>
              <span>€{grandTotal.toFixed(2)}</span>
            </div>

            <button type="submit" className="co-place-btn" disabled={placing || !cart.items?.length}>
              {placing ? 'Placing Order…' : `Place Order · €${grandTotal.toFixed(2)}`}
            </button>
            <p className="co-shipping-note">Estimated shipping time: 2 days</p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
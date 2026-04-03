import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import ReviewsSection from "../../components/products/ReviewsSection";

/* ─────────────────────────────────────────────────────────────────────────────
   Styles
───────────────────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Prosto+One&family=Jost:wght@300;400;500&family=Montserrat:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .tea-page {
    font-family: 'Jost', sans-serif;
    background: #ffffff;
    color: #1c1814;
    min-height: 100vh;
  }

  /* ── Loading / Error ── */
  .tea-state {
    min-height: 60vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    color: #a89f95; font-size: 14px;
  }
  .tea-state-icon { font-size: 48px; }
  .tea-state h2 { font-family: 'Prosto One', cursive; font-size: 24px; color: #1c1814; }
  .tea-state p { font-size: 13px; color: #a89f95; }
  .tea-state a {
    margin-top: 8px; padding: 10px 24px;
    background: #1c1814; color: #fff; border-radius: 2px;
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    text-decoration: none; font-weight: 500;
  }
  .spinner {
    width: 32px; height: 32px; border: 2px solid #ececec;
    border-top-color: #c4b49a; border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Breadcrumb ── */
  .breadcrumb {
    padding: 14px 60px; font-size: 10.5px;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #a89f95;
  }
  .breadcrumb a { color: #a89f95; text-decoration: none; transition: color 0.15s; }
  .breadcrumb a:hover { color: #1c1814; }
  .breadcrumb .sep { margin: 0 4px; }
  .breadcrumb .current { color: #1c1814; }

  /* ── Hero ── */
  .hero {
    display: grid; grid-template-columns: 44% 56%;
    padding: 0 60px 60px; gap: 52px; align-items: start;
  }
  .hero-image {
    background: #f0eeeb; border-radius: 4px; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    aspect-ratio: 1 / 1;
  }
  .hero-image img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .hero-image-placeholder {
    width: 100%; height: 100%; min-height: 360px;
    background: #f0eeeb; display: flex; align-items: center;
    justify-content: center; font-size: 64px;
  }
  .hero-info { padding-top: 8px; display: flex; flex-direction: column; }

  .product-name {
    font-family: 'Prosto One', cursive;
    font-size: 38px; font-weight: 400; line-height: 1.15;
    color: #1c1814; margin-bottom: 10px;
  }
  .product-tagline { font-size: 13px; color: #7a7268; line-height: 1.7; font-weight: 300; margin-bottom: 18px; }

  /* Attribute badges */
  .badges { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 22px; align-items: center; }
  .badge {
    font-size: 12px; font-weight: 400; color: #1c1814;
    display: flex; align-items: center; gap: 6px;
    background: transparent; border: none; padding: 0;
  }

  .price {
    font-family: 'Prosto One', cursive;
    font-size: 34px; font-weight: 400; color: #1c1814; margin-bottom: 22px;
  }

  /* Variants — icon cards */
  .variants-label { font-size: 12px; letter-spacing: 0.04em; color: #1c1814; font-weight: 400; margin-bottom: 12px; }
  .variants { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px; }
  .variant-btn {
    display: flex; flex-direction: column; align-items: center;
    padding: 10px 10px 8px; border: 1px solid #d8d4ce;
    background: transparent; cursor: pointer; border-radius: 4px;
    font-family: 'Jost', sans-serif; font-size: 11px;
    color: #7a7268; transition: all 0.18s; min-width: 72px; gap: 6px;
  }
  .variant-btn:hover { border-color: #c4a882; color: #1c1814; }
  .variant-btn.active { border-color: #c4a882; background: #fff; color: #1c1814; box-shadow: 0 0 0 1px #c4a882; }
  .variant-icon { display: flex; align-items: center; justify-content: center; }

  /* Qty + Add */
  .purchase-row {
    display: flex; gap: 16px; align-items: center; margin-bottom: 16px;
  }
  .qty-box {
    display: flex; align-items: center;
    border: 1px solid #d8d4ce; border-radius: 3px; overflow: hidden;
  }
  .qty-btn { width: 44px; height: 50px; background: transparent; border: none; cursor: pointer; font-size: 22px; color: #1c1814; font-weight: 300; transition: background 0.12s; }
  .qty-btn:hover { background: #f7f7f7; }
  .qty-value { width: 44px; text-align: center; font-size: 14px; color: #1c1814; border: none; border-left: 1px solid #d8d4ce; border-right: 1px solid #d8d4ce; background: transparent; pointer-events: none; height: 50px; line-height: 50px; }
  .add-btn {
    height: 50px; padding: 0 32px; background: #1c1814; color: #fff;
    border: none; cursor: pointer; border-radius: 3px;
    font-family: 'Jost', sans-serif; font-size: 11px;
    letter-spacing: 0.16em; font-weight: 500; text-transform: uppercase; transition: background 0.2s;
    display: flex; align-items: center; gap: 8px;
  }
  .add-btn:hover { background: #332e28; }
  .add-btn.added { background: #4a7c59; }
  .add-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .shipping-note { font-size: 11.5px; color: #a89f95; display: flex; align-items: center; gap: 8px; margin-top: 4px; }

  /* ── Details Section ── */
  .details-section {
    display: grid; grid-template-columns: 1fr 1fr;
    border-top: 1px solid #ececec; background: #f4f2ee;
    font-family: 'Montserrat', sans-serif;
  }
  .steeping-col { padding: 48px 60px; }
  .about-col { padding: 48px 60px; }
  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 26px; font-weight: 300; color: #1c1814;
    margin-bottom: 28px; letter-spacing: 0;
  }
  .steeping-item { display: flex; align-items: center; gap: 12px; padding: 13px 0; border-bottom: 1px solid #dedad5; }
  .steeping-item:last-child { border-bottom: none; }
  .steeping-icon { flex-shrink: 0; }
  .steeping-label {
    font-size: 12px; letter-spacing: 0.1em; color: #1c1814;
    font-weight: 700; text-transform: uppercase;
    display: inline; margin-right: 4px; font-family: 'Montserrat', sans-serif;
  }
  .steeping-value { font-size: 14px; color: #3a3530; display: inline; font-family: 'Montserrat', sans-serif; font-weight: 400; }
  .color-dot { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; }
  .about-grid { display: flex; flex-wrap: nowrap; gap: 0; margin-bottom: 32px; align-items: flex-start; }
  .about-item { padding-right: 24px; margin-right: 24px; border-right: 1px solid #ccc9c4; }
  .about-item:last-child { border-right: none; margin-right: 0; padding-right: 0; }
  .about-label {
    font-size: 12px; letter-spacing: 0.1em; color: #1c1814;
    font-weight: 700; text-transform: uppercase; margin-bottom: 6px;
    font-family: 'Montserrat', sans-serif;
  }
  .about-value { font-size: 15px; color: #3a3530; font-family: 'Montserrat', sans-serif; font-weight: 400; }
  .ingredients-block { margin-top: 8px; }
  .ingredients-block .section-title {
    font-size: 26px; font-weight: 300; margin-bottom: 10px;
    font-family: 'Montserrat', sans-serif; color: #1c1814;
  }
  .ingredients-text { font-size: 15px; color: #3a3530; line-height: 1.8; font-weight: 400; font-family: 'Montserrat', sans-serif; }

  /* ── Related ── */
  .related-section { padding: 68px 60px; border-top: 1px solid #ececec; }
  .related-title { font-family: 'Prosto One', cursive; font-size: 30px; font-weight: 400; text-align: center; margin-bottom: 48px; color: #1c1814; }
  .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .related-card { cursor: pointer; text-align: center; }
  .related-card:hover .related-img { transform: scale(1.06); }
  .related-img-wrap { background: #f4f3f0; margin-bottom: 16px; overflow: hidden; display: flex; align-items: center; justify-content: center; aspect-ratio: 1 / 1; }
  .related-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease; display: block; }
  .related-name { font-size: 13px; color: #1c1814; margin-bottom: 6px; line-height: 1.5; }
  .related-price { font-size: 12.5px; color: #a89f95; }
  .related-loading { text-align: center; color: #c4b49a; font-size: 13px; padding: 40px 0; }
`;

/* ── Variant SVG Icons ── */
function BagIcon({ weight }) {
  return (
    <svg width="46" height="54" viewBox="0 0 46 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* top seal */}
      <rect x="10" y="2" width="26" height="4" rx="1" stroke="currentColor" strokeWidth="1.3" />
      {/* gusset wings */}
      <path d="M10 6 C4 10 2 18 2 27 C2 36 4 44 6 49" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <path d="M36 6 C42 10 44 18 44 27 C44 36 42 44 40 49" stroke="currentColor" strokeWidth="1.3" fill="none" />
      {/* main body */}
      <path d="M10 6 L10 6 Q10 6 10 6 L36 6 L40 49 L6 49 Z" stroke="currentColor" strokeWidth="1.3" fill="none" />
      {/* bottom seal */}
      <line x1="6" y1="49" x2="40" y2="49" stroke="currentColor" strokeWidth="1.3" />
      {weight && (
        <text x="23" y="32" textAnchor="middle" fontSize="10" fontWeight="500" fill="currentColor" fontFamily="Jost, sans-serif">
          {weight}
        </text>
      )}
    </svg>
  );
}

function TinIcon({ weight }) {
  return (
    <svg width="46" height="54" viewBox="0 0 46 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="23" cy="8" rx="16" ry="4" stroke="currentColor" strokeWidth="1.3" />
      <rect x="7" y="8" width="32" height="36" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <ellipse cx="23" cy="44" rx="16" ry="4" stroke="currentColor" strokeWidth="1.3" />
      {weight && (
        <text x="23" y="30" textAnchor="middle" fontSize="10" fontWeight="500" fill="currentColor" fontFamily="Jost, sans-serif">
          {weight}
        </text>
      )}
    </svg>
  );
}

function SamplerIcon() {
  return (
    <svg width="46" height="54" viewBox="0 0 46 54" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* tag shape */}
      <path d="M8 4 L38 4 L38 38 L23 50 L8 38 Z" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <circle cx="23" cy="13" r="3" stroke="currentColor" strokeWidth="1.3" />
      <line x1="23" y1="16" x2="23" y2="28" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/* ── Helpers ── */
function normalise(p) {
  return {
    ...p,
    categoryLabel: (p.category || "").replace(/-/g, " ").toUpperCase(),
    basePrice:     p.basePrice ?? p.price ?? 0,
    price:         p.basePrice ?? p.price ?? 0,
    tagline:       p.shortDescription || p.tagline || "",
    badges:        Array.isArray(p.badges) ? p.badges : [],
    origin:        p.origin || "",
    variants:      Array.isArray(p.variants)
                     ? p.variants.map(v =>
                         typeof v === "string"
                           ? { label: v, priceModifier: 0 }
                           : { ...v, label: v.label || v.name || "" }
                       )
                     : [],
    image:         p.thumbnail || p.image || "",
    steeping: {
      servingSize:  p.servingSize  || "",
      waterTemp:    p.temperature  || "",
      steepingTime: p.brewingTime  || "",
      coolAfter:    p.coolAfter    || "",
    },
    about: {
      flavor:      Array.isArray(p.flavor) ? p.flavor.join(", ") : p.flavor || "",
      quality:     p.quality      || "",
      caffeine:    p.caffeineLevel
                     ? p.caffeineLevel.charAt(0).toUpperCase() + p.caffeineLevel.slice(1)
                     : "",
      allergens:   p.allergens    || "",
      description: p.description  || "",
      ingredients: p.ingredients  || "",
    },
  };
}

function getVariantIcon(label) {
  const lower = label.toLowerCase();
  const weightMatch = label.match(/(\d+\s*(?:kg|g))/i);
  const weight = weightMatch ? weightMatch[1].replace(/\s+/g, "") : "";
  if (lower.includes("sampler")) return <SamplerIcon />;
  if (lower.includes("tin"))     return <TinIcon weight={weight} />;
  return <BagIcon weight={weight} />;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────────────── */
export default function TeaProductPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user }      = useAuth();

  const [product, setProduct]               = useState(null);
  const [related, setRelated]               = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

  const [qty, setQty]                         = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [adding, setAdding]                   = useState(false);
  const [added, setAdded]                     = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setRelated([]);
      setRelatedLoading(true);
      setSelectedVariant(0);

      try {
        const { data } = await productAPI.getById(id);
        const raw = data?.data ?? data;
        if (cancelled) return;

        setProduct(normalise(raw));
        setLoading(false);

        try {
          const rel = await productAPI.getByCategory(raw.category, { limit: 4 });
          const relData = rel.data?.data ?? rel.data ?? [];
          const filtered = relData.filter(p => p._id !== raw._id).slice(0, 3);
          if (!cancelled) {
            if (filtered.length > 0) {
              setRelated(filtered);
            } else {
              const fallback = await productAPI.getAll({ category: raw.category, limit: 4 });
              const fbData = fallback.data?.data ?? fallback.data ?? [];
              setRelated(fbData.filter(p => p._id !== raw._id).slice(0, 3));
            }
          }
        } catch {
          try {
            const fallback = await productAPI.getAll({ limit: 4 });
            const fbData = fallback.data?.data ?? fallback.data ?? [];
            if (!cancelled) setRelated(fbData.filter(p => p._id !== raw._id).slice(0, 3));
          } catch { /* give up */ }
        } finally {
          if (!cancelled) setRelatedLoading(false);
        }

      } catch (err) {
        if (!cancelled) {
          setError(err.response?.status === 404 ? "notfound" : "error");
          setLoading(false);
          setRelatedLoading(false);
        }
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    const variant   = product.variants.length > 0 ? product.variants[selectedVariant] : null;
    const variantId = variant?._id?.toString() ?? undefined;

    setAdding(true);
    try {
      await addToCart(product._id, variantId, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      // toast already shown by CartContext
    } finally {
      setAdding(false);
    }
  };

  if (loading) return (
    <div className="tea-page">
      <style>{styles}</style>
      <div className="tea-state"><div className="spinner" /><p>Loading product…</p></div>
    </div>
  );

  if (error) return (
    <div className="tea-page">
      <style>{styles}</style>
      <div className="tea-state">
        <span className="tea-state-icon">🍵</span>
        <h2>{error === "notfound" ? "Product Not Found" : "Something went wrong"}</h2>
        <p>{error === "notfound" ? "This tea has steeped away." : "We couldn't load this product. Please try again."}</p>
        <a href="/shop">Back to Shop</a>
      </div>
    </div>
  );

  const steepingItems = [
    { label: "SERVING SIZE",          value: product.steeping.servingSize,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="1.5"><path d="M6 2v6c0 3.314 2.686 6 6 6s6-2.686 6-6V2"/><line x1="6" y1="5" x2="18" y2="5"/><path d="M6 22h12M12 14v8"/></svg> },
    { label: "WATER TEMPERATURE",     value: product.steeping.waterTemp,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.4 1.08 4.55 2.79 5.99L7 22h10l-.79-7.01C17.92 13.55 19 11.4 19 9c0-3.87-3.13-7-7-7z"/></svg> },
    { label: "STEEPING TIME",         value: product.steeping.steepingTime,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "COLOR AFTER 3 MINUTES", value: product.steeping.coolAfter, isColor: true,
      icon: null },
  ].filter(i => i.value);

  const hasDetails = steepingItems.length > 0 ||
    product.about.flavor || product.about.quality ||
    product.about.caffeine || product.about.allergens ||
    product.about.description;

  const variant = product.variants.length > 0 ? product.variants[selectedVariant] : null;
  const displayPrice = product.basePrice + (variant?.priceModifier ?? 0);
  const variantImage = variant?.image || product.image;

  const btnLabel = adding ? "Adding…" : added ? "✓ Added" : "Add to bag";

  return (
    <div className="tea-page">
      <style>{styles}</style>

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Home</a><span className="sep">/</span>
        <a href="/shop">Collections</a><span className="sep">/</span>
        <a href={`/shop?category=${product.category}`}>{product.categoryLabel}</a>
        <span className="sep">/</span>
        <span className="current">{product.name}</span>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-image">
          {variantImage
            ? <img src={variantImage} alt={product.name} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
            : null}
          <div className="hero-image-placeholder" style={{ display: variantImage ? "none" : "flex" }}>🍵</div>
        </div>

        <div className="hero-info">
          <h1 className="product-name">{product.name}</h1>
          {product.tagline && <p className="product-tagline">{product.tagline}</p>}

          {(product.origin || product.badges.length > 0) && (
            <div className="badges">
              {product.origin && (
                <span className="badge">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                  Origin: {product.origin}
                </span>
              )}
              {product.badges.map(b => {
                const lower = b.toLowerCase();
                let icon = (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                );
                if (lower.includes("organic")) icon = (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3s4 0 7 3c2 2 3 5 3 5s-1-3-3-5c3 1 6 4 7 8-1 4-5 7-9 7-5 0-8-4-8-9 0-4 1-7 3-9z"/>
                  </svg>
                );
                if (lower.includes("vegan")) icon = (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 8C8 10 5.9 16.17 3.82 19.34A1 1 0 004.69 21 16.31 16.31 0 008 20c4-1 7-4 9-8 1 2 1 4 0 6a1 1 0 001.73.73C21 16 21 10 17 8z"/>
                  </svg>
                );
                return <span key={b} className="badge">{icon}{b}</span>;
              })}
            </div>
          )}

          <p className="price">€{Number(displayPrice).toFixed(2)}</p>

          {product.variants.length > 0 && (
            <>
              <p className="variants-label">Variants</p>
              <div className="variants">
                {product.variants.map((v, idx) => {
                  const label = v.label || v;
                  return (
                    <button
                      key={idx}
                      className={`variant-btn${selectedVariant === idx ? " active" : ""}`}
                      onClick={() => setSelectedVariant(idx)}
                    >
                      <span className="variant-icon">{getVariantIcon(label)}</span>
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <div className="purchase-row">
            <div className="qty-box">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button
              className={`add-btn${added ? " added" : ""}`}
              onClick={handleAddToCart}
              disabled={adding}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {btnLabel}
            </button>
          </div>

          <p className="shipping-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a89f95" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" rx="1" />
              <path d="M16 8h4l3 4v5h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Free shipping on orders over $50
          </p>
        </div>
      </section>

      {/* Steeping + About */}
      {hasDetails && (
        <section className="details-section">
          <div className="steeping-col">
            <h2 className="section-title">Steeping instructions</h2>
            {steepingItems.map(item => (
              <div className="steeping-item" key={item.label}>
                {item.isColor
                  ? <span className="color-dot" style={{ background: item.value }} />
                  : <span className="steeping-icon">{item.icon}</span>
                }
                <p>
                  <span className="steeping-label">{item.label}: </span>
                  {!item.isColor && <span className="steeping-value">{item.value}</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="about-col">
            <h2 className="section-title">About this tea</h2>
            <div className="about-grid">
              {product.about.flavor    && <div className="about-item"><p className="about-label">Flavor</p><p className="about-value">{product.about.flavor}</p></div>}
              {product.about.quality   && <div className="about-item"><p className="about-label">Qualities</p><p className="about-value">{product.about.quality}</p></div>}
              {product.about.caffeine  && <div className="about-item"><p className="about-label">Caffeine</p><p className="about-value">{product.about.caffeine}</p></div>}
              {product.about.allergens && <div className="about-item"><p className="about-label">Allergens</p><p className="about-value">{product.about.allergens}</p></div>}
            </div>
            {product.about.ingredients && (
              <div className="ingredients-block">
                <h3 className="section-title">Ingredient</h3>
                <p className="ingredients-text">{product.about.ingredients}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reviews + Related */}
      <section className="related-section">
        <div style={{ padding: "0 0 48px" }}>
          <ReviewsSection productId={id} />
        </div>

        <h2 className="related-title">You may also like</h2>
        {relatedLoading ? (
          <p className="related-loading">Finding similar teas…</p>
        ) : related.length === 0 ? (
          <p className="related-loading">No related products found.</p>
        ) : (
          <div className="related-grid">
            {related.map(p => {
              const firstVariant = Array.isArray(p.variants) && p.variants[0];
              const variantLabel = firstVariant
                ? (firstVariant.label || firstVariant.name || "").replace(/bag|tin|sampler/gi, "").trim()
                : null;
              return (
                <div className="related-card" key={p._id} onClick={() => navigate(`/products/${p._id}`)}>
                  <div className="related-img-wrap">
                    <img className="related-img" src={p.thumbnail || p.image} alt={p.name}
                      onError={e => { e.target.style.opacity = "0"; }} />
                  </div>
                  <p className="related-name">{p.name}</p>
                  <p className="related-price">
                    €{Number(p.basePrice ?? p.price ?? 0).toFixed(2)}
                    {variantLabel && <span style={{ color: "#c4b49a" }}> / {variantLabel}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

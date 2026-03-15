import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

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
    padding: 16px 60px; font-size: 11px;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: #a89f95; border-bottom: 1px solid #ececec;
  }
  .breadcrumb a { color: #a89f95; text-decoration: none; transition: color 0.15s; }
  .breadcrumb a:hover { color: #1c1814; }
  .breadcrumb .sep { margin: 0 8px; }
  .breadcrumb .current { color: #1c1814; }

  /* ── Hero ── */
  .hero { display: grid; grid-template-columns: 55% 45%; min-height: 560px; }
  .hero-image { overflow: hidden; }
  .hero-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .hero-image-placeholder {
    width: 100%; height: 100%; min-height: 400px;
    background: #f7f5f2; display: flex; align-items: center;
    justify-content: center; font-size: 64px;
  }
  .hero-info {
    padding: 52px 60px 52px 52px;
    display: flex; flex-direction: column;
    border-left: 1px solid #ececec;
  }
  .category-label {
    font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase;
    color: #c4b49a; font-weight: 500; margin-bottom: 14px;
  }
  .product-name {
    font-family: 'Prosto One', cursive;
    font-size: 48px; font-weight: 400; line-height: 1.1;
    color: #1c1814; margin-bottom: 14px;
  }
  .product-tagline { font-size: 13px; color: #7a7268; line-height: 1.7; font-weight: 300; margin-bottom: 22px; }
  .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 28px; }
  .badge {
    font-size: 10.5px; letter-spacing: 0.07em; font-weight: 500;
    padding: 5px 13px; border-radius: 20px;
    border: 1px solid #e0e0e0; color: #7a7268; background: transparent;
  }
  .divider { height: 1px; background: #ececec; margin: 0 0 26px; }
  .price {
    font-family: 'Prosto One', cursive;
    font-size: 36px; font-weight: 400; color: #1c1814; margin-bottom: 26px;
  }

  /* Variants */
  .variants-label { font-size: 10px; letter-spacing: 0.14em; color: #c4b49a; font-weight: 500; text-transform: uppercase; margin-bottom: 10px; }
  .variants { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 28px; }
  .variant-btn {
    padding: 7px 14px; border: 1px solid #e0e0e0;
    background: transparent; cursor: pointer; border-radius: 2px;
    font-family: 'Jost', sans-serif; font-size: 11.5px;
    color: #7a7268; transition: all 0.18s;
  }
  .variant-btn:hover { border-color: #c4a882; color: #1c1814; }
  .variant-btn.active { border-color: #1c1814; background: #1c1814; color: #fff; }

  /* Qty + Add */
  .purchase-row { display: flex; gap: 10px; align-items: center; margin-bottom: 20px; }
  .qty-box { display: flex; align-items: center; border: 1px solid #e0e0e0; border-radius: 2px; overflow: hidden; }
  .qty-btn { width: 40px; height: 46px; background: transparent; border: none; cursor: pointer; font-size: 20px; color: #7a7268; font-weight: 300; transition: background 0.12s; }
  .qty-btn:hover { background: #f7f7f7; }
  .qty-value { width: 48px; text-align: center; font-size: 14px; color: #1c1814; border: none; background: transparent; pointer-events: none; }
  .add-btn {
    flex: 1; height: 46px; background: #1c1814; color: #fff;
    border: none; cursor: pointer; border-radius: 2px;
    font-family: 'Jost', sans-serif; font-size: 11px;
    letter-spacing: 0.16em; font-weight: 500; text-transform: uppercase; transition: background 0.2s;
  }
  .add-btn:hover { background: #332e28; }
  .add-btn.added { background: #4a7c59; }
  .add-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .shipping-note { font-size: 11.5px; color: #a89f95; display: flex; align-items: center; gap: 8px; }

  /* ── Details Section ── */
  .details-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    border-top: 1px solid #ececec;
    background: #f4f2ee;
    font-family: 'Montserrat', sans-serif;
  }
  .steeping-col { padding: 48px 60px; }
  .about-col { padding: 48px 60px; }

  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 28px; font-weight: 600; color: #1c1814; margin-bottom: 28px;
  }

  /* Steeping items — inline label: value */
  .steeping-item { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
  .steeping-icon { flex-shrink: 0; }
  .steeping-label {
    font-size: 9.5px; letter-spacing: 0.14em; color: #1c1814;
    font-weight: 700; text-transform: uppercase;
    display: inline; margin-right: 5px;
    font-family: 'Montserrat', sans-serif;
  }
  .steeping-value {
    font-size: 11.5px; color: #1c1814;
    display: inline;
    font-family: 'Montserrat', sans-serif;
  }

  /* About grid — single row with pipe separators */
  .about-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0;
    margin-bottom: 28px;
    align-items: flex-start;
  }
  .about-item {
    padding-right: 20px;
    margin-right: 20px;
    border-right: 1px solid #ccc9c4;
  }
  .about-item:last-child { border-right: none; margin-right: 0; padding-right: 0; }
  .about-label {
    font-size: 9px; letter-spacing: 0.14em; color: #7a7268;
    font-weight: 600; text-transform: uppercase; margin-bottom: 5px;
    font-family: 'Montserrat', sans-serif;
  }
  .about-value {
    font-size: 12px; color: #1c1814;
    font-family: 'Montserrat', sans-serif;
    font-weight: 400;
  }
  .about-desc-label {
    font-size: 9px; letter-spacing: 0.14em; color: #7a7268;
    font-weight: 600; text-transform: uppercase; margin-bottom: 6px;
    font-family: 'Montserrat', sans-serif;
  }
  .about-desc-value {
    font-size: 12.5px; color: #7a7268; line-height: 1.75; font-weight: 300;
    font-family: 'Montserrat', sans-serif;
  }

  /* ── Ingredients ── */
  .ingredients-strip {
    padding: 0 60px 52px;
    background: #f4f2ee;
    font-family: 'Montserrat', sans-serif;
  }
  .ingredients-strip .section-title {
    font-size: 18px; margin-bottom: 10px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
  }
  .ingredients-text {
    font-size: 12.5px; color: #7a7268; line-height: 1.85; font-weight: 300;
    font-family: 'Montserrat', sans-serif;
  }

  /* ── Related ── */
  .related-section { padding: 68px 60px; border-top: 1px solid #ececec; }
  .related-title {
    font-family: 'Prosto One', cursive; font-size: 30px; font-weight: 400;
    text-align: center; margin-bottom: 48px; color: #1c1814;
  }
  .related-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
  .related-card { cursor: pointer; text-align: center; }
  .related-card:hover .related-img { transform: scale(1.06); }
  .related-img-wrap {
    background: #f4f3f0; margin-bottom: 16px;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    aspect-ratio: 1 / 1;
  }
  .related-img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease; display: block; }
  .related-name { font-size: 13px; color: #1c1814; margin-bottom: 6px; line-height: 1.5; }
  .related-price { font-size: 12.5px; color: #a89f95; }
  .related-loading { text-align: center; color: #c4b49a; font-size: 13px; padding: 40px 0; }
`;

/* ── Helpers ── */
function normalise(p) {
  return {
    ...p,
    categoryLabel: (p.category || "").replace(/-/g, " ").toUpperCase(),
    price:         p.basePrice ?? p.price ?? 0,
    tagline:       p.shortDescription || p.tagline || "",
    badges:        Array.isArray(p.badges) ? p.badges : [],
    variants:      Array.isArray(p.variants)
                     ? p.variants.map(v => (typeof v === "string" ? { label: v } : v))
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

  /* ── Fetch product ── */
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

  /* ── Add to Cart ── */
  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please sign in to add items to your bag");
      navigate("/login");
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

  /* ── Loading ── */
  if (loading) return (
    <div className="tea-page">
      <style>{styles}</style>
      <div className="tea-state">
        <div className="spinner" />
        <p>Loading product…</p>
      </div>
    </div>
  );

  /* ── Error / Not Found ── */
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
    { label: "SERVING SIZE",      value: product.steeping.servingSize,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="1.5"><path d="M6 2v6c0 3.314 2.686 6 6 6s6-2.686 6-6V2"/><line x1="6" y1="5" x2="18" y2="5"/><path d="M6 22h12M12 14v8"/></svg> },
    { label: "WATER TEMPERATURE", value: product.steeping.waterTemp,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 2.4 1.08 4.55 2.79 5.99L7 22h10l-.79-7.01C17.92 13.55 19 11.4 19 9c0-3.87-3.13-7-7-7z"/></svg> },
    { label: "STEEPING TIME",     value: product.steeping.steepingTime,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c4b49a" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
    { label: "COLOR AFTER 3 MINUTES", value: product.steeping.coolAfter,
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d45c5c" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
  ].filter(i => i.value);

  const hasDetails = steepingItems.length > 0 ||
    product.about.flavor || product.about.quality ||
    product.about.caffeine || product.about.allergens ||
    product.about.description;

  const btnLabel = adding ? "Adding…" : added ? "✓ Added" : "Add to bag";

  return (
    <div className="tea-page">
      <style>{styles}</style>

      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <a href="/">Home</a><span className="sep">/</span>
        <a href="/shop">Tea Collections</a><span className="sep">/</span>
        <a href={`/shop?category=${product.category}`}>{product.categoryLabel}</a>
        <span className="sep">/</span>
        <span className="current">{product.name}</span>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-image">
          {product.image
            ? <img src={product.image} alt={product.name} onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }} />
            : null}
          <div className="hero-image-placeholder" style={{ display: product.image ? "none" : "flex" }}>🍵</div>
        </div>

        <div className="hero-info">
          <p className="category-label">{product.categoryLabel}</p>
          <h1 className="product-name">{product.name}</h1>
          {product.tagline && <p className="product-tagline">{product.tagline}</p>}

          {product.badges.length > 0 && (
            <div className="badges">
              {product.badges.map(b => <span key={b} className="badge">{b}</span>)}
            </div>
          )}

          <div className="divider" />
          <p className="price">€{Number(product.price).toFixed(2)}</p>

          {product.variants.length > 0 && (
            <>
              <p className="variants-label">Variants</p>
              <div className="variants">
                {product.variants.map((v, i) => (
                  <button key={i}
                    className={`variant-btn${selectedVariant === i ? " active" : ""}`}
                    onClick={() => setSelectedVariant(i)}>
                    {v.label}
                  </button>
                ))}
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
              {btnLabel}
            </button>
          </div>

          <p className="shipping-note">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a89f95" strokeWidth="1.5">
              <rect x="1" y="3" width="15" height="13" rx="1"/>
              <path d="M16 8h4l3 4v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            Free shipping on orders over $50
          </p>
        </div>
      </section>

      {/* Steeping + About */}
      {hasDetails && (
        <section className="details-section">
          {/* Steeping */}
          <div className="steeping-col">
            <h2 className="section-title">Steeping instructions</h2>
            {steepingItems.map(item => (
              <div className="steeping-item" key={item.label}>
                <span className="steeping-icon">{item.icon}</span>
                <p>
                  <span className="steeping-label">{item.label}: </span>
                  <span className="steeping-value">{item.value}</span>
                </p>
              </div>
            ))}
          </div>

          {/* About */}
          <div className="about-col">
            <h2 className="section-title">About this tea</h2>

            {/* Pipe-separated row */}
            <div className="about-grid">
              {product.about.flavor    && (
                <div className="about-item">
                  <p className="about-label">Flavor</p>
                  <p className="about-value">{product.about.flavor}</p>
                </div>
              )}
              {product.about.quality   && (
                <div className="about-item">
                  <p className="about-label">Qualities</p>
                  <p className="about-value">{product.about.quality}</p>
                </div>
              )}
              {product.about.caffeine  && (
                <div className="about-item">
                  <p className="about-label">Caffeine</p>
                  <p className="about-value">{product.about.caffeine}</p>
                </div>
              )}
              {product.about.allergens && (
                <div className="about-item">
                  <p className="about-label">Allergens</p>
                  <p className="about-value">{product.about.allergens}</p>
                </div>
              )}
            </div>

            {/* Description below */}
            {product.about.description && (
              <div>
                <p className="about-desc-label">Description</p>
                <p className="about-desc-value">{product.about.description}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ingredients */}
      {product.about.ingredients && (
        <div className="ingredients-strip">
          <h3 className="section-title">Ingredient</h3>
          <p className="ingredients-text">{product.about.ingredients}</p>
        </div>
      )}

      {/* You May Also Like */}
      <section className="related-section">
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
                ? (firstVariant.label || firstVariant).replace(/bag|tin|sampler/gi, "").trim()
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
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import NatureIcon from '@mui/icons-material/Nature';
import StarIcon from '@mui/icons-material/Star';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import heroImg from '../assets/Landing Main Image.png';
import icon1 from '../assets/local_cafe.png'; 
import icon2 from '../assets/redeem.png';
import icon3 from '../assets/local_shipping.png';
import icon4 from '../assets/sell.png';

const trustItems = [
   { icon: icon1, label: '450+ Kind of Loose Tea' },
   { icon: icon2, label: 'Certificated Organic Teas' },
   { icon: icon3, label: 'Free Delivery' },
   { icon: icon4, label: 'Sample for All Teas' },
];

/* Category tiles shown when there are no products yet */
const FALLBACK_CATEGORIES = [
  { label: 'Black Tea',   value: 'black-tea'  },
  { label: 'Green Tea',   value: 'green-tea'  },
  { label: 'White Tea',   value: 'white-tea'  },
  { label: 'Matcha',      value: 'matcha'     },
  { label: 'Herbal Tea',  value: 'herbal-tea' },
  { label: 'Chai',        value: 'chai'       },
  { label: 'Oolong',      value: 'oolong-tea' },
  { label: 'Rooibos',     value: 'rooibos'    },
  { label: 'Teaware',     value: 'teaware'    },
];

const mono = { fontFamily: '"Montserrat", sans-serif' };

/* ─── Product tile (real product from backend) ───────────────────────────── */
const ProductTile = ({ product }) => (
  <Link to={`/products/${product._id}`} className="group flex flex-col items-center gap-2">
    <div className="w-full aspect-square bg-stone-100 overflow-hidden relative">
      {product.thumbnail ? (
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      {/* Fallback placeholder shown when image fails or is missing */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-stone-200 to-stone-100 flex items-center justify-center"
        style={{ display: product.thumbnail ? 'none' : 'flex' }}
      >
        <span className="text-stone-300 text-[10px] tracking-widest uppercase" style={mono}>
          No Image
        </span>
      </div>
    </div>
    <div className="text-center">
      <p
        className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600 group-hover:text-gray-900 transition-colors duration-200"
        style={mono}
      >
        {product.name}
      </p>
    </div>
  </Link>
);

/* ─── Category tile (fallback when no products) ─────────────────────────── */
const CategoryTile = ({ cat }) => (
  <Link to={`/shop?category=${cat.value}`} className="group flex flex-col items-center gap-2">
    <div className="w-full aspect-square bg-stone-100 overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-100 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
        <span className="text-stone-300 text-[10px] tracking-widest uppercase" style={mono}>Image</span>
      </div>
    </div>
    <p
      className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600 group-hover:text-gray-900 transition-colors duration-200 text-center"
      style={mono}
    >
      {cat.label}
    </p>
  </Link>
);

/* ─── Skeleton tile ─────────────────────────────────────────────────────── */
const SkeletonTile = () => (
  <div className="flex flex-col items-center gap-2 animate-pulse">
    <div className="w-full aspect-square bg-stone-200 rounded" />
    <div className="h-2 w-2/3 bg-stone-200 rounded" />
    <div className="h-2 w-1/3 bg-stone-100 rounded" />
  </div>
);

/* ─── HomePage ──────────────────────────────────────────────────────────── */
const HomePage = () => {
  const [products, setProducts]     = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  /* Fetch featured products only for the home collections grid */
  useEffect(() => {
    const fetchCollectionProducts = async () => {
      setLoadingProducts(true);
      try {
        const { data } = await productAPI.getAll({ limit: 9, isFeatured: true, sort: 'newest' });
        setProducts(data.data || []);
      } catch (err) {
        console.error('Failed to fetch featured products:', err);
        setProducts([]); // falls back to category tiles
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCollectionProducts();
  }, []);

  /* Decide what to render in the 3×3 grid */
  const renderGrid = () => {
    if (loadingProducts) {
      return [...Array(9)].map((_, i) => <SkeletonTile key={i} />);
    }

    if (products.length > 0) {
      /* Fill up to 9 slots: real products first, then category fallback tiles */
      const tiles = [...products.slice(0, 9)];
      const remaining = 9 - tiles.length;
      return (
        <>
          {tiles.map((p) => <ProductTile key={p._id} product={p} />)}
          {remaining > 0 && FALLBACK_CATEGORIES.slice(0, remaining).map((cat) => (
            <CategoryTile key={cat.value} cat={cat} />
          ))}
        </>
      );
    }

    /* No products at all — show pure category grid */
    return FALLBACK_CATEGORIES.map((cat) => <CategoryTile key={cat.value} cat={cat} />);
  };

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
          {/* Left — full-bleed image placeholder */}
          <div className="relative self-stretch flex pt-0 pl-0 pr-6 pb-6 lg:pr-10 lg:pb-10">  {/* 👈 no top/left padding */}
            <img
            src={heroImg}
            alt="Hero"
            className="w-full h-full object-cover rounded-sm"
            style={{ objectPosition: 'top center' }}
            />
</div>

          {/* Right — copy */}
         <div className="flex items-center px-10 sm:px-16 lg:px-20 py-20 pt-10 bg-white">
          <div className="max-w-sm">
            <h1
            className="text-gray-900 leading-snug mb-7"
            style={{
              fontFamily: '"Prosto One", sans-serif',
              fontSize: 'clamp(1.4rem, 2.2vw, 2rem)',
              fontWeight: 400,
              letterSpacing: '0em',
            }}
            >
              Every day is unique,<br />  
              just like our tea
              </h1>
              <p className="text-gray-500 text-[14px] leading-relaxed mb-3 font-montserrat text-justify"> {/* 👈 text-justify added */}
                Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
                </p>
                <p className="text-gray-500 text-[14px] leading-relaxed mb-10 font-montserrat text-justify"> {/* 👈 text-justify added */}
                Lorem ipsum dolor sit amet consectetur. Orci nibh nullam risus adipiscing odio. Neque lacus nibh eros in.
                  </p>
                  <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-9 py-3.5 bg-gray-900 text-white text-[11px] font-bold tracking-[0.18em] uppercase hover:bg-gray-700 transition-all duration-200 font-montserrat">
                    Browse Teas
                    </Link>
                    </div>
                    </div>
                    </div>
                    </section>

                    {/* ── TRUST BAR ── */}
                    <section className="border-y border-gray-200 bg-[#F4F4F4]">
                      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center gap-8">
                        <div className="flex flex-wrap items-center justify-center gap-12">
                          {trustItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                              <img src={item.icon} alt={item.label} className="w-5 h-5 object-contain opacity-70" />
                              <span className="text-[10px] font-semibold tracking-[0.18em] uppercase font-montserrat text-gray-600">
                                {item.label}
                              </span>
                            </div>
                              ))}
                        </div>
                              <Link
                              to="/shop"
                              className="inline-flex items-center justify-center px-12 py-2.5 border border-gray-300 text-gray-600 text-[10px] font-semibold tracking-[0.18em] uppercase hover:border-gray-900 hover:text-gray-900 transition-all duration-200 font-montserrat">
                                Learn More
                                </Link>
                      </div>
                    </section>

      {/* ── OUR COLLECTIONS ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <h2
            style={{
              fontFamily: '"Prosto One", sans-serif',
              fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)',
              fontWeight: 400,
            }}
            className="text-gray-900"
          >
            Our Collections
          </h2>

        </div>

        {/* 3×3 Grid */}
        <div className="grid grid-cols-3 gap-6">
          {renderGrid()}
        </div>

        {/* View all CTA */}
        {!loadingProducts && (
          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-10 py-3 border border-gray-300 text-gray-700 text-[10px] font-semibold tracking-[0.18em] uppercase hover:border-gray-900 hover:text-gray-900 transition-all duration-200"
              style={mono}
            >
              View All Teas
            </Link>
          </div>
        )}
      </section>

    </div>
  );
};

export default HomePage;
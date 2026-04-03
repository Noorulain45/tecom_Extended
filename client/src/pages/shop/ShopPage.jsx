import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI } from '@/services/api';
import Pagination from '@/components/ui/Pagination';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import shopBanner from '../../assets/Rectangle 2.png';

const SORT_OPTIONS = [
  { value: 'newest',      label: 'Newest First' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc',label: 'Top Rated' },
  { value: 'popular',    label: 'Most Popular' },
];

const FILTER_GROUPS = [
  {
    key: 'category',
    label: 'Collections',
    options: ['Black Tea','Green Tea','White Tea','Oolong','Matcha','Herbal Tea','Chai','Rooibos'],
  },
  {
    key: 'origin',
    label: 'Origin',
    options: ['India','Japan','China','Sri Lanka','South Africa'],
  },
  {
    key: 'flavor',
    label: 'Flavour',
    options: ['Earthy','Sweet','Smooth','Floral','Citrus','Minty','Grassy'],
  },
  {
    key: 'quality',
    label: 'Qualities',
    options: ['Fruity','Energy','Calming','Digestive'],
  },
  {
    key: 'caffeineLevel',
    label: 'Caffeine',
    options: ['No Caffeine','Low Caffeine','Medium Caffeine','High Caffeine'],
  },
  {
    key: 'allergens',
    label: 'Allergens',
    options: ['Gluten Free','Lactose Free','Soy Free'],
  },
];

const mono = { fontFamily: '"Montserrat", sans-serif' };

const FilterGroup = ({ group, activeValue, onChange }) => {
  const [open, setOpen] = useState(false);
  const activeCount = activeValue ? 1 : 0;

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-800" style={mono}>
            {group.label}
          </span>
          {activeCount > 0 && (
            <span className="text-[9px] font-bold text-gray-400" style={mono}>({activeCount})</span>
          )}
        </span>
        {open
          ? <RemoveIcon sx={{ fontSize: 13 }} className="text-gray-400 flex-shrink-0" />
          : <AddIcon    sx={{ fontSize: 13 }} className="text-gray-400 flex-shrink-0" />
        }
      </button>

      {open && (
        <div className="pb-4 space-y-2.5">
          {group.options.map((opt) => {
            const val    = opt.toLowerCase().replace(/\s+/g, '-');
            const active = activeValue === val;
            return (
              <div
                key={opt}
                className="flex items-center gap-2.5 cursor-pointer group"
                onClick={() => onChange(group.key, active ? '' : val)}
              >
                <span className={`w-3.5 h-3.5 border flex-shrink-0 flex items-center justify-center transition-colors ${
                  active ? 'border-gray-800 bg-gray-800' : 'border-gray-300 bg-white group-hover:border-gray-500'
                }`}>
                  {active && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span
                  className={`text-[11px] leading-none transition-colors select-none ${
                    active ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800'
                  }`}
                  style={mono}
                >
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const OrganicToggle = ({ active, onChange }) => (
  <div className="flex items-center justify-between py-3.5">
    <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-gray-800" style={mono}>
      Organic
    </span>
    <button
      onClick={() => onChange('organic', active ? '' : 'true')}
      className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
        active ? 'bg-gray-800' : 'bg-gray-300'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
        active ? 'translate-x-4' : 'translate-x-0'
      }`} />
    </button>
  </div>
);

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]         = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(true);

  const filters = {
    page:          searchParams.get('page')          || 1,
    limit:         12,
    category:      searchParams.get('category')      || '',
    origin:        searchParams.get('origin')        || '',
    flavor:        searchParams.get('flavor')        || '',
    caffeineLevel: searchParams.get('caffeineLevel') || '',
    quality:       searchParams.get('quality')       || '',
    allergens:     searchParams.get('allergens')     || '',
    organic:       searchParams.get('organic')       || '',
    sort:          searchParams.get('sort')          || 'newest',
    search:        searchParams.get('search')        || '',
    // ── Only show NON-featured products here ──
    // Featured products are exclusively shown on the Home page collections grid
    isFeatured:    'false',
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    try {
      const { data } = await productAPI.getAll(params);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (newFilters) => {
    const params = {};
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v !== '' && v != null && k !== 'isFeatured') params[k] = v;
    });
    setSearchParams(params);
  };

  const handleSingleFilter = (key, value) =>
    handleFilterChange({ ...filters, [key]: value, page: 1 });

  const handleSortChange   = (e) =>
    handleFilterChange({ ...filters, sort: e.target.value, page: 1 });

  const handlePageChange   = (page) => handleFilterChange({ ...filters, page });
  const handleClearFilters = () => setSearchParams({ sort: filters.sort });

  const categoryLabel = filters.category
    ? filters.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'All Teas';

  const hasActiveFilters = Object.entries(filters).some(
    ([k, v]) => !['page', 'limit', 'sort', 'isFeatured'].includes(k) && v !== ''
  );

  return (
    <div className="bg-white min-h-screen">

      {/* ── HERO BANNER ── */}
      <div className="w-full h-56 sm:h-72 overflow-hidden">
        <img
        src={shopBanner}
        alt="Shop Banner"
        className="w-full h-full object-cover"/>
        </div>

      {/* ── BREADCRUMB + SORT BAR ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-3 flex items-center justify-between">
          <p className="text-[10px] tracking-widest uppercase text-gray-400" style={mono}>
            <Link to="/" className="hover:text-gray-700 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/shop" className="hover:text-gray-700 transition-colors">Collections</Link>
            {filters.category && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-700">{categoryLabel}</span>
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-widest uppercase text-gray-400 hidden sm:block" style={mono}>
              Sort By
            </span>
            <div className="relative flex items-center">
              <select
                value={filters.sort}
                onChange={handleSortChange}
                className="appearance-none text-[11px] border border-gray-300 bg-white px-3 py-1.5 pr-7 focus:outline-none focus:border-gray-500 text-gray-700 cursor-pointer"
                style={mono}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <KeyboardArrowDownIcon
                sx={{ fontSize: 14 }}
                className="absolute right-2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex gap-12">

        {/* ── SIDEBAR FILTERS ── */}
        <aside className="hidden lg:block w-40 flex-shrink-0">
          <div className="border-t border-gray-200">
            {FILTER_GROUPS.map((group) => (
              <FilterGroup
                key={group.key}
                group={group}
                activeValue={filters[group.key]}
                onChange={handleSingleFilter}
              />
            ))}
            <OrganicToggle
              active={filters.organic === 'true'}
              onChange={handleSingleFilter}
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-4 text-[9px] tracking-widest uppercase text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2"
              style={mono}
            >
              Clear All
            </button>
          )}
        </aside>

        {/* ── PRODUCTS ── */}
        <div className="flex-1 min-w-0">
          {pagination && !loading && (
            <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-6" style={mono}>
              {pagination.total} products
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-stone-100 mb-3" />
                  <div className="h-2.5 bg-stone-100 rounded w-2/3 mb-2" />
                  <div className="h-2.5 bg-stone-100 rounded w-1/2 mb-2" />
                  <div className="h-2.5 bg-stone-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-4xl mb-4">🍵</p>
              <h3
                className="text-lg text-gray-800 mb-2"
                style={{ fontFamily: '"Prosto One", sans-serif', fontWeight: 400 }}
              >
                No teas found
              </h3>
              <p className="text-gray-400 text-xs mb-6 tracking-wide" style={mono}>
                Try adjusting your filters.
              </p>
              <button
                onClick={handleClearFilters}
                className="text-[10px] tracking-widest uppercase border border-gray-300 px-6 py-2.5 hover:border-gray-700 hover:text-gray-700 transition-all"
                style={mono}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-12">
                {products.map((product) => (
                  <ShopProductCard key={product._id} product={product} />
                ))}
              </div>
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const ShopProductCard = ({ product }) => {
  const price  = product.basePrice;
  const weight = product.variants?.[0]?.name || '100g';

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="aspect-square bg-[#F8F7F4] flex items-center justify-center overflow-hidden mb-3 relative">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="text-stone-300 text-[10px] tracking-widest uppercase" style={mono}>
            Image
          </span>
        )}
      </div>
      <div className="text-center">
        <p className="text-[9px] tracking-widest uppercase text-gray-400 mb-0.5" style={mono}>
          {product.category ? product.category.replace(/-/g, ' ') : 'Tea'}
        </p>
        <p
          className="text-[12px] text-gray-800 mb-1 leading-snug group-hover:text-gray-500 transition-colors font-medium"
          style={mono}
        >
          {product.name}
        </p>
        <p className="text-[11px] text-gray-700" style={mono}>
          <span className="font-semibold">${price?.toFixed(2)}</span>
          <span className="text-gray-400 ml-1">/ {weight}</span>
        </p>
      </div>
    </Link>
  );
};

export default ShopPage;
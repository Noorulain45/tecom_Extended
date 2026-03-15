import React from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import Slider from '@mui/material/Slider';

const CATEGORIES = [
  { value: '', label: 'All Teas' },
  { value: 'green-tea', label: 'Green Tea' },
  { value: 'black-tea', label: 'Black Tea' },
  { value: 'herbal-tea', label: 'Herbal Tea' },
  { value: 'oolong-tea', label: 'Oolong' },
  { value: 'white-tea', label: 'White Tea' },
  { value: 'chai', label: 'Chai' },
  { value: 'matcha', label: 'Matcha' },
];

const RATINGS = [
  { value: '4', label: '4★ & above' },
  { value: '3', label: '3★ & above' },
  { value: '2', label: '2★ & above' },
];

const CAFFEINE = [
  { value: '', label: 'Any' },
  { value: 'none', label: 'Caffeine Free' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const FLAVORS = ['floral', 'earthy', 'sweet', 'citrus', 'spicy', 'umami', 'bold', 'fruity', 'chestnut', 'creamy'];

const ProductFilters = ({ filters, onChange, onClear }) => {
  const handleCategory = (cat) => onChange({ ...filters, category: cat, page: 1 });
  const handleRating = (r) => onChange({ ...filters, rating: filters.rating === r ? '' : r, page: 1 });
  const handleFlavor = (f) => {
    const current = filters.flavor ? filters.flavor.split(',').filter(Boolean) : [];
    const updated = current.includes(f) ? current.filter((x) => x !== f) : [...current, f];
    onChange({ ...filters, flavor: updated.join(','), page: 1 });
  };
  const handlePrice = (_, [min, max]) => onChange({ ...filters, minPrice: min, maxPrice: max, page: 1 });
  const handleCaffeine = (c) => onChange({ ...filters, caffeineLevel: c, page: 1 });

  const selectedFlavors = filters.flavor ? filters.flavor.split(',').filter(Boolean) : [];
  const hasFilters = filters.category || filters.rating || filters.flavor || filters.caffeineLevel || filters.minPrice || filters.maxPrice;

  return (
    <aside className="w-64 flex-shrink-0">
      <div className="card p-5 sticky top-20">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 font-semibold text-tea-900">
            <FilterListIcon fontSize="small" />
            <span>Filters</span>
          </div>
          {hasFilters && (
            <button onClick={onClear} className="text-xs text-tea-600 hover:text-tea-800 flex items-center gap-1">
              <CloseIcon sx={{ fontSize: 12 }} /> Clear all
            </button>
          )}
        </div>

        {/* Category */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Category</h4>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategory(cat.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.category === cat.value
                    ? 'bg-tea-600 text-white font-medium'
                    : 'text-gray-600 hover:bg-tea-50 hover:text-tea-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Price Range</h4>
          <Slider
            value={[Number(filters.minPrice) || 0, Number(filters.maxPrice) || 100]}
            onChange={handlePrice}
            valueLabelDisplay="auto"
            min={0}
            max={100}
            valueLabelFormat={(v) => `$${v}`}
            sx={{ color: '#9a7a3e' }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${filters.minPrice || 0}</span>
            <span>${filters.maxPrice || 100}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Min Rating</h4>
          <div className="space-y-1">
            {RATINGS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRating(r.value)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.rating === r.value ? 'bg-tea-600 text-white font-medium' : 'text-gray-600 hover:bg-tea-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Caffeine Level */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Caffeine</h4>
          <div className="flex flex-wrap gap-1.5">
            {CAFFEINE.map((c) => (
              <button
                key={c.value}
                onClick={() => handleCaffeine(c.value)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filters.caffeineLevel === c.value ? 'bg-tea-600 text-white' : 'bg-tea-100 text-tea-700 hover:bg-tea-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Flavor */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Flavour Notes</h4>
          <div className="flex flex-wrap gap-1.5">
            {FLAVORS.map((f) => (
              <button
                key={f}
                onClick={() => handleFlavor(f)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  selectedFlavors.includes(f) ? 'bg-tea-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-tea-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProductFilters;

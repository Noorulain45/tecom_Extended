import React from 'react';
import { Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categoryColors = {
  'green-tea': 'bg-sage-100 text-sage-700',
  'black-tea': 'bg-amber-100 text-amber-700',
  'herbal-tea': 'bg-emerald-100 text-emerald-700',
  'oolong-tea': 'bg-orange-100 text-orange-700',
  'white-tea': 'bg-gray-100 text-gray-600',
  chai: 'bg-red-100 text-red-700',
  matcha: 'bg-lime-100 text-lime-700',
};

const categoryLabel = {
  'green-tea': 'Green Tea',
  'black-tea': 'Black Tea',
  'herbal-tea': 'Herbal',
  'oolong-tea': 'Oolong',
  'white-tea': 'White Tea',
  chai: 'Chai',
  matcha: 'Matcha',
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const defaultVariant = product.variants?.[0];
  const price = product.basePrice + (defaultVariant?.priceModifier || 0);
  const inStock = product.variants?.some((v) => v.stock > 0);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login', { state: { from: { pathname: `/products/${product._id}` } } }); return; }
    if (!defaultVariant) return;
    await addToCart(product._id, defaultVariant._id, 1);
  };

  return (
      <Link to={`/products/${product._id}`} className="group block">
      <div className="card hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-tea-50">
          <img
            src={product.thumbnail || 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400'; }}
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.isFeatured && (
              <span className="badge bg-tea-600 text-white text-xs">Featured</span>
            )}
            {!inStock && (
              <span className="badge bg-red-500 text-white text-xs">Out of Stock</span>
            )}
          </div>
          {/* Quick add button */}
          {inStock && (
            <button
              onClick={handleQuickAdd}
              className="absolute bottom-3 right-3 bg-white text-tea-700 p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:bg-tea-600 hover:text-white transition-all duration-200"
              title="Quick add to cart"
            >
              <AddShoppingCartIcon fontSize="small" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`badge text-xs ${categoryColors[product.category] || 'bg-gray-100 text-gray-600'}`}>
              {categoryLabel[product.category] || product.category}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-0.5 text-amber-500">
                <StarIcon sx={{ fontSize: 14 }} />
                <span className="text-xs text-gray-600 font-medium">{product.rating}</span>
              </div>
            )}
          </div>

          <h3 className="font-display font-medium text-tea-900 text-sm leading-tight mt-2 group-hover:text-tea-700 transition-colors line-clamp-2">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{product.shortDescription}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="font-semibold text-tea-800">${price.toFixed(2)}</span>
              {defaultVariant && (
                <span className="text-xs text-gray-400 ml-1">/ {defaultVariant.name}</span>
              )}
            </div>
            {product.numReviews > 0 && (
              <span className="text-xs text-gray-400">({product.numReviews})</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem } = useCart();

  const badgeColors = {
    'Best Seller': 'bg-amber-100 text-amber-800',
    Popular: 'bg-blue-100 text-blue-800',
    'Top Rated': 'bg-emerald-100 text-emerald-800',
    Sale: 'bg-red-100 text-red-700',
  };

  return (
    <div className="card group flex flex-col overflow-hidden transition hover:shadow-md">
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-white p-4">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
              badgeColors[product.badge] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {product.badge}
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
            Out of Stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-brand-600">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="ml-1 text-xs font-medium text-slate-700">{product.rating}</span>
          </div>
          <span className="text-xs text-slate-400">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className={`font-bold text-slate-900 ${product.priceOnRequest ? 'text-sm' : 'text-lg'}`}>
              {formatPrice(product.price, product.priceOnRequest)}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={!product.inStock}
            className="rounded-xl bg-brand-50 p-2.5 text-brand-600 transition hover:bg-brand-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

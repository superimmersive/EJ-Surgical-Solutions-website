import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Minus, Plus, Check, ArrowLeft, Truck, Shield } from 'lucide-react';
import { getProductById, formatPrice, products } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const product = getProductById(id);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
        <Link to="/shop" className="btn-primary mt-6">Back to Shop</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="card overflow-hidden bg-white p-6">
          <img src={product.image} alt={product.name} className="aspect-square w-full object-contain" />
        </div>

        <div>
          {product.badge && (
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {product.badge}
            </span>
          )}
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-slate-700">{product.rating}</span>
            <span className="text-sm text-slate-400">({product.reviews.toLocaleString()} reviews)</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className={`font-bold text-slate-900 ${product.priceOnRequest ? 'text-base' : 'text-3xl'}`}>
              {formatPrice(product.price, product.priceOnRequest)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <p className="mt-6 text-slate-600 leading-relaxed">{product.description}</p>

          <ul className="mt-6 space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="h-4 w-4 shrink-0 text-brand-600" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center gap-4 text-sm">
            <span className={`font-medium ${product.inStock ? 'text-emerald-600' : 'text-red-500'}`}>
              {product.inStock ? '● In Stock' : '● Out of Stock'}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Truck className="h-4 w-4" /> Nationwide delivery across SA
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Shield className="h-4 w-4" /> Certified to industry standards
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-slate-200">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-3 text-slate-600 hover:bg-slate-50"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-3 text-slate-600 hover:bg-slate-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="btn-primary flex-1 sm:flex-none"
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" /> Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-slate-900">Related Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

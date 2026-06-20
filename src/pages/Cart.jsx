import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, shipping, tax, total, itemCount, hasQuoteItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
          <ShoppingBag className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500">Browse our catalog and add medical supplies to get started.</p>
        <Link to="/shop" className="btn-primary mt-8">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Shopping Cart</h1>
      <p className="mt-1 text-slate-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex gap-4 p-4 sm:gap-6 sm:p-6">
              <Link to={`/product/${item.id}`} className="shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-24 w-24 rounded-xl object-cover sm:h-28 sm:w-28"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link to={`/product/${item.id}`} className="font-semibold text-slate-900 hover:text-brand-600">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="shrink-0 text-slate-400 transition hover:text-red-500"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-lg font-bold text-slate-900">{formatPrice(item.price, item.priceOnRequest)}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-2 text-slate-600 hover:bg-slate-50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-2 text-slate-600 hover:bg-slate-50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {item.priceOnRequest ? 'Quote' : formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {hasQuoteItems ? (
                <div className="rounded-lg bg-brand-50 px-3 py-3 text-sm text-brand-800">
                  Some items require a custom quote. Submit your order and our team will confirm pricing via email or phone.
                </div>
              ) : (
                <>
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-medium text-slate-900">
                  {shipping === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">VAT (15%)</dt>
                <dd className="font-medium text-slate-900">{formatPrice(tax)}</dd>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="text-lg font-bold text-slate-900">{formatPrice(total)}</dd>
              </div>
                </>
              )}
            </dl>

            {!hasQuoteItems && subtotal < 500 && (
              <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                Add {formatPrice(500 - subtotal)} more for free delivery!
              </p>
            )}

            <Link to="/checkout" className="btn-primary mt-6 w-full">
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="mt-3 block text-center text-sm font-medium text-brand-600 hover:text-brand-700">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

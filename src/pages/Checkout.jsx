import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function Checkout() {
  const { items, subtotal, shipping, tax, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });

  const updateField = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Nothing to checkout</h1>
        <Link to="/shop" className="btn-primary mt-6">Go to Shop</Link>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      clearCart();
      navigate('/order-confirmation');
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/cart" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <section className="card p-6">
            <h2 className="text-lg font-bold text-slate-900">Shipping Information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
                <input required className="input-field" value={form.firstName} onChange={updateField('firstName')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
                <input required className="input-field" value={form.lastName} onChange={updateField('lastName')} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input required type="email" className="input-field" value={form.email} onChange={updateField('email')} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                <input required type="tel" className="input-field" value={form.phone} onChange={updateField('phone')} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Address</label>
                <input required className="input-field" value={form.address} onChange={updateField('address')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
                <input required className="input-field" value={form.city} onChange={updateField('city')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">State</label>
                  <input required className="input-field" value={form.state} onChange={updateField('state')} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">ZIP</label>
                  <input required className="input-field" value={form.zip} onChange={updateField('zip')} />
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section className="card p-6">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg font-bold text-slate-900">Payment</h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">This is a demo — no real payment is processed.</p>
            <div className="mt-4 grid gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Card Number</label>
                <input
                  required
                  className="input-field"
                  placeholder="4242 4242 4242 4242"
                  value={form.cardNumber}
                  onChange={updateField('cardNumber')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry</label>
                  <input required className="input-field" placeholder="MM/YY" value={form.expiry} onChange={updateField('expiry')} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">CVV</label>
                  <input required className="input-field" placeholder="123" value={form.cvv} onChange={updateField('cvv')} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Order summary */}
        <div>
          <div className="card sticky top-24 p-6">
            <h2 className="text-lg font-bold text-slate-900">Your Order</h2>
            <ul className="mt-4 max-h-48 space-y-3 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 text-sm">
                  <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="line-clamp-1 font-medium text-slate-900">{item.name}</p>
                    <p className="text-slate-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">VAT</dt>
                <dd>{formatPrice(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <button type="submit" disabled={processing} className="btn-primary mt-6 w-full">
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </span>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

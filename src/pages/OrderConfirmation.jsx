import { Link } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderConfirmation() {
  const orderNumber = `EJSS-${Date.now().toString().slice(-8)}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </div>
      <h1 className="mt-6 text-3xl font-bold text-slate-900">Order Confirmed!</h1>
      <p className="mt-3 text-slate-500">
        Thank you for your order with EJ Surgical Solutions. Our team will confirm the details and arrange delivery.
      </p>
      <div className="card mt-8 p-6 text-left">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-brand-600" />
          <div>
            <p className="text-sm text-slate-500">Order Number</p>
            <p className="font-bold text-slate-900">{orderNumber}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Estimated delivery: <span className="font-medium text-slate-900">2–5 business days nationwide</span>
        </p>
      </div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/shop" className="btn-primary">Continue Shopping</Link>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
    </div>
  );
}

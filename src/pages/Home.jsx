import { Link } from 'react-router-dom';
import {
  Shield,
  Truck,
  Award,
  Mail,
  ArrowRight,
  Bandage,
  Accessibility,
  Package,
  LayoutGrid,
  Layers,
  Hand,
  HeartPulse,
  Scissors,
  Minus,
  Syringe,
  Quote,
  User,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';
import { company, whyChooseUs, companyValues, testimonials } from '../data/company';

const iconMap = {
  LayoutGrid,
  Shield,
  Bandage,
  Accessibility,
  Package,
  Layers,
  Hand,
  HeartPulse,
  Scissors,
  Minus,
  Syringe,
};

export default function Home() {
  const featured = products.filter((p) => p.badge).slice(0, 4);
  const shopCategories = categories.filter((c) => c.id !== 'all');

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              {company.tagline}
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Welcome to EJ Surgical Solutions
            </h1>
            <p className="mt-6 text-lg text-brand-100 leading-relaxed">
              Medical and surgical equipment for institutions, GPs, pharmacies, research facilities, and veterinarians across South Africa. {company.motto}.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/shop" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
                See Our Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white/20">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="border-b border-slate-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why Choose Us?</h2>
            <p className="mt-2 text-slate-500">Our Unique Offering</p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {whyChooseUs.map((item, i) => {
              const icons = [Shield, Mail, Award];
              const Icon = icons[i];
              return (
                <div key={item.title} className="card p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Shield, title: 'Certified Products', desc: 'Industry standard certification' },
            { icon: Truck, title: 'Nationwide Delivery', desc: 'All 9 provinces in SA' },
            { icon: Award, title: 'Cost Effective', desc: 'Quality at fair prices' },
            { icon: Mail, title: 'Easy Ordering', desc: company.email },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Our Products and Pricing</h2>
          <p className="mt-2 text-slate-500">Browse our wide range of medical and surgical equipment</p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shopCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || LayoutGrid;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="card group flex flex-col items-center p-4 text-center transition hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-brand-600 sm:text-sm">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Link to="/shop" className="btn-primary">
            View All Products & Pricing
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-slate-100/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured Products</h2>
              <p className="mt-2 text-slate-500">Popular items from our catalog</p>
            </div>
            <Link to="/shop" className="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card flex flex-col items-center gap-8 p-8 sm:flex-row sm:p-12">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <User className="h-12 w-12" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Meet Our Founder</h2>
            <p className="mt-1 text-lg font-semibold text-brand-600">{company.founder.name}</p>
            <p className="text-sm text-slate-500">{company.founder.title}</p>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="bg-brand-950 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Company Values</h2>
          <div className="mt-8 space-y-4 text-brand-100 leading-relaxed">
            {companyValues.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">What People Say About Us</h2>
          <p className="mt-2 text-slate-500">Our Client Testimonials</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.author} className="card p-6">
              <Quote className="h-8 w-8 text-brand-200" />
              <p className="mt-4 text-sm text-slate-600 leading-relaxed italic">"{t.quote}"</p>
              <p className="mt-4 font-semibold text-slate-900">{t.author}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="card overflow-hidden bg-gradient-to-r from-brand-600 to-brand-700 p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Do you have any questions?
            </h2>
            <p className="mt-3 text-brand-100">
              Feel free to contact us anytime. We're based in George on the Garden Route and deliver nationwide.
            </p>
            <Link to="/contact" className="mt-6 btn-primary inline-flex bg-white text-brand-700 hover:bg-brand-50">
              Contact Us Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

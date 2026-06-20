import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Plus, HeartPulse, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { company } from '../data/company';

export default function Header() {
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/shop', label: 'Products' },
    { to: '/contact', label: 'Contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* Top bar with contact info */}
      <div className="hidden border-b border-slate-100 bg-brand-950 text-brand-100 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {company.address}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {company.hours.weekday}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="flex items-center gap-1 hover:text-white">
              <Phone className="h-3 w-3" /> {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-1 hover:text-white">
              <Mail className="h-3 w-3" /> {company.email}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Plus className="h-5 w-5" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-slate-900">EJ Surgical</span>
                <span className="text-lg font-bold text-brand-600"> Solutions</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-2 text-sm font-medium transition ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="absolute inset-x-4 top-3 flex gap-2 md:relative md:inset-auto">
                  <input
                    autoFocus
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field flex-1 py-2"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="btn-secondary px-3 py-2">
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              )}

              <Link
                to="/cart"
                className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100 md:hidden"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="border-t border-slate-100 py-4 md:hidden">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <HeartPulse className="h-4 w-4" />
              </div>
              <span className="font-bold text-slate-900">
                EJ Surgical <span className="text-brand-600">Solutions</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-500">{company.motto}</p>
            <p className="mt-2 text-sm text-slate-500">{company.deliveryNote}</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Products</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/shop" className="hover:text-brand-600">All Products</Link></li>
              <li><Link to="/shop?category=gloves" className="hover:text-brand-600">Gloves</Link></li>
              <li><Link to="/shop?category=syringes" className="hover:text-brand-600">Syringes</Link></li>
              <li><Link to="/shop?category=wound-dressings" className="hover:text-brand-600">Wound Dressings</Link></li>
              <li><Link to="/shop?category=sutures" className="hover:text-brand-600">Sutures</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Navigation</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link to="/" className="hover:text-brand-600">Home</Link></li>
              <li><Link to="/about" className="hover:text-brand-600">About</Link></li>
              <li><Link to="/shop" className="hover:text-brand-600">Products</Link></li>
              <li><Link to="/contact" className="hover:text-brand-600">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Contact Info</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                {company.address}
              </li>
              <li>
                <a href={`tel:${company.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-brand-600">
                  <Phone className="h-4 w-4 text-brand-600" /> {company.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-brand-600">
                  <Mail className="h-4 w-4 text-brand-600" /> {company.email}
                </a>
              </li>
              <li className="pt-1">
                <Clock className="mb-1 inline h-4 w-4 text-brand-600" />
                <div>{company.hours.weekday}</div>
                <div>{company.hours.weekend}</div>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

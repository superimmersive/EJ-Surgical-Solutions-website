import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'all';
  const search = searchParams.get('search') || '';
  const [sort, setSort] = useState('featured');
  const [localSearch, setLocalSearch] = useState(search);
  const [mobileFilters, setMobileFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];

    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case 'price-desc':
        result.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
    }

    return result;
  }, [category, search, sort]);

  const setCategory = (id) => {
    const params = new URLSearchParams(searchParams);
    if (id === 'all') params.delete('category');
    else params.set('category', id);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) params.set('search', localSearch.trim());
    else params.delete('search');
    setSearchParams(params);
  };

  const activeCategory = categories.find((c) => c.id === category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {search ? `Results for "${search}"` : activeCategory?.name || 'All Products'}
        </h1>
        <p className="mt-1 text-slate-500">{filtered.length} products found</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters — desktop */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <h3 className="text-sm font-semibold text-slate-900">Categories</h3>
          <ul className="mt-4 max-h-[70vh] space-y-1 overflow-y-auto pr-2">
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  onClick={() => setCategory(cat.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    category === cat.id
                      ? 'bg-brand-50 font-semibold text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="input-field pl-10 py-2.5"
              />
            </form>

            <button
              onClick={() => setMobileFilters(true)}
              className="btn-secondary py-2.5 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="input-field w-auto py-2.5"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active filters */}
          {(category !== 'all' || search) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {category !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {activeCategory?.name}
                  <button onClick={() => setCategory('all')} aria-label="Remove category filter">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  Search: {search}
                  <button
                    onClick={() => {
                      setLocalSearch('');
                      const params = new URLSearchParams(searchParams);
                      params.delete('search');
                      setSearchParams(params);
                    }}
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="card py-16 text-center">
              <p className="text-lg font-medium text-slate-700">No products found</p>
              <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search terms.</p>
              <button onClick={() => { setCategory('all'); setLocalSearch(''); setSearchParams({}); }} className="btn-primary mt-6">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-4 space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => { setCategory(cat.id); setMobileFilters(false); }}
                    className={`w-full rounded-lg px-3 py-3 text-left text-sm ${
                      category === cat.id ? 'bg-brand-50 font-semibold text-brand-700' : 'text-slate-600'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

import { Product } from '../types';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { useFilterStore } from '../utils/store';
import { productMatchesCollection } from '../utils/catalogFilters';
import { Search, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onAddToCart: (p: Product) => void;
  onOpenDetail: (p: Product) => void;
}

const CATEGORIES = ['All Categories', 'Home Decor', 'Art', 'Tech', 'Toys'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductGrid({ products, loading = false, onAddToCart, onOpenDetail }: ProductGridProps) {
  const {
    selectedCategory,
    selectedCollection,
    searchQuery,
    sortBy,
    setCategory,
    clearCollectionFilter,
    setSearchQuery,
    setSortBy,
  } = useFilterStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  let filtered = products.filter((p) => {
    const categoryMatch =
      selectedCategory === 'All Categories' || p.category === selectedCategory;
    const collectionMatch = productMatchesCollection(p, selectedCollection);
    const q = searchQuery.toLowerCase();
    const searchMatch =
      searchQuery === '' ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.collection?.toLowerCase().includes(q) ?? false);
    return categoryMatch && collectionMatch && searchMatch;
  });

  if (sortBy === 'newest') {
    filtered = [...filtered].sort((a, b) => {
      const newDiff = Number(b.isNew ?? false) - Number(a.isNew ?? false);
      if (newDiff !== 0) return newDiff;
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (bDate !== aDate) return bDate - aDate;
      return Number(b.id) - Number(a.id);
    });
  } else if (sortBy === 'price-asc') {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-desc') {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === 'popular') {
    filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSearchQuery(localSearch);
  };

  return (
    <section className="py-14 md:py-20 bg-white dark:bg-zinc-950 border-t border-[#e8e8e8] dark:border-zinc-800" id="catalog">
      <div className="do-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="do-eyebrow">Catalog</p>
            <h2 className="do-section-title mt-1">All products</h2>
            <p className="text-sm text-[#6b6b6b] dark:text-zinc-400 mt-2">
              {filtered.length} products · Made to order · Prices in ₹ incl. GST
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6 max-w-xl">
          <div className="flex border border-[#e8e8e8] dark:border-zinc-700 focus-within:border-[#111] dark:focus-within:border-zinc-400 transition-colors">
            <Search className="w-4 h-4 text-[#6b6b6b] m-3 flex-shrink-0" />
            <input
              id="catalog-search"
              type="text"
              placeholder="Search products…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="flex-1 py-3 pr-3 bg-transparent outline-none text-sm text-[#111] dark:text-zinc-100 placeholder:text-[#6b6b6b]"
            />
            <button type="submit" className="do-btn-primary px-6 py-3 text-[10px]">
              Search
            </button>
          </div>
        </form>

        {selectedCollection && (
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] dark:bg-zinc-800 text-xs font-medium text-[#111] dark:text-zinc-200">
              {selectedCollection}
              <button type="button" onClick={clearCollectionFilter} aria-label="Clear filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#111] dark:bg-white text-white dark:text-[#111]'
                  : 'bg-[#f5f5f5] dark:bg-zinc-800 text-[#6b6b6b] dark:text-zinc-400 hover:text-[#111] dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8 text-sm">
          <label className="do-eyebrow">Sort</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="border border-[#e8e8e8] dark:border-zinc-700 px-3 py-2 text-sm bg-white dark:bg-zinc-900 text-[#111] dark:text-zinc-100 outline-none focus:border-[#111]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-[#e8e8e8] dark:border-zinc-800">
            <p className="text-lg font-medium text-[#111] dark:text-white">No products found</p>
            <p className="text-sm text-[#6b6b6b] mt-2">Try another category or search term</p>
          </div>
        )}
      </div>
    </section>
  );
}
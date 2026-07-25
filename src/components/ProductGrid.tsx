import { Product } from '../types';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { useFilterStore } from '../utils/store';
import { productMatchesCollection } from '../utils/catalogFilters';
import { Search, X } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { motion } from 'motion/react';

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
              {filtered.length} products · Made to order · Prices in ₹
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8 max-w-xl">
          <div className="flex border border-[#e8e8e8] dark:border-zinc-700 focus-within:border-[#925FE2] dark:focus-within:border-[#925FE2] transition-all rounded-full overflow-hidden bg-[#f9f9f9] dark:bg-zinc-900/50 p-1">
            <Search className="w-4 h-4 text-[#6b6b6b] ml-4 my-3 flex-shrink-0" />
            <input
              id="catalog-search"
              type="text"
              placeholder="Search products…"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="flex-1 py-2 px-3 bg-transparent outline-none text-sm text-[#111] dark:text-zinc-100 placeholder:text-[#6b6b6b]"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="do-btn-primary px-8 py-2.5 text-[10px] rounded-full"
            >
              Search
            </motion.button>
          </div>
        </form>

        {selectedCollection && (
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f5] dark:bg-zinc-800 text-xs font-medium text-[#111] dark:text-zinc-200 rounded-lg">
              {selectedCollection}
              <button type="button" onClick={clearCollectionFilter} aria-label="Clear filter">
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest transition-all rounded-full ${
                selectedCategory === cat
                  ? 'bg-[#111] dark:bg-white text-white dark:text-[#111] shadow-lg shadow-black/10 dark:shadow-white/10'
                  : 'bg-[#f5f5f5] dark:bg-zinc-900 text-[#6b6b6b] dark:text-zinc-400 hover:bg-[#eee] dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-10 text-sm">
          <label htmlFor="sort-select" className="do-eyebrow">Sort</label>
          <div className="relative">
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none border border-[#e8e8e8] dark:border-zinc-800 px-4 py-2 pr-10 text-xs font-bold uppercase tracking-widest bg-white dark:bg-zinc-900 text-[#111] dark:text-zinc-100 outline-none focus:border-[#925FE2] rounded-full transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
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
          <div className="text-center py-20 border border-dashed border-[#e8e8e8] dark:border-zinc-800 rounded-[2rem]">
            <p className="text-lg font-medium text-[#111] dark:text-white">No products found</p>
            <p className="text-sm text-[#6b6b6b] mt-2">Try another category or search term</p>
          </div>
        )}
      </div>
    </section>
  );
}

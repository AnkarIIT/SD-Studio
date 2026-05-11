import { Product } from '../types';
import ProductCard from './ProductCard';
import { useFilterStore } from '../utils/store';
import { Search, Filter } from 'lucide-react';
import { type FormEvent, useState } from 'react';

interface ProductGridProps {
  products: Product[];
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

export default function ProductGrid({ products, onAddToCart, onOpenDetail }: ProductGridProps) {
  const { selectedCategory, searchQuery, sortBy, setCategory, setSearchQuery, setSortBy } = useFilterStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Filter products
  let filtered = products.filter(p => {
    const categoryMatch = selectedCategory === 'All Categories' || p.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // Sort products
  if (sortBy === 'price-asc') {
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
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors" id="catalog">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-7xl font-serif font-black uppercase tracking-tighter italic text-zinc-900 dark:text-zinc-100 mb-6">
                Our <span className="text-primary underline decoration-zinc-100 dark:decoration-zinc-800 underline-offset-8">Inventory</span>
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium">
                Explore our laboratory of objects. Each piece is stress-tested and optimized for functional aesthetic.
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 transition-colors">
              <Search className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white font-bold text-xs rounded hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 cursor-pointer rounded"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-primary bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 cursor-pointer rounded"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filtered.length}</span> of{' '}
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{products.length}</span> products
          </div>
        </div>

        {/* Products Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          <div className="text-center py-16">
            <Filter className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-900 mb-2">No products found</h3>
            <p className="text-zinc-500">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </section>
  );
}

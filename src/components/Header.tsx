import { AnimatePresence, motion } from 'motion/react';
import { ShoppingCart, Menu, X, Search, Heart, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore, useFilterStore } from '../utils/store';
import { CATEGORY_NAV } from '../shopContent';
import { useSiteSettings } from '../utils/siteSettings';
import ThemeToggle from './ThemeToggle';
import PromoMarquee from './PromoMarquee';
import { BRAND_NAME } from '../brand';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
}

function focusCatalogSearch() {
  document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => document.getElementById('catalog-search')?.focus(), 400);
}

export default function Header({ cartCount, onOpenCart, onOpenWishlist, onOpenOrders }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const setCategory = useFilterStore((s) => s.setCategory);
  const customLabEnabled = useSiteSettings((s) => s.customLabEnabled);

  const categoryNav = CATEGORY_NAV.filter(
    (item) => item.id !== 'custom' || customLabEnabled
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goCategory = (filter: string | null) => {
    if (filter) setCategory(filter);
    else setCategory('All Categories');
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-[#120722]/95 backdrop-blur-xl transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_25px_80px_rgba(80,34,170,0.16)]' : ''
      }`}
    >
      <PromoMarquee />

      <div className="border-b border-[#451f80]/40">
        <div className="do-container h-[52px] md:h-14 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 -ml-2 text-[#111] dark:text-zinc-100"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <nav className="hidden lg:flex items-center gap-8 text-[13px] font-semibold text-[#e5d6ff]">
            <Link to="/" className="hover:text-[#fff] transition-colors">
              Home
            </Link>
            <a href="#catalog" className="hover:text-[#fff] transition-colors">
              Shop
            </a>
            {customLabEnabled && (
              <a href="#custom-lab" className="hover:text-[#fff] transition-colors">
                Customize
              </a>
            )}
            <a href="#catalog" className="hover:text-[#fff] transition-colors">
              Collections
            </a>
            <Link to="/about" className="hover:text-[#fff] transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-[#fff] transition-colors">
              Contact
            </Link>
          </nav>

          <Link
            to="/"
            className="absolute left-1/2 -translate-x-1/2 text-[15px] md:text-[17px] font-semibold tracking-[0.18em] text-[#f4e9ff] whitespace-nowrap"
          >
            {BRAND_NAME}
          </Link>

          <div className="flex items-center ml-auto gap-3">
            <ThemeToggle />

            <button
              type="button"
              onClick={onOpenCart}
              className="hidden xl:inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-[#111] shadow-sm hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              <ShoppingCart className="w-4 h-4" />
              Inventory {cartCount > 0 ? `(${cartCount})` : ''}
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative p-2.5 text-[#e5d6ff] hover:text-white transition-colors lg:hidden"
              title="Cart"
              aria-label="Cart"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] px-0.5 bg-[#111] dark:bg-white text-white dark:text-[#111] text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block border-b border-[#e8e8e8] dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="do-container flex items-center justify-center gap-8 lg:gap-12 h-10 text-[13px] text-[#6b6b6b] dark:text-zinc-400">
          {categoryNav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goCategory(item.filter)}
              className="font-medium hover:text-[#111] dark:hover:text-white transition-colors"
            >
              {item.label}
            </button>
          ))}
          <span className="text-[#e8e8e8] dark:text-zinc-700">|</span>
          <button
            type="button"
            onClick={onOpenOrders}
            className="font-medium hover:text-[#111] dark:hover:text-white transition-colors"
          >
            Track order
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-[#e8e8e8] dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden"
          >
            <nav className="do-container py-4 flex flex-col gap-3 text-sm font-medium">
              <a href="#catalog" onClick={() => setIsMenuOpen(false)}>
                Shop all
              </a>
              {categoryNav.map((item) => (
                <button key={item.id} type="button" onClick={() => goCategory(item.filter)} className="text-left">
                  {item.label}
                </button>
              ))}
              {customLabEnabled && (
                <a href="#custom-lab" onClick={() => setIsMenuOpen(false)}>
                  Custom Lab
                </a>
              )}
              <Link to="/about" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <button
                type="button"
                onClick={() => {
                  onOpenOrders();
                  setIsMenuOpen(false);
                }}
                className="text-left"
              >
                Track order
              </button>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
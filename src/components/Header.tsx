import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Menu, X, Layers, Instagram, Twitter, Youtube, User, Search, Heart } from 'lucide-react';
import { useState } from 'react';
import { useWishlistStore } from '../utils/store';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenOrders: () => void;
}

export default function Header({ cartCount, onOpenCart, onOpenWishlist, onOpenOrders }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const wishlistCount = useWishlistStore(state => state.items.length);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all">
      {/* Top Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors"><Twitter className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Instagram className="w-3.5 h-3.5" /></a>
            <a href="#" className="hover:text-primary transition-colors"><Youtube className="w-3.5 h-3.5" /></a>
          </div>
          <div>
            Free Shipping on Orders Above Rs. 5,000 | UPI, Bank Transfer, Card Demo and COD
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Contact</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Track Order</a>
            <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">FAQs</a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-8 h-8 text-primary" />
            <span className="font-serif font-black text-2xl tracking-tighter italic text-zinc-900 dark:text-zinc-100">3D by SD</span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10 font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Home</a>
            <a href="#catalog" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Shop</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">About</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Contact</a>
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors" title="Search">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenWishlist}
              className="relative p-2 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors group" 
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>
            <ThemeToggle />
            <button onClick={onOpenOrders} className="p-2 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors hidden md:block" title="Orders">
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={onOpenCart}
              className="relative p-2 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors group" 
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:text-primary dark:text-zinc-400 dark:hover:text-primary transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
            >
              <nav className="flex flex-col gap-4 p-6 font-bold text-xs uppercase tracking-widest text-zinc-900 dark:text-zinc-100">
                <a href="#" className="hover:text-primary transition-colors pb-2 border-b border-zinc-100 dark:border-zinc-800">Home</a>
                <a href="#catalog" className="hover:text-primary transition-colors pb-2 border-b border-zinc-100 dark:border-zinc-800">Shop</a>
                <a href="#" className="hover:text-primary transition-colors pb-2 border-b border-zinc-100 dark:border-zinc-800">About</a>
                <a href="#" className="hover:text-primary transition-colors pb-2 border-b border-zinc-100 dark:border-zinc-800">Contact</a>
                <button onClick={() => { onOpenOrders(); setIsMenuOpen(false); }} className="text-left hover:text-primary transition-colors pb-2 border-b border-zinc-100 dark:border-zinc-800">Track Order</button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

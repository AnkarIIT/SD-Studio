import { useState } from 'react';
import { ShoppingCart, Search, User, Home, ChevronDown, Package, Sparkles, Menu, X } from 'lucide-react';
import { useCartStore } from '../utils/store';
import ThemeToggle from './ThemeToggle';

interface HeaderReplicaProps {
  onOpenCart: () => void;
  onOpenOrders?: () => void;
  onOpenWishlist?: () => void;
}

export default function HeaderReplica({ onOpenCart, onOpenOrders }: HeaderReplicaProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartCount = useCartStore((state) => state.getItemCount());

  const handleSearchClick = () => {
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      document.getElementById('catalog-search')?.focus();
    }, 400);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col w-full">
      {/* Top Banner (Announcement Bar) */}
      <div className="w-full bg-[#E6DDF2] text-black border-b border-black py-1.5 px-4 md:px-8 text-[11px] font-semibold tracking-wider flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-1 font-mono">
          <span className="text-sm">✦</span> Welcome to 3DbySD
        </div>
        {/* Middle */}
        <div className="hidden sm:flex items-center gap-1">
          <span>Free shipping on orders above ₹999</span>
          <Sparkles className="w-3 h-3 text-purple-700 animate-pulse" />
        </div>
        {/* Right */}
        <div className="flex items-center gap-3 font-mono">
          <span className="cursor-pointer hover:underline flex items-center gap-0.5">
            INR ₹ <ChevronDown className="w-3 h-3" />
          </span>
          <ShoppingCart className="w-3.5 h-3.5 cursor-pointer" onClick={onOpenCart} />
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="w-full bg-[#FCFBF7] text-black border-b-2 border-black py-3 px-4 md:px-8 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <div className="flex items-center">
          <a href="/" className="font-retro text-lg md:text-2xl font-black tracking-tight text-black flex items-center gap-0.5">
            3D<span className="text-[#925FE2]">by</span>SD
          </a>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[12px] font-bold uppercase tracking-widest">
          <a href="/" className="flex items-center gap-1 hover:text-purple-600 transition-colors border-b-2 border-black pb-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </a>
          <a href="#catalog" className="flex items-center gap-0.5 hover:text-purple-600 transition-colors pb-1">
            <span>Shop</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </a>
          <a href="#custom-lab" className="hover:text-purple-600 transition-colors pb-1">
            Customize
          </a>
          <a href="#collections" className="hover:text-purple-600 transition-colors pb-1">
            Collections
          </a>
          <a href="#about" className="hover:text-purple-600 transition-colors pb-1">
            About Us
          </a>
          <a href="#footer" className="hover:text-purple-600 transition-colors pb-1">
            Contact
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 md:gap-5">
          <button 
            type="button" 
            onClick={handleSearchClick}
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-black" />
          </button>
          
          <button 
            type="button" 
            onClick={onOpenOrders}
            className="p-1.5 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Account"
          >
            <User className="w-5 h-5 text-black" />
          </button>

          <ThemeToggle />

          {/* Cart / Inventory Button */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center justify-between border-2 border-black bg-[#E6DDF2] hover:bg-[#d5cbe3] text-black px-4 py-1.5 rounded font-retro text-[10px] md:text-xs font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
          >
            <span>INVENTORY ({cartCount})</span>
            <Package className="w-4 h-4 ml-2 fill-amber-700 stroke-amber-950" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 hover:bg-black/5 rounded-full transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden w-full bg-[#FCFBF7] text-black border-b-2 border-black flex flex-col py-4 px-6 gap-4 text-xs font-bold uppercase tracking-widest shadow-lg animate-in slide-in-from-top duration-200">
          <a 
            href="/" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-2 py-1.5 border-b border-black/5 hover:text-purple-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </a>
          <a 
            href="#catalog" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="py-1.5 border-b border-black/5 hover:text-purple-600 transition-colors"
          >
            Shop
          </a>
          <a 
            href="#custom-lab" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="py-1.5 border-b border-black/5 hover:text-purple-600 transition-colors"
          >
            Customize
          </a>
          <a 
            href="#collections" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="py-1.5 border-b border-black/5 hover:text-purple-600 transition-colors"
          >
            Collections
          </a>
          <a 
            href="#about" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="py-1.5 border-b border-black/5 hover:text-purple-600 transition-colors"
          >
            About Us
          </a>
          <a 
            href="#footer" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="py-1.5 hover:text-purple-600 transition-colors"
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
